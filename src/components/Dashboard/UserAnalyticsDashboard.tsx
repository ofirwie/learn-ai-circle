import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  Clock, 
  Activity, 
  Eye, 
  Download,
  TrendingUp,
  Monitor,
  Smartphone,
  Globe,
  RefreshCw
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { sessionService } from '../../services/sessionService';
import { registrationCodeService, CodeAnalytics } from '../../services/registrationCodeService';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  averageSessionTime: number;
  totalSessions: number;
  pageViews: number;
  popularContent: Array<{ id: string; views: number; title?: string }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  hourlyActivity: number[];
}

interface RegistrationStats {
  totalCodes: number;
  activeCodes: number;
  recentRegistrations: number;
  topCodes: CodeAnalytics[];
}

const UserAnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrationStats, setRegistrationStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(7); // Default to 7 days

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
      const codeAnalytics = await registrationCodeService.getCodeAnalytics(selectedPeriod);
      const codeStats = await registrationCodeService.getCodeStatistics();

      if (sessionAnalytics) {
        setStats({
          totalUsers: sessionAnalytics.unique_users,
          activeUsers: sessionAnalytics.unique_users, // Could be refined to recent activity
          averageSessionTime: Math.round(sessionAnalytics.average_duration / 60), // Convert to minutes
          totalSessions: sessionAnalytics.total_sessions,
          pageViews: sessionAnalytics.total_page_views,
          popularContent: [...popularArticles, ...popularPrompts],
          deviceBreakdown: sessionAnalytics.device_breakdown,
          browserBreakdown: sessionAnalytics.browser_breakdown,
          hourlyActivity: sessionAnalytics.hourly_distribution
        });
      }

      setRegistrationStats({
        totalCodes: codeStats.total_codes,
        activeCodes: codeStats.active_codes,
        recentRegistrations: codeStats.recent_registrations,
        topCodes: codeAnalytics.slice(0, 5)
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const exportAnalytics = async () => {
    try {
      const csvData = await registrationCodeService.exportCodesToCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into user behavior and engagement</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Sessions</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="registration">Registration Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {registrationStats?.recentRegistrations || 0} new this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalSessions ? Math.round(stats.totalSessions / selectedPeriod) : 0} per day avg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageSessionTime || 0}m</div>
                <p className="text-xs text-muted-foreground">
                  {formatDuration((stats?.averageSessionTime || 0) * 60)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pageViews || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pageViews && stats?.totalSessions ? 
                    Math.round(stats.pageViews / stats.totalSessions) : 0} per session
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Device & Browser Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.deviceBreakdown || {}).map(([device, count]) => (
                    <div key={device} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {device === 'Mobile' && <Smartphone className="w-4 h-4" />}
                        {device === 'Desktop' && <Monitor className="w-4 h-4" />}
                        {device === 'Tablet' && <Globe className="w-4 h-4" />}
                        <span className="text-sm">{device}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <Badge variant="secondary">
                          {stats?.totalSessions ? Math.round((count / stats.totalSessions) * 100) : 0}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Browser Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.browserBreakdown || {}).map(([browser, count]) => (
                    <div key={browser} className="flex justify-between items-center">
                      <span className="text-sm">{browser}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <Badge variant="secondary">
                          {stats?.totalSessions ? Math.round((count / stats.totalSessions) * 100) : 0}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity Distribution</CardTitle>
              <p className="text-sm text-gray-600">User activity by hour of day</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-2">
                {(stats?.hourlyActivity || Array(24).fill(0)).map((activity, hour) => (
                  <div key={hour} className="text-center">
                    <div 
                      className="h-12 bg-blue-100 rounded mb-1 flex items-end justify-center"
                      style={{ 
                        backgroundColor: `rgba(59, 130, 246, ${Math.max(0.1, activity / Math.max(...(stats?.hourlyActivity || [1])))})`
                      }}
                    >
                      <span className="text-xs text-blue-800 font-medium">{activity}</span>
                    </div>
                    <span className="text-xs text-gray-500">{hour}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Popular Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Popular Content
              </CardTitle>
              <p className="text-sm text-gray-600">Most viewed articles and prompts</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.popularContent.map((content, index) => (
                  <div key={content.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{content.title || content.id}</p>
                        <p className="text-sm text-gray-600">{content.views} views</p>
                      </div>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                ))}
                {(!stats?.popularContent.length) && (
                  <p className="text-gray-500 text-center py-4">No content data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration" className="space-y-6">
          {/* Registration Code Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{registrationStats?.totalCodes || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{registrationStats?.activeCodes || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{registrationStats?.recentRegistrations || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Registration Codes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Registration Codes</CardTitle>
              <p className="text-sm text-gray-600">Most successful registration codes</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {registrationStats?.topCodes.map((code, index) => (
                  <div key={code.code} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{code.code}</p>
                        <p className="text-sm text-gray-600">
                          {code.entity_name || 'No entity'} • {code.total_uses} uses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={code.status === 'active' ? 'default' : 'secondary'}
                        className="mb-1"
                      >
                        {code.status}
                      </Badge>
                      <p className="text-sm text-gray-600">{Math.round(code.conversion_rate)}% success</p>
                    </div>
                  </div>
                ))}
                {(!registrationStats?.topCodes.length) && (
                  <p className="text-gray-500 text-center py-4">No registration code data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAnalyticsDashboard;