const { invoke } = window.__TAURI__.core;

const SAMPLE_INTERVAL_MS = 200;
const MAX_SAMPLES = 200;
let telemetryChart;
let polling = false;

function createEmptySamples() {
  return Array(MAX_SAMPLES).fill(null);
}

function showError(error) {
  const errorMessage = document.querySelector("#error-message");
  errorMessage.textContent = `Unable to read telemetry: ${error}`;
  errorMessage.hidden = false;
}

async function addRandomReading() {
  if (polling) {
    return;
  }

  polling = true;
  try {
    const value = await invoke("random_number");
    const now = new Date();
    const timestamp =
      `${now.toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}.${String(
        now.getMilliseconds(),
      ).padStart(3, "0")}`;

    telemetryChart.data.labels.unshift(timestamp);
    telemetryChart.data.labels.pop();
    telemetryChart.data.datasets[0].data.unshift(value);
    telemetryChart.data.datasets[0].data.pop();

    telemetryChart.update("none");
  } catch (error) {
    showError(error);
  } finally {
    polling = false;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const context = document.querySelector("#telemetry-chart").getContext("2d");
  telemetryChart = new Chart(context, {
    type: "line",
    data: {
      labels: Array(MAX_SAMPLES).fill(""),
      datasets: [
        {
          label: "Backend random number",
          data: createEmptySamples(),
          borderColor: "#16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.12)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          reverse: true,
          ticks: {
            maxTicksLimit: 10,
          },
        },
        y: {
          min: 0,
          max: 10,
          title: {
            display: true,
            text: "Random number",
          },
        },
      },
    },
  });

  addRandomReading();
  window.setInterval(addRandomReading, SAMPLE_INTERVAL_MS);
});
