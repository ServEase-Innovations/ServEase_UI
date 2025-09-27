import React from "react";
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaFacebook } from "react-icons/fa6";

interface FooterProps {
  onAboutClick: () => void;
  onContactClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAboutClick, onContactClick }) => {
  return (
    <>
      <footer className="border-t border-gray-200 w-full" style={{ backgroundColor: "#d6f0ff" }}>
        <div className="w-full px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          
          {/* Left side - Logo & Description */}
          <div className="text-left flex flex-col items-start">
            <div className="flex items-center space-x-2">
              <img
                src="NewLogoDesing2.png"
                alt="ServEaso Logo"
                className="h-8 w-8 md:h-9 md:w-9"
              />
            </div>

            <p className="mt-2 text-gray-700 text-sm">
              Book trusted, trained house-help instantly. ServEaso provides safe, affordable maids, cooks, and caregivers.
            </p>

            <div className="flex space-x-3 mt-3 text-gray-600">
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

               {/* Main footer content */}
      <div className="container mx-auto px-4 py-8">
        {/* Grid container for 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          
          {/* Legal */}
          <div className="flex flex-col items-start">
            <ul className="space-y-1 text-left">
              <li><a href="#!" className="hover:text-gray-900 text-sm">Terms of Service</a></li>
              <li><a href="#!" className="hover:text-gray-900 text-sm">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col items-start">
            <ul className="space-y-1 text-left">
              <li><a href="#!" className="hover:text-gray-900 text-sm">Tutorials</a></li>
              <li><a href="#!" className="hover:text-gray-900 text-sm">Blog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col items-start">
            <ul className="space-y-1 text-left">
              <li>
                <button onClick={onContactClick} className="hover:text-gray-900 text-left text-sm">
                  Contact Us
                </button>
              </li>
              <li><a href="#!" className="hover:text-gray-900 text-sm">Partners</a></li>
            </ul>
          </div>

          {/* Information */}
          <div className="flex flex-col items-start">
            <ul className="space-y-1 text-left">
              <li><a href="#!" className="hover:text-gray-900 text-sm">Pricing</a></li>
              <li>
                <button onClick={onAboutClick} className="hover:text-gray-900 text-left text-sm">
                  About
                </button>
              </li>
            </ul>
          </div>
          
        </div> {/* Close grid container */}
      </div>
    </div>


      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-2">
        <div className="w-full px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>© 2025 ServEaso. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
          </div>
        </div>
      </div>
    </footer>
  </>
);
};
export default Footer;
