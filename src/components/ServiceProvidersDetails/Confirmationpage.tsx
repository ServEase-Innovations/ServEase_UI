import React, { useState } from 'react';
import moment from "moment";
import {
  Card,
  Typography,
  Button,
  Snackbar,
  Alert,
  Tooltip,
  Box,
} from "@mui/material";
import './Confirmationpage.css';
import NannyPricing from './NannyService/NannyPricing/NannyPricing';
import CookPricing from './CookService/CookPricing/CookPricing';
import MaidServices from './MaidServices/MaidServices';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../features/cart/cartSlice';
import { CHECKOUT, DETAILS } from '../../Constants/pagesConstants';
import Checkout from '../Checkout/Checkout'; // Import the Checkout component

interface ChildComponentProps {
  providerDetails: any;
  role: any;
  sendDataToParent: (data: any) => void;
}

// interface ConfirmationpageProps {
//   role: string | undefined;
//   providerDetails: string | undefined;
// }

const  Confirmationpage: React.FC<ChildComponentProps> = ({ providerDetails , role , sendDataToParent }) => {

  // const { selectedBookingType, setSelectedBookingType } = useContext(ServiceProviderContext);
  console.log("role ==> ", role)
  console.log("providerDetails => ", providerDetails)
  // console.log("Selected Booking Type from Context:", selectedBookingType);

  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [data, setData] = useState<any>([]);
  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const pricing = useSelector((state: any) => state.pricing?.groupedServices);

  const handlePriceChange = (data) => {
    console.log("Updated Data ===> ", data);
  };

  const handleProceedToCheckout = () => {
    sendDataToParent(CHECKOUT);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSave = (data) => {
    console.log("On Add to cart ===> ", data);
    if (data && calculatedPrice) {
      setSelectedItems((prevItems) => {
        const updatedItems = [...prevItems, { entry: data, price: calculatedPrice }];
        dispatch(add(updatedItems));
        return updatedItems;
      });
      setSnackbarMessage("Item successfully added to cart!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("Failed to add item to cart. Please select a valid service.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
    handleClose();
  };

  const handleBackClick = () => {
    sendDataToParent(DETAILS);
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const age = moment().diff(moment(dob), 'years');
    return age;
  };

  // Conditionally render the Checkout component based on the role
  if (role === "cook" || role === "nanny" || role === "maid") {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
        <Checkout providerDetails={providerDetails} sendDataToParent={sendDataToParent} />
      </Box>
    );
  }

  return (
    <div className="details-container">
      {/* <header className="headers">
        <Button onClick={handleBackClick} variant="outlined">
          Back
        </Button>
      </header> */}
      {/* {providerDetails && (
        <div style={{ width: '100%' }}>
          <Card style={{ width: '100%' }}>
            <div style={{ display: 'flex', marginLeft: '20px' }}>
              <div style={{ display: 'grid' }}>
                <Typography variant="h6" style={{ display: 'flex' }}>
                  {providerDetails.firstName} {providerDetails.lastName}, ({providerDetails.gender === 'FEMALE' ? 'F ' : providerDetails.gender === 'MALE' ? 'M ' : 'O'} {calculateAge(providerDetails.dob)})
                  <img
                    src="nonveg.png"
                    alt="Diet Symbol"
                    style={{ width: '20px', height: '20px', marginTop: '5px' }}
                  />
                </Typography>
                <div>
                  Languages:
                  Specialities:
                  role: {role}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )} */}
    </div>
  );
};

export default Confirmationpage;