import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    registrationCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [codeValidation, setCodeValidation] = useState<{
    valid: boolean
    entity?: string
    userGroup?: string
  } | null>(null)

  const { signUp, validateRegistrationCode } = useAuthStore()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'registrationCode' && value.length >= 3) {
      validateCode(value)
    }
  }

  const validateCode = async (code: string) => {
    console.log('🔍 Validating registration code:', code)
    try {
      const result = await validateRegistrationCode(code)
      console.log('📋 Validation result:', result)
      if (result.valid) {
        setCodeValidation({
          valid: true,
          entity: result.entity?.name,
          userGroup: result.userGroup?.name
        })
      } else {
        setCodeValidation({ valid: false })
      }
    } catch (error) {
      console.error('❌ Code validation error:', error)
      setCodeValidation({ valid: false })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Signup form submitted', formData)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Passwords do not match')
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      console.log('❌ Password too short')
      setError('Password must be at least 6 characters')
      return
    }

    if (!codeValidation?.valid) {
      console.log('❌ Invalid registration code', codeValidation)
      setError('Please enter a valid registration code')
      return
    }

    setIsLoading(true)
    console.log('📝 Attempting signup...')

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.registrationCode
      )
      
      console.log('📬 Signup result:', result)
      
      if (result.success) {
        console.log('✅ Signup successful!')
        onSuccess?.()
      } else {
        console.error('❌ Signup failed:', result.error)
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      console.error('💥 Signup exception:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Join IS-AI Beta
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Create your account to get started
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="form-input"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Registration Code</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={formData.registrationCode}
              onChange={(e) => handleInputChange('registrationCode', e.target.value)}
              className="form-input"
              placeholder="Enter your registration code"
              style={{ paddingRight: '40px' }}
              required
            />
            {codeValidation?.valid && (
              <CheckCircle
                size={16}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#10b981'
                }}
              />
            )}
          </div>
          {codeValidation?.valid && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#15803d'
            }}>
              ✓ Valid code for {codeValidation.entity} - {codeValidation.userGroup}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="form-input"
              placeholder="Create a password"
              style={{ paddingRight: '40px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="form-input"
              placeholder="Confirm your password"
              style={{ paddingRight: '40px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !codeValidation?.valid}
          className="btn btn-primary"
          style={{
            width: '100%',
            marginBottom: '16px',
            opacity: (!codeValidation?.valid && !isLoading) ? 0.5 : 1
          }}
        >
          {isLoading ? (
            <div className="spinner" />
          ) : (
            <>
              <UserPlus size={16} />
              Create Account
            </>
          )}
        </button>

        <div style={{
          textAlign: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{
                color: 'var(--primary-blue)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}