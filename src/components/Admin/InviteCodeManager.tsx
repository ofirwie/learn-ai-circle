import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'

interface RegistrationCode {
  id: string
  code: string
  description: string
  max_uses: number
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
  entity: {
    name: string
    type: string
  } | null
  user_group: {
    name: string
    permissions: string[]
  } | null
}

interface InviteCodeManagerProps {
  onClose: () => void
}

export const InviteCodeManager: React.FC<InviteCodeManagerProps> = ({ onClose }) => {
  const [codes, setCodes] = useState<RegistrationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCode, setNewCode] = useState({
    code: '',
    description: '',
    max_uses: 100,
    expires_at: '',
  })

  useEffect(() => {
    fetchRegistrationCodes()
  }, [])

  const fetchRegistrationCodes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('registration_codes')
        .select(`
          *,
          entity:entities(name, type),
          user_group:user_groups(name, permissions)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setCodes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registration codes')
      console.error('Error fetching registration codes:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('registration_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId)

      if (error) throw error

      // Update local state
      setCodes(prev => prev.map(code => 
        code.id === codeId 
          ? { ...code, is_active: !currentStatus }
          : code
      ))
    } catch (err) {
      setError('Failed to update code status')
      console.error('Error updating code:', err)
    }
  }

  const createNewCode = async () => {
    if (!newCode.code.trim()) {
      setError('Code is required')
      return
    }

    try {
      setCreating(true)
      setError(null)

      const { data, error } = await supabase
        .from('registration_codes')
        .insert({
          code: newCode.code.trim().toUpperCase(),
          description: newCode.description.trim() || 'Custom registration code',
          max_uses: newCode.max_uses,
          expires_at: newCode.expires_at || null,
          is_active: true
        })
        .select(`
          *,
          entity:entities(name, type),
          user_group:user_groups(name, permissions)
        `)
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Code already exists')
        }
        throw error
      }

      // Add to local state
      setCodes(prev => [data, ...prev])
      
      // Reset form
      setNewCode({
        code: '',
        description: '',
        max_uses: 100,
        expires_at: '',
      })
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create code')
      console.error('Error creating code:', err)
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadge = (isActive: boolean) => ({
    backgroundColor: isActive ? '#10b981' : '#ef4444',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  })

  const getUsageColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return '#ef4444' // Red
    if (percentage >= 70) return '#f59e0b' // Amber
    return '#10b981' // Green
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: 0,
            color: '#1f2937'
          }}>
            🎟️ Invite Code Manager
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          {/* Create New Code Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: 0,
                color: '#374151'
              }}>
                Registration Codes
              </h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ➕ Create New Code
              </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>
                      Code *
                    </label>
                    <input
                      type="text"
                      value={newCode.code}
                      onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="Enter code (e.g., NEWCODE2024)"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '6px',
                      color: '#374151'
                    }}>
                      Max Uses
                    </label>
                    <input
                      type="number"
                      value={newCode.max_uses}
                      onChange={(e) => setNewCode(prev => ({ ...prev, max_uses: parseInt(e.target.value) || 100 }))}
                      min="1"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: '#374151'
                  }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCode.description}
                    onChange={(e) => setNewCode(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose of this code"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: '#374151'
                  }}>
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newCode.expires_at}
                    onChange={(e) => setNewCode(prev => ({ ...prev, expires_at: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={createNewCode}
                    disabled={creating || !newCode.code.trim()}
                    style={{
                      backgroundColor: creating ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: creating || !newCode.code.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      opacity: creating || !newCode.code.trim() ? 0.5 : 1
                    }}
                  >
                    {creating ? 'Creating...' : 'Create Code'}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      border: '1px solid #d1d5db',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Codes List */}
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              color: '#64748b'
            }}>
              Loading codes...
            </div>
          ) : (
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Code</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Usage</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Expires</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code, index) => (
                    <tr key={code.id} style={{
                      borderTop: index > 0 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                    }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '16px' }}>
                          {code.code}
                        </div>
                        {code.entity && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {code.entity.name} • {code.user_group?.name}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>
                        {code.description}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: getUsageColor(code.current_uses, code.max_uses)
                        }}>
                          {code.current_uses} / {code.max_uses}
                        </div>
                        <div style={{
                          width: '60px',
                          height: '4px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '2px',
                          marginTop: '4px'
                        }}>
                          <div style={{
                            width: `${Math.min((code.current_uses / code.max_uses) * 100, 100)}%`,
                            height: '100%',
                            backgroundColor: getUsageColor(code.current_uses, code.max_uses),
                            borderRadius: '2px'
                          }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>
                        {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={getStatusBadge(code.is_active)}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => toggleCodeStatus(code.id, code.is_active)}
                          style={{
                            backgroundColor: code.is_active ? '#ef4444' : '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {code.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}