/* ==========================================
   SentinelX — Endpoint Fleet Controller & Isolation Simulator
   ========================================== */

const EndpointsController = {
  selectedEndpointId: null,

  init() {
    this.renderEndpoints();
  },

  renderEndpoints() {
    const grid = document.getElementById('endpoints-grid');
    if (!grid) return;

    const endpoints = StorageEngine.loadEndpoints();

    grid.innerHTML = endpoints.map(ep => `
      <div class="glass-panel" style="padding:16px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-main);">${Utils.escapeHTML(ep.hostname)}</h3>
          ${Utils.getStatusBadge(ep.status)}
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted);">
          <div>IP Address: <span style="font-family:monospace; color:var(--accent-cyan);">${ep.ip}</span></div>
          <div>OS: ${Utils.escapeHTML(ep.os)}</div>
          <div>User: ${Utils.escapeHTML(ep.user)}</div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">
            <span>CPU Usage</span>
            <span>${ep.cpuUsage}%</span>
          </div>
          <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px;">
            <div style="width:${ep.cpuUsage}%; height:100%; background:${ep.cpuUsage > 80 ? 'var(--severity-critical)' : 'var(--accent-cyan)'}"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">
            <span>RAM Usage</span>
            <span>${ep.memoryUsage}%</span>
          </div>
          <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px;">
            <div style="width:${ep.memoryUsage}%; height:100%; background:var(--accent-blue)"></div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; padding-top:8px; border-top:1px solid var(--border-color);">
          <span style="font-size:0.78rem; color:var(--text-dim);">Risk: <strong style="color:${ep.riskScore > 70 ? 'var(--severity-critical)' : 'var(--text-main)'}">${ep.riskScore}</strong></span>
          <button class="btn btn-secondary btn-sm" onclick="EndpointsController.openDetails('${ep.id}')">Details</button>
        </div>
      </div>
    `).join('');
  },

  openDetails(epId) {
    this.selectedEndpointId = epId;
    const endpoints = StorageEngine.loadEndpoints();
    const ep = endpoints.find(e => e.id === epId);
    if (!ep) return;

    const modalBody = document.getElementById('endpoint-modal-body');
    const modalOverlay = document.getElementById('endpoint-details-modal');
    if (!modalBody || !modalOverlay) return;

    modalBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="color:var(--text-main); font-size:1.1rem;">${Utils.escapeHTML(ep.hostname)}</h3>
        ${Utils.getStatusBadge(ep.status)}
      </div>

      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; font-size:0.85rem; margin-top:12px;">
        <div>IP: <span style="font-family:monospace; color:var(--accent-cyan);">${ep.ip}</span></div>
        <div>OS: ${Utils.escapeHTML(ep.os)}</div>
        <div>Active User: ${Utils.escapeHTML(ep.user)}</div>
        <div>Network Traffic: ${ep.networkTrafficMB} MB</div>
        <div>Risk Score: <strong>${ep.riskScore} / 100</strong></div>
        <div>Audit Events: ${ep.auditEventsCount}</div>
      </div>

      <div style="margin-top:16px; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:var(--border-radius-sm);">
        <h4 style="font-size:0.85rem; color:var(--accent-cyan); margin-bottom:6px;">🛡️ Endpoint Actions Simulation</h4>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px;">
          Isolating this endpoint will immediately terminate active network interfaces and block incoming/outgoing connections.
        </p>
        ${ep.status === 'ISOLATED' 
          ? `<button class="btn btn-secondary btn-sm" onclick="EndpointsController.unisolateEndpoint('${ep.id}')">Restore Network Connection</button>`
          : `<button class="btn btn-danger btn-sm" onclick="EndpointsController.isolateEndpoint('${ep.id}')">🚫 ISOLATE ENDPOINT</button>`
        }
      </div>
    `;

    modalOverlay.classList.add('active');
  },

  closeModal() {
    const modalOverlay = document.getElementById('endpoint-details-modal');
    if (modalOverlay) modalOverlay.classList.remove('active');
  },

  isolateEndpoint(epId) {
    if (!confirm('Are you sure you want to isolate this endpoint from the network?')) return;

    const endpoints = StorageEngine.loadEndpoints();
    const ep = endpoints.find(e => e.id === epId);
    if (ep) {
      ep.status = 'ISOLATED';
      ep.riskScore = Math.max(ep.riskScore, 85);
      StorageEngine.saveEndpoints(endpoints);

      // Create Audit Incident Log
      const incidents = StorageEngine.loadIncidents();
      incidents.unshift({
        id: Utils.generateID('INC'),
        title: `Automated Incident: Endpoint ${ep.hostname} Isolated`,
        severity: 'CRITICAL',
        status: 'CONTAINED',
        assignedTo: 'SOC Analyst Alpha',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        affectedEndpointsCount: 1,
        affectedEndpoints: [ep.hostname],
        timeline: [
          { time: Utils.formatDate(new Date().toISOString()), event: `Endpoint ${ep.hostname} (${ep.ip}) isolated by SOC Analyst.` }
        ]
      });
      StorageEngine.saveIncidents(incidents);

      this.closeModal();
      this.renderEndpoints();
      Notifications.showToast(`Endpoint ${ep.hostname} has been ISOLATED successfully`, 'warning');
    }
  },

  unisolateEndpoint(epId) {
    const endpoints = StorageEngine.loadEndpoints();
    const ep = endpoints.find(e => e.id === epId);
    if (ep) {
      ep.status = 'ONLINE';
      StorageEngine.saveEndpoints(endpoints);
      this.closeModal();
      this.renderEndpoints();
      Notifications.showToast(`Endpoint ${ep.hostname} network connectivity restored`, 'success');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('endpoints-view-marker')) {
    EndpointsController.init();
  }
});
