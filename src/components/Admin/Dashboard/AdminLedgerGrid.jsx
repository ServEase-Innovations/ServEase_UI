import { AgGridReact } from "ag-grid-react";
import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import PaymentInstance from "src/services/paymentInstance";

export default function AdminLedgerGrid() {
  const [rowData, setRowData] = useState([]);
  const [summary, setSummary] = useState(null);
  const currentPageRef = useRef(0);

const [filters, setFilters] = useState({
  from: "2026-01-01",
  to: "2026-01-31",
  limit: 50,
  offset: 0
});


  const columnDefs = useMemo(() => [
    {
      headerName: "Date",
      field: "date",
      filter: "agDateColumnFilter",
      sortable: true,
      valueFormatter: p => new Date(p.value).toLocaleDateString("en-IN")
    },
    {
      headerName: "Type",
      field: "type",
      filter: true,
      rowGroup: false
    },
    {
      headerName: "Reference",
      field: "reference",
      filter: true
    },
    {
      headerName: "Engagement",
      field: "engagement_id",
      filter: "agNumberColumnFilter"
    },
    {
      headerName: "Debit (₹)",
      field: "debit",
      type: "numericColumn",
      valueFormatter: p => p.value ? `₹${p.value}` : "-"
    },
    {
      headerName: "Credit (₹)",
      field: "credit",
      type: "numericColumn",
      valueFormatter: p => p.value ? `₹${p.value}` : "-"
    },
    {
      headerName: "Balance (₹)",
      field: "balance",
      type: "numericColumn",
      valueFormatter: p => `₹${p.value}`
    },
    {
      headerName: "Note",
      field: "note",
      flex: 1
    }
  ], []);

  const loadLedger = async () => {
  const res = await PaymentInstance.get("/api/admin/ledger", {
    params: filters
  });

  setRowData(res.data.ledger);
  setSummary(res.data.summary);
};


  useEffect(() => {
  loadLedger();
}, [filters]);


  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true
  }), []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Serveaso Ledger</h2>

      {summary && (
        <div className="grid grid-cols-6 gap-4 mb-4">
          <SummaryCard label="Collected" value={summary.total_collected} />
          <SummaryCard label="Platform Fee" value={summary.platform_revenue} />
          <SummaryCard label="GST" value={summary.gst_payable} />
          <SummaryCard label="Payouts" value={summary.provider_payouts} />
          <SummaryCard label="Refunds" value={summary.refunds} />
          <SummaryCard label="Net Balance" value={summary.net_balance} />
        </div>
      )}

      <div className="ag-theme-alpine" style={{ height: 600 }}>
  <AgGridReact
    rowData={rowData}
    columnDefs={columnDefs}
    defaultColDef={defaultColDef}
    pagination
    paginationPageSize={filters.limit}
    animateRows
    onPaginationChanged={(params) => {
      const currentPage = params.api.paginationGetCurrentPage();

      if (currentPage !== currentPageRef.current) {
        currentPageRef.current = currentPage;
        setFilters(f => ({
          ...f,
          offset: currentPage * f.limit
        }));
      }
    }}
  />
</div>

    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">₹ {value}</div>
    </div>
  );
}
