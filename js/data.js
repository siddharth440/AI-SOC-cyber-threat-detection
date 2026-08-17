/* ==========================================
   SentinelX — Deterministic Demo Data Generator
   ========================================== */

const DemoDataGenerator = {
  // Master dictionaries for reproducible telemetry generation
  eventTypes: [
    { type: 'Brute Force Attack', cat: 'Credential Access', baseSev: 'HIGH', port: 22, proto: 'SSH' },
    { type: 'Suspicious PowerShell Activity', cat: 'Execution', baseSev: 'HIGH', port: 445, proto: 'SMB' },
    { type: 'Port Scan Detected', cat: 'Discovery', baseSev: 'MEDIUM', port: 80, proto: 'TCP' },
    { type: 'Failed Authentication', cat: 'Credential Access', baseSev: 'LOW', port: 443, proto: 'HTTPS' },
    { type: 'SQL Injection Attempt', cat: 'Initial Access', baseSev: 'HIGH', port: 443, proto: 'HTTPS' },
    { type: 'Malware Execution', cat: 'Defense Evasion', baseSev: 'CRITICAL', port: 8080, proto: 'HTTP' },
    { type: 'DNS Tunneling Probe', cat: 'Command and Control', baseSev: 'HIGH', port: 53, proto: 'DNS' },
    { type: 'Data Exfiltration via HTTPS', cat: 'Exfiltration', baseSev: 'CRITICAL', port: 443, proto: 'HTTPS' },
    { type: 'Unauthorized Privileged Escalation', cat: 'Privilege Escalation', baseSev: 'CRITICAL', port: 3389, proto: 'RDP' },
    { type: 'Phishing Link Interaction', cat: 'Initial Access', baseSev: 'MEDIUM', port: 80, proto: 'HTTP' }
  ],

  countries: [
    { name: 'United States', code: 'US', isAnomaly: false },
    { name: 'Germany', code: 'DE', isAnomaly: false },
    { name: 'United Kingdom', code: 'GB', isAnomaly: false },
    { name: 'Russia', code: 'RU', isAnomaly: true },
    { name: 'China', code: 'CN', isAnomaly: true },
    { name: 'North Korea', code: 'KP', isAnomaly: true },
    { name: 'Iran', code: 'IR', isAnomaly: true },
    { name: 'Brazil', code: 'BR', isAnomaly: false }
  ],

  endpointsList: [
    { name: 'WKSTN-FIN-01', ip: '10.0.4.12', os: 'Windows 11 Enterprise', user: 'sarah.jenkins' },
    { name: 'WKSTN-FIN-02', ip: '10.0.4.15', os: 'Windows 11 Enterprise', user: 'mark.davis' },
    { name: 'SRV-DB-PRIMARY', ip: '10.0.1.50', os: 'Ubuntu Server 22.04 LTS', user: 'sysadmin_db' },
    { name: 'SRV-WEB-PROD01', ip: '10.0.2.10', os: 'Red Hat Enterprise Linux 9', user: 'www-data' },
    { name: 'WKSTN-EXEC-01', ip: '10.0.4.101', os: 'macOS Sequoia 15.1', user: 'ceo.office' },
    { name: 'SRV-DC-01', ip: '10.0.1.4', os: 'Windows Server 2022', user: 'SYSTEM' },
    { name: 'WKSTN-DEV-44', ip: '10.0.4.88', os: 'Ubuntu 24.04 Desktop', user: 'alex.code' },
    { name: 'SRV-APP-GATEWAY', ip: '10.0.2.20', os: 'Debian 12 Bookworm', user: 'nginx' }
  ],

  analysts: ['SOC Analyst Alpha', 'Senior Threat Analyst', 'Lead Investigator', 'Security Bot Engine'],

  generateAlerts(count = 105) {
    const alerts = [];
    const statuses = ['NEW', 'ACKNOWLEDGED', 'ESCALATED', 'RESOLVED'];
    const now = new Date();

    for (let i = 1; i <= count; i++) {
      const evt = this.eventTypes[i % this.eventTypes.length];
      const countryObj = this.countries[(i * 3) % this.countries.length];
      const endp = this.endpointsList[i % this.endpointsList.length];
      
      const timeAgoMinutes = i * 15;
      const timestamp = new Date(now.getTime() - timeAgoMinutes * 60000).toISOString();

      let riskScore = 20 + ((i * 13) % 75);
      if (evt.baseSev === 'CRITICAL') riskScore = Math.max(riskScore, 85);
      if (evt.baseSev === 'HIGH') riskScore = Math.max(riskScore, 65);

      let severity = 'LOW';
      if (riskScore >= 80) severity = 'CRITICAL';
      else if (riskScore >= 60) severity = 'HIGH';
      else if (riskScore >= 30) severity = 'MEDIUM';

      const srcIP = countryObj.isAnomaly ? `198.51.100.${(i * 7) % 250}` : `192.168.1.${(i * 5) % 250}`;

      alerts.push({
        id: `ALT-${2000 + i}`,
        timestamp,
        sourceIp: srcIP,
        destinationIp: endp.ip,
        country: countryObj.name,
        countryCode: countryObj.code,
        eventType: evt.type,
        category: evt.cat,
        severity,
        riskScore,
        confidence: 75 + (i % 25),
        status: statuses[i % statuses.length],
        endpoint: endp.name,
        user: endp.user,
        protocol: evt.proto,
        port: evt.port,
        reasons: [
          `Telemetry matched pattern for ${evt.type}`,
          countryObj.isAnomaly ? `Connection originated from anomalous region (${countryObj.name})` : 'High traffic request velocity',
          riskScore > 70 ? 'Target host contains sensitive database assets' : 'Standard endpoint telemetry alert'
        ],
        recommendation: `Inspect ${endp.name} processes and consider network boundary isolation.`
      });
    }
    return alerts;
  },

  generateIncidents(count = 32) {
    const incidents = [];
    const statuses = ['NEW', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'];
    const now = new Date();

    const incidentTitles = [
      'Credential Compromise via Brute Force',
      'Potential Ransomware Execution on Workstation',
      'Database Exfiltration Attempt Detected',
      'Lateral Movement via RDP Session',
      'Command & Control Channel Established',
      'Phishing Campaign User Credential Theft',
      'Web Application Exploitation (SQLi)',
      'Suspicious Administrative Privilege Escalation'
    ];

    for (let i = 1; i <= count; i++) {
      const status = statuses[i % statuses.length];
      const title = incidentTitles[i % incidentTitles.length];
      const severity = i % 4 === 0 ? 'CRITICAL' : i % 3 === 0 ? 'HIGH' : 'MEDIUM';
      const timestamp = new Date(now.getTime() - i * 180 * 60000).toISOString();

      incidents.push({
        id: `INC-${1000 + i}`,
        title,
        severity,
        status,
        assignedTo: this.analysts[i % this.analysts.length],
        createdAt: timestamp,
        updatedAt: timestamp,
        affectedEndpointsCount: (i % 4) + 1,
        affectedEndpoints: ['WKSTN-FIN-01', 'SRV-DB-PRIMARY'],
        isCorrelated: i % 2 === 0,
        timeline: [
          { time: Utils.formatDate(timestamp), event: 'Suspicious alert threshold exceeded' },
          { time: Utils.formatDate(timestamp), event: 'Automated correlation engine triggered Incident creation' },
          { time: Utils.formatDate(timestamp), event: `Assigned to ${this.analysts[i % this.analysts.length]}` }
        ]
      });
    }
    return incidents;
  },

  generateEndpoints(count = 52) {
    const endpoints = [];
    const osTypes = ['Windows 11 Enterprise', 'Ubuntu Server 22.04 LTS', 'macOS Sequoia', 'Red Hat Enterprise Linux 9'];
    const statuses = ['ONLINE', 'ONLINE', 'ONLINE', 'AT RISK', 'OFFLINE', 'ISOLATED'];

    for (let i = 1; i <= count; i++) {
      const os = osTypes[i % osTypes.length];
      const status = statuses[i % statuses.length];
      const ip = `10.0.${Math.floor(i / 10)}.${(i * 12) % 250}`;
      const name = i <= 8 ? this.endpointsList[(i - 1) % 8].name : `EP-NODE-${100 + i}`;

      endpoints.push({
        id: `EP-${5000 + i}`,
        hostname: name,
        ip,
        os,
        user: `user.${i}@sentinelx.local`,
        status,
        cpuUsage: 12 + ((i * 7) % 80),
        memoryUsage: 30 + ((i * 11) % 60),
        networkTrafficMB: (i * 14.5).toFixed(1),
        riskScore: status === 'AT RISK' ? 78 : status === 'ISOLATED' ? 92 : (i * 3) % 40,
        lastSeen: new Date().toISOString(),
        auditEventsCount: (i * 4) % 30
      });
    }
    return endpoints;
  },

  generateLogs(count = 210) {
    const logs = [];
    const logTypes = ['Authentication', 'Firewall', 'DNS', 'Network', 'Endpoint', 'Web Server'];
    const actions = ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'PACKET_DROP', 'DNS_QUERY', 'PROCESS_SPAWN', 'HTTP_200', 'HTTP_500_ATTACK'];
    const now = new Date();

    for (let i = 1; i <= count; i++) {
      const logType = logTypes[i % logTypes.length];
      const action = actions[i % actions.length];
      const timestamp = new Date(now.getTime() - i * 3 * 60000).toISOString();
      const ip = `198.51.100.${(i * 9) % 250}`;

      logs.push({
        id: `LOG-${10000 + i}`,
        timestamp,
        logType,
        source: `${logType.toUpperCase()}_SERVICE`,
        event: action,
        sourceIP: ip,
        destinationIP: '10.0.1.50',
        user: `analyst_${i % 10}@sentinelx.local`,
        severity: action.includes('FAILED') || action.includes('ATTACK') ? 'HIGH' : 'LOW',
        rawDetails: `EventID=${i * 102} Proto=TCP Src=${ip} Dst=10.0.1.50 Status=${action}`
      });
    }
    return logs;
  },

  generateThreats(count = 55) {
    const threats = [];
    const types = ['IP', 'DOMAIN', 'HASH', 'URL'];
    const threatNames = ['APT29 C2 Node', 'Emotet Payload Host', 'Phishing Landing Kit', 'Lazarus RAT Hash', 'LockBit Encrypter'];

    for (let i = 1; i <= count; i++) {
      const type = types[i % types.length];
      let iocValue = `198.51.100.${i * 4}`;
      if (type === 'DOMAIN') iocValue = `malicious-domain-${i}.ru`;
      else if (type === 'HASH') iocValue = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8${i % 10}`;
      else if (type === 'URL') iocValue = `http://phish-login-update-${i}.com/auth`;

      threats.push({
        id: `IOC-${8000 + i}`,
        ioc: iocValue,
        type,
        threatName: threatNames[i % threatNames.length],
        confidence: 80 + (i % 20),
        firstSeen: '2026-07-01',
        lastSeen: '2026-08-08',
        status: i % 7 === 0 ? 'FALSE POSITIVE' : 'MALICIOUS'
      });
    }
    return threats;
  },

  generateNotifications(count = 30) {
    const notifications = [];
    const now = new Date();
    const titles = [
      'Critical Alert Detected: Data Exfiltration',
      'Incident ESC-1002 Escalated to Senior Analyst',
      'Endpoint SRV-DB-PRIMARY Isolated Successfully',
      'New High Confidence IOC Matched in DNS Logs',
      'Security Score updated: 87/100'
    ];

    for (let i = 1; i <= count; i++) {
      notifications.push({
        id: `NTF-${3000 + i}`,
        title: titles[i % titles.length],
        timestamp: new Date(now.getTime() - i * 45 * 60000).toISOString(),
        read: i > 5,
        type: i % 3 === 0 ? 'CRITICAL' : 'INFO'
      });
    }
    return notifications;
  }
};
