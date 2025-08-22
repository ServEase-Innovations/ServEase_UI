import React, { useEffect, useState } from 'react';
import './ProfileScreen.css';
import { Button } from "../Button/button";
import { useAuth0 } from '@auth0/auth0-react';

const ProfileScreen = () => {
  const { user: auth0User, isAuthenticated } = useAuth0();
  
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      const name = auth0User.name || null;
      const email = auth0User.email || '';

      // Extract first and last name from the full name
      if (name) {
        const nameParts = name.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      }

      // Get service provider ID from custom claims
      const id =
        auth0User.serviceProviderId ||
        auth0User["https://yourdomain.com/serviceProviderId"] || 
        auth0User.customerid||
        null;

      setUserName(name);
      setUserId(id ? Number(id) : null);

      console.log("User data:", auth0User);
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("ID:", id);
    }
  }, [isAuthenticated, auth0User]);

  return (
    <div className="container">
      {/* Header with Background Image */}
      <div className="header-container">
        <div className="header-gradient">
          <div className="header-content">
            <div className="header-profile-section">
              <img
                src={"https://demos.creative-tim.com/argon-dashboard/assets-old/img/theme/team-4.jpg"}
                className="header-profile-image"
                alt="Profile"
              />
              <div>
                <h1 className="header-title">Hello {userName || "User"}</h1>
              </div>
            </div>
            <button className="edit-button">Edit profile</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-row">
          {/* Account Form - now full width like header */}
          <div className="account-form-full-width">
            <div className="account-form">
              <div className="form-header">
                <h2 className="form-title">My account</h2>
              </div>
              <div className="form-body">
                <h3 className="section-title">USER INFORMATION</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Username</label>
                    <input
                      className="input"
                      value={auth0User?.nickname || userName || "User"}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Email address</label>
                    <input
                      className="input"
                      value={auth0User?.email || "No email available"}
                      type="email"
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">First name</label>
                    <input
                      className="input"
                      value={firstName}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Last name</label>
                    <input
                      className="input"
                      value={lastName}
                      readOnly
                    />
                  </div>
                   <div className="form-group">
                    <label className="input-label">User ID</label>
                    <input
                      className="input"
                      value={auth0User?.serviceProviderId ||auth0User?.customerid|| "N/A"}
                      readOnly
                    />
                  </div>
                </div>
            
                <div className="divider" />
                
                <h3 className="section-title">CONTACT INFORMATION</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Contact Number</label>
                    <input
                      className="input"
                      value="+1 (555) 123-4567"
                      type="tel"
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Alternative Contact Number</label>
                    <input
                      className="input"
                      value="+1 (555) 987-6543"
                      type="tel"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label className="input-label">Address</label>
                    <input
                      className="input"
                      value="Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09"
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">City</label>
                    <input
                      className="input"
                      value="New York"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Country</label>
                    <input
                      className="input"
                      value="United States"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Postal code</label>
                    <input
                      className="input"
                      placeholder="Postal code"
                      type="number"
                    />
                  </div>
                </div>
                <div className="form-actions-bottom">
                  <div className="submit-button-container">
                    <Button className="submit-button">Submit</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer"></div>
    </div>
  );
};

export default ProfileScreen;