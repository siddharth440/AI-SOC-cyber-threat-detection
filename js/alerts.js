/* ==========================================
   SentinelX — Alerts View Controller & Detail Modal
   ========================================== */

const AlertsController = {
  currentPage: 1,
  pageSize: 12,
  currentSort: { field: 'timestamp', dir: 'desc' },

  init() {
    this.renderAlertsTable();
    this.bindEvents();
  },

  bindEvents() {
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'alerts-search') {
        this.currentPage = 1;
        this.renderAlertsTable();
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target && (e.target.id === 'severity-filter' || e.target.id === 'status-filter')) {
        this.currentPage = 1;
        this.renderAlertsTable();
      }
    });
  },

  renderAlertsTable() {
    const tableBody = document.getElementById('alerts-table-body');
    if (!tableBody) return;

    let alerts = StorageEngine.loadAlerts();

    // Filters
    const searchQuery = (document.getElementById('alerts-search')?.value || '').toLowerCase();
    const severityFilter = document.getElementById('severity-filter')?.value || 'ALL';
    const statusFilter = document.getElementById('status-filter')?.value || 'ALL';

    alerts = alerts.filter(a => {
      const matchesSearch = !searchQuery || 
        a.id.toLowerCase().includes(searchQuery) ||
        a.eventType.toLowerCase().includes(searchQuery) ||
        a.sourceIp.toLowerCase().includes(searchQuery) ||
        a.endpoint.toLowerCase().includes(searchQuery);

      const matchesSev = severityFilter === 'ALL' || a.severity === severityFilter;
      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

      return matchesSearch && matchesSev && matchesStatus;
    });

    // Pagination
    const totalRecords = alerts.length;
    const totalPages = Math.ceil(totalRecords / this.pageSize) || 1;
    this.currentPage = Math.min(this.currentPage, totalPages);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginated = alerts.slice(startIndex, startIndex + this.pageSize);

    if (paginated.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-muted);">No security alerts found matching filter criteria</td></tr>`;
      return;
    }

    tableBody.innerHTML = paginated.map(a => `
      <tr>
        <td style="font-family:monospace; font-weight:700; color:var(--accent-cyan);">${a.id}</td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${Utils.formatDate(a.timestamp)}</td>
        <td>${a.sourceIp}</td>
        <td><strong style="color:var(--text-main);">${Utils.escapeHTML(a.eventType)}</strong></td>
        <td>${Utils.getSeverityBadge(a.severity)}</td>
        <td><strong style="color:${a.riskScore > 75 ? 'var(--severity-critical)' : 'var(--accent-cyan)'}">${a.riskScore}</strong> / 100</td>
        <td>${a.confidence}%</td>
        <td>${Utils.getStatusBadge(a.status)}</td>
        <td>${Utils.escapeHTML(a.endpoint)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="AlertsController.openDetailsModal('${a.id}')">
            🔍 Details
          </button>
        </td>
      </tr>
    `).join('');

    // Render Pagination Controls
    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
      paginationInfo.textContent = `Showing ${startIndex + 1}–${Math.min(startIndex + this.pageSize, totalRecords)} of ${totalRecords} alerts`;
    }
  },

  openDetailsModal(alertId) {
    const alerts = StorageEngine.loadAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const modalBody = document.getElementById('alert-modal-body');
    const modalOverlay = document.getElementById('alert-details-modal');
    if (!modalBody || !modalOverlay) return;

    modalBody.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; font-size:0.88rem;">
        <div><strong>Alert ID:</strong> <span style="font-family:monospace; color:var(--accent-cyan);">${alert.id}</span></div>
        <div><strong>Timestamp:</strong> ${Utils.formatDate(alert.timestamp)}</div>
        <div><strong>Severity:</strong> ${Utils.getSeverityBadge(alert.severity)}</div>
        <div><strong>Status:</strong> ${Utils.getStatusBadge(alert.status)}</div>
        <div><strong>Risk Score:</strong> <strong style="color:var(--severity-critical);">${alert.riskScore} / 100</strong></div>
        <div><strong>Detection Confidence:</strong> ${alert.confidence}%</div>
        <div><strong>Source IP / Country:</strong> ${alert.sourceIp} (${alert.country || 'Unknown'})</div>
        <div><strong>Destination Endpoint:</strong> ${alert.endpoint} (${alert.destinationIp})</div>
      </div>

      <div style="margin-top:16px; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:var(--border-radius-sm);">
        <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--accent-cyan); margin-bottom:8px;">💡 Why was this detected? (AI Explainability)</h4>
        <ul style="padding-left:20px; font-size:0.85rem; color:var(--text-main);">
          ${(alert.reasons || ['Anomaly detected in network packet heuristics']).map(r => `<li style="margin-bottom:4px;">${Utils.escapeHTML(r)}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-top:12px; padding:12px; background:var(--severity-high-bg); border:1px solid rgba(249,115,22,0.3); border-radius:var(--border-radius-sm);">
        <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--severity-high); margin-bottom:4px;">🛡️ Recommended Response Action</h4>
        <p style="font-size:0.85rem; color:var(--text-main);">${Utils.escapeHTML(alert.recommendation || 'Initiate endpoint investigation and isolate if anomalous activity persists.')}</p>
      </div>

      <div style="margin-top:16px;">
        <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--text-muted); margin-bottom:8px;">Execution Actions</h4>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="AlertsController.updateStatus('${alert.id}', 'ACKNOWLEDGED')">Acknowledge</button>
          <button class="btn btn-primary btn-sm" onclick="AlertsController.updateStatus('${alert.id}', 'ESCALATED')">Escalate to Incident</button>
          <button class="btn btn-secondary btn-sm" style="color:var(--severity-low);" onclick="AlertsController.updateStatus('${alert.id}', 'RESOLVED')">Mark Resolved</button>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');
  },

  closeDetailsModal() {
    const modalOverlay = document.getElementById('alert-details-modal');
    if (modalOverlay) modalOverlay.classList.remove('active');
  },

  updateStatus(alertId, newStatus) {
    const alerts = StorageEngine.loadAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = newStatus;
      StorageEngine.saveAlerts(alerts);
      this.closeDetailsModal();
      this.renderAlertsTable();
      Notifications.showToast(`Alert ${alertId} status updated to ${newStatus}`, 'success');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('alerts-view-marker')) {
    AlertsController.init();
  }
});
