/* ==========================================
   SentinelX — Notification & Toast System
   ========================================== */

const Notifications = {
  /**
   * Display toast notification
   * @param {string} message 
   * @param {string} type 'success' | 'error' | 'warning' | 'info'
   */
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '✕';
    else if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${Utils.escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  /**
   * Render notifications popover menu in top header
   */
  renderHeaderPopover() {
    const listContainer = document.getElementById('notification-list-container');
    const badgeCount = document.getElementById('header-notification-count');
    if (!listContainer) return;

    const items = StorageEngine.loadNotifications();
    const unread = items.filter(n => !n.read);

    if (badgeCount) {
      badgeCount.textContent = unread.length;
      badgeCount.style.display = unread.length > 0 ? 'inline-block' : 'none';
    }

    if (items.length === 0) {
      listContainer.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-muted);">No notifications</div>';
      return;
    }

    listContainer.innerHTML = items.slice(0, 8).map(n => `
      <div class="search-result-item" style="opacity: ${n.read ? '0.6' : '1'}; flex-direction:column; align-items:flex-start;">
        <div style="display:flex; justify-content:space-between; width:100%;">
          <strong style="font-size:0.82rem; color:var(--text-main);">${Utils.escapeHTML(n.title)}</strong>
          <span style="font-size:0.7rem; color:var(--text-dim);">${Utils.formatRelativeTime(n.timestamp)}</span>
        </div>
      </div>
    `).join('');
  },

  markAllRead() {
    const items = StorageEngine.loadNotifications();
    items.forEach(n => n.read = true);
    StorageEngine.saveNotifications(items);
    this.renderHeaderPopover();
    this.showToast('All notifications marked as read', 'success');
  }
};
