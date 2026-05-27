+++
author = "chenxi"
title = "健身记录"
date = "2025-09-28"
description = ""
categories = ["动态"]
thumbnail= "images/flower.jpg"
weight = -9
+++
持续更新...
<!--more-->

## 📉 体重变化记录（2025.09.28–2025.11.08）

<canvas id="weightChart" style="max-width: 100%; height: 360px;"></canvas>

<!-- 引入 Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
const ctx = document.getElementById('weightChart').getContext('2d');

new Chart(ctx, {
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

            borderColor: '#4c9aff',
            backgroundColor: 'rgba(76,154,255,0.15)',
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.parsed.y + ' kg';
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: '日期'
                }
            },
            y: {
                title: {
                    display: true,
                    text: '体重 (kg)'
                },
                suggestedMin: 70,
                suggestedMax: 80
            }
        }
    }
});
</script>


健身是从25年10月份开始，刚开始一个月主要是减脂，效果也非常明显，从78kg一直降到71kg，14斤左右，然后直到现在也一直稳定在71kg左右

**2026年1月13日**

后面两个月坚持健身，直到昨天第一次从镜子中看到有训练痕迹，而且重要的是，这三个月，我基本上没有专门花时间练手臂，只是胸肩背三分化循环，而且没有吃蛋白粉、肌酸等任何补剂。

目前的想法是把肩练宽，而不是追求维度多大，所以综合感觉效果还是不错的

不过目前从肉眼看还不是很明显，等寒假回家，可以把二头和三头的训练加上，这样应该会更有效


<br>
<img src="/images/train/260113-1.png" style="width:75%; display:block; margin:auto;">
<br>


**2026年3月9日**
可以，有进步，但是感觉进步好慢，感觉网上说三个月练成什么的太夸张了，需要坚持，不过过年快一个月的时间没有锻炼也没有明显退步，还是有一些意外的

不过过完年回来，感觉之前太的太随意的，还是应该上重量，每次力竭才会有效果

另外现在感觉体脂太高，感觉都是脂包肌，另外就是屁股和大腿还是没瘦下来，我觉得要有氧和无氧结合才行


<br>
<img src="/images/train/260309-1.jpeg" style="width:75%; display:block; margin:auto;">
<br>

<br>
<img src="/images/train/260309-2.jpeg" style="width:75%; display:block; margin:auto;">
<br>

<!-- <br>
<img src="/images/train/260113-2.png" style="width:75%; display:block; margin:auto;">
<br> -->






