const CONTROL_DEVICES = {
  bulb: {
    switchId: "bulbSwitch",
    cardId: "bulbCard",
    textId: "bulbText",
    summaryId: "summaryBulb",
    label: "Heating bulb",
    autoText: "Auto-controlled by temperature target",
    onText: "Heating bulb is ON",
    offText: "Heating bulb is OFF"
  },
  fan: {
    switchId: "fanSwitch",
    cardId: "fanCard",
    textId: "fanText",
    summaryId: "summaryFan",
    label: "Fan",
    autoText: "Auto-controlled for air circulation",
    onText: "Fan is ON",
    offText: "Fan is OFF"
  },
  turner: {
    switchId: "turnerSwitch",
    cardId: "turnerCard",
    textId: "turnerText",
    summaryId: "summaryTurner",
    label: "Egg turner",
    autoText: "Auto-controlled by turning interval",
    onText: "Egg turner is ON",
    offText: "Egg turner is OFF"
  }
};

const HatchControl = {
  elements: {},
  devices: {},
  pendingSwitch: null,

  init() {
    this.cacheElements();
    this.bindEvents();
    this.updateControlState();
  },

  cacheElements() {
    this.elements = {
      autoModeSwitch: HatchApp.get("autoModeSwitch"),
      turnEggBtn: HatchApp.get("turnEggBtn"),
      saveSettingsBtn: HatchApp.get("saveControlSettingsBtn"),
      controlStatusBadge: HatchApp.get("controlStatusBadge"),
      autoStateText: HatchApp.get("autoStateText"),
      autoDescription: HatchApp.get("autoDescription"),
      lockBadge: HatchApp.get("lockBadge"),
      summaryAuto: HatchApp.get("summaryAuto"),
      summaryLock: HatchApp.get("summaryLock"),
      lastTurnValue: HatchApp.get("lastTurnValue"),
      settingsStatus: HatchApp.get("settingsStatus")
    };

    this.devices = Object.fromEntries(
      Object.entries(CONTROL_DEVICES).map(([key, config]) => [
        key,
        {
          ...config,
          switch: HatchApp.get(config.switchId),
          card: HatchApp.get(config.cardId),
          text: HatchApp.get(config.textId),
          summary: HatchApp.get(config.summaryId)
        }
      ])
    );
  },

  confirmAction(options) {
    if (window.HatchModal?.open && HatchModal.open(options)) {
      return;
    }

    const fallbackConfirm = confirm(options.message || "Are you sure?");

    if (fallbackConfirm && typeof options.onConfirm === "function") {
      options.onConfirm();
    }
  },

  bindEvents() {
    this.elements.autoModeSwitch?.addEventListener("click", event => {
      this.confirmSwitchChange(event, {
        title: this.elements.autoModeSwitch.checked ? "Turn auto mode on?" : "Turn auto mode off?",
        message: this.elements.autoModeSwitch.checked
          ? "HatchAI will resume automatic control of the bulb, fan, and egg turner."
          : "Manual device controls will be unlocked until auto mode is turned back on.",
        confirmText: this.elements.autoModeSwitch.checked ? "Turn auto on" : "Turn auto off",
        confirmClass: "modal-btn-primary",
        onConfirm: () => this.updateControlState()
      });
    });

    Object.values(this.devices).forEach(device => {
      device.switch?.addEventListener("change", () => {
        this.updateControlState();
      });
    });

    this.elements.turnEggBtn?.addEventListener("click", () => {
      this.confirmAction({
        title: "Turn eggs now?",
        message: "This will run a manual egg turn cycle immediately.",
        confirmText: "Turn eggs",
        confirmClass: "modal-btn-primary",
        cancelText: "Cancel",
        onConfirm: () => this.turnEggsNow()
      });
    });

    this.elements.saveSettingsBtn?.addEventListener("click", () => {
      this.confirmAction({
        title: "Save control settings?",
        message: "This will save the target temperature, humidity, and egg turn interval.",
        confirmText: "Save settings",
        confirmClass: "modal-btn-primary",
        cancelText: "Cancel",
        onConfirm: () => this.saveSettings()
      });
    });
  },

  confirmSwitchChange(event, options) {
    const switchInput = event.currentTarget;
    const requestedValue = switchInput.checked;

    event.preventDefault();
    switchInput.checked = !requestedValue;

    this.confirmAction({
      ...options,
      cancelText: "Cancel",
      onConfirm: () => {
        switchInput.checked = requestedValue;
        options.onConfirm();
      }
    });
  },

  updateControlState() {
    const autoOn = this.elements.autoModeSwitch?.checked ?? true;

    Object.values(this.devices).forEach(device => {
      if (device.switch) {
        device.switch.disabled = autoOn;
      }

      device.card?.classList.toggle("locked", autoOn);
      this.updateDeviceText(device, autoOn);
    });

    if (this.elements.turnEggBtn) {
      this.elements.turnEggBtn.disabled = autoOn;
    }

    HatchApp.setText("controlStatusBadge", autoOn ? "Auto Mode: ON" : "Auto Mode: OFF");
    HatchApp.setText("autoStateText", autoOn ? "Auto ON" : "Auto OFF");
    HatchApp.setText(
      "autoDescription",
      autoOn
        ? "Manual controls are locked while automatic mode is active."
        : "Manual controls are now available for the bulb, fan, and egg turner."
    );
    HatchApp.setText("lockBadge", autoOn ? "Manual Controls Locked" : "Manual Controls Unlocked");
    HatchApp.setText("summaryAuto", autoOn ? "ON" : "OFF");
    HatchApp.setText("summaryLock", autoOn ? "Locked" : "Unlocked");

    if (this.elements.lockBadge) {
      this.elements.lockBadge.className = autoOn
        ? "status-pill status-ok"
        : "status-pill status-warning";
    }
  },

  updateDeviceText(device, autoOn) {
    if (!device.switch) return;

    const deviceOn = device.switch.checked;
    const statusText = autoOn ? "Auto" : (deviceOn ? "ON" : "OFF");
    const detailText = autoOn ? device.autoText : (deviceOn ? device.onText : device.offText);

    if (device.summary) {
      device.summary.textContent = statusText;
    }

    if (device.text) {
      device.text.textContent = detailText;
    }
  },

  turnEggsNow() {
    HatchApp.setText("lastTurnValue", "Just now");
    HatchApp.setText("turnerText", "Manual egg turn completed");
  },

  saveSettings() {
    HatchApp.setText("settingsStatus", "Saved just now");
    window.HatchToast?.success("Control settings saved.");

    setTimeout(() => {
      HatchApp.setText("settingsStatus", "Saved");
    }, 1800);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  HatchControl.init();
});
