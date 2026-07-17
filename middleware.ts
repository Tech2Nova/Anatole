import { NextRequest, NextResponse } from "next/server";

// 在这里设置你的访问密钥（建议使用复杂一些的字符串）
const ACCESS_PASSWORD = "chenxi2024";

// 排除不需要密码的路径（如 favicon、静态资源等，否则密码页可能样式丢失）
const PUBLIC_PATHS = [
  "/favicon.ico",
  "/favicon",
  "/apple-touch-icon",
  "/site.webmanifest",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路径直接放行
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 检查是否已有有效的认证 Cookie
  const authCookie = request.cookies.get("site_auth");
  if (authCookie?.value === ACCESS_PASSWORD) {
    return NextResponse.next();
  }

  // 如果是 POST 请求（提交密码），验证密码
  if (request.method === "POST" && pathname === "/api/auth") {
    return handleAuth(request);
  }

  // 未认证：返回密码输入页面
  return new NextResponse(getLoginHtml(), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function handleAuth(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;

    if (password === ACCESS_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("site_auth", ACCESS_PASSWORD, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 天有效期
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ success: false, message: "密码错误" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: "请求无效" }, { status: 400 });
  }
}

function getLoginHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>访问验证</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #e2e8f0;
    }
    .container {
      background: #1e293b;
      padding: 48px 40px;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    .icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 20px;
      background: #334155;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon svg {
      width: 28px;
      height: 28px;
      stroke: #94a3b8;
      fill: none;
      stroke-width: 2;
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #f1f5f9;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 28px;
      line-height: 1.6;
    }
    .input-group {
      display: flex;
      gap: 10px;
    }
    input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #334155;
      border-radius: 10px;
      font-size: 15px;
      background: #0f172a;
      color: #e2e8f0;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: #6366f1;
    }
    input::placeholder {
      color: #64748b;
    }
    button {
      padding: 12px 24px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }
    button:hover {
      background: #4f46e5;
    }
    button:active {
      background: #4338ca;
    }
    .error {
      margin-top: 14px;
      font-size: 13px;
      color: #f87171;
      display: none;
    }
    .error.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1"/>
      </svg>
    </div>
    <h1>此网站受限访问</h1>
    <p>请输入访问密钥以继续浏览</p>
    <div class="input-group">
      <input type="password" id="password" placeholder="请输入访问密钥" autofocus>
      <button onclick="submitPassword()">验证</button>
    </div>
    <p class="error" id="error">密钥错误，请重试</p>
  </div>
  <script>
    async function submitPassword() {
      const password = document.getElementById("password").value;
      const error = document.getElementById("error");
      error.classList.remove("show");

      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          error.classList.add("show");
        }
      } catch {
        error.textContent = "网络错误，请重试";
        error.classList.add("show");
      }
    }
    document.getElementById("password").addEventListener("keydown", function(e) {
      if (e.key === "Enter") submitPassword();
    });
  </script>
</body>
</html>`;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
};
