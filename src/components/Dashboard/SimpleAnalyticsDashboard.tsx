import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { sessionService } from '../../services/sessionService';
import { registrationCodeService } from '../../services/registrationCodeService';

interface DashboardStats {
  totalUsers: number;
  totalSessions: number;
  averageSessionTime: number;
  pageViews: number;
  popularContent: Array<{ id: string; views: number; title?: string }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
}

interface RegistrationStats {
  totalCodes: number;
  activeCodes: number;
  recentRegistrations: number;
}

const SimpleAnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrationStats, setRegistrationStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get session analytics
      const sessionAnalytics = await sessionService.getSessionAnalytics(selectedPeriod);
      
      // Get popular content
      const popularArticles = await analyticsService.getPopularContent('article', 5);
      const popularPrompts = await analyticsService.getPopularContent('prompt', 5);
      
      // Get registration code analytics
      const codeStats = await registrationCodeService.getCodeStatistics();

      if (sessionAnalytics) {
        setStats({
          totalUsers: sessionAnalytics.unique_users,
          totalSessions: sessionAnalytics.total_sessions,
          averageSessionTime: Math.round(sessionAnalytics.average_duration / 60),
          pageViews: sessionAnalytics.total_page_views,
          popularContent: [...popularArticles, ...popularPrompts],
          deviceBreakdown: sessionAnalytics.device_breakdown,
          browserBreakdown: sessionAnalytics.browser_breakdown
        });
      }

      setRegistrationStats({
        totalCodes: codeStats.total_codes,
        activeCodes: codeStats.active_codes,
        recentRegistrations: codeStats.recent_registrations
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '60px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading analytics...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: 0,
            marginBottom: '8px'
          }}>
            📊 User Analytics Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Comprehensive insights into user behavior and engagement
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <button 
            onClick={loadAnalytics}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>👥</span>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Users</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {stats?.totalUsers || 0}
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {registrationStats?.recentRegistrations || 0} new this week
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>📈</span>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Sessions</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {stats?.totalSessions || 0}
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {stats?.totalSessions ? Math.round(stats.totalSessions / selectedPeriod) : 0} per day avg
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>⏰</span>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Avg Session Time</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {stats?.averageSessionTime || 0}m
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {formatDuration(stats?.averageSessionTime || 0)}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>👁️</span>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Page Views</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {stats?.pageViews || 0}
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {stats?.pageViews && stats?.totalSessions ? 
              Math.round(stats.pageViews / stats.totalSessions) : 0} per session
          </p>
        </div>
      </div>

      {/* Device & Browser Breakdown */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📱 Device Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(stats?.deviceBreakdown || {}).map(([device, count]) => (
              <div key={device} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>
                    {device === 'Mobile' && '📱'}
                    {device === 'Desktop' && '💻'}
                    {device === 'Tablet' && '📺'}
                    {!['Mobile', 'Desktop', 'Tablet'].includes(device) && '🖥️'}
                  </span>
                  <span style={{ fontSize: '14px' }}>{device}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{count}</span>
                  <span style={{
                    background: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {stats?.totalSessions ? Math.round((count / stats.totalSessions) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🌐 Browser Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(stats?.browserBreakdown || {}).map(([browser, count]) => (
              <div key={browser} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>{browser}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{count}</span>
                  <span style={{
                    background: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {stats?.totalSessions ? Math.round((count / stats.totalSessions) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Code Stats */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '32px'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '18px', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🎫 Registration Codes Overview
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
              {registrationStats?.totalCodes || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Codes</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
              {registrationStats?.activeCodes || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Codes</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
              {registrationStats?.recentRegistrations || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Recent Registrations</div>
          </div>
        </div>
      </div>

      {/* Popular Content */}
      {stats?.popularContent && stats.popularContent.length > 0 && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔥 Popular Content
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.popularContent.map((content, index) => (
              <div 
                key={content.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    #{index + 1}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>
                      {content.title || content.id}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {content.views} views
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '16px' }}>📊</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAnalyticsDashboard;