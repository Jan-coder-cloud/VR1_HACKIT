"use client";

import { useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyChart = any;

function useChart(id: string, build: () => object) {
  const ref = useRef<AnyChart>(null);
  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CJ = (window as any).Chart;
    if (!canvas || !CJ) return;
    if (ref.current) ref.current.destroy();
    ref.current = new CJ(canvas, build());
    return () => ref.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

const tip = { backgroundColor: "#fff", borderColor: "#e2e8f0", borderWidth: 1, titleColor: "#0f172a", bodyColor: "#64748b", padding: 10, boxPadding: 4 };
const tf  = { family: "JetBrains Mono", size: 10 };

export function LineChart() {
  useChart("lineChart", () => ({
    type: "line",
    data: {
      labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
      datasets: [{ data: [42,55,38,72,65,80,91,78,85,99,88,102,115,108,95,120,134,118,128,145,138,152,141,160,148,155,168,175,162,180], borderColor: "#0a66c2", backgroundColor: "rgba(10,102,194,0.06)", borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: "#0a66c2" }],
    },
    options: { responsive: true, plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false, ...tip } }, scales: { x: { grid: { color: "rgba(226,232,240,0.8)" }, ticks: { color: "#94a3b8", maxTicksLimit: 6, font: tf } }, y: { grid: { color: "rgba(226,232,240,0.8)" }, ticks: { color: "#94a3b8", maxTicksLimit: 5, font: tf } } } },
  }));
  return <canvas id="lineChart" height={90} />;
}

export function DoughnutChart({ data }: { data: { labels: string[]; values: number[]; colors: string[] } }) {
  useChart("doughnutChart", () => ({
    type: "doughnut",
    data: { labels: data.labels, datasets: [{ data: data.values, backgroundColor: data.colors, borderWidth: 3, borderColor: "#fff", hoverOffset: 6 }] },
    options: { responsive: true, cutout: "72%", plugins: { legend: { position: "bottom", labels: { color: "#64748b", padding: 14, boxWidth: 10, boxHeight: 10, font: { family: "Instrument Sans", size: 12 } } }, tooltip: tip } },
  }));
  return <canvas id="doughnutChart" height={160} />;
}

export function BarChart() {
  useChart("barChart", () => ({
    type: "bar",
    data: {
      labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      datasets: [
        { label: "Accepted", data: [28,35,22,41,38,29,24], backgroundColor: "rgba(22,163,74,0.7)", borderRadius: 4 },
        { label: "Rejected", data: [12,18,9,15,11,8,14],  backgroundColor: "rgba(220,38,38,0.6)",  borderRadius: 4 },
        { label: "Pending",  data: [5,8,4,9,6,3,7],       backgroundColor: "rgba(234,88,12,0.55)", borderRadius: 4 },
      ],
    },
    options: { responsive: true, plugins: { legend: { position: "bottom", labels: { color: "#64748b", padding: 10, boxWidth: 10, boxHeight: 10, font: { family: "Instrument Sans", size: 12 } } }, tooltip: tip }, scales: { x: { grid: { display: false }, ticks: { color: "#94a3b8", font: tf } }, y: { grid: { color: "rgba(226,232,240,0.8)" }, ticks: { color: "#94a3b8", maxTicksLimit: 4, font: tf } } } },
  }));
  return <canvas id="barChart" height={130} />;
}
