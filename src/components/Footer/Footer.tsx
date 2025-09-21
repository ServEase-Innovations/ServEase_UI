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
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-gray-600">
          
          {/* Left side - Company Logo & Description */}
          <div className="text-left flex flex-col items-start md:pl-0 pl-2">
            <div className="flex items-center space-x-2">
              <img
                src="NewLogoDesing2.png"
                alt="ServEaso Logo"
                className="h-8 w-8 md:h-10 md:w-10"
              />
            </div>

            <p className="mt-2 text-gray-700 text-xs md:text-sm">
              Book trusted, trained house-help instantly. ServEaso provides safe, affordable maids, cooks, and caregivers.
            </p>

            <div className="flex space-x-3 mt-2 text-gray-600">
              <a href="https://x.com/ServEaso" target="_blank" rel="noopener noreferrer">
                <FaTwitter size={16} />
              </a>
              <a href="https://www.instagram.com/serveaso?igsh=cHQxdmdubnZocjRn" target="_blank" rel="noopener noreferrer">
                <FaInstagram size={16} />
              </a>
              <a href="https://www.linkedin.com/in/serveaso-media-7b7719381/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin size={16} />
              </a>
              <a href="https://www.youtube.com/@ServEaso" target="_blank" rel="noopener noreferrer">
                <FaYoutube size={16} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61572701168852" target="_blank" rel="noopener noreferrer">
                <FaFacebook size={16} />
              </a>
            </div>
          </div>

          {/* Right side columns - Resources and Company */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Resources */}
            <div className="flex flex-col items-start">
              <h3 className="font-medium text-gray-800">Resources</h3>
              <ul className="mt-2 space-y-1 text-left">
                <li><a href="#!" className="hover:text-gray-900 text-sm">Documentation</a></li>
                <li><a href="#!" className="hover:text-gray-900 text-sm">Tutorials</a></li>
                <li><a href="#!" className="hover:text-gray-900 text-sm">Support</a></li>
                <li><a href="#!" className="hover:text-gray-900 text-sm">Blog</a></li>
                <li><a href="#!" className="hover:text-gray-900 text-sm">Features</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="flex flex-col items-start">
              <h3 className="font-medium text-gray-800">Company</h3>
              <ul className="mt-2 space-y-1 text-left">
                <li>
                  <button 
                    onClick={onAboutClick} 
                    className="hover:text-gray-900 text-left text-sm"
                  >
                    About
                  </button>
                </li>
                <li><a href="#!" className="hover:text-gray-900 text-sm">Careers</a></li>
                <li>
                   <button 
                    onClick={onContactClick} 
                    className="hover:text-gray-900 text-left text-sm"
                    >
                    Contact Us
                    </button>
                </li>
                <li><a href="#!" className="hover:text-gray-900 text-sm">Partners</a></li>
                <li><a href="#!" className="hover:text-gray-900 text-sm">Pricing</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-4 pb-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p>© 2025 ServEaso. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#!" className="hover:text-gray-900">Terms of Service</a>
              <a href="#!" className="hover:text-gray-900">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;