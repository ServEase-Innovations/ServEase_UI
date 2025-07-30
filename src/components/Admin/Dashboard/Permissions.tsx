/* eslint-disable */
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState, useCallback } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface Permission {
  _id: string;
  username: string;
  hashedPassword: string;
  role: "SuperAdmin" | "User" | "Admin" | string;
  actions?: any;
}

const Permissions = () => {
  const [rowData, setRowData] = useState<Permission[]>([]);

  const updateUserRole = useCallback(async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`https://utils-ndt3.onrender.com/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      // Refresh data after update
      const updated = await res.json();
      setRowData(prev =>
        prev.map(user => (user._id === userId ? { ...user, role: updated.role } : user))
      );
    } catch (err) {
      console.error("Error updating role:", err);
    }
  }, []);

  const RoleDropdownRenderer = (props: any) => {
    const [selectedRole, setSelectedRole] = useState(props.value);
    const [previousRole, setPreviousRole] = useState(props.value);
  
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRole = e.target.value;
  
      if (newRole === previousRole) return;
  
      const confirmed = window.confirm(`Are you sure you want to change role to "${newRole}"?`);
      if (confirmed) {
        setSelectedRole(newRole);
        setPreviousRole(newRole);
        updateUserRole(props.data._id, newRole);
      } else {
        setSelectedRole(previousRole); // revert
      }
    };
  
    useEffect(() => {
      // Keep synced with parent updates
      setSelectedRole(props.value);
      setPreviousRole(props.value);
    }, [props.value]);
  
    return (
      <select
        value={selectedRole}
        onChange={handleChange}
        className="bg-white border rounded px-2 py-1"
      >
        <option value="User">User</option>
        <option value="Admin">Admin</option>
        <option value="SuperAdmin">SuperAdmin</option>
      </select>
    );
  };
  

  const [colDefs] = useState<ColDef<Permission>[]>([
    { field: "username", headerName: "User Name" },
    {
        field: "role",
        headerName: "Role",
        cellRenderer: RoleDropdownRenderer,
        flex: 1,
      },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => {
        return (
          <button
            onClick={() => handleDeleteUser(params.data._id)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        );
      },
      width: 100
    }
  ]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
  
    try {
      const response = await fetch(`https://utils-ndt3.onrender.com/users/${userId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        setRowData(prev => prev.filter(user => user._id !== userId));
      } else {
        console.error("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  

  
  

  useEffect(() => {
    fetch("https://utils-ndt3.onrender.com/users")
      .then((res) => res.json())
      .then((data) => setRowData(data))
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
      <AgGridReact rowData={rowData} columnDefs={colDefs} domLayout="autoHeight" />
    </div>
  );
};

export default Permissions;
