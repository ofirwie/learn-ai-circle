import { supabase } from './supabase';

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  event_type: string;
  target_type: string;
  target_id: string;
  metadata?: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface SessionData {
  session_id: string;
  user_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  page_views: number;
  interactions: number;
  referrer?: string;
  browser?: string;
  os?: string;
  device_type?: string;
}

export interface UserActivity {
  user_id: string;
  daily_sessions: number;
  total_time_minutes: number;
  pages_viewed: number;
  articles_read: number;
  prompts_used: number;
  last_activity: string;
}

class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: Date;
  private pageViews: number = 0;
  private interactions: number = 0;
  private heartbeatInterval?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    
    // Only initialize if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.initializeSession();
      this.startHeartbeat();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getBrowserInfo() {
    if (typeof navigator === 'undefined') {
      return { browser: 'Unknown', os: 'Unknown', deviceType: 'Unknown' };
    }
    
    const ua = navigator.userAgent;
    const browser = this.detectBrowser(ua);
    const os = this.detectOS(ua);
    const deviceType = this.detectDeviceType(ua);

    return { browser, os, deviceType };
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

  private async initializeSession() {
    if (typeof window === 'undefined') return;
    
    const { browser, os, deviceType } = this.getBrowserInfo();
    
    await this.logEvent({
      event_type: 'session_start',
      target_type: 'session',
      target_id: this.sessionId,
      metadata: {
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        browser,
        os,
        deviceType,
        screen_resolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown',
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unknown'
      }
    });
  }

  private startHeartbeat() {
    // Send heartbeat every 30 seconds to track active sessions
    this.heartbeatInterval = setInterval(() => {
      this.logEvent({
        event_type: 'session_heartbeat',
        target_type: 'session',
        target_id: this.sessionId,
        metadata: {
          duration_seconds: Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000),
          page_views: this.pageViews,
          interactions: this.interactions
        }
      });
    }, 30000);
  }

  // Core event logging method
  async logEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>) {
    try {
      if (typeof window === 'undefined') return;

      const { data: { user } } = await supabase.auth.getUser();
      
      const eventData: AnalyticsEvent = {
        ...event,
        user_id: user?.id || null,
        session_id: this.sessionId,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert([eventData]);

      if (error) {
        console.error('Analytics logging error:', error);
      }
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  // User Authentication Events
  async logLogin(userId: string) {
    await this.logEvent({
      event_type: 'user_login',
      target_type: 'user',
      target_id: userId,
      metadata: { login_time: new Date().toISOString() }
    });
  }

  async logLogout(userId: string) {
    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
    
    await this.logEvent({
      event_type: 'user_logout',
      target_type: 'user',
      target_id: userId,
      metadata: { 
        logout_time: new Date().toISOString(),
        session_duration_seconds: sessionDuration
      }
    });

    await this.endSession();
  }

  async logRegistration(userId: string, registrationCode?: string, entityId?: string) {
    await this.logEvent({
      event_type: 'user_registration',
      target_type: 'user',
      target_id: userId,
      metadata: { 
        registration_code: registrationCode,
        entity_id: entityId,
        registration_time: new Date().toISOString()
      }
    });
  }

  // Content Interaction Events
  async logPageView(path: string, title?: string) {
    this.pageViews++;
    
    await this.logEvent({
      event_type: 'page_view',
      target_type: 'page',
      target_id: path,
      metadata: { 
        page_title: title,
        timestamp: new Date().toISOString()
      }
    });
  }

  async logArticleView(articleId: string, title?: string) {
    await this.logEvent({
      event_type: 'article_view',
      target_type: 'article',
      target_id: articleId,
      metadata: { 
        article_title: title,
        view_time: new Date().toISOString()
      }
    });
  }

  async logPromptUse(promptId: string, promptTitle?: string) {
    this.interactions++;
    
    await this.logEvent({
      event_type: 'prompt_used',
      target_type: 'prompt',
      target_id: promptId,
      metadata: { 
        prompt_title: promptTitle,
        use_time: new Date().toISOString()
      }
    });
  }

  async logSearch(query: string, resultsCount: number) {
    this.interactions++;
    
    await this.logEvent({
      event_type: 'search_performed',
      target_type: 'search',
      target_id: query,
      metadata: { 
        query,
        results_count: resultsCount,
        search_time: new Date().toISOString()
      }
    });
  }

  async logContentCreation(contentType: string, contentId: string) {
    this.interactions++;
    
    await this.logEvent({
      event_type: 'content_created',
      target_type: contentType,
      target_id: contentId,
      metadata: { 
        content_type: contentType,
        creation_time: new Date().toISOString()
      }
    });
  }

  // User Engagement Events
  async logTimeSpent(targetType: string, targetId: string, timeSeconds: number) {
    await this.logEvent({
      event_type: 'time_spent',
      target_type: targetType,
      target_id: targetId,
      metadata: { 
        time_seconds: timeSeconds,
        timestamp: new Date().toISOString()
      }
    });
  }

  async logButtonClick(buttonName: string, context?: string) {
    this.interactions++;
    
    await this.logEvent({
      event_type: 'button_click',
      target_type: 'ui_element',
      target_id: buttonName,
      metadata: { 
        button_name: buttonName,
        context: context,
        click_time: new Date().toISOString()
      }
    });
  }

  // Registration Code Analytics
  async logRegistrationCodeUsage(code: string, success: boolean, error?: string) {
    await this.logEvent({
      event_type: 'registration_code_used',
      target_type: 'registration_code',
      target_id: code,
      metadata: { 
        success,
        error: error || null,
        attempt_time: new Date().toISOString()
      }
    });
  }

  // Error Tracking
  async logError(error: Error, context?: string) {
    await this.logEvent({
      event_type: 'error_occurred',
      target_type: 'error',
      target_id: error.name,
      metadata: { 
        error_message: error.message,
        error_stack: error.stack,
        context: context,
        error_time: new Date().toISOString()
      }
    });
  }

  // Analytics Queries
  async getUserStats(userId: string, days: number = 30): Promise<UserActivity | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      if (!data?.length) return null;

      // Calculate user activity stats
      const sessions = new Set(data.map(e => e.session_id)).size;
      const articleViews = data.filter(e => e.event_type === 'article_view').length;
      const promptUses = data.filter(e => e.event_type === 'prompt_used').length;
      const pageViews = data.filter(e => e.event_type === 'page_view').length;
      
      // Calculate total time from session events
      const sessionEvents = data.filter(e => e.event_type === 'session_heartbeat');
      const totalMinutes = sessionEvents.reduce((total, event) => {
        return total + (event.metadata?.duration_seconds || 0);
      }, 0) / 60;

      return {
        user_id: userId,
        daily_sessions: Math.round(sessions / days),
        total_time_minutes: Math.round(totalMinutes),
        pages_viewed: pageViews,
        articles_read: articleViews,
        prompts_used: promptUses,
        last_activity: data[data.length - 1]?.created_at
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  async getPopularContent(type: 'article' | 'prompt', limit: number = 10) {
    try {
      const eventType = type === 'article' ? 'article_view' : 'prompt_used';
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('target_id, metadata')
        .eq('event_type', eventType)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count occurrences of each content item
      const contentCounts = data.reduce((acc, event) => {
        const id = event.target_id;
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Sort by popularity and return top items
      return Object.entries(contentCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([id, count]) => ({ id, views: count }));
    } catch (error) {
      console.error('Error fetching popular content:', error);
      return [];
    }
  }

  // Session Management
  async endSession() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
    
    await this.logEvent({
      event_type: 'session_end',
      target_type: 'session',
      target_id: this.sessionId,
      metadata: {
        duration_seconds: sessionDuration,
        total_page_views: this.pageViews,
        total_interactions: this.interactions,
        end_time: new Date().toISOString()
      }
    });
  }

  // Cleanup method
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Cleanup on page unload (only in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analyticsService.endSession();
    analyticsService.destroy();
  });
}

export default analyticsService;