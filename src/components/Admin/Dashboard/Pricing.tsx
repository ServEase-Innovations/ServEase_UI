/* eslint-disable */
import { Card, CardContent, CardHeader, CardTitle } from "../../Common/Card";
import { Button } from "../../Common/button";
import { Badge } from "../../Common/Badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";

interface ServicePricing {
  _id: string;
  SNo: number;
  Service: string;
  Type: string;
  Categories: string;
  SubCategories: string;
  NumbersOrSize: string;
  Price: number;
  JobDescription: string;
  RemarksOrConditions: string;
  BookingType: string;
}



const Pricing = () => {

  useEffect(() => {
    fetch("https://utils-ndt3.onrender.com/records")
      .then((res) => res.json())
      .then((data) => {
        const mappedData: ServicePricing[] = data.map((item: any) => {
          const isRegular = item.Type?.toLowerCase().includes("regular");
          const price = isRegular
          ? item["Price /Month (INR)"] ?? item["Price /Day (INR)"]
          : item["Price /Day (INR)"];
        
  
          return {
            _id: item._id,
            SNo: item["S.No."],
            Service: item.Service,
            Type: item.Type,
            Categories: item.Categories,
            SubCategories: item["Sub-Categories"],
            NumbersOrSize: item["Numbers/Size"],
            Price: price ?? 0, // fallback if both are undefined
            JobDescription: item["Job Description"],
            RemarksOrConditions: item["Remarks/Conditions"],
            BookingType: item.BookingType,
          };
        });
  
        setRowData(mappedData);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  }, []);
  
  

  // Row Data: The data to be displayed.
      const [rowData, setRowData] = useState<ServicePricing[]>([]);
    
      // Column Definitions: Defines & controls grid columns.
      const [colDefs] = useState<ColDef<ServicePricing>[]>([
        { field: "SNo", headerName: "S.No." },
        { field: "Service" },
        { field: "Type" },
        { field: "Categories" },
        { field: "SubCategories", headerName: "Sub-Categories" },
        { field: "NumbersOrSize", headerName: "Numbers/Size" },
        {
          field: "Price",
          headerName: "Price (INR)",
          valueFormatter: (params) => {
            const type = params?.data?.Type?.toLowerCase();
            const suffix = type?.includes("regular") ? "/month" : "/day";
            return `₹${params.value} ${suffix}`;
          },
        },
        { field: "JobDescription", headerName: "Job Description" },
        { field: "RemarksOrConditions", headerName: "Remarks/Conditions" },
        { field: "BookingType" },
      ]);
      
  
      const defaultColDef: ColDef = {
        flex: 1,
        resizable: true,
    sortable: true,
    filter: true,
      };
      
  return (
    <div style={{ width: "100%", height: "100%" }} className="ag-theme-alpine">
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
          />
        </div>
  );
};

export default Pricing;