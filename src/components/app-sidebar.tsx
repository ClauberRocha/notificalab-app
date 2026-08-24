import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  FilePlus,
  List,
  BarChart3,
  Users,
  ClipboardList,
  LogOut,
  ShieldCheck,
  MapPin,
  Bell,
  Activity,
  Building,
  FileText,
  Bot,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_BADGE_CLASSES, ROLE_LABELS, type Permission } from "@/lib/rbac";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutGrid;
  permission?: Permission;
};

type SidebarGroup = {
  label: string;
  items: NavItem[];
};

const groups: SidebarGroup[] = [
  {
    label: "Inteligência e Gestão",
    items: [
      { title: "Dashboard Executivo", url: "/painel?tab=dashboard", icon: LayoutGrid },
      { title: "Análise Epidemiológica", url: "/painel?tab=analise", icon: BarChart3 },
      { title: "Mapa de Risco", url: "/painel?tab=mapa", icon: MapPin },
      { title: "Central de Alertas", url: "/painel?tab=alertas", icon: Bell },
      { title: "Indicadores", url: "/painel?tab=indicadores", icon: Activity },
      { title: "Municípios", url: "/painel?tab=municipios", icon: Building },
      { title: "Relatórios", url: "/painel?tab=relatorios", icon: FileText },
      { title: "Assistente IA", url: "/painel?tab=ia", icon: Bot },
    ],
  },
  {
    label: "Cadastro e Operações",
    items: [
      { title: "Nova Ficha", url: "/nova-ficha", icon: FilePlus, permission: "fichas.create" },
      { title: "Fichas Cadastradas", url: "/fichas", icon: List, permission: "fichas.view" },
    ],
  },
  {
    label: "Administração",
    items: [
      { title: "Usuários", url: "/usuarios", icon: Users, permission: "users.view" },
      { title: "Logs do Sistema", url: "/logs", icon: ClipboardList, permission: "logs.view" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Configurações", url: "/painel?tab=config", icon: Settings, permission: "system.settings" },
    ],
  },

];


function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const { user, signOut, role, can, loading } = useAuth();

  const isActive = (url: string) => {
    const [path, query] = url.split("?");
    const pathMatch = pathname === path;
    if (!query) {
      return url === "/"
        ? pathname === "/"
        : pathname === url || pathname.startsWith(`${url}/`);
    }

    const currentTab = (search?.tab as string) || "dashboard";
    const tabMatch = query.includes(`tab=${currentTab}`);
    return pathMatch && tabMatch;
  };

  const roleLabel = loading ? "Carregando perfil" : role ? ROLE_LABELS[role] : "Sem perfil";
  const roleClass = role ? ROLE_BADGE_CLASSES[role] : "bg-muted text-muted-foreground border-border";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/60 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                Notifica-MA Intelligence
              </p>
              <p className="truncate text-[10px] leading-tight text-sidebar-foreground/60">
                Monitoramento e Decisão em Saúde
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials(user?.full_name ?? "U")}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.full_name ?? "Usuário"}
              </p>
              <span
                className={`mt-0.5 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleClass}`}
                title={`Perfil: ${roleLabel}`}
              >
                {roleLabel}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-4">
        {groups.map((group) => {
          const visibleGroupItems = group.items.filter((it) => {
            // Esconde itens do painel/configurações para usuário comum
            if (role === "user" && it.url.startsWith("/painel")) return false;
            if (!it.permission) return true;
            if (loading) return true;
            return can(it.permission);
          });

          if (visibleGroupItems.length === 0) return null;

          return (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <h4 className="px-3 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider">
                  {group.label}
                </h4>
              )}
              <SidebarMenu className="gap-0.5">
                {visibleGroupItems.map((item) => {
                  const active = isActive(item.url);
                  const gestorDisabledUrls = ["/nova-ficha", "/usuarios"];
                  const isDisabled =
                    (role === "user" && item.url.startsWith("/painel")) ||
                    (role === "gestor" && gestorDisabledUrls.includes(item.url));

                  if (isDisabled) {
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          disabled
                          tooltip={item.title}
                          className="h-9 rounded-lg opacity-40 cursor-not-allowed pointer-events-none text-sidebar-foreground/45"
                        >
                          <item.icon className="h-4 w-4 shrink-0 text-sidebar-foreground/35" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={
                          active
                            ? "h-9 rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                            : "h-9 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                        }
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>

            </div>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              onClick={() => signOut()}
              className="h-10 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <p className="px-2 pt-2 text-center text-[10px] text-sidebar-foreground/40">
            Ministério da Saúde — SVS
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
