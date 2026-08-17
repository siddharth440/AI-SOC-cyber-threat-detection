/* ==========================================
   SentinelX — Security Reports Generator Controller
   ========================================== */

const ReportsController = {
  init() {
    this.generateReport();
  },

  generateReport() {
    const reportContainer = document.getElementById('report-output-container');
    if (!reportContainer) return;

    const alerts = StorageEngine.loadAlerts();
    const incidents = StorageEngine.loadIncidents();
    const endpoints = StorageEngine.loadEndpoints();
    const settings = StorageEngine.getSettings();

    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
    const highCount = alerts.filter(a => a.severity === 'HIGH').length;
    const activeIncidents = incidents.filter(i => i.status !== 'CLOSED').length;
    const isolatedEndpoints = endpoints.filter(e => e.status === 'ISOLATED').length;

    let score = 100 - (criticalCount * 2.5 + activeIncidents * 3 + isolatedEndpoints * 4);
    score = Math.min(Math.max(Math.round(score), 25), 100);

    reportContainer.innerHTML = `
      <div class="glass-panel" style="padding:32px; background:var(--bg-card);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid var(--accent-cyan); padding-bottom:16px; margin-bottom:24px;">
          <div>
            <h1 style="font-size:1.8rem; font-weight:800; color:var(--text-main);">${Utils.escapeHTML(settings.socName)}</h1>
            <p style="color:var(--text-muted); font-size:0.9rem;">Executive Cyber Threat & Incident Security Summary</p>
          </div>
          <div style="text-align:right; font-size:0.85rem; color:var(--text-dim);">
            <div>Generated: ${new Date().toLocaleDateString()}</div>
            <div>Prepared By: <strong>${Utils.escapeHTML(settings.analystName)}</strong></div>
            <div>Classification: <strong>STRICTLY CONFIDENTIAL</strong></div>
          </div>
        </div>

        <h3 style="font-size:1.1rem; color:var(--accent-cyan); margin-bottom:12px;">1. Executive Security Health & Score</h3>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:24px; text-align:center;">
          <div style="padding:16px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Overall Score</div>
            <div style="font-size:2rem; font-weight:800; color:${score > 75 ? 'var(--severity-low)' : 'var(--severity-high)'};">${score} / 100</div>
          </div>
          <div style="padding:16px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Total Alerts</div>
            <div style="font-size:2rem; font-weight:800; color:var(--text-main);">${alerts.length}</div>
          </div>
          <div style="padding:16px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Critical Threats</div>
            <div style="font-size:2rem; font-weight:800; color:var(--severity-critical);">${criticalCount}</div>
          </div>
          <div style="padding:16px; background:rgba(0,0,0,0.3); border-radius:8px;">
            <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase;">Active Incidents</div>
            <div style="font-size:2rem; font-weight:800; color:var(--severity-high);">${activeIncidents}</div>
          </div>
        </div>

        <h3 style="font-size:1.1rem; color:var(--accent-cyan); margin-bottom:12px;">2. Incident Triage Summary</h3>
        <table class="data-table" style="margin-bottom:24px;">
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Assigned Analyst</th>
            </tr>
          </thead>
          <tbody>
            ${incidents.slice(0, 5).map(inc => `
              <tr>
                <td style="font-family:monospace; color:var(--accent-cyan);">${inc.id}</td>
                <td><strong>${Utils.escapeHTML(inc.title)}</strong></td>
                <td>${Utils.getSeverityBadge(inc.severity)}</td>
                <td>${Utils.getStatusBadge(inc.status)}</td>
                <td>${Utils.escapeHTML(inc.assignedTo)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="font-size:1.1rem; color:var(--accent-cyan); margin-bottom:12px;">3. Executive Remediation Recommendations</h3>
        <ol style="padding-left:20px; font-size:0.9rem; color:var(--text-main); line-height:1.6;">
          <li style="margin-bottom:8px;">Execute immediate network isolation on high-risk workstations showing anomalous C2 activity.</li>
          <li style="margin-bottom:8px;">Enforce strict rate-limiting on external RDP/SSH gateways to mitigate persistent brute-force telemetry.</li>
          <li style="margin-bottom:8px;">Deploy automated Endpoint Detection and Response (EDR) agents to unmanaged server subnets.</li>
        </ol>
      </div>
    `;
  },

  printReport() {
    window.print();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reports-view-marker')) {
    ReportsController.init();
  }
});
