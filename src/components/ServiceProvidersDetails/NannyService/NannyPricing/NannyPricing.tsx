/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import React, { SyntheticEvent, useState } from 'react';
import { Box, Button, Card, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Snackbar, SnackbarCloseReason, Tab, Tabs, Typography } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../../../features/cart/cartSlice';
import { CHECKOUT } from '../../../../Constants/pagesConstants';
import './NannyPricing.css'
import { getNannyPrices } from '../../../../customServices/PricingService';
import MuiAlert from "@mui/material/Alert";
interface NannyPricingProps {
  onPriceChange: (priceData: { price: number, entry: any }) => void;
  onAddToCart: (priceData: { price: number, selecteditem: any }) => void;
  pricing: any;
  sendToParent: (data: string) => void;
}

const NannyPricing = ({ onPriceChange, onAddToCart, pricing, sendToParent }: NannyPricingProps) => {
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>([]);
  const [selectedItemFromNanny, setSelectedItemFromNanny] = useState<any>([]);
  const [addtoCartSelected, setAddtoCartSelected] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<number>(1); // Start with the first tab value (1)
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategoryValue, setSelectedSubCategoryValue] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const bookingType = useSelector((state : any) => state.bookingType?.value)
  
  const pric = pricing?.reduce((acc: Record<string, any[]>, item: { Categories: string }) => {
    if (!acc[item.Categories]) {
      acc[item.Categories] = [];
    }
    acc[item.Categories].push(item);
    return acc;
  }, {});

  const dispatch = useDispatch();

  // Handle the logic when 'Add to Cart' is clicked
  const onClickAddToCart = () => {
    if (selectedItemFromNanny.length > 0) {
      dispatch(add({ price, selecteditem: selectedItemFromNanny }));
      setAddtoCartSelected(true);
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

  const handleOnChange = (event) => {
    const selectedCategoryValue = event.target.value;
    const selectedData = pric[selectedCategoryValue] || [];
  
    if (selectedCategory !== selectedCategoryValue) {
      // Reset states when category changes
      setSelectedItemFromNanny([]);
      setPrice(0);
      setAddtoCartSelected(false);
      setSelectedSubCategoryValue(""); // Reset sub-category radio button
    }
  
    // Update selected category & subcategory list
    setSelectedCategory(selectedCategoryValue);
    setSelectedSubCategory(selectedData);
    console.log("Selected SubCategory:", selectedData);
  };
  
  const getSelectedSubCategory = (event, selectedItem) => {
    const selectedValue = event.target.value;
    setSelectedSubCategoryValue(selectedValue); // Track selected sub-category
  
    if (selectedItem) {
      setSelectedItemFromNanny([selectedItem]);
      setPrice(getNannyPrices(selectedItem , bookingType.duration , bookingType.bookingPreference));
    } else {
      setSelectedItemFromNanny([]);
      setPrice(0);
    }
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    sendToParent(CHECKOUT);
  };

  const typeButtonsSelector = [
    { key: 1, value: 'Regular' },
    { key: 2, value: 'Premium' },
    // { key: 3, value: 'On Demand' }
  ];

  return (
    <Card style={{ width: '100%', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff' }}>
      <Grid container spacing={3}>
        {/* Left Section (Meal Service Info) */}
        <Grid item xs={12} md={8}>
          <Card sx={{ padding: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" sx={{ gap: 1, marginBottom: 2 }}>
              Service Type
            </Typography>

            <Tabs
              value={selectedTab} // Bind value to selectedTab state
              onChange={(event, newValue) => setSelectedTab(newValue)} // Update state on tab change
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
              {typeButtonsSelector.map((button) => (
                <Tab
                  key={button.key}
                  value={button.key} // Ensure value matches key
                  label={button.value}
                  sx={{
                    borderRight: button.key !== typeButtonsSelector[typeButtonsSelector.length - 1].key ? "1px solid #ddd" : '',
                    padding: "10px 20px",
                    textTransform: "none",
                    fontWeight: "bold",
                    color: selectedTab === button.key ? "#fff" : "#444", 
                    backgroundColor: selectedTab === button.key ? "#1E90FF" : "transparent", 
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
              ))}
            </Tabs>

      <div style={{ display: "flex" }}>
    <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Categories</FormLabel>
        <RadioGroup
          row
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          style={{ display: "contents" }}
          value={selectedCategory} // Track selected category
          onChange={handleOnChange}
        >
          {Object.entries(pric).map(([key, value], index) => (
            <FormControlLabel key={index} value={key} control={<Radio />} label={key} />
          ))}
        </RadioGroup>
      </FormControl>
    </Typography>

    {selectedSubCategory && selectedSubCategory.length > 0 && (
      <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">
            {selectedSubCategory[0]["Sub-Categories"]}
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            name="sub-radio-buttons-group"
            style={{ display: "contents" }}
            value={selectedSubCategoryValue} // Track selected sub-category
            onChange={(event) =>
              getSelectedSubCategory(event, selectedSubCategory.find((item) => item["Numbers/Size"] === event.target.value))
            }
          >
            {selectedSubCategory.map((item, index) => (
              <FormControlLabel
                key={index}
                value={item["Numbers/Size"]}
                control={<Radio />}
                label={item["Numbers/Size"]}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Typography>
    )}
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
        gap: 2,
        marginTop:1,
        width: "100%", // Ensures full width
        padding: "10px", // Prevents content from touching edges
      }}
    >
          {/* Add to Cart Button */}
          <Button
            variant="outlined"
            sx={{
              flex: 1,
              float: "right",
              margin: "10px",
              minWidth: "150px",
              height: 50,
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
            disabled={selectedItemFromNanny.length === 0} // Disable if no item is selected
          >
            Add to Cart
          </Button>

          {/* Proceed to Checkout Button */}
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
        </Grid>
        
      </Grid>
    </Card>
  );
};

export default NannyPricing;
