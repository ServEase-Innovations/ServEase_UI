import { Card, Button, Box, Typography, Snackbar, Alert, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookingDetails } from "../../types/engagementRequest";
import { Bookingtype } from "../../types/bookingTypeData";
import axiosInstance from "../../services/axiosInstance";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import axios from "axios";

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
  providerDetails: any;
}

const Checkout : React.FC<ChildComponentProps> = ({ providerDetails }) => {
  const [checkout, setCheckout] = useState<any>([]);
  const [bookingTypeFromSelection , setBookingTypeFromSelection] = useState<Bookingtype>();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const cart = useSelector((state: any) => state.cart?.value);
  const bookingType = useSelector((state: any) => state.bookingType?.value)
  const user = useSelector((state: any) => state.user?.value);
  const dispatch = useDispatch();
  const customerId = user?.customerDetails?.customerId || null;
  const useremail = user?.customerDetails?.emailId;
  const userfirstName = user?.customerDetails?.firstName;

  const bookingDetails: BookingDetails = {
    serviceProviderId: 0,
    customerId: 0,
    startDate: "",
    endDate: "",
    engagements: "",
    timeslot: "",
    monthlyAmount: 0,
    paymentMode: "CASH",
    bookingType: "",
    responsibilities: [],
  };

  useEffect(() => {
    setCheckout(cart);
    setBookingTypeFromSelection(bookingType);
  }, [cart, bookingType]);

  const handleRemoveItem = (index: number) => {
    const updatedCheckout = checkout['selecteditem']?.filter((_, i) => i !== index);
    setCheckout(updatedCheckout);
  };

  const handleClose = () => {
    setOpenSnackbar(false);
  };

  const handleCheckout = async () => {
    

    try {
      const response = await axios.post(
        "http://3.110.168.35:3000/create-order",
        { amount:  grandTotal }, // Amount in paise
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
            // setSnackbarMessage("Payment successful! Booking confirmed.");
            // setSnackbarSeverity("success");
            // setOpenSnackbar(true);
            console.log("checkout => ",checkout)
            bookingDetails.serviceProviderId = providerDetails.serviceproviderId;
    bookingDetails.customerId = customerId;
    bookingDetails.startDate = bookingTypeFromSelection?.startDate;
    bookingDetails.endDate = bookingTypeFromSelection?.endDate;
    bookingDetails.engagements = checkout.selecteditem[0].Service;
    bookingDetails.paymentMode = "CASH";
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

    if(response.status === 201){
        
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
  
            // You can call a backend API to confirm the booking here
          },
          prefill: {
            name: user?.name || "John Doe",
            email: user?.email || "johndoe@example.com",
            contact: user?.phone || "9999999999",
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

  const grandTotal = checkout['selecteditem']?.reduce((sum, service) => sum + service['Price /Month (INR)'], 0);

  return (
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
        justifyContent: "center",
        alignItems: "center",
        marginTop: '65px'
      }}>
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
        {checkout['selecteditem']?.length === 0 ? (
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
                <Typography variant="body1" sx={{
                  color: "#2e7d32",
                  backgroundColor: "#e8f5e9",
                  border: "1px solid #2e7d32",
                  padding: "6px",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontWeight: "600",
                  marginTop: "12px",
                }}>
                  Total Price: Rs. {item['Price /Month (INR)']}
                </Typography>
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
          justifyContent: "flex-end",
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
          <Tooltip title="Proceed to checkout">
            <Button
              startIcon={<ShoppingCartCheckoutIcon />}
              variant="contained"
              style={{
                fontWeight: "600",
                color: "#fff",
                background: "linear-gradient(to right, #1a73e8, #1565c0)",
                border: "1px solid rgb(63, 70, 146)",
                padding: "10px 24px",
                borderRadius: "8px",
              }}
              onClick={handleCheckout}
            >
              Checkout
            </Button>
          </Tooltip>
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
    </Box>
  );
};

export default Checkout;