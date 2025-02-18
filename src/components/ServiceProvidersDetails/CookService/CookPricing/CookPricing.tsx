/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Button, Card, Checkbox, FormControlLabel, FormGroup, Grid, Snackbar, SnackbarCloseReason, Tab, Tabs, TextField, Typography } from "@mui/material";
import { SyntheticEvent, useEffect, useState } from "react";
import AddShoppingCartIcon  from '@mui/icons-material/AddShoppingCart';
import './Cookpricing.css'
import { CHECKOUT } from "../../../../Constants/pagesConstants";
import { useDispatch } from "react-redux";
import { add } from "../../../../features/cart/cartSlice";
import MuiAlert from "@mui/material/Alert";
interface CookPricingProps {
  onPriceChange: (priceData: { price: number, selecteditem: any }) => void; 
  onAddToCart:(priceData: { price: number, selecteditem: any }) => void; // Add the onPriceChange function as a prop
  pricing : any;
  sendToParent : (data : string) => void;
}

const CookPricing = ({ onPriceChange , onAddToCart , pricing , sendToParent }: CookPricingProps) => {
      
      const [ mealType , setMealType ] = useState<string[]>([]);
      const [ pax , setPax ] = useState("3");
      const [price , setPrice] = useState<number>(0)
      const [selecteditem , setSelectedItems] = useState<any>([])
      const [addtoCartSelected , setAddToCartSelected] = useState<boolean>(false)
      const [openSnackbar, setOpenSnackbar] = useState(false);

      const typeButtonsSelector = [
        { key: 1, value: 'Regular' },
        { key: 2, value: 'Premium' },
        // { key: 3, value: 'On Demand' }
      ];

      const [ serviceType, setServiceType ] = useState(typeButtonsSelector[0].key);


      const peopleButtonsSelector = [
        { key: 1, value: '1-2' },
        { key: 2, value: '3-5' },
        { key: 3, value: '6-9' }
      ];

    function handleButtonClick(value: string): void {
        setMealType((prevState : any) => 
          prevState.includes(value) 
            ? prevState.filter(item => item !== value) // Uncheck item
            : [...prevState, value] // Check item
        );
    }

    const dispatch = useDispatch();

    const onClickAddToCart = () =>{
      onAddToCart({ price, selecteditem })
      dispatch(add({ price, selecteditem }));
      setAddToCartSelected(true)
      setOpenSnackbar(true);
    }
     const handleCloseSnackbar = (
           event: Event | SyntheticEvent<any, Event>, 
           reason?: SnackbarCloseReason 
         ) => {
           if (reason === "clickaway") {
             return; // Ignore clicks outside Snackbar
           }
           setOpenSnackbar(false);
         };
    

    const handleForButtonClick = ( newValue) =>{
      setServiceType(newValue)
    }

    const handleProceedToCheckout = () =>{
      sendToParent(CHECKOUT)
    }
    

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (/^\d*$/.test(value)) {
        setPax(value);
      }
    };
    const calculatePriceAndEntry = () => {
        let totalPrice = 0;
        mealType.forEach((category) => {
          const categoryData = pricing.find(item => item.Categories === category);
          if (categoryData) {
            totalPrice += getPeopleCount(categoryData);
            setSelectedItems((prevState : any) => 
              prevState.includes(categoryData) 
                ? prevState.filter(item => item === categoryData) // Uncheck item
                : [...prevState, categoryData] // Check item
            );
          }
        });
        setPrice(Number(totalPrice));
      }

      const getPeopleCount = (data) => {
        const paxToNumber = Number(pax);
      
        if (paxToNumber <= 3) {
          return data["Price /Month (INR)"];
        } else if (paxToNumber > 3 && paxToNumber <= 6) {
          const basePrice = data["Price /Month (INR)"];
          const extraPeople = paxToNumber - 3;
          const increasedPrice = basePrice + basePrice * 0.2 * extraPeople;
          return increasedPrice;
        } else if (paxToNumber > 6 && paxToNumber <= 9) {
          const basePrice = data["Price /Month (INR)"];
          // First, calculate the price for the first 6 people
          const extraPeopleTier1 = 3; // From 4 to 6 (3 people total)
          const priceForTier1 = basePrice + basePrice * 0.2 * extraPeopleTier1;
      
          // Now, calculate the price for additional people (7 to 9)
          const extraPeopleTier2 = paxToNumber - 6;
          const increasedPrice = priceForTier1 + priceForTier1 * 0.1 * extraPeopleTier2;
      
          return increasedPrice;
        } else if (paxToNumber > 9) {
          const basePrice = data["Price /Month (INR)"];
          // First, calculate the price for the first 6 people
          const extraPeopleTier1 = 3; // From 4 to 6 (3 people total)
          const priceForTier1 = basePrice + basePrice * 0.2 * extraPeopleTier1;
      
          // Calculate the price for additional people (7 to 9)
          const extraPeopleTier2 = 3; // From 7 to 9 (3 people total)
          const priceForTier2 = priceForTier1 + priceForTier1 * 0.1 * extraPeopleTier2;
      
          // Calculate the price for additional people (10+)
          const extraPeopleTier3 = paxToNumber - 9;
          const increasedPrice = priceForTier2 + priceForTier2 * 0.05 * extraPeopleTier3;
      
          return increasedPrice;
        }
      };
    
    useEffect(() => {
        calculatePriceAndEntry(); 
      }, [mealType, pax, pricing]); // Recalculate when any of these change

    return (
         <Card
          style={{
          width: '100%',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
        }}
      >
      <Grid container spacing={3}>
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
            {/* <RestaurantMenuIcon color="primary" /> */}
            Service Type
          </Typography>
      <Tabs className="custom-tabs"
      value={serviceType} // Ensure this matches a Tab's value
       // Update the state with the new value
      textColor="primary"
      indicatorColor="primary"
      aria-label="service type tabs"
      sx={{
        width:"100%",
        backgroundColor: "#f1f1f1",
        borderRadius: "5px 5px 0 0",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        marginBottom: 3,
      }}
    >
      {typeButtonsSelector.map((button) => (
        <Tab
          key={button.key}
          value={button.key}
          label={button.value}
          onClick={() => handleForButtonClick(button.key)}
          className="custom-tab"
        />
      ))}
       
    </Tabs>
     {/* Meal Type Selection */}
     <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
        Meal Type
      </Typography>
      <FormGroup row sx={{ gap: 2, justifyContent: "center" }}>
        {pricing.map((button : any) => (
          <FormControlLabel
            key={button._id}
            control={
              <Checkbox
                checked={mealType.includes(button?.Categories)}
                onChange={() => handleButtonClick(button.Categories)}
                name={button.Categories}
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
                {button.Categories}
              </Button>
            }
          />
        ))}
      </FormGroup>
        <div style={{ marginTop: "40px", marginBottom: "16px" }}>
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
        No. of persons
      </Typography>
      <FormGroup row sx={{ gap: 2, justifyContent: "center" }}>
        <TextField
          type="number"
          value={pax}
          onChange={handleInputChange}
          variant="outlined"
          size="small"
          placeholder="Enter number of persons"
          InputProps={{
            inputProps: { min: 1 },
            style: { textAlign: "center" },
          }}
          sx={{
            width: "150px",
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#1e88e5",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1e88e5",
              },
            },
          }}
        />
      </FormGroup>
 
              </div>
              </Card>
              </Grid>
              
      {/* Price Card */}
      <Grid item xs={12} md={4}>
      <Card sx={{ padding: 3, textAlign: "center", boxShadow: 3 }}>
        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>
          Total Price
        </Typography>
        <Typography variant="h4" color="green" sx={{ fontWeight: "bold" }}>
          ₹{price}/month
        </Typography>
      
      </Card>
      <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: { xs: "row", sm: "row" }, // Column on mobile, row on bigger screens
        gap: 1,
        marginTop:1,
        width: "100%", // Ensures full width
        padding: "10px", // Prevents content from touching edges
      }}
    >

       {/* Add to Cart Button */}
       <Button
        type="submit"
        variant="outlined"
        sx={{
          flex: 1,
          float: "right",
          margin: "10px",
          minWidth: "150px",
          height: 50,
          marginBottom:1,
          textTransform: "none",
          borderRadius: "25px",
          color: "#1e88e5",
          borderColor: "#1e88e5",
          "&:hover": {
            backgroundColor: "#e3f2fd",
          },
        }}
        endIcon={<AddShoppingCartIcon />}
        onClick={onClickAddToCart}
        disabled={selecteditem.length === 0 } // Disable button if any value is not selected
      >
        Add to Cart
      </Button>

      <Button
            variant="outlined"
            sx={{  flex: 1,
              minWidth: "150px",
              height: 50,
              textTransform: "none",
              borderRadius: "25px", }}
            endIcon={<AddShoppingCartIcon />}
            onClick={handleProceedToCheckout}
            disabled={!addtoCartSelected} // Disable if nothing added to cart
          >
            Proceed to Checkout
          </Button>
      <h1></h1>
      <h1></h1>
      </Box>
      <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{ marginTop: "60px" }}
            >
              <MuiAlert
                onClose={handleCloseSnackbar}
                severity="success"
                sx={{ width: "100%" }}
              >
                Item added to cart successfully!
              </MuiAlert>
            </Snackbar>
      <h1></h1>
      <h1></h1>
       </Grid>
    </Grid>
    </Card>

     
    )
}


export default CookPricing;