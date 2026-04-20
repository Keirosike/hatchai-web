document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const status = document.getElementById("status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    if (!user || !pass) {
      status.textContent = "Please fill all fields";
      status.className = "status error";
      return;
    }

    // Demo login
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
});
 const tempCanvas = document.getElementById("tempChart");
    const humidityCanvas = document.getElementById("humidityChart");
    const tempCtx = tempCanvas.getContext("2d");
    const humidityCtx = humidityCanvas.getContext("2d");

    let tempData = [37.4, 37.5, 37.6, 37.8, 37.7, 37.9, 38.0, 37.8];
    let humidityData = [55, 56, 57, 58, 57, 59, 60, 58];

    function drawLineChart(ctx, canvas, data, lineColor, unit) {
      const w = canvas.width;
      const h = canvas.height;
      const padding = 34;

      ctx.clearRect(0, 0, w, h);

      const min = Math.min(...data) - 1;
      const max = Math.max(...data) + 1;

      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;

      for (let i = 0; i < 5; i++) {
        const y = padding + ((h - padding * 2) / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
        ctx.stroke();
      }

      ctx.fillStyle = "#4B5563";
      ctx.font = "12px Inter, Arial, sans-serif";

      for (let i = 0; i < 5; i++) {
        const value = (max - ((max - min) / 4) * i).toFixed(1);
        const y = padding + ((h - padding * 2) / 4) * i;
        ctx.fillText(value + unit, 2, y + 4);
      }

      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 3;

      data.forEach((value, i) => {
        const x = padding + (i * (w - padding * 2)) / (data.length - 1);
        const y = h - padding - ((value - min) / (max - min)) * (h - padding * 2);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      data.forEach((value, i) => {
        const x = padding + (i * (w - padding * 2)) / (data.length - 1);
        const y = h - padding - ((value - min) / (max - min)) * (h - padding * 2);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
      });
    }

    function renderCharts() {
      drawLineChart(tempCtx, tempCanvas, tempData, "#D97706", "°");
      drawLineChart(humidityCtx, humidityCanvas, humidityData, "#B45309", "%");
    }

    function updateTextData(data) {
      document.getElementById("tempValue").textContent = data.temperature + "°C";
      document.getElementById("humidityValue").textContent = data.humidity + "%";
      document.getElementById("relayValue").textContent = data.relayStatus;
      document.getElementById("relayBadge").textContent = data.relayBadge;
      document.getElementById("motorValue").textContent = data.motorStatus;
      document.getElementById("motorSubtext").textContent = data.motorNote;
      document.getElementById("alertValue").textContent = data.alertStatus;
      document.getElementById("alertBadge").textContent = data.alertBadge;
      document.getElementById("systemValue").textContent = data.systemState;
      document.getElementById("hatchDayValue").textContent = data.predictedDay;
      document.getElementById("hatchDateValue").textContent = data.hatchDate;
      document.getElementById("lastUpdated").textContent = "Last updated: " + data.lastUpdated;
      document.getElementById("summaryTemp").textContent = data.summaryTemp;
      document.getElementById("summaryHumidity").textContent = data.summaryHumidity;
      document.getElementById("summaryRelay").textContent = data.summaryRelay;
      document.getElementById("summaryTurning").textContent = data.summaryTurning;
      document.getElementById("lastTurnValue").textContent = data.lastTurn;
      document.getElementById("lastAnomalyValue").textContent = data.lastAnomaly;
      document.getElementById("sensorStatusValue").textContent = data.sensorStatus;
      document.getElementById("wifiValue").textContent = data.wifiStatus;
      document.getElementById("wifiStatus").textContent = data.wifiStatus;

      const relayBadge = document.getElementById("relayBadge");
      relayBadge.className = "status-pill " + (data.relayOn ? "status-on" : "status-off");

      const alertBadge = document.getElementById("alertBadge");
      alertBadge.className = "status-pill " + (data.alertNormal ? "status-normal" : "status-alert");
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

    // ESP32 fetch example:
    // Your ESP32 should return JSON like:
    // {
    //   "temperature": 37.8,
    //   "humidity": 58,
    //   "relayStatus": "Heating ON",
    //   "relayBadge": "Bulb Active",
    //   "relayOn": true,
    //   "motorStatus": "Idle",
    //   "motorNote": "Next egg turning in 1 hr 20 min",
    //   "alertStatus": "Normal",
    //   "alertBadge": "No anomalies",
    //   "alertNormal": true,
    //   "systemState": "Running",
    //   "predictedDay": "Day 21",
    //   "hatchDate": "Estimated hatch date: May 02, 2026",
    //   "lastUpdated": "10:42 AM",
    //   "summaryTemp": "Stable",
    //   "summaryHumidity": "Normal",
    //   "summaryRelay": "Automatic",
    //   "summaryTurning": "Enabled",
    //   "lastTurn": "09:20 AM",
    //   "lastAnomaly": "None",
    //   "sensorStatus": "Connected",
    //   "wifiStatus": "Online",
    //   "temperatureHistory": [37.4, 37.5, 37.6, 37.8, 37.7, 37.9, 38.0, 37.8],
    //   "humidityHistory": [55, 56, 57, 58, 57, 59, 60, 58]
    // }

    async function loadESP32Data() {
      try {
        const res = await fetch("/api/data");
        const data = await res.json();

        updateTextData(data);

        if (Array.isArray(data.temperatureHistory) && data.temperatureHistory.length > 1) {
          tempData = data.temperatureHistory;
        }

        if (Array.isArray(data.humidityHistory) && data.humidityHistory.length > 1) {
          humidityData = data.humidityHistory;
        }

        renderCharts();
      } catch (error) {
        console.log("Using sample data");
        loadSampleData();
      }
    }

    loadESP32Data();
    setInterval(loadESP32Data, 5000);