document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     LOGIN PAGE SCRIPT
     ========================= */
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const status = document.getElementById("status");

  if (form && usernameInput && passwordInput && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const user = usernameInput.value.trim();
      const pass = passwordInput.value.trim();

      if (!user || !pass) {
        status.textContent = "Please fill all fields";
        status.className = "status error";
        return;
      }

      if (user === "admin" && pass === "1234") {
        console.log("Login success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        status.textContent = "Invalid username or password";
        status.className = "status error";
      }
    });
  }

  /* =========================
     DASHBOARD GRAPH DATA
     ========================= */

  const chartDataSets = {
    hour: {
      labels: ["5m", "10m", "15m", "20m", "25m", "30m", "35m", "40m"],
      temperature: [37.4, 37.5, 37.6, 37.8, 37.7, 37.9, 38.0, 37.8],
      humidity: [55, 56, 57, 58, 57, 59, 60, 58]
    },
    day: {
      labels: ["12AM", "3AM", "6AM", "9AM", "12PM", "3PM", "6PM", "9PM"],
      temperature: [37.3, 37.4, 37.5, 37.8, 37.9, 37.7, 37.6, 37.8],
      humidity: [54, 55, 56, 58, 60, 59, 57, 58]
    },
    week: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      temperature: [37.5, 37.6, 37.7, 37.8, 37.6, 37.9, 37.8],
      humidity: [55, 56, 58, 57, 59, 60, 58]
    },
    month: {
      labels: ["W1", "W2", "W3", "W4"],
      temperature: [37.5, 37.7, 37.8, 37.6],
      humidity: [55, 58, 60, 57]
    }
  };

  let currentRange = "hour";
  let tempData = chartDataSets.hour.temperature;
  let humidityData = chartDataSets.hour.humidity;
  let chartLabels = chartDataSets.hour.labels;

  const environmentCanvas = document.getElementById("environmentChart");

  function resizeCanvasForSharpDisplay(canvas, ctx) {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    return {
      width: rect.width,
      height: rect.height
    };
  }

  function setChartRange(range) {
    if (!chartDataSets[range]) return;

    currentRange = range;

    tempData = chartDataSets[range].temperature;
    humidityData = chartDataSets[range].humidity;
    chartLabels = chartDataSets[range].labels;

    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.range === range);
    });

    renderCharts();
  }

  function drawCombinedChart() {
    if (!environmentCanvas) return;

    const ctx = environmentCanvas.getContext("2d");
    const canvas = environmentCanvas;

    const size = resizeCanvasForSharpDisplay(canvas, ctx);

    const w = size.width;
    const h = size.height;

    const paddingLeft = 58;
    const paddingRight = 58;
    const paddingTop = 52;
    const paddingBottom = 46;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);

    if (tempData.length < 2 || humidityData.length < 2) return;

    const tempColor = "#D97706";
    const humidityColor = "#2563EB";
    const gridColor = "#E5E7EB";
    const textColor = "#4B5563";
    const darkText = "#111827";

    const tempMin = Math.floor(Math.min(...tempData) - 0.5);
    const tempMax = Math.ceil(Math.max(...tempData) + 0.5);

    const humidityMin = Math.floor(Math.min(...humidityData) - 5);
    const humidityMax = Math.ceil(Math.max(...humidityData) + 5);

    const chartWidth = w - paddingLeft - paddingRight;
    const chartHeight = h - paddingTop - paddingBottom;

    function getX(index, length) {
      if (length === 1) return paddingLeft;
      return paddingLeft + (index * chartWidth) / (length - 1);
    }

    function getTempY(value) {
      return paddingTop + ((tempMax - value) / (tempMax - tempMin)) * chartHeight;
    }

    function getHumidityY(value) {
      return paddingTop + ((humidityMax - value) / (humidityMax - humidityMin)) * chartHeight;
    }

    // Title
    ctx.fillStyle = darkText;
    ctx.font = "600 15px Inter, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Temperature & Humidity Trend", paddingLeft, 24);

    // Legend
    ctx.font = "12px Inter, Arial, sans-serif";

    ctx.fillStyle = tempColor;
    ctx.fillRect(paddingLeft, 34, 12, 12);
    ctx.fillStyle = textColor;
    ctx.fillText("Temperature °C", paddingLeft + 18, 44);

    ctx.fillStyle = humidityColor;
    ctx.fillRect(paddingLeft + 145, 34, 12, 12);
    ctx.fillStyle = textColor;
    ctx.fillText("Humidity %", paddingLeft + 163, 44);

    // Grid lines and axis values
    ctx.font = "11px Inter, Arial, sans-serif";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (i * chartHeight) / 4;

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(w - paddingRight, y);
      ctx.stroke();

      const tempValue = tempMax - ((tempMax - tempMin) * i) / 4;
      ctx.fillStyle = tempColor;
      ctx.textAlign = "right";
      ctx.fillText(tempValue.toFixed(1) + "°", paddingLeft - 10, y + 4);

      const humidityValue = humidityMax - ((humidityMax - humidityMin) * i) / 4;
      ctx.fillStyle = humidityColor;
      ctx.textAlign = "left";
      ctx.fillText(Math.round(humidityValue) + "%", w - paddingRight + 10, y + 4);
    }

    // Chart border
    ctx.strokeStyle = gridColor;
    ctx.strokeRect(paddingLeft, paddingTop, chartWidth, chartHeight);

    // X-axis labels
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.font = "11px Inter, Arial, sans-serif";

    chartLabels.forEach((label, i) => {
      const x = getX(i, chartLabels.length);
      ctx.fillText(label, x, h - 18);
    });

    function drawSmoothLine(data, color, getY) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      data.forEach((value, i) => {
        const x = getX(i, data.length);
        const y = getY(value);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = getX(i - 1, data.length);
          const prevY = getY(data[i - 1]);
          const midX = (prevX + x) / 2;

          ctx.bezierCurveTo(midX, prevY, midX, y, x, y);
        }
      });

      ctx.stroke();
    }

    function drawValueLabels(data, color, getY, unit) {
      data.forEach((value, i) => {
        if (i !== 0 && i !== data.length - 1) return;

        const x = getX(i, data.length);
        const y = getY(value);

        ctx.fillStyle = color;
        ctx.font = "600 11px Inter, Arial, sans-serif";
        ctx.textAlign = "center";

        let labelY = y - 10;

        if (labelY < paddingTop + 12) {
          labelY = y + 18;
        }

        ctx.fillText(value + unit, x, labelY);
      });
    }

    // Lines only, no circle points
    drawSmoothLine(tempData, tempColor, getTempY);
    drawSmoothLine(humidityData, humidityColor, getHumidityY);

    // Only first and latest values
    drawValueLabels(tempData, tempColor, getTempY, "°C");
    drawValueLabels(humidityData, humidityColor, getHumidityY, "%");

    // Axis titles
    ctx.font = "600 12px Inter, Arial, sans-serif";

    ctx.fillStyle = tempColor;
    ctx.textAlign = "left";
    ctx.fillText("Temp °C", 8, paddingTop - 10);

    ctx.fillStyle = humidityColor;
    ctx.textAlign = "right";
    ctx.fillText("Humidity %", w - 8, paddingTop - 10);
  }

  function renderCharts() {
    drawCombinedChart();
  }

  /* =========================
     DASHBOARD TEXT UPDATE
     ========================= */

  function updateTextData(data) {
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText("tempValue", data.temperature + "°C");
    setText("humidityValue", data.humidity + "%");
    setText("relayValue", data.relayStatus);
    setText("relayBadge", data.relayBadge);
    setText("motorValue", data.motorStatus);
    setText("motorSubtext", data.motorNote);
    setText("alertValue", data.alertStatus);
    setText("alertBadge", data.alertBadge);
    setText("systemValue", data.systemState);
    setText("hatchDayValue", data.predictedDay);
    setText("hatchDateValue", data.hatchDate);
    setText("lastUpdated", "Last updated: " + data.lastUpdated);
    setText("summaryTemp", data.summaryTemp);
    setText("summaryHumidity", data.summaryHumidity);
    setText("summaryRelay", data.summaryRelay);
    setText("summaryTurning", data.summaryTurning);
    setText("lastTurnValue", data.lastTurn);
    setText("lastAnomalyValue", data.lastAnomaly);
    setText("sensorStatusValue", data.sensorStatus);
    setText("wifiValue", data.wifiStatus);
    setText("wifiStatus", data.wifiStatus);

    const relayBadge = document.getElementById("relayBadge");
    if (relayBadge) {
      relayBadge.className = "status-pill " + (data.relayOn ? "status-on" : "status-off");
    }

    const alertBadge = document.getElementById("alertBadge");
    if (alertBadge) {
      alertBadge.className = "status-pill " + (data.alertNormal ? "status-normal" : "status-alert");
    }
  }

  function loadSampleData() {
    const sample = {
      temperature: 37.8,
      humidity: 58,
      relayStatus: "Heating ON",
      relayBadge: "Bulb Active",
      relayOn: true,
      motorStatus: "Idle",
      motorNote: "Next egg turning in 1 hr 20 min",
      alertStatus: "Normal",
      alertBadge: "No anomalies",
      alertNormal: true,
      systemState: "Running",
      predictedDay: "Day 21",
      hatchDate: "Estimated hatch date: May 02, 2026",
      lastUpdated: "10:42 AM",
      summaryTemp: "Stable",
      summaryHumidity: "Normal",
      summaryRelay: "Automatic",
      summaryTurning: "Enabled",
      lastTurn: "09:20 AM",
      lastAnomaly: "None",
      sensorStatus: "Connected",
      wifiStatus: "Online"
    };

    updateTextData(sample);
    renderCharts();
  }

  /* =========================
     ESP32 DATA FETCH
     ========================= */

  async function loadESP32Data() {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();

      updateTextData(data);

      // Recommended ESP32 format:
      // data.history.hour.labels
      // data.history.hour.temperature
      // data.history.hour.humidity
      if (
        data.history &&
        data.history.hour &&
        data.history.day &&
        data.history.week &&
        data.history.month
      ) {
        chartDataSets.hour = data.history.hour;
        chartDataSets.day = data.history.day;
        chartDataSets.week = data.history.week;
        chartDataSets.month = data.history.month;

        tempData = chartDataSets[currentRange].temperature;
        humidityData = chartDataSets[currentRange].humidity;
        chartLabels = chartDataSets[currentRange].labels;
      }

      // Backup format if ESP32 only sends simple history arrays
      else if (
        Array.isArray(data.temperatureHistory) &&
        Array.isArray(data.humidityHistory)
      ) {
        chartDataSets.hour.temperature = data.temperatureHistory;
        chartDataSets.hour.humidity = data.humidityHistory;

        if (currentRange === "hour") {
          tempData = data.temperatureHistory;
          humidityData = data.humidityHistory;
          chartLabels = chartDataSets.hour.labels;
        }
      }

      renderCharts();
    } catch (error) {
      console.log("Using sample data");
      loadSampleData();
    }
  }

  /* =========================
     FILTER BUTTONS
     ========================= */

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      setChartRange(button.dataset.range);
    });
  });

  loadESP32Data();
  setInterval(loadESP32Data, 5000);

  window.addEventListener("resize", function () {
    renderCharts();
  });
});