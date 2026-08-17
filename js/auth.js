/* ==========================================
   SentinelX — Client-Side Authentication Manager
   ========================================== */

const AuthEngine = {
  SESSION_KEY: 'sentinelx_session_user',
  DEMO_CREDENTIALS: {
    email: 'soc.admin@sentinelx.local',
    password: 'SentinelX@123'
  },

  /**
   * Validate login attempt
   */
  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (cleanEmail === this.DEMO_CREDENTIALS.email.toLowerCase() && cleanPassword === this.DEMO_CREDENTIALS.password) {
      const userSession = {
        email: cleanEmail,
        name: 'SOC Analyst Alpha',
        role: 'Tier 3 Senior Analyst',
        loggedInAt: new Date().toISOString(),
        token: 'demo-jwt-token-sentinelx-' + Date.now()
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(userSession));
      return { success: true, user: userSession };
    }

    return { success: false, error: 'Invalid email or password. Please use demo credentials.' };
  },

  /**
   * Get current session user
   */
  getUser() {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.getUser() !== null;
  },

  /**
   * Logout user and clear session
   */
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = './index.html';
  },

  /**
   * Enforce route protection on protected pages
   */
  checkAccess() {
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path.endsWith('/') || path.endsWith('SentinelX/');
    const isLoggedIn = this.isAuthenticated();

    if (!isLoggedIn && !isLoginPage) {
      window.location.href = './index.html';
    } else if (isLoggedIn && isLoginPage) {
      window.location.href = './dashboard.html';
    }
  }
};

// Auto check access on page load
document.addEventListener('DOMContentLoaded', () => {
  AuthEngine.checkAccess();
});
