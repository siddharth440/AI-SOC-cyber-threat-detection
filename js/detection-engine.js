/* ==========================================
   SentinelX — Explainable Threat Detection Engine
   ========================================== */

const DetectionEngine = {
  // Known threat datasets
  anomalousCountries: ['Russia', 'China', 'North Korea', 'Iran'],
  suspiciousPorts: [22, 445, 3389, 53, 8080, 4444],
  privilegedUsers: ['SYSTEM', 'root', 'administrator', 'sysadmin', 'db_admin'],
  highRiskEventKeywords: ['PowerShell', 'Exfiltration', 'Malware', 'SQL Injection', 'Privilege Escalation', 'Brute Force', 'Tunneling'],

  /**
   * Analyze raw telemetry object and generate explainable risk score & verdict
   */
  analyze(eventData) {
    let riskScore = 0;
    const reasons = [];

    const failedLogins = eventData.failedLogins || 0;
    const requestCount = eventData.requestCount || 0;
    const country = eventData.country || '';
    const port = parseInt(eventData.port || 0, 10);
    const user = (eventData.user || '').toLowerCase();
    const eventType = eventData.eventType || eventData.event || '';
    const sourceIp = eventData.sourceIP || eventData.sourceIp || '';

    // 1. Failed Login Attempts
    if (failedLogins > 0) {
      const loginScore = Math.min(failedLogins * 5, 30);
      riskScore += loginScore;
      reasons.push(`Multiple failed authentication attempts observed (${failedLogins} attempts, +${loginScore} pts)`);
    }

    // 2. Anomalous Country
    if (this.anomalousCountries.some(c => country.toLowerCase().includes(c.toLowerCase()))) {
      riskScore += 15;
      reasons.push(`Traffic originated from high-risk / anomalous geographic region (${country}, +15 pts)`);
    }

    // 3. Known Malicious IP or Threat Intel Indicator
    const threats = StorageEngine.loadThreats();
    const matchedIOC = threats.find(t => t.ioc === sourceIp && t.status === 'MALICIOUS');
    if (matchedIOC) {
      riskScore += 30;
      reasons.push(`Source IP matched known Malicious Threat Intelligence indicator (${matchedIOC.threatName}, +30 pts)`);
    }

    // 4. Suspicious Target Port
    if (this.suspiciousPorts.includes(port)) {
      riskScore += 10;
      reasons.push(`Target port ${port} is associated with high-risk management or C2 services (+10 pts)`);
    }

    // 5. High Request Frequency
    if (requestCount > 150) {
      riskScore += 15;
      reasons.push(`Abnormally high request frequency detected (${requestCount} req/min, +15 pts)`);
    }

    // 6. Privileged User Target
    if (this.privilegedUsers.some(pu => user.includes(pu))) {
      riskScore += 10;
      reasons.push(`Activity targeted privileged account identity (${user}, +10 pts)`);
    }

    // 7. High Risk Event Pattern / Command Keyword
    if (this.highRiskEventKeywords.some(kw => eventType.toLowerCase().includes(kw.toLowerCase()))) {
      riskScore += 20;
      reasons.push(`Event pattern matched high-risk cyber attack indicator (${eventType}, +20 pts)`);
    }

    // Baseline fallback if score is low but event exists
    if (riskScore === 0) {
      riskScore = 15;
      reasons.push('Standard low-priority audit event anomaly');
    }

    // Clamp score between 0 and 100
    riskScore = Math.min(Math.max(riskScore, 0), 100);

    // Determine Severity
    let severity = 'LOW';
    if (riskScore >= 80) severity = 'CRITICAL';
    else if (riskScore >= 60) severity = 'HIGH';
    else if (riskScore >= 30) severity = 'MEDIUM';

    // Determine Classification Category
    let classification = 'Reconnaissance & Anomaly';
    if (eventType.includes('Brute Force') || failedLogins > 5) classification = 'Credential Attack';
    else if (eventType.includes('PowerShell') || eventType.includes('Malware')) classification = 'Execution & Defense Evasion';
    else if (eventType.includes('Exfiltration')) classification = 'Data Exfiltration';
    else if (eventType.includes('SQL')) classification = 'Web Application Attack';

    // Calculate Confidence Percentage based on evidence count
    const confidence = Math.min(70 + reasons.length * 7, 98);

    // Formulate Actionable Recommendation
    let recommendation = 'Monitor endpoint telemetry for follow-up anomalies.';
    if (severity === 'CRITICAL') {
      recommendation = 'IMMEDIATE ACTION REQUIRED: Isolate endpoint from network, revoke user sessions, and initiate incident triage.';
    } else if (severity === 'HIGH') {
      recommendation = 'Escalate alert to SOC Tier 2 analyst and inspect recent endpoint process executions.';
    } else if (severity === 'MEDIUM') {
      recommendation = 'Verify authentication logs and check source IP against firewall blocklists.';
    }

    return {
      riskScore,
      severity,
      confidence,
      classification,
      reasons,
      recommendation
    };
  }
};
