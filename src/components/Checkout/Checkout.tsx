import {
  Card,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  DialogContent,
  Dialog,
  Tabs,
  Tab,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookingDetails } from "../../types/engagementRequest";
import { Bookingtype } from "../../types/bookingTypeData";
import axiosInstance from "../../services/axiosInstance";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import axios from "axios";
import Login from "../Login/Login";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { BOOKINGS, CONFIRMATION } from "../../Constants/pagesConstants";
import { add, remove } from "../../features/cart/cartSlice";
import moment from "moment";

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
  sendDataToParent: (data: any) => void;
}

const Checkout: React.FC<ChildComponentProps> = ({
  providerDetails,
  sendDataToParent,
}) => {
  const [checkout, setCheckout] = useState<any>([]);
  const [bookingTypeFromSelection, setBookingTypeFromSelection] =
    useState<Bookingtype>();
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState();

  const cart = useSelector((state: any) => state.cart?.value);
  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const user = useSelector((state: any) => state.user?.value);
  const pricing = useSelector((state: any) => state.pricing?.groupedServices); // Get groupedServices from the store
  const dispatch = useDispatch();
  const customerId = user?.customerDetails?.customerId || null;
  const currentLocation = user?.customerDetails?.currentLocation;
  const firstName = user?.customerDetails?.firstName;
  const lastName = user?.customerDetails?.lastName;
  const customerName = `${firstName} ${lastName}`;
  console.log("pricing data ", pricing);
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;
console.log("providerFullName::",providerFullName);
console.log(providerDetails);
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

  const typeButtonsSelector = [
    { key: 1, value: "Regular" },
    { key: 2, value: "Premium" },
  ];
  // Handle service type change for a specific meal
  const handleServiceTypeChange = (
    mealType: string,
    newServiceType: number
  ) => {
    setMealStates((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        serviceType: newServiceType,
      },
    }));
  };

  const [serviceType, setServiceType] = useState<number>(
    typeButtonsSelector[0].key
  ); // Default to Regular
  const [filteredCookPricing, setFilteredCookPricing] = useState<any[]>([]);
  const [mealStates, setMealStates] = useState<
    Record<string, { serviceType: number; pax: number }>
  >({});
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);

  const toggleMealSelection = (mealType: string) => {
    setSelectedMeals(
      (prevSelected) =>
        prevSelected.includes(mealType)
          ? prevSelected.filter((meal) => meal !== mealType) // Remove if already selected
          : [...prevSelected, mealType] // Add if not selected
    );
  };
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const toggleServiceSelection = (serviceType: string) => {
    setSelectedServices(
      (prevSelected) =>
        prevSelected.includes(serviceType)
          ? prevSelected.filter((service) => service !== serviceType) // Remove if already selected
          : [...prevSelected, serviceType] // Add if not selected
    );
  };

  // Filter Cook data based on booking type
  useEffect(() => {
    if (bookingTypes?.role === "cook") {
      const cookPricing = pricing?.Cook || []; // Extract Cook data
      console.log("Cook Pricing:", cookPricing); // Log Cook data

      const filteredCook = cookPricing.filter((item) => {
        if (bookingType.bookingPreference !== "Date") {
          return item.BookingType === "Regular";
        } else {
          return item.BookingType === "On Demand";
        }
      });

      console.log("Filtered Cook Pricing:", filteredCook); // Log filtered Cook data
      setFilteredCookPricing(filteredCook);
    }
  }, [bookingType, pricing]);

  // Initialize meal states when filteredCookPricing changes
  useEffect(() => {
    if (bookingTypes?.role === "cook") {
      const initialMealStates: Record<
        string,
        { serviceType: number; pax: number }
      > = {};
      filteredCookPricing.forEach((meal) => {
        initialMealStates[meal.Categories] = {
          serviceType: 1, // Default to Regular
          pax: 3, // Default number of persons
        };
      });
      setMealStates(initialMealStates);
    }
  }, [filteredCookPricing]);

  // Increment number of persons for a specific meal
  const incrementPax = (mealType: string) => {
    setMealStates((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        pax: prev[mealType].pax + 1,
      },
    }));
  };

  const updatePax = (mealType, newValue) => {
    setMealStates((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        pax: newValue,
      },
    }));
  };

  // Decrement number of persons for a specific meal
  const decrementPax = (mealType: string) => {
    setMealStates((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        pax: Math.max(1, prev[mealType].pax - 1), // Ensure pax doesn't go below 1
      },
    }));
  };

  // Calculate price based on number of persons and service type
  const getPeopleCount = (data: any, pax: number, serviceType: number) => {
    let field =
      bookingType.bookingPreference !== "Date"
        ? "Price /Month (INR)"
        : "Price /Day (INR)";
    const basePrice = data[field];

    let totalPrice = basePrice;

    if (pax > 3 && pax <= 6) {
      totalPrice += basePrice * 0.2 * (pax - 3);
    } else if (pax > 6 && pax <= 9) {
      totalPrice += basePrice * 0.2 * 3 + basePrice * 0.1 * (pax - 6);
    } else if (pax > 9) {
      totalPrice +=
        basePrice * 0.2 * 3 +
        basePrice * 0.1 * 3 +
        basePrice * 0.05 * (pax - 9);
    }

    if (serviceType === 2) {
      totalPrice += totalPrice * 0.3; // Premium service adds 30%
    }

    return totalPrice;
  };
 

  useEffect(() => {
    setCheckout(cart);
    setBookingTypeFromSelection(bookingType);
  }, [cart, bookingType]);

  const handleRemoveItem = (index: number) => {
    const updatedCheckout = checkout["selecteditem"]?.filter(
      (_, i) => i !== index
    );
    setCheckout(updatedCheckout);
    dispatch(add({selecteditem: updatedCheckout }));
  };

  useEffect(() => {
    if (user?.role === "CUSTOMER") {
      setLoggedInUser(user);
    }
  }, [user]);

  const handleBookingPage = (e: string | undefined) => {
    setOpen(false);
  };

  const handleLogin = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpenSnackbar(false);
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.post(
        "http://13.127.47.159:3000/create-order",
        // { amount: grandTotal },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const { id: orderId, currency, amount } = response.data;

        const options = {
          key: "rzp_test_lTdgjtSRlEwreA",
          amount: amount,
          currency: currency,
          name: "Serveaso",
          description: "Booking Payment",
          order_id: orderId,
          handler: async function (razorpayResponse: any) {
            alert(
              `Payment successful! Payment ID: ${razorpayResponse.razorpay_payment_id}`
            );

            bookingDetails.serviceProviderId =
              providerDetails.serviceproviderId;
            bookingDetails.serviceProviderName = providerFullName;
            bookingDetails.customerId = customerId;
            bookingDetails.customerName = customerName;
            bookingDetails.address = currentLocation;
            bookingDetails.startDate = bookingTypeFromSelection?.startDate;
            bookingDetails.endDate = bookingTypeFromSelection?.endDate;
            bookingDetails.engagements = checkout.selecteditem[0].Service;
            bookingDetails.paymentMode = "UPI";
            bookingDetails.taskStatus = "NOT_STARTED";
            bookingDetails.bookingType = bookingType.bookingPreference;
            bookingDetails.serviceeType = checkout.selecteditem[0].Service;
            bookingDetails.timeslot = [
              bookingType.morningSelection,
              bookingType.eveningSelection,
            ]
              .filter(Boolean)
              .join(", ");

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
              sendDataToParent(BOOKINGS);
              dispatch(remove());
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
  
  const calculateAge = (dob) => {
    if (!dob) return ""; // Handle cases where dob is not provided
    const age = moment().diff(moment(dob), 'years'); // Get the age in years
    return age;
  };


  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const handleBackClick = () => {
    sendDataToParent(CONFIRMATION);
  };

  const bookingTypes = useSelector((state: any) => state.bookingType?.value);

  useEffect(() => {
    console.log("Booking Type from Redux Store for checkout:", bookingTypes);
    console.log("Morning checkout:", bookingTypes?.morningSelection);
    console.log("Evening checkout:", bookingTypes?.eveningSelection);
    console.log("role checkout", bookingTypes?.role);
  }, [bookingType]);

  return (
    <>
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100%",
        }}
      > */}
       {/* Fixed Header */}
       <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "20px",
          backgroundColor: "#fff",
          zIndex: 10,
          boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          height: "12%",
          display: "flex",
          justifyContent: "space-between", // Adjusted to space-between
          alignItems: "center",
          marginTop: "65px",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleBackClick}
        >
          Back
        </Button>

        {/* Provider Details Section */}
{bookingType.bookingPreference !== "Date" && (
  <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
    <div style={{ display: 'grid', gap: '4px', textAlign: 'left' }}>
      <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
        {providerDetails.firstName} {providerDetails.lastName}, (
        {providerDetails.gender === 'FEMALE' ? 'F ' : providerDetails.gender === 'MALE' ? 'M ' : 'O '}
        {calculateAge(providerDetails.dob)})
        <img
          src="nonveg.png"
          alt="Diet Symbol"
          style={{ width: '20px', height: '20px', marginLeft: '10px' }}
        />
      </Typography>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Typography variant="body1" style={{ fontWeight: '500' }}>
          Languages: {providerDetails.languages || 'N/A'}
        </Typography>
        <Typography variant="body1" style={{ fontWeight: '500' }}>
          Specialities: {providerDetails.cookingSpeciality || 'N/A'}
        </Typography>
      </div>
    </div>
  </div>
)}
      </Box>

        {/* Scrollable Content Section */}
        <Box
          sx={{
            flexGrow: 1,
            padding: "20px",
            // overflowY: "auto",
            marginTop: "8%",
            marginBottom: "8%",
            height: "84%",
            display: "flex",
            flexDirection: "column",
          }}
        >
     
                
                {/* Left Section - Service Cart  Cook*/}

                {bookingTypes?.role === "cook" && (
                  <div
                    style={{
                      width: "60%",
                      background: "#fff",
                      padding: "30px",
                      borderRadius: "12px",
                      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <h2 style={{ fontSize: "26px", fontWeight: "bold" }}>
                        COOK
                      </h2>
                      {/* <Tooltip title="Remove this service">
                        <IconButton
                          sx={{ color: "#d32f2f" }}
                          onClick={() => handleRemoveItem(index)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip> */}
                    </div>
                    <table
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            textAlign: "left",
                            borderBottom: "2px solid #ddd",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                        
                          <th style={{ padding: "15px 10px" }}>Meal Type</th>
                          <th style={{ padding: "15px 10px" }}>Service Type</th>
                          <th style={{ padding: "15px 10px" }}>No of Person</th>
                          <th style={{ padding: "15px 10px" }}>Time Slot</th>
                          <th style={{ padding: "15px 10px" }}>Total Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCookPricing.map((meal, index) => {
                          const mealType = meal.Categories;
                          const { serviceType, pax } = mealStates[mealType] || {
                            serviceType: 1,
                            pax: 3,
                          };

                          return (
                            <tr
                              key={`${mealType}-${serviceType}-${pax}`}
                              style={{
                                borderBottom: "1px solid #ddd",
                                fontSize: "16px",
                                height: "50px",
                              }}
                            >
                             
                              <td style={{ padding: "15px 10px" }}>
                                {mealType}
                              </td>
                              <td style={{ padding: "15px 10px" }}>
                                <select
                                  value={
                                    serviceType === 1 ? "Regular" : "Premium"
                                  }
                                  onChange={(e) =>
                                    handleServiceTypeChange(
                                      mealType,
                                      e.target.value === "Regular" ? 1 : 2
                                    )
                                  }
                                  style={{
                                    padding: "5px",
                                    borderRadius: "5px",
                                    border: "1px solid #0288D1",
                                    background: "#E3F2FD",
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="Regular">Regular</option>
                                  <option value="Premium">Premium</option>
                                </select>
                              </td>
                              <td style={{ padding: "15px 10px" }}>
                                <select
                                  value={pax || 1}
                                  onChange={(e) =>
                                    updatePax(
                                      mealType,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                  style={{
                                    padding: "5px",
                                    borderRadius: "5px",
                                    border: "1px solid #0288D1",
                                    background: "#E3F2FD",
                                    cursor: "pointer",
                                  }}
                                >
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}
                                    </option>
                                  ))}
                                </select>
                              </td>
                             {/* Time Slot Input */}
                          <td style={{ padding: "15px 10px" }}>
                            <input
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              style={{
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #0288D1",
                                background: "#E3F2FD",
                              }}
                            />
                           
                          </td>
                              <td style={{ padding: "15px 10px" }}>
                                ₹{getPeopleCount(meal, pax, serviceType)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

             
       

        {/* Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ marginTop: "60px" }}
        >
          <Alert
            onClose={handleClose}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Dialog
          style={{ padding: "0px" }}
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Login bookingPage={handleBookingPage} />
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default Checkout;
