import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface PermissionConfig {
  // Content permissions
  'content.view': boolean;
  'content.create': boolean;
  'content.edit': boolean;
  'content.delete': boolean;
  'content.publish': boolean;
  
  // Article permissions
  'articles.view': boolean;
  'articles.create': boolean;
  'articles.edit': boolean;
  'articles.delete': boolean;
  'articles.publish': boolean;
  
  // User management permissions
  'users.view': boolean;
  'users.create': boolean;
  'users.edit': boolean;
  'users.delete': boolean;
  'users.manage_roles': boolean;
  
  // Analytics permissions
  'analytics.view': boolean;
  'analytics.export': boolean;
  'analytics.manage': boolean;
  
  // Registration code permissions
  'codes.view': boolean;
  'codes.create': boolean;
  'codes.edit': boolean;
  'codes.delete': boolean;
  'codes.analytics': boolean;
  
  // Admin permissions
  'admin.access': boolean;
  'admin.manage_entities': boolean;
  'admin.manage_groups': boolean;
  'admin.system_settings': boolean;
  
  // Forum permissions (if applicable)
  'forum.view': boolean;
  'forum.post': boolean;
  'forum.moderate': boolean;
  
  // Comment permissions
  'comments.view': boolean;
  'comments.create': boolean;
  'comments.edit': boolean;
  'comments.delete': boolean;
  'comments.moderate': boolean;
}

export const DEFAULT_PERMISSIONS: PermissionConfig = {
  // Content permissions
  'content.view': true,
  'content.create': false,
  'content.edit': false,
  'content.delete': false,
  'content.publish': false,
  
  // Article permissions
  'articles.view': true,
  'articles.create': false,
  'articles.edit': false,
  'articles.delete': false,
  'articles.publish': false,
  
  // User management permissions
  'users.view': false,
  'users.create': false,
  'users.edit': false,
  'users.delete': false,
  'users.manage_roles': false,
  
  // Analytics permissions
  'analytics.view': false,
  'analytics.export': false,
  'analytics.manage': false,
  
  // Registration code permissions
  'codes.view': false,
  'codes.create': false,
  'codes.edit': false,
  'codes.delete': false,
  'codes.analytics': false,
  
  // Admin permissions
  'admin.access': false,
  'admin.manage_entities': false,
  'admin.manage_groups': false,
  'admin.system_settings': false,
  
  // Forum permissions
  'forum.view': true,
  'forum.post': false,
  'forum.moderate': false,
  
  // Comment permissions
  'comments.view': true,
  'comments.create': false,
  'comments.edit': false,
  'comments.delete': false,
  'comments.moderate': false,
};

// Admin permissions configuration
export const ADMIN_PERMISSIONS: PermissionConfig = {
  ...DEFAULT_PERMISSIONS,
  // Grant all permissions to admins
  'content.create': true,
  'content.edit': true,
  'content.delete': true,
  'content.publish': true,
  'articles.create': true,
  'articles.edit': true,
  'articles.delete': true,
  'articles.publish': true,
  'users.view': true,
  'users.create': true,
  'users.edit': true,
  'users.delete': true,
  'users.manage_roles': true,
  'analytics.view': true,
  'analytics.export': true,
  'analytics.manage': true,
  'codes.view': true,
  'codes.create': true,
  'codes.edit': true,
  'codes.delete': true,
  'codes.analytics': true,
  'admin.access': true,
  'admin.manage_entities': true,
  'admin.manage_groups': true,
  'admin.system_settings': true,
  'forum.post': true,
  'forum.moderate': true,
  'comments.create': true,
  'comments.edit': true,
  'comments.delete': true,
  'comments.moderate': true,
};

export const usePermissions = () => {
  const { userProfile, userGroup, entity } = useAuthStore();
  const [permissions, setPermissions] = useState<PermissionConfig>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculatePermissions();
  }, [userProfile, userGroup, entity]);

  const calculatePermissions = () => {
    if (!userProfile) {
      setPermissions(DEFAULT_PERMISSIONS);
      setLoading(false);
      return;
    }

    try {
      let calculatedPermissions = { ...DEFAULT_PERMISSIONS };

      // Check if user is admin (from entity code prefix)
      const isAdmin = entity?.code?.startsWith('ADMIN') || userGroup?.name?.toLowerCase().includes('admin');
      
      if (isAdmin) {
        calculatedPermissions = { ...ADMIN_PERMISSIONS };
      } else {
        // Apply group permissions
        if (userGroup?.permissions) {
          Object.keys(calculatedPermissions).forEach(permission => {
            if (userGroup.permissions[permission] !== undefined) {
              calculatedPermissions[permission as keyof PermissionConfig] = userGroup.permissions[permission];
            }
          });
        }

        // Apply personal permission overrides
        if (userProfile.personal_permissions) {
          Object.keys(calculatedPermissions).forEach(permission => {
            if (userProfile.personal_permissions[permission] !== undefined) {
              calculatedPermissions[permission as keyof PermissionConfig] = userProfile.personal_permissions[permission];
            }
          });
        }
      }

      setPermissions(calculatedPermissions);
    } catch (error) {
      console.error('Error calculating permissions:', error);
      setPermissions(DEFAULT_PERMISSIONS);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: keyof PermissionConfig): boolean => {
    return permissions[permission] === true;
  };

  const hasAnyPermission = (permissionList: (keyof PermissionConfig)[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionList: (keyof PermissionConfig)[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  };

  const canAccess = (resource: string, action: string): boolean => {
    const permissionKey = `${resource}.${action}` as keyof PermissionConfig;
    return hasPermission(permissionKey);
  };

  const isAdmin = (): boolean => {
    return hasPermission('admin.access');
  };

  const isModerator = (): boolean => {
    return hasAnyPermission(['forum.moderate', 'comments.moderate', 'content.publish']);
  };

  const canManageUsers = (): boolean => {
    return hasAnyPermission(['users.view', 'users.create', 'users.edit', 'users.manage_roles']);
  };

  const canViewAnalytics = (): boolean => {
    return hasPermission('analytics.view');
  };

  const canManageContent = (): boolean => {
    return hasAnyPermission(['content.create', 'content.edit', 'content.delete', 'content.publish']);
  };

  const canManageRegistrationCodes = (): boolean => {
    return hasAnyPermission(['codes.create', 'codes.edit', 'codes.delete', 'codes.analytics']);
  };

  // Entity-specific permissions
  const canAccessEntity = (entityId: string): boolean => {
    if (isAdmin()) return true;
    return userProfile?.entity_id === entityId;
  };

  const canEditOwnContent = (contentUserId: string): boolean => {
    if (isAdmin()) return true;
    return userProfile?.id === contentUserId && hasPermission('content.edit');
  };

  const canDeleteOwnContent = (contentUserId: string): boolean => {
    if (isAdmin()) return true;
    return userProfile?.id === contentUserId && hasPermission('content.delete');
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    isAdmin,
    isModerator,
    canManageUsers,
    canViewAnalytics,
    canManageContent,
    canManageRegistrationCodes,
    canAccessEntity,
    canEditOwnContent,
    canDeleteOwnContent,
    calculatePermissions
  };
};

export default usePermissions;