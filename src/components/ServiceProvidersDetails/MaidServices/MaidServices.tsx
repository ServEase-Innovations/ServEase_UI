/* eslint-disable @typescript-eslint/no-unused-vars */

import { Alert, Box, Button, Card, Checkbox, FormControlLabel, FormGroup, Grid,  Snackbar, SnackbarCloseReason, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CategoryIcon from '@mui/icons-material/Category';
import PaymentIcon from "@mui/icons-material/Payment";
import { SyntheticEvent, useEffect, useState } from "react";
import { getPriceByNumber, getPriceByvalue } from "../../../customServices/PricingService";
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from "react-redux";
import { add } from "../../../features/cart/cartSlice";
import { CHECKOUT } from "../../../Constants/pagesConstants";
import MuiAlert from "@mui/material/Alert";

interface CookPricingProps {
    onPriceChange: (priceData: { price: number, selecteditem: any }) => void; 
    onAddToCart:(priceData: { price: number, selecteditem: any }) => void; // Add the onPriceChange function as a prop
    pricing : any;
    sendToParent : (data : string) => void;
  }


const MaidServices = ({ onPriceChange , onAddToCart , pricing , sendToParent }: CookPricingProps) => {

    const [clickedIndex, setClickedIndex] = useState<number | null>(null);
    const [selectedCategory , setSelectedcategory ] = useState<any>();
    const [numberOfPersons ,  setNumberOfPersons] = useState<string>();
    const [ Price , setPrice ] = useState<number | undefined>(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [ cartItem , setCartItems ] = useState<any>([])
    const [isAddedToCart, setIsAddedToCart] = useState(false);

    const bookingType = useSelector((state: any) => state.bookingType?.value);


    console.log("bookingType => ", bookingType)

    if(bookingType.bookingPreference != "Date"){
      pricing = pricing.filter((item) => item.BookingType === "Regular")
    } else{
      pricing = pricing.filter((item) => item.BookingType === "On Demand")
    }

    console.log("pricing => ", pricing)
    
    const groupedServices = pricing?.reduce((acc, item) => {
        const groupKey = bookingType.bookingPreference != "Date" ? item.Type === "Regular Add-on" ? "Regular Add-on" : item.Categories : item.Type === "On Demand" ? "On Demand" : item.Type ;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
      }, {});
      
      const [services, setServices] = useState(groupedServices ?? {});


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

      const handleButtonClick = (value: any): void => {

        setSelectedcategory(value);
    
        // If category exists in cart, load its number of persons
        const existingItem = cartItem.find((item: any) => item[0] === value[0]);
        if (existingItem) {
            setPrice(existingItem[1][0].price)
            setNumberOfPersons(existingItem[1][0].persons.toString());
        } else {
            setNumberOfPersons("");
            setPrice(0)
        }
    };


    
    function handleNumberOfPersons(value: string ,  data? ): void {

      // Remove leading zeros while keeping "0" valid
      let numericValue = value.replace(/^0+/, "") || "0";
      let newPrice ;
  
      setNumberOfPersons(numericValue); // Update the state
  
      if (!selectedCategory) return;
  
      // Create a deep copy to prevent mutation
      const updatedCategory = JSON.parse(JSON.stringify(selectedCategory));

      if(updatedCategory[0] !== "Regular Add-on"){
        if (updatedCategory[1][0]['Sub-Categories'] !== 'Number') {
          newPrice = getPriceByvalue(updatedCategory[1][0], numericValue);
      } else {
          newPrice = getPriceByNumber(updatedCategory[1][0], numericValue);
      }
  
      updatedCategory[1][0] = { 
          ...updatedCategory[1][0], 
          persons: Number(numericValue),
          price : newPrice
      };
      } else {
        if (updatedCategory[1][0]['Sub-Categories'] !== 'Number') {
          newPrice = getPriceByvalue(updatedCategory[1][0], numericValue);
      } else {
          newPrice = getPriceByNumber(updatedCategory[1][0], numericValue);
      }
      const datafromlist = updatedCategory[1].findIndex(i => i['Categories'] === data)

      updatedCategory[1][datafromlist] = { 
        ...updatedCategory[1][datafromlist], 
        persons: Number(numericValue),
        price : newPrice
    };
      }

      setSelectedcategory(updatedCategory);
      setPrice(newPrice)
      
  }
  const [openSnackbar, setOpenSnackbar] = useState(false);
    const addSelectedItemToCart = (data) => {
        if (selectedCategory) {
            const updatedCart = [...cartItem];
            const existingIndex = updatedCart.findIndex((item) => item[0] === selectedCategory[0]);
    
            if (existingIndex !== -1) {
                updatedCart[existingIndex] = selectedCategory; // Replace existing item
            } else {
                updatedCart.push(selectedCategory); // Add new item
            }
            setCartItems(updatedCart);

            mapCartItemsWithGroupedItem(groupedServices,updatedCart , data)
            setOpenSnackbar(true);
          }
    };

    
    const handleCloseSnackbar = (
      event: Event | SyntheticEvent<any, Event>, 
      reason?: SnackbarCloseReason 
    ) => {
      if (reason === "clickaway") {
        return; // Ignore clicks outside Snackbar
      }
      setOpenSnackbar(false);
    };
    
    const mapCartItemsWithGroupedItem = (groupedServices, cartItem, data) => {
      let updatedServices = JSON.parse(JSON.stringify(services)); // Deep clone


      console.log(updatedServices)
  
      cartItem.forEach(([category, items]) => {
  
          if (updatedServices[category]) {
              updatedServices[category] = updatedServices[category].map(service => {
                  let foundItem;
  
                  if (category !== "Regular Add-on") {
                      foundItem = items.find(item => item._id === service._id);
                  } else {
                      foundItem = items.find(item => item._id === service._id && item.Categories === data);
                  }
                  if (foundItem) {
                      return { 
                          ...service, 
                          persons: foundItem.persons, 
                          price: foundItem.price // Use foundItem.price instead of undefined Price variable
                      };
                  }
                  return service;
              });
          }
          setServices(updatedServices);
      });
      
  };
  
  
    const getNumberOfPersons = (categoryItem: any) => {
      return categoryItem?.persons ? String(Number(categoryItem?.persons)) : "";
  };

    function getLabel(button: [string, any]) {
        return button[1]['Categories']
    }

  function handleCheck(button: [string, unknown]): void {
    throw new Error("Function not implemented.");
  }

  const dispatch = useDispatch();

  const handleAddToCart = () =>{

    let selecteditem :any = [];
    let price = 0;
    
    Object.entries(services).forEach((item : any) =>{
      console.log("item => ", item)
      item[1].forEach(i =>{
        if(i.persons && i.price){
          price = i.price + price;
          selecteditem.push(i)
        }
      })
    }) 
    onAddToCart({ price, selecteditem })
    dispatch(add({ price, selecteditem }));
  }

  useEffect(() =>{
    handleAddToCart();
  },[services])

  const handleProceedToCheckout = () =>{
        sendToParent(CHECKOUT)
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
               {Object.entries(services).map((button, index) => (
                  
                    <Tooltip title={button[0]}>
                      <div
                        onClick={() => handleButtonClick(button)}
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
     selectedCategory[1][0]['Sub-Categories'] === "Rooms" || 
     selectedCategory[1][0]['Sub-Categories'] === "Number") && (
    <div style={{display : 'flex'}}>
        <strong>{selectedCategory[1][0]['Sub-Categories']}</strong>
        <TextField
    type="number"
    value={getNumberOfPersons(selectedCategory?.[1]?.[0] ?? {}) } 
    onChange={(e) => handleNumberOfPersons(e.target.value)}
    onKeyDown={(e) => {
        if (e.key === "-" || e.key === "+") {
            e.preventDefault(); // Prevent negative or non-numeric values
        }
    }}
/>

<Button 
    variant="outlined" 
    onClick={() => addSelectedItemToCart(selectedCategory[1][0]['Sub-Categories'])} 
>
    <ShoppingCartIcon />
</Button> 

    </div>
)}

{selectedCategory && selectedCategory[0] === "Regular Add-on" && (
    Object.entries(selectedCategory[1]).map((button, index) => (
         <div style={{display:'flex' , justifyContent:'space-around' , paddingBottom:'10px'}}>          
      <p>{getLabel(button)}</p>
      <TextField
      style={{width : '60%'}}
    type="number"
    value={getNumberOfPersons(selectedCategory?.[1]?.[index] ?? {})} 
    onChange={(e) => handleNumberOfPersons(e.target.value , getLabel(button))}
    onKeyDown={(e) => {
        if (e.key === "-" || e.key === "+") {
            e.preventDefault(); // Prevent negative or non-numeric values
        }
    }}
/>
<Button 
    variant="outlined" 
    onClick={() => addSelectedItemToCart(getLabel(button))} 
>
<ShoppingCartIcon />
</Button>

      </div>
      
    ))

)
}


            {/* Snackbar Component */}
      <Snackbar 
           open={openSnackbar}
           autoHideDuration={6000}
           onClose={handleCloseSnackbar} 
           anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
           sx={{ marginTop: '60px' }}  
         >
        <MuiAlert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          Item added to cart successfully!
        </MuiAlert>
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
                          Selected Price
                        </Typography>
                        <Typography variant="h4" color="green" sx={{ fontWeight: "bold" }}>
                          Rs. {Price} / month
                        </Typography>
                      </Card>
        
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<PaymentIcon />}
                        fullWidth
                        sx={{ height: 50 }}
                        onClick={handleProceedToCheckout}
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