const state = {
  data: [],
  fileName: "なし",
};

const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const xLabelInput = document.getElementById("xLabelInput");
const yLabelInput = document.getElementById("yLabelInput");
const titleInput = document.getElementById("titleInput");
const fileNameEl = document.getElementById("fileName");
const pointCountEl = document.getElementById("pointCount");
const xRangeEl = document.getElementById("xRange");
const yRangeEl = document.getElementById("yRange");
const previewBody = document.getElementById("previewBody");
const canvas = document.getElementById("plotCanvas");
const ctx = canvas.getContext("2d");

function formatNumber(value) {
  if (!Number.isFinite(value)) return "-";
  return Math.abs(value) >= 1000 || Math.abs(value) < 0.01
    ? value.toExponential(4)
    : value.toFixed(4);
}

function extractTwoColumnData(text) {
  const lines = text.split(/\r?\n/);
  const points = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("#") || line.startsWith("//") || line.startsWith(";")) continue;

    const tokens = line
      .replace(/,/g, " ")
      .replace(/;/g, " ")
      .trim()
      .split(/\s+/)
      .map((token) => Number(token));

    const numericTokens = tokens.filter((value) => Number.isFinite(value));
    if (numericTokens.length < 2) continue;

    points.push({ x: numericTokens[0], y: numericTokens[1] });
  }

  return points;
}

function updateSummary(data) {
  fileNameEl.textContent = state.fileName;
  pointCountEl.textContent = String(data.length);

  if (!data.length) {
    xRangeEl.textContent = "-";
    yRangeEl.textContent = "-";
    return;
  }

  const xs = data.map((point) => point.x);
  const ys = data.map((point) => point.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  xRangeEl.textContent = `${formatNumber(xMin)} 〜 ${formatNumber(xMax)}`;
  yRangeEl.textContent = `${formatNumber(yMin)} 〜 ${formatNumber(yMax)}`;
}

function updatePreview(data) {
  if (!data.length) {
    previewBody.innerHTML = `<tr><td colspan="3" class="muted">まだデータがありません</td></tr>`;
    return;
  }

  previewBody.innerHTML = data
    .slice(0, 12)
    .map(
      (point, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${formatNumber(point.x)}</td>
          <td>${formatNumber(point.y)}</td>
        </tr>
      `,
    )
    .join("");
}

function drawPlot() {
  const data = state.data;
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const margin = { top: 70, right: 40, bottom: 85, left: 95 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.strokeRect(margin.left, margin.top, plotWidth, plotHeight);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 30px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(titleInput.value || "Spectrum", width / 2, 40);

  if (!data.length) {
    ctx.fillStyle = "#64748b";
    ctx.font = "500 24px Inter, sans-serif";
    ctx.fillText("ここにグラフが表示されます", width / 2, height / 2);
    return;
  }

  const xs = data.map((point) => point.x);
  const ys = data.map((point) => point.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const xPad = (xMax - xMin || 1) * 0.03;
  const yPad = (yMax - yMin || 1) * 0.08;
  const x0 = xMin - xPad;
  const x1 = xMax + xPad;
  const y0 = yMin - yPad;
  const y1 = yMax + yPad;

  const mapX = (x) => margin.left + ((x - x0) / (x1 - x0)) * plotWidth;
  const mapY = (y) => margin.top + (1 - (y - y0) / (y1 - y0)) * plotHeight;

  const xTicks = 6;
  const yTicks = 6;
  ctx.font = "500 18px Inter, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.strokeStyle = "#cbd5e1";

  for (let i = 0; i <= xTicks; i += 1) {
    const t = i / xTicks;
    const xValue = x0 + (x1 - x0) * t;
    const xPos = margin.left + plotWidth * t;

    ctx.beginPath();
    ctx.moveTo(xPos, margin.top);
    ctx.lineTo(xPos, margin.top + plotHeight);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillText(formatNumber(xValue), xPos, margin.top + plotHeight + 30);
  }

  for (let i = 0; i <= yTicks; i += 1) {
    const t = i / yTicks;
    const yValue = y1 - (y1 - y0) * t;
    const yPos = margin.top + plotHeight * t;

    ctx.beginPath();
    ctx.moveTo(margin.left, yPos);
    ctx.lineTo(margin.left + plotWidth, yPos);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.fillText(formatNumber(yValue), margin.left - 12, yPos + 6);
  }

  ctx.strokeStyle = "#1d4ed8";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  data.forEach((point, index) => {
    const px = mapX(point.x);
    const py = mapY(point.y);
    if (index === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.font = "600 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(xLabelInput.value || "X", width / 2, height - 24);

  ctx.save();
  ctx.translate(26, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText(yLabelInput.value || "Intensity", 0, 0);
  ctx.restore();
}

function renderAll() {
  updateSummary(state.data);
  updatePreview(state.data);
  drawPlot();
  downloadPngBtn.disabled = state.data.length === 0;
}

function loadText(text, fileName) {
  const data = extractTwoColumnData(text);
  if (!data.length) {
    window.alert("有効な2列数値データを見つけられませんでした。");
    return;
  }

  state.data = data;
  state.fileName = fileName;
  renderAll();
}

async function handleFile(file) {
  const text = await file.text();
  loadText(text, file.name);
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  await handleFile(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
  });
});

dropzone.addEventListener("drop", async (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  await handleFile(file);
});

loadSampleBtn.addEventListener("click", async () => {
  const response = await fetch("examples/sample-spectrum.txt");
  const text = await response.text();
  loadText(text, "sample-spectrum.txt");
});

downloadPngBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  const safeTitle = (titleInput.value || "plot").replace(/[^a-z0-9-_]+/gi, "_");
  link.href = canvas.toDataURL("image/png");
  link.download = `${safeTitle}.png`;
  link.click();
});

[xLabelInput, yLabelInput, titleInput].forEach((input) => {
  input.addEventListener("input", drawPlot);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

renderAll();
