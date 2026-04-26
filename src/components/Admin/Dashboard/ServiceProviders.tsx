import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Loader2, Search, UserCheck } from "lucide-react";
import { Input } from "../../Common/input";
import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ServiceProviderAdminDialog from "./ServiceProviderAdminDialog";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import providerInstance from "src/services/providerInstance";
import { cn } from "../../utils";

export interface ServiceProviderRow {
  serviceproviderid: number;
  vendorId?: number | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  emailId: string;
  mobileNo: number;
  alternateNo?: number | null;
  gender?: string | null;
  buildingName?: string | null;
  locality: string;
  street: string;
  pincode: number;
  latitude?: string | number | null;
  longitude?: string | number | null;
  currentLocation?: string | null;
  nearbyLocation?: string | null;
  location?: string | null;
  enrolleddate?: string | null;
  housekeepingRole?: string | null;
  housekeepingRoles?: string[];
  diet?: string | null;
  cookingSpeciality?: string | null;
  languageKnown?: string | null;
  age?: number | null;
  experience?: number | null;
  timeslot?: string | null;
  rating?: string | number | null;
  isactive?: boolean;
  kyc?: string | null;
  correspondenceAddress?: { locality?: string } | null;
  permanentAddress?: { locality?: string } | null;
}

const ServiceProviders = () => {
  const [rowData, setRowData] = useState<ServiceProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [managing, setManaging] = useState<ServiceProviderRow | null>(null);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await providerInstance.get<{
        status: number;
        message: string;
        data: ServiceProviderRow[] | null;
      }>("/api/service-providers/providers");

      const list = response.data?.data;
      if (!Array.isArray(list)) {
        setError("Invalid response: expected a list of providers in data.data.");
        setRowData([]);
        return;
      }

      const normalized = list.map((row) => ({
        ...row,
        serviceproviderid:
          typeof row.serviceproviderid === "string"
            ? Number(row.serviceproviderid)
            : row.serviceproviderid,
      })) as ServiceProviderRow[];

      setRowData(normalized);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load service providers. Check the providers API and network.";
      setError(msg);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  const displayRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rowData;
    return rowData.filter((row) => {
      const o = row as unknown as Record<string, unknown>;
      return Object.values(o).some((v) => v != null && String(v).toLowerCase().includes(q));
    });
  }, [rowData, searchText]);

  const columnDefs: ColDef<ServiceProviderRow>[] = useMemo(
    () => [
      {
        colId: "manage",
        headerName: "Admin",
        width: 100,
        sortable: false,
        filter: false,
        resizable: false,
        valueGetter: () => "Open",
        cellClass: "text-sky-600 font-medium",
      },
      {
        colId: "id",
        field: "serviceproviderid",
        headerName: "ID",
        width: 90,
        valueFormatter: (p) => (p.value != null ? String(p.value) : ""),
      },
      { field: "firstName", headerName: "First name", width: 120 },
      { field: "middleName", headerName: "Middle", width: 100, valueFormatter: (p) => p.value || "—" },
      { field: "lastName", headerName: "Last name", width: 120 },
      { field: "emailId", headerName: "Email", flex: 1, minWidth: 200 },
      {
        field: "mobileNo",
        headerName: "Mobile",
        width: 130,
        valueFormatter: (p) => (p.value == null || p.value === "" ? "—" : String(p.value)),
      },
      {
        field: "alternateNo",
        headerName: "Alternate",
        width: 120,
        valueFormatter: (p) => (p.value == null || p.value === "" ? "—" : String(p.value)),
      },
      { field: "gender", headerName: "Gender", width: 100, valueFormatter: (p) => p.value || "—" },
      { field: "buildingName", headerName: "Building", minWidth: 120, valueFormatter: (p) => p.value || "—" },
      { field: "locality", headerName: "Locality", minWidth: 120, valueFormatter: (p) => p.value || "—" },
      { field: "street", headerName: "Street", minWidth: 100, valueFormatter: (p) => p.value || "—" },
      {
        field: "pincode",
        headerName: "Pin",
        width: 90,
        valueFormatter: (p) => (p.value == null ? "—" : String(p.value)),
      },
      { field: "latitude", headerName: "Lat", width: 110, valueFormatter: (p) => (p.value == null ? "—" : String(p.value)) },
      { field: "longitude", headerName: "Lng", width: 110, valueFormatter: (p) => (p.value == null ? "—" : String(p.value)) },
      { field: "currentLocation", headerName: "Current", minWidth: 120, valueFormatter: (p) => p.value || "—" },
      { field: "nearbyLocation", headerName: "Nearby", minWidth: 100, valueFormatter: (p) => p.value || "—" },
      { field: "location", headerName: "Location", minWidth: 100, valueFormatter: (p) => p.value || "—" },
      {
        colId: "enrolled",
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
        colId: "roles",
        headerName: "Housekeeping roles",
        minWidth: 160,
        valueGetter: (p) => {
          const d = p.data;
          if (!d) return "";
          if (Array.isArray(d.housekeepingRoles) && d.housekeepingRoles.length > 0) {
            return d.housekeepingRoles.join(", ");
          }
          return d.housekeepingRole || "—";
        },
      },
      { field: "diet", headerName: "Diet", width: 100, valueFormatter: (p) => p.value || "—" },
      { field: "cookingSpeciality", headerName: "Cooking", minWidth: 100, valueFormatter: (p) => p.value || "—" },
      { field: "languageKnown", headerName: "Languages", minWidth: 100, valueFormatter: (p) => p.value || "—" },
      {
        field: "age",
        headerName: "Age",
        width: 80,
        valueFormatter: (p) => (p.value == null ? "—" : String(p.value)),
      },
      { field: "timeslot", headerName: "Timeslot", minWidth: 100, valueFormatter: (p) => p.value || "—" },
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
        valueFormatter: (p) => (p.value == null ? "—" : p.value ? "Active" : "Inactive"),
      },
      { field: "kyc", headerName: "KYC", width: 100, valueFormatter: (p) => p.value || "—" },
      { field: "vendorId", headerName: "Vendor", width: 100, valueFormatter: (p) => (p.value == null ? "—" : String(p.value)) },
    ],
    []
  );

  const defaultColDef: ColDef<ServiceProviderRow> = useMemo(
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Service providers</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadProviders()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <strong className="font-semibold">Could not load service providers.</strong> {error}
        </div>
      )}

      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Directory</CardTitle>
          <CardDescription>
            Use the <strong>Admin</strong> column to open a provider: profile, calendar / unavailability blocks, bookings, and
            change history (payments + engagements APIs).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Filter table…"
              className="pl-9"
              aria-label="Filter service providers"
            />
          </div>

          {loading && !rowData.length && !error ? (
            <div className="flex h-[420px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm font-medium">Loading service providers…</p>
            </div>
          ) : (
            <div
              className={cn("ag-theme-alpine w-full rounded-lg border border-slate-200/80 overflow-hidden")}
              style={{ width: "100%", height: 560 }}
            >
              <AgGridReact<ServiceProviderRow>
                rowData={displayRows}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination
                paginationPageSize={20}
                animateRows
                getRowId={(p) => String(p.data?.serviceproviderid ?? "")}
                suppressRowClickSelection
                rowSelection="multiple"
                onCellClicked={(e) => {
                  if (e.colDef?.colId === "manage" && e.data) {
                    setManaging(e.data);
                  }
                }}
              />
            </div>
          )}

          <p className="text-sm text-slate-500">
            <UserCheck className="mr-1.5 -mt-0.5 inline h-4 w-4 text-slate-400" />
            {loading
              ? "…"
              : (() => {
                  const n = displayRows.length;
                  const t = rowData.length;
                  return n === t ? (
                    <span>
                      {t} service provider{t === 1 ? "" : "s"}.
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

      {managing && (
        <ServiceProviderAdminDialog
          open
          onClose={() => setManaging(null)}
          serviceproviderid={managing.serviceproviderid}
          displayName={
            [managing.firstName, managing.middleName, managing.lastName]
              .filter((x) => (x as string | null | undefined) != null && String(x).trim() !== "")
              .join(" ") || "Provider"
          }
        />
      )}
    </div>
  );
};

export default ServiceProviders;
