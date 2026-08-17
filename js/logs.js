/* ==========================================
   SentinelX — Security Log Analyzer Controller
   ========================================== */

const LogsController = {
  init() {
    this.renderLogsTable();
  },

  renderLogsTable() {
    const tableBody = document.getElementById('logs-table-body');
    if (!tableBody) return;

    let logs = StorageEngine.loadLogs();
    const searchQuery = (document.getElementById('logs-search')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('logs-type-filter')?.value || 'ALL';

    logs = logs.filter(l => {
      const matchSearch = !searchQuery || l.event.toLowerCase().includes(searchQuery) || l.sourceIP.includes(searchQuery) || l.source.toLowerCase().includes(searchQuery);
      const matchType = typeFilter === 'ALL' || l.logType === typeFilter;
      return matchSearch && matchType;
    });

    if (logs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">No system logs found matching filter</td></tr>`;
      return;
    }

    tableBody.innerHTML = logs.slice(0, 50).map(l => `
      <tr>
        <td style="font-family:monospace; font-size:0.78rem; color:var(--text-muted);">${Utils.formatDate(l.timestamp)}</td>
        <td><span class="badge badge-info">${Utils.escapeHTML(l.logType)}</span></td>
        <td><strong style="color:var(--text-main);">${Utils.escapeHTML(l.event)}</strong></td>
        <td>${l.sourceIP}</td>
        <td>${Utils.escapeHTML(l.user)}</td>
        <td>${Utils.getSeverityBadge(l.severity)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="LogsController.analyzeLog('${l.id}')">⚡ Analyze Log</button>
        </td>
      </tr>
    `).join('');
  },

  analyzeLog(logId) {
    const logs = StorageEngine.loadLogs();
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    // Run explainable detection engine on target log record
    const analysis = DetectionEngine.analyze({
      sourceIP: log.sourceIP,
      destinationIP: log.destinationIP || '10.0.1.50',
      port: log.event.includes('SSH') ? 22 : 443,
      protocol: 'TCP',
      failedLogins: log.event.includes('FAILED') ? 7 : 0,
      requestCount: log.event.includes('ATTACK') ? 320 : 15,
      country: log.sourceIP.startsWith('198.51') ? 'Russia' : 'United States',
      eventType: log.event,
      user: log.user
    });

    const modalBody = document.getElementById('log-analysis-modal-body');
    const modalOverlay = document.getElementById('log-analysis-modal');
    if (!modalBody || !modalOverlay) return;

    modalBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="color:var(--text-main); font-size:1.05rem;">Log Analysis Result (${log.id})</h3>
        ${Utils.getSeverityBadge(analysis.severity)}
      </div>

      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">
        Category: <strong style="color:var(--accent-cyan);">${analysis.classification}</strong> | 
        Risk Score: <strong style="color:var(--severity-critical);">${analysis.riskScore} / 100</strong> | 
        Confidence: <strong>${analysis.confidence}%</strong>
      </div>

      <div style="padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:var(--border-radius-sm); margin-bottom:12px;">
        <h4 style="font-size:0.82rem; text-transform:uppercase; color:var(--accent-cyan); margin-bottom:6px;">🔎 Why was this flagged?</h4>
        <ul style="padding-left:18px; font-size:0.85rem; color:var(--text-main);">
          ${analysis.reasons.map(r => `<li>${Utils.escapeHTML(r)}</li>`).join('')}
        </ul>
      </div>

      <div style="padding:12px; background:var(--severity-high-bg); border:1px solid rgba(249,115,22,0.3); border-radius:var(--border-radius-sm);">
        <h4 style="font-size:0.82rem; text-transform:uppercase; color:var(--severity-high); margin-bottom:4px;">🛡️ Recommendation</h4>
        <p style="font-size:0.85rem; color:var(--text-main);">${Utils.escapeHTML(analysis.recommendation)}</p>
      </div>
    `;

    modalOverlay.classList.add('active');
  },

  closeModal() {
    const modalOverlay = document.getElementById('log-analysis-modal');
    if (modalOverlay) modalOverlay.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('logs-view-marker')) {
    LogsController.init();
  }
});
