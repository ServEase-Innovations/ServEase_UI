/* eslint-disable */
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppUser } from 'src/context/AppUserContext';
import { fetchCustomerDetails } from 'src/features/customer/customerSlice';
import { RootState } from 'src/store/userStore';

export const useCustomerMobileCheck = () => {
  const dispatch = useDispatch();
  const { appUser, setAppUser } = useAppUser();

  const customerState = useSelector((state: RootState) => state.customer);
  const { hasMobileNumber, loading, mobileNo, alternateNo } = customerState;

  const lastCustomerIdRef = useRef<string | null>(null);

  useEffect(() => {
    const role = appUser?.role?.toUpperCase();
    if (!appUser || role !== 'CUSTOMER' || !appUser.customerid) {
      return;
    }

    const customerId = String(appUser.customerid);
    if (lastCustomerIdRef.current !== customerId) {
      lastCustomerIdRef.current = customerId;
      dispatch(fetchCustomerDetails(customerId) as any);
    }
  }, [appUser?.customerid, appUser?.role, dispatch]);

  /** Keep persisted appUser in sync so dialogs / profile see saved numbers. */
  useEffect(() => {
    if (hasMobileNumber !== true || !mobileNo) return;
    setAppUser((prev: Record<string, unknown> | null) => {
      if (!prev) return prev;
      if (prev.mobileNo === mobileNo && prev.alternateNo === (alternateNo ?? null)) {
        return prev;
      }
      return {
        ...prev,
        mobileNo,
        alternateNo: alternateNo ?? null,
      };
    });
  }, [hasMobileNumber, mobileNo, alternateNo, setAppUser]);

  return {
    hasMobileNumber,
    loading,
    /** Only prompt when fetch finished and mobile is actually missing. */
    showMobileDialog: !loading && hasMobileNumber === false,
  };
};
