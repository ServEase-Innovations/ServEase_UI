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
  const useremail = user?.customerDetails?.emailId;
  const userfirstName = user?.customerDetails?.firstName;

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
        "http://3.110.168.35:3000/create-order",
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

              try {
                const emailResponse = await axiosInstance.post(
                  "http://localhost:4000/send-booking-email",
                  {
                    email: useremail,
                    userName: userfirstName,
                    serviceType: providerDetails.housekeepingRole,
                    spName: providerDetails.firstName,
                    dateTime: bookingDetails.startDate,
                    confirmCode: "123456",
                    phoneNumber: "+91 1234567890",
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (emailResponse.status === 200) {
                  setSnackbarMessage("Booking successful! Confirmation email sent.");
                  setSnackbarSeverity("success");
                } else {
                  console.error("Error sending email:", emailResponse.data);
                  setSnackbarMessage("Booking successful, but error sending confirmation email.");
                  setSnackbarSeverity("error");
                }
              } catch (emailError) {
                console.error("Error sending email:", emailError);
                setSnackbarMessage("Booking successful, but error sending confirmation email.");
                setSnackbarSeverity("error");
              }

              setOpenSnackbar(true);
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
<Box key={index} sx={{
width: "100%",
justifyContent: "center",
margin: "10px 0",
}}>
<Card sx={{
height: '100%',
width: "80%",
padding: "20px",
display: "flex",
flexDirection: "column",
borderRadius: "16px",
boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
transition: "transform 0.3s ease, box-shadow 0.3s ease",
"&:hover": {
transform: "scale(1.05)",
boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.15)",
},
}}>
<Typography variant="h6" sx={{
fontWeight: "600",
fontSize: "1.2rem",
color: "#333",
display: "flex",
justifyContent: "space-between",
alignItems: "center",
}}>
{item.Service}
<Tooltip title="Remove this service">
<IconButton sx={{ color: "#d32f2f" }} onClick={() => handleRemoveItem(index)}>
<DeleteOutlineIcon />
</IconButton>
</Tooltip>
</Typography>
<hr />
<Typography variant="body1"><strong>Type:</strong> {item.Type}</Typography>
<Typography variant="body1"><strong>{item["Sub-Categories"]}</strong> {item['Numbers/Size']}</Typography>
<Typography variant="body1"><strong>Fooding:</strong> {item.Categories}</Typography>
{/* <Typography variant="body1"><strong>People Range:</strong> {item.entry.peopleRange}</Typography>
<Typography variant="body1"><strong>Frequency:</strong> {item.entry.frequency} times a week</Typography>
<Typography variant="body1"><strong>Price per Month:</strong> Rs.{item.entry.pricePerMonth}</Typography> */}

</Card>
</Box>
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