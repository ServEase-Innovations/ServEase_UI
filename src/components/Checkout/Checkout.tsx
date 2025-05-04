import { Card, Button, Box, Typography, Snackbar, Alert, IconButton, Tooltip, DialogContent, Dialog } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookingDetails } from "../../types/engagementRequest";
import { Bookingtype } from "../../types/bookingTypeData";
import axiosInstance from "../../services/axiosInstance";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import axios from "axios";
import Login from "../Login/Login";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { BOOKINGS, CONFIRMATION } from "../../Constants/pagesConstants";
import { add, remove } from "../../features/cart/cartSlice";


// Define the structure of each item in selectedItems
interface Item {
  entry: {
    serviceCategory: string;
    type: string;
    serviceType: string;
    subCategory: string;
    peopleRange: string;
    frequency: number;
    pricePerMonth: number;
  };
  price: number;
}

interface ChildComponentProps {
  providerDetails : any;
  sendDataToParent : (data : any) => void;
}

const Checkout : React.FC<ChildComponentProps> = ({ providerDetails , sendDataToParent }) => {
  const [checkout, setCheckout] = useState<any>([]);
  const [bookingTypeFromSelection , setBookingTypeFromSelection] = useState<Bookingtype>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedInUser , setLoggedInUser ] = useState();

  const cart = useSelector((state: any) => state.cart?.value);
  const bookingType = useSelector((state: any) => state.bookingType?.value)
  const user = useSelector((state: any) => state.user?.value);
  const dispatch = useDispatch();
  const customerId = user?.customerDetails?.customerId || null;
  // console.log('customer details:',user)
  const currentLocation = user?.customerDetails?.currentLocation;
  console.log("current location :",currentLocation)
  const firstName = user?.customerDetails?.firstName;
  const lastName = user?.customerDetails?.lastName;
  const customerName = `${firstName} ${lastName}`;
 

  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;
 
  
  // Declare customerName in bookingDetails
  const bookingDetails: BookingDetails = {
    serviceProviderId: 0,
    serviceProviderName: "",
    customerId: 0,
    customerName: "", 
    startDate: "",
    endDate: "",
    engagements: "",
    address: "",
    timeslot: "",
    monthlyAmount: 0,
    paymentMode: "CASH",
    bookingType: "",
    taskStatus: "NOT_STARTED", 
    responsibilities: [],
  };

  useEffect(() => {
    setCheckout(cart);
    setBookingTypeFromSelection(bookingType);
  }, [cart, bookingType]);

  const handleRemoveItem = (index: number) => {
    const updatedCheckout = checkout['selecteditem']?.filter((_, i) => i !== index);
    setCheckout(updatedCheckout);
    dispatch(add({ grandTotal, selecteditem: updatedCheckout }));
  };

  
  useEffect(() => {
   
      if(user?.role=== 'CUSTOMER'){
        setLoggedInUser(user);
      }
    }, [user]);

    const handleBookingPage = (e : string | undefined) =>{
      setOpen(false)
    }
  const handleLogin = () =>{
    setOpen(true)
  }

  const handleClose = () => {
    setOpenSnackbar(false);
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.post(
        "http://13.201.229.41:3000/create-order",
        { amount: grandTotal }, // Amount in paise
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const { id: orderId, currency, amount } = response.data;

        // Razorpay options
        const options = {
          key: "rzp_test_lTdgjtSRlEwreA", // Replace with your Razorpay key
          amount: amount,
          currency: currency,
          name: "Serveaso",
          description: "Booking Payment",
          order_id: orderId,
          handler: async function (razorpayResponse: any) {
            alert(`Payment successful! Payment ID: ${razorpayResponse.razorpay_payment_id}`);

            console.log("checkout => ", checkout);
            bookingDetails.serviceProviderId = providerDetails.serviceproviderId;
            bookingDetails.serviceProviderName=providerFullName;
            bookingDetails.customerId = customerId;
            bookingDetails.customerName = customerName;  
            bookingDetails.address=currentLocation;
            bookingDetails.startDate = bookingTypeFromSelection?.startDate;
            bookingDetails.endDate = bookingTypeFromSelection?.endDate;
            bookingDetails.engagements = checkout.selecteditem[0].Service;
            bookingDetails.paymentMode = "UPI"; 
            bookingDetails.taskStatus= "NOT_STARTED";
            bookingDetails.bookingType = bookingType.bookingPreference;
            bookingDetails.serviceeType = checkout.selecteditem[0].Service;
            bookingDetails.timeslot = [bookingType.morningSelection, bookingType.eveningSelection]
              .filter(Boolean)
              .join(', '); 

            bookingDetails.monthlyAmount = checkout.price;

            const response = await axiosInstance.post(
              "/api/serviceproviders/engagement/add",
              bookingDetails,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.status === 201) {
              setSnackbarMessage(response.data || "Booking successful!");
              setSnackbarSeverity("success");
              setOpenSnackbar(true);
              sendDataToParent(BOOKINGS)
              dispatch(remove())
            }
          },
          prefill: {
            name: customerName || "",
            email: user?.email || "",
            contact: user?.mobileNo || "",
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error("Error while creating Razorpay order:", error);
      setSnackbarMessage("Failed to initiate payment. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };  
  const grandTotal = checkout?.price ? checkout?.price : 0;

  const handleBackClick = () =>{
    sendDataToParent(CONFIRMATION)
   
  }
  
  const bookingTypes = useSelector((state: any) => state.bookingType?.value);
  
  useEffect(() => {
    console.log("Booking Type from Redux Store for checkout:", bookingTypes);
    
    console.log("Morning checkout:", bookingTypes?.morningSelection);
    console.log("Evening chekout:", bookingTypes?.eveningSelection);

   
  }, [bookingType]);
  const [meals, setMeals] = useState([
    { id: 1, type: "Breakfast", service: "Regular", persons: 0, time: "10:00 am - 11:00 am", price: 50, selected: true },
    { id: 2, type: "Lunch", service: "Premium", persons: 0, time: "1:00 pm - 2:00 pm", price: 120, selected: true },
    { id: 3, type: "Dinner", service: "Regular", persons: 0, time: "7:00 pm - 8:00 pm", price: 60, selected: true },
  ]);

  const updatePersons = (id, change) => {
    setMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.id === id ? { ...meal, persons: Math.max(0, meal.persons + change) } : meal
      )
    );
  };

  const toggleMealSelection = (id) => {
    setMeals((prevMeals) =>
      prevMeals.map((meal) =>
        meal.id === id ? { ...meal, selected: !meal.selected } : meal
      )
    );
  };
  const subtotal = meals.reduce((acc, meal) => acc + meal.price * meal.persons, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;
  const totalPrice = meals
    .filter((meal) => meal.selected)
    .reduce((sum, meal) => sum + meal.price * meal.persons, 0);

  return (
    <>
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      height: "100vh", // Full viewport height
      width: '100%',
    }}>
      {/* Fixed Header */}
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "20px",
        backgroundColor: "#fff",
        zIndex: 10,
        boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        height: "8%",  // Header height set to 8%
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: '65px'
      }}>
        <Button variant="outlined" style={{marginRight:'30%'}} onClick={handleBackClick}>
                        Back
                      </Button>
        <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          Selected Services
        </Typography>
      </Box>

      {/* Scrollable Content Section */}
      <Box sx={{
flexGrow: 1,
padding: "20px",
overflowY: "auto",
marginTop: "8%", // Push the content below the header
marginBottom: "8%", // Space for footer
height: "84%", // This section should take the remaining 84% of the height
display: 'flex',
flexDirection: "column",
}}>
{ !checkout || checkout?.selecteditem?.length === 0 ? (
<Typography variant="h6">No items selected</Typography>
) : (
  checkout['selecteditem']?.map((item, index) => (
    <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "40px",
      gap: "20px",
      fontFamily: "Poppins, sans-serif",
      // background: "#E1F5FE", // Light sky blue background
       background: "#f8f9fa"
    }}
  >
      {/* Left Section - Service Cart */}
      <div style={{ width: "60%", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "26px", fontWeight: "bold" }}>COOK</h2>
          <Tooltip title="Remove this service">
            <IconButton sx={{ color: "#d32f2f" }}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </div>

        <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd", fontSize: "18px", fontWeight: "bold" }}>
              {/* <th style={{ padding: "15px 10px" }}>Select</th> */}
              <th style={{ padding: "15px 10px" }}>Meal Type</th>
              <th style={{ padding: "15px 10px" }}>Service Type</th>
              <th style={{ padding: "15px 10px" }}>No of Person</th>
              <th style={{ padding: "15px 10px" }}>Time Slot</th>
              <th style={{ padding: "15px 10px" }}>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((meal) => (
              <tr key={meal.id} style={{ borderBottom: "1px solid #ddd", fontSize: "16px", height: "50px" }}>
                {/* <td>
                  <input
                    type="checkbox"
                    checked={meal.selected}
                    onChange={() => toggleMealSelection(meal.id)}
                  />
                </td> */}
                <td>{meal.type}</td>
                <td>{meal.service}</td>
                <td>
                <button style={{ margin: "0 10px", cursor: "pointer", padding: "5px 10px", borderRadius: "5px", border: "1px solid #0288D1", background: "#E3F2FD" }} onClick={() => updatePersons(meal.id, -1)}>-</button>
                  {meal.persons}
                  <button style={{ margin: "0 10px", cursor: "pointer", padding: "5px 10px", borderRadius: "5px", border: "1px solid #0288D1", background: "#E3F2FD" }} onClick={() => updatePersons(meal.id, 1)}>+</button>
                </td>
                <td>{meal.time}</td>
                <td>${meal.price * meal.persons}</td>
              </tr>
            ))}
          </tbody>
        </table>
       
      </div>

      {/* Right Section - Payment Info */}
      {/* <div style={{ width: "35%", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}> */}
      
        {/* <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Payment Info</h2> */}
        {/* <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "10px" }}>
            <input type="radio" name="payment" defaultChecked style={{ marginRight: "10px" }} /> Credit Card
          </label>
          <label style={{ display: "block" }}>
            <input type="radio" name="payment" style={{ marginRight: "10px" }} /> PayPal
          </label>
        </div>
        <p style={{ marginBottom: "10px", fontSize: "16px" }}>Name on Card: <strong>John Carter</strong></p>
        <p style={{ marginBottom: "10px", fontSize: "16px" }}>Card Number: <strong>**** **** **** 2153</strong></p>
        <p style={{ marginBottom: "10px", fontSize: "16px" }}>Expiration Date: <strong>05/2025</strong></p>
        <p style={{ marginBottom: "20px", fontSize: "16px" }}>CVV: <strong>156</strong></p> */}
              {/* <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <input type="radio" name="payment" defaultChecked style={{ marginRight: "10px" }} />
            <span>💳 Credit Card</span>
          </label>
          <label style={{ display: "flex", alignItems: "center" }}>
            <input type="radio" name="payment" style={{ marginRight: "10px" }} />
            <span>🅿️ PayPal</span>
          </label>
        </div>
          <div
          style={{
            background: "linear-gradient(135deg, #1976D2, #0D47A1)",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            color: "#FFFFFF",
            fontWeight: "bold",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            opacity: "0.85", // Slight transparency for a sleek effect
          }}
        >
          <p style={{ marginBottom: "10px", fontSize: "18px" }}>John Carter</p>
          <p style={{ marginBottom: "10px", fontSize: "18px" }}>**** **** **** 2153</p>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px" }}>
            <p>Exp: 05/2025</p>
            <p>CVV: 156</p>
          </div> */}
      {/* </div> */}
        {/* </div> */}
        <div style={{ width: "35%", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Price Details</h2>
        <div className="space-y-3 text-gray-800">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span className="font-semibold">$340.00</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>GST (18%):</span>
            <span className="font-semibold">$61.20</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Service Fee:</span>
            <span className="font-semibold">$10.00</span>
          </div>
          <hr className="my-4 border-gray-400" />
          <div className="flex justify-between text-xl font-bold text-blue-700">
          <p style={{ fontSize: "22px", fontWeight: "bold", marginTop: "20px" }}>Grand Total: ${totalPrice}</p>
          </div>
        </div>
        <div className="mt-4">
  <input
    type="text"
    placeholder="Voucher"
    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
  />
  <button className="mt-2 w-full border border-red-400 text-red-500 py-2 rounded-lg font-semibold hover:bg-red-100 transition">
    Apply Voucher
  </button>
</div>
    
      </div>

    </div>
))
)}
</Box>

   {/* Fixed Footer */}
{checkout['selecteditem']?.length > 0 && (
  <Box sx={{
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20px",
    backgroundColor: "#fff",
    zIndex: 10,
    boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "end", // Center items horizontally
    alignItems: "center",
    height: '8%', 
    marginBottom: '65px' // Footer height set to 8%
  }}>
    <div style={{
      fontWeight: "600",
      fontSize: "1.1rem",
      color: "#2e7d32",
      backgroundColor: "#e8f5e9",
      border: "1px solid #2e7d32",
      padding: "8px 16px",
      borderRadius: "6px",
      textAlign: "center",
      marginRight: "20px",
    }}>
      Grand Total: Rs. {grandTotal}
    </div>

    <div style={{ float: 'right', display: 'flex' }}>
      {/* <Tooltip
        style={{ display: loggedInUser && checkout['selecteditem'].length > 0 ? 'none' : 'block' }}
        title="You need to login  to proceed with checkout"
      >
        <IconButton>
          <InfoOutlinedIcon />
        </IconButton>
      </Tooltip> */}

{!loggedInUser && (
      
      <Tooltip title="Proceed to checkout">
        <Button
          startIcon={<ShoppingCartCheckoutIcon />}
          variant="contained"
          style={{
            fontWeight: "600",
            color: "#fff",
            background: loggedInUser ? "linear-gradient(to right, #1a73e8, #1565c0)" : "#b0bec5",  // Grey when disabled
            border: "1px solid rgb(63, 70, 146)",
            padding: "10px 24px",
            borderRadius: "8px",
          }}
          onClick={handleLogin}  // Disable if not logged in or items are not selected
        >
          Login
        </Button>
      </Tooltip>
)}

{loggedInUser && (
      
      <Tooltip title="Proceed to checkout">
        <Button
          startIcon={<ShoppingCartCheckoutIcon />}
          variant="contained"
          style={{
            fontWeight: "600",
            color: "#fff",
            background: loggedInUser ? "linear-gradient(to right, #1a73e8, #1565c0)" : "#b0bec5",  // Grey when disabled
            border: "1px solid rgb(63, 70, 146)",
            padding: "10px 24px",
            borderRadius: "8px",
          }}
          onClick={handleCheckout}
        >
          Checkout
        </Button>
      </Tooltip>
)}
    </div>
  </Box>
)}



      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ marginTop: '60px' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
       <Dialog 
          style={{padding:'0px'}}
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
              <DialogContent>
              <Login bookingPage={handleBookingPage}/>
              </DialogContent>
            </Dialog>
    </Box>
    </>
  );
};

export default Checkout;





















//Extract necessary details for the email
      // const emailData = {
      //   userName: user?.customerDetails?.firstName,
      //   serviceType: checkout[0].entry.type,
      //   spName: providerDetails.name,  
      //   dateTime: bookingDetails.startDate,
      //   //confirmCode: response.data.confirmationCode,
      //   confirmCode: "123456", 
      //   phoneNumber: "+91 1234567890", 
      //   email: user?.customerDetails?.email,
      // };

      // //send email
      // await axiosInstance.post(
      //   "/send-booking-email",
      //   emailData,
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );