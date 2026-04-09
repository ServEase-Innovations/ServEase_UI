/* eslint-disable */
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export interface Coupon {
  coupon_id: string;
  coupon_code: string;
  description: string;
  service_type: string;
  discount_type: string;
  discount_value: number;
  minimum_order_value: number;
  usage_limit: number;
  usage_per_user: number;
  start_date: string;
  end_date: string;
  city: string;
  isActive: boolean;
  created_at: string;
}

const Coupons = () => {
  const [rowData, setRowData] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const columnDefs: ColDef<Coupon>[] = [
    {
      field: "coupon_code",
      headerName: "Coupon Code",
      sortable: true,
      filter: true,
      width: 130,
      pinned: "left", // Pin the most important column
    },
    {
      field: "description",
      headerName: "Description",
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 250,
      wrapText: true,
      autoHeight: true, // Allows row height to expand for long descriptions
      cellStyle: { whiteSpace: "normal", wordBreak: "break-word" },
    },
    {
      field: "service_type",
      headerName: "Service Type",
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      field: "discount_type",
      headerName: "Discount Type",
      sortable: true,
      filter: true,
      width: 130,
    },
    {
      field: "discount_value",
      headerName: "Discount Value",
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: ({ value }) => (value ? `${value}%` : ""),
    },
    {
      field: "minimum_order_value",
      headerName: "Min Order Value",
      sortable: true,
      filter: true,
      width: 140,
      valueFormatter: ({ value }) => (value ? `₹${value}` : ""),
    },
    {
      field: "usage_limit",
      headerName: "Usage Limit",
      sortable: true,
      filter: true,
      width: 110,
    },
    {
      field: "usage_per_user",
      headerName: "Per User Limit",
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      field: "start_date",
      headerName: "Start Date",
      sortable: true,
      filter: "agDateColumnFilter",
      width: 120,
      valueFormatter: ({ value }) => (value ? new Date(value).toLocaleDateString() : ""),
    },
    {
      field: "end_date",
      headerName: "End Date",
      sortable: true,
      filter: "agDateColumnFilter",
      width: 120,
      valueFormatter: ({ value }) => (value ? new Date(value).toLocaleDateString() : ""),
    },
    {
      field: "city",
      headerName: "City",
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      field: "isActive",
      headerName: "Status",
      sortable: true,
      filter: true,
      width: 110,
      cellRenderer: ({ value }: { value: boolean }) => {
        const badgeClass = value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
        const label = value ? "Active" : "Inactive";
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${badgeClass}">${label}</span>`;
      },
    },
    {
      field: "created_at",
      headerName: "Created At",
      sortable: true,
      filter: "agDateColumnFilter",
      width: 170,
      valueFormatter: ({ value }) => (value ? new Date(value).toLocaleString() : ""),
    },
    {
      field: "coupon_id",
      headerName: "Coupon ID",
      sortable: true,
      filter: true,
      width: 280,
    },
  ];

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://coupons-o26r.onrender.com/api/coupons/all");
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setRowData(result.data);
        } else {
          setError("Invalid data format received from server.");
        }
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
        setError("Failed to load coupons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading coupons...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
        <p className="font-medium">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Coupon Management</h1>
          <p className="text-gray-500 mt-1">View and manage all available coupons</p>
        </div>

        {/* Grid Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="ag-theme-alpine" style={{ height: "auto", width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={20}
              domLayout="autoHeight"
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
              suppressHorizontalScroll={false}
              enableCellTextSelection={true}
              ensureDomOrder={true}
            />
          </div>
        </div>

        {/* Footer stats */}
        <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
          <span>Total Coupons: {rowData.length}</span>
          <span>Page Size: 20</span>
        </div>
      </div>
    </div>
  );
};

export default Coupons;