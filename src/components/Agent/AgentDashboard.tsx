import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import type { ColDef } from 'ag-grid-community';

// --- Data Types ---
interface ProviderData {
  id: string;
  providerName: string;
  type: string;
  dateRegistered: string;
  status: string;
  action: string;
}

const AgentDashboard: React.FC = () => {
  // Navigation State: 'dashboard' | 'all-providers' | 'applications' | 'register'
  const [currentView, setCurrentView] = useState<'dashboard' | 'all-providers' | 'applications' | 'register'>('dashboard');

  // Dummy Data
  const [providers] = useState<ProviderData[]>([
    { id: '1', providerName: 'Anita R.', type: 'Caregiver', dateRegistered: '2024-05-15', status: 'Verifying', action: 'Review' },
    { id: '2', providerName: 'Rajesh S.', type: 'Cook', dateRegistered: '2024-05-14', status: 'Active', action: 'View Profile' },
    { id: '3', providerName: 'Priya K.', type: 'Cleaning', dateRegistered: '2024-05-14', status: 'Docs Required', action: 'Contact' },
    { id: '4', providerName: 'Sunil V.', type: 'Cook', dateRegistered: '2024-04-10', status: 'Active', action: 'View Profile' },
  ]);

  const columnDefs: ColDef<ProviderData>[] = [
    { field: 'providerName', headerName: 'Provider Name', flex: 1.5, sortable: true, filter: true },
    { field: 'type', headerName: 'Type', flex: 1, sortable: true, filter: true },
    { field: 'dateRegistered', headerName: 'Date Registered', flex: 1.2, sortable: true },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1.2,
      cellStyle: params => {
        if (params.value === 'Active') return { color: '#16a34a', fontWeight: 'bold' };
        if (params.value === 'Docs Required') return { color: '#dc2626', fontWeight: 'bold' };
        return { color: '#ca8a04', fontWeight: 'bold' };
      }
    },
    { 
      field: 'action', 
      headerName: 'Action', 
      flex: 1,
      cellRenderer: (p: any) => (
        <button 
          style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
          onClick={() => alert(`Opening details for ${p.data.providerName}`)}
        >
          {p.value}
        </button>
      )
    }
  ];

  // Helper to render the table title based on view
  const getTableTitle = () => {
    if (currentView === 'applications') return "Pending Applications";
    if (currentView === 'all-providers') return "All Agency Providers";
    return "Recent Registrations & Status";
  };

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
        <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>SERVEASO</div>
        <div style={{ display: 'flex', gap: '25px', fontSize: '14px', fontWeight: '500' }}>
          <span style={{ cursor: 'pointer', opacity: currentView === 'dashboard' ? 1 : 0.7 }} onClick={() => setCurrentView('dashboard')}>Dashboard</span>
          <span style={{ cursor: 'pointer', opacity: currentView === 'all-providers' ? 1 : 0.7 }} onClick={() => setCurrentView('all-providers')}>My Providers</span>
          <span style={{ cursor: 'pointer', opacity: 0.7 }}>Recruitment Feed</span>
          <span style={{ cursor: 'pointer', opacity: 0.7 }}>Earnings</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: 'white', color: '#666', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            📍 V495+4JM, West Bengal
          </div>
          <div style={{ fontSize: '18px', cursor: 'pointer' }}>🔔</div>
          <div style={{ backgroundColor: 'white', color: '#004080', padding: '4px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '13px' }}>
            👤 Agent
          </div>
        </div>
      </nav>

      <div style={{ padding: '30px 60px' }}>
        <h2 style={{ color: '#1e293b', marginBottom: '20px', fontWeight: '600' }}>
            {currentView === 'dashboard' ? "Provider Management Dashboard" : currentView.replace('-', ' ').toUpperCase()}
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
            <h1 style={{ margin: '0 0 20px 0', fontSize: '26px', color: '#001f3f' }}>Welcome, Rahul Sharma</h1>
            <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => setCurrentView('register')}
                  style={{ backgroundColor: '#002D62', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                >
                  <span style={{ fontSize: '20px' }}>+</span> Register New Provider
                </button>
                <button 
                  onClick={() => setCurrentView('applications')}
                  style={{ backgroundColor: 'white', color: '#1e293b', border: '1px solid #cbd5e1', padding: '12px 28px', borderRadius: '30px', fontWeight: '500', cursor: 'pointer' }}
                >
                  View Applications
                </button>
            </div>
            </div>
        )}

        {/* 3. Stats Grid */}
        {currentView === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            {[
              { label: 'Cooks', count: '34 Active', icon: '👨‍🍳', bg: '#fff' },
              { label: 'Cleaning Help', count: '56 Active', icon: '🧹', bg: '#fff' },
              { label: 'Caregivers', count: '22 Active', icon: '❤️', bg: '#fff' }
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
             <h3>Register New Provider</h3>
             <p style={{ color: '#64748b' }}>Enter the details of the service provider to begin onboarding.</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input placeholder="Full Name" style={inputStyle} />
                <select style={inputStyle}>
                  <option>Select Service Type</option>
                  <option>Cook</option>
                  <option>Maid / Cleaning</option>
                  <option>Nanny / Caregiver</option>
                </select>
                <input placeholder="Phone Number" style={inputStyle} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#002D62', color: 'white', fontWeight: 'bold' }}>Submit Details</button>
                  <button onClick={() => setCurrentView('dashboard')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}>Cancel</button>
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
                        View Full List →
                    </button>
                  )}
                  {currentView !== 'dashboard' && (
                    <button 
                        onClick={() => setCurrentView('dashboard')}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                        ← Back to Dashboard
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
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Monthly Earnings</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>₹25,000 <span style={{ fontSize: '14px', fontWeight: '400', color: '#64748b' }}>/ month</span></div>
                    <div style={{ height: '6px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '10px', marginTop: '15px' }}>
                      <div style={{ height: '100%', width: '75%', backgroundColor: '#2563eb', borderRadius: '10px' }}></div>
                    </div>
                  </div>

                  <div style={{ background: 'white', borderRadius: '15px', padding: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Resource Center</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={resourceItemStyle}>How to verify IDs</div>
                        <div style={resourceItemStyle}>Managing client expectations</div>
                        <div style={resourceItemStyle}>Earnings payout cycle</div>
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