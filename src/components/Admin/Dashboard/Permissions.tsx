import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Input } from "../../Common/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "../../Common/alert-dialog";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserX,
} from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { cn } from "../../utils";
import utilsInstance from "src/services/utilsInstance";
import { Badge } from "../../Common/Badge";

export type AdminUser = {
  _id: string;
  username: string;
  role: "SuperAdmin" | "User" | "Admin" | string;
  /** Present from API; never shown in the grid. */
  hashedPassword?: string;
  actions?: unknown;
};

type GridCtx = {
  onRoleSelect: (user: AdminUser, newRole: string) => void;
  onDeleteRequest: (user: AdminUser) => void;
  busyId: string | null;
};

type ConfirmState =
  | { type: "role"; user: AdminUser; newRole: string }
  | { type: "delete"; user: AdminUser };

const ROLES: readonly string[] = ["User", "Admin", "SuperAdmin"];

function roleVariant(role: string): "default" | "secondary" | "destructive" {
  const r = role.toLowerCase();
  if (r === "superadmin") {
    return "default";
  }
  if (r === "admin") {
    return "secondary";
  }
  return "secondary";
}

function RoleCell(
  p: ICellRendererParams<AdminUser, string, GridCtx> & { context: GridCtx }
) {
  const { data, context } = p;
  if (!data) {
    return null;
  }
  const busy = context.busyId === data._id;
  const value = data.role || "User";

  return (
    <div className="flex h-full min-h-[2.5rem] flex-wrap items-center gap-2 py-0.5">
      <Badge variant={roleVariant(value)} className="shrink-0" title="Current role">
        {value}
      </Badge>
      <label className="sr-only" htmlFor={`role-${data._id}`}>
        Change role for {data.username}
      </label>
      <select
        id={`role-${data._id}`}
        className={cn(
          "min-w-[7.5rem] max-w-full rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-sm text-slate-900 shadow-sm",
          "hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        value={value}
        disabled={busy}
        onChange={(e) => {
          const newRole = e.target.value;
          e.currentTarget.value = value;
          context.onRoleSelect(data, newRole);
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {busy && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-hidden />}
    </div>
  );
}

function ActionsCell(
  p: ICellRendererParams<AdminUser, unknown, GridCtx> & { context: GridCtx }
) {
  const { data, context } = p;
  if (!data) {
    return null;
  }
  const busy = context.busyId === data._id;
  return (
    <div className="flex h-full min-h-[2.5rem] items-center py-0.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
        disabled={busy}
        onClick={() => context.onDeleteRequest(data)}
        aria-label={`Delete admin user ${data.username}`}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        <span className="ml-1.5">Remove</span>
      </Button>
    </div>
  );
}

const Permissions = () => {
  const [rowData, setRowData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await utilsInstance.get<AdminUser[] | { error?: string }>("/users");
      if (!Array.isArray(data)) {
        setError("Unexpected response from the admin users API.");
        setRowData([]);
        return;
      }
      setRowData(data);
    } catch (e) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Could not load admin users. Check the utils service URL and your session."
      );
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateUserRole = useCallback(async (userId: string, newRole: string): Promise<boolean> => {
    setActionError(null);
    setBusyId(userId);
    try {
      const { data, status } = await utilsInstance.put<AdminUser>(`/users/${userId}`, { role: newRole });
      if (status < 200 || status >= 300) {
        setActionError("The server rejected the role update.");
        return false;
      }
      const nextRole = data?.role ?? newRole;
      setRowData((prev) => prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u)));
      return true;
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setActionError(e?.response?.data?.error || e?.message || "Failed to update role.");
      return false;
    } finally {
      setBusyId(null);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    setActionError(null);
    setBusyId(userId);
    try {
      const res = await utilsInstance.delete(`/users/${userId}`);
      if (res.status < 200 || res.status >= 300) {
        const msg = (res.data as { error?: string } | undefined)?.error;
        setActionError(msg || "The server rejected the delete request.");
        return false;
      }
      setRowData((prev) => prev.filter((u) => u._id !== userId));
      return true;
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setActionError(e?.response?.data?.error || e?.message || "Failed to remove user.");
      return false;
    } finally {
      setBusyId(null);
    }
  }, []);

  const onRoleSelect = useCallback((user: AdminUser, newRole: string) => {
    if (user.role === newRole) {
      return;
    }
    setActionError(null);
    setConfirm({ type: "role", user, newRole });
  }, []);

  const onDeleteRequest = useCallback((user: AdminUser) => {
    setActionError(null);
    setConfirm({ type: "delete", user });
  }, []);

  const gridContext = useMemo<GridCtx>(
    () => ({
      onRoleSelect,
      onDeleteRequest,
      busyId,
    }),
    [onRoleSelect, onDeleteRequest, busyId]
  );

  const handleConfirm = useCallback(async () => {
    if (!confirm) {
      return;
    }
    if (confirm.type === "role") {
      const ok = await updateUserRole(confirm.user._id, confirm.newRole);
      if (ok) {
        setConfirm(null);
      }
      return;
    }
    const ok = await deleteUser(confirm.user._id);
    if (ok) {
      setConfirm(null);
    }
  }, [confirm, updateUserRole, deleteUser]);

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) {
      return rowData;
    }
    return rowData.filter((r) => {
      const name = (r.username || "").toLowerCase();
      const role = (r.role || "").toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }, [rowData, searchText]);

  const columnDefs = useMemo<ColDef<AdminUser>[]>(
    () => [
      {
        field: "username",
        headerName: "User",
        minWidth: 180,
        flex: 1.2,
        tooltipField: "username",
        cellClass: "font-medium text-slate-900",
      },
      {
        field: "role",
        headerName: "Role",
        minWidth: 220,
        maxWidth: 360,
        flex: 1.2,
        cellRenderer: RoleCell,
      },
      {
        colId: "actions",
        headerName: "Actions",
        minWidth: 150,
        maxWidth: 200,
        cellRenderer: ActionsCell,
        sortable: false,
        filter: false,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<AdminUser>>(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
    }),
    []
  );

  const showInitialSkeleton = loading && !rowData.length && !error;
  const dialogOpen = confirm !== null;
  const isMutating = Boolean(confirm && busyId && busyId === confirm.user._id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Permissions</h1>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-600 sm:text-base">
            Admin accounts in the system. Change a user&apos;s role with care; removing a user revokes their dashboard access
            to ServEase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
            <Shield className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            SuperAdmins only
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1.5">Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong className="font-semibold">Could not load users.</strong> {error}
          </div>
        </div>
      )}

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex flex-wrap items-center gap-2">
            <span>{actionError}</span>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setActionError(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Admin users</CardTitle>
          <CardDescription>
            Password hashes are not shown. Use the role dropdown, confirm in the dialog, or remove access with{" "}
            <span className="whitespace-nowrap">Remove</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Filter by name or role…"
              className="pl-9"
              disabled={showInitialSkeleton || Boolean(error && !rowData.length)}
              aria-label="Filter admin users"
            />
          </div>

          {showInitialSkeleton ? (
            <div className="flex h-[min(50vh,480px)] min-h-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm font-medium">Loading admin users…</p>
            </div>
          ) : (
            <div
              className={cn("ag-theme-alpine w-full rounded-lg border border-slate-200/80 overflow-hidden shadow-inner")}
              style={{ width: "100%", height: "min(55vh, 520px)", minHeight: 280 }}
            >
              {filteredRows.length === 0 ? (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 bg-slate-50/50 px-4 text-center text-slate-500">
                  <Shield className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium">
                    {rowData.length === 0 ? "No admin users returned." : "No users match your search."}
                  </p>
                  {rowData.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setSearchText("")}>
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <AgGridReact<AdminUser>
                  context={gridContext}
                  rowData={filteredRows}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination
                  paginationPageSize={20}
                  paginationPageSizeSelector={[10, 20, 50]}
                  animateRows
                  getRowId={(p) => p.data?._id || ""}
                  suppressCellFocus
                  tooltipShowDelay={200}
                />
              )}
            </div>
          )}

          {!(showInitialSkeleton || (error && !rowData.length)) && (
            <p className="text-sm text-slate-500">
              {loading
                ? "Loading…"
                : (() => {
                    const n = filteredRows.length;
                    const t = rowData.length;
                    if (t === 0) {
                      return "No data loaded.";
                    }
                    if (n === t) {
                      return `${n} user${n === 1 ? "" : "s"}.`;
                    }
                    return (
                      <span>
                        {n} match{n === 1 ? "" : "es"} of {t} total.
                      </span>
                    );
                  })()}
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setConfirm(null);
          }
        }}
      >
        <AlertDialogContent className="gap-0 border-slate-200 bg-white p-0 sm:max-w-md">
          {confirm?.type === "role" && (
            <div className="bg-white">
              <div className="relative border-b border-slate-200 bg-white px-5 pb-4 pt-5 sm:px-6">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-sky-500" />
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-200/80"
                    aria-hidden
                  >
                    <ShieldCheck className="h-6 w-6 text-sky-600" />
                  </div>
                  <div className="min-w-0 space-y-1.5 text-left sm:text-left">
                    <AlertDialogTitle className="!text-balance !text-base !font-semibold !leading-tight !tracking-tight text-slate-900 sm:!text-lg">
                      Change access level
                    </AlertDialogTitle>
                    <p className="text-sm text-slate-600">
                      User <span className="font-medium text-slate-800">{confirm.user.username}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-white px-5 py-4 sm:px-6 sm:py-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">New role</p>
                  <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-2">
                    <div className="inline-flex w-fit items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm">
                      <span className="text-slate-500">Was</span>
                      <span className="ml-2 font-mono text-xs font-semibold tracking-wide sm:text-sm">{confirm.user.role}</span>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 self-center rotate-90 text-slate-400 sm:mx-1 sm:rotate-0"
                      aria-hidden
                    />
                    <div className="inline-flex w-fit items-center rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-sm text-sky-950 shadow-sm">
                      <span className="text-sky-700/90">Becomes</span>
                      <span className="ml-2 font-mono text-xs font-semibold tracking-wide sm:text-sm">{confirm.newRole}</span>
                    </div>
                  </div>
                </div>
                <AlertDialogDescription className="!m-0 text-sm !leading-relaxed text-slate-600">
                  Permissions update immediately for this account after you save. The user can keep their current session until
                  the next sign-in, when the new role applies in full.
                </AlertDialogDescription>
              </div>

              <AlertDialogFooter className="gap-2 space-x-0 border-t border-slate-200 bg-white px-5 py-3.5 sm:flex-row sm:px-6 sm:py-4">
                <AlertDialogCancel
                  type="button"
                  disabled={isMutating}
                  className="mt-0 w-full min-h-[2.5rem] border-slate-200/90 sm:w-auto"
                >
                  Go back
                </AlertDialogCancel>
                <AlertDialogAction
                  type="button"
                  disabled={isMutating}
                  onClick={() => void handleConfirm()}
                  className="w-full !bg-sky-600 !text-white shadow-sm transition-colors hover:!bg-sky-700 focus-visible:ring-2 focus-visible:ring-sky-500/40 sm:min-w-[7.5rem] sm:w-auto"
                >
                  {isMutating ? (
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving…</span>
                    </span>
                  ) : (
                    "Save role"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          )}

          {confirm?.type === "delete" && (
            <div className="bg-white">
              <div className="relative border-b border-slate-200 bg-white px-5 pb-4 pt-5 sm:px-6">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-rose-500" />
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-rose-200/90"
                    aria-hidden
                  >
                    <UserX className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="min-w-0 space-y-1.5 text-left sm:text-left">
                    <AlertDialogTitle className="!text-balance !text-base !font-semibold !leading-tight !tracking-tight text-slate-900 sm:!text-lg">
                      Remove admin user?
                    </AlertDialogTitle>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{confirm.user.username}</span>{" "}
                      <span className="text-slate-500">(currently {confirm.user.role})</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white px-5 py-4 sm:px-6 sm:py-5">
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  <span>
                    This revokes <strong>admin dashboard</strong> access. You may need a separate system step to close other
                    sessions, if you use one.
                  </span>
                </div>
                <AlertDialogDescription className="!m-0 text-sm !leading-relaxed text-slate-600">
                  This user will not be able to open admin tools in ServEase after you confirm. You can invite them again
                  through your usual admin workflow if you change your mind.
                </AlertDialogDescription>
              </div>

              <AlertDialogFooter className="gap-2 space-x-0 border-t border-slate-200 bg-white px-5 py-3.5 sm:flex-row sm:px-6 sm:py-4">
                <AlertDialogCancel
                  type="button"
                  disabled={isMutating}
                  className="mt-0 w-full min-h-[2.5rem] border-slate-200/90 sm:w-auto"
                >
                  Keep user
                </AlertDialogCancel>
                <AlertDialogAction
                  type="button"
                  className="w-full !bg-rose-600 !text-white shadow-sm !outline-none transition-colors hover:!bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500/40 sm:min-w-[8rem] sm:w-auto"
                  disabled={isMutating}
                  onClick={() => void handleConfirm()}
                >
                  {isMutating ? (
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Removing…</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <Trash2 className="h-4 w-4 opacity-90" />
                      Remove access
                    </span>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Permissions;
