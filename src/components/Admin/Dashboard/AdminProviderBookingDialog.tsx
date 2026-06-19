import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button as MuiButton,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import type { ColDef, RowClassParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  type AdminBookingProviderRow,
  type AdminEngagementRow,
  fetchProvidersForAdminBooking,
} from "src/services/adminEngagementsService";

function providerName(row: AdminBookingProviderRow): string {
  return [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || `Provider #${row.serviceproviderid}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  engagement: AdminEngagementRow | null;
  onSelect: (providerId: number) => void;
};

export function AdminProviderBookingDialog({ open, onClose, engagement, onSelect }: Props) {
  const [rows, setRows] = useState<AdminBookingProviderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const visitDate = engagement?.start_date || null;

  const load = useCallback(async () => {
    if (!engagement || !open) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchProvidersForAdminBooking({
        visitDate: engagement.start_date || undefined,
        endDate: engagement.start_date || undefined,
        serviceType: engagement.service_type,
        latitude: engagement.latitude ?? undefined,
        longitude: engagement.longitude ?? undefined,
        startTime: engagement.start_time || "09:00",
        durationMinutes: 60,
      });
      setRows(list);
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      setError(err?.response?.data?.error || err?.message || "Failed to load providers");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [engagement, open]);

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      void load();
    }
  }, [open, load]);

  const columnDefs = useMemo<ColDef<AdminBookingProviderRow>[]>(
    () => [
      {
        colId: "id",
        field: "serviceproviderid",
        headerName: "ID",
        width: 80,
        checkboxSelection: true,
        headerCheckboxSelection: false,
      },
      {
        headerName: "Provider",
        flex: 1,
        minWidth: 140,
        valueGetter: (p) => (p.data ? providerName(p.data) : ""),
      },
      {
        field: "housekeepingRole",
        headerName: "Role",
        width: 100,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "vacationStatus",
        headerName: "Vacation status",
        width: 160,
        cellRenderer: (p: { data?: AdminBookingProviderRow }) => {
          const d = p.data;
          if (!d || d.vacationStatus === "—") return "—";
          return (
            <Chip
              size="small"
              icon={<BeachAccessIcon />}
              label={d.vacationStatus}
              color={d.vacationOverlapsVisit ? "warning" : "default"}
              variant={d.vacationOverlapsVisit ? "filled" : "outlined"}
              title={d.vacationTooltip || undefined}
            />
          );
        },
      },
      {
        field: "vacationDays",
        headerName: "Vacation days",
        width: 120,
        valueFormatter: (p) => (p.value != null ? String(p.value) : "—"),
      },
      {
        field: "vacationPeriod",
        headerName: "Vacation period",
        flex: 1,
        minWidth: 180,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "vacationEngagementId",
        headerName: "Engagement",
        width: 110,
        valueFormatter: (p) => (p.value != null ? `#${p.value}` : "—"),
      },
      {
        field: "rating",
        headerName: "Rating",
        width: 90,
        valueFormatter: (p) => {
          const n = Number(p.value);
          return Number.isFinite(n) ? n.toFixed(1) : "—";
        },
      },
      {
        field: "distanceKm",
        headerName: "Distance (km)",
        width: 120,
        valueFormatter: (p) => {
          const n = Number(p.value);
          return Number.isFinite(n) ? n.toFixed(1) : "—";
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
    }),
    []
  );

  const getRowClass = (params: RowClassParams<AdminBookingProviderRow>) => {
    if (params.data?.vacationOverlapsVisit) return "admin-vacation-priority-row";
    if (params.data?.vacationStatus && params.data.vacationStatus !== "—") {
      return "admin-vacation-active-row";
    }
    return "";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Provider booking — assign provider</DialogTitle>
      <DialogContent dividers>
        {engagement ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Booking #{engagement.engagement_id} · {engagement.service_type} · visit{" "}
            {visitDate || "—"}
            {engagement.start_time ? ` at ${engagement.start_time}` : ""}
            {engagement.address ? ` · ${engagement.address}` : ""}
          </Typography>
        ) : null}
        <Typography variant="body2" sx={{ mb: 2 }}>
          Providers with <strong>approved vacation</strong> on the visit date are highlighted — they
          stay reserved on their long-term engagement but are top priority for on-demand assignments.
        </Typography>

        {error ? (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <CircularProgress size={36} />
          </div>
        ) : (
          <div
            className="ag-theme-alpine w-full"
            style={{ height: 420, width: "100%" }}
          >
            <style>{`
              .admin-vacation-priority-row {
                background-color: rgba(254, 243, 199, 0.85) !important;
              }
              .admin-vacation-active-row {
                background-color: rgba(255, 251, 235, 0.9) !important;
              }
            `}</style>
            <AgGridReact<AdminBookingProviderRow>
              rowData={rows}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowClass={getRowClass}
              rowSelection="single"
              onSelectionChanged={(e) => {
                const selected = e.api.getSelectedRows()[0];
                setSelectedId(selected?.serviceproviderid ?? null);
              }}
              pagination
              paginationPageSize={15}
              getRowId={(p) => String(p.data?.serviceproviderid ?? "")}
              overlayNoRowsTemplate="No providers found for this visit. Check location coordinates on the engagement."
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={onClose}>Cancel</MuiButton>
        <MuiButton
          variant="contained"
          disabled={!selectedId}
          onClick={() => {
            if (selectedId) onSelect(selectedId);
            onClose();
          }}
        >
          Assign selected provider
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}
