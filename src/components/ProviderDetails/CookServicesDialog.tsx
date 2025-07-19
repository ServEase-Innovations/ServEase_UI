/* eslint-disable */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { EnhancedProviderDetails } from '../../types/ProviderDetailsType';
import { useDispatch, useSelector } from 'react-redux';
import { BookingDetails } from '../../types/engagementRequest';
import { BOOKINGS } from '../../Constants/pagesConstants';
import { Dialog, DialogContent, Tooltip, IconButton } from '@mui/material';
import Login from '../Login/Login';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axiosInstance from '../../services/axiosInstance';
import { usePricingFilterService } from '../../utils/PricingFilter';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { addToCart, removeFromCart, updateCartItem } from '../../features/addToCart/addToSlice';
import { MealPackage } from '../../types/mealPackage';
import { StyledDialog, StyledDialogContent, DialogContainer, DialogHeader, PackagesContainer, PackageCard, PackageHeader, PackageTitle, RatingContainer, RatingValue, ReviewsText, PriceContainer, PriceValue, PreparationTime, PersonsControl, PersonsLabel, PersonsInput, DecrementButton, IncrementButton, PersonsValue, AdditionalCharges, DescriptionList, DescriptionItem, DescriptionBullet, ButtonsContainer, CartButton, SelectButton, VoucherContainer, VoucherTitle, VoucherInputContainer, VoucherInput, VoucherButton, FooterContainer, FooterText, FooterPrice, FooterButtons, LoginButton, CheckoutButton } from './CookServicesDialog.styles';
import { Button } from "../Button/button";


import { useAuth0 } from "@auth0/auth0-react";
 

 


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
  const cart = useSelector((state: any) => state.addToCart?.items || []);
  const { getBookingType, getPricingData, getFilteredPricing } = usePricingFilterService();
  const bookingType = getBookingType();
  console.log("bookingType",bookingType)
  const currentLocation = users?.customerDetails?.currentLocation;
  const firstName = users?.customerDetails?.firstName;
  const lastName = users?.customerDetails?.lastName;
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;
 const { user, isAuthenticated} =  useAuth0();
   useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User Info:", user);
       console.log("Name:", user.name);
      console.log("Customer ID:", user.customerid);
    }
  }, [isAuthenticated, user]);
  
  
  const bookingDetails: BookingDetails = {
    serviceProviderId: 0,
    serviceProviderName: "",
    customerId: 0,
    customerName: "", 
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    engagements: "",
    address: "",
    timeslot: "",
    monthlyAmount: 0,
    paymentMode: "UPI",
    bookingType: "MEAL_PACKAGE",
    taskStatus: "NOT_STARTED", 
    responsibilities: [],
  };

  const calculatePriceForPersons = (basePrice: number, persons: number): number => {
    if (persons <= 3) {
      return basePrice;
    } else if (persons > 3 && persons <= 6) {
      const extraPeople = persons - 3;
      return basePrice + basePrice * 0.2 * extraPeople;
    } else if (persons > 6 && persons <= 9) {
      const priceFor6 = basePrice + basePrice * 0.2 * 3;
      const extraPeople = persons - 6;
      return priceFor6 + priceFor6 * 0.1 * extraPeople;
    } else if (persons > 9) {
      const priceFor6 = basePrice + basePrice * 0.2 * 3;
      const priceFor9 = priceFor6 + priceFor6 * 0.1 * 3;
      const extraPeople = persons - 9;
      return priceFor9 + priceFor9 * 0.05 * extraPeople;
    }
    return basePrice;
  };

  const cookServices = useMemo(() => getFilteredPricing("cook"), [getFilteredPricing]);

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
      let basePrice = 0;
      if(bookingType?.bookingPreference?.toLowerCase() === "date") {
        basePrice = service["Price /Day (INR)"];
      } else {
        basePrice = service["Price /Month (INR)"];
      }
      const cartItem = Array.isArray(cart) 
        ? cart.find((item: any) => 
            item.type === 'meal' && 
            item.mealType.toLowerCase() === category
          )
        : null;
      
      initialPackages[category] = {
        selected: !!cartItem,
        persons: cartItem?.persons || 1,
        basePrice,
        calculatedPrice: cartItem ? cartItem.price : calculatePriceForPersons(basePrice, 1),
        maxPersons,
        description: service["Job Description"]
          .split('\n')
          .filter((line: string) => line.trim() !== ''),
        preparationTime: getPreparationTime(category),
        rating: 4.84,
        reviews: getReviewsText(category),
        category: service.Categories,
        jobDescription: service["Job Description"],
        remarks: service["Remarks/Conditions"],
        inCart: !!cartItem
      };
    });

    setPackages(initialPackages);
  }, [pricing, bookingType, cart]);

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      setLoggedInUser(user);
    }
  }, [user]);

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

  const handleLogin = () => {
    setLoginOpen(true);
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
  };

  const handleBookingPage = () => {
    setLoginOpen(false);
  };

  const handlePersonChange = (packageName: string, operation: 'increment' | 'decrement') => {
    setPackages(prev => {
      const currentPackage = prev[packageName];
      if (!currentPackage) return prev;

      let newValue = currentPackage.persons;
      
      if (operation === 'increment') {
        newValue += 1;
      } else if (operation === 'decrement' && newValue > 1) {
        newValue -= 1;
      }
      
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

  const togglePackageSelection = (packageName: string) => {
    setPackages(prev => {
      const currentPackage = prev[packageName];
      if (!currentPackage) return prev;

      const newSelectedState = !currentPackage.selected;
      const shouldBeInCart = newSelectedState;
      if (shouldBeInCart && !currentPackage.inCart) {
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
      } else if (!shouldBeInCart && currentPackage.inCart) {
        dispatch(removeFromCart({
          id: packageName.toUpperCase(),
          type: 'meal'
        }));
      }

      return {
        ...prev,
        [packageName]: {
          ...currentPackage,
          selected: newSelectedState,
          inCart: shouldBeInCart
        }
      };
    });
  };

  // In the toggleCart function, replace with this updated version:
const toggleCart = (packageName: string) => {
  setPackages(prev => {
    const currentPackage = prev[packageName];
    if (!currentPackage) return prev;

    const newInCartState = !currentPackage.inCart;
    const shouldBeSelected = newInCartState;

    if (newInCartState) {
      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex(
        (item: any) => 
          item.type === 'meal' && 
          item.id === packageName.toUpperCase()
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        dispatch(updateCartItem({
          id: packageName.toUpperCase(),
          type: 'meal',
          updates: {
            persons: currentPackage.persons,
            price: currentPackage.calculatedPrice,
            description: currentPackage.description.join(', '),
            basePrice: currentPackage.basePrice,
            maxPersons: currentPackage.maxPersons
          }
        }));
      } else {
        // Add new item
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
      }
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
        selected: shouldBeSelected
      }
    };
  });
};

// And in the useEffect that initializes packages, update it to properly sync with cart:
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
    let basePrice = 0;
    if(bookingType?.bookingPreference?.toLowerCase() === "date") {
      basePrice = service["Price /Day (INR)"];
    } else {
      basePrice = service["Price /Month (INR)"];
    }

    // Find existing cart item and get current person count
    const cartItem = Array.isArray(cart) 
      ? cart.find((item: any) => 
          item.type === 'meal' && 
          item.mealType.toLowerCase() === category
        )
      : null;
    
    const persons = cartItem?.persons || 1;
    const calculatedPrice = calculatePriceForPersons(basePrice, persons);

    initialPackages[category] = {
      selected: !!cartItem,
      persons,
      basePrice,
      calculatedPrice,
      maxPersons,
      description: service["Job Description"]
        .split('\n')
        .filter((line: string) => line.trim() !== ''),
      preparationTime: getPreparationTime(category),
      rating: 4.84,
      reviews: getReviewsText(category),
      category: service.Categories,
      jobDescription: service["Job Description"],
      remarks: service["Remarks/Conditions"],
      inCart: !!cartItem
    };
  });

  setPackages(initialPackages);
}, [pricing, bookingType, cart]);

  const handleApplyVoucher = () => {
    // Voucher application logic
  };

  const handleCheckout = async () => {
    try {
      const selectedPackages = Object.entries(packages)
        .filter(([_, pkg]) => pkg.selected)
        .map(([name, pkg]) => ({
          mealType: name.toUpperCase(),
          persons: pkg.persons,
          price: pkg.calculatedPrice,
        }));

      if (selectedPackages.length === 0) {
        alert("Please select at least one package");
        return;
      }

      const totalAmount = selectedPackages.reduce(
        (sum, pkg) => sum + pkg.price,
        0
      );
    const customerName = user?.name || "Guest";
    const customerId = user?.customerid || "guest-id";
      const response = await axios.post(
        "https://utils-ndt3.onrender.com/create-order",
        { amount: totalAmount * 100 },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 && response.data.success) {
        const orderId = response.data.orderId;
        const amount = totalAmount * 100;
        const currency = "INR";

        if (typeof window.Razorpay === "undefined") {
          alert("Razorpay SDK not loaded.");
          return;
        }

        bookingDetails.serviceProviderId = providerDetails?.serviceproviderId
          ? Number(providerDetails.serviceproviderId)
          : null;
        bookingDetails.serviceProviderName = providerFullName;
        bookingDetails.customerId = customerId;
        bookingDetails.customerName = customerName;
        bookingDetails.address = currentLocation;
        bookingDetails.startDate =bookingType?.startDate || "",
        bookingDetails.endDate = bookingType?.endDate || "";

        bookingDetails.engagements = selectedPackages
          .map((pkg) => `${pkg.mealType} for ${pkg.persons} persons`)
          .join(", ");
        bookingDetails.monthlyAmount = totalAmount;
        bookingDetails.timeslot = bookingType.timeRange;

        const options = {
          key: "rzp_test_lTdgjtSRlEwreA",
          amount,
          currency,
          name: "Serveaso",
          description: "Meal Package Booking",
          order_id: orderId,
          handler: async function (razorpayResponse: any) {
            alert(
              `Payment successful! Payment ID: ${razorpayResponse.razorpay_payment_id}`
            );

            try {
              const bookingResponse = await axiosInstance.post(
                "/api/serviceproviders/engagement/add",
                bookingDetails,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (bookingResponse.status === 201) {
                try {
                  const notifyResponse = await fetch(
                    "http://localhost:4000/send-notification",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        title: "Hello from ServEaso!",
                        body: `Your booking for ${bookingDetails.engagements} has been successfully confirmed!`,
                        url: "http://localhost:3000",
                      }),
                      headers: { "Content-Type": "application/json" },
                    }
                  );

                  if (notifyResponse.ok) {
                    console.log("Notification triggered!");
                    alert("Notification sent!");
                  } else {
                    console.error("Notification failed");
                    alert("Failed to send notification");
                  }
                } catch (error) {
                  console.error("Error sending notification:", error);
                  alert("Error sending notification");
                }

                if (sendDataToParent) {
                  sendDataToParent(BOOKINGS);
                }
                handleClose();
              }
            } catch (error) {
              console.error("Error saving booking:", error);
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

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.log("error => ", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const renderPackageSections = () => {
    return Object.entries(packages).map(([packageName, pkg]) => {
      const categoryColor = getCategoryColor(packageName);

      return (
        <PackageCard 
          key={packageName}
          selected={pkg.selected}
          color={categoryColor}
        >
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
            
            <SelectButton 
              selected={pkg.selected}
              color={categoryColor}
              onClick={(e) => {
                e.stopPropagation();
                togglePackageSelection(packageName);
              }}
            >
              {pkg.selected ? 'SELECTED' : 'SELECT PACKAGE'}
            </SelectButton>
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
              <h1>MEAL PACKAGES</h1>
            </DialogHeader>
            
            <PackagesContainer>
              {renderPackageSections()}
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
                  Total for {totalItems} item{totalItems !== 1 ? 's' : ''} ({totalPersons} person{totalPersons !== 1 ? 's' : ''})
                </FooterText>
                <FooterPrice>₹{totalPrice.toFixed(2)}</FooterPrice>
              </div>
              
              <FooterButtons>
                {/* {!loggedInUser && (
                  <>
                    <Tooltip title="You need to login to proceed with checkout">
                      <IconButton size="small" style={{ marginRight: '8px' }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button onClick={handleLogin}>
                      LOGIN TO CONTINUE
                    </Button>
                  </>
                )} */}
                
                {/* {loggedInUser && ( */}
                  <CheckoutButton
                    onClick={handleCheckout}
                    disabled={totalItems === 0}
                  >
                    CHECKOUT
                  </CheckoutButton>
                {/* )} */}
              </FooterButtons>
            </FooterContainer>
          </DialogContainer>
        </StyledDialogContent>
      </StyledDialog>

      <Dialog 
        style={{padding:'0px'}}
        open={loginOpen}
        onClose={handleLoginClose}
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
      >
        <DialogContent>
          <Login bookingPage={handleBookingPage}/>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookServicesDialog;