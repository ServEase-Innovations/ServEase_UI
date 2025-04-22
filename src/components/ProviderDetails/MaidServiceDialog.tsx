import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';

import { DialogContent } from '@mui/material';

const MaidServiceDialog = ({ open, handleClose }) => {
  const [activeTab, setActiveTab] = useState('baby'); // 'baby' or 'elderly'
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
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: '#fff',
                border: 'none',
                borderBottom: '3px solid #e17055',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#2d3436'
              }}
            >
              Regular Services
            </button>
            <button 
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: '#fff',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#636e72'
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
              marginBottom: '20px'
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
                  <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderRight: '1px solid #dfe6e9',
                    borderRadius: '20px 0 0 20px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                    -
                  </button>
                  <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>3</span>
                  <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderLeft: '1px solid #dfe6e9',
                    borderRadius: '0 20px 20px 0',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
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
              
              <button style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#fff',
                color: '#e17055',
                border: '1px solid #e17055',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                SELECT SERVICE
              </button>
            </div>
            
            {/* Sweeping & Mopping */}
            <div style={{
              border: '1px solid #dfe6e9',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px'
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
                  <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderRight: '1px solid #dfe6e9',
                    borderRadius: '20px 0 0 20px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                    -
                  </button>
                  <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>2BHK</span>
                  <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderLeft: '1px solid #dfe6e9',
                    borderRadius: '0 20px 20px 0',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
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
              
              <button style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#fff',
                color: '#e17055',
                border: '1px solid #e17055',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                SELECT SERVICE
              </button>
            </div>
            
            {/* Bathroom Cleaning */}
            <div style={{
              border: '1px solid #dfe6e9',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px'
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
                  <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderRight: '1px solid #dfe6e9',
                    borderRadius: '20px 0 0 20px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
                    -
                  </button>
                  <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>2</span>
                  <button style={{
                    padding: '5px 10px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderLeft: '1px solid #dfe6e9',
                    borderRadius: '0 20px 20px 0',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}>
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
              
              <button style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#fff',
                color: '#e17055',
                border: '1px solid #e17055',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                SELECT SERVICE
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Bathroom Deep Cleaning</h4>
                    <span style={{fontWeight: 'bold', color: '#00b894', fontSize: '16px'}}>+₹1,000</span>
                  </div>
                  <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                    Weekly cleaning of bathrooms, all bathroom walls cleaned
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(234, 254, 250, 0.2)',
                    color: '#00b894',
                    border: '2px solid rgb(235, 247, 244)',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                      {/* <PlusIcon size={16} /> */}+
                      Add This Service
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Normal Dusting</h4>
                    <span style={{fontWeight: 'bold', color: '#0984e3', fontSize: '16px'}}>+₹1,000</span>
                  </div>
                  <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                    Daily furniture dusting, doors, carpet, bed making
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(234, 245, 254, 0.2)',
                    color: '#0984e3',
                    border: '2px solid #0984e3',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                      {/* <PlusIcon size={16} /> */}+
                      Add This Service
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Deep Dusting</h4>
                    <span style={{fontWeight: 'bold', color: '#e17055', fontSize: '16px'}}>+₹1,500</span>
                  </div>
                  <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                    Includes chemical agents cleaning: décor items, furniture
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'hsla(13, 87.50%, 96.90%, 0.20)',
                    color: '#e17055',
                    border: '2px solid #e17055',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                      {/* <PlusIcon size={16} /> */}
                      Add This Service
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Utensil Drying</h4>
                    <span style={{fontWeight: 'bold', color: '#00b894', fontSize: '16px'}}>+₹1,000</span>
                  </div>
                  <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                    Househelp will dry and make proper arrangements
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(228, 245, 241, 0.2)',
                    color: '#00b894',
                    border: '2px solid #00b894',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                      {/* <PlusIcon size={16} /> */}
                      +
                      Add This Service
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <h4 style={{color: '#2d3436', margin: '0', fontWeight: '600'}}>Clothes Drying</h4>
                    <span style={{fontWeight: 'bold', color: '#0984e3', fontSize: '16px'}}>+₹1,000</span>
                  </div>
                  <div style={{color: '#636e72', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4'}}>
                    Househelp will get clothes from/to drying place
                  </div>
                  <button style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(234, 245, 254, 0.2)',
                    color: '#0984e3',
                    border: '2px solid #0984e3',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                      {/* <PlusIcon size={16} /> */}
                      +
                      Add This Service
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
          <div style={{
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{color: '#636e72', fontSize: '14px'}}>Total for 2 services (3 add-ons)</div>
              <div style={{fontWeight: 'bold', fontSize: '20px', color: '#2d3436'}}>₹4,200</div>
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