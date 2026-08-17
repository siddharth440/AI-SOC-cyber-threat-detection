/* ==========================================
   SentinelX — Utilities & Helper Functions
   ========================================== */

const Utils = {
  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Format ISO date string to human readable format
   */
  formatDate(isoString) {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  },

  /**
   * Format relative time (e.g. "5 mins ago")
   */
  formatRelativeTime(isoString) {
    if (!isoString) return 'Just now';
    const now = new Date();
    const past = new Date(isoString);
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  },

  /**
   * Format severity badge HTML
   */
  getSeverityBadge(severity) {
    const sev = (severity || 'LOW').toUpperCase();
    let badgeClass = 'badge-low';
    if (sev === 'CRITICAL') badgeClass = 'badge-critical';
    else if (sev === 'HIGH') badgeClass = 'badge-high';
    else if (sev === 'MEDIUM') badgeClass = 'badge-medium';

    return `<span class="badge ${badgeClass}">${Utils.escapeHTML(sev)}</span>`;
  },

  /**
   * Format status badge HTML
   */
  getStatusBadge(status) {
    const st = (status || 'NEW').toUpperCase();
    let badgeClass = 'badge-info';
    if (st === 'CRITICAL' || st === 'OFFLINE' || st === 'AT RISK') badgeClass = 'badge-critical';
    else if (st === 'INVESTIGATING' || st === 'ISOLATED') badgeClass = 'badge-high';
    else if (st === 'CONTAINED' || st === 'ACKNOWLEDGED') badgeClass = 'badge-medium';
    else if (st === 'RESOLVED' || st === 'CLOSED' || st === 'ONLINE') badgeClass = 'badge-low';

    return `<span class="badge ${badgeClass}">${Utils.escapeHTML(st)}</span>`;
  },

  /**
   * Generate UUID-like string
   */
  generateID(prefix = 'ID') {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${rand}`;
  },

  /**
   * Deep copy object
   */
  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};
