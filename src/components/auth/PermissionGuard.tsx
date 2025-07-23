import React from 'react';
import { usePermissions, PermissionConfig } from '@/hooks/usePermissions';
import { AlertTriangle, Lock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: keyof PermissionConfig;
  permissions?: (keyof PermissionConfig)[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY
  resource?: string;
  action?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  entityId?: string;
  contentUserId?: string; // For content ownership checks
  silent?: boolean; // If true, renders nothing when access denied
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  resource,
  action,
  fallback,
  showFallback = true,
  entityId,
  contentUserId,
  silent = false
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    canAccessEntity,
    canEditOwnContent,
    isAdmin,
    loading
  } = usePermissions();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Checking permissions...</span>
      </div>
    );
  }

  // Check permissions
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else if (resource && action) {
    hasAccess = canAccess(resource, action);
  } else {
    // Default to allowing access if no permissions are specified
    hasAccess = true;
  }

  // Check entity-specific access
  if (hasAccess && entityId) {
    hasAccess = canAccessEntity(entityId);
  }

  // Check content ownership
  if (hasAccess && contentUserId) {
    hasAccess = canEditOwnContent(contentUserId);
  }

  // Admin override
  if (isAdmin() && !hasAccess) {
    hasAccess = true;
  }

  // Grant access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Silent mode - render nothing
  if (silent) {
    return null;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback
  if (showFallback) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Lock className="w-5 h-5" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">
            You don't have permission to access this feature. Contact your administrator if you believe this is an error.
          </p>
          {(permission || permissions.length > 0) && (
            <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-700">
              <strong>Required permission{permissions.length > 1 ? 's' : ''}:</strong>{' '}
              {permission || permissions.join(', ')}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

// Convenience components for common permission checks
export const AdminGuard: React.FC<Omit<PermissionGuardProps, 'permission'>> = (props) => (
  <PermissionGuard permission="admin.access" {...props} />
);

export const ContentManagerGuard: React.FC<Omit<PermissionGuardProps, 'permissions'>> = (props) => (
  <PermissionGuard 
    permissions={['content.create', 'content.edit', 'content.delete', 'content.publish']} 
    {...props} 
  />
);

export const AnalyticsGuard: React.FC<Omit<PermissionGuardProps, 'permission'>> = (props) => (
  <PermissionGuard permission="analytics.view" {...props} />
);

export const UserManagerGuard: React.FC<Omit<PermissionGuardProps, 'permissions'>> = (props) => (
  <PermissionGuard 
    permissions={['users.view', 'users.create', 'users.edit', 'users.manage_roles']} 
    {...props} 
  />
);

export const CodeManagerGuard: React.FC<Omit<PermissionGuardProps, 'permissions'>> = (props) => (
  <PermissionGuard 
    permissions={['codes.view', 'codes.create', 'codes.edit', 'codes.analytics']} 
    {...props} 
  />
);

// Higher-order component for permission checking
export const withPermissions = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: {
    permission?: keyof PermissionConfig;
    permissions?: (keyof PermissionConfig)[];
    requireAll?: boolean;
    resource?: string;
    action?: string;
  }
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <PermissionGuard {...requiredPermissions}>
      <Component {...props} ref={ref} />
    </PermissionGuard>
  ));
};

// Hook for conditional rendering based on permissions
export const useConditionalRender = () => {
  const permissions = usePermissions();

  const renderIf = (
    condition: boolean,
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return condition ? component : (fallback || null);
  };

  const renderIfPermission = (
    permission: keyof PermissionConfig,
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIf(permissions.hasPermission(permission), component, fallback);
  };

  const renderIfAnyPermission = (
    permissionList: (keyof PermissionConfig)[],
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIf(permissions.hasAnyPermission(permissionList), component, fallback);
  };

  const renderIfAdmin = (
    component: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return renderIf(permissions.isAdmin(), component, fallback);
  };

  return {
    renderIf,
    renderIfPermission,
    renderIfAnyPermission,
    renderIfAdmin,
    ...permissions
  };
};

// Notification component for permission requirements
export const PermissionNotification: React.FC<{
  title?: string;
  description?: string;
  permission?: keyof PermissionConfig;
  permissions?: (keyof PermissionConfig)[];
  variant?: 'warning' | 'info' | 'error';
}> = ({
  title = "Permission Required",
  description = "You need additional permissions to access this feature.",
  permission,
  permissions = [],
  variant = 'warning'
}) => {
  const Icon = variant === 'error' ? AlertTriangle : variant === 'warning' ? Shield : Lock;

  return (
    <Alert className={`
      ${variant === 'error' ? 'border-red-200 bg-red-50' : ''}
      ${variant === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
      ${variant === 'info' ? 'border-blue-200 bg-blue-50' : ''}
    `}>
      <Icon className="h-4 w-4" />
      <AlertDescription>
        <div>
          <strong>{title}</strong>
          <p className="mt-1 text-sm">{description}</p>
          {(permission || permissions.length > 0) && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <strong>Required:</strong> {permission || permissions.join(', ')}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PermissionGuard;