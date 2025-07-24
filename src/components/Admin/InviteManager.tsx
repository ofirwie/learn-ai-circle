import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { registrationCodeService } from '../../services/registrationCodeService'

interface Entity {
  id: string
  name: string
  code_prefix: string
}

interface UserGroup {
  id: string
  name: string
  description: string
}

interface InviteTemplate {
  subject: string
  message: string
}

interface InviteManagerProps {
  onClose: () => void
}

export const InviteManager: React.FC<InviteManagerProps> = ({ onClose }) => {
  const [entities, setEntities] = useState<Entity[]>([])
  const [userGroups, setUserGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [inviteEmails, setInviteEmails] = useState('')
  const [selectedEntity, setSelectedEntity] = useState('')
  const [selectedUserGroup, setSelectedUserGroup] = useState('')
  const [inviteTemplate, setInviteTemplate] = useState<InviteTemplate>({
    subject: 'You\'re invited to join ISAI Knowledge Hub',
    message: 'Hi there!\n\nYou\'ve been invited to join our AI Knowledge Hub. This is a private community where we share the latest insights, guides, and tools in artificial intelligence.\n\nClick the link below to create your account:\n{INVITE_LINK}\n\nYour registration code is: {REGISTRATION_CODE}\n\nWelcome aboard!\n\nBest regards,\nThe ISAI Team'
  })
  const [codePrefix, setCodePrefix] = useState('')
  const [maxUses, setMaxUses] = useState(1)
  const [expiresInDays, setExpiresInDays] = useState(30)

  useEffect(() => {
    fetchEntitiesAndGroups()
  }, [])

  const fetchEntitiesAndGroups = async () => {
    try {
      setLoading(true)
      
      // Fetch entities
      const { data: entitiesData, error: entitiesError } = await supabase
        .from('entities')
        .select('id, name, code_prefix')
        .order('name')

      if (entitiesError) throw entitiesError

      // Fetch user groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('user_groups')
        .select('id, name, description, entity_id')
        .order('name')

      if (groupsError) throw groupsError

      setEntities(entitiesData || [])
      setUserGroups(groupsData || [])
      
      // Set default selections if available
      if (entitiesData && entitiesData.length > 0) {
        const defaultEntity = entitiesData.find(e => e.code_prefix === 'ADMIN') || entitiesData[0]
        setSelectedEntity(defaultEntity.id)
        
        if (groupsData) {
          const entityGroups = groupsData.filter(g => g.entity_id === defaultEntity.id)
          if (entityGroups.length > 0) {
            setSelectedUserGroup(entityGroups[0].id)
          }
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entities and groups')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateInviteCode = (email: string): string => {
    const emailPrefix = email.split('@')[0].toUpperCase()
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const prefixPart = codePrefix ? `${codePrefix}_` : 'INV_'
    return `${prefixPart}${emailPrefix}_${randomSuffix}`
  }

  const createInviteLink = (code: string): string => {
    const baseUrl = window.location.origin
    return `${baseUrl}?code=${code}`
  }

  const sendEmailInvite = async (email: string, code: string, inviteLink: string) => {
    // For now, we'll create a mock email service
    // In production, this would integrate with Supabase Edge Functions or another email service
    
    const emailContent = {
      to: email,
      subject: inviteTemplate.subject,
      html: inviteTemplate.message
        .replace(/\{INVITE_LINK\}/g, `<a href="${inviteLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${inviteLink}</a>`)
        .replace(/\{REGISTRATION_CODE\}/g, `<strong style="color: #dc2626; font-family: monospace; font-size: 16px;">${code}</strong>`)
        .replace(/\n/g, '<br>')
    }
    
    // TODO: Implement actual email sending via Supabase Edge Function
    console.log('Email invitation prepared:', emailContent)
    
    // For now, just return success
    return { success: true }
  }

  const handleSendInvites = async () => {
    if (!inviteEmails.trim()) {
      setError('Please enter at least one email address')
      return
    }

    if (!selectedEntity || !selectedUserGroup) {
      setError('Please select an entity and user group')
      return
    }

    try {
      setSending(true)
      setError(null)
      setSuccess(null)

      // Parse email addresses
      const emails = inviteEmails
        .split(/[,\n;]/)
        .map(email => email.trim())
        .filter(email => email && email.includes('@'))

      if (emails.length === 0) {
        setError('No valid email addresses found')
        return
      }

      const results = []
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + expiresInDays)

      for (const email of emails) {
        try {
          // Generate unique code for this email
          const code = generateInviteCode(email)
          
          // Create registration code
          const { data: registrationCode, error: codeError } = await supabase
            .from('registration_codes')
            .insert({
              code: code,
              description: `Email invitation for ${email}`,
              max_uses: maxUses,
              expires_at: expiry.toISOString(),
              entity_id: selectedEntity,
              user_group_id: selectedUserGroup,
              is_active: true
            })
            .select()
            .single()

          if (codeError) {
            throw new Error(`Failed to create code for ${email}: ${codeError.message}`)
          }

          // Generate invite link
          const inviteLink = createInviteLink(code)
          
          // Send email invitation
          const emailResult = await sendEmailInvite(email, code, inviteLink)
          
          results.push({
            email,
            code,
            inviteLink,
            success: emailResult.success
          })
          
        } catch (emailError) {
          console.error(`Failed to process invite for ${email}:`, emailError)
          results.push({
            email,
            success: false,
            error: emailError instanceof Error ? emailError.message : 'Unknown error'
          })
        }
      }

      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        setSuccess(`Successfully sent ${successCount} invitation${successCount > 1 ? 's' : ''}${failCount > 0 ? ` (${failCount} failed)` : ''}`)
        
        // Show the generated codes and links for manual sharing if needed
        const successResults = results.filter(r => r.success)
        console.log('Generated invitation codes and links:')
        successResults.forEach(result => {
          console.log(`${result.email}: ${result.code} -> ${result.inviteLink}`)
        })
        
        // Clear the form
        setInviteEmails('')
      } else {
        setError('Failed to send any invitations. Check the console for details.')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations')
      console.error('Error sending invites:', err)
    } finally {
      setSending(false)
    }
  }

  const getFilteredUserGroups = (): UserGroup[] => {
    if (!selectedEntity) return userGroups
    return userGroups.filter(group => group.entity_id === selectedEntity)
  }

  if (loading) {
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
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div>Loading invite manager...</div>
        </div>
      </div>
    )
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
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
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
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              margin: 0,
              color: '#1f2937'
            }}>
              📧 Send Invitations
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: '4px 0 0 0'
            }}>
              Invite users via email with automatic registration codes
            </p>
          </div>
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

          {success && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#059669',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              {success}
            </div>
          )}

          {/* Email Addresses */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#374151'
            }}>
              Email Addresses *
            </label>
            <textarea
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              placeholder="Enter email addresses (one per line or comma-separated)&#10;example1@company.com&#10;example2@company.com"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Entity and User Group Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Entity *
              </label>
              <select
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value)
                  setSelectedUserGroup('') // Reset user group selection
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select entity...</option>
                {entities.map(entity => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name} ({entity.code_prefix})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                User Group *
              </label>
              <select
                value={selectedUserGroup}
                onChange={(e) => setSelectedUserGroup(e.target.value)}
                disabled={!selectedEntity}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  opacity: !selectedEntity ? 0.5 : 1
                }}
              >
                <option value="">Select user group...</option>
                {getFilteredUserGroups().map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code Settings */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Code Prefix
              </label>
              <input
                type="text"
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
                placeholder="INV"
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
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Max Uses per Code
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
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
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Expires in Days
              </label>
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
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

          {/* Email Template */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#374151'
            }}>
              Email Template
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Subject
              </label>
              <input
                type="text"
                value={inviteTemplate.subject}
                onChange={(e) => setInviteTemplate(prev => ({ ...prev, subject: e.target.value }))}
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
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Message
              </label>
              <textarea
                value={inviteTemplate.message}
                onChange={(e) => setInviteTemplate(prev => ({ ...prev, message: e.target.value }))}
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '8px'
              }}>
                Use {'{INVITE_LINK}'} and {'{REGISTRATION_CODE}'} as placeholders in your message
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                color: '#64748b',
                border: '1px solid #d1d5db',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvites}
              disabled={sending || !inviteEmails.trim() || !selectedEntity || !selectedUserGroup}
              style={{
                backgroundColor: sending ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: sending || !inviteEmails.trim() || !selectedEntity || !selectedUserGroup ? 0.5 : 1
              }}
            >
              {sending ? 'Sending Invitations...' : 'Send Invitations'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}