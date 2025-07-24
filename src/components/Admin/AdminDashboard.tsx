import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { ArticleCreator } from '../Article/ArticleCreator'
import { InviteCodeManager } from './InviteCodeManager'
import { InviteManager } from './InviteManager'
import SimpleUserManager from './SimpleUserManager'
import SimpleAnalyticsDashboard from '../Dashboard/SimpleAnalyticsDashboard'
import SimplePromptsViewer from '../prompts/SimplePromptsViewer'

export const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard')
  const [showArticleCreator, setShowArticleCreator] = useState(false)
  const [showInviteCodeManager, setShowInviteCodeManager] = useState(false)
  const [showInviteManager, setShowInviteManager] = useState(false)
  const [showUserManager, setShowUserManager] = useState(false)
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'content', label: 'Content Management', icon: '📝' },
    { id: 'invites', label: 'Send Invitations', icon: '📧' },
    { id: 'codes', label: 'Registration Codes', icon: '🎫' },
    { id: 'prompts', label: 'AI Prompts', icon: '🤖' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ]

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              Admin Dashboard
            </h1>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* Quick Stats Cards */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>🎫 Registration Codes</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Manage user registration codes and invitations</p>
                <button
                  onClick={() => setShowInviteCodeManager(true)}
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Manage Codes
                </button>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>👥 User Management</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>View and manage registered users</p>
                <button
                  onClick={() => setShowUserManager(true)}
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Manage Users
                </button>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>📝 Content Management</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Create and manage articles</p>
                <button
                  onClick={() => setShowArticleCreator(true)}
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Create Article
                </button>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>📧 Send Invitations</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Send email invitations to new users</p>
                <button
                  onClick={() => setShowInviteManager(true)}
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Send Invites
                </button>
              </div>
            </div>
          </div>
        )
      case 'users':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              User Management
            </h1>
            <button
              onClick={() => setShowUserManager(true)}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              👥 Open User Manager
            </button>
          </div>
        )
      case 'content':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              Content Management
            </h1>
            <button
              onClick={() => setShowArticleCreator(true)}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              📝 Create New Article
            </button>
          </div>
        )
      case 'invites':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              Send Invitations
            </h1>
            <button
              onClick={() => setShowInviteManager(true)}
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              📧 Send Email Invitations
            </button>
          </div>
        )
      case 'codes':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              Registration Codes
            </h1>
            <button
              onClick={() => setShowInviteCodeManager(true)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              🎫 Manage Registration Codes
            </button>
          </div>
        )
      case 'prompts':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              AI Prompts Library
            </h1>
            <SimplePromptsViewer />
          </div>
        )
      case 'analytics':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#1f2937' }}>
              Analytics Dashboard
            </h1>
            <SimpleAnalyticsDashboard />
          </div>
        )
      default:
        return <div>Dashboard content</div>
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#1f2937',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>🔐</span>
            ISAI Admin
          </h1>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '8px',
                backgroundColor: activeView === item.id ? '#374151' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (activeView !== item.id) {
                  e.currentTarget.style.backgroundColor = '#374151'
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '24px',
          borderTop: '1px solid #374151'
        }}>
          <div style={{
            color: '#d1d5db',
            fontSize: '14px',
            marginBottom: '16px',
            padding: '0 16px'
          }}>
            <div style={{ fontWeight: '500' }}>{user?.email}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Administrator</div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px' }}>
        {renderContent()}
      </div>

      {/* Modals */}
      {showArticleCreator && (
        <ArticleCreator onClose={() => setShowArticleCreator(false)} />
      )}
      
      {showInviteCodeManager && (
        <InviteCodeManager onClose={() => setShowInviteCodeManager(false)} />
      )}
      
      {showInviteManager && (
        <InviteManager onClose={() => setShowInviteManager(false)} />
      )}
      
      {showUserManager && (
        <SimpleUserManager onClose={() => setShowUserManager(false)} />
      )}
    </div>
  )
}