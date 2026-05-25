const SETTINGS_KEYS = {
  account: "hatchaiAccount",
  password: "hatchaiPassword",
  settings: "hatchaiSettings"
};

const DEFAULT_ACCOUNT = {
  fullName: "Admin User",
  username: "admin"
};

const DEFAULT_SETTINGS = {
  temperatureOffset: "0.0",
  humidityOffset: "0",
  calibrationNote: ""
};

const STATUS_COLORS = {
  success: "#16A34A",
  info: "#2563EB",
  error: "#DC2626"
};

document.addEventListener("DOMContentLoaded", initSettingsPage);

function initSettingsPage() {
  bindSettingsActions();
  loadSavedSettings();
  loadSavedWifi();
}

function bindSettingsActions() {
  const actions = {
    "save-account": () => saveAccount(),
    "reset-account": resetAccount,
    "toggle-wifi-password": toggleWifiPassword,
    "connect-wifi": () => connectEspWifi(setStatus),
    "save-wifi": () => saveWifiSettings(setStatus),
    "disconnect-wifi": disconnectWifi,
    "scan-wifi": () => scanWifiNetworks(setStatus),
    "save-settings": saveSettings,
    "reset-settings": resetSettings,
    logout: logoutUser
  };

  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", event => {
      const handler = actions[event.currentTarget.dataset.action];
      if (handler) handler(event);
    });
  });
}

function saveSettings() {
  if (!saveAccount({ silent: true })) return;

  saveData(SETTINGS_KEYS.settings, readSettingsForm());
  saveWifiSettings(setStatus);
  setStatus("All settings saved successfully.", STATUS_COLORS.success);
}

function resetSettings() {
  setSettingsForm(DEFAULT_SETTINGS);
  removeData(SETTINGS_KEYS.settings);
  resetWifiState();
  setStatus("Settings reset to recommended incubator defaults.", STATUS_COLORS.info);
}

function saveAccount(options = {}) {
  const account = readAccountForm();
  const newPassword = getFieldValue("newPassword");
  const confirmPassword = getFieldValue("confirmPassword");

  if (!account.fullName || !account.username) {
    setStatus("Please complete full name and username.", STATUS_COLORS.error);
    return false;
  }

  if (newPassword || confirmPassword) {
    if (newPassword.length < 4) {
      setStatus("Password must be at least 4 characters.", STATUS_COLORS.error);
      return false;
    }

    if (newPassword !== confirmPassword) {
      setStatus("Passwords do not match.", STATUS_COLORS.error);
      return false;
    }

    localStorage.setItem(SETTINGS_KEYS.password, newPassword);
  }

  saveData(SETTINGS_KEYS.account, account);
  setFieldValue("newPassword", "");
  setFieldValue("confirmPassword", "");
  updateAccountDisplay(account);

  if (!options.silent) {
    setStatus("Account saved successfully.", STATUS_COLORS.success);
  }

  return true;
}

function resetAccount() {
  setAccountForm(DEFAULT_ACCOUNT);
  setFieldValue("newPassword", "");
  setFieldValue("confirmPassword", "");
  removeData(SETTINGS_KEYS.account);
  localStorage.removeItem(SETTINGS_KEYS.password);
  updateAccountDisplay(DEFAULT_ACCOUNT);
  setStatus("Account reset to default.", STATUS_COLORS.info);
}

function loadSavedSettings() {
  const account = { ...DEFAULT_ACCOUNT, ...loadData(SETTINGS_KEYS.account, {}) };
  const settings = { ...DEFAULT_SETTINGS, ...loadData(SETTINGS_KEYS.settings, {}) };

  setAccountForm(account);
  setSettingsForm(settings);
  updateAccountDisplay(account);
}

function readAccountForm() {
  return {
    fullName: getFieldValue("fullName").trim(),
    username: getFieldValue("username").trim()
  };
}

function setAccountForm(account) {
  setFieldValue("fullName", account.fullName);
  setFieldValue("username", account.username);
}

function readSettingsForm() {
  return {
    temperatureOffset: getFieldValue("temperatureOffset"),
    humidityOffset: getFieldValue("humidityOffset"),
    calibrationNote: getFieldValue("calibrationNote")
  };
}

function setSettingsForm(settings) {
  Object.entries(settings).forEach(([fieldId, value]) => {
    setFieldValue(fieldId, value);
  });
}

function updateAccountDisplay(account = readAccountForm()) {
  const fullName = account.fullName || DEFAULT_ACCOUNT.fullName;
  const username = account.username || DEFAULT_ACCOUNT.username;

  setText("accountDisplayName", fullName);
  setText("accountDisplayUsername", `@${username}`);
  setText("accountAvatar", fullName.charAt(0).toUpperCase());
}

function disconnectWifi() {
  resetWifiState();
  setStatus("ESP32 Wi-Fi disconnected.", STATUS_COLORS.info);
}

function logoutUser() {
  window.location.href = "index.html";
}

function setStatus(message, color) {
  const saveStatus = document.getElementById("saveStatus");
  if (!saveStatus) return;

  saveStatus.textContent = message;
  saveStatus.style.color = color;
}

function getFieldValue(id) {
  const field = document.getElementById(id);
  return field ? field.value : "";
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (field) field.value = value ?? "";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}