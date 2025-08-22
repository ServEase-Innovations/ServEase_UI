/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { BookingDetails } from '../../types/engagementRequest';
import { BOOKINGS } from '../../Constants/pagesConstants';
import { Dialog, DialogContent, Tooltip, IconButton, CircularProgress } from '@mui/material';
import Login from '../Login/Login';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { EnhancedProviderDetails } from '../../types/ProviderDetailsType';
import axiosInstance from '../../services/axiosInstance';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { addToCart, removeFromCart, selectCartItems } from '../../features/addToCart/addToSlice';
import { isMaidCartItem } from '../../types/cartSlice';
import { CartDialog } from '../AddToCart/CartDialog';
import {
  StyledDialog,
  StyledDialogContent,
  DialogContainer,
  DialogHeader,
  TabsContainer,
  TabButton,
  PackagesContainer,
  PackageCard,
  PackageHeader,
  PackageTitle,
  RatingContainer,
  RatingValue,
  ReviewsText,
  PriceContainer,
  PriceValue,
  PreparationTime,
  PersonsControl,
  PersonsLabel,
  PersonsInput,
  DecrementButton,
  IncrementButton,
  PersonsValue,
  DescriptionList,
  DescriptionItem,
  DescriptionBullet,
  ButtonsContainer,
  CartButton,
  SelectButton,
  AddOnsContainer,
  AddOnsTitle,
  AddOnsGrid,
  AddOnCard,
  AddOnHeader,
  AddOnTitle,
  AddOnPrice,
  AddOnDescription,
  AddOnButton,
  VoucherContainer,
  VoucherTitle,
  VoucherInputContainer,
  VoucherInput,
  VoucherButton,
  FooterContainer,
  FooterText,
  FooterPrice,
  FooterButtons,
  LoginButton,
  CheckoutButton,
  CloseButton
} from './MaidServiceDialog.styles';
import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from '@mui/icons-material/Close';
interface MaidServiceDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

const MaidServiceDialog: React.FC<MaidServiceDialogProps> = ({ 
  open, 
  handleClose, 
  providerDetails,
  sendDataToParent
}) => {
  const [activeTab, setActiveTab] = useState('regular');
  const allCartItems = useSelector(selectCartItems);
  const maidCartItems = allCartItems.filter(isMaidCartItem);
  const [loading, setLoading] = useState(false);
 const [cartItems, setCartItems] = useState<Record<string, boolean>>(() => {
  const initialCartItems = {
    utensilCleaning: false,
    sweepingMopping: false,
    bathroomCleaning: false,
    bathroomDeepCleaning: false,
    normalDusting: false,
    deepDusting: false,
    utensilDrying: false,
    clothesDrying: false
  };

  maidCartItems.forEach(item => {
    if (item.serviceType === 'package') {
      initialCartItems[item.name] = true;
    } else if (item.serviceType === 'addon') {
      initialCartItems[item.name] = true;
    }
  });

  return initialCartItems;
});

const [packageStates, setPackageStates] = useState({
  utensilCleaning: {
    persons: 3,
    selected: maidCartItems.some(item => item.serviceType === 'package' && item.name === 'utensilCleaning')
  },
  sweepingMopping: {
    houseSize: '2BHK',
    selected: maidCartItems.some(item => item.serviceType === 'package' && item.name === 'sweepingMopping')
  },
  bathroomCleaning: {
    bathrooms: 2,
    selected: maidCartItems.some(item => item.serviceType === 'package' && item.name === 'bathroomCleaning')
  }
});

const [addOns, setAddOns] = useState({
  bathroomDeepCleaning: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'bathroomDeepCleaning'),
  normalDusting: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'normalDusting'),
  deepDusting: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'deepDusting'),
  utensilDrying: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'utensilDrying'),
  clothesDrying: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'clothesDrying')
});
  
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const dispatch = useDispatch();

  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const users = useSelector((state: any) => state.user?.value);
  // const customerId = user?.customerDetails?.customerId || null;
  const currentLocation = users?.customerDetails?.currentLocation;
  // const firstName = user?.customerDetails?.firstName;
  // const lastName = user?.customerDetails?.lastName;
  // const customerName = `${firstName} ${lastName}`;
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;
  const pricing = useSelector((state: any) => state.pricing?.groupedServices);
  const maidServices = pricing?.maid?.filter((service: any) => service.Type === "Regular" || service.Type === "Regular Add-on") || [];
  const { user,  loginWithRedirect,isAuthenticated } = useAuth0();

  const getBookingTypeFromPreference = (bookingPreference: string | undefined): string => {
    if (!bookingPreference) return 'MONTHLY'; // default
    
    const pref = bookingPreference.toLowerCase();
    if (pref === 'date') return 'ON_DEMAND';
    if (pref === 'short term') return 'SHORT_TERM';
    return 'MONTHLY';
  };
  const bookingDetails: BookingDetails = {
    serviceProviderId: 0,
    serviceProviderName: "",
    customerId: 0,
    customerName: "", 
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    engagements: "",
    address: " Durgapur, West Bengal 713205, India",
    timeslot: "",
    monthlyAmount: 0,
    paymentMode: "UPI",
    bookingType: getBookingTypeFromPreference(bookingType?.bookingPreference),
    taskStatus: "NOT_STARTED", 
    responsibilities: [],
    serviceType: "MAID",
  };

  useEffect(() => {
      if (isAuthenticated && user) {
        console.log("User Info:", user);
        console.log("Name:", user.name);
        console.log("Customer ID:", user.customerid);
      }
    }, [isAuthenticated, user]);

  const handleLogin = () => {
    setLoginOpen(true);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  const handleBookingPage = () => {
    setLoginOpen(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePersonChange = (operation: string) => {
    setPackageStates(prev => ({
      ...prev,
      utensilCleaning: {
        ...prev.utensilCleaning,
        persons: operation === 'increment' 
          ? Math.min(prev.utensilCleaning.persons + 1, 10)
          : Math.max(prev.utensilCleaning.persons - 1, 1)
      }
    }));
  };

  const handleHouseSizeChange = (operation: string) => {
    const sizes = ['1BHK', '2BHK', '3BHK', '4BHK+'];
    const currentIndex = sizes.indexOf(packageStates.sweepingMopping.houseSize);
    
    setPackageStates(prev => ({
      ...prev,
      sweepingMopping: {
        ...prev.sweepingMopping,
        houseSize: operation === 'increment' 
          ? sizes[Math.min(currentIndex + 1, sizes.length - 1)]
          : sizes[Math.max(currentIndex - 1, 0)]
      }
    }));
  };

  const handleBathroomChange = (operation: string) => {
    setPackageStates(prev => ({
      ...prev,
      bathroomCleaning: {
        ...prev.bathroomCleaning,
        bathrooms: operation === 'increment' 
          ? Math.min(prev.bathroomCleaning.bathrooms + 1, 5)
          : Math.max(prev.bathroomCleaning.bathrooms - 1, 1)
      }
    }));
  };
  const getSelectedServicesDescription = (): string => {
  const selectedServices: string[] = [];
  
  // Add selected packages
  if (packageStates.utensilCleaning.selected) {
    selectedServices.push(`Utensil cleaning for ${packageStates.utensilCleaning.persons} persons`);
  }
  if (packageStates.sweepingMopping.selected) {
    selectedServices.push(`Sweeping & mopping for ${packageStates.sweepingMopping.houseSize}`);
  }
  if (packageStates.bathroomCleaning.selected) {
    selectedServices.push(`Bathroom cleaning for ${packageStates.bathroomCleaning.bathrooms} bathrooms`);
  }

  // Add selected add-ons
  const selectedAddOns = Object.entries(addOns)
    .filter(([_, selected]) => selected)
    .map(([name]) => {
      switch(name) {
        case 'bathroomDeepCleaning': return 'Bathroom deep cleaning';
        case 'normalDusting': return 'Normal dusting';
        case 'deepDusting': return 'Deep dusting';
        case 'utensilDrying': return 'Utensil drying';
        case 'clothesDrying': return 'Clothes drying';
        default: return name;
      }
    });

  if (selectedAddOns.length > 0) {
    selectedServices.push(`Add-ons: ${selectedAddOns.join(', ')}`);
  }

  return selectedServices.join('; ');
};

useEffect(() => {
  if (open) {
    // Sync cart items from Redux
    const updatedCartItems = {
      utensilCleaning: false,
      sweepingMopping: false,
      bathroomCleaning: false,
      bathroomDeepCleaning: false,
      normalDusting: false,
      deepDusting: false,
      utensilDrying: false,
      clothesDrying: false
    };

    maidCartItems.forEach(item => {
      if (item.serviceType === 'package' || item.serviceType === 'addon') {
        updatedCartItems[item.name] = true;
      }
    });

    setCartItems(updatedCartItems);

    // Sync package states
    setPackageStates(prev => ({
      utensilCleaning: {
        ...prev.utensilCleaning,
        selected: maidCartItems.some(item => item.serviceType === 'package' && item.name === 'utensilCleaning')
      },
      sweepingMopping: {
        ...prev.sweepingMopping,
        selected: maidCartItems.some(item => item.serviceType === 'package' && item.name === 'sweepingMopping')
      },
      bathroomCleaning: {
        ...prev.bathroomCleaning,
        selected: maidCartItems.some(item => item.serviceType === 'package' && item.name === 'bathroomCleaning')
      }
    }));

    // Sync add-ons
    setAddOns({
      bathroomDeepCleaning: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'bathroomDeepCleaning'),
      normalDusting: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'normalDusting'),
      deepDusting: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'deepDusting'),
      utensilDrying: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'utensilDrying'),
      clothesDrying: maidCartItems.some(item => item.serviceType === 'addon' && item.name === 'clothesDrying')
    });
  }
}, [open, maidCartItems]);

  const handleAddOnSelect = (addOnName: string) => {
    setAddOns(prev => ({
      ...prev,
      [addOnName]: !prev[addOnName]
    }));
  };

  const handleAddPackageToCart = (packageName: string) => {
  const isCurrentlyInCart = cartItems[packageName];

  const packageDetails = {
    id: `package_${packageName}`,
    type: 'maid' as const,
    serviceType: 'package' as const,
    name: packageName,
    price: getPackagePrice(packageName),
    description: getPackageDescription(packageName),
    details: getPackageDetails(packageName)
  };

  if (isCurrentlyInCart) {
    dispatch(removeFromCart({ id: packageDetails.id, type: 'maid' }));
  } else {
    dispatch(addToCart(packageDetails));
  }

  // Update cart state and select state together
  setCartItems(prev => ({
    ...prev,
    [packageName]: !isCurrentlyInCart
  }));

  setPackageStates(prev => ({
    ...prev,
    [packageName]: {
      ...prev[packageName],
      selected: !isCurrentlyInCart
    }
  }));
};


  const handleAddAddOnToCart = (addOnName: string) => {
  const isCurrentlyInCart = cartItems[addOnName];

  const addOnDetails = {
    id: `addon_${addOnName}`,
    type: 'maid' as const,
    serviceType: 'addon' as const,
    name: addOnName,
    price: getAddOnPrice(addOnName),
    description: getAddOnDescription(addOnName)
  };

  if (isCurrentlyInCart) {
    dispatch(removeFromCart({ id: addOnDetails.id, type: 'maid' }));
  } else {
    dispatch(addToCart(addOnDetails));
  }

  // Update cart state and selected state together
  setCartItems(prev => ({
    ...prev,
    [addOnName]: !isCurrentlyInCart
  }));

  setAddOns(prev => ({
    ...prev,
    [addOnName]: !isCurrentlyInCart
  }));
};


  const getPackagePrice = (packageName: string): number => {
    switch(packageName) {
      case 'utensilCleaning': return 1200;
      case 'sweepingMopping': return 1200;
      case 'bathroomCleaning': return 600;
      default: return 0;
    }
  };

  const getPackageDescription = (packageName: string): string => {
    switch(packageName) {
      case 'utensilCleaning': 
        return 'All kind of daily utensil cleaning\nParty used type utensil cleaning';
      case 'sweepingMopping':
        return 'Daily sweeping and mopping';
      case 'bathroomCleaning':
        return 'Weekly cleaning of bathrooms';
      default: return '';
    }
  };

  const getPackageDetails = (packageName: string) => {
    switch(packageName) {
      case 'utensilCleaning':
        return { persons: packageStates.utensilCleaning.persons };
      case 'sweepingMopping':
        return { houseSize: packageStates.sweepingMopping.houseSize };
      case 'bathroomCleaning':
        return { bathrooms: packageStates.bathroomCleaning.bathrooms };
      default: return {};
    }
  };

  const getAddOnPrice = (addOnName: string): number => {
    switch(addOnName) {
      case 'bathroomDeepCleaning': return 1000;
      case 'normalDusting': return 1000;
      case 'deepDusting': return 1500;
      case 'utensilDrying': return 1000;
      case 'clothesDrying': return 1000;
      default: return 0;
    }
  };

  const getAddOnDescription = (addOnName: string): string => {
    switch(addOnName) {
      case 'bathroomDeepCleaning':
        return 'Weekly cleaning of bathrooms, all bathroom walls cleaned';
      case 'normalDusting':
        return 'Daily furniture dusting, doors, carpet, bed making';
      case 'deepDusting':
        return 'Includes chemical agents cleaning: décor items, furniture';
      case 'utensilDrying':
        return 'Househelp will dry and make proper arrangements';
      case 'clothesDrying':
        return 'Househelp will get clothes from/to drying place';
      default: return '';
    }
  };

  const calculateTotal = () => {
    let total = 0;
    
    if (packageStates.utensilCleaning.selected) total += 1200;
    if (packageStates.sweepingMopping.selected) total += 1200;
    if (packageStates.bathroomCleaning.selected) total += 600;
    
    if (addOns.bathroomDeepCleaning) total += 1000;
    if (addOns.normalDusting) total += 1000;
    if (addOns.deepDusting) total += 1500;
    if (addOns.utensilDrying) total += 1000;
    if (addOns.clothesDrying) total += 1000;
    
    return total;
  };

  const countSelectedServices = () => {
    let count = 0;
    if (packageStates.utensilCleaning.selected) count++;
    if (packageStates.sweepingMopping.selected) count++;
    if (packageStates.bathroomCleaning.selected) count++;
    return count;
  };

  const countSelectedAddOns = () => {
    return Object.values(addOns).filter(Boolean).length;
  };

  const hasSelectedServices = () => {
    return countSelectedServices() > 0 || countSelectedAddOns() > 0;
  };
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  
// Add this function to MaidServiceDialog
const prepareCartForCheckout = () => {
  // Clear all existing cart items
  dispatch(removeFromCart({ type: 'meal' }));
  dispatch(removeFromCart({ type: 'maid' }));
  dispatch(removeFromCart({ type: 'nanny' }));

  // Add selected packages
  if (packageStates.utensilCleaning.selected) {
    dispatch(addToCart({
      type: 'maid',
      id: `package_utensilCleaning`,
      serviceType: 'package',
      name: 'utensilCleaning',
      price: getPackagePrice('utensilCleaning'),
      description: getPackageDescription('utensilCleaning'),
      details: { persons: packageStates.utensilCleaning.persons }
    }));
  }

  if (packageStates.sweepingMopping.selected) {
    dispatch(addToCart({
      type: 'maid',
      id: `package_sweepingMopping`,
      serviceType: 'package',
      name: 'sweepingMopping',
      price: getPackagePrice('sweepingMopping'),
      description: getPackageDescription('sweepingMopping'),
      details: { houseSize: packageStates.sweepingMopping.houseSize }
    }));
  }

  if (packageStates.bathroomCleaning.selected) {
    dispatch(addToCart({
      type: 'maid',
      id: `package_bathroomCleaning`,
      serviceType: 'package',
      name: 'bathroomCleaning',
      price: getPackagePrice('bathroomCleaning'),
      description: getPackageDescription('bathroomCleaning'),
      details: { bathrooms: packageStates.bathroomCleaning.bathrooms }
    }));
  }

  // Add selected add-ons
  if (addOns.bathroomDeepCleaning) {
    dispatch(addToCart({
      type: 'maid',
      id: `addon_bathroomDeepCleaning`,
      serviceType: 'addon',
      name: 'bathroomDeepCleaning',
      price: getAddOnPrice('bathroomDeepCleaning'),
      description: getAddOnDescription('bathroomDeepCleaning')
    }));
  }

  if (addOns.normalDusting) {
    dispatch(addToCart({
      type: 'maid',
      id: `addon_normalDusting`,
      serviceType: 'addon',
      name: 'normalDusting',
      price: getAddOnPrice('normalDusting'),
      description: getAddOnDescription('normalDusting')
    }));
  }

  if (addOns.deepDusting) {
    dispatch(addToCart({
      type: 'maid',
      id: `addon_deepDusting`,
      serviceType: 'addon',
      name: 'deepDusting',
      price: getAddOnPrice('deepDusting'),
      description: getAddOnDescription('deepDusting')
    }));
  }

  if (addOns.utensilDrying) {
    dispatch(addToCart({
      type: 'maid',
      id: `addon_utensilDrying`,
      serviceType: 'addon',
      name: 'utensilDrying',
      price: getAddOnPrice('utensilDrying'),
      description: getAddOnDescription('utensilDrying')
    }));
  }

  if (addOns.clothesDrying) {
    dispatch(addToCart({
      type: 'maid',
      id: `addon_clothesDrying`,
      serviceType: 'addon',
      name: 'clothesDrying',
      price: getAddOnPrice('clothesDrying'),
      description: getAddOnDescription('clothesDrying')
    }));
  }
};

// Update handleOpenCartDialog
const handleOpenCartDialog = () => {
  if (!hasSelectedServices()) {
    alert("Please select at least one service");
    return;
  }

  prepareCartForCheckout();
  setCartDialogOpen(true);
};
const handleCheckout = async () => {
  try {
    setLoading(true);
    
    // Calculate total from Redux cart items (more reliable than local state)
    const maidCartItems = allCartItems.filter(isMaidCartItem);
    const baseTotal = maidCartItems.reduce((sum, item) => sum + item.price, 0);
    
    if (baseTotal <= 0) {
      alert("No items selected for checkout");
      return;
    }
 // Calculate tax and platform fee (18% tax + 6% platform fee)
    const tax = baseTotal * 0.18;
    const platformFee = baseTotal * 0.06;
    const grandTotal = baseTotal + tax + platformFee;
    const customerName = user?.name || "Guest";
    const customerId = user?.customerid || "guest-id";
    
    const response = await axios.post(
      "https://utils-ndt3.onrender.com/create-order",
      { amount: Math.round(grandTotal * 100) },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200 && response.data.success) {
      const orderId = response.data.orderId;
       const amount = Math.round(grandTotal * 100);
      const currency = "INR";

      // Generate engagements description from cart items
      const engagements = maidCartItems.map(item => {
        if (isMaidCartItem(item)) {
          if (item.serviceType === 'package') {
            if (item.name === 'utensilCleaning') {
              return `Utensil cleaning for ${item.details?.persons || 1} persons`;
            } else if (item.name === 'sweepingMopping') {
              return `Sweeping & mopping for ${item.details?.houseSize || '2BHK'}`;
            } else if (item.name === 'bathroomCleaning') {
              return `Bathroom cleaning for ${item.details?.bathrooms || 2} bathrooms`;
            }
          } else if (item.serviceType === 'addon') {
            return item.name.split(/(?=[A-Z])/).join(' '); // Convert camelCase to normal text
          }
        }
        return item.name;
      }).join(', ');

      const bookingDetails: BookingDetails = {
        serviceProviderId: providerDetails?.serviceproviderId ? Number(providerDetails.serviceproviderId) : 0,
        serviceProviderName: providerFullName,
        customerId: customerId,
        customerName: customerName,
        startDate: bookingType?.startDate || new Date().toISOString().split('T')[0],
        endDate: bookingType?.endDate || "",
        engagements: engagements,
        address: currentLocation,
        timeslot: bookingType?.timeRange || "",
        monthlyAmount: baseTotal,
        paymentMode: "UPI",
        bookingType: getBookingTypeFromPreference(bookingType?.bookingPreference),
        taskStatus: "NOT_STARTED",
        serviceType: "MAID",
        responsibilities: [],
      };

      const options = {
        key: "rzp_test_lTdgjtSRlEwreA",
        amount,
        currency,
        name: "Serveaso",
        description: "Maid Service Booking",
        order_id: orderId,
        handler: async function (razorpayResponse: any) {
          try {
            // Save booking
            const bookingResponse = await axiosInstance.post(
              "/api/serviceproviders/engagement/add",
              bookingDetails
            );

            if (bookingResponse.status === 201) {
              // Clear cart after successful payment
              dispatch(removeFromCart({ type: 'meal' }));
              dispatch(removeFromCart({ type: 'maid' }));
              dispatch(removeFromCart({ type: 'nanny' }));
              
              // Send notification
              await fetch("http://localhost:4000/send-notification", {
                method: "POST",
                body: JSON.stringify({
                  title: "Hello from ServEaso!",
                  body: `Your maid service booking has been confirmed!`,
                  url: "http://localhost:3000",
                }),
              });

              if (sendDataToParent) {
                sendDataToParent(BOOKINGS);
              }
              handleClose();
              setCartDialogOpen(false);
            }
          } catch (error) {
            console.error("Error in payment handler:", error);
             handleClose();
              setCartDialogOpen(false);
          }
        },
        prefill: {
          name: customerName,
          email: user?.email || "",
          contact: user?.mobileNo || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Failed to initiate payment. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <StyledDialog 
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <StyledDialogContent>
          <DialogContainer>
            <DialogHeader>
              <h1>🧹Maid Service</h1>
              <CloseButton 
                aria-label="close" 
                onClick={handleClose}
                size="small"
              >
                <CloseIcon />
              </CloseButton>
            </DialogHeader>
            
            <TabsContainer>
              <TabButton 
                active={activeTab === 'regular'}
                onClick={() => handleTabChange('regular')}
              >
                Regular Services
              </TabButton>
              <TabButton 
                active={activeTab === 'premium'}
                onClick={() => handleTabChange('premium')}
              >
                Premium Services
              </TabButton>
            </TabsContainer>
            
            <PackagesContainer>
              {/* Regular Utensil Cleaning */}
              <PackageCard 
                selected={packageStates.utensilCleaning.selected} 
                color="#e17055"
              >
                <PackageHeader>
                  <div>
                    <PackageTitle>Utensil Cleaning</PackageTitle>
                    <RatingContainer>
                      <RatingValue color="#e17055">4.7</RatingValue>
                      <ReviewsText>(1.2M reviews)</ReviewsText>
                    </RatingContainer>
                  </div>
                  <PriceContainer>
                    <PriceValue color="#e17055">₹1,200</PriceValue>
                    <PreparationTime>Monthly service</PreparationTime>
                  </PriceContainer>
                </PackageHeader>
                
                <PersonsControl>
                  <PersonsLabel>Persons:</PersonsLabel>
                  <PersonsInput>
                    <DecrementButton onClick={() => handlePersonChange('decrement')}>
                      -
                    </DecrementButton>
                    <PersonsValue>
                      {packageStates.utensilCleaning.persons}
                    </PersonsValue>
                    <IncrementButton onClick={() => handlePersonChange('increment')}>
                      +
                    </IncrementButton>
                  </PersonsInput>
                </PersonsControl>
                
                <DescriptionList>
                  <DescriptionItem>
                    <DescriptionBullet>•</DescriptionBullet>
                    <span>All kind of daily utensil cleaning</span>
                  </DescriptionItem>
                  <DescriptionItem>
                    <DescriptionBullet>•</DescriptionBullet>
                    <span>Party used type utensil cleaning</span>
                  </DescriptionItem>
                </DescriptionList>

                <ButtonsContainer>
                  <CartButton
                    inCart={cartItems.utensilCleaning}
                    onClick={() => handleAddPackageToCart('utensilCleaning')}
                  >
                    {cartItems.utensilCleaning ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                    {cartItems.utensilCleaning ? 'ADDED TO CART' : 'ADD TO CART'}
                  </CartButton>
                </ButtonsContainer>
              </PackageCard>
              
              {/* Sweeping & Mopping */}
              <PackageCard 
                selected={packageStates.sweepingMopping.selected} 
                color="#00b894"
              >
                <PackageHeader>
                  <div>
                    <PackageTitle>Sweeping & Mopping</PackageTitle>
                    <RatingContainer>
                      <RatingValue color="#00b894">4.8</RatingValue>
                      <ReviewsText>(1.5M reviews)</ReviewsText>
                    </RatingContainer>
                  </div>
                  <PriceContainer>
                    <PriceValue color="#00b894">₹1,200</PriceValue>
                    <PreparationTime>Monthly service</PreparationTime>
                  </PriceContainer>
                </PackageHeader>
                
                <PersonsControl>
                  <PersonsLabel>House Size:</PersonsLabel>
                  <PersonsInput>
                    <DecrementButton onClick={() => handleHouseSizeChange('decrement')}>
                      -
                    </DecrementButton>
                    <PersonsValue>
                      {packageStates.sweepingMopping.houseSize}
                    </PersonsValue>
                    <IncrementButton onClick={() => handleHouseSizeChange('increment')}>
                      +
                    </IncrementButton>
                  </PersonsInput>
                </PersonsControl>
                
                <DescriptionList>
                  <DescriptionItem>
                    <DescriptionBullet>•</DescriptionBullet>
                    <span>Daily sweeping and mopping of 2 rooms, 1 Hall</span>
                  </DescriptionItem>
                </DescriptionList>

                <ButtonsContainer>
                  <CartButton
                    inCart={cartItems.sweepingMopping}
                    onClick={() => handleAddPackageToCart('sweepingMopping')}
                  >
                    {cartItems.sweepingMopping ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                    {cartItems.sweepingMopping ? 'ADDED TO CART' : 'ADD TO CART'}
                  </CartButton>
                </ButtonsContainer>
              </PackageCard>
              
              {/* Bathroom Cleaning */}
              <PackageCard 
                selected={packageStates.bathroomCleaning.selected} 
                color="#0984e3"
              >
                <PackageHeader>
                  <div>
                    <PackageTitle>Bathroom Cleaning</PackageTitle>
                    <RatingContainer>
                      <RatingValue color="#0984e3">4.6</RatingValue>
                      <ReviewsText>(980K reviews)</ReviewsText>
                    </RatingContainer>
                  </div>
                  <PriceContainer>
                    <PriceValue color="#0984e3">₹600</PriceValue>
                    <PreparationTime>Monthly service</PreparationTime>
                  </PriceContainer>
                </PackageHeader>
                
                <PersonsControl>
                  <PersonsLabel>Bathrooms:</PersonsLabel>
                  <PersonsInput>
                    <DecrementButton onClick={() => handleBathroomChange('decrement')}>
                      -
                    </DecrementButton>
                    <PersonsValue>
                      {packageStates.bathroomCleaning.bathrooms}
                    </PersonsValue>
                    <IncrementButton onClick={() => handleBathroomChange('increment')}>
                      +
                    </IncrementButton>
                  </PersonsInput>
                </PersonsControl>
                
                <DescriptionList>
                  <DescriptionItem>
                    <DescriptionBullet>•</DescriptionBullet>
                    <span>Weekly cleaning of bathrooms</span>
                  </DescriptionItem>
                </DescriptionList>

                <ButtonsContainer>
                  <CartButton
                    inCart={cartItems.bathroomCleaning}
                    onClick={() => handleAddPackageToCart('bathroomCleaning')}
                  >
                    {cartItems.bathroomCleaning ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                    {cartItems.bathroomCleaning ? 'ADDED TO CART' : 'ADD TO CART'}
                  </CartButton>
                </ButtonsContainer>
              </PackageCard>
              
              {/* Add-ons Section */}
              <AddOnsContainer>
                <AddOnsTitle>Regular Add-on Services</AddOnsTitle>
                <AddOnsGrid>
                  {/* Bathroom Deep Cleaning */}
                  <AddOnCard selected={addOns.bathroomDeepCleaning} color="#00b894">
                    <AddOnHeader>
                      <AddOnTitle>Bathroom Deep Cleaning</AddOnTitle>
                      <AddOnPrice color="#00b894">+₹1,000</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>
                      Weekly cleaning of bathrooms, all bathroom walls cleaned
                    </AddOnDescription>
                    <AddOnButton
                      selected={addOns.bathroomDeepCleaning}
                      color="#00b894"
                      onClick={() => handleAddAddOnToCart('bathroomDeepCleaning')}
                    >
                      {addOns.bathroomDeepCleaning ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>
                  
                  {/* Normal Dusting */}
                  <AddOnCard selected={addOns.normalDusting} color="#0984e3">
                    <AddOnHeader>
                      <AddOnTitle>Normal Dusting</AddOnTitle>
                      <AddOnPrice color="#0984e3">+₹1,000</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>
                      Daily furniture dusting, doors, carpet, bed making
                    </AddOnDescription>
                    <AddOnButton
                      selected={addOns.normalDusting}
                      color="#0984e3"
                      onClick={() => handleAddAddOnToCart('normalDusting')}
                    >
                      {addOns.normalDusting ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>
                  
                  {/* Deep Dusting */}
                  <AddOnCard selected={addOns.deepDusting} color="#e17055">
                    <AddOnHeader>
                      <AddOnTitle>Deep Dusting</AddOnTitle>
                      <AddOnPrice color="#e17055">+₹1,500</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>
                      Includes chemical agents cleaning: décor items, furniture
                    </AddOnDescription>
                    <AddOnButton
                      selected={addOns.deepDusting}
                      color="#e17055"
                      onClick={() => handleAddAddOnToCart('deepDusting')}
                    >
                      {addOns.deepDusting ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>
                  
                  {/* Utensil Drying */}
                  <AddOnCard selected={addOns.utensilDrying} color="#00b894">
                    <AddOnHeader>
                      <AddOnTitle>Utensil Drying</AddOnTitle>
                      <AddOnPrice color="#00b894">+₹1,000</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>
                      Househelp will dry and make proper arrangements
                    </AddOnDescription>
                    <AddOnButton
                      selected={addOns.utensilDrying}
                      color="#00b894"
                      onClick={() => handleAddAddOnToCart('utensilDrying')}
                    >
                      {addOns.utensilDrying ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>
                  
                  {/* Clothes Drying */}
                  <AddOnCard selected={addOns.clothesDrying} color="#0984e3">
                    <AddOnHeader>
                      <AddOnTitle>Clothes Drying</AddOnTitle>
                      <AddOnPrice color="#0984e3">+₹1,000</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>
                      Househelp will get clothes from/to drying place
                    </AddOnDescription>
                    <AddOnButton
                      selected={addOns.clothesDrying}
                      color="#0984e3"
                      onClick={() => handleAddAddOnToCart('clothesDrying')}
                    >
                      {addOns.clothesDrying ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>
                </AddOnsGrid>
              </AddOnsContainer>

              {/* Voucher Section */}
              <VoucherContainer>
                <VoucherTitle>Apply Voucher</VoucherTitle>
                <VoucherInputContainer>
                  <VoucherInput
                    type="text"
                    placeholder="Enter voucher code"
                  />
                  <VoucherButton>
                    APPLY
                  </VoucherButton>
                </VoucherInputContainer>
              </VoucherContainer>
            </PackagesContainer>
            
            {/* Footer with Checkout */}
            <FooterContainer>
              <div>
                <FooterText>
                  Total for {countSelectedServices()} services ({countSelectedAddOns()} add-ons)
                </FooterText>
                <FooterPrice>
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </FooterPrice>
              </div>
              
              <FooterButtons>
  {!isAuthenticated && (
    <>
      <Tooltip title="You need to login to proceed with checkout">
        <IconButton size="small" style={{ marginRight: '8px' }}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <LoginButton onClick={() => loginWithRedirect()}>
        LOGIN TO CONTINUE
      </LoginButton>
    </>
  )}
  
  {isAuthenticated && (
    <CheckoutButton
     onClick={handleOpenCartDialog}
      disabled={calculateTotal() === 0}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : 'CHECKOUT'}
    </CheckoutButton>
  )}
</FooterButtons>
            </FooterContainer>
          </DialogContainer>
        </StyledDialogContent>
      </StyledDialog>
<CartDialog
  open={cartDialogOpen}
  handleClose={() => setCartDialogOpen(false)}
  handleCheckout={handleCheckout}
/>
    </>
  );
};

export default MaidServiceDialog;