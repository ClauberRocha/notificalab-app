import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  type Permission,
  type Role,
  can as canDo,
  hasAnyRole as hasAnyRoleFn,
  highestRole,
  rolesFromRows,
} from "@/lib/rbac";
import { logAuthEvent } from "@/lib/audit.functions";


export interface AuthUser {
  id: string;
  email: string | null;
  full_name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  roles: Role[];
  role: Role | null;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  can: (permission: Permission) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfileAndRoles(
  authUser: User,
): Promise<{ profile: AuthUser; roles: Role[] }> {
  const metaName =
    (authUser.user_metadata?.full_name as string | undefined) ||
    (authUser.user_metadata?.name as string | undefined) ||
    "";

  const [profileResult, rolesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", authUser.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", authUser.id),
  ]);

  if (profileResult.error) {
    console.error("Falha ao carregar perfil do usuário:", profileResult.error.message);
  }

  if (rolesResult.error) {
    console.error("Falha ao carregar perfil de acesso do usuário:", rolesResult.error.message);
  }

  const profile = profileResult.data;
  const roleRows = rolesResult.data;

  return {
    profile: {
      id: authUser.id,
      email: authUser.email ?? null,
      full_name:
        profile?.full_name ||
        metaName ||
        (authUser.email?.split("@")[0] ?? "Usuário"),
    },
    roles: rolesFromRows(roleRows),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const apply = (u: AuthUser | null, r: Role[]) => {
      if (!mounted) return;
      setUser(u);
      setRoles(r);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(() => {
          loadProfileAndRoles(newSession.user).then((res) =>
            apply(res.profile, res.roles),
          );
        }, 0);
      } else {
        apply(null, []);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        loadProfileAndRoles(data.session.user).then((res) => {
          if (!mounted) return;
          apply(res.profile, res.roles);
          setLoading(false);
        }).catch((error) => {
          console.error("Falha ao inicializar usuário autenticado:", error);
          if (!mounted) return;
          apply(null, []);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (session?.user) {
      await logAuthEvent({
        data: {
          action: "logoff",
          email: session.user.email ?? null,
          userId: session.user.id,
        },
      }).catch(() => undefined);
    }
    await supabase.auth.signOut();
  };


  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      roles,
      role: roles.length ? highestRole(roles) : null,
      hasRole: (r: Role) => roles.includes(r),
      hasAnyRole: (allow: Role[]) => hasAnyRoleFn(roles, allow),
      can: (p: Permission) => canDo(roles, p),
      signOut,
    }),
    [user, session, loading, roles],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
