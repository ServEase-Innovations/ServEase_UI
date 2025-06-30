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
import "./New.css";
import CategoryIcon from '@mui/icons-material/Category';

export default function MealServicePage() {
  const [numberOfPersons, setNumberOfPersons] = useState("");
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
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
    <div
      className="page-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Ensure the page takes full viewport height
        padding: "20px",
        marginBottom: 0,
        border: "2px solid #1e88e5",
      }}
    >
      <Card
        className="card-container"
        sx={{
          padding: 3,
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "80%", // Make the card fill a portion of the page
        }}
      >
        <Grid container spacing={3}>
          {/* Profile Info Section */}
          <Grid item xs={12}>
            <Card sx={{ padding: 3, boxShadow: 3, marginBottom: 1 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 1 }}>
                Diyasha Singha Roy, (F 24)
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 1 }}>
                <strong>Diet:</strong> Veg <strong>Languages:</strong> English, Hindi |{" "}
                <strong>Specialities:</strong> Cooking | <strong>Role:</strong> Maid
              </Typography>
            </Card>
          </Grid>

         {/* Left Vertical Card */}
         {/* <Grid item xs={12} md={2}>
            <Card
              sx={{
                padding: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "70%", // Ensure it fills the remaining space
                boxShadow: 3,
              }}
            >
              {[
                { src: "/Utensil.png", alt: "Utensil Cleaning" },
                { src: "/Sweeping.png", alt: "Sweeping" },
                { src: "/Bathroom.png", alt: "Bathroom Cleaning" },
                { src: "/Clothes.png", alt: "Clothes Washing" },
                { src: "/Dusting.png", alt: "Dusting" },
               
              ].map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ddd",
                    padding: 1,
                    width: "100%",
                    maxWidth: "120px", // Preserve consistent width
                    height: "120px", // Preserve consistent height
                    boxShadow: index === 5 ? "0 0 3px 2px blue" : 1,
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Card>
              ))}
            </Card>
          </Grid> */}

          {/* Middle Section (Meal Service Info) */}
         {/* Middle Section (Meal Service Info) */}

  <Grid item xs={12} md={9}>
  <Card sx={{ padding: 3, boxShadow: 3 ,border: "1px solid #ddd"}}>
  <Typography>
      <Box
        sx={{
          display: "flex", // Align items horizontally
          alignItems: "right", // Vertically align
        }}
      >
        
        {/* Icon outside the tabs */}
        <CategoryIcon sx={{  color: "#1e88e5" , marginLeft: 4,fontSize: "2rem"}} />
        <Tabs
          value={serviceType}
          onChange={handleServiceType}
          textColor="primary"
          indicatorColor="primary"
          aria-label="service type tabs"
          sx={{
            backgroundColor: "#f1f1f1",
            borderRadius: "5px 5px 0 0",
            boxShadow: 3,
            marginBottom: 0.1,
            marginLeft: 4,
            border: "2px solid #ddd",
            borderBottom: "none",
            width: "100%",
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
  </Box>

  <div
    style={{
      borderBottom: "2px solid #ddd", // Horizontal line below the tabs
      marginTop: "-2px",             // Align with the tabs
    }}
  />
  
  </Typography>
      {/* Images */}
      <Grid container spacing={0} sx={{ display: "flex", alignItems: "center" }}>
      <Grid item xs={2} sx={{ marginTop: "0.5px" }}>
      {[
        { src: "/Dishes.png", alt: "Utensil Cleaning" },
        { src: "/new.png", alt: "Sweeping" },
        { src: "/wash.png", alt: "Bathroom Cleaning" },
        { src: "/laundrynew.png", alt: "Clothes Washing" },
        { src: "/newdust.png", alt: "Dusting" },
      ].map((item, index) => (
        <div
          key={index}
          onClick={() => {
            setClickedIndex(index); // Set clicked index
            console.log(`${item.alt} clicked`);
          }}
          style={{
            width: "70%",
            height: "60px",
            border: clickedIndex === index ? "2px solid skyblue" : "2px solid #ddd", // Border color change on click
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Shadow effect for elevation
            backgroundColor: "#fff",
            color: "#1e88e5", // Button text color
            borderColor:  clickedIndex === index ? "2px solid skyblue" : "2px solid #ddd",
            transition: "all 0.3s ease",  // Smooth transition for color changes
          }}
          onMouseEnter={(e) => {
            if (clickedIndex !== index) {
              e.currentTarget.style.backgroundColor = "#e3f2fd";  // Hover effect (light blue background)
              e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.2)";  // Elevated shadow effect on hover
            }
          }}
          onMouseLeave={(e) => {
            if (clickedIndex !== index) {
              e.currentTarget.style.backgroundColor = "#fff";  // Reset background to white
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";  // Reset shadow
            }
          }}
        >
          <img
            src={item.src}
            alt={item.alt}
            style={{
              maxWidth: "60%",
              maxHeight: "60%",
              objectFit: "contain",
            }}
          />
        </div>
      ))}
      
    </Grid>
          {/* Meal Selection Form */}
     <Grid item xs={10}>
     <div
      style={{
        marginBottom:"40px",
        borderRight: "2px solid #ddd",  // Black right border
        padding: "16px",                 // Optional: some padding inside the box
        borderTop: "none",               // Optional: Remove the top border if not needed
        borderLeft: "none",              // Optional: Remove the left border if not needed
      }}
    >    
   <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
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
          </div>
        </Grid>
    
      </Grid>
 
      <div
    style={{
      borderBottom: "2px solid #ddd", // Horizontal line below the tabs
      marginTop: "-2px",             // Align with the tabs
      boxShadow: "4", // Shadow effect
      // boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.3)",  
    }}
  />
  
 
  </Card>
  </Grid>
          {/* Right Section (Total Price & Checkout) */}
          <Grid item xs={12} md={3}>
            <Card sx={{ padding: 3, textAlign: "center", boxShadow: 3 }}>
              <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>
                Total Price
              </Typography>
              <Typography variant="h4" color="green" sx={{ fontWeight: "bold" }}>
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
    </div>
  );
}
