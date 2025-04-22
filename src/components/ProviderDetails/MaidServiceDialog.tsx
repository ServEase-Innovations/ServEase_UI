import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { DialogContent } from '@mui/material';

const MaidServiceDialog = ({ open, handleClose }) => {
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'premium'
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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle person count change
  const handlePersonChange = (operation) => {
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

  // Handle house size change
  const handleHouseSizeChange = (operation) => {
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

  // Handle bathroom count change
  const handleBathroomChange = (operation) => {
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

  // Handle package selection
  const handlePackageSelect = (packageName) => {
    setPackageStates(prev => ({
      ...prev,
      [packageName]: {
        ...prev[packageName],
        selected: !prev[packageName].selected
      }
    }));
  };

  // Handle add-on selection
  const handleAddOnSelect = (addOnName) => {
    setAddOns(prev => ({
      ...prev,
      [addOnName]: !prev[addOnName]
    }));
  };

  // Calculate total price
  const calculateTotal = () => {
    let total = 0;
    
    // Add package prices
    if (packageStates.utensilCleaning.selected) total += 1200;
    if (packageStates.sweepingMopping.selected) total += 1200;
    if (packageStates.bathroomCleaning.selected) total += 600;
    
    // Add add-on prices
    if (addOns.bathroomDeepCleaning) total += 1000;
    if (addOns.normalDusting) total += 1000;
    if (addOns.deepDusting) total += 1500;
    if (addOns.utensilDrying) total += 1000;
    if (addOns.clothesDrying) total += 1000;
    
    return total;
  };

  // Count selected services
  const countSelectedServices = () => {
    let count = 0;
    if (packageStates.utensilCleaning.selected) count++;
    if (packageStates.sweepingMopping.selected) count++;
    if (packageStates.bathroomCleaning.selected) count++;
    return count;
  };

  // Count selected add-ons
  const countSelectedAddOns = () => {
    return Object.values(addOns).filter(Boolean).length;
  };

  return (
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
                      backgroundColor: addOns.bathroomDeepCleaning ? '#00b894' : 'rgba(234, 254, 250, 0.2)',
                      color: addOns.bathroomDeepCleaning ? '#fff' : '#00b894',
                      border: addOns.bathroomDeepCleaning ? 'none' : '2px solid rgb(235, 247, 244)',
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
            <button style={{
              padding: '12px 25px',
              backgroundColor: '#e17055',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              CHECKOUT
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaidServiceDialog;