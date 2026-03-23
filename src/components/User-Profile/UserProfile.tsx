/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable */

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
import { useSelector, useDispatch } from "react-redux";
import { add } from "../../features/user/userSlice";
import { useAppUser } from "src/context/AppUserContext";
import { useLanguage } from "src/context/LanguageContext";
interface UserProfileProps {
  goBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ goBack }) => {
  const { t } = useLanguage(); // Initialize the translation hook
  const dispatch = useDispatch();

  // Access user data from Redux store
  const userData = useSelector((state: any) => state.user.value);
  const { appUser } = useAppUser();

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
      currentLocation: "",
    },
    additional: {
      idNo: "",
      languageKnown: "",
      housekeepingRole: "",
      cookingSpeciality: "",
      diet: "",
    },
  });

  // Populate formData from Redux store
  useEffect(() => {
    if (userData) {
      console.log("user Data ===> ", userData);
      let userInfo;
      if (appUser.role === "SERVICE_PROVIDER") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        userInfo = appUser.serviceProviderDetails;
      } else if (appUser.role === "CUSTOMER") {
        userInfo = appUser.customerDetails;
      }
      setFormData({
        account: {
          firstName: userInfo.firstName || "",
          lastName: userInfo.lastName || "",
          mobileNo: userInfo.mobileNo || "",
          emailId: userInfo.emailId || "",
          age: userInfo.age || "",
        },
        location: {
          buildingName: userInfo.buildingName || "",
          locality: userInfo.locality || "",
          street: userInfo.street || "",
          pincode: userInfo.pincode || "",
          nearbyLocation: userInfo.nearbyLocation || "",
          currentLocation: userInfo.currentLocation || "",
        },
        additional: {
          idNo: userInfo.idNo || "",
          languageKnown: userInfo.languageKnown || "",
          housekeepingRole: userInfo.housekeepingRole || "",
          cookingSpeciality: userInfo.cookingSpeciality || "",
          diet: userInfo.diet || "",
        },
      });
    }
  }, [userData]);

  const handleChange = (section: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    // Merge all sections into one object and dispatch to Redux
    const updatedData = {
      ...formData.account,
      ...formData.location,
      ...formData.additional,
    };

    dispatch(add(updatedData)); // Update Redux store
    alert(t("changesSaved")); // Use translation for alert
  };

  return (
    <>
      <div>
        <button onClick={goBack}>{t("back")}</button>
        <div
          style={{
            gap: "10px",
            maxWidth: "800px",
            margin: "auto",
            padding: "20px",
            display: "grid",
            backgroundColor: "beige",
          }}
        >
          {/* Account Accordion */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("account")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                placeholder={t("firstName")}
                fullWidth
                margin="normal"
                value={formData.account.firstName}
                onChange={(e) =>
                  handleChange("account", "firstName", e.target.value)
                }
              />
              <TextField
                placeholder={t("lastName")}
                fullWidth
                margin="normal"
                value={formData.account.lastName}
                onChange={(e) =>
                  handleChange("account", "lastName", e.target.value)
                }
              />
              <TextField
                placeholder={t("mobileNumber")}
                fullWidth
                margin="normal"
                value={formData.account.mobileNo}
                onChange={(e) =>
                  handleChange("account", "mobileNo", e.target.value)
                }
              />
              <TextField
                placeholder={t("email")}
                fullWidth
                margin="normal"
                value={formData.account.emailId}
                onChange={(e) =>
                  handleChange("account", "emailId", e.target.value)
                }
              />
              <TextField
                placeholder={t("age")}
                fullWidth
                margin="normal"
                value={formData.account.age}
                onChange={(e) => handleChange("account", "age", e.target.value)}
              />
            </AccordionDetails>
          </Accordion>

          {/* Location Accordion */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("locationDetails")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Location fields */}
              <TextField
                placeholder={t("buildingName")}
                fullWidth
                margin="normal"
                value={formData.location.buildingName}
                onChange={(e) =>
                  handleChange("location", "buildingName", e.target.value)
                }
              />
              <TextField
                placeholder={t("locality")}
                fullWidth
                margin="normal"
                value={formData.location.locality}
                onChange={(e) =>
                  handleChange("location", "locality", e.target.value)
                }
              />
              <TextField
                placeholder={t("street")}
                fullWidth
                margin="normal"
                value={formData.location.street}
                onChange={(e) =>
                  handleChange("location", "street", e.target.value)
                }
              />
              <TextField
                placeholder={t("pincode")}
                fullWidth
                margin="normal"
                value={formData.location.pincode}
                onChange={(e) =>
                  handleChange("location", "pincode", e.target.value)
                }
              />
              <TextField
                placeholder={t("nearbyLocation")}
                fullWidth
                margin="normal"
                value={formData.location.nearbyLocation}
                onChange={(e) =>
                  handleChange("location", "nearbyLocation", e.target.value)
                }
              />
              <TextField
                placeholder={t("currentLocation")}
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
              <Typography>{t("additionalDetails")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Additional fields */}
              <TextField
                placeholder={t("aadhaarCardNumber")}
                fullWidth
                margin="normal"
                value={formData.additional.idNo}
                onChange={(e) =>
                  handleChange("additional", "idNo", e.target.value)
                }
              />
              <TextField
                placeholder={t("languagesKnown")}
                fullWidth
                margin="normal"
                value={formData.additional.languageKnown}
                onChange={(e) =>
                  handleChange("additional", "languageKnown", e.target.value)
                }
              />
              <TextField
                placeholder={t("housekeepingRole")}
                fullWidth
                margin="normal"
                value={formData.additional.housekeepingRole}
                onChange={(e) =>
                  handleChange("additional", "housekeepingRole", e.target.value)
                }
              />
              <TextField
                placeholder={t("cookingSpeciality")}
                fullWidth
                margin="normal"
                value={formData.additional.cookingSpeciality}
                onChange={(e) =>
                  handleChange(
                    "additional",
                    "cookingSpeciality",
                    e.target.value
                  )
                }
              />
              <TextField
                placeholder={t("dietPreference")}
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
            {t("save")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default UserProfile;