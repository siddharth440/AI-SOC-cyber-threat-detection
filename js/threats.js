/* ==========================================
   SentinelX — Threat Intelligence IOC Controller
   ========================================== */

const ThreatIntelController = {
  init() {
    this.renderThreatsTable();
  },

  renderThreatsTable() {
    const tableBody = document.getElementById('threats-table-body');
    if (!tableBody) return;

    let threats = StorageEngine.loadThreats();
    const searchQuery = (document.getElementById('threat-search')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('threat-type-filter')?.value || 'ALL';

    threats = threats.filter(t => {
      const matchSearch = !searchQuery || t.ioc.toLowerCase().includes(searchQuery) || t.threatName.toLowerCase().includes(searchQuery);
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      return matchSearch && matchType;
    });

    if (threats.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">No threat intelligence indicators found</td></tr>`;
      return;
    }

    tableBody.innerHTML = threats.map(t => `
      <tr>
        <td style="font-family:monospace; color:var(--accent-cyan); font-weight:700;">${Utils.escapeHTML(t.ioc)}</td>
        <td><span class="badge badge-info">${t.type}</span></td>
        <td><strong style="color:var(--text-main);">${Utils.escapeHTML(t.threatName)}</strong></td>
        <td>${t.confidence}%</td>
        <td>${t.firstSeen}</td>
        <td>${Utils.getStatusBadge(t.status)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="ThreatIntelController.toggleStatus('${t.id}')">Toggle Status</button>
          <button class="btn btn-danger btn-sm" onclick="ThreatIntelController.deleteIOC('${t.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  },

  openAddIOCModal() {
    const modal = document.getElementById('add-ioc-modal');
    if (modal) modal.classList.add('active');
  },

  closeAddIOCModal() {
    const modal = document.getElementById('add-ioc-modal');
    if (modal) modal.classList.remove('active');
  },

  saveNewIOC(e) {
    e.preventDefault();
    const iocVal = document.getElementById('ioc-value-input')?.value.trim();
    const typeVal = document.getElementById('ioc-type-input')?.value;
    const nameVal = document.getElementById('ioc-name-input')?.value.trim();

    if (!iocVal || !nameVal) {
      Notifications.showToast('Please complete all required fields', 'error');
      return;
    }

    const threats = StorageEngine.loadThreats();
    threats.unshift({
      id: Utils.generateID('IOC'),
      ioc: iocVal,
      type: typeVal,
      threatName: nameVal,
      confidence: 90,
      firstSeen: new Date().toISOString().split('T')[0],
      lastSeen: new Date().toISOString().split('T')[0],
      status: 'MALICIOUS'
    });

    StorageEngine.saveThreats(threats);
    this.closeAddIOCModal();
    this.renderThreatsTable();
    Notifications.showToast('New Threat Intelligence IOC added successfully', 'success');
  },

  toggleStatus(id) {
    const threats = StorageEngine.loadThreats();
    const t = threats.find(item => item.id === id);
    if (t) {
      t.status = t.status === 'MALICIOUS' ? 'FALSE POSITIVE' : 'MALICIOUS';
      StorageEngine.saveThreats(threats);
      this.renderThreatsTable();
      Notifications.showToast(`IOC status updated to ${t.status}`, 'info');
    }
  },

  deleteIOC(id) {
    let threats = StorageEngine.loadThreats();
    threats = threats.filter(item => item.id !== id);
    StorageEngine.saveThreats(threats);
    this.renderThreatsTable();
    Notifications.showToast('IOC removed from Threat Intel database', 'info');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('threats-view-marker')) {
    ThreatIntelController.init();
  }
});
