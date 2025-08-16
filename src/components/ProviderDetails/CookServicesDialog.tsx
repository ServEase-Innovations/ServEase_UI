/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { EnhancedProviderDetails } from '../../types/ProviderDetailsType';
import { useDispatch, useSelector } from 'react-redux';
import { BookingDetails } from '../../types/engagementRequest';
import { BOOKINGS } from '../../Constants/pagesConstants';
import { Dialog, DialogContent, DialogTitle, DialogActions, Tooltip, IconButton, Checkbox, FormControlLabel, Typography, Box, CircularProgress } from '@mui/material';
import Login from '../Login/Login';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axiosInstance from '../../services/axiosInstance';
import { usePricingFilterService } from '../../utils/PricingFilter';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { addToCart, removeFromCart, updateCartItem } from '../../features/addToCart/addToSlice';
import { MealPackage } from '../../types/mealPackage';
import { StyledDialog, StyledDialogContent, DialogContainer, DialogHeader, PackagesContainer, PackageCard, PackageHeader, PackageTitle, RatingContainer, RatingValue, ReviewsText, PriceContainer, PriceValue, PreparationTime, PersonsControl, PersonsLabel, PersonsInput, DecrementButton, IncrementButton, PersonsValue, AdditionalCharges, DescriptionList, DescriptionItem, DescriptionBullet, ButtonsContainer, CartButton, SelectButton, VoucherContainer, VoucherTitle, VoucherInputContainer, VoucherInput, VoucherButton, FooterContainer, FooterText, FooterPrice, FooterButtons, LoginButton, CheckoutButton, CloseButton } from './CookServicesDialog.styles';
import { Button } from "../Button/button";
import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from '@mui/icons-material/Close';
import { CartDialog } from '../AddToCart/CartDialog';


interface CookServicesDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

interface PackagesState {
  [key: string]: MealPackage;
}

const CookServicesDialog: React.FC<CookServicesDialogProps> = ({ 
  open, 
  handleClose, 
  providerDetails,
  sendDataToParent
}) => {
  const dispatch = useDispatch();
  const users = useSelector((state: any) => state.user?.value);
  const pricing = useSelector((state: any) => state.pricing?.groupedServices);
  const [packages, setPackages] = useState<PackagesState>({});
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loginWithRedirect, isAuthenticated } = useAuth0();
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;
  const { getBookingType, getPricingData, getFilteredPricing } = usePricingFilterService();
  const bookingType = getBookingType();
  const currentLocation = users?.customerDetails?.currentLocation;

  // Calculate price based on number of persons
  const calculatePriceForPersons = (basePrice: number, persons: number): number => {
    if (persons <= 3) return basePrice;
    if (persons > 3 && persons <= 6) return basePrice + basePrice * 0.2 * (persons - 3);
    if (persons > 6 && persons <= 9) {
      const priceFor6 = basePrice + basePrice * 0.2 * 3;
      return priceFor6 + priceFor6 * 0.1 * (persons - 6);
    }
    const priceFor6 = basePrice + basePrice * 0.2 * 3;
    const priceFor9 = priceFor6 + priceFor6 * 0.1 * 3;
    return priceFor9 + priceFor9 * 0.05 * (persons - 9);
  };

  // Initialize packages
  useEffect(() => {
    const updatedCookServices = getFilteredPricing("cook");
    
    if (!updatedCookServices || updatedCookServices.length === 0) {
      setPackages({});
      return;
    }

    const initialPackages: PackagesState = {};
    updatedCookServices.forEach((service: any) => {
      const category = service.Categories.toLowerCase();
      const maxPersons = parseInt(service["Numbers/Size"].replace('<=', '')) || 3;
      const basePrice = bookingType?.bookingPreference?.toLowerCase() === "date" 
        ? service["Price /Day (INR)"] 
        : service["Price /Month (INR)"];

      initialPackages[category] = {
        selected: false,
        persons: 1,
        basePrice,
        calculatedPrice: basePrice,
        maxPersons,
        description: service["Job Description"].split('\n').filter((line: string) => line.trim() !== ''),
        preparationTime: getPreparationTime(category),
        rating: 4.84,
        reviews: getReviewsText(category),
        category: service.Categories,
        jobDescription: service["Job Description"],
        remarks: service["Remarks/Conditions"],
        inCart: false
      };
    });

    setPackages(initialPackages);
  }, [pricing, bookingType]);

  // Helper functions
  const getPreparationTime = (category: string): string => {
    switch(category) {
      case 'breakfast': return '30 mins preparation';
      case 'lunch': return '45 mins preparation';
      case 'dinner': return '1.5 hrs preparation';
      default: return '30 mins preparation';
    }
  };

  const getReviewsText = (category: string): string => {
    switch(category) {
      case 'breakfast': return '(2.9M reviews)';
      case 'lunch': return '(1.7M reviews)';
      case 'dinner': return '(2.7M reviews)';
      default: return '(1M reviews)';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch(category.toLowerCase()) {
      case 'breakfast': return '#e17055';
      case 'lunch': return '#00b894';
      case 'dinner': return '#0984e3';
      default: return '#2d3436';
    }
  };

  // Person change handler
  const handlePersonChange = (packageName: string, operation: 'increment' | 'decrement') => {
    setPackages(prev => {
      const currentPackage = prev[packageName];
      if (!currentPackage) return prev;

      let newValue = currentPackage.persons;
      if (operation === 'increment') newValue += 1;
      else if (operation === 'decrement' && newValue > 1) newValue -= 1;
      
      return {
        ...prev,
        [packageName]: {
          ...currentPackage,
          persons: newValue,
          calculatedPrice: calculatePriceForPersons(currentPackage.basePrice, newValue)
        }
      };
    });
  };

  // Toggle cart item
  const toggleCart = (packageName: string) => {
    setPackages(prev => {
      const currentPackage = prev[packageName];
      if (!currentPackage) return prev;

      const newInCartState = !currentPackage.inCart;
      
      if (newInCartState) {
        dispatch(addToCart({
          type: 'meal',
          id: packageName.toUpperCase(),
          mealType: packageName.toUpperCase(),
          persons: currentPackage.persons,
          price: currentPackage.calculatedPrice,
          description: currentPackage.description.join(', '),
          basePrice: currentPackage.basePrice,
          maxPersons: currentPackage.maxPersons
        }));
      } else {
        dispatch(removeFromCart({
          id: packageName.toUpperCase(),
          type: 'meal'
        }));
      }

      return {
        ...prev,
        [packageName]: {
          ...currentPackage,
          inCart: newInCartState,
          selected: newInCartState
        }
      };
    });
  };

  // Prepare cart for checkout (clear old and add new)
  const prepareCartForCheckout = () => {
    // Clear all existing cart items
    dispatch(removeFromCart({ type: 'meal' }));
    dispatch(removeFromCart({ type: 'maid' }));
    dispatch(removeFromCart({ type: 'nanny' }));

    // Add only the currently selected packages
    Object.entries(packages).forEach(([packageName, pkg]) => {
      if (pkg.selected) {
        dispatch(addToCart({
          type: 'meal',
          id: packageName.toUpperCase(),
          mealType: packageName.toUpperCase(),
          persons: pkg.persons,
          price: pkg.calculatedPrice,
          description: pkg.description.join(', '),
          basePrice: pkg.basePrice,
          maxPersons: pkg.maxPersons
        }));
      }
    });
  };

  // Open cart dialog handler
  const handleOpenCartDialog = () => {
    const selectedPackages = Object.entries(packages).filter(([_, pkg]) => pkg.selected);
    if (selectedPackages.length === 0) {
      alert("Please select at least one package");
      return;
    }

    prepareCartForCheckout();
    setCartDialogOpen(true);
  };

  // Checkout handler (Razorpay payment)
 const handleCheckout = async () => {
  try {
    setLoading(true);
    const selectedPackages = Object.entries(packages)
      .filter(([_, pkg]) => pkg.selected)
      .map(([name, pkg]) => ({
        mealType: name.toUpperCase(),
        persons: pkg.persons,
        price: pkg.calculatedPrice,
      }));

    const totalAmount = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
    const customerName = user?.name || "Guest";
    const customerId = user?.customerid || "guest-id";
    
    // First create the Razorpay order with initial amount
    const response = await axios.post(
      "https://utils-ndt3.onrender.com/create-order",
      { amount: totalAmount * 100 },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200 && response.data.success) {
      const orderId = response.data.orderId;
      const amount = totalAmount * 100;
      const currency = "INR";

      const bookingDetails: BookingDetails = {
        serviceProviderId: providerDetails?.serviceproviderId ? Number(providerDetails.serviceproviderId) : 0,
        serviceProviderName: providerFullName,
        customerId: customerId,
        customerName: customerName,
        startDate: bookingType?.startDate || new Date().toISOString().split('T')[0],
        endDate: bookingType?.endDate || "",
        engagements: selectedPackages.map(pkg => `${pkg.mealType} for ${pkg.persons} persons`).join(", "),
        address: currentLocation,
        timeslot: bookingType?.timeRange || "",
        monthlyAmount: totalAmount,
        paymentMode: "UPI",
        bookingType: getBookingTypeFromPreference(bookingType?.bookingPreference),
        taskStatus: "NOT_STARTED",
        serviceType: "COOK",
        responsibilities: [],
      };

      const options = {
        key: "rzp_test_lTdgjtSRlEwreA",
        amount,
        currency,
        name: "Serveaso",
        description: "Meal Package Booking",
        order_id: orderId,
        handler: async function (razorpayResponse: any) {
          try {
            // 1. First save the booking
            const bookingResponse = await axiosInstance.post(
              "/api/serviceproviders/engagement/add",
              bookingDetails
            );

            if (bookingResponse.status === 201) {
              // 2. Then calculate payment details
              const calculatePaymentResponse = await axiosInstance.post(
                "/api/payments/calculate-payment",
                null, // no body for POST with query params
                {
                  params: {
                    customerId: customerId,
                    baseAmount: totalAmount,
                    startDate_P: bookingDetails.startDate,
                    endDate_P: bookingDetails.endDate,
                    paymentMode: bookingDetails.paymentMode,
                    serviceType: bookingDetails.serviceType,
                    // couponId: couponId // uncomment if you have coupon functionality
                  }
                }
              );

              // You can use the calculated payment details for record keeping or further processing
              const paymentDetails = calculatePaymentResponse.data;

              // 3. Clear cart after successful payment
              dispatch(removeFromCart({ type: 'meal' }));
              dispatch(removeFromCart({ type: 'maid' }));
              dispatch(removeFromCart({ type: 'nanny' }));

              // 4. Send notification with proper error handling
              try {
                const notificationResponse = await fetch("http://localhost:4000/send-notification", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    title: "Booking Confirmed",
                    message: `Your booking for ${bookingDetails.engagements} has been confirmed!`,
                    userId: customerId,
                    redirectUrl: "http://localhost:3000/bookings",
                  }),
                });

                if (!notificationResponse.ok) {
                  throw new Error('Notification failed');
                }
              } catch (notificationError) {
                console.error("Notification error:", notificationError);
                // Continue even if notification fails
              }

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

  const getBookingTypeFromPreference = (bookingPreference: string | undefined): string => {
    if (!bookingPreference) return 'MONTHLY';
    const pref = bookingPreference.toLowerCase();
    if (pref === 'date') return 'ON_DEMAND';
    if (pref === 'short term') return 'SHORT_TERM';
    return 'MONTHLY';
  };

  // Render package sections
  const renderPackageSections = () => {
    return Object.entries(packages).map(([packageName, pkg]) => {
      const categoryColor = getCategoryColor(packageName);

      return (
        <PackageCard key={packageName} selected={pkg.selected} color={categoryColor}>
          <PackageHeader>
            <div>
              <PackageTitle>{packageName}</PackageTitle>
              <RatingContainer>
                <RatingValue color={categoryColor}>{pkg.rating}</RatingValue>
                <ReviewsText>{pkg.reviews}</ReviewsText>
              </RatingContainer>
            </div>
            <PriceContainer>
              <PriceValue color={categoryColor}>₹{pkg.calculatedPrice.toFixed(2)}</PriceValue>
              <PreparationTime>{pkg.preparationTime}</PreparationTime>
            </PriceContainer>
          </PackageHeader>
          
          <PersonsControl>
            <PersonsLabel>Persons:</PersonsLabel>
            <PersonsInput>
              <DecrementButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePersonChange(packageName, 'decrement');
                }}
                disabled={pkg.persons <= 1}
              >
                -
              </DecrementButton>
              <PersonsValue>{pkg.persons}</PersonsValue>
              <IncrementButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePersonChange(packageName, 'increment');
                }}
                disabled={pkg.persons >= 15}
              >
                +
              </IncrementButton>
            </PersonsInput>
            {pkg.persons > pkg.maxPersons && (
              <AdditionalCharges>*Additional charges applied</AdditionalCharges>
            )}
          </PersonsControl>
          
          <DescriptionList>
            {pkg.description.map((item, index) => (
              item.trim() && (
                <DescriptionItem key={index}>
                  <DescriptionBullet>•</DescriptionBullet>
                  <span>{item.trim()}</span>
                </DescriptionItem>
              )
            ))}
          </DescriptionList>
          
          <ButtonsContainer>
            <CartButton 
              inCart={pkg.inCart}
              color={categoryColor}
              onClick={(e) => {
                e.stopPropagation();
                toggleCart(packageName);
              }}
            >
              {pkg.inCart ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
              {pkg.inCart ? 'ADDED TO CART' : 'ADD TO CART'}
            </CartButton>
          </ButtonsContainer>
        </PackageCard>
      );
    });
  };

  const selectedPackages = Object.entries(packages).filter(([_, pkg]) => pkg.selected);
  const totalItems = selectedPackages.length;
  const totalPersons = selectedPackages.reduce((sum, [_, pkg]) => sum + pkg.persons, 0);
  const totalPrice = selectedPackages.reduce((sum, [_, pkg]) => sum + pkg.calculatedPrice, 0);

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
              <h1>👩‍🍳Home Cook</h1>
              <CloseButton aria-label="close" onClick={handleClose} size="small">
                <CloseIcon />
              </CloseButton>
            </DialogHeader>         
            <PackagesContainer>
              {renderPackageSections()}
            </PackagesContainer>
            
            <VoucherContainer>
              <VoucherTitle>Apply Voucher</VoucherTitle>
              <VoucherInputContainer>
                <VoucherInput type="text" placeholder="Enter voucher code" />
                <VoucherButton >APPLY</VoucherButton>
              </VoucherInputContainer>
            </VoucherContainer>
            
            <FooterContainer>
              <div>
                <FooterText>
                  Total for {totalItems} item{totalItems !== 1 ? 's' : ''} ({totalPersons} person{totalPersons !== 1 ? 's' : ''})
                </FooterText>
                <FooterPrice>₹{totalPrice.toFixed(2)}</FooterPrice>
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
                    disabled={totalItems === 0}
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

export default CookServicesDialog;