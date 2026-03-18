const SERIES_COLORS = [
  "#60a5fa",
  "#f87171",
  "#34d399",
  "#c084fc",
  "#fbbf24",
  "#22d3ee",
  "#fb7185",
  "#a3e635",
];

const DEFAULT_THEME = {
  preset: "midnight",
  pageBg: "#0b1120",
  panelBg: "#0f172a",
  textColor: "#e2e8f0",
  mutedColor: "#94a3b8",
  gridColor: "#22304a",
  accentColor: "#3b82f6",
  canvasBg: "#0b1326",
  axisTextColor: "#cbd5e1",
  titleColor: "#e2e8f0",
  peakColor: "#fbbf24",
  lineWidth: 2.5,
  gridWidth: 1,
  fontScale: 1,
};

const THEME_PRESETS = {
  midnight: { ...DEFAULT_THEME },
  paper: {
    preset: "paper",
    pageBg: "#f8fafc",
    panelBg: "#ffffff",
    textColor: "#0f172a",
    mutedColor: "#475569",
    gridColor: "#cbd5e1",
    accentColor: "#1d4ed8",
    canvasBg: "#ffffff",
    axisTextColor: "#1e293b",
    titleColor: "#0f172a",
    peakColor: "#b45309",
    lineWidth: 2.2,
    gridWidth: 1,
    fontScale: 1,
  },
  contrast: {
    preset: "contrast",
    pageBg: "#020617",
    panelBg: "#111827",
    textColor: "#f8fafc",
    mutedColor: "#cbd5e1",
    gridColor: "#475569",
    accentColor: "#38bdf8",
    canvasBg: "#020617",
    axisTextColor: "#f8fafc",
    titleColor: "#ffffff",
    peakColor: "#f43f5e",
    lineWidth: 3,
    gridWidth: 1.5,
    fontScale: 1.05,
  },
  soft: {
    preset: "soft",
    pageBg: "#f8fafc",
    panelBg: "#e0f2fe",
    textColor: "#0f172a",
    mutedColor: "#64748b",
    gridColor: "#94a3b8",
    accentColor: "#7c3aed",
    canvasBg: "#fdfcff",
    axisTextColor: "#334155",
    titleColor: "#312e81",
    peakColor: "#ea580c",
    lineWidth: 2.5,
    gridWidth: 1,
    fontScale: 1,
  },
};

const state = {
  datasets: [],
  view: {
    selectedSeries: "all",
    xDirection: "asc",
    zoomDomain: null,
  },
  interaction: {
    dragStartX: null,
    dragCurrentX: null,
  },
  theme: { ...DEFAULT_THEME },
};

const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const clearFilesBtn = document.getElementById("clearFilesBtn");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const resetZoomBtn = document.getElementById("resetZoomBtn");
const applyRangeBtn = document.getElementById("applyRangeBtn");
const xMinInput = document.getElementById("xMinInput");
const xMaxInput = document.getElementById("xMaxInput");
const titleInput = document.getElementById("titleInput");
const xLabelSelect = document.getElementById("xLabelSelect");
const yLabelSelect = document.getElementById("yLabelSelect");
const themePresetSelect = document.getElementById("themePresetSelect");
const applyThemePresetBtn = document.getElementById("applyThemePresetBtn");
const resetThemeBtn = document.getElementById("resetThemeBtn");
const pageBgInput = document.getElementById("pageBgInput");
const panelBgInput = document.getElementById("panelBgInput");
const textColorInput = document.getElementById("textColorInput");
const mutedColorInput = document.getElementById("mutedColorInput");
const gridColorInput = document.getElementById("gridColorInput");
const accentColorInput = document.getElementById("accentColorInput");
const canvasBgInput = document.getElementById("canvasBgInput");
const axisTextColorInput = document.getElementById("axisTextColorInput");
const titleColorInput = document.getElementById("titleColorInput");
const peakColorInput = document.getElementById("peakColorInput");
const lineWidthInput = document.getElementById("lineWidthInput");
const gridWidthInput = document.getElementById("gridWidthInput");
const fontScaleInput = document.getElementById("fontScaleInput");
const seriesFilter = document.getElementById("seriesFilter");
const xDirectionSelect = document.getElementById("xDirectionSelect");
const fileNameEl = document.getElementById("fileName");
const pointCountEl = document.getElementById("pointCount");
const xRangeEl = document.getElementById("xRange");
const yRangeEl = document.getElementById("yRange");
const loadedCountEl = document.getElementById("loadedCount");
const viewModeLabelEl = document.getElementById("viewModeLabel");
const peakXEl = document.getElementById("peakX");
const xStepEl = document.getElementById("xStep");
const seriesListEl = document.getElementById("seriesList");
const previewBody = document.getElementById("previewBody");
const previewPanel = document.querySelector(".preview-panel");
const canvas = document.getElementById("plotCanvas");
const ctx = canvas.getContext("2d");

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function setRootVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

function syncThemeInputs() {
  themePresetSelect.value = state.theme.preset;
  pageBgInput.value = state.theme.pageBg;
  panelBgInput.value = state.theme.panelBg;
  textColorInput.value = state.theme.textColor;
  mutedColorInput.value = state.theme.mutedColor;
  gridColorInput.value = state.theme.gridColor;
  accentColorInput.value = state.theme.accentColor;
  canvasBgInput.value = state.theme.canvasBg;
  axisTextColorInput.value = state.theme.axisTextColor;
  titleColorInput.value = state.theme.titleColor;
  peakColorInput.value = state.theme.peakColor;
  lineWidthInput.value = String(state.theme.lineWidth);
  gridWidthInput.value = String(state.theme.gridWidth);
  fontScaleInput.value = String(state.theme.fontScale);
}

function applyTheme() {
  const { pageBg, panelBg, textColor, mutedColor, gridColor, accentColor, canvasBg } = state.theme;
  setRootVar("--bg", pageBg);
  setRootVar("--bg-grad-top", rgba(accentColor, 0.22));
  setRootVar("--bg-grad-bottom", rgba(pageBg, 0.98));
  setRootVar("--panel", panelBg);
  setRootVar("--panel-soft", rgba(panelBg, 0.88));
  setRootVar("--ink", textColor);
  setRootVar("--muted", mutedColor);
  setRootVar("--line", gridColor);
  setRootVar("--accent", accentColor);
  setRootVar("--accent-soft", rgba(accentColor, 0.12));
  setRootVar("--canvas-bg", canvasBg);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", panelBg);
  syncThemeInputs();
}

function setThemePreset(name) {
  const preset = THEME_PRESETS[name] ?? DEFAULT_THEME;
  state.theme = { ...preset };
  applyTheme();
  drawPlot();
}

function updateThemeFromControls() {
  state.theme = {
    preset: themePresetSelect.value,
    pageBg: pageBgInput.value,
    panelBg: panelBgInput.value,
    textColor: textColorInput.value,
    mutedColor: mutedColorInput.value,
    gridColor: gridColorInput.value,
    accentColor: accentColorInput.value,
    canvasBg: canvasBgInput.value,
    axisTextColor: axisTextColorInput.value,
    titleColor: titleColorInput.value,
    peakColor: peakColorInput.value,
    lineWidth: Number(lineWidthInput.value) || DEFAULT_THEME.lineWidth,
    gridWidth: Number(gridWidthInput.value) || DEFAULT_THEME.gridWidth,
    fontScale: Number(fontScaleInput.value) || DEFAULT_THEME.fontScale,
  };
  applyTheme();
  drawPlot();
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "-";
  return Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.01)
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

function getFilteredDatasets() {
  const datasets = state.view.selectedSeries === "all"
    ? state.datasets
    : state.datasets.filter((dataset) => dataset.id === state.view.selectedSeries);

  return datasets.map((dataset) => {
    const sorted = [...dataset.data].sort((a, b) => a.x - b.x);
    return {
      ...dataset,
      data: state.view.xDirection === "asc" ? sorted : [...sorted].reverse(),
    };
  });
}

function getVisiblePoints() {
  return getFilteredDatasets().flatMap((dataset) => dataset.data);
}

function getEffectiveXDomain(points = getVisiblePoints()) {
  if (!points.length) return null;
  const xs = points.map((point) => point.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const xPad = (xMax - xMin || 1) * 0.03;
  const fallbackDomain = [xMin - xPad, xMax + xPad];
  const zoomDomain = state.view.zoomDomain ?? fallbackDomain;
  return [Math.min(...zoomDomain), Math.max(...zoomDomain)];
}

function getPointsInDomain(points, domain = getEffectiveXDomain(points)) {
  if (!points.length || !domain) return points;
  const [x0, x1] = domain;
  const filtered = points.filter((point) => point.x >= x0 && point.x <= x1);
  return filtered.length ? filtered : points;
}

function getPeakPoint(points) {
  if (!points.length) return null;
  return points.reduce((peak, point) => (point.y > peak.y ? point : peak), points[0]);
}

function estimateXStep(points) {
  if (points.length < 2) return null;
  const sortedXs = [...new Set(points.map((point) => point.x))].sort((a, b) => a - b);
  if (sortedXs.length < 2) return null;
  const steps = [];
  for (let i = 1; i < sortedXs.length; i += 1) {
    const step = sortedXs[i] - sortedXs[i - 1];
    if (Math.abs(step) > 0) steps.push(Math.abs(step));
  }
  if (!steps.length) return null;
  return steps.reduce((sum, step) => sum + step, 0) / steps.length;
}

function syncSeriesFilterOptions() {
  const previousValue = seriesFilter.value;
  seriesFilter.innerHTML = '<option value="all">すべての系列</option>';

  state.datasets.forEach((dataset) => {
    const option = document.createElement("option");
    option.value = dataset.id;
    option.textContent = dataset.fileName;
    seriesFilter.append(option);
  });

  const nextValue = state.datasets.some((dataset) => dataset.id === previousValue) ? previousValue : "all";
  state.view.selectedSeries = nextValue;
  seriesFilter.value = nextValue;
}

function updateSummary() {
  const datasets = getFilteredDatasets();
  const allVisiblePoints = getVisiblePoints();

  loadedCountEl.textContent = String(state.datasets.length);
  fileNameEl.textContent = state.datasets.length
    ? state.datasets.map((dataset) => dataset.fileName).join(", ")
    : "なし";
  pointCountEl.textContent = String(allVisiblePoints.length);
  viewModeLabelEl.textContent = state.view.selectedSeries === "all"
    ? "全系列"
    : `${datasets[0]?.fileName ?? "-"} のみ`;

  if (!allVisiblePoints.length) {
    xRangeEl.textContent = "-";
    yRangeEl.textContent = "-";
    peakXEl.textContent = "-";
    xStepEl.textContent = "-";
    return;
  }

  const effectivePoints = getPointsInDomain(allVisiblePoints);
  const xs = effectivePoints.map((point) => point.x);
  const ys = effectivePoints.map((point) => point.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const peakPoint = getPeakPoint(effectivePoints);
  const step = estimateXStep(allVisiblePoints);

  xRangeEl.textContent = `${formatNumber(xMin)} 〜 ${formatNumber(xMax)}`;
  yRangeEl.textContent = `${formatNumber(yMin)} 〜 ${formatNumber(yMax)}`;
  peakXEl.textContent = peakPoint ? formatNumber(peakPoint.x) : "-";
  xStepEl.textContent = step ? formatNumber(step) : "-";
}

function updateSeriesList() {
  if (!state.datasets.length) {
    seriesListEl.innerHTML = '<li class="muted">まだ系列がありません</li>';
    return;
  }

  seriesListEl.innerHTML = state.datasets
    .map((dataset) => {
      const isActive = state.view.selectedSeries === "all" || state.view.selectedSeries === dataset.id;
      return `
        <li class="${isActive ? "active" : ""}">
          <span class="series-chip">
            <span class="series-swatch" style="background:${dataset.color}"></span>
            <span>${dataset.fileName}</span>
          </span>
          <span class="series-meta">${dataset.data.length} points</span>
        </li>
      `;
    })
    .join("");
}

function renderPreviewSummary() {
  const existingSummary = previewPanel.querySelector(".table-summary");
  if (existingSummary) existingSummary.remove();

  const allVisiblePoints = getVisiblePoints();
  const datasets = getFilteredDatasets();
  const peakPoint = getPeakPoint(getPointsInDomain(allVisiblePoints));
  const summary = document.createElement("div");
  summary.className = "table-summary";
  summary.innerHTML = `
    <div class="summary-card">
      <strong>表示対象</strong>
      <span>${state.view.selectedSeries === "all" ? "全系列" : datasets[0]?.fileName ?? "-"}</span>
    </div>
    <div class="summary-card">
      <strong>最大ピーク</strong>
      <span>${peakPoint ? formatNumber(peakPoint.x) : "-"}</span>
    </div>
    <div class="summary-card">
      <strong>表示中データ点</strong>
      <span>${allVisiblePoints.length}</span>
    </div>
    <div class="summary-card">
      <strong>ズーム範囲</strong>
      <span>${state.view.zoomDomain ? `${formatNumber(state.view.zoomDomain[0])} – ${formatNumber(state.view.zoomDomain[1])}` : "未設定"}</span>
    </div>
  `;

  previewPanel.insertBefore(summary, previewPanel.querySelector(".table-wrap"));
}

function updatePreview() {
  renderPreviewSummary();

  if (!state.datasets.length) {
    previewBody.innerHTML = '<tr><td colspan="4" class="muted">まだデータがありません</td></tr>';
    return;
  }

  previewBody.innerHTML = getFilteredDatasets()
    .flatMap((dataset) => dataset.data.slice(0, 4).map((point, index) => `
      <tr>
        <td>${dataset.fileName}</td>
        <td>${index + 1}</td>
        <td>${formatNumber(point.x)}</td>
        <td>${formatNumber(point.y)}</td>
      </tr>
    `))
    .join("");
}

function drawLegend(datasets, x, y) {
  ctx.font = "500 16px Inter, sans-serif";
  ctx.textAlign = "left";

  datasets.forEach((dataset, index) => {
    const itemY = y + index * 24;
    ctx.fillStyle = dataset.color;
    ctx.fillRect(x, itemY - 10, 18, 4);
    ctx.fillStyle = state.theme.axisTextColor;
    ctx.fillText(dataset.fileName, x + 28, itemY);
  });
}

function getPlotBounds(allPoints) {
  const xDomain = getEffectiveXDomain(allPoints);
  const pointsInDomain = getPointsInDomain(allPoints, xDomain);
  const ys = pointsInDomain.map((point) => point.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yPad = (yMax - yMin || 1) * 0.08;

  return {
    x0: xDomain[0],
    x1: xDomain[1],
    y0: yMin - yPad,
    y1: yMax + yPad,
  };
}

function drawPlot() {
  const datasets = getFilteredDatasets();
  const allPoints = datasets.flatMap((dataset) => dataset.data);
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = state.theme.canvasBg;
  ctx.fillRect(0, 0, width, height);

  const margin = { top: 90, right: 48, bottom: 85, left: 95 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  ctx.strokeStyle = state.theme.gridColor;
  ctx.lineWidth = state.theme.gridWidth;
  ctx.strokeRect(margin.left, margin.top, plotWidth, plotHeight);

  ctx.fillStyle = state.theme.titleColor;
  ctx.font = `700 ${Math.round(30 * state.theme.fontScale)}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(titleInput.value || "Spectrum", width / 2, 42);

  if (!allPoints.length) {
    ctx.fillStyle = state.theme.mutedColor;
    ctx.font = `500 ${Math.round(24 * state.theme.fontScale)}px Inter, sans-serif`;
    ctx.fillText("ファイルを読み込むとここにグラフが表示されます", width / 2, height / 2 - 10);
    ctx.font = `500 ${Math.round(18 * state.theme.fontScale)}px Inter, sans-serif`;
    ctx.fillText(".txt / .csv / .dat 対応。左のサンプル追加でも試せます。", width / 2, height / 2 + 26);
    return;
  }

  const { x0, x1, y0, y1 } = getPlotBounds(allPoints);
  const mapX = (x) => margin.left + ((x - x0) / (x1 - x0 || 1)) * plotWidth;
  const mapY = (y) => margin.top + (1 - (y - y0) / (y1 - y0 || 1)) * plotHeight;

  const xTicks = 6;
  const yTicks = 6;
  ctx.font = `500 ${Math.round(18 * state.theme.fontScale)}px Inter, sans-serif`;
  ctx.fillStyle = state.theme.axisTextColor;
  ctx.strokeStyle = state.theme.gridColor;

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

  datasets.forEach((dataset) => {
    ctx.strokeStyle = dataset.color;
    ctx.lineWidth = state.theme.lineWidth;
    ctx.beginPath();
    dataset.data.forEach((point, index) => {
      const px = mapX(point.x);
      const py = mapY(point.y);
      if (index === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });
    ctx.stroke();
  });

  const peakPoint = getPeakPoint(allPoints.filter((point) => point.x >= x0 && point.x <= x1));
  if (peakPoint) {
    const peakPx = mapX(peakPoint.x);
    const peakPy = mapY(peakPoint.y);
    ctx.strokeStyle = state.theme.accentColor;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(peakPx, margin.top);
    ctx.lineTo(peakPx, margin.top + plotHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = state.theme.peakColor;
    ctx.beginPath();
    ctx.arc(peakPx, peakPy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLegend(datasets, margin.left, 68);

  if (state.interaction.dragStartX !== null && state.interaction.dragCurrentX !== null) {
    const left = Math.min(state.interaction.dragStartX, state.interaction.dragCurrentX);
    const widthRect = Math.abs(state.interaction.dragCurrentX - state.interaction.dragStartX);
    ctx.fillStyle = rgba(state.theme.accentColor, 0.2);
    ctx.fillRect(left, margin.top, widthRect, plotHeight);
    ctx.strokeStyle = rgba(state.theme.accentColor, 0.9);
    ctx.strokeRect(left, margin.top, widthRect, plotHeight);
  }

  ctx.fillStyle = state.theme.axisTextColor;
  ctx.font = `600 ${Math.round(22 * state.theme.fontScale)}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(xLabelSelect.value, width / 2, height - 24);

  ctx.save();
  ctx.translate(26, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText(yLabelSelect.value, 0, 0);
  ctx.restore();
}

function syncRangeInputs() {
  const domain = getEffectiveXDomain();
  const hasDomain = Boolean(domain);
  xMinInput.value = hasDomain ? domain[0].toFixed(4) : "";
  xMaxInput.value = hasDomain ? domain[1].toFixed(4) : "";
  xMinInput.disabled = !hasDomain;
  xMaxInput.disabled = !hasDomain;
  applyRangeBtn.disabled = !hasDomain;
}

function renderAll() {
  syncSeriesFilterOptions();
  updateSummary();
  updateSeriesList();
  updatePreview();
  drawPlot();
  syncRangeInputs();
  const hasData = state.datasets.length > 0;
  downloadPngBtn.disabled = !hasData;
  clearFilesBtn.disabled = !hasData;
  resetZoomBtn.disabled = !state.view.zoomDomain;
}

function appendText(text, fileName) {
  const data = extractTwoColumnData(text);
  if (!data.length) {
    window.alert(`${fileName}: 有効な2列数値データを見つけられませんでした。`);
    return false;
  }

  state.datasets = [
    ...state.datasets,
    {
      id: crypto.randomUUID(),
      fileName,
      data,
      color: SERIES_COLORS[state.datasets.length % SERIES_COLORS.length],
    },
  ];
  return true;
}

async function handleFiles(files) {
  const fileList = Array.from(files || []);
  if (!fileList.length) return;

  let loadedAny = false;
  for (const file of fileList) {
    const text = await file.text();
    loadedAny = appendText(text, file.name) || loadedAny;
  }

  if (loadedAny) {
    state.view.zoomDomain = null;
    renderAll();
  }

  fileInput.value = "";
}

function resetDatasets() {
  state.datasets = [];
  state.view.selectedSeries = "all";
  state.view.zoomDomain = null;
  renderAll();
}

function getCanvasPlotMetrics() {
  const rect = canvas.getBoundingClientRect();
  const margin = { top: 90, right: 48, bottom: 85, left: 95 };
  const plotWidth = canvas.width - margin.left - margin.right;
  const plotHeight = canvas.height - margin.top - margin.bottom;
  return { rect, margin, plotWidth, plotHeight };
}

function toCanvasX(clientX) {
  const { rect } = getCanvasPlotMetrics();
  return ((clientX - rect.left) / rect.width) * canvas.width;
}

function pointerToDataX(canvasX) {
  const points = getVisiblePoints();
  if (!points.length) return null;
  const { margin, plotWidth } = getCanvasPlotMetrics();
  const { x0, x1 } = getPlotBounds(points);
  const clamped = Math.min(Math.max(canvasX, margin.left), margin.left + plotWidth);
  const ratio = (clamped - margin.left) / plotWidth;
  return x0 + (x1 - x0) * ratio;
}

fileInput.addEventListener("change", async (event) => {
  await handleFiles(event.target.files);
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
  await handleFiles(event.dataTransfer?.files);
});

loadSampleBtn.addEventListener("click", async () => {
  const response = await fetch("examples/sample-spectrum.txt");
  const text = await response.text();
  if (appendText(text, `sample-spectrum-${state.datasets.length + 1}.txt`)) {
    renderAll();
  }
});

clearFilesBtn.addEventListener("click", () => {
  resetDatasets();
});

downloadPngBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  const safeTitle = (titleInput.value || "plot").replace(/[^a-z0-9-_]+/gi, "_");
  link.href = canvas.toDataURL("image/png");
  link.download = `${safeTitle}.png`;
  link.click();
});

function applyManualRange() {
  const points = getVisiblePoints();
  if (!points.length) return;

  const minValue = Number(xMinInput.value);
  const maxValue = Number(xMaxInput.value);
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    window.alert("X範囲には数値を入力してください。");
    syncRangeInputs();
    return;
  }
  if (minValue === maxValue) {
    window.alert("X範囲の最小値と最大値は異なる値にしてください。");
    return;
  }

  state.view.zoomDomain = [Math.min(minValue, maxValue), Math.max(minValue, maxValue)];
  renderAll();
}

resetZoomBtn.addEventListener("click", () => {
  state.view.zoomDomain = null;
  renderAll();
});

applyRangeBtn.addEventListener("click", applyManualRange);
[xMinInput, xMaxInput].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyManualRange();
    }
  });
});

seriesFilter.addEventListener("change", (event) => {
  state.view.selectedSeries = event.target.value;
  state.view.zoomDomain = null;
  renderAll();
});

xDirectionSelect.addEventListener("change", (event) => {
  state.view.xDirection = event.target.value;
  state.view.zoomDomain = null;
  renderAll();
});

applyThemePresetBtn.addEventListener("click", () => {
  setThemePreset(themePresetSelect.value);
});

resetThemeBtn.addEventListener("click", () => {
  setThemePreset(DEFAULT_THEME.preset);
});

[themePresetSelect, pageBgInput, panelBgInput, textColorInput, mutedColorInput, gridColorInput, accentColorInput, canvasBgInput, axisTextColorInput, titleColorInput, peakColorInput, lineWidthInput, gridWidthInput, fontScaleInput].forEach((input) => {
  input.addEventListener("input", updateThemeFromControls);
  input.addEventListener("change", updateThemeFromControls);
});

[titleInput, xLabelSelect, yLabelSelect].forEach((input) => {
  input.addEventListener("input", drawPlot);
  input.addEventListener("change", drawPlot);
});

canvas.addEventListener("pointerdown", (event) => {
  if (!getVisiblePoints().length) return;
  state.interaction.dragStartX = toCanvasX(event.clientX);
  state.interaction.dragCurrentX = state.interaction.dragStartX;
  canvas.setPointerCapture(event.pointerId);
  drawPlot();
});

canvas.addEventListener("pointermove", (event) => {
  if (state.interaction.dragStartX === null) return;
  state.interaction.dragCurrentX = toCanvasX(event.clientX);
  drawPlot();
});

function finishZoom() {
  if (state.interaction.dragStartX === null || state.interaction.dragCurrentX === null) {
    state.interaction.dragStartX = null;
    state.interaction.dragCurrentX = null;
    return;
  }

  const startDataX = pointerToDataX(state.interaction.dragStartX);
  const endDataX = pointerToDataX(state.interaction.dragCurrentX);
  if (startDataX !== null && endDataX !== null && Math.abs(endDataX - startDataX) > 0.0001) {
    state.view.zoomDomain = [Math.min(startDataX, endDataX), Math.max(startDataX, endDataX)];
  }

  state.interaction.dragStartX = null;
  state.interaction.dragCurrentX = null;
  renderAll();
}

canvas.addEventListener("pointerup", finishZoom);
canvas.addEventListener("pointercancel", finishZoom);
canvas.addEventListener("dblclick", () => {
  state.view.zoomDomain = null;
  renderAll();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

applyTheme();
renderAll();
