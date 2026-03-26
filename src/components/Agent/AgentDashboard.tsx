/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { ColDef } from 'ag-grid-community';
import providerInstance from 'src/services/providerInstance'; // Adjust path as needed
import { SkeletonLoader } from '../Common/SkeletonLoader/SkeletonLoader'; // Adjust path as needed
import { useAuth0 } from "@auth0/auth0-react";
import { useAppUser } from "src/context/AppUserContext";
import { useLanguage } from "src/context/LanguageContext";

// --- Data Types ---
interface ProviderData {
  id: string;
  providerName: string;
  type: string;
  dateRegistered: string;
  status: string;
  action: string;
  mobileNo?: string;
  emailId?: string;
  experience?: number;
  rating?: number;
}

interface VendorData {
  vendorId: string;
  address: string;
  companyName: string;
  createdDate: string;
  emailid: string;
  isActive: boolean;
  phoneNo: string;
  registrationId: string;
  serviceProviders: ServiceProvider[];
  providers: ServiceProviderDetails[];
}

interface ServiceProvider {
  serviceproviderid: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
  emailId: string;
  housekeepingRole: string;
  experience: number;
}

interface ServiceProviderDetails {
  serviceproviderid: string;
  vendorId: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
  emailId: string;
  housekeepingRole: string;
  experience: number;
  dob: string;
  currentLocation: string;
  rating: number;
  isactive: boolean;
  enrolleddate: string;
}

const AgentDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user: auth0User, isAuthenticated } = useAuth0();
  const { appUser } = useAppUser();

  // Navigation State: 'dashboard' | 'all-providers' | 'applications' | 'register'
  const [currentView, setCurrentView] = useState<'dashboard' | 'all-providers' | 'applications' | 'register'>('dashboard');
  
  // Data State
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get vendor ID from appUser context (similar to ProfileScreen)
  const vendorId = appUser?.vendorId ? Number(appUser.vendorId) : null;

  // Fetch vendor data on component mount
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await providerInstance.get(`/api/vendor/${vendorId}`);
        
        if (response.data?.status === 200 && response.data?.data) {
          const vendorDataResponse = response.data.data;
          setVendorData(vendorDataResponse);
          
          // Transform service providers to the format needed for the grid
          const transformedProviders = transformProvidersData(vendorDataResponse.providers || []);
          setProviders(transformedProviders);
          setError(null);
        } else {
          setError(t('fetchFailed') || 'Failed to fetch vendor data');
        }
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        setError(t('unableToLoad') || 'Unable to load provider data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId, isAuthenticated, t]);

  // Transform API data to grid format
  const transformProvidersData = (apiProviders: ServiceProviderDetails[]): ProviderData[] => {
    return apiProviders.map(provider => ({
      id: provider.serviceproviderid,
      providerName: `${provider.firstName} ${provider.lastName}`,
      type: formatProviderType(provider.housekeepingRole),
      dateRegistered: formatDateForDisplay(provider.enrolleddate),
      status: provider.isactive ? 'Active' : 'Inactive',
      action: 'View Profile',
      mobileNo: provider.mobileNo,
      emailId: provider.emailId,
      experience: provider.experience,
      rating: provider.rating
    }));
  };

  // Format provider type for display
  const formatProviderType = (role: string): string => {
    const typeMap: { [key: string]: string } = {
      'NANNY': t('caregiver') || 'Caregiver',
      'COOK': t('cook') || 'Cook',
      'CLEANING': t('cleaning') || 'Cleaning',
      'MAID': t('maidCleaning') || 'Maid / Cleaning'
    };
    return typeMap[role] || role;
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stats based on actual data
  const getProviderStats = () => {
    const activeProviders = providers.filter(p => p.status === 'Active');
    const cooks = providers.filter(p => p.type === (t('cook') || 'Cook')).length;
    const cleaning = providers.filter(p => p.type === (t('cleaning') || 'Cleaning') || p.type === (t('maidCleaning') || 'Maid / Cleaning')).length;
    const caregivers = providers.filter(p => p.type === (t('caregiver') || 'Caregiver')).length;
    
    return {
      totalActive: activeProviders.length,
      cooks,
      cleaning,
      caregivers
    };
  };

  const columnDefs: ColDef<ProviderData>[] = [
    { field: 'providerName', headerName: t('providerName') || 'Provider Name', flex: 1.5, sortable: true, filter: true },
    { field: 'type', headerName: t('type') || 'Type', flex: 1, sortable: true, filter: true },
    { field: 'dateRegistered', headerName: t('dateRegistered') || 'Date Registered', flex: 1.2, sortable: true },
    { 
      field: 'status', 
      headerName: t('status') || 'Status', 
      flex: 1.2,
      cellStyle: params => {
        if (params.value === 'Active') return { color: '#16a34a', fontWeight: 'bold' };
        return { color: '#dc2626', fontWeight: 'bold' };
      }
    },
    { 
      field: 'action', 
      headerName: t('action') || 'Action', 
      flex: 1,
      cellRenderer: (p: any) => (
        <button 
          style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
          onClick={() => handleViewProfile(p.data)}
        >
          {p.value}
        </button>
      )
    }
  ];

  const handleViewProfile = (provider: ProviderData) => {
    alert(`${t('provider')}: ${provider.providerName}\n${t('type')}: ${provider.type}\n${t('mobileNumber')}: ${provider.mobileNo || 'N/A'}\n${t('email')}: ${provider.emailId || 'N/A'}\n${t('experience')}: ${provider.experience || 0} ${t('years')}\n${t('rating')}: ${provider.rating || 0}/5`);
  };

  // Helper to render the table title based on view
  const getTableTitle = () => {
    if (currentView === 'applications') return t('pendingApplications') || "Pending Applications";
    if (currentView === 'all-providers') return t('allAgencyProviders') || "All Agency Providers";
    return t('recentRegistrations') || "Recent Registrations & Status";
  };

  // Show loading state with skeleton loaders
  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#D6E6F7', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
        {/* Navbar Skeleton */}
        <nav style={{ 
          background: 'linear-gradient(90deg, #001F3F 0%, #004080 100%)', 
          padding: '12px 40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: 'white',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <SkeletonLoader width={120} height={28} />
          <div style={{ display: 'flex', gap: '25px' }}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} width={80} height={20} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <SkeletonLoader width={150} height={32} />
            </div>
            <div style={{ borderRadius: '50%', overflow: 'hidden' }}>
              <SkeletonLoader width={30} height={30} />
            </div>
            <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <SkeletonLoader width={80} height={32} />
            </div>
          </div>
        </nav>

        <div style={{ padding: '30px 60px' }}>
          {/* Title Skeleton */}
          <SkeletonLoader width={300} height={32} />
          <div style={{ marginBottom: '20px' }}></div>
          
          {/* Welcome Card Skeleton */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.4)', 
            backdropFilter: 'blur(12px)', 
            borderRadius: '15px', 
            padding: '30px', 
            marginBottom: '30px'
          }}>
            <SkeletonLoader width={250} height={32} />
            <div style={{ marginBottom: '20px' }}></div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ borderRadius: '30px', overflow: 'hidden' }}>
                <SkeletonLoader width={200} height={48} />
              </div>
              <div style={{ borderRadius: '30px', overflow: 'hidden' }}>
                <SkeletonLoader width={160} height={48} />
              </div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: 'rgba(255, 255, 255, 0.7)', borderRadius: '15px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ borderRadius: '50%', overflow: 'hidden' }}>
                  <SkeletonLoader width={40} height={40} />
                </div>
                <div style={{ flex: 1 }}>
                  <SkeletonLoader width={100} height={20} />
                  <div style={{ marginBottom: '8px' }}></div>
                  <SkeletonLoader width={80} height={16} />
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Table Skeleton */}
            <div style={{ flex: 2, background: 'white', borderRadius: '15px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <SkeletonLoader width={200} height={24} />
                <SkeletonLoader width={120} height={20} />
              </div>
              <div className="ag-theme-alpine" style={{ height: '280px', width: '100%' }}>
                {/* Simulate table rows */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    padding: '12px 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <SkeletonLoader width="25%" height={20} />
                    <SkeletonLoader width="15%" height={20} />
                    <SkeletonLoader width="20%" height={20} />
                    <SkeletonLoader width="15%" height={20} />
                    <SkeletonLoader width="15%" height={20} />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: '15px', padding: '24px' }}>
                <SkeletonLoader width={120} height={16} />
                <div style={{ marginBottom: '12px' }}></div>
                <SkeletonLoader width={100} height={32} />
                <div style={{ marginBottom: '12px' }}></div>
                <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
                  <SkeletonLoader width="100%" height={6} />
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: '15px', padding: '24px' }}>
                <SkeletonLoader width={150} height={24} />
                <div style={{ marginBottom: '16px' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ borderRadius: '6px', overflow: 'hidden' }}>
                      <SkeletonLoader width="100%" height={40} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ backgroundColor: '#D6E6F7', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
        <div style={{ padding: '30px 60px', textAlign: 'center' }}>
          <div style={{ color: '#dc2626', fontSize: '18px', marginBottom: '20px' }}>⚠️ {t('error')}: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: '20px', 
              padding: '12px 24px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            {t('tryAgain') || 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const stats = getProviderStats();
  const displayName = appUser?.name || auth0User?.name || 'User';

  return (
    <div style={{ backgroundColor: '#D6E6F7', minHeight: '100vh', fontFamily: '"Inter", sans-serif', transition: 'all 0.3s' }}>
      
      {/* 1. Main Navbar */}
      <nav style={{ 
        background: 'linear-gradient(90deg, #001F3F 0%, #004080 100%)', 
        padding: '12px 40px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        color: 'white',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>
          {vendorData?.companyName || 'SERVEASO'}
        </div>
        <div style={{ display: 'flex', gap: '25px', fontSize: '14px', fontWeight: '500' }}>
          <span style={{ cursor: 'pointer', opacity: currentView === 'dashboard' ? 1 : 0.7 }} onClick={() => setCurrentView('dashboard')}>{t('dashboard') || 'Dashboard'}</span>
          <span style={{ cursor: 'pointer', opacity: currentView === 'all-providers' ? 1 : 0.7 }} onClick={() => setCurrentView('all-providers')}>{t('myProviders') || 'My Providers'}</span>
          <span style={{ cursor: 'pointer', opacity: 0.7 }}>{t('recruitmentFeed') || 'Recruitment Feed'}</span>
          <span style={{ cursor: 'pointer', opacity: 0.7 }}>{t('earnings') || 'Earnings'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: 'white', color: '#666', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            📍 {vendorData?.address || (t('locationNotSet') || 'Location not set')}
          </div>
          <div style={{ fontSize: '18px', cursor: 'pointer' }}>🔔</div>
          <div style={{ backgroundColor: 'white', color: '#004080', padding: '4px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '13px' }}>
            👤 {t('agent') || 'Agent'}
          </div>
        </div>
      </nav>

      <div style={{ padding: '30px 60px' }}>
        <h2 style={{ color: '#1e293b', marginBottom: '20px', fontWeight: '600' }}>
            {currentView === 'dashboard' ? (t('providerManagementDashboard') || "Provider Management Dashboard") : (currentView.replace('-', ' ').toUpperCase())}
        </h2>

        {/* 2. Welcome Glass Card (Hidden when registering) */}
        {currentView !== 'register' && (
            <div style={{ 
            background: 'rgba(255, 255, 255, 0.4)', 
            backdropFilter: 'blur(12px)', 
            borderRadius: '15px', 
            padding: '30px', 
            border: '1px solid rgba(255, 255, 255, 0.6)',
            marginBottom: '30px',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
            }}>
            <h1 style={{ margin: '0 0 20px 0', fontSize: '26px', color: '#001f3f' }}>{t('welcome')}, {displayName}</h1>
            <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => setCurrentView('register')}
                  style={{ backgroundColor: '#002D62', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                >
                  <span style={{ fontSize: '20px' }}>+</span> {t('registerNewProvider') || 'Register New Provider'}
                </button>
                <button 
                  onClick={() => setCurrentView('applications')}
                  style={{ backgroundColor: 'white', color: '#1e293b', border: '1px solid #cbd5e1', padding: '12px 28px', borderRadius: '30px', fontWeight: '500', cursor: 'pointer' }}
                >
                  {t('viewApplications') || 'View Applications'}
                </button>
            </div>
            </div>
        )}

        {/* 3. Stats Grid */}
        {currentView === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            {[
              { label: t('cooks') || 'Cooks', count: `${stats.cooks} ${t('active') || 'Active'}`, icon: '👨‍🍳', bg: '#fff' },
              { label: t('cleaningHelp') || 'Cleaning Help', count: `${stats.cleaning} ${t('active') || 'Active'}`, icon: '🧹', bg: '#fff' },
              { label: t('caregivers') || 'Caregivers', count: `${stats.caregivers} ${t('active') || 'Active'}`, icon: '❤️', bg: '#fff' }
            ].map((card, i) => (
              <div key={i} style={{ background: 'rgba(255, 255, 255, 0.7)', borderRadius: '15px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '32px' }}>{card.icon}</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '18px', color: '#334155' }}>{card.label}</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>{card.count}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Main Dynamic Content Area */}
        {currentView === 'register' ? (
          <div style={{ background: 'white', padding: '40px', borderRadius: '15px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
             <h3>{t('registerNewProvider') || 'Register New Provider'}</h3>
             <p style={{ color: '#64748b' }}>{t('enterProviderDetails') || 'Enter the details of the service provider to begin onboarding.'}</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input placeholder={t('fullName') || 'Full Name'} style={inputStyle} />
                <select style={inputStyle}>
                  <option>{t('selectServiceType') || 'Select Service Type'}</option>
                  <option>{t('cook') || 'Cook'}</option>
                  <option>{t('maidCleaning') || 'Maid / Cleaning'}</option>
                  <option>{t('caregiver') || 'Nanny / Caregiver'}</option>
                </select>
                <input placeholder={t('phoneNumber') || 'Phone Number'} style={inputStyle} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#002D62', color: 'white', fontWeight: 'bold' }}>{t('submitDetails') || 'Submit Details'}</button>
                  <button onClick={() => setCurrentView('dashboard')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}>{t('cancel') || 'Cancel'}</button>
                </div>
             </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flexDirection: currentView === 'all-providers' ? 'column' : 'row' }}>
            {/* Table Container */}
            <div style={{ flex: 2, background: 'white', borderRadius: '15px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>{getTableTitle()}</h3>
                  {currentView === 'dashboard' && (
                    <button 
                        onClick={() => setCurrentView('all-providers')}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                        {t('viewFullList') || 'View Full List'} →
                    </button>
                  )}
                  {currentView !== 'dashboard' && (
                    <button 
                        onClick={() => setCurrentView('dashboard')}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                        ← {t('backToDashboard') || 'Back to Dashboard'}
                    </button>
                  )}
              </div>
              <div className="ag-theme-alpine" style={{ height: currentView === 'dashboard' ? '280px' : '500px', width: '100%' }}>
                <AgGridReact 
                  rowData={currentView === 'applications' ? providers.filter(p => p.status !== 'Active') : providers} 
                  columnDefs={columnDefs} 
                  headerHeight={48} 
                  rowHeight={52}
                  animateRows={true}
                  defaultColDef={{ resizable: true }}
                />
              </div>
            </div>

            {/* Sidebar (Only on Dashboard) */}
            {currentView === 'dashboard' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.6)', borderRadius: '15px', padding: '24px', border: '1px solid white' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>{t('totalProviders') || 'Total Providers'}</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{providers.length}</div>
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#64748b' }}>
                      {stats.totalActive} {t('activeProviders') || 'Active Providers'}
                    </div>
                  </div>

                  <div style={{ background: 'white', borderRadius: '15px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '15px' }}>{t('resourceCenter') || 'Resource Center'}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={resourceItemStyle}>{t('verifyIds') || 'How to verify IDs'}</div>
                        <div style={resourceItemStyle}>{t('manageExpectations') || 'Managing client expectations'}</div>
                        <div style={resourceItemStyle}>{t('payoutCycle') || 'Earnings payout cycle'}</div>
                    </div>
                  </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const inputStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none'
};

const resourceItemStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#2563eb',
  cursor: 'pointer',
  padding: '8px',
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  borderLeft: '4px solid #2563eb'
};

export default AgentDashboard;