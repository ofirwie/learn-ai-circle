import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  user_metadata: any;
  profile?: {
    full_name?: string;
    entity_id?: string;
    user_group_id?: string;
    is_active?: boolean;
  };
}

interface SimpleUserManagerProps {
  onClose: () => void;
}

const SimpleUserManager: React.FC<SimpleUserManagerProps> = ({ onClose }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simplified query - just get user profiles without complex joins
      const { data: profiles, error: profileError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profileError) {
        console.error('Error fetching user profiles:', profileError);
        // Try a minimal query as last resort
        const { data: minimalProfiles, error: minimalError } = await supabase
          .from('users')
          .select('id, email, created_at, updated_at, is_active')
          .limit(100);
        
        if (minimalError) {
          throw new Error('Unable to load users. Please check database permissions.');
        }
        
        setUsers((minimalProfiles || []).map(p => ({
          id: p.id,
          email: p.email || 'Unknown',
          created_at: p.created_at,
          last_sign_in_at: p.updated_at,
          user_metadata: {},
          profile: p
        })));
      } else {
        setUsers((profiles || []).map(p => ({
          id: p.id || p.user_id,
          email: p.email || 'Unknown',
          created_at: p.created_at,
          last_sign_in_at: p.updated_at,
          user_metadata: {},
          profile: {
            ...p,
            full_name: p.full_name || p.email?.split('@')[0] || 'User',
            is_active: p.is_active !== false
          }
        })));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users. This may require admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            profile: { ...user.profile, is_active: !currentStatus }
          };
        }
        return user;
      }));
    } catch (error) {
      console.error('Failed to update user status:', error);
      setError('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user');
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to promote this user to admin? This will give them full system access.')) {
      return;
    }

    try {
      setError(null);
      
      // First, get the admin entity and group IDs
      const { data: adminEntity } = await supabase
        .from('entities')
        .select('id')
        .eq('code_prefix', 'ADMIN')
        .single();

      if (!adminEntity) {
        throw new Error('Admin entity not found. Please run the admin setup SQL first.');
      }

      const { data: adminGroup } = await supabase
        .from('user_groups')
        .select('id')
        .eq('entity_id', adminEntity.id)
        .eq('name', 'Administrators')
        .single();

      if (!adminGroup) {
        throw new Error('Admin user group not found. Please run the admin setup SQL first.');
      }

      // Update the user's entity and group
      const { error } = await supabase
        .from('users')
        .update({ 
          entity_id: adminEntity.id,
          user_group_id: adminGroup.id
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            profile: { 
              ...user.profile, 
              entity_id: adminEntity.id,
              user_group_id: adminGroup.id
            }
          };
        }
        return user;
      }));

      alert('User successfully promoted to admin!');
    } catch (error) {
      console.error('Failed to promote user:', error);
      setError('Failed to promote user to admin: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const createRegistrationCode = async () => {
    const code = prompt('Enter new registration code:');
    if (!code) return;

    const maxUses = parseInt(prompt('Maximum uses (default 10):') || '10');

    try {
      setError(null);
      console.log('🔍 Starting registration code creation debug...');
      
      // Get the admin entity and user group with detailed logging
      console.log('📊 Querying admin entity...');
      const { data: adminEntity, error: entityError } = await supabase
        .from('entities')
        .select('id, name, code_prefix')
        .eq('code_prefix', 'ADMIN')
        .single();

      console.log('🏢 Admin entity result:', { adminEntity, entityError });

      if (entityError) {
        throw new Error(`Failed to query admin entity: ${entityError.message}`);
      }

      if (!adminEntity) {
        throw new Error('Admin entity not found. Please run the setup-admin-access.sql script in Supabase SQL Editor first.');
      }

      console.log('👥 Querying admin user group...');
      const { data: adminGroup, error: groupError } = await supabase
        .from('user_groups')
        .select('id, name, entity_id')
        .eq('entity_id', adminEntity.id)
        .eq('name', 'Administrators')
        .single();

      console.log('👑 Admin group result:', { adminGroup, groupError });

      if (groupError) {
        throw new Error(`Failed to query admin user group: ${groupError.message}`);
      }

      if (!adminGroup) {
        throw new Error('Admin user group not found. Please run the setup-admin-access.sql script in Supabase SQL Editor first.');
      }

      console.log('💾 Creating registration code with data:', {
        code: code.toUpperCase(),
        max_uses: maxUses,
        entity_id: adminEntity.id,
        user_group_id: adminGroup.id
      });

      const { data: newCode, error: insertError } = await supabase
        .from('registration_codes')
        .insert({
          code: code.toUpperCase(),
          max_uses: maxUses,
          current_uses: 0,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          entity_id: adminEntity.id,
          user_group_id: adminGroup.id
        })
        .select()
        .single();

      console.log('🎯 Insert result:', { newCode, insertError });

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message} (Code: ${insertError.code})`);
      }

      alert(`Registration code '${code.toUpperCase()}' created successfully!`);
      console.log('✅ Registration code created successfully:', newCode);
    } catch (error) {
      console.error('❌ Registration code creation failed:', error);
      
      // Enhanced error reporting
      let errorMessage = 'Failed to create registration code: ';
      if (error instanceof Error) {
        errorMessage += error.message;
        
        // Add helpful hints based on error type
        if (error.message.includes('Admin entity not found')) {
          errorMessage += '\n\n🔧 Fix: Run the setup-admin-access.sql script in your Supabase SQL Editor';
        } else if (error.message.includes('Admin user group not found')) {
          errorMessage += '\n\n🔧 Fix: Run the setup-admin-access.sql script in your Supabase SQL Editor';
        } else if (error.message.includes('duplicate key')) {
          errorMessage += '\n\n🔧 Fix: Try a different code name - this one already exists';
        } else if (error.message.includes('permission denied')) {
          errorMessage += '\n\n🔧 Fix: Make sure you have admin privileges and RLS policies are set correctly';
        }
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      setError(errorMessage);
      
      // Also show in alert for immediate visibility
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div>Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        zIndex: 9999
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              👥 User Management
            </h2>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
              Manage registered users and their permissions
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            margin: '20px',
            padding: '12px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={createRegistrationCode}
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
            🎫 Create Registration Code
          </button>
          <button
            onClick={fetchUsers}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh Users
          </button>
        </div>

        {/* Users List */}
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '16px'
          }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  background: user.profile?.is_active === false ? '#fef2f2' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                      {user.profile?.full_name || user.email}
                    </h3>
                    <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                      {user.email}
                    </p>
                  </div>
                  <div style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: user.profile?.is_active === false ? '#fee2e2' : '#dcfce7',
                    color: user.profile?.is_active === false ? '#dc2626' : '#059669'
                  }}>
                    {user.profile?.is_active === false ? 'Inactive' : 'Active'}
                  </div>
                </div>

                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
                  {user.last_sign_in_at && (
                    <div>Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleUserStatus(user.id, user.profile?.is_active !== false)}
                    style={{
                      background: user.profile?.is_active === false ? '#059669' : '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {user.profile?.is_active === false ? '✅ Activate' : '⏸️ Deactivate'}
                  </button>
                  <button
                    onClick={() => promoteToAdmin(user.id)}
                    style={{
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    👑 Make Admin
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h3>No Users Found</h3>
              <p>No users are currently registered or you may need admin privileges to view them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleUserManager;