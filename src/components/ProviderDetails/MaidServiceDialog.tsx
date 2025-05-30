import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { BookingDetails } from '../../types/engagementRequest';
import { BOOKINGS } from '../../Constants/pagesConstants';
import { Dialog, DialogContent, Tooltip, IconButton } from '@mui/material';
import Login from '../Login/Login';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { EnhancedProviderDetails } from '../../types/ProviderDetailsType';
import axiosInstance from '../../services/axiosInstance';

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
  const [packageStates, setPackageStates] = useState({
    utensilCleaning: {
      persons: 3,
      selected: false
    },
    sweepingMopping: {
      houseSize: '2BHK',
      selected: false
    },
    bathroomCleaning: {
      bathrooms: 2,
      selected: false
    }
  });
  const [addOns, setAddOns] = useState({
    bathroomDeepCleaning: false,
    normalDusting: false,
    deepDusting: false,
    utensilDrying: false,
    clothesDrying: false
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const user = useSelector((state: any) => state.user?.value);
  const dispatch = useDispatch();
  const customerId = user?.customerDetails?.customerId || null;
  const currentLocation = user?.customerDetails?.currentLocation;
  const firstName = user?.customerDetails?.firstName;
  const lastName = user?.customerDetails?.lastName;
  const customerName = `${firstName} ${lastName}`;
  const providerFullName = `${providerDetails?.firstName} ${providerDetails?.lastName}`;
  const pricing = useSelector((state: any) => state.pricing?.groupedServices);
 const maidServices =
    pricing?.maid?.filter((service: any) => service.Type === "Regular" || service.Type === "Regular Add-on") || [];
  console.log("maidServices",maidServices);
  maidServices.forEach((service: any) => {
  console.log("Category:", service.Categories);
  console.log("Number/Size:", service["Numbers/Size"]);
  console.log("Price /Month (INR):", service["Price /Month (INR)"]);
  console.log("----------");
});

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
    bookingType: "MAID_SERVICE",
    taskStatus: "NOT_STARTED", 
    responsibilities: [],
  };

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      setLoggedInUser(user);
    }
  }, [user]);

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

  const handlePackageSelect = (packageName: string) => {
    setPackageStates(prev => ({
      ...prev,
      [packageName]: {
        ...prev[packageName],
        selected: !prev[packageName].selected
      }
    }));
  };

  const handleAddOnSelect = (addOnName: string) => {
    setAddOns(prev => ({
      ...prev,
      [addOnName]: !prev[addOnName]
    }));
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
  const selectedServices: string[] = [];
  const selectedAddOns: string[] = Object.entries(addOns)
    .filter(([_, selected]) => selected)
    .map(([name]) => name);

    const handleCheckout = async () => {
  try {
    const selectedServices: string[] = [];
    const selectedAddOns: string[] = Object.entries(addOns)
      .filter(([_, selected]) => selected)
      .map(([name]) => name);

    if (packageStates.utensilCleaning.selected) {
      selectedServices.push(`Utensil cleaning for ${packageStates.utensilCleaning.persons} persons`);
    }
    if (packageStates.sweepingMopping.selected) {
      selectedServices.push(`Sweeping & mopping for ${packageStates.sweepingMopping.houseSize}`);
    }
    if (packageStates.bathroomCleaning.selected) {
      selectedServices.push(`Bathroom cleaning for ${packageStates.bathroomCleaning.bathrooms} bathrooms`);
    }

    if (selectedServices.length === 0 && selectedAddOns.length === 0) {
      alert('Please select at least one service or add-on');
      return;
    }

    const totalAmount = calculateTotal();

    // Step: Call calculate-payment API
//     const calculatePaymentResponse = await axiosInstance.post("/api/payments/calculate-payment", null, {
//     params: {
//     customerId,
//     baseAmount: totalAmount,
//     startDate_P: bookingType?.startDate || "",
//     endDate_P: bookingType?.endDate || "",
//     paymentMode: "UPI", // or whatever mode is selected
//   },
// });
    

//     if (!calculatePaymentResponse || calculatePaymentResponse.status !== 200) {
//       alert("Failed to calculate payment.");
//       return;
//     }

    // Step: Create Razorpay order
    const response = await axios.post(
      "http://13.201.229.41:3000/create-order",
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

      // Populate booking details
      bookingDetails.serviceProviderId = providerDetails?.serviceproviderId 
        ? Number(providerDetails.serviceproviderId) 
        : null;
      bookingDetails.serviceProviderName = providerFullName;
      bookingDetails.customerId = customerId;
      bookingDetails.customerName = customerName;
      bookingDetails.address = currentLocation;
      bookingDetails.startDate = bookingType?.startDate || new Date().toISOString().split('T')[0];
      bookingDetails.endDate = bookingType?.endDate || "";
      bookingDetails.engagements = [
        ...selectedServices,
        ...(selectedAddOns.length > 0 ? [`Add-ons: ${selectedAddOns.join(', ')}`] : [])
      ].join('; ');
      bookingDetails.monthlyAmount = totalAmount;
      bookingDetails.timeslot = bookingType.timeRange;

      const options = {
        key: "rzp_test_lTdgjtSRlEwreA",
        amount,
        currency,
        name: "Serveaso",
        description: "Maid Service Booking",
        order_id: orderId,
        handler: async function (razorpayResponse: any) {
          alert(`Payment successful! Payment ID: ${razorpayResponse.razorpay_payment_id}`);

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
                const notifyResponse = await fetch("http://localhost:4000/send-notification", {
                  method: "POST",
                  body: JSON.stringify({
                    title: "Booking Confirmed",
                    body: `Thank you, ${customerName}! Your booking has been confirmed.`,
                    url: "http://localhost:3000",
                  }),
                  headers: {
                    "Content-Type": "application/json",
                  },
                });

                if (notifyResponse.ok) {
                  console.log("Notification sent!");
                  alert("Notification sent!");
                } else {
                  alert("Failed to send notification");
                }
              } catch (notifyError) {
                alert("Error sending notification");
              }

              if (sendDataToParent) {
                sendDataToParent(BOOKINGS);
              }
              handleClose();
            }
          } catch (error) {
            alert("Booking saved but failed to update server.");
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

  return (
    <>
      <Dialog 
        style={{padding:'0px', borderRadius: '12px'}}
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: { width: '550px', borderRadius: '12px' }
        }}
      >
        <DialogContent style={{padding: '0'}}>
          <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '550px', width: '100%'}}>
            {/* Header */}
            <div style={{padding: '20px', borderBottom: '1px solid #f0f0f0'}}>
              <h1 style={{color: '#2d3436', margin: '0', fontSize: '24px'}}>MAID SERVICE PACKAGES</h1>
            </div>
            
            {/* Tabs */}
            <div style={{display: 'flex', borderBottom: '1px solid #f0f0f0'}}>
              <button 
                onClick={() => handleTabChange('regular')}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: '#fff',
                  border: 'none',
                  borderBottom: activeTab === 'regular' ? '3px solid #e17055' : 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: activeTab === 'regular' ? '#2d3436' : '#636e72'
                }}
              >
                Regular Services
              </button>
              <button 
                onClick={() => handleTabChange('premium')}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: '#fff',
                  border: 'none',
                  borderBottom: activeTab === 'premium' ? '3px solid #e17055' : 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: activeTab === 'premium' ? '#2d3436' : '#636e72'
                }}
              >
                Premium Services
              </button>
            </div>
            
            {/* Package Sections */}
            <div style={{padding: '20px'}}>
              {/* Regular Utensil Cleaning */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px',
                borderColor: packageStates.utensilCleaning.selected ? '#e17055' : '#dfe6e9'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Utensil Cleaning</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#e17055', fontWeight: 'bold'}}>4.7</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(1.2M reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#e17055', fontSize: '18px'}}>₹1,200</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Monthly service</div>
                  </div>
                </div>
                
                {/* Person Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>Persons:</span>
                  <div style={{display: 'flex', alignItems: 'center', border: '1px solid #dfe6e9', borderRadius: '20px'}}>
                    <button 
                      onClick={() => handlePersonChange('decrement')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f5f5f5',
                        border: 'none',
                        borderRight: '1px solid #dfe6e9',
                        borderRadius: '20px 0 0 20px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>
                      {packageStates.utensilCleaning.persons}
                    </span>
                    <button 
                      onClick={() => handlePersonChange('increment')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f5f5f5',
                        border: 'none',
                        borderLeft: '1px solid #dfe6e9',
                        borderRadius: '0 20px 20px 0',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div style={{margin: '15px 0'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>All kind of daily utensil cleaning</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Party used type utensil cleaning</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handlePackageSelect('utensilCleaning')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: packageStates.utensilCleaning.selected ? '#e17055' : '#fff',
                    color: packageStates.utensilCleaning.selected ? '#fff' : '#e17055',
                    border: '1px solid #e17055',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {packageStates.utensilCleaning.selected ? 'SELECTED' : 'SELECT SERVICE'}
                </button>
              </div>
              
              {/* Sweeping & Mopping */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px',
                borderColor: packageStates.sweepingMopping.selected ? '#00b894' : '#dfe6e9'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Sweeping & Mopping</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#00b894', fontWeight: 'bold'}}>4.8</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(1.5M reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#00b894', fontSize: '18px'}}>₹1,200</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Monthly service</div>
                  </div>
                </div>
                
                {/* House Size Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>House Size:</span>
                  <div style={{display: 'flex', alignItems: 'center', border: '1px solid #dfe6e9', borderRadius: '20px'}}>
                    <button 
                      onClick={() => handleHouseSizeChange('decrement')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f5f5f5',
                        border: 'none',
                        borderRight: '1px solid #dfe6e9',
                        borderRadius: '20px 0 0 20px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>
                      {packageStates.sweepingMopping.houseSize}
                    </span>
                    <button 
                      onClick={() => handleHouseSizeChange('increment')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f5f5f5',
                        border: 'none',
                        borderLeft: '1px solid #dfe6e9',
                        borderRadius: '0 20px 20px 0',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div style={{margin: '15px 0'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Daily sweeping and mopping of 2 rooms, 1 Hall</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handlePackageSelect('sweepingMopping')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: packageStates.sweepingMopping.selected ? '#00b894' : '#fff',
                    color: packageStates.sweepingMopping.selected ? '#fff' : '#00b894',
                    border: '1px solid #00b894',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {packageStates.sweepingMopping.selected ? 'SELECTED' : 'SELECT SERVICE'}
                </button>
              </div>
              
              {/* Bathroom Cleaning */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px',
                borderColor: packageStates.bathroomCleaning.selected ? '#0984e3' : '#dfe6e9'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Bathroom Cleaning</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#0984e3', fontWeight: 'bold'}}>4.6</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(980K reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#0984e3', fontSize: '18px'}}>₹600</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Monthly service</div>
                  </div>
                </div>
                
                {/* Bathroom Number Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>Bathrooms:</span>
                  <div style={{display: 'flex', alignItems: 'center', border: '1px solid #dfe6e9', borderRadius: '20px'}}>
                    <button 
                      onClick={() => handleBathroomChange('decrement')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f5f5f5',
                        border: 'none',
                        borderRight: '1px solid #dfe6e9',
                        borderRadius: '20px 0 0 20px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>
                      {packageStates.bathroomCleaning.bathrooms}
                    </span>
                    <button 
                      onClick={() => handleBathroomChange('increment')}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f5f5f5',
                        border: 'none',
                        borderLeft: '1px solid #dfe6e9',
                        borderRadius: '0 20px 20px 0',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div style={{margin: '15px 0'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Weekly cleaning of bathrooms</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handlePackageSelect('bathroomCleaning')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: packageStates.bathroomCleaning.selected ? '#0984e3' : '#fff',
                    color: packageStates.bathroomCleaning.selected ? '#fff' : '#0984e3',
                    border: '1px solid #0984e3',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {packageStates.bathroomCleaning.selected ? 'SELECTED' : 'SELECT SERVICE'}
                </button>
              </div>
              
              {/* Add-ons Section */}
              <div style={{marginBottom: '20px'}}>
                <h3 style={{color: '#2d3436', marginBottom: '15px', fontSize: '18px'}}>Regular Add-on Services</h3>
                
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
                  {/* Bathroom Deep Cleaning */}
                  <div style={{
                    border: '1px solid #dfe6e9',
                    borderRadius: '10px',
                    padding: '15px',
                    flex: '1 1 45%',
                    minWidth: '200px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderColor: addOns.bathroomDeepCleaning ? '#00b894' : '#dfe6e9'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Bathroom Deep Cleaning</h4>
                      <span style={{fontWeight: 'bold', color: '#00b894', fontSize: '16px'}}>+₹1,000</span>
                    </div>
                    <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                      Weekly cleaning of bathrooms, all bathroom walls cleaned
                    </div>
                    <button 
                      onClick={() => handleAddOnSelect('bathroomDeepCleaning')}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: addOns.bathroomDeepCleaning ? '#00b894' : 'rgba(228, 245, 241, 0.2)',
                        color: addOns.bathroomDeepCleaning ? '#fff' : '#00b894',
                        border: addOns.bathroomDeepCleaning ? 'none' : '2px solid #00b894',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                        {addOns.bathroomDeepCleaning ? 'ADDED' : '+ Add This Service'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Normal Dusting */}
                  <div style={{
                    border: '1px solid #dfe6e9',
                    borderRadius: '10px',
                    padding: '15px',
                    flex: '1 1 45%',
                    minWidth: '200px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderColor: addOns.normalDusting ? '#0984e3' : '#dfe6e9'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Normal Dusting</h4>
                      <span style={{fontWeight: 'bold', color: '#0984e3', fontSize: '16px'}}>+₹1,000</span>
                    </div>
                    <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                      Daily furniture dusting, doors, carpet, bed making
                    </div>
                    <button 
                      onClick={() => handleAddOnSelect('normalDusting')}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: addOns.normalDusting ? '#0984e3' : 'rgba(234, 245, 254, 0.2)',
                        color: addOns.normalDusting ? '#fff' : '#0984e3',
                        border: addOns.normalDusting ? 'none' : '2px solid #0984e3',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                        {addOns.normalDusting ? 'ADDED' : '+ Add This Service'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Deep Dusting */}
                  <div style={{
                    border: '1px solid #dfe6e9',
                    borderRadius: '10px',
                    padding: '15px',
                    flex: '1 1 45%',
                    minWidth: '200px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderColor: addOns.deepDusting ? '#e17055' : '#dfe6e9'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Deep Dusting</h4>
                      <span style={{fontWeight: 'bold', color: '#e17055', fontSize: '16px'}}>+₹1,500</span>
                    </div>
                    <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                      Includes chemical agents cleaning: décor items, furniture
                    </div>
                    <button 
                      onClick={() => handleAddOnSelect('deepDusting')}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: addOns.deepDusting ? '#e17055' : 'hsla(13, 87.50%, 96.90%, 0.20)',
                        color: addOns.deepDusting ? '#fff' : '#e17055',
                        border: addOns.deepDusting ? 'none' : '2px solid #e17055',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                        {addOns.deepDusting ? 'ADDED' : 'Add This Service'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Utensil Drying */}
                  <div style={{
                    border: '1px solid #dfe6e9',
                    borderRadius: '10px',
                    padding: '15px',
                    flex: '1 1 45%',
                    minWidth: '200px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderColor: addOns.utensilDrying ? '#00b894' : '#dfe6e9'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Utensil Drying</h4>
                      <span style={{fontWeight: 'bold', color: '#00b894', fontSize: '16px'}}>+₹1,000</span>
                    </div>
                    <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                      Househelp will dry and make proper arrangements
                    </div>
                    <button 
                      onClick={() => handleAddOnSelect('utensilDrying')}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: addOns.utensilDrying ? '#00b894' : 'rgba(228, 245, 241, 0.2)',
                        color: addOns.utensilDrying ? '#fff' : '#00b894',
                        border: addOns.utensilDrying ? 'none' : '2px solid #00b894',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                        {addOns.utensilDrying ? 'ADDED' : '+ Add This Service'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Clothes Drying */}
                  <div style={{
                    border: '1px solid #dfe6e9',
                    borderRadius: '10px',
                    padding: '15px',
                    flex: '1 1 45%',
                    minWidth: '200px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    borderColor: addOns.clothesDrying ? '#0984e3' : '#dfe6e9'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Clothes Drying</h4>
                      <span style={{fontWeight: 'bold', color: '#0984e3', fontSize: '16px'}}>+₹1,000</span>
                    </div>
                    <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                      Househelp will get clothes from/to drying place
                    </div>
                    <button 
                      onClick={() => handleAddOnSelect('clothesDrying')}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: addOns.clothesDrying ? '#0984e3' : 'rgba(234, 245, 254, 0.2)',
                        color: addOns.clothesDrying ? '#fff' : '#0984e3',
                        border: addOns.clothesDrying ? 'none' : '2px solid #0984e3',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                        {addOns.clothesDrying ? 'ADDED' : '+ Add This Service'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Voucher Section */}
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
                <button style={{
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
            
            {/* Footer with Checkout */}
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
                  Total for {countSelectedServices()} services ({countSelectedAddOns()} add-ons)
                </div>
                <div style={{fontWeight: 'bold', fontSize: '20px', color: '#2d3436'}}>
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </div>
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
                      backgroundColor: hasSelectedServices() ? '#e17055' : '#bdc3c7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: hasSelectedServices() ? 'pointer' : 'not-allowed'
                    }}
                    onClick={handleCheckout}
                    disabled={!hasSelectedServices()}
                  >
                    CHECKOUT
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
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

export default MaidServiceDialog;