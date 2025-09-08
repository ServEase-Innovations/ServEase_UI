import React from "react";
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaFacebook } from "react-icons/fa6";

interface FooterProps {
  onAboutClick: () => void;
  onContactClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAboutClick, onContactClick }) => {
  return (
    <>
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
              Book trusted, trained house-help instantly. ServEaso provides safe, affordable maids, cooks, and caregivers.
            </p>

            <div className="flex space-x-3 mt-3 text-gray-600">
              <a href="https://x.com/ServEaso" target="_blank" rel="noopener noreferrer">
                <FaTwitter size={18} />
              </a>
              <a href="https://www.instagram.com/serveaso?igsh=cHQxdmdubnZocjRn" target="_blank" rel="noopener noreferrer">
                <FaInstagram size={18} />
              </a>
              <a href="https://www.linkedin.com/in/serveaso-media-7b7719381/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin size={18} />
              </a>
              <a href="https://www.youtube.com/@ServEaso" target="_blank" rel="noopener noreferrer">
                <FaYoutube size={18} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61572701168852" target="_blank" rel="noopener noreferrer">
                <FaFacebook size={18} />
              </a>
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
                   <button 
                    onClick={onContactClick} 
                    className="hover:text-gray-900 text-left"
                    >
                    ContactUs
                    </button>
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
