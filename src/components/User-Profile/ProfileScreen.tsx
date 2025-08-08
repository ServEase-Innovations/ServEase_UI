import React from 'react';
import './ProfileScreen.css';
import { Button } from "../Button/button";

const ProfileScreen = () => {
  return (
    <div className="container">
      {/* Header with Background Image */}
      <div className="header-container">
        <div className="header-gradient">
          <div className="header-content">
            <div className="header-profile-section">
              <img
                src="https://demos.creative-tim.com/argon-dashboard/assets-old/img/theme/team-4.jpg"
                className="header-profile-image"
                alt="Profile"
              />
              <div>
                <h1 className="header-title">Hello Jesse</h1>
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
                      value="lucky.jesse"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Email address</label>
                    <input
                      className="input"
                      value="jesse@example.com"
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
                      value="Lucky"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Last name</label>
                    <input
                      className="input"
                      value="Jesse"
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