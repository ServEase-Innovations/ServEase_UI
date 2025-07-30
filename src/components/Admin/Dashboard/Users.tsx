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

export interface Customer {
  customerId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  mobileNo: string | null;
  alternateNo: string | null;
  emailId: string;
  gender: string | null;
  languageKnown: string | null;
  buildingName: string | null;
  locality: string | null;
  street: string | null;
  pincode: string | null;
  profilePic: string | null;
  currentLocation: string | null;
  idNo: string | null;
  enrolledDate: string; // or `Date` if you're parsing it
  speciality: string | null;
  rating: number;
  username: string | null;
  password: string | null;
  active: boolean;
  kyc: string | null;
}


const Users = () => {
  
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState<Customer[]>([]);
  
    // Column Definitions: Defines & controls grid columns.
    const columnDefs: ColDef<Customer>[] = [
      { field: "customerId", headerName: "Customer ID" },
      { field: "firstName", headerName: "First Name" },
      { field: "middleName", headerName: "Middle Name" },
      { field: "lastName", headerName: "Last Name" },
      { field: "mobileNo", headerName: "Mobile No" },
      { field: "alternateNo", headerName: "Alternate No" },
      { field: "emailId", headerName: "Email" },
      { field: "gender", headerName: "Gender" },
      { field: "languageKnown", headerName: "Languages Known" },
      { field: "buildingName", headerName: "Building Name" },
      { field: "locality", headerName: "Locality" },
      { field: "street", headerName: "Street" },
      { field: "pincode", headerName: "Pincode" },
      {
        field: "profilePic",
        headerName: "Profile Picture",
        cellRenderer: (params) => {
          const defaultPic = "👤";
          const imgSrc = params.value ? params.value : defaultPic;
      
          return (
            <img
              src={imgSrc}
              width={40}
              height={40}
              style={{ borderRadius: "50%" }}
              alt="profile"
            />
          );
        },
        width: 100,
        suppressSizeToFit: true,
      },
      
      { field: "currentLocation", headerName: "Current Location" },
      { field: "idNo", headerName: "ID No" },
      { field: "enrolledDate", headerName: "Enrolled Date" },
      { field: "speciality", headerName: "Speciality" },
      { field: "rating", headerName: "Rating" },
      { field: "username", headerName: "Username" },
      { field: "password", headerName: "Password" },
      {
        field: "active",
        headerName: "Active",
        cellRenderer: (params) => (params.value ? "Yes" : "No"),
      },
      { field: "kyc", headerName: "KYC Document" },
    ];
    

    useEffect(() => {
      fetch("https://servease-be-5x7f.onrender.com/api/customer/get-all-customers?page=0&size=100")
        .then((res) => res.json())
        .then((data) => {
          setRowData(data);
        })
        .catch((err) => {
          console.error("Failed to fetch customers:", err);
        });
    }, []);

    const defaultColDef: ColDef = {
      flex: 1,
          resizable: true,
          sortable: true,
          filter: true,
    };

    
  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
    <AgGridReact
      rowData={rowData}
      columnDefs={columnDefs}
    />
  </div>
  );

};

export default Users;