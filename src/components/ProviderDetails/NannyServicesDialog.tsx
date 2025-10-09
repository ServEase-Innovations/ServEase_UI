/* eslint-disable */
import React, { useEffect, useState, useCallback } from 'react';
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
} from './CookServicesDialog.styles';
import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from '@mui/icons-material/Close';
import { CartDialog } from '../AddToCart/CartDialog';
import axios from 'axios';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axiosInstance from '../../services/axiosInstance';
import { usePricingFilterService } from 'src/utils/PricingFilter';
import { BookingPayload, BookingService } from 'src/services/bookingService';

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("success");

  const { getFilteredPricing } = usePricingFilterService();
  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const dispatch = useDispatch();
  const allCartItems = useSelector(selectCartItems);
  const nannyCartItems = allCartItems.filter(isNannyCartItem);
  const users = useSelector((state: any) => state.user?.value);
  const currentLocation = users?.customerDetails?.currentLocation;
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;

  const toggleCart = useCallback((key: string, pkg: NannyPackage) => {
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
  }, [activeTab, dispatch, nannyCartItems, providerDetails, providerFullName]);

useEffect(() => {
  const updatedNannyServices = getFilteredPricing("nanny");
  if (!updatedNannyServices || updatedNannyServices.length === 0) {
    if (Object.keys(packages).length > 0) setPackages({});
    return;
  }

  const newPackages: PackagesState = {};
  const isOnDemand = bookingType?.bookingPreference?.toLowerCase() === "date";
  const bookingTypeLabel: "On_demand" | "REGULAR" = isOnDemand ? "On_demand" : "REGULAR";

  updatedNannyServices.forEach((service: any) => {
    const key = `${service.Categories.toLowerCase()}_${service["Type"].toLowerCase()}_${bookingTypeLabel.toLowerCase()}`;
    const defaultAge = service.Categories.toLowerCase().includes("baby") ? 1 : 60;
    newPackages[key] = {
      ...packages[key], // Use current packages to preserve selected/inCart
      age: packages[key]?.age || defaultAge,
      calculatedPrice: getPackagePrice(
        updatedNannyServices,
        service.Categories,
        bookingTypeLabel,
        packages[key]?.age || defaultAge
      ),
      description: service["Job Description"]?.split("\n").filter(Boolean) || [],
      rating: 4.7,
      reviews: "(1M reviews)",
      category: service.Categories,
      jobDescription: service["Job Description"],
      remarks: service["Remarks/Conditions"] || "",
      bookingType: bookingTypeLabel,
      selected: packages[key]?.selected || false,
      inCart: packages[key]?.inCart || false
    };
  });

  // Only update if something actually changed
  const prevStr = JSON.stringify(packages);
  const newStr = JSON.stringify(newPackages);
  if (prevStr !== newStr) setPackages(newPackages);

}, [bookingType, packages, getFilteredPricing]);


  // 3. Clear cart items when switching tabs
  useEffect(() => {
    // Only run this when the tab actually changes and we have cart items
    if (nannyCartItems.length === 0) return;
    
    const itemsToRemove = nannyCartItems.filter(
      item => item.type === "nanny" && item.activeTab !== activeTab
    );

    if (itemsToRemove.length === 0) return;

    itemsToRemove.forEach(item => {
      dispatch(removeFromCart({ id: item.id, type: "nanny" }));
    });

    // Update packages state without causing infinite loop
    setPackages(prev => {
      const updated = { ...prev };
      itemsToRemove.forEach(item => {
        const packageKey = item.id.toLowerCase();
        if (updated[packageKey]) {
          updated[packageKey] = { 
            ...updated[packageKey], 
            inCart: false, 
            selected: false 
          };
        }
      });
      return updated;
    });
  }, [activeTab, dispatch]);

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

    // 1. Filter selected packages
    const selectedPackages = Object.entries(packages)
      .filter(([_, pkg]) => pkg.selected)
      .map(([key, pkg]) => ({
        key,
        age: pkg.age,
        price: pkg.calculatedPrice,
        category: pkg.category,
        packageType: key.includes('day') ? 'Day' : key.includes('night') ? 'Night' : 'Fulltime',
      }));

    const baseTotal = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
    if (baseTotal === 0) {
      setSnackbarMessage("Please select at least one service");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const customerId = user?.customerid || "guest-id";

    const responsibilities = selectedPackages.map(pkg => ({
      taskType: `${pkg.category} care - ${pkg.packageType} service`,
      age: pkg.age,
      careType: activeTab,
    }));

   const payload: BookingPayload = {
  customerid: customerId,
  serviceproviderid: providerDetails?.serviceproviderId
    ? Number(providerDetails.serviceproviderId)
    : 0,
  start_date: bookingType?.startDate || new Date().toISOString().split('T')[0],
  end_date: bookingType?.endDate || "",
  start_time: bookingType?.timeRange || '',
  responsibilities: { tasks: responsibilities },
  booking_type: getBookingTypeFromPreference(bookingType?.bookingPreference),
  taskStatus: "NOT_STARTED",
  service_type: "NANNY",
  base_amount: baseTotal,
  payment_mode: "razorpay",
  ...(bookingType?.bookingPreference === "ON_DEMAND" && {
    end_time: bookingType?.endTime || "",
  }),
};


    console.log("Final Nanny Payload:", payload);

    const result = await BookingService.bookAndPay(payload);

    // ✅ Show success message
    setSnackbarMessage(result?.verifyResult?.message || "Booking & Payment Successful ✅");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    // clear cart + close
    dispatch(removeFromCart({ type: 'meal' }));
    dispatch(removeFromCart({ type: 'maid' }));
    dispatch(removeFromCart({ type: 'nanny' }));
    handleClose();
    setCartDialogOpen(false);

  } catch (err: any) {
    console.error("Checkout error:", err);

    // ✅ Extract proper backend message
    let backendMessage = "Payment failed. Please try again.";
    if (err?.response?.data) {
      if (typeof err.response.data === "string") {
        backendMessage = err.response.data;
      } else if (err.response.data.error) {
        backendMessage = err.response.data.error;
      } else if (err.response.data.message) {
        backendMessage = err.response.data.message;
      }
    } else if (err.message) {
      backendMessage = err.message;
    }

    setSnackbarMessage(backendMessage);
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
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

  const handleAgeChange = useCallback((key: string, increment: number) => {
    setPackages(prev => {
      const currentPkg = prev[key];
      if (!currentPkg) {
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

      return {
        ...prev,
        [key]: {
          ...currentPkg,
          age: newAge,
          calculatedPrice: newPrice
        }
      };
    });
  }, [allServices]);

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
            <DialogHeader className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-xl pr-10 relative">
              <h1>❤️ Caregiver Service</h1>
              <CloseButton aria-label="close" onClick={handleClose} size="small">
                <CloseIcon style={{ color: 'white' }} />
              </CloseButton>
            </DialogHeader>

            <TabContainer>
              <TabButton onClick={() => setActiveTab('baby')} active={activeTab === 'baby'}>
                <TabIndicator active={activeTab === 'baby'}>Baby Care</TabIndicator>
              </TabButton>
              <TabButton onClick={() => setActiveTab('elderly')} active={activeTab === 'elderly'}>
                <TabIndicator active={activeTab === 'elderly'}>Elderly Care</TabIndicator>
              </TabButton>
            </TabContainer>

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
        handleClose={() => setCartDialogOpen(false)}
        handleNannyCheckout={handleCheckout}
      />
      
     <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert
    onClose={() => setSnackbarOpen(false)}
    severity={snackbarSeverity}
    sx={{ width: "100%" }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>

    </>
  );
};

export default NannyServicesDialog;