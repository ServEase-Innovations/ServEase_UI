import React from "react";
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaFacebook } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200" style={{ backgroundColor: "#d6f0ff" }}>
<div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-600">
  
  {/* Company Logo & Description */}
  <div className="text-left flex flex-col items-start pl-0 text-left">
    <div className="flex items-center space-x-2 ">
      <div>
        <img src="NewLogoDesing.png" alt="ServEaso Logo" className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">ServEaso</h3>
    </div>
    <p className="mt-3 text-gray-700">
      ServEaso empowers businesses to streamline operations and deliver
      smarter, faster customer experiences.
    </p>
    <div className="flex space-x-4 mt-4 text-gray-600">
      <a href="#!"><FaTwitter size={18} /></a>
      <a href="#!"><FaInstagram size={18} /></a>
      <a href="#!"><FaLinkedin size={18} /></a>
      <a href="#!"><FaYoutube size={18} /></a>
      <a href="#!"><FaFacebook size={18} /></a>
    </div>
  </div>

  {/* Product, Resources, Company Columns */}
  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
    {/* Product */}
    <div className="flex flex-col items-start md:items-left">
      <h4 className="font-semibold text-gray-900">Product</h4>
      <ul className="mt-3 space-y-2 pl-0 text-left">
      <li className="pl-0 text-left"><a href="#!" className="hover:text-gray-900">Features</a></li>
      <li className="pl-0 text-left"><a href="#!" className="hover:text-gray-900">Pricing</a></li>
      <li className="pl-0 text-left"><a href="#!" className="hover:text-gray-900">Integrations</a></li>
      <li className="pl-0 text-left"><a href="#!" className="hover:text-gray-900">Changelog</a></li>
      </ul>
    </div>

    {/* Resources */}
    <div className="flex flex-col items-start md:items-middle">
      <h4 className="font-semibold text-gray-900">Resources</h4>
      <ul className="mt-3 space-y-2 pl-0 text-left">
      <li className="text-middle"><a href="#!" className="hover:text-gray-900">Documentation</a></li>
      <li className="text-middle"><a href="#!" className="hover:text-gray-900">Tutorials</a></li>
      <li className="text-middle"><a href="#!" className="hover:text-gray-900">Support</a></li>
      <li className="text-middle"><a href="#!" className="hover:text-gray-900">Blog</a></li>
      </ul>
    </div>

    {/* Company */}
    <div className="flex flex-col items-start md:items-right">
      <h4 className="font-semibold text-gray-900">Company</h4>
      <ul className="mt-3 space-y-2 pl-1 text-left">
      <li className="pl-1 text-left"><a href="#!" className="hover:text-gray-900">About</a></li>
      <li className="pl-1 text-left"><a href="#!" className="hover:text-gray-900">Careers</a></li>
      <li className="pl-1 text-left"><a href="http://localhost:3000/Contact" target="blank" className="hover:text-gray-900">Contact</a></li>
      <li className="pl-1 text-left"><a href="#!" className="hover:text-gray-900">Partners</a></li>
      </ul>
    </div>
    
  </div>
</div>

{/* Bottom Bar */}
<div className="border-t border-gray-200">
  <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
    <p>© 2025 ServEaso. All rights reserved.</p>
    <div className="flex space-x-6 mt-3 md:mt-0">
      <a href="#!" className="hover:text-gray-900">Privacy Policy</a>
      <a href="#!" className="hover:text-gray-900">Terms of Service</a>
      <a href="#!" className="hover:text-gray-900">Cookies Settings</a>
    </div>
  </div>
</div>
    </footer>
  );
};

export default Footer;
