import React, { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { AdminLoginForm } from './auth/AdminLoginForm'
import { AdminDashboard } from './Admin/AdminDashboard'

export const AdminApp: React.FC = () => {
  const { user, loading, initialized, initialize } = useAuthStore()
  
  useEffect(() => {
    initialize()
  }, [])

  // Show loading spinner while initializing
  if (loading || !initialized) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
            Loading ISAI Admin Panel...
          </p>
          
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Show admin dashboard if user is logged in
  if (user) {
    return <AdminDashboard />
  }

  // Show admin login form if not logged in
  return <AdminLoginForm />
}