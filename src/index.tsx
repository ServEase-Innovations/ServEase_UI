import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from './store/userStore';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Importing routing components
import Admin from "./components/Admin/Admin";
import AppleHomeScreen from "./components/test/AppleHomeScreen";
import StylishLayout from "./components/test/StylishLayout";
import { Auth0Provider } from '@auth0/auth0-react';
import TnC from "./TermsAndConditions/TnC";
import PrivacyPolicy from "./TermsAndConditions/PrivacyPolicy";
import KeyFactsStatement from "./TermsAndConditions/KeyFactsStatement";

const domain = "dev-plavkbiy7v55pbg4.us.auth0.com";
const clientId = "FkZvRgSNTXloPOo2ZVRmt24MbTrfIusi";


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered!', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

root.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <React.StrictMode>
    <Provider store={store}>
      <Router>  
        <Routes>
          <Route path="/" element={<App />} /> 
          <Route path="/admin" element={<Admin />} />
          <Route path="/test1" element={ <AppleHomeScreen />} />
          <Route path="/TnC" element={ <TnC />} />
          <Route path="/Privacy" element={ <PrivacyPolicy />} />
          <Route path="/KeyFactsStatement" element={ <KeyFactsStatement />} />
        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>
  </Auth0Provider>
  
);

reportWebVitals();
