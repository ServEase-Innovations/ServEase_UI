import { Dialog, DialogContent, DialogTitle, Button, Box, Typography, Divider, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import { removeFromCart, selectCartItems, updateCartItem } from '../../features/addToCart/addToSlice';
import { CartItem, isMaidCartItem, isMealCartItem, isNannyCartItem } from '../../types/cartSlice';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
interface CartDialogProps {
  open: boolean;
  handleClose: () => void;
  handleCheckout: () => void;
}

// Utility functions for houseSize handling
const parseHouseSize = (size?: string): number => {
  if (!size) return 1;
  const numericValue = parseInt(size, 10);
  return isNaN(numericValue) ? 1 : numericValue;
};

const formatHouseSize = (size: number): string => {
  return `${size}BHK`;
};

export const CartDialog: React.FC<CartDialogProps> = ({ 
  open, 
  handleClose, 
  handleCheckout,
}) => {
  const dispatch = useDispatch();
  const allCartItems = useSelector(selectCartItems);
  
  // Filter items by type
  const mealCartItems = allCartItems.filter(isMealCartItem);
  const maidCartItems = allCartItems.filter(isMaidCartItem);
  const nannyCartItems = allCartItems.filter(isNannyCartItem);
  
  // Calculate totals
  const mealCartTotal = mealCartItems.reduce((sum, item) => sum + item.price, 0);
  const maidCartTotal = maidCartItems.reduce((sum, item) => sum + item.price, 0);
  const nannyCartTotal = nannyCartItems.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = mealCartTotal + maidCartTotal + nannyCartTotal;
  const tax = totalPrice * 0.05;
  const grandTotal = totalPrice + tax;

  const handleRemoveItem = (id: string, itemType: CartItem['type']) => {
    dispatch(removeFromCart({ id, type: itemType }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{
      sx: {
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0'
      }
    }}>
     <DialogTitle sx={{ 
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e9ecef',
  fontWeight: '600',
  fontSize: '1.25rem',
  py: 2,
  px: 3,
  color: '#2d3748',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative' // Add this for proper positioning
}}>
  Your Order Summary
  <IconButton
    aria-label="close"
    onClick={handleClose}
    sx={{
      position: 'absolute',
      right: 8,
      top: 8,
      color: '#718096',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      }
    }}
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>
      
      <DialogContent sx={{ p: 0, backgroundColor: '#f8f9fa' }}>
        {allCartItems.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 6,
            backgroundColor: '#ffffff'
          }}>
            <Typography variant="body1" sx={{ color: '#4a5568', mb: 2 }}>
              Your cart is empty
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleClose}
              sx={{
                backgroundColor: '#4299e1',
                borderRadius: '6px',
                textTransform: 'none',
                px: 3,
                py: 1,
                fontSize: '0.9rem',
                '&:hover': {
                  backgroundColor: '#3182ce'
                }
              }}
            >
              Browse Services
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ p: 3, backgroundColor: '#ffffff' }}>
              {/* Meal Cart Items */}
              {mealCartItems.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2d3748' }}>
                    Meal Services
                  </Typography>
                  {mealCartItems.map((item, index) => (
                    <CartItemCard 
                      key={`meal_${item.id || index}`}
                      item={item}
                      onRemove={() => handleRemoveItem(item.id, 'meal')}
                      itemType="meal"
                    />
                  ))}
                  <Divider sx={{ my: 3 }} />
                </>
              )}
              
              {/* Maid Cart Items */}
              {maidCartItems.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2d3748' }}>
                    Maid Services
                  </Typography>
                  {maidCartItems.map((item, index) => (
                    <CartItemCard 
                      key={`maid_${item.id || index}`}
                      item={item}
                      onRemove={() => handleRemoveItem(item.id, 'maid')}
                      itemType="maid"
                    />
                  ))}
                  <Divider sx={{ my: 3 }} />
                </>
              )}
              
              {/* Nanny Cart Items */}
              {nannyCartItems.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2d3748' }}>
                    Nanny Services
                  </Typography>
                  {nannyCartItems.map((item, index) => (
                    <CartItemCard 
                      key={`nanny_${item.id || index}`}
                      item={item}
                      onRemove={() => handleRemoveItem(item.id, 'nanny')}
                      itemType="nanny"
                    />
                  ))}
                </>
              )}
            </Box>

            {/* Pricing Summary */}
            <Box sx={{ 
              backgroundColor: '#ffffff',
              borderTop: '1px solid #edf2f7',
              borderBottom: '1px solid #edf2f7',
              p: 3,
              boxShadow: '0 -1px 3px rgba(0,0,0,0.04)'
            }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#4a5568' }}>Subtotal:</Typography>
                <Typography variant="body2" sx={{ color: '#4a5568' }}>₹{totalPrice.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#4a5568' }}>Tax (5%):</Typography>
                <Typography variant="body2" sx={{ color: '#4a5568' }}>₹{tax.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#2d3748' }}>Total:</Typography>
                <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#2b6cb0' }}>₹{grandTotal.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ 
  my: 2,
  borderColor: '#cbd5e0', // Darker grey color
  borderWidth: '1px' // Slightly thicker
}} />

<Box sx={{ mt: 2 }}>
  <Typography variant="body2" sx={{ color: '#4a5568', fontWeight: 500, mb: 1 }}>
     We kindly ask you to review and agree to the following policies before proceeding:
  </Typography>

  <Box component="ul" sx={{
    pl: 2,
    listStyle: 'none',
    '& li': {
      mb: 1.5,
      display: 'flex',
      alignItems: 'center',
    }
  }}>
    <li>
      <input type="checkbox" style={{ marginRight: '8px' }} />
      <Typography variant="body2" component="span" sx={{ color: '#4a5568' }}>
        I agree to the ServEaso {' '}
        <a 
          href="https://www.servease.com/keyfacts" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3182ce', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Key Facts Statement
          <OpenInNewIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle' }} />
        </a>
      </Typography>
    </li>

    <li>
      <input type="checkbox" style={{ marginRight: '8px' }} />
      <Typography variant="body2" component="span" sx={{ color: '#4a5568' }}>
        I agree to the ServEaso {' '}
        <a 
          href="https://www.servease.com/tnc" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3182ce', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Terms and Conditions
          <OpenInNewIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle' }} />
        </a>
      </Typography>
    </li>

    <li>
      <input type="checkbox" style={{ marginRight: '8px' }} />
      <Typography variant="body2" component="span" sx={{ color: '#4a5568' }}>
        I agree to the ServEaso {' '}
        <a 
          href="https://www.servease.com/privacy" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3182ce', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Privacy Statement
          <OpenInNewIcon fontSize="small" style={{ marginLeft: 4, verticalAlign: 'middle' }} />
        </a>
      </Typography>
    </li>
  </Box>
</Box>
            </Box>
          </>
        )}
      </DialogContent>
      
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #edf2f7',
        borderRadius: '0 0 12px 12px'
      }}>
        <Typography variant="body2" sx={{ 
          color: '#4a5568', 
          fontWeight: '500',
          fontSize: '0.875rem'
        }}>
          {allCartItems.length} item{allCartItems.length !== 1 ? 's' : ''} selected
        </Typography>
        
        <Box display="flex" gap={2}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ 
              color: '#2b6cb0',
              borderColor: '#bee3f8',
              backgroundColor: '#ebf8ff',
              borderRadius: '6px',
              textTransform: 'none',
              px: 3,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: '500',
              '&:hover': {
                backgroundColor: '#bee3f8',
                borderColor: '#90cdf4'
              }
            }}
          >
            Continue Booking
          </Button>
          
          <Button
            variant="contained"
            onClick={handleCheckout}
            disabled={allCartItems.length === 0}
            sx={{ 
              fontWeight: '500',
              borderRadius: '6px',
              textTransform: 'none',
              px: 3,
              py: 1,
              fontSize: '0.9rem',
              backgroundColor: '#4299e1',
              boxShadow: 'none',
              '&:hover': { 
                backgroundColor: '#3182ce',
                boxShadow: 'none' 
              },
              '&:disabled': {
                backgroundColor: '#e2e8f0',
                color: '#a0aec0'
              }
            }}
          >
            Proceed to Checkout (₹{grandTotal.toFixed(2)})
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  itemType: CartItem['type'];
}

const CartItemCard = ({ item, onRemove, itemType }: CartItemCardProps) => {
  const dispatch = useDispatch();

  const handleIncrement = (field: string) => {
    if (isMealCartItem(item)) {
      dispatch(updateCartItem({
        id: item.id,
        type: 'meal',
        updates: { persons: (item.persons || 1) + 1 }
      }));
    } else if (isMaidCartItem(item)) {
      const details = item.details || {};
      if (field === 'persons') {
        dispatch(updateCartItem({
          id: item.id,
          type: 'maid',
          updates: { details: { ...details, persons: (details.persons || 1) + 1 } }
        }));
      } else if (field === 'houseSize') {
        const currentSize = parseHouseSize(details.houseSize);
        dispatch(updateCartItem({
          id: item.id,
          type: 'maid',
          updates: { 
            details: { 
              ...details, 
              houseSize: formatHouseSize(currentSize + 1) 
            } 
          }
        }));
      } else if (field === 'bathrooms') {
        dispatch(updateCartItem({
          id: item.id,
          type: 'maid',
          updates: { details: { ...details, bathrooms: (details.bathrooms || 1) + 1 } }
        }));
      }
    } else if (isNannyCartItem(item)) {
      dispatch(updateCartItem({
        id: item.id,
        type: 'nanny',
        updates: { age: (item.age || 1) + 1 }
      }));
    }
  };

  const handleDecrement = (field: string) => {
    if (isMealCartItem(item)) {
      if (item.persons > 1) {
        dispatch(updateCartItem({
          id: item.id,
          type: 'meal',
          updates: { persons: item.persons - 1 }
        }));
      }
    } else if (isMaidCartItem(item)) {
      const details = item.details || {};
      if (field === 'persons' && (details.persons || 0) > 1) {
        dispatch(updateCartItem({
          id: item.id,
          type: 'maid',
          updates: { details: { ...details, persons: (details.persons || 1) - 1 } }
        }));
      } else if (field === 'houseSize' && details.houseSize) {
        const currentSize = parseHouseSize(details.houseSize);
        if (currentSize > 1) {
          dispatch(updateCartItem({
            id: item.id,
            type: 'maid',
            updates: { 
              details: { 
                ...details, 
                houseSize: formatHouseSize(currentSize - 1) 
              } 
            }
          }));
        }
      } else if (field === 'bathrooms' && (details.bathrooms || 0) > 1) {
        dispatch(updateCartItem({
          id: item.id,
          type: 'maid',
          updates: { details: { ...details, bathrooms: (details.bathrooms || 1) - 1 } }
        }));
      }
    } else if (isNannyCartItem(item) && item.age > 1) {
      dispatch(updateCartItem({
        id: item.id,
        type: 'nanny',
        updates: { age: item.age - 1 }
      }));
    }
  };

  const getNumericValue = (field: string): number => {
    if (isMealCartItem(item) && field === 'persons') {
      return item.persons || 1;
    } else if (isMaidCartItem(item)) {
      const details = item.details || {};
      if (field === 'persons') return details.persons || 1;
      if (field === 'houseSize') return parseHouseSize(details.houseSize);
      if (field === 'bathrooms') return details.bathrooms || 1;
    } else if (isNannyCartItem(item) && field === 'age') {
      return item.age || 1;
    }
    return 1;
  };

  const renderCounter = (field: string, label: string) => {
    const value = getNumericValue(field);
    const displayValue = field === 'houseSize' ? formatHouseSize(value) : value;

    return (
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
        <span style={{ marginRight: '15px', color: '#2d3436', fontSize: '0.875rem' }}>{label}:</span>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dfe6e9', borderRadius: '20px' }}>
          <button 
            onClick={() => handleDecrement(field)}
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
          <span style={{ padding: '5px 15px', minWidth: '20px', textAlign: 'center', fontSize: '0.875rem' }}>
            {displayValue}
          </span>
          <button 
            onClick={() => handleIncrement(field)}
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
    );
  };

  const getItemType = () => {
    if (isNannyCartItem(item)) {
      return 'Nanny Service';
    }
    if (isMaidCartItem(item)) {
      return item.serviceType === 'package' ? 'Package' : 'Add-on';
    }
    return 'Meal Package';
  };

  const getItemName = () => {
    if (isMaidCartItem(item)) {
      return item.name.replace(/([A-Z])/g, ' $1').trim();
    }
    if (isNannyCartItem(item)) {
      return `${item.careType === 'baby' ? 'Baby' : 'Elderly'} Care - ${item.packageType.charAt(0).toUpperCase() + item.packageType.slice(1)}`;
    }
    if (isMealCartItem(item)) {
      return item.mealType;
    }
    return '';
  };

  return (
    <Box sx={{ 
      mb: 3,
      p: 3,
      borderRadius: '8px',
      border: '1px solid #edf2f7',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      position: 'relative'
    }}>
      <IconButton
        onClick={onRemove}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#e53e3e',
          '&:hover': {
            backgroundColor: 'rgba(229, 62, 62, 0.08)'
          }
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight="600" sx={{ 
          color: '#2d3748',
          textTransform: 'capitalize',
          letterSpacing: '0.5px',
          mb: 1.5
        }}>
          {getItemName()} {getItemType()}
        </Typography>
      </Box>
      
      {/* Add counters based on item type */}
      {isMealCartItem(item) && renderCounter('persons', 'Persons')}
      
      {isMaidCartItem(item) && (
        <>
          {item.details?.persons !== undefined && renderCounter('persons', 'Persons')}
          {item.details?.houseSize !== undefined && renderCounter('houseSize', 'House Size')}
          {item.details?.bathrooms !== undefined && renderCounter('bathrooms', 'Bathrooms')}
        </>
      )}
      
      {isNannyCartItem(item) && renderCounter('age', 'Age')}
      
      <Typography variant="body2" sx={{ 
        mt: 1.5, 
        mb: 1, 
        color: '#4a5568', 
        fontWeight: '500',
        fontSize: '0.875rem'
      }}>
        Includes:
      </Typography>
      
      <Box component="ul" sx={{ 
        pl: 2.5,
        color: '#4a5568',
        fontSize: '0.875rem',
        '& li': { 
          mb: 0.75,
          position: 'relative',
          pl: '16px',
          '&:before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '8px',
            width: '6px',
            height: '6px',
            backgroundColor: '#4299e1',
            borderRadius: '50%'
          }
        }
      }}>
        {item.description.split('\n').map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </Box>
      
      <Box display="flex" justifyContent="space-between" sx={{ mt: 2.5 }}>
        <Typography variant="body2" sx={{ color: '#4a5568', fontWeight: '500' }}>
          Price:
        </Typography>
        <Typography variant="body2" fontWeight="600" sx={{ color: '#2d3748' }}>
          ₹{item.price.toFixed(2)}
        </Typography>
      </Box>
      
    </Box>
  );
};