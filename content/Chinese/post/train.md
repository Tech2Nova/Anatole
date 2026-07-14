+++
author = "chenxi"
title = "健身记录"
date = "2025-09-28"
description = "从 78kg 到 71kg，记录每一次训练的变化与思考"
categories = ["动态"]
thumbnail = "images/fitness-cover.png"
+++

2025 年 10 月，我决定开始健身。初衷很简单——想让身体状态更好一些，也想看看自己能坚持多久。这篇文章会持续更新，记录体重变化、训练感悟和阶段性的进步。

<!--more-->

## 体重变化记录（2025.09.28 – 2025.11.08）

<canvas id="weightChart" style="max-width: 100%; height: 360px;"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
(function() {
  const canvas = document.getElementById('weightChart');
  if (!canvas) return;
  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: [
        '09-28','09-29','09-30','10-01','10-02','10-03',
        '10-04','10-05','10-06','10-07','10-08','10-09',
        '10-10','10-11','10-12','10-13','10-14','10-15',
        '10-16','10-17','10-18','10-19','10-20','10-21',
        '10-22','10-23','10-24','10-25','10-26','10-27',
        '10-28','10-29','10-30','10-31','11-01','11-02',
        '11-03','11-04','11-05','11-06','11-07','11-08'
      ],
      datasets: [{
        label: '体重 (kg)',
        data: [
          79.30, 78.70, 77.20, 78.30, 76.95, 77.25,
          77.45, 75.85, 76.05, 76.55, 76.80, 76.30,
          76.10, 75.80, 76.00, 75.40, 75.60, 75.10,
          74.80, 75.00, 74.60, 74.40, 74.70, 74.10,
          73.90, 74.00, 74.60, 74.40, 74.70, 73.20,
          73.00, 73.80, 72.90, 72.50, 72.30, 71.10,
          72.30, 71.90, 71.80, 71.60, 71.70, 71.50
        ],
        borderColor: '#6086b4',
        backgroundColor: 'rgba(96,134,180,0.12)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: '日期' } },
        y: {
          title: { display: true, text: '体重 (kg)' },
          suggestedMin: 70,
          suggestedMax: 80
        }
      }
    }
  });
})();
</script>

第一个月以减脂为主，效果非常明显——从 78kg 降到 71kg，减了大约 14 斤。之后体重一直稳定在 71kg 左右，没有再大幅波动。


## 阶段性记录

### 2026.01.13 

坚持了两个月，昨天第一次从镜子里看到了训练痕迹。

这三个月我基本没有专门练手臂，只做胸、肩、背三分化循环，也没吃蛋白粉、肌酸之类的补剂。目前的想法是把肩练宽，而不是追求围度多大，综合来看效果还不错。

不过从肉眼观察还不是很明显。寒假回家准备把二头和三头也加入训练计划，应该会更有效果。

{{< gallery >}}
/images/train/260113-1.png
{{< /gallery >}}

### 2026.03.09 

有进步，但感觉好慢。网上那些"三个月练成"的说法太夸张了，健身真的需要时间。

过年将近一个月没锻炼，本以为会退步很多，结果身体状态基本保持住了，这算是一个小惊喜。

回来之后反思了一下，之前练得太随意了。接下来准备上重量，每次做到力竭才有效果。另外体脂还是偏高，感觉都是"脂包肌"，腿和屁股也没瘦下来——看来必须有氧和无氧结合才行。

{{< gallery >}}
/images/train/260309-1.jpeg
{{< /gallery >}}

<!--
{{< gallery >}}
/images/train/260113-2.png
{{< /gallery >}}
-->

### 2026.06.14 

终于解锁了引体向上，不过一直卡在 10 个。

现在对健身有了一些自己的感悟，身材也有明显变化。但腿和屁股就是瘦不下去……就算是骨盆前倾，也给我减轻一点啊。

<video controls style="width:70%; display:block; margin:0 auto; border-radius:4px;">
  <source src="/images/train/IMG_3625.MOV">
</video>

<video controls style="width:70%; display:block; margin:0 auto; border-radius:4px; margin-top:1em;">
  <source src="/images/train/IMG_3424.MOV">
</video>
