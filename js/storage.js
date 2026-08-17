/* ==========================================
   SentinelX — Client-Side Storage Engine
   ========================================== */

const StorageKeys = {
  ALERTS: 'sentinelx_alerts',
  INCIDENTS: 'sentinelx_incidents',
  ENDPOINTS: 'sentinelx_endpoints',
  LOGS: 'sentinelx_logs',
  THREATS: 'sentinelx_threats',
  NOTIFICATIONS: 'sentinelx_notifications',
  SETTINGS: 'sentinelx_settings',
  AUTH: 'sentinelx_auth_session'
};

const StorageEngine = {
  /**
   * Initialize LocalStorage with default demo data if missing or empty
   */
  initializeStorage() {
    try {
      if (!localStorage.getItem(StorageKeys.ALERTS)) {
        this.resetAllData();
      }
      if (!localStorage.getItem(StorageKeys.SETTINGS)) {
        this.saveSettings(this.getDefaultSettings());
      }
    } catch (e) {
      console.error('LocalStorage initialization error:', e);
    }
  },

  getDefaultSettings() {
    return {
      socName: 'Global SOC Operations Center',
      analystName: 'SOC Analyst Alpha',
      autoRefresh: true,
      liveMonitoring: true,
      refreshInterval: 5, // seconds
      alertThreshold: 'MEDIUM',
      theme: 'dark-cyber',
      notificationAlerts: true
    };
  },

  // Helper getters and setters
  getItem(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
      return false;
    }
  },

  // Alerts
  loadAlerts() { return this.getItem(StorageKeys.ALERTS, []); },
  saveAlerts(alerts) { return this.setItem(StorageKeys.ALERTS, alerts); },

  // Incidents
  loadIncidents() { return this.getItem(StorageKeys.INCIDENTS, []); },
  saveIncidents(incidents) { return this.setItem(StorageKeys.INCIDENTS, incidents); },

  // Endpoints
  loadEndpoints() { return this.getItem(StorageKeys.ENDPOINTS, []); },
  saveEndpoints(endpoints) { return this.setItem(StorageKeys.ENDPOINTS, endpoints); },

  // Logs
  loadLogs() { return this.getItem(StorageKeys.LOGS, []); },
  saveLogs(logs) { return this.setItem(StorageKeys.LOGS, logs); },

  // Threat Intel
  loadThreats() { return this.getItem(StorageKeys.THREATS, []); },
  saveThreats(threats) { return this.setItem(StorageKeys.THREATS, threats); },

  // Notifications
  loadNotifications() { return this.getItem(StorageKeys.NOTIFICATIONS, []); },
  saveNotifications(notifications) { return this.setItem(StorageKeys.NOTIFICATIONS, notifications); },

  // Settings
  getSettings() { return this.getItem(StorageKeys.SETTINGS, this.getDefaultSettings()); },
  saveSettings(settings) { return this.setItem(StorageKeys.SETTINGS, settings); },

  /**
   * Reset data back to initial deterministic demo dataset
   */
  resetAllData() {
    this.saveAlerts(DemoDataGenerator.generateAlerts(105));
    this.saveIncidents(DemoDataGenerator.generateIncidents(32));
    this.saveEndpoints(DemoDataGenerator.generateEndpoints(52));
    this.saveLogs(DemoDataGenerator.generateLogs(210));
    this.saveThreats(DemoDataGenerator.generateThreats(55));
    this.saveNotifications(DemoDataGenerator.generateNotifications(30));
    this.saveSettings(this.getDefaultSettings());
    console.log('SentinelX Demo Data successfully reset to factory state.');
  }
};

// Initialize immediately on script parse
StorageEngine.initializeStorage();
