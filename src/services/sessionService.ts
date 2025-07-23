import { supabase } from './supabase';
import { analyticsService } from './analyticsService';

export interface SessionInfo {
  id: string;
  user_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  page_views: number;
  interactions: number;
  last_activity: string;
  browser?: string;
  os?: string;
  device_type?: string;
  ip_address?: string;
  is_active: boolean;
}

export interface UserSession {
  session_id: string;
  user_id: string;
  entity_id?: string;
  start_time: Date;
  last_activity: Date;
  page_views: number;
  time_spent_seconds: number;
  browser_info: {
    browser: string;
    os: string;
    device_type: string;
  };
}

class SessionService {
  private currentSession: UserSession | null = null;
  private activityTimer?: NodeJS.Timeout;
  private sessionTimeoutMinutes = 30; // Session expires after 30 minutes of inactivity
  private pageStartTime = Date.now();

  constructor() {
    // Only initialize browser-specific features if in browser environment
    if (typeof window !== 'undefined') {
      this.initializeActivityTracking();
      this.bindBeforeUnload();
    }
  }

  async startSession(userId: string, entityId?: string): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      const now = new Date();
      
      this.currentSession = {
        session_id: sessionId,
        user_id: userId,
        entity_id,
        start_time: now,
        last_activity: now,
        page_views: 0,
        time_spent_seconds: 0,
        browser_info: this.getBrowserInfo()
      };

      // Log session start in analytics
      await analyticsService.logLogin(userId);
      
      // Store session in localStorage for persistence
      this.saveSessionToStorage();

      // Start activity tracking
      this.startActivityTracking();

      return sessionId;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - this.currentSession.start_time.getTime()) / 1000);

      // Log session end
      await analyticsService.logLogout(this.currentSession.user_id);

      // Save final session data
      await this.saveSessionData({
        ...this.currentSession,
        time_spent_seconds: duration
      });

      // Clear session
      this.currentSession = null;
      this.clearSessionFromStorage();
      this.stopActivityTracking();

    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  async extendSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.last_activity = new Date();
    this.saveSessionToStorage();

    // Reset activity timer
    this.resetActivityTimer();
  }

  async trackPageView(path: string, title?: string): Promise<void> {
    if (!this.currentSession) return;

    // Track time spent on previous page
    const timeOnPage = Math.floor((Date.now() - this.pageStartTime) / 1000);
    if (timeOnPage > 5) { // Only count if spent more than 5 seconds
      this.currentSession.time_spent_seconds += timeOnPage;
    }

    this.currentSession.page_views++;
    this.currentSession.last_activity = new Date();
    this.pageStartTime = Date.now();

    // Log page view
    await analyticsService.logPageView(path, title);
    
    this.saveSessionToStorage();
  }

  async trackInteraction(interactionType: string, targetId?: string): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.last_activity = new Date();
    
    // Log interaction based on type
    switch (interactionType) {
      case 'button_click':
        await analyticsService.logButtonClick(targetId || 'unknown');
        break;
      case 'search':
        // Handled separately in search components
        break;
      default:
        await analyticsService.logEvent({
          event_type: interactionType,
          target_type: 'interaction',
          target_id: targetId || 'unknown'
        });
    }

    this.saveSessionToStorage();
    this.resetActivityTimer();
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  getSessionDuration(): number {
    if (!this.currentSession) return 0;
    return Math.floor((Date.now() - this.currentSession.start_time.getTime()) / 1000);
  }

  isSessionActive(): boolean {
    if (!this.currentSession) return false;
    
    const now = Date.now();
    const lastActivity = this.currentSession.last_activity.getTime();
    const inactiveMinutes = (now - lastActivity) / (1000 * 60);
    
    return inactiveMinutes < this.sessionTimeoutMinutes;
  }

  // Get user's active sessions (for multi-device tracking)
  async getUserActiveSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - this.sessionTimeoutMinutes);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'session_heartbeat')
        .gte('created_at', cutoffTime.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by session_id and get latest heartbeat for each
      const sessionGroups = data.reduce((acc, event) => {
        const sessionId = event.session_id;
        if (!acc[sessionId] || event.created_at > acc[sessionId].created_at) {
          acc[sessionId] = event;
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(sessionGroups).map(event => ({
        id: event.session_id,
        user_id: event.user_id,
        last_activity: event.created_at,
        page_views: event.metadata?.page_views || 0,
        interactions: event.metadata?.interactions || 0,
        browser: event.metadata?.browser,
        os: event.metadata?.os,
        device_type: event.metadata?.deviceType,
        duration_seconds: event.metadata?.duration_seconds || 0,
        is_active: true
      }));
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  // Session analytics
  async getSessionAnalytics(days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .in('event_type', ['session_start', 'session_end', 'session_heartbeat'])
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const analytics = {
        total_sessions: 0,
        unique_users: new Set(),
        average_duration: 0,
        total_page_views: 0,
        browser_breakdown: {} as Record<string, number>,
        device_breakdown: {} as Record<string, number>,
        hourly_distribution: Array(24).fill(0)
      };

      const sessionData = {} as Record<string, any>;

      data.forEach(event => {
        const sessionId = event.session_id;
        
        if (event.event_type === 'session_start') {
          analytics.total_sessions++;
          analytics.unique_users.add(event.user_id);
          
          sessionData[sessionId] = {
            start: event.created_at,
            user_id: event.user_id,
            browser: event.metadata?.browser,
            device_type: event.metadata?.deviceType
          };

          // Track browser usage
          const browser = event.metadata?.browser || 'Unknown';
          analytics.browser_breakdown[browser] = (analytics.browser_breakdown[browser] || 0) + 1;

          // Track device usage
          const device = event.metadata?.deviceType || 'Unknown';
          analytics.device_breakdown[device] = (analytics.device_breakdown[device] || 0) + 1;

          // Track hourly distribution
          const hour = new Date(event.created_at).getHours();
          analytics.hourly_distribution[hour]++;
        }
        
        if (event.event_type === 'session_heartbeat' && sessionData[sessionId]) {
          sessionData[sessionId].duration = event.metadata?.duration_seconds || 0;
          sessionData[sessionId].page_views = event.metadata?.page_views || 0;
        }
      });

      // Calculate averages
      const validSessions = Object.values(sessionData).filter(s => s.duration);
      analytics.average_duration = validSessions.reduce((sum, s) => sum + s.duration, 0) / validSessions.length || 0;
      analytics.total_page_views = validSessions.reduce((sum, s) => sum + s.page_views, 0);

      return {
        ...analytics,
        unique_users: analytics.unique_users.size
      };
    } catch (error) {
      console.error('Failed to get session analytics:', error);
      return null;
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getBrowserInfo() {
    if (typeof navigator === 'undefined') {
      return {
        browser: 'Unknown',
        os: 'Unknown',
        device_type: 'Unknown'
      };
    }
    
    const ua = navigator.userAgent;
    return {
      browser: this.detectBrowser(ua),
      os: this.detectOS(ua),
      device_type: this.detectDeviceType(ua)
    };
  }

  private detectBrowser(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private detectOS(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private detectDeviceType(ua: string): string {
    if (/tablet|ipad/i.test(ua)) return 'Tablet';
    if (/mobile|phone/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  private initializeActivityTracking() {
    if (typeof document === 'undefined') return;
    
    // Track mouse movements, clicks, and keyboard activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.extendSession();
      }, { passive: true });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseSession();
      } else {
        this.resumeSession();
      }
    });
  }

  private startActivityTracking() {
    this.resetActivityTimer();
  }

  private stopActivityTracking() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
  }

  private resetActivityTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    // Set timeout for session expiry
    this.activityTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.sessionTimeoutMinutes * 60 * 1000);
  }

  private async handleSessionTimeout() {
    console.log('Session timed out due to inactivity');
    await this.endSession();
    
    // Optionally redirect to login or show session expired message
    window.dispatchEvent(new CustomEvent('sessionTimeout'));
  }

  private pauseSession() {
    // Track page visibility for accurate time tracking
    if (this.currentSession) {
      const timeOnPage = Math.floor((Date.now() - this.pageStartTime) / 1000);
      this.currentSession.time_spent_seconds += timeOnPage;
      this.pageStartTime = Date.now(); // Reset for when page becomes visible again
    }
  }

  private resumeSession() {
    this.pageStartTime = Date.now();
    this.extendSession();
  }

  private saveSessionToStorage() {
    if (this.currentSession) {
      localStorage.setItem('currentSession', JSON.stringify({
        ...this.currentSession,
        start_time: this.currentSession.start_time.toISOString(),
        last_activity: this.currentSession.last_activity.toISOString()
      }));
    }
  }

  private clearSessionFromStorage() {
    localStorage.removeItem('currentSession');
  }

  private async saveSessionData(session: UserSession) {
    // This could be extended to save session data to a dedicated sessions table
    console.log('Session completed:', {
      duration: session.time_spent_seconds,
      page_views: session.page_views,
      device: session.browser_info
    });
  }

  private bindBeforeUnload() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('beforeunload', () => {
      if (this.currentSession) {
        // Use sendBeacon for reliable tracking on page unload
        this.endSession();
      }
    });
  }

  // Recovery method to restore session from localStorage
  restoreSession(): boolean {
    try {
      const savedSession = localStorage.getItem('currentSession');
      if (!savedSession) return false;

      const sessionData = JSON.parse(savedSession);
      
      // Check if session is still valid
      const lastActivity = new Date(sessionData.last_activity);
      const inactiveMinutes = (Date.now() - lastActivity.getTime()) / (1000 * 60);
      
      if (inactiveMinutes > this.sessionTimeoutMinutes) {
        this.clearSessionFromStorage();
        return false;
      }

      // Restore session
      this.currentSession = {
        ...sessionData,
        start_time: new Date(sessionData.start_time),
        last_activity: new Date(sessionData.last_activity)
      };

      this.startActivityTracking();
      return true;
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.clearSessionFromStorage();
      return false;
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();

// Listen for session timeout events (only in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('sessionTimeout', () => {
    // Handle session timeout (redirect to login, show message, etc.)
    console.log('Session expired due to inactivity');
  });
}

export default sessionService;