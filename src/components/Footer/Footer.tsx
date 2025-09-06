import React, { useState } from "react";
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaFacebook } from "react-icons/fa6";

interface FooterProps {
  onAboutClick: () => void;
}

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Back Button */}
      <div className="w-full max-w-5xl mx-auto px-6 py-4">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center"
        >
          &larr; Back to Home
        </button>
      </div>
      
      {/* Container */}
      <div className="w-full max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-500 mt-2">
              Our code of conduct and your pledge to be an upstanding member of the Product.
            </p>

            {/* Search Input */}
            <div className="mt-6">
              <input
                type="text"
                placeholder="Search keyboard"
                className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Illustration (placeholder) */}
          <div className="mt-8 md:mt-0 md:ml-12 flex justify-center">
            <div className="w-40 h-40 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
              🔍
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-12 space-y-8 text-gray-700 leading-relaxed">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-bold text-blue-600">Introduction</h2>
            <p className="mt-3">
              Product Holdings Limited (the "Bloom Group") is comprised of several companies, 
              which together provide tools to help the world's designers to create, develop and 
              promote their talents (each a "Service" and collectively, the "Services"). 
              The companies within the Dribbble Group each act as the data controller for personal 
              data processed in respect of their Services (each a "Group Company" and together).
            </p>
            <p className="mt-3">
              Please ensure that your posts are relevant to the theme of the platform. Single-word 
              posts and short sentences provide limited context and are hard to comprehend. Please 
              make sure your posts are well thought out and understandable. It will help the build 
              community understand your mind and support you.
            </p>
            <p className="mt-3">
              We put no restrictions on what you share. However, we have some community guidelines 
              that must be taken into consideration. If you don't, you may find your thoughts removed 
              and/or your account disabled. Help us to keep Product awesome!
            </p>
          </section>

          {/* Sensitive Personal Data */}
          <section>
            <h2 className="text-xl font-bold text-blue-600">Sensitive Personal Data</h2>
            <p className="mt-3 font-semibold">
              While posting the personal data without consent of the company
            </p>
            <p className="mt-3">
              Under the GDPR, you have the following rights which may be subject to restrictions 
              under local law: (i) the right to withdraw consent...
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({ onAboutClick }) => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handlePrivacyClick = () => {
    setShowPrivacyPolicy(true);
  };

  const handlePrivacyBack = () => {
    setShowPrivacyPolicy(false);
  };

  return (
    <>
      {showPrivacyPolicy && <PrivacyPolicy onBack={handlePrivacyBack} />}
      
      <footer className="border-t border-gray-200" style={{ backgroundColor: "#d6f0ff" }}>
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-600">
          
          {/* Company Logo & Description */}
          <div className="text-left flex flex-col items-start md:pl-0 pl-2">
            <div className="flex items-center space-x-2">
              <img
                src="NewLogoDesing2.png"
                alt="ServEaso Logo"
                className="h-10 w-10 md:h-12 md:w-12"
              />
            </div>

            <p className="mt-2 text-gray-700 text-sm md:text-base lg:text-lg">
              ServEaso empowers businesses to streamline operations and deliver
              smarter, faster customer experiences.
            </p>

            <div className="flex space-x-3 mt-3 text-gray-600">
              <a href=" https://x.com/ServEaso "><FaTwitter size={18} /></a>
              <a href="https://www.instagram.com/serveaso?igsh=cHQxdmdubnZocjRn"><FaInstagram size={18} /></a>
              <a href="https://www.linkedin.com/in/serveaso-media-7b7719381/"><FaLinkedin size={18} /></a>
              <a href="https://www.youtube.com/@ServEaso"><FaYoutube size={18} /></a>
              <a href="https://www.facebook.com/profile.php?id=61572701168852"><FaFacebook size={18} /></a>
            </div>
          </div>

          {/* Right side columns */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Resources */}
            <div className="flex flex-col items-start">
              <ul className="mt-3 space-y-2 text-left">
                <li><a href="#!" className="hover:text-gray-900">Documentation</a></li>
                <li><a href="#!" className="hover:text-gray-900">Tutorials</a></li>
                <li><a href="#!" className="hover:text-gray-900">Support</a></li>
                <li><a href="#!" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#!" className="hover:text-gray-900">Features</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col items-start">
              <ul className="mt-3 space-y-2 text-left">
                <li>
                  <button 
                    onClick={onAboutClick} 
                    className="hover:text-gray-900 text-left"
                  >
                    About
                  </button>
                </li>
                <li><a href="#!" className="hover:text-gray-900">Careers</a></li>
                <li>
                  <a
                    href="http://localhost:3000/Contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900"
                  >
                    Contact
                  </a>
                </li>
                <li><a href="#!" className="hover:text-gray-900">Partners</a></li>
                <li><a href="#!" className="hover:text-gray-900">Pricing</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p>© 2025 ServEaso. All rights reserved.</p>
            <div className="flex space-x-6 mt-3 md:mt-0">
              <button onClick={handlePrivacyClick} className="hover:text-gray-900">Privacy Policy</button>
              <a href="#!" className="hover:text-gray-900">Terms of Service</a>
              <a href="#!" className="hover:text-gray-900">Cookies Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;