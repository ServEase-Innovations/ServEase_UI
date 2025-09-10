import React from "react";
import { Mail, Phone, MapPin, CheckCircle, X } from "lucide-react";

export interface ContactUsProps {
  onBack?: () => void;
  onContactClick?: () => void;
}

const ContactUs = ({ onBack, onContactClick }: ContactUsProps) => {
  // Safe close handler
  const handleClose = () => {
    if (onBack) onBack();
    else if (onContactClick) onContactClick();
    else console.log("No handler provided"); // safe fallback
  };

  return (
    <section
      className="py-10 sm:py-14 relative"
      style={{ backgroundColor: "#d6f0ff" }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Close contact form"
        className="absolute top-3 right-3 sm:top-5 sm:right-5 text-gray-700 hover:text-gray-900 transition"
      >
        <X className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <br />
          <h5 className="text-xs sm:text-sm md:text-base font-semibold uppercase text-gray-500 tracking-widest">
            Contact Us
          </h5>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 leading-snug">
            Get in touch with us
          </h2>
          <p className="mt-3 sm:mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            Fill out the form below or schedule a meeting at your convenience.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Form */}
          <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-md">
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-800 outline-none text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-800 outline-none text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  placeholder="Enter your message"
                  rows={4}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-800 outline-none text-sm sm:text-base resize-none"
                />
              </div>

              <div className="flex items-start sm:items-center space-x-2">
                <input type="checkbox" className="w-4 h-4 mt-1 sm:mt-0" />
                <p className="text-xs sm:text-sm text-gray-600">
                  I agree with{" "}
                  <a href="#!" className="text-gray-900 underline">
                    Terms and Conditions
                  </a>
                </p>
              </div>

              <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition text-sm sm:text-base">
                Send Your Request
              </button>
            </form>

            {/* Contact info */}
            <div className="mt-8 text-center">
              <p className="text-gray-700 font-medium text-sm sm:text-base">
                You can also contact us via
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-4 text-sm sm:text-base">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  <span>support@serveaso.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  <span>080-123456789</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-5 sm:mb-6 text-lg sm:text-xl">
              With our services you can
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              {[
                "Improve usability of your product",
                "Engage users at a higher level and outperform your competition",
                "Reduce the onboarding time and improve sales",
                "Balance user needs with your business goal",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-3 sm:space-x-4"
                >
                  <CheckCircle className="w-5 h-5 text-gray-800 mt-1" />
                  <span className="text-gray-700 text-sm sm:text-base md:text-lg">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Locations */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base text-gray-600">
              <div>
                <MapPin className="w-5 h-5 text-gray-800 mb-2" />
                <p className="font-semibold">India</p>
                <p>Plot No 8-2-601/p/15ms</p>
                <p>Banjara Hills, Road No 10</p>
                <p>Hyderabad, 500034</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 sm:mt-16 text-center text-gray-600 text-xs sm:text-sm border-t pt-6">
          ©2025 <span className="font-semibold">ServEaso</span>. All rights reserved.
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
