/* ==========================================
   SentinelX — Settings & Reset Engine
   ========================================== */

const SettingsController = {
  init() {
    this.loadSettingsForm();
  },

  loadSettingsForm() {
    const settings = StorageEngine.getSettings();

    const socNameInput = document.getElementById('setting-soc-name');
    const analystNameInput = document.getElementById('setting-analyst-name');
    const liveMonitoringInput = document.getElementById('setting-live-monitoring');

    if (socNameInput) socNameInput.value = settings.socName;
    if (analystNameInput) analystNameInput.value = settings.analystName;
    if (liveMonitoringInput) liveMonitoringInput.checked = settings.liveMonitoring;
  },

  saveSettings(e) {
    if (e) e.preventDefault();
    const current = StorageEngine.getSettings();

    const updated = {
      ...current,
      socName: document.getElementById('setting-soc-name')?.value.trim() || current.socName,
      analystName: document.getElementById('setting-analyst-name')?.value.trim() || current.analystName,
      liveMonitoring: document.getElementById('setting-live-monitoring')?.checked ?? current.liveMonitoring
    };

    StorageEngine.saveSettings(updated);
    Notifications.showToast('SentinelX settings saved successfully', 'success');
    setTimeout(() => window.location.reload(), 800);
  },

  confirmResetDemoData() {
    if (confirm('Are you sure you want to reset all SentinelX data to default demo state? This will clear custom alerts, incidents, and IOCs.')) {
      StorageEngine.resetAllData();
      Notifications.showToast('Demo data reset to factory defaults', 'warning');
      setTimeout(() => window.location.reload(), 1000);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('settings-view-marker')) {
    SettingsController.init();
  }
});
