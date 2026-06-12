import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Loader2, UserRound } from "lucide-react";
import { SearchField } from "../../Common/SearchField";
import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import providerInstance from "src/services/providerInstance";
import { getAdminPushSecret } from "src/utils/adminApiSecret";
import { authApiErrorMessage, isAuthApiError } from "src/utils/apiAuthError";
import { cn } from "../../utils";

/** Row shape for customer records from the API */
export interface CustomerRow {
  customerid: number;
  kyc: string | null;
  alternateno: string | number | null;
  buildingname: string | null;
  currentlocation: string | null;
  emailid: string;
  enrolleddate: string | null;
  firstname: string;
  idno: string | null;
  isactive: boolean;
  languageknown: string | null;
  lastname: string;
  locality: string | null;
  middlename: string | null;
  mobileno: string | number | null;
  pincode: number | null;
  profilepic: string | null;
  rating: number | null;
  speciality: string | null;
  street: string | null;
}

type ApiCustomer = Partial<CustomerRow> & {
  customerId?: number | string;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  emailId?: string;
  mobileNo?: string | number | null;
  alternateNo?: string | number | null;
  languageKnown?: string | string[] | null;
  enrolledDate?: string | null;
  isActive?: boolean;
  pinCode?: number | null;
  profilePic?: string | null;
  buildingName?: string | null;
  currentLocation?: string | null;
  idNo?: string | null;
};

function normalizeCustomerRow(row: ApiCustomer): CustomerRow {
  const languageKnown = row.languageknown ?? row.languageKnown;
  return {
    customerid: Number(row.customerid ?? row.customerId ?? 0),
    kyc: row.kyc ?? null,
    alternateno: row.alternateno ?? row.alternateNo ?? null,
    buildingname: row.buildingname ?? row.buildingName ?? null,
    currentlocation: row.currentlocation ?? row.currentLocation ?? null,
    emailid: String(row.emailid ?? row.emailId ?? ""),
    enrolleddate: row.enrolleddate ?? row.enrolledDate ?? null,
    firstname: String(row.firstname ?? row.firstName ?? ""),
    idno: row.idno ?? row.idNo ?? null,
    isactive: row.isactive ?? row.isActive ?? true,
    languageknown: Array.isArray(languageKnown)
      ? languageKnown.join(", ")
      : languageKnown != null
        ? String(languageKnown)
        : null,
    lastname: String(row.lastname ?? row.lastName ?? ""),
    locality: row.locality ?? null,
    middlename: row.middlename ?? row.middleName ?? null,
    mobileno: row.mobileno ?? row.mobileNo ?? null,
    pincode: row.pincode ?? row.pinCode ?? null,
    profilepic: row.profilepic ?? row.profilePic ?? null,
    rating: row.rating != null ? Number(row.rating) : 0,
    speciality: row.speciality ?? null,
    street: row.street ?? null,
  };
}

const Users = () => {
  const [rowData, setRowData] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!getAdminPushSecret()) {
      setError(
        "REACT_APP_ADMIN_PUSH_SECRET is not set in the UI build. It must match ADMIN_PUSH_SECRET on the providers service."
      );
      setRowData([]);
      setLoading(false);
      return;
    }

    try {
      const response = await providerInstance.get<{
        status: number;
        message: string;
        data: CustomerRow[] | { results?: ApiCustomer[] } | null;
      }>("/api/customers");

      const payload = response.data?.data;
      const list = Array.isArray(payload)
        ? payload
        : payload && typeof payload === "object" && Array.isArray(payload.results)
          ? payload.results
          : null;

      if (!list) {
        setError("Invalid response: expected a list of customers in data.data.");
        setRowData([]);
        return;
      }

      setRowData(
        list
          .map((row) => normalizeCustomerRow(row))
          .filter((row) => Number.isFinite(row.customerid) && row.customerid > 0)
      );
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
        code?: string;
      };

      let msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load customers. Check the providers API, admin secret, and network.";

      if (isAuthApiError(e)) {
        msg = `${authApiErrorMessage(e)} Ensure REACT_APP_ADMIN_PUSH_SECRET matches ADMIN_PUSH_SECRET on providers.`;
      } else if (err?.message === "Network Error" || err?.code === "ERR_NETWORK") {
        msg =
          "Could not reach the providers API (network/CORS). Confirm REACT_APP_PROVIDER_URL, that providers allows your admin origin in CORS_ORIGINS, and redeploy providers after CORS header updates.";
      }

      setError(msg);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const displayRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rowData;
    return rowData.filter((row) => {
      const o = row as unknown as Record<string, unknown>;
      return Object.values(o).some((v) => v != null && String(v).toLowerCase().includes(q));
    });
  }, [rowData, searchText]);

  const columnDefs: ColDef<CustomerRow>[] = useMemo(
    () => [
      { field: "customerid", headerName: "ID", width: 100, valueFormatter: (p) => (p.value != null ? String(p.value) : "") },
      { field: "firstname", headerName: "First name", width: 120 },
      { field: "middlename", headerName: "Middle", width: 100 },
      { field: "lastname", headerName: "Last name", width: 120 },
      { field: "emailid", headerName: "Email", flex: 1, minWidth: 200 },
      {
        field: "mobileno",
        headerName: "Mobile",
        width: 130,
        valueFormatter: (p) => (p.value == null || p.value === "" ? "—" : String(p.value)),
      },
      {
        field: "alternateno",
        headerName: "Alternate",
        width: 120,
        valueFormatter: (p) => (p.value == null || p.value === "" ? "—" : String(p.value)),
      },
      { field: "languageknown", headerName: "Languages", width: 120, valueFormatter: (p) => p.value || "—" },
      { field: "locality", headerName: "Locality", width: 120, valueFormatter: (p) => p.value || "—" },
      { field: "pincode", headerName: "Pin", width: 90, valueFormatter: (p) => (p.value == null ? "—" : String(p.value)) },
      {
        field: "enrolleddate",
        headerName: "Enrolled",
        width: 120,
        valueFormatter: (p) => {
          if (!p.value) return "—";
          const d = new Date(p.value);
          return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
        },
      },
      {
        field: "rating",
        headerName: "Rating",
        width: 100,
        valueFormatter: (p) => {
          const n = p.value == null ? 0 : Number(p.value);
          return Number.isFinite(n) ? n.toFixed(1) : "0.0";
        },
        cellClass: "tabular-nums",
      },
      {
        field: "isactive",
        headerName: "Active",
        width: 100,
        valueFormatter: (p) => (p.value ? "Active" : "Inactive"),
      },
      { field: "kyc", headerName: "KYC", width: 100, valueFormatter: (p) => p.value || "—" },
    ],
    []
  );

  const defaultColDef: ColDef<CustomerRow> = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 80,
    }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Customers</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadCustomers()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <strong className="font-semibold">Could not load customers.</strong> {error}
        </div>
      )}

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Directory</CardTitle>
          <CardDescription>Filter the loaded rows by any visible field (client-side).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchField
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Filter table…"
            wrapperClassName="max-w-md"
            aria-label="Filter customers"
          />

          {loading && !rowData.length && !error ? (
            <div className="flex h-[420px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm font-medium">Loading customers…</p>
            </div>
          ) : (
            <div
              className={cn("ag-theme-alpine w-full rounded-lg border border-slate-200/80 overflow-hidden")}
              style={{ width: "100%", height: 560 }}
            >
              <AgGridReact<CustomerRow>
                rowData={displayRows}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination
                paginationPageSize={20}
                animateRows
                getRowId={(p) => String(p.data?.customerid ?? "")}
                suppressRowClickSelection
                rowSelection="multiple"
              />
            </div>
          )}

          <p className="text-sm text-slate-500">
            <UserRound className="mr-1.5 -mt-0.5 inline h-4 w-4 text-slate-400" />
            {loading
              ? "…"
              : (() => {
                  const n = displayRows.length;
                  const t = rowData.length;
                  return n === t ? (
                    <span>
                      {t} customer{t === 1 ? "" : "s"}.
                    </span>
                  ) : (
                    <span>
                      {n} match{n === 1 ? "" : "es"} of {t} total.
                    </span>
                  );
                })()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
