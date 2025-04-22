import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';

import { DialogContent } from '@mui/material';

const NannyServicesDialog = ({ open, handleClose }) => {
  const [activeTab, setActiveTab] = useState('baby'); // 'baby' or 'elderly'
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
          <h1 style={{color: '#2d3436', margin: '0 0 15px 0', fontSize: '24px'}}>NANNY SERVICES</h1>
          
          <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
  <button 
    onClick={() => setActiveTab('baby')}
    style={{
      flex: 1,
      padding: '15px',
      backgroundColor: '#fff',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      color: '#2d3436'
    }}
  >
    <div style={{
      borderBottom: activeTab === 'baby' ? '2px solid #e17055' : 'none',
      width: '50%', // 👈 controls how wide the underline is
      margin: '0 auto' // centers the underline
    }}>
      Baby Care
    </div>
  </button>

  <button 
    onClick={() => setActiveTab('elderly')}
    style={{
      flex: 1,
      padding: '15px',
      backgroundColor: '#fff',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer',
      color: '#2d3436'
    }}
  >
    <div style={{
      borderBottom: activeTab === 'elderly' ? '2px solid #e17055' : 'none',
      width: '50%',
      margin: '0 auto'
    }}>
      Elderly Care
    </div>
  </button>
</div>
</div>
        
        {/* Package Sections */}
        <div style={{padding: '20px'}}>
          {activeTab === 'baby' ? (
            <>
              {/* Baby Care - Day */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Baby Care - Day</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#e17055', fontWeight: 'bold'}}>4.8</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(1.5M reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#e17055', fontSize: '18px'}}>₹16,000 - ₹17,600</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Daytime care</div>
                  </div>
                </div>
                
                {/* Age Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>Age:</span>
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
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>≤3</span>
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
                    <span>Professional daytime baby care</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Age-appropriate activities</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Meal preparation and feeding</span>
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
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  SELECT SERVICE
                </button>
              </div>
              
              {/* Baby Care - Night */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Baby Care - Night</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#00b894', fontWeight: 'bold'}}>4.9</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(1.2M reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#00b894', fontSize: '18px'}}>₹20,000 - ₹22,000</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Overnight care</div>
                  </div>
                </div>
                
                {/* Age Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>Age:</span>
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
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>≤3</span>
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
                    <span>Professional overnight baby care</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Night feeding and diaper changes</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Sleep routine establishment</span>
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
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  SELECT SERVICE
                </button>
              </div>
              
              {/* 24 Hours In-House Care */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>24 Hours In-House Care</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#0984e3', fontWeight: 'bold'}}>4.9</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(980K reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#0984e3', fontSize: '18px'}}>₹23,000 - ₹25,000</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Full-time care</div>
                  </div>
                </div>
                
                {/* Age Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>Age:</span>
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
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>≤3</span>
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
                    <span>Round-the-clock professional care</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>All daily care activities included</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Live-in nanny service</span>
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
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  SELECT SERVICE
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Elderly Care - Day */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Elderly Care - Day</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#e17055', fontWeight: 'bold'}}>4.7</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(1.1M reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#e17055', fontSize: '18px'}}>₹16,000 - ₹17,600</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Daytime care</div>
                  </div>
                </div>
                
                {/* Age Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>Age:</span>
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
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>≤65</span>
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
                    <span>Professional daytime elderly care</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Medication management</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Meal preparation and assistance</span>
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
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  SELECT SERVICE
                </button>
              </div>
              
              {/* Elderly Care - Night */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>Elderly Care - Night</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#00b894', fontWeight: 'bold'}}>4.8</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(950K reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#00b894', fontSize: '18px'}}>₹20,000 - ₹22,000</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Overnight care</div>
                  </div>
                </div>
                
                {/* Age Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>Age:</span>
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
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>≤65</span>
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
                    <span>Professional overnight elderly care</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Night-time assistance and monitoring</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Sleep comfort and safety</span>
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
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  SELECT SERVICE
                </button>
              </div>
              
              {/* 24 Hours In-House Elderly Care */}
              <div style={{
                border: '1px solid #dfe6e9',
                borderRadius: '10px',
                padding: '15px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h2 style={{color: '#2d3436', margin: '0 0 5px 0'}}>24 Hours In-House Care</h2>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{color: '#0984e3', fontWeight: 'bold'}}>4.9</span>
                      <span style={{color: '#636e72', fontSize: '14px', marginLeft: '5px'}}>(850K reviews)</span>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', color: '#0984e3', fontSize: '18px'}}>₹23,000 - ₹25,000</div>
                    <div style={{color: '#636e72', fontSize: '14px'}}>Full-time care</div>
                  </div>
                </div>
                
                {/* Age Selector */}
                <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                  <span style={{marginRight: '15px', color: '#2d3436'}}>Age:</span>
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
                    <span style={{padding: '5px 15px', minWidth: '20px', textAlign: 'center'}}>≤65</span>
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
                    <span>Round-the-clock professional care</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>All daily care activities included</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: '10px', color: '#2d3436'}}>•</span>
                    <span>Live-in caregiver service</span>
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
                  cursor: 'pointer',
                  marginTop: '10px'
                }}>
                  SELECT SERVICE
                </button>
              </div>
            </>
          )}
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
            <div style={{color: '#636e72', fontSize: '14px'}}>Total for 2 services</div>
            <div style={{fontWeight: 'bold', fontSize: '20px', color: '#2d3436'}}>₹36,000</div>
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

export default NannyServicesDialog;