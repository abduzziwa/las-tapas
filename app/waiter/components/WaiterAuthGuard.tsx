'use client';
import { useEffect, ReactNode } from 'react';

interface Props { children: ReactNode }

export default function WaiterAuthGuard({ children }: Props) {
  useEffect(() => {
    // Hydrate sessionStorage from the verified server cookie so all
    // client components (name display, audit logs) have the employee data.
    if (!sessionStorage.getItem('employeeId')) {
      fetch('/api/auth/me')
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.employeeId) {
            sessionStorage.setItem('employeeId',   data.employeeId);
            sessionStorage.setItem('employeeName', data.name);
            sessionStorage.setItem('employeeRole', data.role);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Middleware already blocked unauthenticated requests before this renders.
  return <>{children}</>;
}
