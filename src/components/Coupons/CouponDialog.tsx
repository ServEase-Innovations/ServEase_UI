/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axios from 'axios';
import { DialogHeader } from '../ProviderDetails/CookServicesDialog.styles';
import { SkeletonLoader } from '../Common/SkeletonLoader/SkeletonLoader';
import { useAppUser } from 'src/context/AppUserContext'; // Import AppUser context

export interface Coupon {
  coupon_id: string;
  coupon_code: string;
  description: string;
  service_type: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  minimum_order_value: number;
  usage_limit: number;
  usage_per_user: number;
  start_date: string;
  end_date: string;
  city: string;
  isActive: boolean;
  created_at: string;
}

interface CouponDialogProps {
  open: boolean;
  handleClose: () => void;
  currentTotal: number;
  onApplyCoupon: (coupon: Coupon) => void;
  onRemoveCoupon: () => void;
  appliedCoupon?: Coupon | null;
  serviceType?: string;
  userCity?: string;
}

export const CouponDialog: React.FC<CouponDialogProps> = ({
  open,
  handleClose,
  currentTotal,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  serviceType = 'COOK',
  userCity = 'Bangalore'
}) => {
  const { appUser } = useAppUser(); // Get appUser from context
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [fetchingCoupons, setFetchingCoupons] = useState(false);

  // Get customer ID from appUser
  const customerId = appUser?.customerid || null;

  // Fetch coupons from API when dialog opens - using customer ID from appUser
  useEffect(() => {
    if (open && customerId) {
      fetchCoupons();
    }
  }, [open, customerId]);

  const fetchCoupons = async () => {
    setFetchingCoupons(true);
    setError(null);
    try {
      // Use customer-specific API endpoint with the customer ID from appUser
      const response = await axios.get(`https://coupons-o26r.onrender.com/api/coupons/customer/${customerId}`);
      if (response.data.success) {
        const now = new Date();
        // Filter coupons by service type, city, active status, and date range
        const filteredCoupons = response.data.data.coupons.filter((coupon: Coupon) => {
          const startDate = new Date(coupon.start_date);
          const endDate = new Date(coupon.end_date);
          return (
            coupon.isActive &&
            (coupon.service_type === serviceType || coupon.service_type === 'ALL') &&
            coupon.city === userCity &&
            startDate <= now &&
            endDate >= now
          );
        });
        setCoupons(filteredCoupons);
      } else {
        setError('Failed to load coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setFetchingCoupons(false);
    }
  };

  const validateCoupon = (coupon: Coupon): { valid: boolean; message?: string } => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is no longer active' };
    }

    // Check date validity
    if (startDate > now) {
      return { valid: false, message: `This coupon will be available from ${startDate.toLocaleDateString()}` };
    }
    if (endDate < now) {
      return { valid: false, message: 'This coupon has expired' };
    }

    // Check minimum order value
    if (coupon.minimum_order_value && currentTotal < coupon.minimum_order_value) {
      return { 
        valid: false, 
        message: `Minimum order of ₹${coupon.minimum_order_value} required for this coupon` 
      };
    }

    // Check service type
    if (coupon.service_type !== serviceType && coupon.service_type !== 'ALL') {
      return { valid: false, message: `This coupon is only valid for ${coupon.service_type} services` };
    }

    return { valid: true };
  };

  const handleApplyCoupon = async (coupon: Coupon) => {
    // Validate coupon
    const validation = validateCoupon(coupon);
    if (!validation.valid) {
      setError(validation.message || 'Invalid coupon');
      return;
    }

    setLoading(true);
    // Here you can make an API call to validate/apply coupon if needed
    setTimeout(() => {
      onApplyCoupon(coupon);
      setSuccess('Coupon applied successfully!');
      setError(null);
      setLoading(false);
      // Close dialog after short delay
      setTimeout(() => {
        handleClose();
        setSuccess(null);
        setCouponCode('');
      }, 1500);
    }, 500);
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    setSuccess(null);
    setError(null);
  };

  const handleCustomCouponApply = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    // Find coupon in fetched list
    const foundCoupon = coupons.find(
      c => c.coupon_code.toLowerCase() === couponCode.toLowerCase()
    );

    if (foundCoupon) {
      await handleApplyCoupon(foundCoupon);
    } else {
      setError('Invalid coupon code');
    }
  };

  const calculateDiscount = (coupon: Coupon): number => {
    if (coupon.discount_type === 'PERCENTAGE') {
      let discount = (currentTotal * coupon.discount_value) / 100;
      // You can add max discount logic here if needed
      return discount;
    } else {
      return coupon.discount_value;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Skeleton loader for coupon cards
  const CouponSkeleton = () => (
    <>
      {[1, 2, 3].map((index) => (
        <Box
          key={index}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#ffffff'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box flex={1}>
              <SkeletonLoader width="120px" height="24px" style={{ marginBottom: '8px' }} />
              <SkeletonLoader width="80%" height="16px" style={{ marginBottom: '8px' }} />
              <SkeletonLoader width="100px" height="12px" style={{ marginBottom: '6px' }} />
              <SkeletonLoader width="150px" height="12px" style={{ marginBottom: '6px' }} />
              <SkeletonLoader width="90px" height="12px" />
            </Box>
            <SkeletonLoader width="70px" height="32px" variant="rectangular" style={{ borderRadius: '6px' }} />
          </Box>
        </Box>
      ))}
    </>
  );

  // Show message if no customer ID is available
  if (!customerId && open) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogHeader>
          <Box display="flex" alignItems="center" gap={1}>
            <LocalOfferIcon sx={{ color: '#dbe3ea' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#ebeef4' }}>
              Coupons and Offers
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#fafafaff',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogHeader>
        <DialogContent>
          <Box textAlign="center" py={4}>
            <Typography variant="body2" sx={{ color: '#718096' }}>
              Please log in to view available coupons
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }
      }}
    >
      <DialogHeader>
        <Box display="flex" alignItems="center" gap={1}>
          <LocalOfferIcon sx={{ color: '#dbe3ea' }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#ebeef4' }}
          >
            Coupons and Offers
          </Typography>
        </Box>

        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#fafafaff',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogHeader>

      <DialogContent sx={{ p: 3, backgroundColor: '#ffffff' }}>
        {/* Applied Coupon */}
        {appliedCoupon && (
          <Box sx={{ mb: 3 }}>
            <Alert
              severity="info"
              icon={<LocalOfferIcon />}
              action={
                <Button
                  color="primary"
                  size="small"
                  onClick={handleRemoveCoupon}
                  sx={{ textTransform: 'none' }}
                >
                  Remove
                </Button>
              }
              sx={{ 
                borderRadius: '8px',
                backgroundColor: '#e3f2fd',
                '& .MuiAlert-icon': {
                  color: '#0984e3'
                }
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                Coupon Applied: {appliedCoupon.coupon_code}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {appliedCoupon.description}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Custom Coupon Input */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#4a5568', fontWeight: 500 }}>
            Have a coupon code?
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleCustomCouponApply}
              disabled={loading || !couponCode.trim() || fetchingCoupons}
              sx={{
                backgroundColor: '#0984e3',
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  backgroundColor: '#0773c5'
                }
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Apply'}
            </Button>
          </Box>
          {error && (
            <Typography variant="caption" sx={{ mt: 1, color: '#e53e3e', display: 'block' }}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography variant="caption" sx={{ mt: 1, color: '#38a169', display: 'block' }}>
              {success}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Available Coupons */}
        <Typography variant="subtitle2" sx={{ mb: 2, color: '#4a5568', fontWeight: 500 }}>
          Available Coupons
        </Typography>

        {fetchingCoupons ? (
          // Show skeleton loaders while fetching
          <CouponSkeleton />
        ) : coupons.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" sx={{ color: '#718096' }}>
              No coupons available at the moment
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
            {coupons.map((coupon) => {
              const isApplicable = !coupon.minimum_order_value || currentTotal >= coupon.minimum_order_value;
              const discountAmount = calculateDiscount(coupon);
              const isApplied = appliedCoupon?.coupon_id === coupon.coupon_id;

              return (
                <Box
                  key={coupon.coupon_id}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isApplied ? '#0984e3' : isApplicable ? '#e0e0e0' : '#f0f0f0',
                    backgroundColor: isApplied ? '#e3f2fd' : '#ffffff',
                    opacity: isApplicable ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box flex={1}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{ color: '#2d3748', letterSpacing: '0.5px' }}
                      >
                        {coupon.coupon_code}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4a5568', mt: 0.5 }}>
                        {coupon.description}
                      </Typography>
                      {coupon.minimum_order_value > 0 && (
                        <Typography variant="caption" sx={{ color: '#718096', mt: 0.5, display: 'block' }}>
                          Min. spend: ₹{coupon.minimum_order_value}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: '#718096', mt: 0.5, display: 'block' }}>
                        Valid until: {formatDate(coupon.end_date)}
                      </Typography>
                      {discountAmount > 0 && (
                        <Typography variant="caption" sx={{ color: '#0984e3', mt: 0.5, display: 'block', fontWeight: 500 }}>
                          You save: ₹{discountAmount.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    {isApplicable && !isApplied && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleApplyCoupon(coupon)}
                        disabled={loading}
                        sx={{
                          borderRadius: '6px',
                          textTransform: 'none',
                          borderColor: '#0984e3',
                          color: '#0984e3',
                          ml: 2,
                          '&:hover': {
                            borderColor: '#0773c5',
                            backgroundColor: '#0984e310'
                          }
                        }}
                      >
                        Collect
                      </Button>
                    )}
                    {isApplied && (
                      <Chip
                        label="Applied"
                        size="small"
                        sx={{
                          backgroundColor: '#0984e3',
                          color: 'white',
                          fontWeight: 500,
                          borderRadius: '6px',
                          ml: 2
                        }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Savings Summary */}
        {appliedCoupon && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
              Savings Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="body2" sx={{ color: '#0984e3' }}>
                Coupon Discount ({appliedCoupon.coupon_code}):
              </Typography>
              <Typography variant="body2" sx={{ color: '#0984e3', fontWeight: 600 }}>
                - ₹{calculateDiscount(appliedCoupon).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};