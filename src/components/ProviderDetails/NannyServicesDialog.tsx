/* eslint-disable */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { EnhancedProviderDetails } from '../../types/ProviderDetailsType';
import { useDispatch, useSelector } from 'react-redux';
import { BookingDetails } from '../../types/engagementRequest';
import { BOOKINGS } from '../../Constants/pagesConstants';
import { Dialog, DialogContent, Tooltip, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axiosInstance from '../../services/axiosInstance';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { addToCart, removeFromCart, selectCartItems } from '../../features/addToCart/addToSlice';
import { isNannyCartItem } from '../../types/cartSlice';
import {
  StyledDialog,
  StyledDialogContent,
  DialogContainer,
  DialogHeader,
  TabContainer,
  TabButton,
  TabIndicator,
  PackagesContainer,
  PackageCard,
  PackageHeader,
  PackageTitle,
  RatingContainer,
  RatingValue,
  ReviewsText,
  PriceContainer,
  PriceValue,
  CareType,
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
  SelectButton,
  CartButton,
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
} from './NannyServicesDialog.styles';
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from '../Button/button';
import CloseIcon from '@mui/icons-material/Close';
interface NannyServicesDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

const NannyServicesDialog: React.FC<NannyServicesDialogProps> = ({ 
  open, 
  handleClose, 
  providerDetails,
  sendDataToParent
}) => {
  const [activeTab, setActiveTab] = useState<'baby' | 'elderly'>('baby');
  const [babyPackages, setBabyPackages] = useState({
    day: { age: 3, selected: false },
    night: { age: 3, selected: false },
    fullTime: { age: 3, selected: false }
  });
  const [elderlyPackages, setElderlyPackages] = useState({
    day: { age: 65, selected: false },
    night: { age: 65, selected: false },
    fullTime: { age: 65, selected: false }
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const users = useSelector((state: any) => state.user?.value);
  const { user,  loginWithRedirect,isAuthenticated } = useAuth0();
  const dispatch = useDispatch();
  const allCartItems = useSelector(selectCartItems);
  const nannyCartItems = allCartItems.filter(isNannyCartItem);
  // const customerId = user?.customerDetails?.customerId || null;
  const currentLocation = user?.customerDetails?.currentLocation;
  // const firstName = user?.customerDetails?.firstName;
  // const lastName = user?.customerDetails?.lastName;
  // const customerName = `${firstName} ${lastName}`;
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;
  const [cartItems, setCartItems] = useState<Record<string, boolean>>(() => {
    const initialCartItems = {
      babyDay: false,
      babyNight: false,
      babyFullTime: false,
      elderlyDay: false,
      elderlyNight: false,
      elderlyFullTime: false
    };
    
    nannyCartItems.forEach(item => {
      const key = `${item.careType}${item.packageType.charAt(0).toUpperCase() + item.packageType.slice(1)}`;
      initialCartItems[key as keyof typeof initialCartItems] = true;
    });

    return initialCartItems;
  });

  useEffect(() => {
     if (isAuthenticated && user) {
       console.log("User Info:", user);
       console.log("Name:", user.name);
       console.log("Customer ID:", user.customerid);
     }
   }, [isAuthenticated, user]);

 useEffect(() => {
  const updatedCartItems = { ...cartItems };
  const updatedBabyPackages = { ...babyPackages };
  const updatedElderlyPackages = { ...elderlyPackages };
  
  // Reset all states
  Object.keys(cartItems).forEach(key => {
    if (key.startsWith('baby') || key.startsWith('elderly')) {
      updatedCartItems[key] = false;
    }
  });

  Object.keys(updatedBabyPackages).forEach(key => {
    updatedBabyPackages[key as keyof typeof updatedBabyPackages].selected = false;
  });

  Object.keys(updatedElderlyPackages).forEach(key => {
    updatedElderlyPackages[key as keyof typeof updatedElderlyPackages].selected = false;
  });

  // Update based on current cart items
  nannyCartItems.forEach(item => {
    const packageKey = `${item.careType}${item.packageType.charAt(0).toUpperCase() + item.packageType.slice(1)}`;
    updatedCartItems[packageKey as keyof typeof updatedCartItems] = true;

    if (item.careType === 'baby') {
      updatedBabyPackages[item.packageType as keyof typeof updatedBabyPackages].selected = true;
    } else {
      updatedElderlyPackages[item.packageType as keyof typeof updatedElderlyPackages].selected = true;
    }
  });

  setCartItems(updatedCartItems);
  setBabyPackages(updatedBabyPackages);
  setElderlyPackages(updatedElderlyPackages);
}, [nannyCartItems, open]); // Added 'open' to dependencies

  const handleLogin = () => setLoginOpen(true);
  const handleLoginClose = () => setLoginOpen(false);
  const handleBookingPage = () => setLoginOpen(false);

  const handleBabyAgeChange = (packageType: keyof typeof babyPackages, value: number) => {
    setBabyPackages(prev => ({
      ...prev,
      [packageType]: {
        ...prev[packageType],
        age: Math.max(0, prev[packageType].age + value)
      }
    }));
  };

  const handleElderlyAgeChange = (packageType: keyof typeof elderlyPackages, value: number) => {
    setElderlyPackages(prev => ({
      ...prev,
      [packageType]: {
        ...prev[packageType],
        age: Math.max(0, prev[packageType].age + value)
      }
    }));
  };

  const togglePackageSelection = (packageType: string, isBaby: boolean) => {
    if (isBaby) {
      setBabyPackages(prev => ({
        ...prev,
        [packageType]: {
          ...prev[packageType as keyof typeof prev],
          selected: !prev[packageType as keyof typeof prev].selected
        }
      }));
    } else {
      setElderlyPackages(prev => ({
        ...prev,
        [packageType]: {
          ...prev[packageType as keyof typeof prev],
          selected: !prev[packageType as keyof typeof prev].selected
        }
      }));
    }
  };

 const handleAddToCart = (packageKey: string) => {
  try {
    let type: 'baby' | 'elderly';
    let packageType: 'day' | 'night' | 'fullTime';

    if (packageKey.startsWith('baby')) {
      type = 'baby';
      packageType = packageKey.replace('baby', '').charAt(0).toLowerCase() + 
                   packageKey.replace('baby', '').slice(1) as 'day' | 'night' | 'fullTime';
    } else if (packageKey.startsWith('elderly')) {
      type = 'elderly';
      packageType = packageKey.replace('elderly', '').charAt(0).toLowerCase() + 
                   packageKey.replace('elderly', '').slice(1) as 'day' | 'night' | 'fullTime';
    } else {
      console.error('Invalid package key:', packageKey);
      return;
    }

    const packages = type === 'baby' ? babyPackages : elderlyPackages;
    const packageDetails = packages[packageType];

    if (!packageDetails) {
      console.error('Package details not found for:', packageKey);
      return;
    }

    const age = packageDetails.age;
    const price = getPackagePrice(type, packageType);
    const description = getPackageDescription(type, packageType);

    const cartItem = {
      id: `${type}_${packageType}_${providerDetails?.serviceproviderId || 'default'}`,
      type: 'nanny' as const,
      careType: type,
      packageType,
      age,
      price,
      description,
      providerId: providerDetails?.serviceproviderId || '',
      providerName: providerFullName
    };

    const isInCart = cartItems[packageKey];
    
    if (isInCart) {
      dispatch(removeFromCart({ id: cartItem.id, type: 'nanny' }));
    } else {
      dispatch(addToCart(cartItem));
    }

    // Update all states atomically
    setCartItems(prev => ({
      ...prev,
      [packageKey]: !isInCart
    }));

    if (type === 'baby') {
      setBabyPackages(prev => ({
        ...prev,
        [packageType]: {
          ...prev[packageType],
          selected: !isInCart
        }
      }));
    } else {
      setElderlyPackages(prev => ({
        ...prev,
        [packageType]: {
          ...prev[packageType],
          selected: !isInCart
        }
      }));
    }

  } catch (error) {
    console.error('Error in handleAddToCart:', error);
    setError('Failed to update cart. Please try again.');
  }
};

  const getPackagePrice = (type: 'baby' | 'elderly', packageType: string): number => {
    const prices = {
      baby: {
        day: 16000,
        night: 20000,
        fullTime: 23000
      },
      elderly: {
        day: 16000,
        night: 20000,
        fullTime: 23000
      }
    };

    return prices[type]?.[packageType] || 0;
  };

  const getPackageDescription = (type: 'baby' | 'elderly', packageType: string): string => {
    const descriptions = {
      baby: {
        day: 'Professional daytime baby care',
        night: 'Professional overnight baby care',
        fullTime: 'Round-the-clock professional baby care'
      },
      elderly: {
        day: 'Professional daytime elderly care',
        night: 'Professional overnight elderly care',
        fullTime: 'Round-the-clock professional elderly care'
      }
    };

    return descriptions[type]?.[packageType] || '';
  };

  const calculateTotal = () => {
    let total = 0;
    if (activeTab === 'baby') {
      if (babyPackages.day.selected) total += 16000;
      if (babyPackages.night.selected) total += 20000;
      if (babyPackages.fullTime.selected) total += 23000;
    } else {
      if (elderlyPackages.day.selected) total += 16000;
      if (elderlyPackages.night.selected) total += 20000;
      if (elderlyPackages.fullTime.selected) total += 23000;
    }
    return total;
  };

  const getSelectedPackagesCount = () => {
    if (activeTab === 'baby') {
      return Object.values(babyPackages).filter(pkg => pkg.selected).length;
    } else {
      return Object.values(elderlyPackages).filter(pkg => pkg.selected).length;
    }
  };

  const handleApplyVoucher = () => {
    // Voucher logic here
  };
 const getBookingTypeFromPreference = (bookingPreference: string | undefined): string => {
    if (!bookingPreference) return 'MONTHLY'; // default
    
    const pref = bookingPreference.toLowerCase();
    if (pref === 'date') return 'ON_DEMAND';
    if (pref === 'short term') return 'SHORT_TERM';
    return 'MONTHLY';
  };
  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const totalAmount = calculateTotal();
      if (totalAmount === 0) {
        throw new Error('Please select at least one service');
      }

      const bookingData: BookingDetails = {
        serviceProviderId: providerDetails?.serviceproviderId ? Number(providerDetails.serviceproviderId) : 0,
        serviceProviderName: providerFullName,
        customerId: customerId,
        customerName: customerName, 
        address: " Durgapur, West Bengal 713205, India",
        startDate: bookingType?.startDate || new Date().toISOString().split('T')[0],
        endDate: bookingType?.endDate || "",
        engagements: getSelectedServicesDescription(),
        monthlyAmount: totalAmount,
        timeslot: bookingType?.timeRange || "",
        paymentMode: "UPI",
        bookingType: getBookingTypeFromPreference(bookingType?.bookingPreference),
        taskStatus: "NOT_STARTED",
        serviceType: "NANNY",
        responsibilities: []
      };

      try {
        const orderResponse = await createRazorpayOrder(totalAmount);
        await handlePaymentSuccess(orderResponse.data.orderId, bookingData);
      } catch (backendError) {
        console.warn("Backend order creation failed, falling back to client-side", backendError);
        await createClientSideOrder(totalAmount, bookingData);
      }

    } catch (err: any) {
      handlePaymentError(err);
    } finally {
      setLoading(false);
    }
  };
  const customerName = user?.name || "Guest";
  const customerId = user?.customerid || "guest-id";

  const createRazorpayOrder = async (amount: number) => {
    return await axios.post(
      "https://utils-ndt3.onrender.com/create-order",
      { 
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1
      },
      { 
        headers: { "Content-Type": "application/json" },
        timeout: 8000
      }
    );
  };

  const createClientSideOrder = async (amount: number, bookingData: BookingDetails) => {
    return new Promise((resolve, reject) => {
      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key: "rzp_test_lTdgjtSRlEwreA",
        amount: amount * 100,
        currency: "INR",
        name: "Serveaso",
        description: "Nanny Services Booking",
        handler: async (response: any) => {
          try {
            await handlePaymentSuccess(response.razorpay_order_id, bookingData);
            resolve(response);
          } catch (err) {
            reject(err);
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
        modal: {
          ondismiss: () => {
            reject(new Error("Payment closed by user"));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handlePaymentSuccess = async (orderId: string, bookingData: BookingDetails) => {
    try {
      const bookingResponse = await axiosInstance.post(
        "/api/serviceproviders/engagement/add",
        {
          ...bookingData,
          paymentReference: orderId
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (bookingResponse.status === 201) {
        try {
          const notifyResponse = await fetch(
            "http://localhost:4000/send-notification",
            {
              method: "POST",
              body: JSON.stringify({
                title: "Hello from ServEaso!",
                body: `Your booking for ${bookingData.engagements} has been successfully confirmed!`,
                url: "http://localhost:3000",
              }),
              headers: { "Content-Type": "application/json" },
            }
          );

          if (notifyResponse.ok) {
            console.log("Notification triggered!");
          }
        } catch (error) {
          console.error("Error sending notification:", error);
        }

        if (sendDataToParent) sendDataToParent(BOOKINGS);
        handleClose();
      }
    } catch (err) {
      console.error("Error saving booking:", err);
      throw new Error("Payment succeeded but booking failed. Please contact support.");
    }
  };

  const handlePaymentError = (err: any) => {
    console.error("Payment error:", err);
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        "Payment failed. Please try again later.";
    setError(errorMessage);
  };

  const getSelectedServicesDescription = () => {
    const selectedPackages = activeTab === 'baby' 
      ? Object.entries(babyPackages).filter(([_, pkg]) => pkg.selected)
      : Object.entries(elderlyPackages).filter(([_, pkg]) => pkg.selected);
    
    return selectedPackages.map(([pkgType, pkg]) => 
      `${activeTab === 'baby' ? 'Baby' : 'Elderly'} care (${pkgType}) for age ≤${pkg.age}`
    ).join(', ');
  };

  const renderBabyPackage = (packageType: 'day' | 'night' | 'fullTime') => {
    const packageData = babyPackages[packageType];
    const packageKey = `baby${packageType.charAt(0).toUpperCase() + packageType.slice(1)}`;
    let color = '#e17055';
    let price = '₹16,000 - ₹17,600';
    let reviews = '(1.5M reviews)';
    let rating = 4.8;
    let descriptionItems = [
      'Professional daytime baby care',
      'Age-appropriate activities',
      'Meal preparation and feeding'
    ];

    if (packageType === 'night') {
      color = '#00b894';
      price = '₹20,000 - ₹22,000';
      reviews = '(1.2M reviews)';
      rating = 4.9;
      descriptionItems = [
        'Professional overnight baby care',
        'Night feeding and diaper changes',
        'Sleep routine establishment'
      ];
    } else if (packageType === 'fullTime') {
      color = '#0984e3';
      price = '₹23,000 - ₹25,000';
      reviews = '(980K reviews)';
      rating = 4.9;
      descriptionItems = [
        'Round-the-clock professional care',
        'All daily care activities included',
        'Live-in nanny service'
      ];
    }

    return (
      <PackageCard key={packageType} selected={packageData.selected}>
        <PackageHeader>
          <div>
            <PackageTitle>Baby Care - {packageType.charAt(0).toUpperCase() + packageType.slice(1)}</PackageTitle>
            <RatingContainer>
              <RatingValue color={color}>{rating}</RatingValue>
              <ReviewsText>{reviews}</ReviewsText>
            </RatingContainer>
          </div>
          <PriceContainer>
            <PriceValue color={color}>{price}</PriceValue>
            <CareType>
              {packageType === 'day' ? 'Daytime care' : 
               packageType === 'night' ? 'Overnight care' : 'Full-time care'}
            </CareType>
          </PriceContainer>
        </PackageHeader>
        
        <PersonsControl>
          <PersonsLabel>Age:</PersonsLabel>
          <PersonsInput>
            <DecrementButton 
              onClick={() => handleBabyAgeChange(packageType, -1)}
            >
              -
            </DecrementButton>
            <PersonsValue>≤{packageData.age}</PersonsValue>
            <IncrementButton 
              onClick={() => handleBabyAgeChange(packageType, 1)}
            >
              +
            </IncrementButton>
          </PersonsInput>
        </PersonsControl>
        
        <DescriptionList>
          {descriptionItems.map((item, index) => (
            <DescriptionItem key={index}>
              <DescriptionBullet>•</DescriptionBullet>
              <span>{item}</span>
            </DescriptionItem>
          ))}
        </DescriptionList>
        
        <ButtonsContainer> 
          <CartButton 
            inCart={cartItems[packageKey]}
            color={color}
            onClick={() => handleAddToCart(packageKey)}
          >
            {cartItems[packageKey] ? (
              <>
                <RemoveShoppingCartIcon fontSize="small" />
                ADDED TO CART
              </>
            ) : (
              <>
                <AddShoppingCartIcon fontSize="small" />
                ADD TO CART
              </>
            )}
          </CartButton>
        </ButtonsContainer>
      </PackageCard>
    );
  };

  const renderElderlyPackage = (packageType: 'day' | 'night' | 'fullTime') => {
    const packageData = elderlyPackages[packageType];
    const packageKey = `elderly${packageType.charAt(0).toUpperCase() + packageType.slice(1)}`;
    let color = '#e17055';
    let price = '₹16,000 - ₹17,600';
    let reviews = '(1.1M reviews)';
    let rating = 4.7;
    let descriptionItems = [
      'Professional daytime elderly care',
      'Medication management',
      'Meal preparation and assistance'
    ];

    if (packageType === 'night') {
      color = '#00b894';
      price = '₹20,000 - ₹22,000';
      reviews = '(950K reviews)';
      rating = 4.8;
      descriptionItems = [
        'Professional overnight elderly care',
        'Night-time assistance and monitoring',
        'Sleep comfort and safety'
      ];
    } else if (packageType === 'fullTime') {
      color = '#0984e3';
      price = '₹23,000 - ₹25,000';
      reviews = '(850K reviews)';
      rating = 4.9;
      descriptionItems = [
        'Round-the-clock professional care',
        'All daily care activities included',
        'Live-in caregiver service'
      ];
    }

    return (
      <PackageCard key={packageType} selected={packageData.selected}>
        <PackageHeader>
          <div>
            <PackageTitle>Elderly Care - {packageType.charAt(0).toUpperCase() + packageType.slice(1)}</PackageTitle>
            <RatingContainer>
              <RatingValue color={color}>{rating}</RatingValue>
              <ReviewsText>{reviews}</ReviewsText>
            </RatingContainer>
          </div>
          <PriceContainer>
            <PriceValue color={color}>{price}</PriceValue>
            <CareType>
              {packageType === 'day' ? 'Daytime care' : 
               packageType === 'night' ? 'Overnight care' : 'Full-time care'}
            </CareType>
          </PriceContainer>
        </PackageHeader>
        
        <PersonsControl>
          <PersonsLabel>Age:</PersonsLabel>
          <PersonsInput>
            <DecrementButton 
              onClick={() => handleElderlyAgeChange(packageType, -1)}
            >
              -
            </DecrementButton>
            <PersonsValue>≤{packageData.age}</PersonsValue>
            <IncrementButton 
              onClick={() => handleElderlyAgeChange(packageType, 1)}
            >
              +
            </IncrementButton>
          </PersonsInput>
        </PersonsControl>
        
        <DescriptionList>
          {descriptionItems.map((item, index) => (
            <DescriptionItem key={index}>
              <DescriptionBullet>•</DescriptionBullet>
              <span>{item}</span>
            </DescriptionItem>
          ))}
        </DescriptionList>
        
        <ButtonsContainer>
          <CartButton 
            inCart={cartItems[packageKey]}
            color={color}
            onClick={() => handleAddToCart(packageKey)}
          >
            {cartItems[packageKey] ? (
              <>
                <RemoveShoppingCartIcon fontSize="small" />
                ADDED TO CART
              </>
            ) : (
              <>
                <AddShoppingCartIcon fontSize="small" />
                ADD TO CART
              </>
            )}
          </CartButton>
        </ButtonsContainer>
      </PackageCard>
    );
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
  <h1> ❤️Caregiver Service</h1>
  <CloseButton 
    aria-label="close" 
    onClick={handleClose}
    size="small"
  >
    <CloseIcon />
  </CloseButton>
  <TabContainer>
  <TabButton 
    onClick={() => setActiveTab('baby')}
    active={activeTab === 'baby'}
  >
    <TabIndicator active={activeTab === 'baby'}>
      Baby Care
    </TabIndicator>
  </TabButton>
  <TabButton 
    onClick={() => setActiveTab('elderly')}
    active={activeTab === 'elderly'}
  >
    <TabIndicator active={activeTab === 'elderly'}>
      Elderly Care
    </TabIndicator>
  </TabButton>
</TabContainer>
</DialogHeader>
            
            <PackagesContainer>
              {activeTab === 'baby' ? (
                <>
                  {renderBabyPackage('day')}
                  {renderBabyPackage('night')}
                  {renderBabyPackage('fullTime')}
                </>
              ) : (
                <>
                  {renderElderlyPackage('day')}
                  {renderElderlyPackage('night')}
                  {renderElderlyPackage('fullTime')}
                </>
              )}
            </PackagesContainer>
            
            <VoucherContainer>
              <VoucherTitle>Apply Voucher</VoucherTitle>
              <VoucherInputContainer>
                <VoucherInput
                  type="text"
                  placeholder="Enter voucher code"
                />
                <VoucherButton onClick={handleApplyVoucher}>
                  APPLY
                </VoucherButton>
              </VoucherInputContainer>
            </VoucherContainer>
            
            <FooterContainer>
              <div>
                <FooterText>
                  Total for {getSelectedPackagesCount()} service{getSelectedPackagesCount() !== 1 ? 's' : ''}
                </FooterText>
                <FooterPrice>₹{calculateTotal().toLocaleString()}</FooterPrice>
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
      onClick={handleCheckout}
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

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NannyServicesDialog;