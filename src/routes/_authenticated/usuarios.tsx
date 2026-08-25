import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  UserPlus,
  Pencil,
  Lock,
  Unlock,
  Trash2,
  Search,
  Users,
  Loader2,
  Mail,
  KeyRound,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  createUser,
  updateUser,
  deleteUser,
  resendInvite,
  setTemporaryPassword,
} from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({ meta: [{ title: "Usuários" }] }),
  beforeLoad: ({ context }) => {
    const role = (context as { role?: string }).role;
    if (role !== "admin" && role !== "gestor") {
      throw redirect({ to: "/" });
    }
  },

  component: UsuariosPage,
});

type Role = "admin" | "gestor" | "user";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "gestor", label: "Gestor" },
  { value: "user", label: "Usuário" },
];

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  gestor: "bg-primary/10 text-primary border-primary/20",
  user: "bg-muted text-muted-foreground border-border",
};

type UserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  cargo: string | null;
  blocked: boolean;
  role: Role;
};

type FormState = {
  full_name: string;
  email: string;
  cargo: string;
  role: Role;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const PAGE_SIZE = 8;

const FormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Informe o nome completo (mín. 2 caracteres)." })
    .max(150, { message: "Nome muito longo (máx. 150 caracteres)." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "E-mail é obrigatório." })
    .email({ message: "E-mail inválido." })
    .max(255),
  cargo: z
    .string()
    .trim()
    .max(150, { message: "Cargo muito longo (máx. 150 caracteres)." }),
  role: z.enum(["admin", "gestor", "user"], {
    message: "Selecione um perfil.",
  }),
});

function validateForm(form: FormState): FormErrors {
  const result = FormSchema.safeParse(form);
  if (result.success) return {};
  const errs: FormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof FormState;
    if (!errs[key]) errs[key] = issue.message;
  }
  return errs;
}

async function fetchUsers(): Promise<UserRow[]> {
  const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, cargo, blocked")
        .order("full_name", { ascending: true }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
  if (pErr) throw pErr;
  if (rErr) throw rErr;
  const roleMap = new Map<string, Role>();
  (roles ?? []).forEach((r) => roleMap.set(r.user_id, r.role as Role));
  return (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name ?? null,
    email: p.email ?? null,
    cargo: p.cargo ?? null,
    blocked: !!p.blocked,
    role: roleMap.get(p.id) ?? "user",
  }));
}

function UsuariosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [page, setPage] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState<UserRow | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const createUserFn = useServerFn(createUser);
  const updateUserFn = useServerFn(updateUser);
  const deleteUserFn = useServerFn(deleteUser);
  const resendInviteFn = useServerFn(resendInvite);
  const setTempPasswordFn = useServerFn(setTemporaryPassword);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{
    email: string | null;
    password: string;
  } | null>(null);

  

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setCurrentUserId(uid);
      if (uid) {
        const { data: rows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        setIsAdmin(!!rows?.some((r) => r.role === "admin"));
      }
    })();
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: fetchUsers,
  });

  const blockMutation = useMutation({
    mutationFn: async (u: UserRow) => {
      const { error } = await supabase
        .from("profiles")
        .update({ blocked: !u.blocked })
        .eq("id", u.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success("✅ Status atualizado.");
    },
    onError: (e: Error) => toast.error(`❌ ${e.message}`),
  });

  const createMutation = useMutation({
    mutationFn: (form: FormState) =>
      createUserFn({
        data: {
          full_name: form.full_name,
          email: form.email,
          cargo: form.cargo || null,
          role: form.role,
        },
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setCreateOpen(false);
      setLastCreatedId(res.id);
      setConfirmInfo({
        title: "Usuário criado com sucesso!",
        description: `Um e-mail foi enviado para ${res.email} com um link seguro para que o usuário defina a própria senha de acesso.\n\nO link expira em 1 hora. Caso não chegue, use "Reenviar convite".`,
      });
      setConfirmOpen(true);
    },
    onError: (e: Error) => toast.error(`❌ ${e.message}`),
  });

  const resendInviteMutation = useMutation({
    mutationFn: (id: string) => resendInviteFn({ data: { id } }),
    onSuccess: (res) => toast.success(`✉️ Convite reenviado para ${res.email}.`),
    onError: (e: Error) => toast.error(`❌ ${e.message}`),
  });

  const tempPasswordMutation = useMutation({
    mutationFn: (id: string) => setTempPasswordFn({ data: { id } }),
    onSuccess: (res) => {
      setTempPasswordInfo({ email: res.email, password: res.password });
    },
    onError: (e: Error) => toast.error(`❌ ${e.message}`),
  });


  const editMutation = useMutation({
    mutationFn: (vars: { id: string; form: FormState }) =>
      updateUserFn({
        data: {
          id: vars.id,
          full_name: vars.form.full_name,
          email: vars.form.email,
          cargo: vars.form.cargo || null,
          role: vars.form.role,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setEditOpen(false);
      setEditing(null);
      toast.success("✅ Usuário atualizado com sucesso!");
    },
    onError: (e: Error) => toast.error(`❌ ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      setDeleting(null);
      toast.success("✅ Usuário excluído com sucesso.");
    },
    onError: (e: Error) => toast.error(`❌ ${e.message}`),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesText =
        !q ||
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Usuários
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os usuários do sistema
          </p>
        </div>
        {isAdmin && (
          <Button
            className="gap-2 w-full sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus className="w-4 h-4" /> Adicionar Usuário
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as "all" | Role)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filtrar por perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {filtered.length} usuário(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {paginated.map((u) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between px-5 py-4 gap-3 ${u.blocked ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {(u.full_name || u.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">
                          {u.full_name || "—"}
                        </p>
                        {u.blocked && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                      {u.cargo && (
                        <p className="text-xs text-muted-foreground/70">
                          {u.cargo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      className={`text-xs hidden sm:inline-flex ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}
                    >
                      {ROLE_OPTIONS.find((r) => r.value === u.role)?.label ||
                        "Usuário"}
                    </Badge>

                    {isAdmin && u.id !== currentUserId && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditing(u);
                            setEditOpen(true);
                          }}
                          title="Editar"
                          aria-label={`Editar usuário ${u.full_name || u.email}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-primary disabled:opacity-50"
                          onClick={() => resendInviteMutation.mutate(u.id)}
                          disabled={
                            resendInviteMutation.isPending &&
                            resendInviteMutation.variables === u.id
                          }
                          title="Reenviar convite"
                          aria-label={`Reenviar convite para ${u.full_name || u.email}`}
                        >
                          {resendInviteMutation.isPending &&
                          resendInviteMutation.variables === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-primary disabled:opacity-50"
                          onClick={() => tempPasswordMutation.mutate(u.id)}
                          disabled={
                            tempPasswordMutation.isPending &&
                            tempPasswordMutation.variables === u.id
                          }
                          title="Gerar senha temporária"
                          aria-label={`Gerar senha temporária para ${u.full_name || u.email}`}
                        >
                          {tempPasswordMutation.isPending &&
                          tempPasswordMutation.variables === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <KeyRound className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-8 h-8 ${u.blocked ? "text-green-600 hover:text-green-700" : "text-yellow-600 hover:text-yellow-700"}`}
                          onClick={() => blockMutation.mutate(u)}
                          title={u.blocked ? "Desbloquear" : "Bloquear"}
                          aria-label={`${u.blocked ? "Desbloquear" : "Bloquear"} usuário ${u.full_name || u.email}`}
                        >
                          {u.blocked ? (
                            <Unlock className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleting(u)}
                          title="Excluir"
                          aria-label={`Excluir usuário ${u.full_name || u.email}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                aria-disabled={safePage === 1}
                className={
                  safePage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              return (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={n === safePage}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(n);
                    }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                aria-disabled={safePage === totalPages}
                className={
                  safePage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          </DialogHeader>
          <UserFormFields
            initial={{ full_name: "", email: "", cargo: "", role: "user" }}
            saving={createMutation.isPending}
            onClose={() => setCreateOpen(false)}
            onSubmit={(form) => createMutation.mutate(form)}
            submitLabel="Salvar"
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editing && (
            <UserFormFields
              initial={{
                full_name: editing.full_name ?? "",
                email: editing.email ?? "",
                cargo: editing.cargo ?? "",
                role: editing.role,
              }}
              saving={editMutation.isPending}
              onClose={() => {
                setEditOpen(false);
                setEditing(null);
              }}
              onSubmit={(form) =>
                editMutation.mutate({ id: editing.id, form })
              }
              submitLabel="Salvar alterações"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation modal after create */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmInfo?.title ?? "Sucesso"}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line font-medium text-foreground bg-muted/40 p-4 rounded-xl border border-border/60 mt-2">
              {confirmInfo?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {lastCreatedId && (
              <Button
                variant="outline"
                className="gap-2"
                disabled={resendInviteMutation.isPending}
                onClick={() => resendInviteMutation.mutate(lastCreatedId)}
              >
                {resendInviteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Reenviar convite
              </Button>
            )}
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                setLastCreatedId(null);
                queryClient.invalidateQueries({ queryKey: ["users-list"] });
              }}
            >
              Fechar e recarregar lista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Senha temporária gerada */}
      <Dialog
        open={!!tempPasswordInfo}
        onOpenChange={(o) => !o && setTempPasswordInfo(null)}
      >
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Senha temporária gerada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Repasse esta senha ao usuário por um canal seguro. Ela aparece
              apenas uma vez e o sistema exigirá a troca no primeiro acesso.
            </p>
            {tempPasswordInfo?.email && (
              <p className="text-sm">
                <span className="text-muted-foreground">Usuário: </span>
                <strong>{tempPasswordInfo.email}</strong>
              </p>
            )}
            <div className="flex items-center gap-2">
              <code className="flex-1 select-all rounded-xl border border-border/60 bg-muted/40 px-4 py-3 font-mono text-base tracking-wide">
                {tempPasswordInfo?.password}
              </code>
              <Button
                variant="outline"
                size="icon"
                title="Copiar senha"
                aria-label="Copiar senha temporária"
                onClick={async () => {
                  if (!tempPasswordInfo) return;
                  try {
                    await navigator.clipboard.writeText(
                      tempPasswordInfo.password,
                    );
                    toast.success("Senha copiada.");
                  } catch {
                    toast.error("Não foi possível copiar. Selecione e copie manualmente.");
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setTempPasswordInfo(null)}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. O usuário{" "}
              <strong>{deleting?.full_name || deleting?.email}</strong> será
              removido definitivamente, incluindo seu acesso ao sistema. Esta
              operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleting) deleteMutation.mutate(deleting.id);
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir definitivamente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


function UserFormFields({
  initial,
  saving,
  onClose,
  onSubmit,
  submitLabel,
}: {
  initial: FormState;
  saving: boolean;
  onClose: () => void;
  onSubmit: (f: FormState) => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => {
      const next = { ...p, [k]: v };
      if (touched[k]) setErrors(validateForm(next));
      return next;
    });
  };

  const blur = (k: keyof FormState) => {
    setTouched((p) => ({ ...p, [k]: true }));
    setErrors(validateForm(form));
  };

  const handleSubmit = () => {
    const errs = validateForm(form);
    setErrors(errs);
    setTouched({ full_name: true, email: true, cargo: true, role: true });
    if (Object.keys(errs).length > 0) {
      toast.warning("⚠️ Corrija os campos destacados.");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Nome Completo *</Label>
        <Input
          placeholder="Ex: João da Silva"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          onBlur={() => blur("full_name")}
          aria-invalid={!!errors.full_name}
          disabled={saving}
        />
        {errors.full_name && (
          <p className="text-xs text-destructive">{errors.full_name}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>E-mail *</Label>
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={!!errors.email}
            disabled={saving}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Cargo/Função</Label>
          <Input
            placeholder="Ex: Epidemiologista"
            value={form.cargo}
            onChange={(e) => set("cargo", e.target.value)}
            onBlur={() => blur("cargo")}
            aria-invalid={!!errors.cargo}
            disabled={saving}
          />
          {errors.cargo && (
            <p className="text-xs text-destructive">{errors.cargo}</p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label>Perfil de Acesso</Label>
        <Select
          value={form.role}
          onValueChange={(v) => set("role", v as Role)}
          disabled={saving}
        >
          <SelectTrigger aria-invalid={!!errors.role}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-xs text-destructive">{errors.role}</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground bg-muted/40 border border-border/60 rounded-md p-3">
        Ao salvar, o usuário receberá um e-mail com um link seguro para definir
        a própria senha. Nenhuma senha é trafegada por e-mail.
      </p>


      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving} className="gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Salvando..." : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}
