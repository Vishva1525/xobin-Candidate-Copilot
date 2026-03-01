import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLocalStorage } from './use-local-storage';
import { xobinApplication } from '@/lib/mock-data';
import { getRoleById, XobinRole } from '@/lib/xobin-roles';

export interface RoleContext {
  mode: 'application' | 'exploration';
  roleId: string;
  roleTitle: string;
  jdFull: string;
  company: string;
}

interface RoleContextValue {
  activeRole: RoleContext;
  setExplorationRole: (role: XobinRole) => void;
  clearExploration: () => void;
  isExploring: boolean;
}

const defaultAppRole: RoleContext = {
  mode: 'application',
  roleId: xobinApplication.id,
  roleTitle: xobinApplication.role,
  jdFull: xobinApplication.jobDescription,
  company: 'Xobin',
};

const RoleCtx = createContext<RoleContextValue>({
  activeRole: defaultAppRole,
  setExplorationRole: () => {},
  clearExploration: () => {},
  isExploring: false,
});

export function RoleContextProvider({ children }: { children: ReactNode }) {
  const [explorationRoleId, setExplorationRoleId] = useLocalStorage<string | null>('candidateos_exploration_role', null);

  const explorationRole = explorationRoleId ? getRoleById(explorationRoleId) : null;

  const activeRole: RoleContext = explorationRole
    ? {
        mode: 'exploration',
        roleId: explorationRole.id,
        roleTitle: explorationRole.title,
        jdFull: explorationRole.jdFull,
        company: 'Xobin',
      }
    : defaultAppRole;

  const setExplorationRole = useCallback((role: XobinRole) => {
    setExplorationRoleId(role.id);
  }, [setExplorationRoleId]);

  const clearExploration = useCallback(() => {
    setExplorationRoleId(null);
  }, [setExplorationRoleId]);

  return (
    <RoleCtx.Provider value={{ activeRole, setExplorationRole, clearExploration, isExploring: activeRole.mode === 'exploration' }}>
      {children}
    </RoleCtx.Provider>
  );
}

export function useRoleContext() {
  return useContext(RoleCtx);
}
