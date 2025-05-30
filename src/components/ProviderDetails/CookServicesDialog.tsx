/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */

import axios from 'axios';
import { EnhancedProviderDetails } from '../../types/ProviderDetailsType';
import { useDispatch, useSelector } from 'react-redux';
import { BookingDetails } from '../../types/engagementRequest';
import { BOOKINGS } from '../../Constants/pagesConstants';
import { Dialog, DialogContent, Tooltip, IconButton } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import Login from '../Login/Login';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axiosInstance from '../../services/axiosInstance';
import { usePricingFilterService } from '../../utils/PricingFilter';

interface CookServicesDialogProps {
  open: boolean;
  handleClose: () => void;
  providerDetails?: EnhancedProviderDetails;
  sendDataToParent?: (data: string) => void;
}

interface MealPackage {
  selected: boolean;
  persons: number;
  basePrice: number;
  calculatedPrice: number;
  maxPersons: number;
  description: string[];
  preparationTime: string;
  rating: number;
  reviews: string;
  category: string;
  jobDescription: string;
  remarks: string;
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
  
  const user = useSelector((state: any) => state.user?.value);
  const pricing = useSelector((state: any) => state.pricing?.groupedServices);
  
  const [packages, setPackages] = useState<PackagesState>({});
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const { getBookingType, getPricingData, getFilteredPricing } = usePricingFilterService();

const bookingType = getBookingType();



  const customerId = user?.customerDetails?.customerId || null;
  const currentLocation = user?.customerDetails?.currentLocation;
  const firstName = user?.customerDetails?.firstName;
  const lastName = user?.customerDetails?.lastName;
  const customerName = `${firstName} ${lastName}`;
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;

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
    let  basePrice = 0;
    if(bookingType?.bookingPreference?.toLowerCase() === "date") {
      basePrice = service["Price /Day (INR)"];
    } else {
      basePrice = service["Price /Month (INR)"];
    }
   

    initialPackages[category] = {
      selected: false,
      persons: 1,
      basePrice,
      calculatedPrice: calculatePriceForPersons(basePrice, 1),
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
    };
  });

  setPackages(initialPackages);
  console.log("Updated packages:", initialPackages);
}, [pricing, bookingType]);


  

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

      return {
        ...prev,
        [packageName]: {
          ...currentPackage,
          selected: !currentPackage.selected
        }
      };
    });
  };

  const handleApplyVoucher = () => {
    // Voucher logic here
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

    const response = await axios.post(
      "https://utils-dmua.onrender.com/create-order",
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
      bookingDetails.startDate =
        bookingType?.startDate || new Date().toISOString().split("T")[0];
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
              // Notification logic inserted here
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
        <div 
          key={packageName}
          style={{
            border: '1px solid #dfe6e9',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: pkg.selected ? `${categoryColor}10` : '#fff',
            borderLeft: pkg.selected ? `3px solid ${categoryColor}` : '1px solid #dfe6e9'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <h2 style={{color: '#2d3436', margin: '0 0 5px 0', textTransform: 'capitalize'}}>
                {packageName}
              </h2>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                <span style={{color: categoryColor, fontWeight: 'bold'}}>{pkg.rating}</span>
                <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>
                  {pkg.reviews}
                </span>
              </div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{fontWeight: 'bold', color: categoryColor, fontSize: '18px'}}>
                ₹{pkg.calculatedPrice.toFixed(2)}
              </div>
              <div style={{color: '#636e72', fontSize: '14px'}}>
                {pkg.preparationTime}
              </div>
            </div>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
            <span style={{marginRight: '15px', color: '#2d3436'}}>Persons:</span>
            <div style={{display: 'flex', alignItems: 'center', border: '1px solid #dfe6e9', borderRadius: '20px'}}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePersonChange(packageName, 'decrement');
                }}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  borderRight: '1px solid #dfe6e9',
                  borderRadius: '20px 0 0 20px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                disabled={pkg.persons <= 1}
              >
                -
              </button>
              <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>
                {pkg.persons}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePersonChange(packageName, 'increment');
                }}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  borderLeft: '1px solid #dfe6e9',
                  borderRadius: '0 20px 20px 0',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                disabled={pkg.persons >= 15}
              >
                +
              </button>
            </div>
            {pkg.persons > pkg.maxPersons && (
              <span style={{color: '#e17055', fontSize: '12px', marginLeft: '10px'}}>
                *Additional charges applied
              </span>
            )}
          </div>
          
          <div style={{margin: '15px 0'}}>
            {pkg.description.map((item, index) => (
              item.trim() && (
                <div key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>{item.trim()}</span>
                </div>
              )
            ))}
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              togglePackageSelection(packageName);
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: pkg.selected ? categoryColor : '#fff',
              color: pkg.selected ? '#fff' : categoryColor,
              border: `1px solid ${pkg.selected ? categoryColor : '#dfe6e9'}`,
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px',
              transition: 'all 0.3s ease'
            }}
          >
            {pkg.selected ? 'SELECTED' : 'SELECT PACKAGE'}
          </button>
        </div>
      );
    });
  };

  const selectedPackages = Object.entries(packages).filter(([_, pkg]) => pkg.selected);
  const totalItems = selectedPackages.length;
  const totalPersons = selectedPackages.reduce((sum, [_, pkg]) => sum + pkg.persons, 0);
  const totalPrice = selectedPackages.reduce((sum, [_, pkg]) => sum + pkg.calculatedPrice, 0);

  return (
    <>
      <Dialog 
        style={{padding:'0px', borderRadius: '12px'}}
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: { width: '500px', borderRadius: '12px' }
        }}
      >
        <DialogContent style={{padding: '0'}}>
          <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '550px', width: '100%'}}>
            <div style={{padding: '20px', borderBottom: '1px solid #f0f0f0'}}>
              <h1 style={{color: '#2d3436', margin: '0', fontSize: '24px'}}>MEAL PACKAGES</h1>
            </div>
            
            <div style={{padding: '20px'}}>
              {renderPackageSections()}
            </div>
            
            <div style={{
              padding: '15px 20px',
              borderTop: '1px solid #f0f0f0',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{color: '#2d3436', margin: '0 0 10px 0', fontSize: '16px'}}>Apply Voucher</h3>
              <div style={{display: 'flex', gap: '10px'}}>
                <input
                  type="text"
                  placeholder="Enter voucher code"
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #dfe6e9',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button 
                  onClick={handleApplyVoucher}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}>
                  APPLY
                </button>
              </div>
            </div>
            
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '15px 20px',
                borderTop: '1px solid #f0f0f0',
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <div>
                <div style={{color: '#636e72', fontSize: '14px'}}>
                  Total for {totalItems} item{totalItems !== 1 ? 's' : ''} ({totalPersons} person{totalPersons !== 1 ? 's' : ''})
                </div>
                <div style={{fontWeight: 'bold', fontSize: '20px', color: '#2d3436'}}>₹{totalPrice.toFixed(2)}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {!loggedInUser && (
                  <>
                    <Tooltip title="You need to login to proceed with checkout">
                      <IconButton size="small" style={{ marginRight: '8px' }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <button
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                        width: 'fit-content'
                      }}
                      onClick={handleLogin}
                    >
                      LOGIN TO CONTINUE
                    </button>
                  </>
                )}
                
                {loggedInUser && (
                  <button
                    style={{
                      padding: '12px 25px',
                      backgroundColor: totalItems > 0 ? '#e17055' : '#bdc3c7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: totalItems > 0 ? 'pointer' : 'not-allowed'
                    }}
                    onClick={handleCheckout}
                    disabled={totalItems === 0}
                  >
                    CHECKOUT
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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