/* eslint-disable */
import { Card, CardContent, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Badge } from "../../Common/Badge";
import { MoreHorizontal, Plus, Search, Star } from "lucide-react";
import { Input } from "../../Common/input";
import { useEffect, useState } from "react";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export interface ServiceProvider {
  serviceproviderId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  mobileNo: number;
  alternateNo: number | null;
  emailId: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | string;
  buildingName: string | null;
  locality: string | null;
  latitude: number;
  longitude: number;
  geoHash5: string;
  geoHash6: string;
  geoHash7: string;
  street: string | null;
  pincode: number;
  currentLocation: string | null;
  nearbyLocation: string | null;
  location: string | null;
  enrolledDate: string; // ISO string format
  profilePic: string | null;
  housekeepingRole: 'MAID' | 'COOK' | 'NANNY' | string;
  diet: string | null; // Add the diet property
  cookingSpeciality: string | null; // Add the cookingSpeciality property
  idNo: string | null; // Add the idNo property
  rating: number | null; // Add the rating property
  languageKnown: string | null; // Add the languageKnown property,
  speciality : string | null; // Add the speciality property,
  age: number | null; // Add the age property,
  info: string | null; // Add the info property,
  timeslot: string | null; // Add the timeslot property,
  expectedSalary: number | null; // Add the expectedSalary property,
  experience: number | null; // Add the experience property,
  vendorId: string | null; // Add the vendorId property
}



const ServiceProviders = () => {
  const [rowData, setRowData] = useState<ServiceProvider[]>([]);
  const columnDefs: ColDef<ServiceProvider>[] = [
    { field: "serviceproviderId", headerName: "ID", sortable: true, filter: true },
    { field: "firstName", headerName: "First Name", sortable: true, filter: true },
    { field: "middleName", headerName: "Middle Name", sortable: true, filter: true },
    { field: "lastName", headerName: "Last Name", sortable: true, filter: true },
    { field: "mobileNo", headerName: "Mobile No", sortable: true, filter: true },
    { field: "alternateNo", headerName: "Alternate No", sortable: true, filter: true },
    { field: "emailId", headerName: "Email", sortable: true, filter: true },
    { field: "gender", headerName: "Gender", sortable: true, filter: true },
    { field: "buildingName", headerName: "Building", sortable: true, filter: true },
    { field: "locality", headerName: "Locality", sortable: true, filter: true },
    { field: "latitude", headerName: "Latitude", sortable: true, filter: true },
    { field: "longitude", headerName: "Longitude", sortable: true, filter: true },
    { field: "geoHash5", headerName: "GeoHash5", sortable: true, filter: true },
    { field: "geoHash6", headerName: "GeoHash6", sortable: true, filter: true },
    { field: "geoHash7", headerName: "GeoHash7", sortable: true, filter: true },
    { field: "street", headerName: "Street", sortable: true, filter: true },
    { field: "pincode", headerName: "Pincode", sortable: true, filter: true },
    { field: "currentLocation", headerName: "Current Location", sortable: true, filter: true },
    { field: "nearbyLocation", headerName: "Nearby Location", sortable: true, filter: true },
    { field: "location", headerName: "Location", sortable: true, filter: true },
    {
      field: "enrolledDate",
      headerName: "Enrolled Date",
      sortable: true,
      filter: "agDateColumnFilter",
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : ""
    },
    {
      field: "profilePic",
      headerName: "Profile Pic",
      cellRenderer: ({ value }) => {
        const imgSrc = value || "/default-profile.png";
        return `<img src="${imgSrc}" width="40" height="40" style="border-radius: 50%;" alt="profile" />`;
      }
    },
    { field: "housekeepingRole", headerName: "Role", sortable: true, filter: true },
    { field: "diet", headerName: "Diet", sortable: true, filter: true },
    { field: "cookingSpeciality", headerName: "Cooking Speciality", sortable: true, filter: true },
    { field: "idNo", headerName: "ID No", sortable: true, filter: true },
    { field: "rating", headerName: "Rating", sortable: true, filter: true },
    { field: "languageKnown", headerName: "Languages", sortable: true, filter: true },
    { field: "speciality", headerName: "Speciality", sortable: true, filter: true },
    { field: "age", headerName: "Age", sortable: true, filter: true },
    { field: "info", headerName: "Info", sortable: true, filter: true },
    { field: "timeslot", headerName: "Timeslot", sortable: true, filter: true },
    { field: "expectedSalary", headerName: "Expected Salary", sortable: true, filter: true },
    { field: "experience", headerName: "Experience (yrs)", sortable: true, filter: true },
    { field: "vendorId", headerName: "Vendor ID", sortable: true, filter: true },
  ];

  useEffect(() => {
        fetch("https://servease-be-5x7f.onrender.com/api/serviceproviders/serviceproviders/all?page=0&size=100")
          .then((res) => res.json())
          .then((data) => {
            setRowData(data);
          })
          .catch((err) => {
            console.error("Failed to fetch customers:", err);
          });
      }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
        />
      </div>
  );
};

export default ServiceProviders;