import React from "react";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaXTwitter,
} from "react-icons/fa6";

interface FooterProps {
  onAboutClick: () => void;
  onContactClick: () => void;
  onPrivacyPolicyClick: () => void;
  onTermsClick: () => void;
}

const Footer: React.FC<FooterProps> = ({
  onAboutClick,
  onContactClick,
  onPrivacyPolicyClick,
  onTermsClick,
}) => {
  return (
    <>
      <footer
        className="border-t border-gray-200 w-full"
        style={{ backgroundColor: "#d6f0ff" }}
      >
        {/* Top section */}
        <div className="w-full px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          {/* Left side - Logo & Description */}
          <div className="text-left flex flex-col items-start">
            <div className="flex items-center space-x-2">
              <img
                src="ServEaso.png"
                alt="ServEaso Logo"
                className="h-6 w-6 md:h-7 md:w-7"
              />
            </div>

            <p className="mt-1 text-gray-700 text-xs max-w-xs md:max-w-sm">
              Book trusted, trained house-help instantly. ServEaso provides safe,
              affordable maids, cooks, and caregivers.
            </p>

            {/* Social Links */}
            <div className="flex space-x-2 mt-2 text-gray-600">
              <a
                href="https://x.com/ServEaso"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black transition-colors"
              >
                <FaXTwitter size={14} />
              </a>
              <a
                href="https://www.instagram.com/serveaso?igsh=cHQxdmdubnZocjRn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600 transition-colors"
              >
                <FaInstagram size={14} />
              </a>
              <a
                href="https://www.linkedin.com/in/serveaso-media-7b7719381/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                <FaLinkedin size={14} />
              </a>
              <a
                href="https://www.youtube.com/@ServEaso"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-600 transition-colors"
              >
                <FaYoutube size={14} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61572701168852"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                <FaFacebook size={14} />
              </a>
            </div>
          </div>

          {/* Main footer links */}
          <div className="md:col-span-2 container mx-auto px-3 py-[0.3rem]">
            {/* Responsive grid for links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8 w-full">
              {/* Legal */}
              <div className="flex flex-col items-center sm:items-start">
                <ul className="space-y-1 text-center sm:text-left">
                  <li>
                    <button
                      onClick={onTermsClick}
                      className="hover:text-gray-900 text-gray-600 text-[10px] hover:underline"
                    >
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onPrivacyPolicyClick}
                      className="hover:text-gray-900 text-gray-600 text-[10px] hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div className="flex flex-col items-center sm:items-start">
                <ul className="space-y-1 text-center sm:text-left">
                  <li>
                    <a
                      href="#!"
                      className="hover:text-gray-900 text-gray-600 text-[10px] hover:underline"
                    >
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="hover:text-gray-900 text-gray-600 text-[10px] hover:underline"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div className="flex flex-col items-center sm:items-start">
                <ul className="space-y-1 text-center sm:text-left">
                  <li>
                    <button
                      onClick={onContactClick}
                      className="hover:text-gray-900 text-gray-600 text-[10px] hover:underline"
                    >
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <a
                      href="#!"
                      className="hover:text-gray-900 text-gray-600 text-[10px] hover:underline"
                    >
                      Partners
                    </a>
                  </li>
                </ul>
              </div>

              {/* Information */}
              <div className="flex flex-col items-center sm:items-start">
                <ul className="space-y-1 text-center sm:text-left">
                  <li>
                    <a
                      href="#!"
                      className="hover:text-gray-900 text-gray-600 text-[10px] hover:underline"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={onAboutClick}
                      className="hover:text-gray-900 text-gray-600 text-[10px] hover:underline"
                    >
                      About
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-1 px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 text-center md:text-left">
          <p>© 2025 ServEaso. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;