import React, { createContext, useContext, useState, useCallback } from 'react';
import { currentUser, mockUsers, rolePermissions, type UserInfo, type SystemRole } from '../mock/data';

interface PermissionContextType {
  user: UserInfo;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  switchRole: (role: SystemRole) => void;
  canAccessRoute: (routeKey: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  user: currentUser,
  hasPermission: () => true,
  hasAnyPermission: () => true,
  switchRole: () => {},
  canAccessRoute: () => true,
});

export const usePermission = () => useContext(PermissionContext);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo>(currentUser);

  const hasPermission = useCallback(
    (permission: string) => user.permissions.includes(permission),
    [user],
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) => permissions.some((p) => user.permissions.includes(p)),
    [user],
  );

  const switchRole = useCallback((role: SystemRole) => {
    const matchedUser = mockUsers.find((u) => u.role === role);
    if (matchedUser) {
      setUser({ ...matchedUser, permissions: rolePermissions[role] });
    }
  }, []);

  const canAccessRoute = useCallback(
    (routeKey: string) => {
      const key = routeKey.replace('/admin/', '');
      return user.permissions.includes(key);
    },
    [user],
  );

  return (
    <PermissionContext.Provider value={{ user, hasPermission, hasAnyPermission, switchRole, canAccessRoute }}>
      {children}
    </PermissionContext.Provider>
  );
};
