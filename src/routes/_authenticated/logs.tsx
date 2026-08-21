import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Trash2,
  ClipboardList,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/logs")({
  head: () => ({ meta: [{ title: "Logs do Sistema" }] }),
  beforeLoad: ({ context }) => {
    const role = (context as { role?: string }).role;
    if (role !== "admin") throw redirect({ to: "/" });
  },

  component: LogsPage,
});

const ACTION_LABELS: Record<string, string> = {
  login: "Login",
  login_failed: "Tentativa de Login Falha",
  logoff: "Logoff",
  password_reset_requested: "Redefinição Solicitada",
  password_reset_completed: "Redefinição Concluída",
  password_changed: "Senha Alterada",
  create: "Criação",
  update: "Edição",
  delete: "Exclusão",
  invite_user: "Convite de Usuário",
  block_user: "Bloqueio de Usuário",
  other: "Outro",
};

const ACTION_COLORS: Record<string, string> = {
  login: "bg-green-100 text-green-700 border-green-200",
  login_failed: "bg-red-100 text-red-700 border-red-200",
  logoff: "bg-slate-100 text-slate-600 border-slate-200",
  password_reset_requested: "bg-amber-100 text-amber-700 border-amber-200",
  password_reset_completed: "bg-teal-100 text-teal-700 border-teal-200",
  password_changed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  create: "bg-blue-100 text-blue-700 border-blue-200",
  update: "bg-yellow-100 text-yellow-700 border-yellow-200",
  delete: "bg-red-100 text-red-700 border-red-200",
  invite_user: "bg-purple-100 text-purple-700 border-purple-200",
  block_user: "bg-orange-100 text-orange-700 border-orange-200",
  other: "bg-muted text-muted-foreground border-border",
};


type LogRow = {
  id: string;
  action: string;
  description: string | null;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};

function LogsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_roles" as never)
        .select("role")
        .eq("user_id", user.id);
      const list = (data ?? []) as Array<{ role: string }>;
      setIsAdmin(list.some((r) => r.role === "admin"));
    })();
  }, [user]);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["system-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_logs" as never)
        .select(
          "id, action, description, user_name, user_email, user_role, entity_type, entity_id, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as LogRow[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("system_logs" as never)
        .delete()
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-logs"] });
      setSelectedIds([]);
      toast.success("Logs excluídos com sucesso.");
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao excluir logs."),
  });

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (log.description ?? "").toLowerCase().includes(q) ||
      (log.user_name ?? "").toLowerCase().includes(q) ||
      (log.user_email ?? "").toLowerCase().includes(q) ||
      (log.entity_type ?? "").toLowerCase().includes(q);
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((l) => l.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" /> Logs do Sistema
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro completo de ações no sistema
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-4 h-4" /> Atualizar
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuário, ação ou entidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-52 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAdmin && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-xl">
          <span className="text-sm text-destructive font-medium">
            {selectedIds.length} log(s) selecionado(s)
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2 ml-auto">
                <Trash2 className="w-4 h-4" /> Excluir Selecionados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Logs</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir{" "}
                  <strong>{selectedIds.length}</strong> log(s) selecionado(s)?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteMutation.mutate(selectedIds)}
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {filtered.length} registro(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {isAdmin && (
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={
                        selectedIds.length === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={toggleAll}
                    />
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Data/Hora
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Ação
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Descrição
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Usuário
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Perfil
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                  Entidade
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td
                        colSpan={isAdmin ? 7 : 6}
                        className="px-4 py-3"
                      >
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Nenhum log encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                      selectedIds.includes(log.id) ? "bg-destructive/5" : ""
                    }`}
                  >
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedIds.includes(log.id)}
                          onChange={() => toggleSelect(log.id)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {log.created_at
                        ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-xs border ${
                          ACTION_COLORS[log.action] ?? ACTION_COLORS.other
                        }`}
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs">
                      <p
                        className="truncate"
                        title={log.description ?? undefined}
                      >
                        {log.description || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm font-medium">
                        {log.user_name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.user_email || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground capitalize">
                        {log.user_role || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {log.entity_type || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!isAdmin && (
        <p className="text-xs text-muted-foreground text-center">
          Apenas administradores podem excluir registros de log.
        </p>
      )}
    </div>
  );
}
