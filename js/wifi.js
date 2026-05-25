const WIFI_KEY = "hatchaiWifi";
const ESP32_URLS = ["http://hatchai.local", "http://192.168.4.1"];

function getWifiElements() {
  return {
    wifiStatus: document.getElementById("wifiStatus"),
    wifiSsid: document.getElementById("wifiSsid"),
    wifiPassword: document.getElementById("wifiPassword"),
    wifiNetworkList: document.getElementById("wifiNetworkList"),
    espWifiBadge: document.getElementById("espWifiBadge"),
    espIpAddress: document.getElementById("espIpAddress"),
    espSignal: document.getElementById("espSignal")
  };
}

function setEspWifiState(label, statusClass, ip, signal) {
  const { wifiStatus, espWifiBadge, espIpAddress, espSignal } = getWifiElements();

  if (espWifiBadge) {
    espWifiBadge.textContent = label;
    espWifiBadge.className = `status-pill ${statusClass}`;
  }

  if (espIpAddress) espIpAddress.textContent = ip;
  if (espSignal) espSignal.textContent = signal;
  if (wifiStatus) wifiStatus.textContent = label === "Connected" ? "Online" : "Offline";
}

function toggleWifiPassword(event) {
  const { wifiPassword } = getWifiElements();
  if (!wifiPassword) return;

  const shouldShow = wifiPassword.type === "password";
  wifiPassword.type = shouldShow ? "text" : "password";
  event.currentTarget.textContent = shouldShow ? "Hide" : "Show";
}

function saveWifiSettings(setStatus) {
  const wifi = readWifiForm();

  if (!wifi.ssid) {
    notify(setStatus, "Please enter the Wi-Fi SSID before saving.", "#DC2626");
    return false;
  }

  saveData(WIFI_KEY, wifi);
  notify(setStatus, "Wi-Fi settings saved locally.", "#16A34A");
  return true;
}

async function scanWifiNetworks(setStatus) {
  const { wifiNetworkList } = getWifiElements();
  if (!wifiNetworkList) return;

  wifiNetworkList.replaceChildren(createWifiListItem("Scanning Wi-Fi networks..."));
  notify(setStatus, "Scanning Wi-Fi networks from ESP32...", "#D97706");

  for (const baseUrl of ESP32_URLS) {
    try {
      const response = await fetch(`${baseUrl}/scan-wifi`);
      const networks = await response.json();

      if (!Array.isArray(networks) || networks.length === 0) {
        wifiNetworkList.replaceChildren(createWifiListItem("No Wi-Fi networks found."));
        notify(setStatus, "No Wi-Fi networks found.", "#2563EB");
        return;
      }

      wifiNetworkList.replaceChildren(...networks.map(network => createNetworkItem(network, baseUrl, setStatus)));
      notify(setStatus, "Wi-Fi scan complete. Select a network from the list.", "#16A34A");
      return;
    } catch (error) {
      continue;
    }
  }

  wifiNetworkList.replaceChildren(
    createWifiListItem("Cannot scan. Make sure the ESP32 server is running at hatchai.local or 192.168.4.1.")
  );
  notify(setStatus, "Wi-Fi scan failed. Check ESP32 setup mode and /scan-wifi endpoint.", "#DC2626");
}

async function connectEspWifi(setStatus) {
  const { wifiSsid, wifiPassword } = getWifiElements();
  const ssid = wifiSsid ? wifiSsid.value.trim() : "";
  const password = wifiPassword ? wifiPassword.value : "";

  if (!ssid || !password) {
    setEspWifiState("Missing Info", "status-alert", "---", "---");
    notify(setStatus, "Enter both Wi-Fi SSID and password.", "#DC2626");
    return;
  }

  setEspWifiState("Connecting...", "status-warning", "---", "---");
  notify(setStatus, "Sending Wi-Fi details to ESP32...", "#D97706");

  for (const baseUrl of ESP32_URLS) {
    try {
      const response = await fetch(`${baseUrl}/connect-wifi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssid, password })
      });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "ESP32 could not connect.");
      }

      const wifi = {
        ssid,
        password,
        connected: true,
        server: baseUrl.replace("http://", ""),
        ip: result.ip || "192.168.1.25",
        signal: result.signal || "Connected"
      };

      saveData(WIFI_KEY, wifi);
      setEspWifiState("Connected", "status-ok", wifi.ip, wifi.signal);
      notify(setStatus, `ESP32 connected to ${ssid}.`, "#16A34A");
      return;
    } catch (error) {
      continue;
    }
  }

  setEspWifiState("Connection Failed", "status-alert", "---", "---");
  notify(setStatus, "Could not connect to ESP32. Make sure the setup network or hatchai.local is reachable.", "#DC2626");
}

function loadSavedWifi() {
  const savedWifi = loadData(WIFI_KEY);
  const { wifiSsid, wifiPassword } = getWifiElements();

  if (!savedWifi) {
    setEspWifiState("Disconnected", "status-alert", "---", "---");
    return;
  }

  if (wifiSsid) wifiSsid.value = savedWifi.ssid || "";
  if (wifiPassword) wifiPassword.value = savedWifi.password || "";

  if (savedWifi.connected) {
    setEspWifiState("Connected", "status-ok", savedWifi.ip || "---", savedWifi.signal || "---");
  } else if (savedWifi.selected) {
    setEspWifiState("Selected", "status-warning", savedWifi.server || "hatchai.local", savedWifi.signal || "Signal unknown");
  } else {
    setEspWifiState("Disconnected", "status-alert", "---", "---");
  }
}

function resetWifiState() {
  const { wifiSsid, wifiPassword, wifiNetworkList } = getWifiElements();

  if (wifiSsid) wifiSsid.value = "";
  if (wifiPassword) wifiPassword.value = "";
  if (wifiNetworkList) {
    wifiNetworkList.replaceChildren(
      createWifiListItem("No scan yet. Connect to the ESP32 setup Wi-Fi first, then click Scan Wi-Fi.")
    );
  }

  setEspWifiState("Disconnected", "status-alert", "---", "---");
  removeData(WIFI_KEY);
}

function readWifiForm() {
  const { wifiSsid, wifiPassword, espWifiBadge, espIpAddress, espSignal } = getWifiElements();

  return {
    ssid: wifiSsid ? wifiSsid.value.trim() : "",
    password: wifiPassword ? wifiPassword.value : "",
    connected: espWifiBadge ? espWifiBadge.textContent === "Connected" : false,
    ip: espIpAddress ? espIpAddress.textContent : "---",
    signal: espSignal ? espSignal.textContent : "---"
  };
}

function createNetworkItem(network, baseUrl, setStatus) {
  const ssid = String(network.ssid || "Hidden Network");
  const security = network.secure ? "Locked" : "Open";
  const signal = network.rssi !== undefined ? `${network.rssi} dBm` : "Signal unknown";
  const item = document.createElement("li");
  const button = document.createElement("button");
  const label = document.createElement("span");
  const rssi = document.createElement("span");

  button.type = "button";
  label.textContent = `${ssid} - ${security}`;
  rssi.textContent = signal;
  button.append(label, rssi);
  button.addEventListener("click", () => selectWifiNetwork({ ssid, signal, baseUrl }, setStatus));
  item.append(button);

  return item;
}

function selectWifiNetwork(network, setStatus) {
  const { wifiSsid } = getWifiElements();
  const server = network.baseUrl.replace("http://", "");

  if (wifiSsid) wifiSsid.value = network.ssid;

  saveData(WIFI_KEY, {
    ssid: network.ssid,
    signal: network.signal,
    server,
    selected: true,
    connected: false
  });

  setEspWifiState("Selected", "status-warning", server, network.signal);
  notify(setStatus, `Selected Wi-Fi network: ${network.ssid}.`, "#2563EB");
}

function createWifiListItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function notify(setStatus, message, color) {
  if (typeof setStatus === "function") {
    setStatus(message, color);
  }
}