/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
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
} from './CookServicesDialog.styles';
import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from '@mui/icons-material/Close';
import { usePricingFilterService } from 'src/utils/PricingFilter';
import { BookingPayload, BookingService } from 'src/services/bookingService';

interface MaidServiceDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

// --- Pricing helper ---
const getBasePrice = (service: any, bookingType: any) => {
const basePrice =
bookingType?.bookingPreference?.toLowerCase() === 'date'
? service?.["Price /Day (INR)"]
: service?.["Price /Month (INR)"];
return basePrice || 0;
};
// --- Types that mirror the pricing dataset ---
interface MaidPricingRow {
  _id?: string;
  Service?: string; // e.g. "Maid"
  Type?: string;    // e.g. "On Demand" | "Monthly" | etc.
  Categories?: string; // e.g. "Utensil Cleaning"
  'Sub-Categories'?: string; // e.g. "People" | "House Size" | "Bathrooms"
  'Numbers/Size'?: string; // e.g. "<=3", "4-6", "2BHK"
  'Price /Day (INR)'?: number;
  'Price /Month (INR)'?: number;
  'Price /Visit (INR)'?: number;
  'Price /Week (INR)'?: number;
  'Job Description'?: string;
}

type HouseSize = '1BHK' | '2BHK' | '3BHK' | '4BHK+';

type PackageState = {
  utensilCleaning: { persons: number; selected: boolean };
  sweepingMopping: { houseSize: HouseSize; selected: boolean };
  bathroomCleaning: { bathrooms: number; selected: boolean };
};

const monthlyFromDaily = (daily?: number) => (daily ? Math.round(daily * 26) : 0); // business days heuristic
const monthlyFromWeekly = (weekly?: number) => (weekly ? Math.round(weekly * 4) : 0);
const monthlyFromVisit = (perVisit?: number, visitsPerMonth = 8) => (perVisit ? Math.round(perVisit * visitsPerMonth) : 0); // fallback

// checks if a numeric value satisfies a textual range like "<=3", ">=7", "4-6"
const matchesNumericBand = (band: string, value: number) => {
  const s = band.trim();
  if (/^<=\s*\d+$/i.test(s)) return value <= parseInt(s.replace(/[^\d]/g, ''), 10);
  if (/^>=\s*\d+$/i.test(s)) return value >= parseInt(s.replace(/[^\d]/g, ''), 10);
  const range = s.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const min = parseInt(range[1], 10);
    const max = parseInt(range[2], 10);
    return value >= min && value <= max;
  }
  // If band is a single number, compare directly
  if (/^\d+$/.test(s)) return value === parseInt(s, 10);
  return false;
};

const MaidServiceDialog: React.FC<MaidServiceDialogProps> = ({ 
  open, 
  handleClose, 
  providerDetails,
  sendDataToParent
}) => {
  const [activeTab, setActiveTab] = useState<'regular' | 'premium'>('regular');
  const allCartItems = useSelector(selectCartItems);
  const maidCartItems = allCartItems.filter(isMaidCartItem);
  const [loading, setLoading] = useState(false);

  const [cartItems, setCartItems] = useState<Record<string, boolean>>(() => {
    const initialCartItems: Record<string, boolean> = {
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
        initialCartItems[item.name] = true;
      }
    });
    return initialCartItems;
  });

  const [packageStates, setPackageStates] = useState<PackageState>({
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
  const currentLocation = users?.customerDetails?.currentLocation;

  const { getPricingData, getFilteredPricing } = usePricingFilterService();
  const providerFullName = `${providerDetails?.firstName || ''} ${providerDetails?.lastName || ''}`.trim();
  const pricing = useSelector((state: any) => state.pricing?.groupedServices);
  const filtered = getFilteredPricing('maid');

  // Normalize pricing source (prefer hook -> store -> empty)
  const maidPricingRows: MaidPricingRow[] = useMemo(() => {
    const asArray = (data: any): MaidPricingRow[] => {
      if (!data) return [];
      if (Array.isArray(data)) return data as MaidPricingRow[];
      // Some stores keep it grouped by category; flatten if needed
      if (typeof data === 'object') {
        const flat: MaidPricingRow[] = [];
        Object.values(data).forEach((v: any) => {
          if (Array.isArray(v)) flat.push(...(v as MaidPricingRow[]));
        });
        return flat;
      }
      return [];
    };
    const a = asArray(filtered);
    if (a.length) return a;
    return asArray(pricing);
  }, [filtered, pricing]);

  const { user, loginWithRedirect, isAuthenticated } = useAuth0();

  const getBookingTypeFromPreference = (bookingPreference: string | undefined): string => {
    if (!bookingPreference) return 'MONTHLY';
    const pref = bookingPreference.toLowerCase();
    if (pref === 'date') return 'ON_DEMAND';
    if (pref === 'short term') return 'SHORT_TERM';
    return 'MONTHLY';
  };

  const bookingDetailsTemplate: BookingDetails = {
    serviceProviderId: 0,
    serviceProviderName: '',
    customerId: 0,
    customerName: '', 
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    engagements: '',
    address: ' Durgapur, West Bengal 713205, India',
    timeslot: '',
    monthlyAmount: 0,
    paymentMode: 'UPI',
    bookingType: getBookingTypeFromPreference(bookingType?.bookingPreference),
    taskStatus: 'NOT_STARTED', 
    responsibilities: [],
    serviceType: 'MAID',
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User Info:', user);
      console.log('Name:', user.name);
      console.log('Customer ID:', (user as any).customerid);
    }
  }, [isAuthenticated, user]);

  const handleTabChange = (tab: 'regular' | 'premium') => setActiveTab(tab);

  const handlePersonChange = (operation: 'increment' | 'decrement') => {
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

  const handleHouseSizeChange = (operation: 'increment' | 'decrement') => {
    const sizes: HouseSize[] = ['1BHK', '2BHK', '3BHK', '4BHK+'];
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

  const handleBathroomChange = (operation: 'increment' | 'decrement') => {
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

  useEffect(() => {
    if (!open) return;
    // Sync cart items from Redux
    const updatedCartItems: Record<string, boolean> = {
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
  }, [open, maidCartItems]);

  const handleAddOnSelect = (addOnName: string) => {
    setAddOns(prev => ({ ...prev, [addOnName]: !prev[addOnName as keyof typeof prev] }));
  };

  // ------- DYNAMIC PRICING HELPERS -------
 const findRow = (
  category: string,
  subCategory?: string,
  sizeLabelOrBand?: string,
  numericForBand?: number,
  preferOnDemand: boolean = false  // <--- add this
): MaidPricingRow | undefined => {
  if (!maidPricingRows.length) return undefined;

  // base rows for the category
  const rows = maidPricingRows.filter(
    (r) =>
      String(r.Service || '').toLowerCase() === 'maid' &&
      String(r.Categories || '').toLowerCase() === category.toLowerCase()
  );

  if (!rows.length) return undefined;

  // filter by sub-category if provided
  const rowsSub = subCategory
    ? rows.filter((r) => String(r['Sub-Categories'] || '').toLowerCase() === subCategory.toLowerCase())
    : rows;

  if (!rowsSub.length) return undefined;

  // prefer rows based on booking type
  const prefStr = preferOnDemand ? 'on demand' : 'regular';
const prefCandidates = rowsSub.filter(
  (r) => String(r.Type || '').toLowerCase().includes(prefStr)
);


  const candidates = prefCandidates.length ? prefCandidates : rowsSub;

  // Prefer exact size label match
  if (sizeLabelOrBand) {
    const exact = candidates.find(
      (r) => String(r['Numbers/Size'] || '').toLowerCase() === String(sizeLabelOrBand).toLowerCase()
    );
    if (exact) return exact;

    if (numericForBand) {
      const bandHit = candidates.find(
        (r) =>
          r['Numbers/Size'] &&
          matchesNumericBand(String(r['Numbers/Size']), numericForBand)
      );
      if (bandHit) return bandHit;
    }
  }

  return candidates[0];
};

  const priceToMonthly = (row?: MaidPricingRow): number => {
    if (!row) return 0;
    if (row['Price /Month (INR)']) return row['Price /Month (INR)'] as number;
    if (row['Price /Week (INR)']) return monthlyFromWeekly(row['Price /Week (INR)']);
    if (row['Price /Visit (INR)']) return monthlyFromVisit(row['Price /Visit (INR)']);
    if (row['Price /Day (INR)']) return monthlyFromDaily(row['Price /Day (INR)']);
    return 0;
  };

 const getPackagePrice = (packageName: string): number => {
  const preferOnDemand = bookingType?.bookingPreference?.toLowerCase() === 'date';

  switch (packageName) {
    case 'utensilCleaning': {
      const persons = packageStates.utensilCleaning.persons;
      const row = findRow('Utensil Cleaning', 'People', undefined, persons, preferOnDemand);
      return getBasePrice(row, bookingType) || 1200;
    }
  case 'sweepingMopping': {
  const size = packageStates.sweepingMopping.houseSize;
  const preferOnDemand = bookingType?.bookingPreference?.toLowerCase() === 'date';

  // use "House" instead of "House Size"
  const row = findRow('Sweeping & Mopping', 'House', size, undefined, preferOnDemand);

  return getBasePrice(row, bookingType) || 1200;
}

  case 'bathroomCleaning': {
  const bathrooms = packageStates.bathroomCleaning.bathrooms;
  const preferOnDemand = bookingType?.bookingPreference?.toLowerCase() === 'date';

  const row = findRow('Bathroom', 'Number', undefined, bathrooms, preferOnDemand);

  return getBasePrice(row, bookingType) || 600;
}

    default:
      return 0;
  }
};


  const getPackageDescription = (packageName: string): string => {
    switch(packageName) {
      case 'utensilCleaning': return 'All kind of daily utensil cleaning\nParty used type utensil cleaning';
      case 'sweepingMopping': return 'Daily sweeping and mopping';
      case 'bathroomCleaning': return 'Weekly cleaning of bathrooms';
      default: return '';
    }
  };

  const getPackageDetails = (packageName: string) => {
    switch(packageName) {
      case 'utensilCleaning': return { persons: packageStates.utensilCleaning.persons };
      case 'sweepingMopping': return { houseSize: packageStates.sweepingMopping.houseSize };
      case 'bathroomCleaning': return { bathrooms: packageStates.bathroomCleaning.bathrooms };
      default: return {};
    }
  };

const getAddOnPrice = (addOnName: string): number => {
  const map: Record<string, { cat: string; sub?: string; size?: string }> = {
    bathroomDeepCleaning: { cat: 'Bathroom -Deep Cleaning', sub: 'Number' },
    normalDusting:        { cat: 'Normal Dusting', sub: 'House' },
    deepDusting:          { cat: 'Deep Dusting', sub: 'House' },
    utensilDrying:        { cat: 'Utensil Drying & Arrangements', sub: 'People', size: '<=3' },
    clothesDrying:        { cat: 'Clothes Drying and Folding', sub: 'People', size: '<=3' },
  };

  const meta = map[addOnName];
  if (!meta) return 0;

  const preferOnDemand = bookingType?.bookingPreference?.toLowerCase() === 'date';
  const row = findRow(meta.cat, meta.sub, meta.size, undefined, preferOnDemand);

  const price = getBasePrice(row, bookingType);
  if (price && price > 0) return price;

  // fallback defaults
  switch (addOnName) {
    case 'deepDusting': return 1500;
    default: return 1000;
  }
};


  const getAddOnDescription = (addOnName: string): string => {
    switch(addOnName) {
      case 'bathroomDeepCleaning': return 'Weekly cleaning of bathrooms, all bathroom walls cleaned';
      case 'normalDusting': return 'Daily furniture dusting, doors, carpet, bed making';
      case 'deepDusting': return 'Includes chemical agents cleaning: décor items, furniture';
      case 'utensilDrying': return 'Househelp will dry and make proper arrangements';
      case 'clothesDrying': return 'Househelp will get clothes from/to drying place';
      default: return '';
    }
  };

  const handleAddPackageToCart = (packageName: string) => {
    const isCurrentlyInCart = !!cartItems[packageName];
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

    setCartItems(prev => ({ ...prev, [packageName]: !isCurrentlyInCart }));
    setPackageStates(prev => ({
      ...prev,
      [packageName]: { ...(prev as any)[packageName], selected: !isCurrentlyInCart }
    }) as PackageState);
  };

  const handleAddAddOnToCart = (addOnName: string) => {
    const isCurrentlyInCart = !!cartItems[addOnName];

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

    setCartItems(prev => ({ ...prev, [addOnName]: !isCurrentlyInCart }));
    setAddOns(prev => ({ ...prev, [addOnName]: !isCurrentlyInCart }));
  };

  const calculateTotal = () => {
    let total = 0;
    if (packageStates.utensilCleaning.selected) total += getPackagePrice('utensilCleaning');
    if (packageStates.sweepingMopping.selected) total += getPackagePrice('sweepingMopping');
    if (packageStates.bathroomCleaning.selected) total += getPackagePrice('bathroomCleaning');
    if (addOns.bathroomDeepCleaning) total += getAddOnPrice('bathroomDeepCleaning');
    if (addOns.normalDusting) total += getAddOnPrice('normalDusting');
    if (addOns.deepDusting) total += getAddOnPrice('deepDusting');
    if (addOns.utensilDrying) total += getAddOnPrice('utensilDrying');
    if (addOns.clothesDrying) total += getAddOnPrice('clothesDrying');
    return total;
  };

  const countSelectedServices = () => {
    let count = 0;
    if (packageStates.utensilCleaning.selected) count++;
    if (packageStates.sweepingMopping.selected) count++;
    if (packageStates.bathroomCleaning.selected) count++;
    return count;
  };

  const countSelectedAddOns = () => Object.values(addOns).filter(Boolean).length;
  const hasSelectedServices = () => countSelectedServices() > 0 || countSelectedAddOns() > 0;

  const [cartDialogOpen, setCartDialogOpen] = useState(false);

  const prepareCartForCheckout = () => {
    // Clear all existing cart items of supported types
    dispatch(removeFromCart({ type: 'meal' }));
    dispatch(removeFromCart({ type: 'maid' }));
    dispatch(removeFromCart({ type: 'nanny' }));

    if (packageStates.utensilCleaning.selected) {
      dispatch(addToCart({
        type: 'maid',
        id: 'package_utensilCleaning',
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
        id: 'package_sweepingMopping',
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
        id: 'package_bathroomCleaning',
        serviceType: 'package',
        name: 'bathroomCleaning',
        price: getPackagePrice('bathroomCleaning'),
        description: getPackageDescription('bathroomCleaning'),
        details: { bathrooms: packageStates.bathroomCleaning.bathrooms }
      }));
    }

    if (addOns.bathroomDeepCleaning) {
      dispatch(addToCart({
        type: 'maid',
        id: 'addon_bathroomDeepCleaning',
        serviceType: 'addon',
        name: 'bathroomDeepCleaning',
        price: getAddOnPrice('bathroomDeepCleaning'),
        description: getAddOnDescription('bathroomDeepCleaning')
      }));
    }

    if (addOns.normalDusting) {
      dispatch(addToCart({
        type: 'maid',
        id: 'addon_normalDusting',
        serviceType: 'addon',
        name: 'normalDusting',
        price: getAddOnPrice('normalDusting'),
        description: getAddOnDescription('normalDusting')
      }));
    }

    if (addOns.deepDusting) {
      dispatch(addToCart({
        type: 'maid',
        id: 'addon_deepDusting',
        serviceType: 'addon',
        name: 'deepDusting',
        price: getAddOnPrice('deepDusting'),
        description: getAddOnDescription('deepDusting')
      }));
    }

    if (addOns.utensilDrying) {
      dispatch(addToCart({
        type: 'maid',
        id: 'addon_utensilDrying',
        serviceType: 'addon',
        name: 'utensilDrying',
        price: getAddOnPrice('utensilDrying'),
        description: getAddOnDescription('utensilDrying')
      }));
    }

    if (addOns.clothesDrying) {
      dispatch(addToCart({
        type: 'maid',
        id: 'addon_clothesDrying',
        serviceType: 'addon',
        name: 'clothesDrying',
        price: getAddOnPrice('clothesDrying'),
        description: getAddOnDescription('clothesDrying')
      }));
    }
  };

  const handleOpenCartDialog = () => {
    if (!hasSelectedServices()) {
      alert('Please select at least one service');
      return;
    }
    prepareCartForCheckout();
    setCartDialogOpen(true);
  };

const handleCheckout = async () => {
  try {
    setLoading(true);

    // Get only maid cart items
    const selectedServices = allCartItems.filter(isMaidCartItem);

    const baseTotal = selectedServices.reduce((sum, item) => sum + (item.price || 0), 0);
    if (baseTotal <= 0) {
      alert("No items selected for checkout");
      return;
    }

    const customerId = user?.customerid || "guest-id";

    // --- Separate packages and add-ons ---
    const packages = selectedServices.filter(item => item.serviceType === "package");
    const addOns = selectedServices.filter(item => item.serviceType === "addon");

    // --- Build responsibilities ---
    const responsibilities = {
      tasks: packages.map(item => {
        if (item.name === "utensilCleaning") {
          return { taskType: "Utensil Cleaning", persons: item.details?.persons || 1 };
        }
        if (item.name === "sweepingMopping") {
          return { taskType: "Sweeping & Mopping", houseSize: item.details?.houseSize || "2BHK" };
        }
        if (item.name === "bathroomCleaning") {
          return { taskType: "Bathroom Cleaning", bathrooms: item.details?.bathrooms || 1 };
        }
        return { taskType: item.name };
      }),
      add_ons: addOns.map(item => ({ taskType: item.name })) // <-- add-ons separately
    };

    // --- Prepare payload ---
    const payload: BookingPayload = {
      customerid: customerId,
      serviceproviderid: providerDetails?.serviceproviderId ? Number(providerDetails.serviceproviderId) : 0,
      start_date: bookingType?.startDate || new Date().toISOString().split("T")[0],
      end_date: bookingType?.endDate || "",
      start_time: bookingType?.timeRange || "",
      responsibilities, // <-- now includes add_ons separately
      booking_type: getBookingTypeFromPreference(bookingType?.bookingPreference),
      taskStatus: "NOT_STARTED",
      service_type: "MAID",
      base_amount: baseTotal,
      payment_mode: "razorpay",
    };

    console.log("Final Maid Payload:", payload);

    const result = await BookingService.bookAndPay(payload);

    if (sendDataToParent) {
      sendDataToParent(BOOKINGS);
    }
    handleClose();
    setCartDialogOpen(false);

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
  className="!text-white"
>
  <CloseIcon />
</CloseButton>

            </DialogHeader>

            {/* <TabsContainer>
              <TabButton active={activeTab === 'regular'} onClick={() => handleTabChange('regular')}>Regular Services</TabButton>
              <TabButton active={activeTab === 'premium'} onClick={() => handleTabChange('premium')}>Premium Services</TabButton>
            </TabsContainer> */}

            <PackagesContainer>
              {/* Utensil Cleaning */}
              <PackageCard selected={packageStates.utensilCleaning.selected} color="#e17055">
                <PackageHeader>
                  <div>
                    <PackageTitle>Utensil Cleaning</PackageTitle>
                    <RatingContainer>
                      <RatingValue color="#e17055">4.7</RatingValue>
                      <ReviewsText>(1.2M reviews)</ReviewsText>
                    </RatingContainer>
                  </div>
                  <PriceContainer>
                    <PriceValue color="#e17055">₹{getPackagePrice('utensilCleaning').toLocaleString('en-IN')}</PriceValue>
                    <PreparationTime>Monthly service</PreparationTime>
                  </PriceContainer>
                </PackageHeader>

                <PersonsControl>
                  <PersonsLabel>Persons:</PersonsLabel>
                  <PersonsInput>
                    <DecrementButton onClick={() => handlePersonChange('decrement')}>-</DecrementButton>
                    <PersonsValue>{packageStates.utensilCleaning.persons}</PersonsValue>
                    <IncrementButton onClick={() => handlePersonChange('increment')}>+</IncrementButton>
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
                  <CartButton inCart={cartItems.utensilCleaning} onClick={() => handleAddPackageToCart('utensilCleaning')}>
                    {cartItems.utensilCleaning ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                    {cartItems.utensilCleaning ? 'ADDED TO CART' : 'ADD TO CART'}
                  </CartButton>
                </ButtonsContainer>
              </PackageCard>

              {/* Sweeping & Mopping */}
              <PackageCard selected={packageStates.sweepingMopping.selected} color="#00b894">
                <PackageHeader>
                  <div>
                    <PackageTitle>Sweeping & Mopping</PackageTitle>
                    <RatingContainer>
                      <RatingValue color="#00b894">4.8</RatingValue>
                      <ReviewsText>(1.5M reviews)</ReviewsText>
                    </RatingContainer>
                  </div>
                  <PriceContainer>
                    <PriceValue color="#00b894">₹{getPackagePrice('sweepingMopping').toLocaleString('en-IN')}</PriceValue>
                    <PreparationTime>Monthly service</PreparationTime>
                  </PriceContainer>
                </PackageHeader>

                <PersonsControl>
                  <PersonsLabel>House Size:</PersonsLabel>
                  <PersonsInput>
                    <DecrementButton onClick={() => handleHouseSizeChange('decrement')}>-</DecrementButton>
                    <PersonsValue>{packageStates.sweepingMopping.houseSize}</PersonsValue>
                    <IncrementButton onClick={() => handleHouseSizeChange('increment')}>+</IncrementButton>
                  </PersonsInput>
                </PersonsControl>

                <DescriptionList>
                  <DescriptionItem>
                    <DescriptionBullet>•</DescriptionBullet>
                    <span>Daily sweeping and mopping of 2 rooms, 1 Hall</span>
                  </DescriptionItem>
                </DescriptionList>

                <ButtonsContainer>
                  <CartButton inCart={cartItems.sweepingMopping} onClick={() => handleAddPackageToCart('sweepingMopping')}>
                    {cartItems.sweepingMopping ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                    {cartItems.sweepingMopping ? 'ADDED TO CART' : 'ADD TO CART'}
                  </CartButton>
                </ButtonsContainer>
              </PackageCard>

              {/* Bathroom Cleaning */}
              <PackageCard selected={packageStates.bathroomCleaning.selected} color="#0984e3">
                <PackageHeader>
                  <div>
                    <PackageTitle>Bathroom Cleaning</PackageTitle>
                    <RatingContainer>
                      <RatingValue color="#0984e3">4.6</RatingValue>
                      <ReviewsText>(980K reviews)</ReviewsText>
                    </RatingContainer>
                  </div>
                  <PriceContainer>
                    <PriceValue color="#0984e3">₹{getPackagePrice('bathroomCleaning').toLocaleString('en-IN')}</PriceValue>
                    <PreparationTime>Monthly service</PreparationTime>
                  </PriceContainer>
                </PackageHeader>

                <PersonsControl>
                  <PersonsLabel>Bathrooms:</PersonsLabel>
                  <PersonsInput>
                    <DecrementButton onClick={() => handleBathroomChange('decrement')}>-</DecrementButton>
                    <PersonsValue>{packageStates.bathroomCleaning.bathrooms}</PersonsValue>
                    <IncrementButton onClick={() => handleBathroomChange('increment')}>+</IncrementButton>
                  </PersonsInput>
                </PersonsControl>

                <DescriptionList>
                  <DescriptionItem>
                    <DescriptionBullet>•</DescriptionBullet>
                    <span>Weekly cleaning of bathrooms</span>
                  </DescriptionItem>
                </DescriptionList>

                <ButtonsContainer>
                  <CartButton inCart={cartItems.bathroomCleaning} onClick={() => handleAddPackageToCart('bathroomCleaning')}>
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
                      <AddOnPrice color="#00b894">+₹{getAddOnPrice('bathroomDeepCleaning').toLocaleString('en-IN')}</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>Weekly cleaning of bathrooms, all bathroom walls cleaned</AddOnDescription>
                    <AddOnButton selected={addOns.bathroomDeepCleaning} color="#00b894" onClick={() => handleAddAddOnToCart('bathroomDeepCleaning')}>
                      {addOns.bathroomDeepCleaning ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>

                  {/* Normal Dusting */}
                  <AddOnCard selected={addOns.normalDusting} color="#0984e3">
                    <AddOnHeader>
                      <AddOnTitle>Normal Dusting</AddOnTitle>
                      <AddOnPrice color="#0984e3">+₹{getAddOnPrice('normalDusting').toLocaleString('en-IN')}</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>Daily furniture dusting, doors, carpet, bed making</AddOnDescription>
                    <AddOnButton selected={addOns.normalDusting} color="#0984e3" onClick={() => handleAddAddOnToCart('normalDusting')}>
                      {addOns.normalDusting ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>

                  {/* Deep Dusting */}
                  <AddOnCard selected={addOns.deepDusting} color="#e17055">
                    <AddOnHeader>
                      <AddOnTitle>Deep Dusting</AddOnTitle>
                      <AddOnPrice color="#e17055">+₹{getAddOnPrice('deepDusting').toLocaleString('en-IN')}</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>Includes chemical agents cleaning: décor items, furniture</AddOnDescription>
                    <AddOnButton selected={addOns.deepDusting} color="#e17055" onClick={() => handleAddAddOnToCart('deepDusting')}>
                      {addOns.deepDusting ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>

                  {/* Utensil Drying */}
                  <AddOnCard selected={addOns.utensilDrying} color="#00b894">
                    <AddOnHeader>
                      <AddOnTitle>Utensil Drying</AddOnTitle>
                      <AddOnPrice color="#00b894">+₹{getAddOnPrice('utensilDrying').toLocaleString('en-IN')}</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>Househelp will dry and make proper arrangements</AddOnDescription>
                    <AddOnButton selected={addOns.utensilDrying} color="#00b894" onClick={() => handleAddAddOnToCart('utensilDrying')}>
                      {addOns.utensilDrying ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>

                  {/* Clothes Drying */}
                  <AddOnCard selected={addOns.clothesDrying} color="#0984e3">
                    <AddOnHeader>
                      <AddOnTitle>Clothes Drying</AddOnTitle>
                      <AddOnPrice color="#0984e3">+₹{getAddOnPrice('clothesDrying').toLocaleString('en-IN')}</AddOnPrice>
                    </AddOnHeader>
                    <AddOnDescription>Househelp will get clothes from/to drying place</AddOnDescription>
                    <AddOnButton selected={addOns.clothesDrying} color="#0984e3" onClick={() => handleAddAddOnToCart('clothesDrying')}>
                      {addOns.clothesDrying ? 'ADDED' : '+ Add This Service'}
                    </AddOnButton>
                  </AddOnCard>
                </AddOnsGrid>
              </AddOnsContainer>

              {/* Voucher Section */}
              <VoucherContainer>
                <VoucherTitle>Apply Voucher</VoucherTitle>
                <VoucherInputContainer>
                  <VoucherInput type="text" placeholder="Enter voucher code" />
                  <VoucherButton>APPLY</VoucherButton>
                </VoucherInputContainer>
              </VoucherContainer>
            </PackagesContainer>

            {/* Footer with Checkout */}
            <FooterContainer>
              <div>
                <FooterText>
                  Total for {countSelectedServices()} services ({countSelectedAddOns()} add-ons)
                </FooterText>
                <FooterPrice>₹{calculateTotal().toLocaleString('en-IN')}</FooterPrice>
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
                  <CheckoutButton onClick={handleOpenCartDialog} disabled={calculateTotal() === 0}>
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
  handleMaidCheckout={handleCheckout}
/>
    </>
  );
};

export default MaidServiceDialog;
