/* ==========================================
   SentinelX — Incidents View & Response Workflow
   ========================================== */

const IncidentsController = {
  init() {
    this.renderIncidents();
  },

  renderIncidents() {
    const grid = document.getElementById('incidents-grid');
    if (!grid) return;

    const incidents = StorageEngine.loadIncidents();

    if (incidents.length === 0) {
      grid.innerHTML = `<div style="grid-column:span 12; padding:32px; text-align:center; color:var(--text-muted);">No security incidents recorded</div>`;
      return;
    }

    grid.innerHTML = incidents.map(inc => `
      <div class="glass-panel" style="padding:20px; display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:monospace; font-weight:700; color:var(--accent-cyan);">${inc.id}</span>
          ${Utils.getSeverityBadge(inc.severity)}
        </div>

        <h3 style="font-size:1rem; font-weight:700; color:var(--text-main);">${Utils.escapeHTML(inc.title)}</h3>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; font-size:0.8rem; color:var(--text-muted);">
          <div>Status: ${Utils.getStatusBadge(inc.status)}</div>
          <div>Assigned: <span style="color:var(--text-main);">${Utils.escapeHTML(inc.assignedTo)}</span></div>
          <div>Affected Hosts: <span style="color:var(--severity-critical); font-weight:700;">${inc.affectedEndpointsCount || 1}</span></div>
          <div>Created: ${Utils.formatRelativeTime(inc.createdAt)}</div>
        </div>

        ${inc.isCorrelated ? `<span class="badge badge-critical" style="width:fit-content;">🔥 CORRELATED THREAT</span>` : ''}

        <div style="margin-top:8px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
          <select style="font-size:0.78rem;" onchange="IncidentsController.changeStatus('${inc.id}', this.value)">
            <option value="NEW" ${inc.status === 'NEW' ? 'selected' : ''}>NEW</option>
            <option value="INVESTIGATING" ${inc.status === 'INVESTIGATING' ? 'selected' : ''}>INVESTIGATING</option>
            <option value="CONTAINED" ${inc.status === 'CONTAINED' ? 'selected' : ''}>CONTAINED</option>
            <option value="RESOLVED" ${inc.status === 'RESOLVED' ? 'selected' : ''}>RESOLVED</option>
            <option value="CLOSED" ${inc.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
          </select>
          <button class="btn btn-secondary btn-sm" onclick="IncidentsController.viewTimeline('${inc.id}')">Timeline & Details</button>
        </div>
      </div>
    `).join('');
  },

  changeStatus(incId, newStatus) {
    const incidents = StorageEngine.loadIncidents();
    const inc = incidents.find(i => i.id === incId);
    if (inc) {
      inc.status = newStatus;
      inc.updatedAt = new Date().toISOString();
      inc.timeline.push({
        time: Utils.formatDate(new Date().toISOString()),
        event: `Incident workflow state changed to ${newStatus}`
      });
      StorageEngine.saveIncidents(incidents);
      this.renderIncidents();
      Notifications.showToast(`Incident ${incId} status changed to ${newStatus}`, 'success');
    }
  },

  viewTimeline(incId) {
    const incidents = StorageEngine.loadIncidents();
    const inc = incidents.find(i => i.id === incId);
    if (!inc) return;

    const modalBody = document.getElementById('incident-modal-body');
    const modalOverlay = document.getElementById('incident-details-modal');
    if (!modalBody || !modalOverlay) return;

    modalBody.innerHTML = `
      <h3 style="color:var(--text-main); font-size:1.1rem; margin-bottom:12px;">${Utils.escapeHTML(inc.title)}</h3>
      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
        ID: <strong>${inc.id}</strong> | Severity: <strong>${inc.severity}</strong> | Assigned: <strong>${inc.assignedTo}</strong>
      </div>

      <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--accent-cyan); margin-bottom:10px;">🕒 Response Event Timeline</h4>
      <div style="display:flex; flex-direction:column; gap:10px; border-left:2px solid var(--accent-cyan); padding-left:16px;">
        ${(inc.timeline || []).map(t => `
          <div>
            <div style="font-size:0.75rem; color:var(--text-dim); font-family:monospace;">${t.time}</div>
            <div style="font-size:0.85rem; color:var(--text-main);">${Utils.escapeHTML(t.event)}</div>
          </div>
        `).join('')}
      </div>
    `;

    modalOverlay.classList.add('active');
  },

  closeModal() {
    const modalOverlay = document.getElementById('incident-details-modal');
    if (modalOverlay) modalOverlay.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('incidents-view-marker')) {
    IncidentsController.init();
  }
});
