import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Set the session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Error setting session:', error)
            navigate('/login?error=session_error')
            return
          }
          
          console.log('✅ Session set successfully')
          
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname)
          
          // Redirect to dashboard or home
          navigate('/dashboard')
        } else {
          // No tokens in URL, redirect to login
          navigate('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login?error=callback_error')
      }
    }
    
    handleAuthCallback()
  }, [navigate])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <div className="spinner" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '8px' }}>
          Confirming your email...
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Please wait while we complete your registration
        </p>
      </div>
    </div>
  )
}