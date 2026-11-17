// Synthetic load curves and two baseline forecasters, drawn on a canvas.

const HISTORY_HOURS = 168;
const HORIZON_HOURS = 24;
const BASE_LOAD = 1000;
const WEEKEND_DIP = 80;
const NOISE_PERSISTENCE = 0.9; // how strongly noise carries from one hour to the next
const AVERAGING_DRAWS = 300;
// Not 24: here the last observed hour is also "same hour yesterday" for hour 24, so the two baselines tie.
const REPORTED_HORIZONS = [1, 6, 12];

const controls = {
  swing: document.getElementById("swing"),
  noise: document.getElementById("noise"),
  shift: document.getElementById("shift"),
  seed: document.getElementById("seed"),
};
const readouts = {
  swing: document.getElementById("swing-readout"),
  noise: document.getElementById("noise-readout"),
  shift: document.getElementById("shift-readout"),
};
const canvas = document.getElementById("chart");
const context = canvas.getContext("2d");
const resultsBody = document.getElementById("results");

// A small seeded random generator, so the same seed always draws the same curve.
function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random) {
  const u = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

// Returns HISTORY_HOURS + HORIZON_HOURS hourly values. The shift applies to the forecast window only.
function generateSeries(random, { swing, noise, shiftPercent }) {
  const values = [];
  let noiseState = 0;
  for (let hour = 0; hour < HISTORY_HOURS + HORIZON_HOURS; hour++) {
    const dailyCycle = swing * Math.sin((2 * Math.PI * (hour - 6)) / 24);
    const isWeekend = Math.floor(hour / 24) % 7 >= 5;
    noiseState = NOISE_PERSISTENCE * noiseState + noise * gaussian(random) * Math.sqrt(1 - NOISE_PERSISTENCE ** 2);
    const level = hour >= HISTORY_HOURS ? 1 + shiftPercent / 100 : 1;
    values.push((BASE_LOAD + dailyCycle - (isWeekend ? WEEKEND_DIP : 0) + noiseState) * level);
  }
  return values;
}

function naiveForecast(history) {
  const last = history[history.length - 1];
  return Array.from({ length: HORIZON_HOURS }, () => last);
}

function seasonalNaiveForecast(history) {
  return Array.from({ length: HORIZON_HOURS }, (_, step) => history[history.length - 24 + step]);
}

function readSettings() {
  return {
    swing: Number(controls.swing.value),
    noise: Number(controls.noise.value),
    shiftPercent: Number(controls.shift.value),
    seed: Math.max(1, Number(controls.seed.value) || 1),
  };
}

function averageErrors(settings) {
  const totals = { naive: REPORTED_HORIZONS.map(() => 0), seasonal: REPORTED_HORIZONS.map(() => 0) };
  const random = createRandom(settings.seed * 1000 + 1);
  for (let draw = 0; draw < AVERAGING_DRAWS; draw++) {
    const series = generateSeries(random, settings);
    const history = series.slice(0, HISTORY_HOURS);
    const actual = series.slice(HISTORY_HOURS);
    const naive = naiveForecast(history);
    const seasonal = seasonalNaiveForecast(history);
    REPORTED_HORIZONS.forEach((horizon, index) => {
      totals.naive[index] += Math.abs(naive[horizon - 1] - actual[horizon - 1]);
      totals.seasonal[index] += Math.abs(seasonal[horizon - 1] - actual[horizon - 1]);
    });
  }
  return {
    naive: totals.naive.map((total) => total / AVERAGING_DRAWS),
    seasonal: totals.seasonal.map((total) => total / AVERAGING_DRAWS),
  };
}

function renderTable(settings) {
  const errors = averageErrors(settings);
  resultsBody.replaceChildren();
  REPORTED_HORIZONS.forEach((horizon, index) => {
    const row = document.createElement("tr");
    const naiveWins = errors.naive[index] < errors.seasonal[index];
    row.innerHTML = `<td>${horizon} h ahead</td>`;
    [errors.naive[index], errors.seasonal[index]].forEach((value, column) => {
      const cell = document.createElement("td");
      cell.className = "num";
      const wins = column === 0 ? naiveWins : !naiveWins;
      cell.textContent = value.toFixed(1);
      if (wins) cell.style.fontWeight = "700";
      row.append(cell);
    });
    resultsBody.append(row);
  });
}

function cssColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawLine(values, startHour, color, scale, width = 2) {
  context.beginPath();
  values.forEach((value, index) => {
    const x = scale.x(startHour + index);
    const y = scale.y(value);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

function renderChart(settings) {
  const series = generateSeries(createRandom(settings.seed), settings);
  const history = series.slice(0, HISTORY_HOURS);
  const actual = series.slice(HISTORY_HOURS);

  const margin = { left: 52, right: 12, top: 12, bottom: 24 };
  const plotWidth = canvas.width - margin.left - margin.right;
  const plotHeight = canvas.height - margin.top - margin.bottom;
  const visible = [...series, ...naiveForecast(history), ...seasonalNaiveForecast(history)];
  const low = Math.min(...visible) - 20;
  const high = Math.max(...visible) + 20;
  const scale = {
    x: (hour) => margin.left + (hour / (series.length - 1)) * plotWidth,
    y: (value) => margin.top + (1 - (value - low) / (high - low)) * plotHeight,
  };

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "12px system-ui, sans-serif";
  context.fillStyle = cssColor("--muted");
  context.textAlign = "right";
  context.textBaseline = "middle";
  for (let step = 0; step <= 4; step++) {
    const value = low + ((high - low) * step) / 4;
    const y = scale.y(value);
    context.strokeStyle = cssColor("--border");
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(margin.left, y);
    context.lineTo(canvas.width - margin.right, y);
    context.stroke();
    context.fillText(Math.round(value), margin.left - 6, y);
  }

  const forecastStartX = scale.x(HISTORY_HOURS);
  context.setLineDash([4, 4]);
  context.strokeStyle = cssColor("--muted");
  context.beginPath();
  context.moveTo(forecastStartX, margin.top);
  context.lineTo(forecastStartX, margin.top + plotHeight);
  context.stroke();
  context.setLineDash([]);

  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillText("hours (forecast starts at the dashed line)", margin.left + plotWidth / 2, canvas.height - 16);

  drawLine(history, 0, cssColor("--muted"), scale);
  drawLine(actual, HISTORY_HOURS, cssColor("--text"), scale, 2.5);
  drawLine(naiveForecast(history), HISTORY_HOURS, cssColor("--series-b"), scale);
  drawLine(seasonalNaiveForecast(history), HISTORY_HOURS, cssColor("--series-a"), scale);
}

function update() {
  const settings = readSettings();
  readouts.swing.textContent = settings.swing;
  readouts.noise.textContent = settings.noise;
  readouts.shift.textContent = `${settings.shiftPercent > 0 ? "+" : ""}${settings.shiftPercent}%`;
  renderChart(settings);
  renderTable(settings);
}

Object.values(controls).forEach((control) => control.addEventListener("input", update));
document.getElementById("redraw").addEventListener("click", () => {
  controls.seed.value = Math.floor(Math.random() * 99999) + 1;
  update();
});
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", update);

update();
