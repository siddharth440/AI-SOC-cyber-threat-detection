/* ==========================================
   SentinelX — MITRE ATT&CK Matrix Controller
   ========================================== */

const MitreController = {
  tactics: [
    { name: 'Initial Access', techniques: [{ id: 'T1190', name: 'Exploit Public App' }, { id: 'T1566', name: 'Phishing' }] },
    { name: 'Execution', techniques: [{ id: 'T1059', name: 'Command & Scripting' }, { id: 'T1204', name: 'User Execution' }] },
    { name: 'Persistence', techniques: [{ id: 'T1547', name: 'Boot/Logon Autostart' }, { id: 'T1136', name: 'Create Account' }] },
    { name: 'Privilege Escalation', techniques: [{ id: 'T1068', name: 'Exploitation for Priv Esc' }, { id: 'T1548', name: 'Abuse Control Mechanism' }] },
    { name: 'Defense Evasion', techniques: [{ id: 'T1027', name: 'Obfuscated Files/Info' }, { id: 'T1070', name: 'Indicator Removal' }] },
    { name: 'Credential Access', techniques: [{ id: 'T1110', name: 'Brute Force' }, { id: 'T1003', name: 'OS Credential Dumping' }] },
    { name: 'Discovery', techniques: [{ id: 'T1046', name: 'Network Service Scanning' }, { id: 'T1082', name: 'System Info Discovery' }] },
    { name: 'Lateral Movement', techniques: [{ id: 'T1021', name: 'Remote Services (RDP/SSH)' }] },
    { name: 'Command & Control', techniques: [{ id: 'T1071', name: 'App Layer Protocol' }, { id: 'T1572', name: 'Protocol Tunneling' }] },
    { name: 'Exfiltration', techniques: [{ id: 'T1020', name: 'Automated Exfiltration' }] }
  ],

  init() {
    this.renderMatrix();
  },

  renderMatrix() {
    const grid = document.getElementById('mitre-matrix-grid');
    if (!grid) return;

    const alerts = StorageEngine.loadAlerts();

    // Determine active techniques from current system alerts
    const activeTechniqueIds = new Set();
    alerts.forEach(a => {
      if (a.eventType.includes('Brute')) activeTechniqueIds.add('T1110');
      if (a.eventType.includes('PowerShell') || a.eventType.includes('Command')) activeTechniqueIds.add('T1059');
      if (a.eventType.includes('Port Scan') || a.eventType.includes('Scan')) activeTechniqueIds.add('T1046');
      if (a.eventType.includes('Exfiltration')) activeTechniqueIds.add('T1020');
      if (a.eventType.includes('Escalation')) activeTechniqueIds.add('T1068');
      if (a.eventType.includes('Phishing')) activeTechniqueIds.add('T1566');
    });

    grid.innerHTML = this.tactics.map(tactic => `
      <div class="mitre-column">
        <div class="mitre-column-header">${Utils.escapeHTML(tactic.name)}</div>
        <div style="display:flex; flex-direction:column;">
          ${tactic.techniques.map(tech => {
            const isActive = activeTechniqueIds.has(tech.id);
            return `
              <div class="mitre-technique-tile ${isActive ? 'active' : ''}" 
                onclick="MitreController.openTechniqueDetail('${tech.id}', '${Utils.escapeHTML(tech.name)}')">
                <div class="technique-id">${tech.id}</div>
                <div class="technique-name">${Utils.escapeHTML(tech.name)}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  },

  openTechniqueDetail(id, name) {
    const modalBody = document.getElementById('mitre-modal-body');
    const modalOverlay = document.getElementById('mitre-details-modal');
    if (!modalBody || !modalOverlay) return;

    modalBody.innerHTML = `
      <h3 style="color:var(--text-main); font-size:1.1rem; margin-bottom:8px;">${id}: ${name}</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
        Adversaries may use tactic patterns matching ${id} to gain unauthorized persistence or exfiltrate enterprise assets.
      </p>

      <div style="padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:var(--border-radius-sm);">
        <h4 style="font-size:0.82rem; color:var(--accent-cyan); margin-bottom:6px;">🛡️ MITRE Mitigation Strategy</h4>
        <ul style="padding-left:18px; font-size:0.85rem; color:var(--text-main);">
          <li>Enforce Multi-Factor Authentication (MFA) across all remote access gateways.</li>
          <li>Implement automated account lockout policies upon 5 consecutive failures.</li>
          <li>Restrict PowerShell script execution policies to signed binaries only.</li>
        </ul>
      </div>
    `;

    modalOverlay.classList.add('active');
  },

  closeModal() {
    const modalOverlay = document.getElementById('mitre-details-modal');
    if (modalOverlay) modalOverlay.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mitre-view-marker')) {
    MitreController.init();
  }
});
