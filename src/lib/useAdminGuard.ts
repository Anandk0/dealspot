"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

export type AdminRole = "CHECKER" | "ADMIN" | "SUPER_ADMIN";

const ROLE_HIERARCHY: Record<string, number> = {
  USER: 0,
  CHECKER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/**
 * Returns true if `userRole` meets or exceeds `minimumRole` in the hierarchy.
 */
export function hasMinimumRole(
  userRole: string | undefined | null,
  minimumRole: AdminRole
): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? Infinity;
  return userLevel >= requiredLevel;
}

/**
 * Hook that guards admin pages by checking the user's role.
 * Redirects to /login if the user is not authenticated or lacks the required role.
 */
export function useAdminGuard(minimumRole: AdminRole): {
  isAuthorized: boolean;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAuthorized = !isLoading && !!user && hasMinimumRole(user.role, minimumRole);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !hasMinimumRole(user.role, minimumRole)) {
      router.push("/login");
    }
  }, [isLoading, user, minimumRole, router]);

  return { isAuthorized, isLoading };
}
