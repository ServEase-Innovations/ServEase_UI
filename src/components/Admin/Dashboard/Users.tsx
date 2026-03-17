/* eslint-disable */
import { Card, CardContent, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Badge } from "../../Common/Badge";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Input } from "../../Common/input";
import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import providerInstance from "src/services/providerInstance";

export interface Customer {
  customerid: string;
  firstname: string;
  middlename: string | null;
  lastname: string;
  mobileno: string | null;
  alternateno: string | null;
  emailid: string;
  gender: string | null;
  languageknown: string | null;
  buildingname: string | null;
  locality: string | null;
  street: string | null;
  pincode: string | null;
  profilepic: string | null;
  currentlocation: string | null;
  idno: string | null;
  enrolleddate: string;
  speciality: string | null;
  rating: number;
  username: string | null;
  password: string | null;
  isactive: boolean;
  kyc: string | null;
}

const Users = () => {
  
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState<Customer[]>([]);
  
    // Column Definitions: Defines & controls grid columns.
    const columnDefs: ColDef<Customer>[] = [
      { field: "customerid", headerName: "Customer ID", width: 120 },
      { field: "firstname", headerName: "First Name", width: 130 },
      { field: "middlename", headerName: "Middle Name", width: 130 },
      { field: "lastname", headerName: "Last Name", width: 130 },
      { field: "mobileno", headerName: "Mobile No", width: 130 },
      { field: "alternateno", headerName: "Alternate No", width: 130 },
      { field: "emailid", headerName: "Email", width: 200 },
      { field: "gender", headerName: "Gender", width: 100 },
      { field: "languageknown", headerName: "Languages Known", width: 150 },
      { field: "buildingname", headerName: "Building Name", width: 150 },
      { field: "locality", headerName: "Locality", width: 150 },
      { field: "street", headerName: "Street", width: 150 },
      { field: "pincode", headerName: "Pincode", width: 100 },
      {
        field: "profilepic",
        headerName: "Profile Picture",
        cellRenderer: (params: any) => {
          if (!params.value) {
            return (
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: "50%", 
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                👤
              </div>
            );
          }
          
          return (
            <img
              src={params.value}
              width={40}
              height={40}
              style={{ borderRadius: "50%", objectFit: "cover" }}
              alt="profile"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          );
        },
        width: 100,
        suppressSizeToFit: true,
      },
      { field: "currentlocation", headerName: "Current Location", width: 150 },
      { field: "idno", headerName: "ID No", width: 120 },
      { 
        field: "enrolleddate", 
        headerName: "Enrolled Date",
        cellRenderer: (params: any) => {
          if (!params.value) return '-';
          const date = new Date(params.value);
          return date.toLocaleDateString();
        },
        width: 130
      },
      { field: "speciality", headerName: "Speciality", width: 130 },
      { 
        field: "rating", 
        headerName: "Rating",
        cellRenderer: (params: any) => {
          const rating = params.value || 0;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⭐</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          );
        },
        width: 100
      },
      { field: "username", headerName: "Username", width: 130 },
      { 
        field: "password", 
        headerName: "Password",
        cellRenderer: (params: any) => {
          return params.value ? '••••••••' : '-';
        },
        width: 120
      },
      {
  field: "isactive",
  headerName: "Active",
  cellRenderer: (params: any) => (
    <Badge variant={params.value ? "default" : "secondary"}>
      {params.value ? "Active" : "Inactive"}
    </Badge>
  ),
  width: 100
},
      { 
        field: "kyc", 
        headerName: "KYC Document",
        cellRenderer: (params: any) => {
          return params.value ? (
            <Badge variant="outline">Uploaded</Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          );
        },
        width: 130
      },
    ];

    useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const response = await providerInstance.get("/api/customers");

      console.log("Fetched customers:", response.data);

      // if API returns array directly
      setRowData(response.data);

      // if API structure is like { data: [...] }
      // setRowData(response.data.data);

    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  fetchCustomers();
}, []);

    const defaultColDef: ColDef = {
      flex: 1,
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 100,
    };

  return (
    <div className="p-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search customers..."
            className="pl-10"
            onChange={(e) => {
              // Implement search functionality if needed
              console.log("Search:", e.target.value);
            }}
          />
        </div>
      </div>

      {/* AG Grid table */}
      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
          animateRows={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
        />
      </div>

      {/* Footer with row count */}
      <div className="mt-4 text-sm text-gray-600">
        Total Customers: {rowData.length}
      </div>
    </div>
  );
};

export default Users;