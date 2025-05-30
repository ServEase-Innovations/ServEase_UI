/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axiosInstance from '../../services/axiosInstance';

interface EditProviderProps {
  goBack: () => void;
}

const EditProvider:  React.FC<EditProviderProps> = ({ goBack })=> {
  const [formData, setFormData] = useState({
    account: {
      firstName: "",
      lastName: "",
      mobileNo: "",
      emailId: "",
      age: "",
    },
    location: {
      buildingName: "",
      locality: "",
      street: "",
      pincode: "",
      nearbyLocation: "",
      currentLocation:"",
    },
    additional: {
      
      idNo: "",
      languageKnown: "",
      housekeepingRole: "",
      cookingSpeciality: "",
      diet: "",
    },
  });

  // Replace this ID with a dynamic ID if needed
  const serviceProviderId = 2;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/serviceproviders/get/serviceprovider/${serviceProviderId}`
        );
        const data = response.data;

        // Map the response data to the formData structure
        setFormData({
          account: {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            mobileNo: data.mobileNo || "",
            emailId: data.emailId || "",
            age: data.age || "",
          },
          location: {
            buildingName: data.buildingName || "",
            locality: data.locality || "",
            street: data.street || "",
            pincode: data.pincode || "",
            nearbyLocation: data.nearbyLocation || "",
            currentLocation: data.currentLocation ||"",
          },
          additional: {
            idNo: data.idNo || "",
            languageKnown: data.languageKnown || "",
            housekeepingRole: data.housekeepingRole || "",
            cookingSpeciality: data.cookingSpeciality || "",
            diet: data.diet || "",
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, [serviceProviderId]);

  const handleChange = (section: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const updateData = {
        ...formData.account,
        ...formData.location,
        ...formData.additional,
      };

      const response = await axiosInstance.put(
        `/api/serviceproviders/update/serviceprovider/${serviceProviderId}`,
        updateData
      );

      alert("Form data updated successfully!");
      console.log("Updated Data:", response.data);
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Failed to update data. Please try again later.");
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom className="text-center p-3">
        Personal Details
      </Typography>
      <div>
      <Button onClick={goBack} variant="outlined">
        Back to Dashboard
      </Button>

      {/* Rest of the form */}
    
      <div
        style={{
          gap: "10px ",
          maxWidth: "800px",
          margin: "auto",
          padding: "20px",
          display: "grid",
          backgroundColor:"beige",
        }}
      >
        {/* Account Accordion */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Account</Typography>
          </AccordionSummary>
          <AccordionDetails >
            <TextField
              placeholder="First Name"
              fullWidth
              margin="normal"
              value={formData.account.firstName}
              onChange={(e) =>
                handleChange("account", "firstName", e.target.value)
              }
            />
            <TextField
              placeholder="Last Name"
              fullWidth
              margin="normal"
              value={formData.account.lastName}
              onChange={(e) =>
                handleChange("account", "lastName", e.target.value)
              }
            />
            <TextField
              placeholder="Mobile Number"
              fullWidth
              margin="normal"
              value={formData.account.mobileNo}
              onChange={(e) =>
                handleChange("account", "mobileNo", e.target.value)
              }
            />
            <TextField
              placeholder="Email"
              fullWidth
              margin="normal"
              value={formData.account.emailId}
              onChange={(e) =>
                handleChange("account", "emailId", e.target.value)
              }
            />
            <TextField
              placeholder="Age"
              fullWidth
              margin="normal"
              value={formData.account.age}
              onChange={(e) =>
                handleChange("account", "age", e.target.value)
              }
            />
          </AccordionDetails>
        </Accordion>
        {/* Location Accordion */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Location Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              placeholder="Building Name"
              fullWidth
              margin="normal"
              value={formData.location.buildingName}
              onChange={(e) =>
                handleChange("location", "buildingName", e.target.value)
              }
            />
            <TextField
              placeholder="Locality"
              fullWidth
              margin="normal"
              value={formData.location.locality}
              onChange={(e) =>
                handleChange("location", "locality", e.target.value)
              }
            />
            <TextField
              placeholder="Street"
              fullWidth
              margin="normal"
              value={formData.location.street}
              onChange={(e) =>
                handleChange("location", "street", e.target.value)
              }
            />
            <TextField
              placeholder="Pin Code"
              fullWidth
              margin="normal"
              value={formData.location.pincode}
              onChange={(e) =>
                handleChange("location", "pincode", e.target.value)
              }
            />
            <TextField
              placeholder="Nearby Location"
              fullWidth
              margin="normal"
              value={formData.location.nearbyLocation}
              onChange={(e) =>
                handleChange("location", "nearbyLocation", e.target.value)
              }
            />
            <TextField
              placeholder="Current Location"
              fullWidth
              margin="normal"
              value={formData.location.currentLocation}
              onChange={(e) =>
                handleChange("location", "currentLocation", e.target.value)
              }
            />
          </AccordionDetails>
        </Accordion>
        {/* Additional Details Accordion */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Additional Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              placeholder="Aadhaar Card Number"
              fullWidth
              margin="normal"
              value={formData.additional.idNo}
              onChange={(e) =>
                handleChange("additional", "idNo", e.target.value)
              }
            />
            <TextField
              placeholder="Languages"
              fullWidth
              margin="normal"
              value={formData.additional.languageKnown}
              onChange={(e) =>
                handleChange("additional", "languageKnown", e.target.value)
              }
            />
            <TextField
              placeholder="Housekeeping Role"
              fullWidth
              margin="normal"
              value={formData.additional.housekeepingRole}
              onChange={(e) =>
                handleChange("additional", "housekeepingRole", e.target.value)
              }
            />
            <TextField
              placeholder="Cooking Speciality"
              fullWidth
              margin="normal"
              value={formData.additional.cookingSpeciality}
              onChange={(e) =>
                handleChange("additional", "cookingSpeciality", e.target.value)
              }
            />
            <TextField
              placeholder="Diet"
              fullWidth
              margin="normal"
              value={formData.additional.diet}
              onChange={(e) =>
                handleChange("additional", "diet", e.target.value)
              }
            />
          </AccordionDetails>
        </Accordion>
        {/* Save Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ width: "30px", marginTop: "30px" }}
          onClick={handleSave}
        >
          Save
        </Button>
        </div>
      </div>
    </>
  );
};

export default EditProvider;
