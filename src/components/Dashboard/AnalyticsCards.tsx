import React, { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { ContentService } from '../../services/contentService'
import { AnalyticsData } from '../../types/content'

export const AnalyticsCards: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await ContentService.getAnalytics()
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ color: '#64748b' }}>Loading...</div>
          </div>
        ))}
      </div>
    )
  }

  if (!analytics) return null

  const cards = [
    {
      title: 'Total Content Items',
      value: analytics.totalItems.toLocaleString(),
      icon: '📚',
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      title: 'Pending Approval',
      value: analytics.pendingItems.toLocaleString(),
      icon: '⏳',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Published Items',
      value: analytics.publishedItems.toLocaleString(),
      icon: '✅',
      color: '#10b981',
      bgColor: '#dcfce7'
    },
    {
      title: 'Avg Innovation Score',
      value: analytics.avgInnovationScore.toString(),
      icon: '⭐',
      color: '#8b5cf6',
      bgColor: '#f3e8ff'
    }
  ]

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {cards.map((card, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: card.bgColor,
              color: card.color,
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Sources and Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Top Sources */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            Top Sources
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analytics.topSources.slice(0, 5).map((source, index) => (
              <div key={source.domain} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0'
              }}>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  {source.domain}
                </div>
                <div style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {source.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            Content Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analytics.categoryCounts.slice(0, 5).map((category, index) => {
              const percentage = (category.count / analytics.totalItems) * 100
              return (
                <div key={category.category} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      {category.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {category.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: '#3b82f6',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      {analytics.weeklyTrend.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginTop: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
            Collection Trend (Last 7 Days)
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'end', height: '100px' }}>
            {analytics.weeklyTrend.map((day, index) => {
              const maxCount = Math.max(...analytics.weeklyTrend.map(d => d.count))
              const height = (day.count / maxCount) * 80 + 20
              return (
                <div key={day.date} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  gap: '8px'
                }}>
                  <div style={{
                    backgroundColor: '#3b82f6',
                    width: '100%',
                    height: `${height}px`,
                    borderRadius: '4px 4px 0 0',
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '500',
                    paddingBottom: '4px'
                  }}>
                    {day.count}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {format(new Date(day.date), 'MM/dd')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}