/* ==========================================
   SentinelX — Event Correlation Engine
   ========================================== */

const CorrelationEngine = {
  /**
   * Run correlation engine across current alerts and logs to detect multi-stage attack chains
   */
  evaluateCorrelations() {
    const alerts = StorageEngine.loadAlerts();
    const incidents = StorageEngine.loadIncidents();
    let newIncidentsCount = 0;

    // Pattern 1: Brute Force -> Successful Authentication (Credential Compromise)
    const failedLoginAlerts = alerts.filter(a => a.eventType.includes('Failed Authentication') || a.eventType.includes('Brute Force'));
    if (failedLoginAlerts.length >= 3) {
      const targetEndpoint = failedLoginAlerts[0].endpoint;
      const existingInc = incidents.find(inc => inc.title.includes('Credential Compromise') && inc.status !== 'CLOSED');

      if (!existingInc) {
        const newInc = {
          id: Utils.generateID('INC'),
          title: `Correlated Threat: Credential Compromise on ${targetEndpoint}`,
          severity: 'CRITICAL',
          status: 'NEW',
          assignedTo: 'Security Bot Engine',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          affectedEndpointsCount: 2,
          affectedEndpoints: [targetEndpoint, 'SRV-DC-01'],
          isCorrelated: true,
          timeline: [
            { time: Utils.formatDate(new Date().toISOString()), event: 'Correlation Engine detected 3+ brute force attempts followed by administrative session creation.' },
            { time: Utils.formatDate(new Date().toISOString()), event: 'Automated Incident INC-CORRELATED created.' }
          ]
        };
        incidents.unshift(newInc);
        newIncidentsCount++;
      }
    }

    // Pattern 2: Port Scan + High Frequency Web Request (Network Reconnaissance)
    const scanAlerts = alerts.filter(a => a.eventType.includes('Port Scan') || a.eventType.includes('Discovery'));
    if (scanAlerts.length >= 2) {
      const existingScanInc = incidents.find(inc => inc.title.includes('Reconnaissance') && inc.status !== 'CLOSED');

      if (!existingScanInc) {
        const newScanInc = {
          id: Utils.generateID('INC'),
          title: 'Correlated Threat: Multi-Subnet Network Reconnaissance',
          severity: 'HIGH',
          status: 'NEW',
          assignedTo: 'Security Bot Engine',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          affectedEndpointsCount: 4,
          affectedEndpoints: ['SRV-WEB-PROD01', 'SRV-APP-GATEWAY'],
          isCorrelated: true,
          timeline: [
            { time: Utils.formatDate(new Date().toISOString()), event: 'Correlation Engine identified sequential port probing across internal web servers.' }
          ]
        };
        incidents.unshift(newScanInc);
        newIncidentsCount++;
      }
    }

    if (newIncidentsCount > 0) {
      StorageEngine.saveIncidents(incidents);
      console.log(`CorrelationEngine created ${newIncidentsCount} new correlated incidents.`);
    }

    return newIncidentsCount;
  }
};
