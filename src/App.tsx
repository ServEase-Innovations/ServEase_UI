/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useCallback, useEffect, useState, useRef } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Header } from "./components/Header/Header";
import { Landingpage } from "./components/Landing_Page/Landingpage";
import { DetailsView } from "./components/DetailsView/DetailsView";
import Admin from "./components/Admin/Admin";
import Login from "./components/Login/Login";
import Confirmationpage from "./components/ServiceProvidersDetails/Confirmationpage";
import Checkout from "./components/Checkout/Checkout";
import UserProfile from "./components/User-Profile/UserProfile";
import Booking from "./components/User-Profile/Bookings";
import { ADMIN, AGENT_DASHBOARD, BOOKINGS, CHECKOUT, CONFIRMATION, DASHBOARD, DETAILS, LOGIN, PROFILE } from "./Constants/pagesConstants";
import { ServiceProviderContext } from "./context/ServiceProviderContext";
import AgentRegistrationForm from "./components/Registration/AgentRegistrationForm";
import axios from "axios";
import { useDispatch } from "react-redux";
import ServiceProviderDashboard from "./components/DetailsView/ServiceProviderDashboard";
import { RootState } from './store/userStore'; 
import HomePage from "./components/HomePage/HomePage";
import Dashboard from "./components/ServiceProvider/Dashboard";
import ProfileScreen from "./components/User-Profile/ProfileScreen";
import { useAuth0 } from "@auth0/auth0-react";
import AboutPage from "./components/AboutUs/AboutUs";
import ContactUs from "./components/ContactUs/ContactUs";
import Footer from "./components/Footer/Footer";
import BookingRequestToast, {
  isBookingToastInfoOnly,
  normalizeSocketBookingForToast,
} from "./components/Notifications/BookingRequestToast";
import { io, Socket } from "socket.io-client";
import Chatbot from "./components/Chat/Chatbot";
import ChatbotButton from "./components/Chat/ChatbotButton";
import ChatGlobalSocket from "./components/Chat/ChatGlobalSocket";
import { useAppUser } from "./context/AppUserContext";
import PrivacyPolicy from "./TermsAndConditions/PrivacyPolicy";
import TnC from "./TermsAndConditions/TnC";
import MobileNumberDialog from "./components/User-Profile/MobileNumberDialog";
import { useCustomerMobileCheck } from "./components/hooks/useCustomerMobileCheck";
import { setHasMobileNumber } from "./features/customer/customerSlice";
import { ClipLoader } from 'react-spinners';
import { LanguageProvider } from "./context/LanguageContext";
import AgentDashboard from "./components/Agent/AgentDashboard";
import { urls } from "./config/urls";
import { Alert, Snackbar } from "@mui/material";
import {
  acceptEngagement,
  dismissProviderNewBookingNotifications,
  parseAcceptEngagementError,
  parseEngagementId,
  resolveProviderId,
} from "./services/engagementService";
import { inAppToBookingRequestPayload } from "./components/Notifications/inAppToBookingRequestPayload";
import {
  isProviderNotificationSession,
  resolveProviderIdNumber,
} from "./utils/spSession";
import PaymentInstance from "./services/paymentInstance";
import { getBookingNotificationAction } from "./utils/bookingNotificationAction";
import SupportTicketDetailDialog from "./components/User-Profile/SupportTicketDetailDialog";
import type { OpenSupportTicketDetail } from "./utils/supportTicketEvents";

// Import the LanguageProvider

function App() {
  const [selection, setSelection] = useState<string | undefined>(); 
  const [handleDropDownValue, setDropDownValue] = useState<string | undefined>(); 
  const [checkoutData, setCheckoutData] = useState<any>();
  const [selectedBookingType, setSelectedBookingType] = useState<string | undefined>();
  const [serviceProviderDetails, setServiceProvidersData] = useState<string | undefined>();
  const [currentSection, setCurrentSection] = useState<string>("HOME");
  const [notificationReceived, setNotificationReceived] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<any>(null);
  const [acceptingEngagementId, setAcceptingEngagementId] = useState<number | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [bookingSnack, setBookingSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [toastOpen, setToastOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [chatSupportPreview, setChatSupportPreview] = useState<string | null>(null);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [supportTicketId, setSupportTicketId] = useState<number | null>(null);
  
  // Deep linking states
  const [deepLinkProcessed, setDeepLinkProcessed] = useState(false);
  const [processingDeepLink, setProcessingDeepLink] = useState(false);
  const [pendingDeepLink, setPendingDeepLink] = useState<{
    openBookings: string, 
    customerId: string | null,
    bookingId: string | null,
    action: string | null
  } | null>(null);

  console.log("Loaded ENV =", process.env.REACT_APP_API_URL, process.env.REACT_APP_ENV);
  console.log("UTILS BASE URL =", process.env.REACT_APP_UTLIS_URL , process.env.REACT_PROVIDER_URL);

  const selectedBookingTypeValue = { selectedBookingType, setSelectedBookingType };
  const dispatch = useDispatch();

  const { showMobileDialog } = useCustomerMobileCheck();

  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const { setAppUser, appUser, authSessionReady } = useAppUser();
  const paymentsSocketRef = useRef<Socket | null>(null);
  const spToastEnabledRef = useRef(false);
  const appUserRef = useRef(appUser);
  const dismissedToastEngagementsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    appUserRef.current = appUser;
  }, [appUser]);

  const canShowProviderBookingToast = useCallback(() => {
    const u = appUserRef.current as Record<string, unknown> | null | undefined;
    return (
      resolveProviderIdNumber(u) != null && isProviderNotificationSession(u)
    );
  }, []);

  const tryShowBookingToastFromInApp = useCallback(async () => {
    if (!canShowProviderBookingToast()) return;
    const spId = resolveProviderIdNumber(
      appUserRef.current as Record<string, unknown> | null | undefined
    );
    if (spId == null) return;

    try {
      const { data } = await PaymentInstance.get("/api/in-app-notifications", {
        params: {
          recipientType: "provider",
          recipientId: String(spId),
          unreadOnly: "true",
          limit: 10,
        },
      });
      const items = (data?.notifications || []) as Array<{
        id: string;
        type: string;
        engagementId: string | null;
        title: string;
        body?: string;
        metadata?: unknown;
        readAt: string | null;
        createdAt?: string;
        bookingActionable?: boolean;
        bookingClosureLabel?: string | null;
      }>;

      const newest = items.find((n) => {
        if (n.readAt) return false;
        const t = String(n.type || "").toUpperCase();
        if (t !== "NEW_BOOKING_OPPORTUNITY" && t !== "NEW_BOOKING_REQUEST") {
          return false;
        }
        const action = getBookingNotificationAction(n);
        return action?.actionable !== false;
      });
      if (!newest) return;

      const eid = parseEngagementId(newest.engagementId);
      if (eid == null || dismissedToastEngagementsRef.current.has(eid)) return;

      const mapped = inAppToBookingRequestPayload({
        type: newest.type,
        engagementId: newest.engagementId,
        title: newest.title ?? "New booking",
        body: newest.body,
        metadata: newest.metadata,
      });
      if (
        !mapped ||
        parseEngagementId(mapped.engagement_id) == null ||
        isBookingToastInfoOnly(mapped)
      ) {
        return;
      }

      setActiveToast((cur) => {
        const curId = cur ? parseEngagementId(cur.engagement_id) : null;
        if (curId != null) return cur;
        return mapped;
      });
    } catch {
      /* non-blocking — socket may still deliver the toast */
    }
  }, [canShowProviderBookingToast]);

  const onChatUnreadDelta = useCallback((d: number) => {
    setChatUnread((n) => Math.max(0, n + d));
  }, []);
  const onChatResetUnread = useCallback(() => {
    setChatUnread(0);
    setChatSupportPreview(null);
  }, []);

  // ============= MODIFIED DEEP LINKING WITH AUTH0 =============

  // Process deep link after authentication
  const processDeepLink = (openBookings: string, customerId: string | null, bookingId: string | null, action: string | null = 'open') => {
    setProcessingDeepLink(true);
    
    // Store data in sessionStorage for the Booking component
    if (customerId) {
      sessionStorage.setItem('deepLinkCustomerId', customerId);
      console.log(`📦 Will show ALL bookings for customer #${customerId}`);
    }
    
    if (bookingId) {
      sessionStorage.setItem('deepLinkBookingId', bookingId);
      console.log(`📦 Will open specific booking #${bookingId}`);
    }
    
    sessionStorage.setItem('deepLinkTimestamp', Date.now().toString());
    
    // MODIFIED: Always set action to 'drawer' by default
    // This ensures that even without action=drawer parameter, the drawer will open
    sessionStorage.setItem('deepLinkAction', 'drawer');
    console.log(`📦 Default action set to 'drawer' for automatic drawer opening`);
    
    // Set the selection to BOOKINGS
    setSelection(BOOKINGS);
    setCurrentSection("HOME");
    
    // Mark as processed
    setDeepLinkProcessed(true);
    setPendingDeepLink(null);
    setProcessingDeepLink(false);
    
    // Clean up the URL (remove query parameters)
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    
    // Clean up session storage
    sessionStorage.removeItem('pendingDeepLinkCustomerId');
    sessionStorage.removeItem('pendingDeepLinkBookingId');
    sessionStorage.removeItem('pendingDeepLinkTimestamp');
    sessionStorage.removeItem('pendingDeepLinkAction');
    sessionStorage.removeItem('auth0ReturnTo');
    
    console.log('✅ Deep link processed successfully with automatic drawer opening');
  };

  // Check for deep link parameters on initial load
  useEffect(() => {
    const checkDeepLink = () => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const openBookings = params.get('openBookings');
      const customerId = params.get('customerId');      // For viewing all bookings of a customer
      const bookingId = params.get('bookingId');        // For viewing specific booking
      const action = params.get('action');              // 'open' or 'drawer'
      
      console.log('=== DEEP LINK CHECK ===');
      console.log('Current URL:', window.location.href);
      console.log('openBookings param:', openBookings);
      console.log('customerId param:', customerId);
      console.log('bookingId param:', bookingId);
      console.log('action param:', action);
      console.log('Is authenticated:', isAuthenticated);
      console.log('Auth loading:', isLoading);

      if (openBookings === 'true') {
        if (isAuthenticated) {
          // User is already logged in, process deep link immediately
          console.log('✅ User authenticated, processing deep link now');
          processDeepLink(openBookings, customerId, bookingId, action);
        } else if (!isLoading) {
          // User not logged in and auth not loading, store deep link for after login
          console.log('🔐 User not authenticated, storing deep link for after login');
          
          // Store in state
          setPendingDeepLink({
            openBookings: openBookings,
            customerId: customerId,
            bookingId: bookingId,
            action: action
          });
          
          // Also store in sessionStorage as backup
          if (customerId) {
            sessionStorage.setItem('pendingDeepLinkCustomerId', customerId);
          }
          if (bookingId) {
            sessionStorage.setItem('pendingDeepLinkBookingId', bookingId);
          }
          sessionStorage.setItem('pendingDeepLinkTimestamp', Date.now().toString());
          
          // MODIFIED: Store action as 'drawer' by default
          // If action parameter exists, use it; otherwise default to 'drawer'
          const actionToStore = action || 'drawer';
          sessionStorage.setItem('pendingDeepLinkAction', actionToStore);
          console.log(`📦 Stored pending action: ${actionToStore}`);
          
          console.log(`📦 Stored pending deep link data:`, {
            customerId: customerId || 'none',
            bookingId: bookingId || 'none',
            action: actionToStore
          });
          
          // Store the return URL to come back to after login
          sessionStorage.setItem('auth0ReturnTo', window.location.pathname + window.location.search);
          
          // Redirect to login via Auth0
          console.log('➡️ Redirecting to Auth0 login...');
          loginWithRedirect({
            appState: {
              returnTo: window.location.pathname + window.location.search
            }
          });
        }
      }
    };

    // Only check if not already processed and auth is not loading
    if (!deepLinkProcessed && !isLoading) {
      checkDeepLink();
    }
  }, [isAuthenticated, isLoading, deepLinkProcessed, loginWithRedirect]);

  // Handle post-login deep link processing
  useEffect(() => {
    if (isAuthenticated && !deepLinkProcessed && !isLoading) {
      // Check if we have a pending deep link in state
      if (pendingDeepLink) {
        console.log('🔄 User just logged in, processing pending deep link from state');
        processDeepLink(
          pendingDeepLink.openBookings, 
          pendingDeepLink.customerId, 
          pendingDeepLink.bookingId, 
          pendingDeepLink.action
        );
      } 
      // Also check sessionStorage as backup
      else {
        const pendingCustomerId = sessionStorage.getItem('pendingDeepLinkCustomerId');
        const pendingBookingId = sessionStorage.getItem('pendingDeepLinkBookingId');
        const pendingTimestamp = sessionStorage.getItem('pendingDeepLinkTimestamp');
        const pendingAction = sessionStorage.getItem('pendingDeepLinkAction');
        
        if ((pendingCustomerId || pendingBookingId) && pendingTimestamp) {
          const now = Date.now();
          const linkTime = parseInt(pendingTimestamp);
          const tenMinutes = 10 * 60 * 1000;
          
          if (now - linkTime < tenMinutes) {
            console.log('🔄 Found pending deep link in sessionStorage, processing...');
            processDeepLink('true', pendingCustomerId, pendingBookingId, pendingAction);
          } else {
            // Clear expired deep link
            sessionStorage.removeItem('pendingDeepLinkCustomerId');
            sessionStorage.removeItem('pendingDeepLinkBookingId');
            sessionStorage.removeItem('pendingDeepLinkTimestamp');
            sessionStorage.removeItem('pendingDeepLinkAction');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, deepLinkProcessed, pendingDeepLink]);

  useEffect(() => {
    setMobileDialogOpen(showMobileDialog);
  }, [showMobileDialog]);

  const handleDataFromChild = (data: string, type?: 'section' | 'selection') => {
    console.log("Data received from child component:", data);
    
    if (data === DETAILS || data === BOOKINGS || data === PROFILE || data === DASHBOARD || data === AGENT_DASHBOARD) {
      setSelection(data);
      setCurrentSection("HOME");
    } else if (type === 'section') {
      setCurrentSection(data);
      setSelection(undefined);
    } else {
      setSelection(data);
    }
  };

  useEffect(() => {
    if (activeToast) {
      setAcceptError(null);
    }
  }, [activeToast?.engagement_id]);

  const handleAccept = async (engagementId: number | string) => {
    const eid = parseEngagementId(engagementId);
    if (eid == null) {
      const msg = "Invalid booking id.";
      setAcceptError(msg);
      setBookingSnack({ open: true, message: msg, severity: "error" });
      return;
    }
    setAcceptError(null);
    setAcceptingEngagementId(eid);
    try {
      const result = await acceptEngagement(eid, appUser as Record<string, unknown>);
      setActiveToast(null);
      setAcceptError(null);
      setBookingSnack({
        open: true,
        message: result.message,
        severity: "success",
      });
      window.dispatchEvent(new CustomEvent("in-app-unread-refresh"));
    } catch (err) {
      const msg = parseAcceptEngagementError(err);
      setAcceptError(msg);
      setBookingSnack({ open: true, message: msg, severity: "error" });
      console.error("Failed to accept engagement", err);
    } finally {
      setAcceptingEngagementId(null);
    }
  };

  const handleReject = async (engagementId: number) => {
    const eid = parseEngagementId(engagementId);
    const providerId = resolveProviderId(appUser as Record<string, unknown>);
    if (eid != null) {
      dismissedToastEngagementsRef.current.add(eid);
      if (providerId != null) {
        await dismissProviderNewBookingNotifications(eid, providerId);
      }
    }
    setActiveToast(null);
    setAcceptError(null);
    window.dispatchEvent(new CustomEvent("in-app-unread-refresh"));
  };

  const handleCheckoutItems = (item: any) => {
    setCheckoutData(item);
  };

  const getSelectedFromDropDown = (e: string) => {
    setSelection(undefined);
    setCheckoutData(undefined);
    setDropDownValue(e);
  };

  const handleSelectedBookingType = (e: string) => {
    console.log("Selected booking type:", e);
    setSelectedBookingType(e);
  };

  const handleSelectedProvider = (e: any) => {
    console.log(e);
    setServiceProvidersData(e);
  };

  const handleAboutClick = () => {
    setCurrentSection("ABOUT");
    setSelection(undefined);
  };

  const handleContactClick = () => {
    setCurrentSection("CONTACT");
    setSelection(undefined);
  };

  const handlePrivacyPolicyClick = () => {
    setCurrentSection("PRIVACY_POLICY");
    setSelection(undefined);
  };

  const handleTermsClick = () => {
    setCurrentSection("TERMS_CONDITIONS");
  };

  const handleBackToHome = () => {
    setCurrentSection("HOME");
    setSelection(undefined);
  };

  const handleLogoClick = () => {
    setCurrentSection("HOME");
    setSelection(undefined);
  };

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const onOpenTicket = (e: Event) => {
      const detail = (e as CustomEvent<OpenSupportTicketDetail>).detail;
      const id = Number(detail?.ticketId);
      if (Number.isFinite(id) && id > 0) setSupportTicketId(id);
    };
    window.addEventListener("open-support-ticket", onOpenTicket);
    return () => window.removeEventListener("open-support-ticket", onOpenTicket);
  }, []);

  // Effect for socket connection (providers + customers for in-app notifications)
  useEffect(() => {
    if (!appUser) {
      return;
    }

    const hasSession = Boolean(
      isAuthenticated || (appUser.role && localStorage.getItem("token"))
    );
    if (!hasSession) {
      return;
    }

    // Auth0: wait until token bridge + check-email have set role / ids
    if (isAuthenticated) {
      if (!authSessionReady) return;
      if (!appUser.role) return;
    }

    const providerId = resolveProviderIdNumber(
      appUser as Record<string, unknown> | null | undefined
    );
    const joinProviderRoom = providerId != null;
    spToastEnabledRef.current =
      joinProviderRoom &&
      isProviderNotificationSession(appUser as Record<string, unknown>);
    const customerId =
      appUser.customerid != null
        ? Number(appUser.customerid)
        : appUser.customerId != null
          ? Number(appUser.customerId)
          : null;
    const isCustomer = customerId != null && Number.isFinite(customerId);

    if (!joinProviderRoom && !isCustomer) return;

    const emitJoinRooms = (sock: Socket) => {
      if (joinProviderRoom && providerId != null) {
        sock.emit("join", { providerId });
        console.log(`[socket] join provider_${providerId}`);
      }
      if (isCustomer) {
        sock.emit("join", { customerId });
        console.log(`[socket] join customer_${customerId}`);
      }
    };

    const paymentsSocketUrl = urls.payments;
    const newSocket = io(paymentsSocketUrl, {
      // Polling first: works when raw WebSocket is blocked; upgrades when possible
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    paymentsSocketRef.current = newSocket;
    const showSpBookingToast = (data: unknown) => {
      if (!canShowProviderBookingToast()) return;
      if (!data || typeof data !== "object") return;
      const normalized = normalizeSocketBookingForToast(
        data as Record<string, unknown>
      );
      const eid = parseEngagementId(normalized.engagement_id);
      if (eid == null || dismissedToastEngagementsRef.current.has(eid)) return;
      if (isBookingToastInfoOnly(normalized)) return;
      setActiveToast((cur) => {
        const curId = cur ? parseEngagementId(cur.engagement_id) : null;
        if (curId != null) return cur;
        return normalized;
      });
    };

    newSocket.on("connect", () => {
      console.log(`[socket] connected to ${paymentsSocketUrl}`);
      emitJoinRooms(newSocket);
    });
    newSocket.on("reconnect", () => emitJoinRooms(newSocket));

    newSocket.on("new-engagement", showSpBookingToast);
    newSocket.on("new-engagement-request", showSpBookingToast);

    newSocket.on("booking-request-closed", (data: unknown) => {
      if (!data || typeof data !== "object") return;
      const closedId = parseEngagementId(
        (data as { engagement_id?: unknown }).engagement_id
      );
      if (closedId == null) return;
      setActiveToast((cur) => {
        if (!cur) return null;
        const curId = parseEngagementId(cur.engagement_id);
        return curId === closedId ? null : cur;
      });
      window.dispatchEvent(new CustomEvent("in-app-unread-refresh"));
    });

    newSocket.on("in_app_notification", (payload: {
      type?: string;
      metadata?: unknown;
      engagementId?: string | null;
      title?: string;
      body?: string;
    }) => {
      window.dispatchEvent(new CustomEvent("in-app-unread-refresh"));
      const t = String(payload?.type || "").toUpperCase();
      if (
        canShowProviderBookingToast() &&
        (t === "NEW_BOOKING_OPPORTUNITY" || t === "NEW_BOOKING_REQUEST")
      ) {
        const mapped = inAppToBookingRequestPayload({
          type: payload.type,
          engagementId: payload.engagementId ?? null,
          title: payload.title ?? "New booking",
          body: payload.body,
          metadata: payload.metadata,
        });
        const eid = mapped ? parseEngagementId(mapped.engagement_id) : null;
        if (
          mapped &&
          eid != null &&
          !dismissedToastEngagementsRef.current.has(eid) &&
          !isBookingToastInfoOnly(mapped)
        ) {
          setActiveToast((cur) => {
            const curId = cur ? parseEngagementId(cur.engagement_id) : null;
            if (curId != null) return cur;
            return mapped;
          });
        }
      }
      if (isCustomer && t.includes("SUPPORT_TICKET")) {
        const meta =
          payload?.metadata && typeof payload.metadata === "object"
            ? (payload.metadata as Record<string, unknown>)
            : null;
        const tid = Number(meta?.ticket_id ?? meta?.ticketId);
        if (Number.isFinite(tid) && tid > 0) setSupportTicketId(tid);
      }
    });

    newSocket.on("connect_error", (err) => {
      console.warn(
        `[socket] payments unavailable (${paymentsSocketUrl}): ${err.message}. ` +
          "Start payments on port 4100: npm run dev (monorepo) or npm run dev:payments."
      );
    });

    setSocket(newSocket);

    return () => {
      paymentsSocketRef.current = null;
      newSocket.disconnect();
    };
  }, [
    isAuthenticated,
    authSessionReady,
    appUser,
    appUser?.role,
    appUser?.serviceProviderId,
    appUser?.serviceproviderid,
    appUser?.dual_role,
    appUser?.customerid,
    appUser?.customerId,
    canShowProviderBookingToast,
  ]);

  // HTTP fallback when socket events are missed (SP not in room yet, connect_error, etc.)
  useEffect(() => {
    if (!authSessionReady || !appUser || !canShowProviderBookingToast()) return;

    void tryShowBookingToastFromInApp();

    const onRefresh = () => {
      void tryShowBookingToastFromInApp();
    };
    window.addEventListener("in-app-unread-refresh", onRefresh);

    const poll = window.setInterval(() => {
      void tryShowBookingToastFromInApp();
    }, 12_000);

    return () => {
      window.removeEventListener("in-app-unread-refresh", onRefresh);
      window.clearInterval(poll);
    };
  }, [
    authSessionReady,
    appUser,
    appUser?.role,
    appUser?.serviceProviderId,
    appUser?.serviceproviderid,
    appUser?.dual_role,
    canShowProviderBookingToast,
    tryShowBookingToastFromInApp,
  ]);

  // Keep toast gate in sync when appUser changes without recreating the socket
  useEffect(() => {
    const providerId = resolveProviderIdNumber(
      appUser as Record<string, unknown> | null | undefined
    );
    spToastEnabledRef.current =
      providerId != null &&
      isProviderNotificationSession(appUser as Record<string, unknown>);
  }, [appUser, appUser?.role, appUser?.dual_role, appUser?.serviceProviderId, appUser?.serviceproviderid]);

  // Re-join rooms when provider/customer ids arrive after connect (Auth0 post-login)
  useEffect(() => {
    const sock = paymentsSocketRef.current;
    if (!sock?.connected || !appUser) return;

    const providerId = resolveProviderIdNumber(
      appUser as Record<string, unknown> | null | undefined
    );
    const customerId =
      appUser.customerid != null
        ? Number(appUser.customerid)
        : appUser.customerId != null
          ? Number(appUser.customerId)
          : null;

    if (providerId != null) {
      sock.emit("join", { providerId });
    }
    if (customerId != null && Number.isFinite(customerId)) {
      sock.emit("join", { customerId });
    }
  }, [
    appUser,
    appUser?.serviceProviderId,
    appUser?.serviceproviderid,
    appUser?.dual_role,
    appUser?.customerid,
    appUser?.customerId,
  ]);

  const shouldShowFooter = () => {
    const noFooterPages = [
      LOGIN, ADMIN, DASHBOARD,
      PROFILE, BOOKINGS, DETAILS, CONFIRMATION, CHECKOUT,
    ];
    return !noFooterPages.includes(selection as string) && currentSection === "HOME";
  };

 const renderContent = () => {
  if (currentSection === "ABOUT") {
    return <AboutPage onBack={handleBackToHome} />;
  }
  
  if (currentSection === "CONTACT") {
    return <ContactUs onBack={handleBackToHome} />;
  }
  
  if (currentSection === "PRIVACY_POLICY") {
    return <PrivacyPolicy onBack={handleBackToHome} />;
  }
  
  if (currentSection === "TERMS_CONDITIONS") {
    return <TnC onBack={handleBackToHome} />;
  }    

  if (selection === DETAILS) {
    return <DetailsView selected={selectedBookingType} sendDataToParent={handleDataFromChild} selectedProvider={handleSelectedProvider}/>;
  } else if (selection === CONFIRMATION) {
    return <Confirmationpage role={selectedBookingType} providerDetails={serviceProviderDetails} sendDataToParent={handleDataFromChild} />;
  } else if (selection === CHECKOUT) {
    return <Checkout providerDetails={serviceProviderDetails} sendDataToParent={handleDataFromChild}/>;
  } else if (selection === LOGIN) {
    return (
      <div className="w-full max-w-4xl h-[75%]">
        <Login sendDataToParent={handleDataFromChild} />
      </div>
    );
  } else if (selection === BOOKINGS) {
    return <Booking handleDataFromChild={handleDataFromChild} />;
  } else if (selection === DASHBOARD) {
    return <Dashboard onNavigate={handleDataFromChild} />;
  } else if (selection === AGENT_DASHBOARD) {  
    return <AgentDashboard />; 
  } else if (selection === PROFILE) {
    return <ProfileScreen/>;
  } else if (selection === ADMIN) {
    return <Admin />;
  }

  return (
    <ServiceProviderContext.Provider value={selectedBookingTypeValue}>
      <HomePage
        sendDataToParent={(data) => handleDataFromChild(data, 'selection')}
        bookingType={handleSelectedBookingType}
        onAboutClick={handleAboutClick}
        onContactClick={handleContactClick}
      />
    </ServiceProviderContext.Provider>
  );
};
  return (
    <LanguageProvider>
      <div className="bg-gray-50 text-gray-800">
        {/* Deep linking loading overlay */}
        {processingDeepLink && (
          <div className="fixed inset-0 bg-white/90 z-50 flex flex-col items-center justify-center" style={{ zIndex: 9999 }}>
            <ClipLoader color="#3b82f6" size={50} />
            <p className="mt-4 text-lg font-medium text-gray-700">Opening your booking...</p>
          </div>
        )}

        <Header
          sendDataToParent={(data) => handleDataFromChild(data)}
          bookingType={""}
          onAboutClick={handleAboutClick}
          onContactClick={handleContactClick}
          onLogoClick={handleLogoClick}
        />

        {renderContent()}

        {mobileDialogOpen && appUser?.customerid && (
          <MobileNumberDialog
            open={mobileDialogOpen}
            onClose={() => {
              setMobileDialogOpen(false);
            }}
            customerId={appUser.customerid}
            onSuccess={() => {
              console.log("Mobile number updated successfully!");
              dispatch(setHasMobileNumber(true));
              setMobileDialogOpen(false);
            }}
          />
        )}

        

        <ChatGlobalSocket
          chatbotOpen={chatbotOpen}
          onUnreadDelta={onChatUnreadDelta}
          onResetUnread={onChatResetUnread}
          onSupportMessagePreview={setChatSupportPreview}
        />

        <ChatbotButton
          open={chatbotOpen}
          onToggle={() => setChatbotOpen(!chatbotOpen)}
          unreadCount={chatUnread}
          supportPreview={chatSupportPreview}
          onDismissSupportPreview={() => setChatSupportPreview(null)}
          onOpenFromSupportPreview={() => setChatbotOpen(true)}
        />

        <Chatbot
          open={chatbotOpen}
          onClose={() => setChatbotOpen(false)}
        />
        
        {shouldShowFooter() && (
          <Footer 
            onAboutClick={handleAboutClick} 
            onContactClick={handleContactClick} 
            onPrivacyPolicyClick={handlePrivacyPolicyClick}
            onTermsClick={handleTermsClick}
          />
        )}

        {activeToast && (
          <BookingRequestToast
            engagement={activeToast}
            onAccept={handleAccept}
            onReject={handleReject}
            onClose={() => {
              const eid = parseEngagementId(activeToast.engagement_id);
              if (eid != null) dismissedToastEngagementsRef.current.add(eid);
              setActiveToast(null);
              setAcceptError(null);
            }}
            actionBusy={
              parseEngagementId(activeToast.engagement_id) === acceptingEngagementId
            }
            acceptError={acceptError}
          />
        )}

        <Snackbar
          open={bookingSnack.open}
          autoHideDuration={6000}
          onClose={() => setBookingSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setBookingSnack((s) => ({ ...s, open: false }))}
            severity={bookingSnack.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {bookingSnack.message}
          </Alert>
        </Snackbar>

        <SupportTicketDetailDialog
          open={supportTicketId != null}
          onClose={() => setSupportTicketId(null)}
          ticketId={supportTicketId}
          customerId={
            appUser?.customerid != null
              ? Number(appUser.customerid)
              : appUser?.customerId != null
                ? Number(appUser.customerId)
                : undefined
          }
        />
      </div>
    </LanguageProvider>
  );
}

export default App;