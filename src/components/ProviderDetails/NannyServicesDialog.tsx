/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { EnhancedProviderDetails } from '../../types/ProviderDetailsType';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress, Dialog, DialogContent, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { addToCart, clearCart, removeFromCart, selectCartItems } from '../../features/addToCart/addToSlice';
import { isNannyCartItem, NannyCartItem } from '../../types/cartSlice';
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
  CartButton,
  CloseButton,
  FooterContainer,
  FooterText,
  FooterButtons,
  FooterPrice,
  LoginButton,
  CheckoutButton,
  VoucherContainer,
  VoucherTitle,
  VoucherInputContainer,
  VoucherInput,
  VoucherButton,
  AgeInfoText
} from './NannyServicesDialog.styles';
import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from '@mui/icons-material/Close';
import { CartDialog } from '../AddToCart/CartDialog';
import axios from 'axios';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axiosInstance from '../../services/axiosInstance';
import { usePricingFilterService } from 'src/utils/PricingFilter';

interface NannyServicesDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

type NannyPackage = {
  selected: boolean;
  age: number;
  calculatedPrice: number;
  description: string[];
  rating: number;
  reviews: string;
  category: string;
  jobDescription: string;
  remarks: string;
  bookingType: "On_demand" | "REGULAR";
  inCart: boolean;
};

type PackagesState = Record<string, NannyPackage>;

// ✅ Helper to check DB "Numbers/Size" conditions
const matchAgeToSize = (numbersSize: string, age: number): boolean => {
  if (!numbersSize) return false;
  if (numbersSize.startsWith("<=")) {
    const limit = parseInt(numbersSize.replace("<=", "").trim(), 10);
    return age <= limit;
  }
  if (numbersSize.startsWith(">")) {
    const limit = parseInt(numbersSize.replace(">", "").trim(), 10);
    return age > limit;
  }
  return false;
};

// ✅ Compute price dynamically from DB
const getPackagePrice = (
  allServices: any[],
  category: string,
  bookingType: "On_demand" | "REGULAR",
  age: number
) => {
  const matched = allServices.find(service => {
    return (
      service.Categories.toLowerCase() === category.toLowerCase() &&
      matchAgeToSize(service["Numbers/Size"], age)
    );
  });

  if (!matched) return 0;

  return bookingType === "On_demand"
    ? matched["Price /Day (INR)"]
    : matched["Price /Month (INR)"];
};

const NannyServicesDialog: React.FC<NannyServicesDialogProps> = ({ 
  open, 
  handleClose, 
  providerDetails
}) => {
  const [activeTab, setActiveTab] = useState<'baby' | 'elderly'>('baby');
  const [packages, setPackages] = useState<PackagesState>({});
  const [allServices, setAllServices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
 
  const { getFilteredPricing } = usePricingFilterService();
  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const dispatch = useDispatch();
  const allCartItems = useSelector(selectCartItems);
  const nannyCartItems = allCartItems.filter(isNannyCartItem);
  const users = useSelector((state: any) => state.user?.value);
  const currentLocation = users?.customerDetails?.currentLocation;
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;

  // ✅ Build nanny packages dynamically from DB
 useEffect(() => {
  const updatedNannyServices = getFilteredPricing("nanny");
  if (!updatedNannyServices || updatedNannyServices.length === 0) {
    setPackages({});
    return;
  }

  setAllServices(updatedNannyServices);

  const isOnDemand = bookingType?.bookingPreference?.toLowerCase() === "date";
  const bookingTypeLabel = isOnDemand ? "On_demand" : "REGULAR";

  const initialPackages: PackagesState = {};
  updatedNannyServices.forEach((service: any) => {
    const hasPrice =
      bookingTypeLabel === "On_demand"
        ? service["Price /Day (INR)"]
        : service["Price /Month (INR)"];

    if (!hasPrice) return;

    const key = `${service.Categories.toLowerCase()}_${service["Type"].toLowerCase()}_${bookingTypeLabel.toLowerCase()}`;

    const defaultAge = service.Categories.toLowerCase().includes("baby") ? 1 : 60;

    initialPackages[key] = {
      selected: packages[key]?.selected || false, // preserve selection if already exists
      inCart: packages[key]?.inCart || false,     // preserve inCart if already exists
      age: packages[key]?.age || defaultAge,      // preserve existing age
      calculatedPrice: getPackagePrice(
        updatedNannyServices,
        service.Categories,
        bookingTypeLabel,
        packages[key]?.age || defaultAge
      ),
      description: service["Job Description"]?.split("\n").filter((line: string) => line.trim() !== "") || [],
      rating: 4.7,
      reviews: "(1M reviews)",
      category: service.Categories,
      jobDescription: service["Job Description"],
      remarks: service["Remarks/Conditions"] || "",
      bookingType: bookingTypeLabel,
    };
  });

  setPackages(initialPackages);
}, [bookingType]); // ❌ removed nannyCartItems


const toggleCart = (key: string, pkg: NannyPackage) => {
  // Detect package type from key
  const packageType = key.includes("day") ? "day" 
                    : key.includes("night") ? "night" 
                    : "fullTime";

  // Detect care type from category instead of splitting key
  const careType = pkg.category.toLowerCase().includes("baby") 
    ? "baby" 
    : "elderly";

  const cartItem: NannyCartItem = {
    id: key.toUpperCase(),
    type: "nanny",
    careType: careType,
    packageType: packageType,
    age: pkg.age,
    price: pkg.calculatedPrice,
    description: pkg.description.join(", "),
    providerId: providerDetails?.serviceproviderId || '',
    providerName: providerFullName,
    activeTab: activeTab // Add current active tab
  };

  // Check if this item is already in the cart
  const isAlreadyInCart = nannyCartItems.some(item => 
    item.id === cartItem.id
  );

  if (isAlreadyInCart) {
    // Remove from cart
    dispatch(removeFromCart({ id: cartItem.id, type: 'nanny' }));
    setPackages(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        inCart: false,
        selected: false
      }
    }));
  } else {
    // Clear other nanny services from different tabs
    const itemsToRemove = nannyCartItems.filter(item => 
      item.type === 'nanny' && item.activeTab !== activeTab
    );
    
    itemsToRemove.forEach(item => {
      dispatch(removeFromCart({ id: item.id, type: 'nanny' }));
    });

    // Also clear other service types
    dispatch(removeFromCart({ type: 'meal' }));
    dispatch(removeFromCart({ type: 'maid' }));
    
    // Add to cart
    dispatch(addToCart(cartItem));
    setPackages(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        inCart: true,
        selected: true
      }
    }));
  }
};

// Update the useEffect to only sync when needed and preserve tab-based selection
useEffect(() => {
  // Only sync if there are actual changes to avoid unnecessary re-renders
  setPackages(prev => {
    let hasChanges = false;
    const updatedPackages = { ...prev };
    
    Object.keys(updatedPackages).forEach(key => {
      const id = key.toUpperCase();
      
      const isInCart = nannyCartItems.some(item => item.id === id);
      
      // Only update if the state is different
      if (updatedPackages[key].inCart !== isInCart) {
        hasChanges = true;
        updatedPackages[key] = {
          ...updatedPackages[key],
          inCart: isInCart,
          selected: isInCart
        };
      }
    });
    
    return hasChanges ? updatedPackages : prev;
  });
}, [nannyCartItems]);

// Also update your package building useEffect to preserve cart state
useEffect(() => {
  const updatedNannyServices = getFilteredPricing("nanny");
  if (!updatedNannyServices || updatedNannyServices.length === 0) {
    setPackages({});
    return;
  }

  setAllServices(updatedNannyServices);

  const isOnDemand = bookingType?.bookingPreference?.toLowerCase() === "date";
  const bookingTypeLabel = isOnDemand ? "On_demand" : "REGULAR";

  const initialPackages: PackagesState = {};
  updatedNannyServices.forEach((service: any) => {
    const hasPrice =
      bookingTypeLabel === "On_demand"
        ? service["Price /Day (INR)"]
        : service["Price /Month (INR)"];

    if (!hasPrice) return;

    const key = `${service.Categories.toLowerCase()}_${service["Type"].toLowerCase()}_${bookingTypeLabel.toLowerCase()}`;

    const defaultAge = service.Categories.toLowerCase().includes("baby") ? 1 : 60;

    // Check if this package is already in the cart
    const isInCart = nannyCartItems.some(item => item.id === key.toUpperCase());

    initialPackages[key] = {
      selected: isInCart, // Use cart state as source of truth
      inCart: isInCart,   // Use cart state as source of truth
      age: packages[key]?.age || defaultAge,
      calculatedPrice: getPackagePrice(
        updatedNannyServices,
        service.Categories,
        bookingTypeLabel,
        packages[key]?.age || defaultAge
      ),
      description: service["Job Description"]?.split("\n").filter((line: string) => line.trim() !== "") || [],
      rating: 4.7,
      reviews: "(1M reviews)",
      category: service.Categories,
      jobDescription: service["Job Description"],
      remarks: service["Remarks/Conditions"] || "",
      bookingType: bookingTypeLabel,
    };
  });

  setPackages(initialPackages);
}, [bookingType, nannyCartItems]); // Add nannyCartItems dependency

useEffect(() => {
  // When tab changes, clear cart items from the other tab
  const itemsToRemove = nannyCartItems.filter(item => 
    item.type === 'nanny' && item.activeTab !== activeTab
  );
  
  itemsToRemove.forEach(item => {
    dispatch(removeFromCart({ id: item.id, type: 'nanny' }));
    
    // Also update local package state
    const packageKey = item.id.toLowerCase();
    if (packages[packageKey]) {
      setPackages(prev => ({
        ...prev,
        [packageKey]: {
          ...prev[packageKey],
          inCart: false,
          selected: false
        }
      }));
    }
  });
}, [activeTab]); // Run when activeTab changes

  const prepareCartForCheckout = () => {
    // Clear all existing cart items
    dispatch(removeFromCart({ type: 'meal' }));
    dispatch(removeFromCart({ type: 'maid' }));
    dispatch(removeFromCart({ type: 'nanny' }));

    // Add selected packages to cart
    Object.entries(packages).forEach(([key, pkg]) => {
      if (pkg.selected) {
const packageType = key.includes("day") ? "day" 
                  : key.includes("night") ? "night" 
                  : "fullTime";

const careType = pkg.category.toLowerCase().includes("baby") 
  ? "baby" 
  : "elderly";


        
        dispatch(addToCart({
          type: 'nanny',
          id: key.toUpperCase(),
          careType: careType,
          packageType: packageType,
          age: pkg.age,
          price: pkg.calculatedPrice,
          description: pkg.description.join(", "),
          providerId: providerDetails?.serviceproviderId || '',
          providerName: providerFullName,
          activeTab: activeTab
        }));
      }
    });
  };

  // ---- CartDialog controls ----
  const handleOpenCartDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const selectedCount = Object.values(packages).filter(pkg => pkg.selected).length;

    if (selectedCount === 0) {
      setError("Please select at least one package");
      return;
    }

    prepareCartForCheckout();
    setCartDialogOpen(true);
  };

  const handleCloseCartDialog = () => {
    setCartDialogOpen(false);
  };

  const getBookingTypeFromPreference = (bookingPreference: string | undefined): string => {
    if (!bookingPreference) return 'MONTHLY'; // default
    
    const pref = bookingPreference.toLowerCase();
    if (pref === 'date') return 'ON_DEMAND';
    if (pref === 'short term') return 'SHORT_TERM';
    return 'MONTHLY';
  };

  const getSelectedServicesDescription = () => {
    return Object.entries(packages)
      .filter(([_, pkg]) => pkg.selected)
      .map(([name, pkg]) => {
        const careType = name.split('_')[0];
        const packageType = name.split('_')[1];
        return `${careType} care (${packageType}) for age ${pkg.age}`;
      })
      .join(', ');
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Prepare booking data
      const selectedPackages = Object.entries(packages)
        .filter(([_, pkg]) => pkg.selected)
        .map(([name, pkg]) => ({
          nannyType: name.toUpperCase(),
          age: pkg.age,
          price: pkg.calculatedPrice,
        }));

      const baseTotal = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
      if (baseTotal === 0) {
        throw new Error('Please select at least one service');
      }

      // Calculate tax and platform fee (18% tax + 6% platform fee)
      const tax = baseTotal * 0.18;
      const platformFee = baseTotal * 0.06;
      const grandTotal = baseTotal + tax + platformFee;

      const customerName = user?.name || "Guest";
      const customerId = user?.customerid || "guest-id";

      const bookingData = {
        serviceProviderId: providerDetails?.serviceproviderId ? Number(providerDetails.serviceproviderId) : 0,
        serviceProviderName: providerFullName,
        customerId: customerId,
        customerName: customerName,
        address: currentLocation || "Durgapur, West Bengal 713205, India",
        startDate: bookingType?.startDate || new Date().toISOString().split('T')[0],
        endDate: bookingType?.endDate || "",
        engagements: getSelectedServicesDescription(),
        monthlyAmount: baseTotal,
        timeslot: bookingType?.timeRange || "",
        paymentMode: "UPI",
        bookingType: getBookingTypeFromPreference(bookingType?.bookingPreference),
        taskStatus: "NOT_STARTED",
        serviceType: "NANNY",
        responsibilities: []
      };

      // 2. Create Razorpay order
      let orderId: string;
      try {
        const orderResponse = await axios.post(
          "https://utils-ndt3.onrender.com/create-order",
          { 
            amount: Math.round(grandTotal * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
          },
          { 
            headers: { "Content-Type": "application/json" },
            timeout: 8000
          }
        );
        orderId = orderResponse.data.orderId;
      } catch (backendError) {
        console.warn("Backend order creation failed, falling back to client-side", backendError);
        orderId = `fallback_${Date.now()}`;
      }

      // 3. Initialize Razorpay payment
      const options = {
        key: "rzp_test_lTdgjtSRlEwreA", // Replace with your actual key
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        name: "Serveaso",
        description: "Nanny Services Booking",
        order_id: orderId,
        handler: async (razorpayResponse: any) => {
          try {
            // 4. Save booking to backend
            const bookingResponse = await axiosInstance.post(
              "/api/serviceproviders/engagement/add",
              {
                ...bookingData,
                paymentReference: razorpayResponse.razorpay_order_id || orderId
              },
              { headers: { "Content-Type": "application/json" } }
            );

            if (bookingResponse.status === 201) {
              // 5. Clear cart
              dispatch(removeFromCart({ type: 'meal' }));
              dispatch(removeFromCart({ type: 'maid' }));
              dispatch(removeFromCart({ type: 'nanny' }));

              // 6. Update UI and close dialogs
              handleClose();
              setCartDialogOpen(false);
              alert("Booking confirmed! 🎉");
            }
          } catch (bookingError) {
            // console.error("Error saving booking:", bookingError);
            setError("Payment succeeded but booking failed. Please contact support.");
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
        modal: {
          ondismiss: () => {
            setError("Payment closed by user");
          }
        }
      };

      // 7. Open Razorpay payment dialog
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || err.message || "Payment failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

 const calculateTotal = () => {
  return Object.entries(packages)
    .filter(([key, pkg]) => {
      // Only include packages from current active tab
      const isCurrentTab = activeTab === 'baby' 
        ? key.includes('baby') 
        : key.includes('elderly');
      
      return pkg.selected && isCurrentTab;
    })
    .reduce((sum, [_, pkg]) => sum + pkg.calculatedPrice, 0);
};
 const getSelectedPackagesCount = () => {
  return Object.entries(packages)
    .filter(([key, pkg]) => {
      const isCurrentTab = activeTab === 'baby' 
        ? key.includes('baby') 
        : key.includes('elderly');
      
      return pkg.selected && isCurrentTab;
    })
    .length;
};

 const handleAgeChange = (key: string, increment: number) => {
  setPackages(prev => {
    const currentPkg = prev[key];
    if (!currentPkg) {
      // console.warn("No package found for key:", key);
      return prev;
    }

    const isBaby = key.includes('baby');
    const minAge = isBaby ? 1 : 60;
    const maxAge = isBaby ? 6 : 80;

    const newAge = Math.max(minAge, Math.min(maxAge, currentPkg.age + increment));
    const newPrice = getPackagePrice(
      allServices,
      currentPkg.category,
      currentPkg.bookingType,
      newAge
    );

    // console.log("Updating", key, "from age", currentPkg.age, "to", newAge);

    return {
      ...prev,
      [key]: {
        ...currentPkg,
        age: newAge,
        calculatedPrice: newPrice
      }
    };
  });
};

  const handleApplyVoucher = () => {
    // Voucher logic here
  };

  // ✅ Rendering Baby & Elderly Tabs with Age Limits
  const renderPackages = (tab: 'baby' | 'elderly') => {
    return Object.entries(packages)
      .filter(([key]) => key.includes(tab))
      .map(([key, pkg]) => {
        const packageType = key.split('_')[1];
        const color = tab === 'baby' ? '#e17055' : '#0984e3';
        const displayPackageType = packageType.charAt(0).toUpperCase() + packageType.slice(1);

        return (
          <PackageCard key={key} selected={pkg.selected}>
            <PackageHeader>
              <div>
                <PackageTitle>{pkg.category} - {displayPackageType}</PackageTitle>
                <RatingContainer>
                  <RatingValue color={color}>{pkg.rating}</RatingValue>
                  <ReviewsText>{pkg.reviews}</ReviewsText>
                </RatingContainer>
              </div>
              <PriceContainer>
                <PriceValue color={color}>₹{pkg.calculatedPrice}</PriceValue>
                <CareType>{pkg.bookingType}</CareType>
              </PriceContainer>
            </PackageHeader>

            {/* ✅ Age Control with Limits */}
            <PersonsControl>
              <PersonsLabel>Age:</PersonsLabel>
              <PersonsInput>
     <DecrementButton
  onClick={(e) => {
    e.stopPropagation();
    handleAgeChange(key, -1);
  }}
  disabled={tab === 'baby' ? pkg.age <= 1 : pkg.age <= 60}
>-</DecrementButton>
                <PersonsValue>{pkg.age}</PersonsValue>
<IncrementButton
  onClick={(e) => {
    e.stopPropagation();
    handleAgeChange(key, 1);
  }}
  disabled={tab === 'baby' ? pkg.age >= 6 : pkg.age >= 80}
>+</IncrementButton>
              </PersonsInput>
              {tab === 'baby' && pkg.age === 1 && (
                <AgeInfoText>Age 1 includes babies from 1 to 12 months</AgeInfoText>
              )}
              {tab === 'elderly' && pkg.age === 60 && (
                <AgeInfoText>For seniors aged 60 and above</AgeInfoText>
              )}
            </PersonsControl>

            <DescriptionList>
              {pkg.description.map((item, index) => (
                <DescriptionItem key={index}>
                  <DescriptionBullet>•</DescriptionBullet>
                  <span>{item}</span>
                </DescriptionItem>
              ))}
            </DescriptionList>

            <ButtonsContainer>
              <CartButton 
                inCart={pkg.inCart} 
                color={color} 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCart(key, pkg);
                }}
              >
                {pkg.inCart 
                  ? <><RemoveShoppingCartIcon fontSize="small" /> ADDED TO CART</> 
                  : <><AddShoppingCartIcon fontSize="small" /> ADD TO CART</>}
              </CartButton>
            </ButtonsContainer>
          </PackageCard>
        );
      });
  };

  return (
    <>
      <StyledDialog open={open} onClose={handleClose}>
        <StyledDialogContent>
          <DialogContainer>
            <DialogHeader>
              <h1>❤️ Caregiver Service</h1>
              <CloseButton aria-label="close" onClick={handleClose} size="small">
                <CloseIcon />
              </CloseButton>
              <TabContainer>
                <TabButton onClick={() => setActiveTab('baby')} active={activeTab === 'baby'}>
                  <TabIndicator active={activeTab === 'baby'}>Baby Care</TabIndicator>
                </TabButton>
                <TabButton onClick={() => setActiveTab('elderly')} active={activeTab === 'elderly'}>
                  <TabIndicator active={activeTab === 'elderly'}>Elderly Care</TabIndicator>
                </TabButton>
              </TabContainer>
            </DialogHeader>

            <PackagesContainer>
              {activeTab === 'baby' ? renderPackages('baby') : renderPackages('elderly')}
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
          </DialogContainer>
          
          <FooterContainer>
            <div>
              <FooterText>
                Total for {getSelectedPackagesCount()} service{getSelectedPackagesCount() !== 1 ? 's' : ''}
              </FooterText>
              <FooterPrice>₹{calculateTotal().toLocaleString()}</FooterPrice>
            </div>
            
            <FooterButtons>
              {!isAuthenticated ? (
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
              ) : (
                <CheckoutButton
                  onClick={handleOpenCartDialog}
                  disabled={calculateTotal() === 0 || loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'CHECKOUT'}
                </CheckoutButton>
              )}
            </FooterButtons>
          </FooterContainer>
        </StyledDialogContent>
      </StyledDialog>
      
      {/* CartDialog */}
      <CartDialog
        open={cartDialogOpen}
        handleClose={handleCloseCartDialog}
        handleCheckout={handleCheckout}
      />
      
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