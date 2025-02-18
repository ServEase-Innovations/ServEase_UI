import { Alert, Box, Button, Card, Checkbox, FormControlLabel, FormGroup, Grid,  Snackbar, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CategoryIcon from '@mui/icons-material/Category';
import PaymentIcon from "@mui/icons-material/Payment";
import { useEffect, useState } from "react";
import { getPriceByNumber, getPriceByvalue } from "../../../customServices/PricingService";

interface CookPricingProps {
    onPriceChange: (priceData: { price: number, selecteditem: any }) => void; 
    onAddToCart:(priceData: { price: number, selecteditem: any }) => void; // Add the onPriceChange function as a prop
    pricing : any;
    sendToParent : (data : string) => void;
  }


const MaidServices = ({ onPriceChange , onAddToCart , pricing , sendToParent }: CookPricingProps) => {

    // console.log("Pricing ---> ", JSON.stringify(pricing))

    const [clickedIndex, setClickedIndex] = useState<number | null>(null);
    const [selectedCategory , setSelectedcategory ] = useState<any>();
    const [numberOfPersons ,  setNumberOfPersons] = useState<string>();
    const [ Price , setPrice ] = useState<number | undefined>(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const groupedServices = pricing.reduce((acc, item) => {
        const groupKey = item.Type === "Regular Add-on" ? "Regular Add-on" : item.Categories;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
      }, {});

      const getImage = ( category) => {
        if(category === 'Utensil Cleaning'){
            return '/Dishes.png'
        } else if( category === 'Sweeping & Mopping'){
            return '/new.png'
        } else if( category === 'Bathroom'){
            return '/wash.png'
        } else {
            return '/laundrynew.png'
        }
        
      }
    

    function handleButtonClick(value: any, arg1: string): void {
        console.log("Value => ", value ) 
            console.log("arg1" , arg1  )
            setSelectedcategory(value)
            console.log(selectedCategory)
        
    }

    function handleNumberOfPersons(value: string): void {
        setNumberOfPersons(value);
        if(selectedCategory[1][0]['Sub-Categories'] !== 'Number'){
            setPrice(getPriceByvalue(selectedCategory[1][0], value))
        } else {
            setPrice(getPriceByNumber(selectedCategory[1][0], value))
        }
        
    }


    useEffect(() =>{
        console.log("number of person " , numberOfPersons)
    },[numberOfPersons])

    function handleCheck(data): void {
        console.log(data)
    }

    function getLabel(button: [string, any]) {
        return button[1]['Categories']
    }

    return (
        <>
            <Box className="container">
              <Card
                      className="container-card"
                      sx={{
                        padding: 3,
                        boxShadow: 3,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%", 
                        width:'100%'// Make the card fill a portion of the page
                      }}
                    >
                      <Grid container spacing={3}>
                       
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
                    // value={serviceType}
                    // onChange={handleServiceType}
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
                marginTop: "-2px",
                width:"100%"             // Align with the tabs
              }}
            />
            
            </Typography>
                {/* Images */}
                <Grid container spacing={0} sx={{ display: "flex", alignItems: "center" }}>
                <Grid item xs={2} sx={{ marginTop: "0.5px" }}>
               {Object.entries(groupedServices).map((button, index) => (
                  
                    <Tooltip title={button[0]}>
                      <div
                        onClick={() => handleButtonClick(button , 'category')}
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
                    src={getImage(button[0])}
                    alt={'/Dishes.png'}
                      style={{
                        maxWidth: "60%",
                        maxHeight: "60%",
                        objectFit: "contain",
                      }}
                    />
                   </div>
                    </Tooltip>
                  
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
           
           {selectedCategory && selectedCategory[0] !== "Regular Add-on" &&
    (selectedCategory[1][0]['Sub-Categories'] === 'People' || 
     selectedCategory[1][0]['Sub-Categories'] === "House" || 
     selectedCategory[1][0]['Sub-Categories'] === "Number") && (
    <>
        <strong>{selectedCategory[1][0]['Sub-Categories']}</strong>
        <TextField
            type="number"
            value={numberOfPersons}
            onChange={(e) => handleNumberOfPersons(e.target.value)}
            placeholder={`Enter number of ${selectedCategory[1][0]['Sub-Categories']}`}
            variant="outlined"
            className="input-field"
        />
    </>
)}

{selectedCategory && selectedCategory[0] === "Regular Add-on" && (
    Object.entries(selectedCategory[1]).map((button, index) => (
         <div style={{display:'flex'}}>          
        <FormGroup>
        <FormControlLabel control={<Checkbox  />} label={getLabel(button)} onChange={() => handleCheck(button)}/>
      </FormGroup>

      <TextField
            type="number"
            value={numberOfPersons}
            onChange={(e) => handleNumberOfPersons(e.target.value)}
            placeholder={`Enter number of ${getLabel(button)}`}
            variant="outlined"
            className="input-field"
        />
      </div>
      
    ))

)
}
   
            
    
                 
                 
               
                <Snackbar
                //   open={snackbarOpen}
                  autoHideDuration={6000}
                //   onClose={handleSnackbarClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{ marginTop: '60px' }}
                >
                 <Alert
            //   onClose={handleSnackbarClose}
            //   severity={snackbarSeverity}
              variant="filled"
              sx={{
                width: '100%',
                
              }}
            >
              {/* {snackbarMessage || 'An error occurred, please try again.'} */}
            </Alert>
            </Snackbar>  
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
                          Rs. {Price} / month
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
          </>
    )
}


export default MaidServices;