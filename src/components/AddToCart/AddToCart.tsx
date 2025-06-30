import React, { useState } from "react";
import {
  Button,
  Checkbox,
  TextField,
  Typography,
  Grid,
  Card,
  FormGroup,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PersonIcon from "@mui/icons-material/Person";
import "./MealServicePage.css";

export default function MealServicePage() {
  const [numberOfPersons, setNumberOfPersons] = useState("");
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [serviceType, setServiceType] = useState("Regular");

  const handleServiceType = (event: React.SyntheticEvent, newValue: string) => {
    setServiceType(newValue);
  };

  const handleMealChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedMeals((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <Box className="page-container">
      <Card className="card-container">
        <Grid container spacing={3}>
          {/* Profile Info Section */}
          <Grid item xs={12}>
            <Card sx={{ padding: 3, boxShadow: 3 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ marginBottom: 2 }}
              >
                Diyasha Singha Roy, (F 24)
              </Typography>
              <Typography variant="body1">
                <strong>Diet:</strong> Veg <strong>Languages:</strong> English,
                Hindi | <strong>Specialities:</strong> Cooking |{" "}
                <strong>Role:</strong> Maid
              </Typography>
            </Card>
          </Grid>

          {/* Left Section (Meal Service Info) */}
          <Grid item xs={12} md={8}>
            <Card sx={{ padding: 3, boxShadow: 3 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                sx={{ gap: 1, marginBottom: 2 }}
              >
                <RestaurantMenuIcon color="primary" />
                Service Type
              </Typography>

              <Tabs
                value={serviceType}
                onChange={handleServiceType}
                textColor="primary"
                indicatorColor="primary"
                aria-label="service type tabs"
                sx={{
                  backgroundColor: "#f1f1f1",
                  borderRadius: "5px 5px 0 0",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  marginBottom: 3,
                }}
              >
                <Tab
                  value="Regular"
                  label="Regular"
                  sx={{
                    borderRight: "1px solid #ddd",
                    padding: "10px 20px",
                    textTransform: "none",
                    fontWeight: "bold",
                    color: "#444",
                    width: "50%",
                    "&.Mui-selected": {
                      color: "#fff",
                      backgroundColor: "#1E90FF",
                    },
                    "&:hover": {
                      backgroundColor: "#ddd",
                    },
                  }}
                />
                <Tab
                  value="Premium"
                  label="Premium"
                  sx={{
                    padding: "10px 20px",
                    textTransform: "none",
                    fontWeight: "bold",
                    color: "#444",
                    width: "50%",
                    "&.Mui-selected": {
                      color: "#fff",
                      backgroundColor: "#1E90FF",
                    },
                    "&:hover": {
                      backgroundColor: "#ddd",
                    },
                  }}
                />
              </Tabs>

              <Typography
                variant="h6"
                sx={{ marginBottom: 2, fontWeight: "bold" }}
              >
                Meal Type
              </Typography>
              <FormGroup row sx={{ gap: 2, justifyContent: "center" }}>
                {Object.keys(selectedMeals).map((meal) => (
                  <FormControlLabel
                    key={meal}
                    control={
                      <Checkbox
                        checked={selectedMeals[meal]}
                        onChange={handleMealChange}
                        name={meal}
                        sx={{
                          "& .MuiSvgIcon-root": {
                            color: "#1e88e5",
                          },
                        }}
                      />
                    }
                    label={
                      <Button
                        variant="outlined"
                        size="large"
                        sx={{
                          textTransform: "capitalize",
                          borderRadius: "25px",
                          color: "#1e88e5",
                          borderColor: "#1e88e5",
                          padding: "8px 16px",
                          "&:hover": {
                            backgroundColor: "#e3f2fd",
                          },
                        }}
                      >
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </Button>
                    }
                  />
                ))}
              </FormGroup>
              {/* Number of Persons */}
              <div style={{ marginTop: "40px", marginBottom: "16px" }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  sx={{ gap: 2, marginBottom: 2 }}
                >
                  <PersonIcon color="primary" />
                  Persons
                </Typography>
                <TextField
                  type="number"
                  value={numberOfPersons}
                  onChange={(e) => setNumberOfPersons(e.target.value)}
                  placeholder="Enter number of persons"
                  variant="outlined"
                  className="input-field"
                />
              </div>
            </Card>
          </Grid>

          {/* Right Section (Total Price & Checkout) */}
          <Grid item xs={12} md={4}>
            <Card sx={{ padding: 3, textAlign: "center", boxShadow: 3 }}>
              <Typography
                variant="h5"
                sx={{ marginBottom: 2, fontWeight: "bold" }}
              >
                Total Price
              </Typography>
              <Typography
                variant="h4"
                color="green"
                sx={{ fontWeight: "bold" }}
              >
                $180/month
              </Typography>
            </Card>

            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartIcon />}
              fullWidth
              sx={{ marginY: 2, height: 50 }}
            >
              Add to Cart
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<PaymentIcon />}
              fullWidth
              sx={{ height: 50 }}
            >
              Proceed to Checkout
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
