import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { DialogContent } from '@mui/material';

const CookServicesDialog = ({ open, handleClose }) => {
  const [packages, setPackages] = useState({
    breakfast: {
      selected: false,
      persons: 1,
      price: 1265
    },
    lunch: {
      selected: false,
      persons: 1,
      price: 717
    },
    dinner: {
      selected: false,
      persons: 1,
      price: 1899
    }
  });

  const handlePersonChange = (packageName, operation) => {
    setPackages(prev => {
      const currentValue = prev[packageName].persons;
      let newValue = currentValue;
      
      if (operation === 'increment' && currentValue < 15) {
        newValue = currentValue + 1;
      } else if (operation === 'decrement' && currentValue > 1) {
        newValue = currentValue - 1;
      }
      
      return {
        ...prev,
        [packageName]: {
          ...prev[packageName],
          persons: newValue
        }
      };
    });
  };

  const togglePackageSelection = (packageName) => {
    setPackages(prev => ({
      ...prev,
      [packageName]: {
        ...prev[packageName],
        selected: !prev[packageName].selected
      }
    }));
  };

  // Calculate total items and total price
  const selectedPackages = Object.entries(packages).filter(([_, pkg]) => pkg.selected);
  const totalItems = selectedPackages.length;
  const totalPersons = selectedPackages.reduce((sum, [_, pkg]) => sum + pkg.persons, 0);
  const totalPrice = selectedPackages.reduce((sum, [_, pkg]) => sum + (pkg.price * pkg.persons), 0);

  return (
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
          {/* Header */}
          <div style={{padding: '20px', borderBottom: '1px solid #f0f0f0'}}>
            <h1 style={{color: '#2d3436', margin: '0', fontSize: '24px'}}>MEAL PACKAGES</h1>
          </div>
          
          {/* Package Sections */}
          <div style={{padding: '20px'}}>
            {/* Breakfast Package */}
            <div style={{
              border: '1px solid #dfe6e9',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: packages.breakfast.selected ? '#fff8f6' : '#fff'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Breakfast </h2>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{color: '#e17055', fontWeight: 'bold'}}>4.84</span>
                    <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(2.9M reviews)</span>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontWeight: 'bold', color: '#e17055', fontSize: '18px'}}>₹{packages.breakfast.price}</div>
                  <div style={{color: '#636e72', fontSize: '14px'}}>30 mins preparation</div>
                </div>
              </div>
              
              {/* Person Selector */}
              <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                <span style={{marginRight: '15px', color: '#2d3436'}}>Persons:</span>
                <div style={{display: 'flex', alignItems: 'center', border: '1px solid #dfe6e9', borderRadius: '20px'}}>
                  <button 
                    onClick={() => handlePersonChange('breakfast', 'decrement')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f5f5f5',
                      border: 'none',
                      borderRight: '1px solid #dfe6e9',
                      borderRadius: '20px 0 0 20px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    disabled={packages.breakfast.persons <= 1}
                  >
                    -
                  </button>
                  <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>
                    {packages.breakfast.persons}
                  </span>
                  <button 
                    onClick={() => handlePersonChange('breakfast', 'increment')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f5f5f5',
                      border: 'none',
                      borderLeft: '1px solid #dfe6e9',
                      borderRadius: '0 20px 20px 0',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    disabled={packages.breakfast.persons >= 15}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div style={{margin: '15px 0'}}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>Continental breakfast platter</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>Fresh juices & coffee</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>Seasonal fruit basket</span>
                </div>
              </div>
              
              <button 
                onClick={() => togglePackageSelection('breakfast')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: packages.breakfast.selected ? '#e17055' : '#fff',
                  color: packages.breakfast.selected ? '#fff' : '#e17055',
                  border: '1px solid #e17055',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                {packages.breakfast.selected ? 'SELECTED' : 'SELECT PACKAGE'}
              </button>
            </div>
            
            {/* Lunch Package */}
            <div style={{
              border: '1px solid #dfe6e9',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: packages.lunch.selected ? '#f6fff8' : '#fff'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Lunch</h2>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{color: '#00b894', fontWeight: 'bold'}}>4.84</span>
                    <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(1.7M reviews)</span>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontWeight: 'bold', color: '#00b894', fontSize: '18px'}}>₹{packages.lunch.price}</div>
                  <div style={{color: '#636e72', fontSize: '14px'}}>45 mins preparation</div>
                </div>
              </div>
              
              {/* Person Selector */}
              <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                <span style={{marginRight: '15px', color: '#2d3436'}}>Persons:</span>
                <div style={{display: 'flex', alignItems: 'center', border: '1px solid #dfe6e9', borderRadius: '20px'}}>
                  <button 
                    onClick={() => handlePersonChange('lunch', 'decrement')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f5f5f5',
                      border: 'none',
                      borderRight: '1px solid #dfe6e9',
                      borderRadius: '20px 0 0 20px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    disabled={packages.lunch.persons <= 1}
                  >
                    -
                  </button>
                  <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>
                    {packages.lunch.persons}
                  </span>
                  <button 
                    onClick={() => handlePersonChange('lunch', 'increment')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f5f5f5',
                      border: 'none',
                      borderLeft: '1px solid #dfe6e9',
                      borderRadius: '0 20px 20px 0',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    disabled={packages.lunch.persons >= 15}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div style={{margin: '15px 0'}}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>Daily chef's special</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>Soup or salad</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>Dessert of the day</span>
                </div>
              </div>
              
              <button 
                onClick={() => togglePackageSelection('lunch')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: packages.lunch.selected ? '#00b894' : '#fff',
                  color: packages.lunch.selected ? '#fff' : '#e17055',
                  border: `1px solid ${packages.lunch.selected ? '#00b894' : '#e17055'}`,
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                {packages.lunch.selected ? 'SELECTED' : 'SELECT PACKAGE'}
              </button>
            </div>
            
            {/* Dinner Package */}
            <div style={{
              border: '1px solid #dfe6e9',
              borderRadius: '10px',
              padding: '15px',
              backgroundColor: packages.dinner.selected ? '#f6f9ff' : '#fff'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Dinner</h2>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                    <span style={{color: '#0984e3', fontWeight: 'bold'}}>4.84</span>
                    <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(2.7M reviews)</span>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontWeight: 'bold', color: '#0984e3', fontSize: '18px'}}>₹{packages.dinner.price}</div>
                  <div style={{color: '#636e72', fontSize: '14px'}}>1.5 hrs preparation</div>
                </div>
              </div>
              
              {/* Person Selector */}
              <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                <span style={{marginRight: '15px', color: '#2d3436'}}>Persons:</span>
                <div style={{display: 'flex', alignItems: 'center', border: '1px solid #dfe6e9', borderRadius: '20px'}}>
                  <button 
                    onClick={() => handlePersonChange('dinner', 'decrement')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f5f5f5',
                      border: 'none',
                      borderRight: '1px solid #dfe6e9',
                      borderRadius: '20px 0 0 20px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    disabled={packages.dinner.persons <= 1}
                  >
                    -
                  </button>
                  <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>
                    {packages.dinner.persons}
                  </span>
                  <button 
                    onClick={() => handlePersonChange('dinner', 'increment')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f5f5f5',
                      border: 'none',
                      borderLeft: '1px solid #dfe6e9',
                      borderRadius: '0 20px 20px 0',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    disabled={packages.dinner.persons >= 15}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div style={{margin: '15px 0'}}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>3-course gourmet meal</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>Wine pairing available</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                  <span>Chef's special dessert</span>
                </div>
              </div>
              
              <button 
                onClick={() => togglePackageSelection('dinner')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: packages.dinner.selected ? '#0984e3' : '#fff',
                  color: packages.dinner.selected ? '#fff' : '#e17055',
                  border: `1px solid ${packages.dinner.selected ? '#0984e3' : '#e17055'}`,
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                {packages.dinner.selected ? 'SELECTED' : 'SELECT PACKAGE'}
              </button>
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
                Total for {totalItems} item{totalItems !== 1 ? 's' : ''} ({totalPersons} person{totalPersons !== 1 ? 's' : ''})
              </div>
              <div style={{fontWeight: 'bold', fontSize: '20px', color: '#2d3436'}}>₹{totalPrice}</div>
            </div>
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
              disabled={totalItems === 0}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookServicesDialog;