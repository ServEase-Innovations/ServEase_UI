/* ContactUs.tsx */
/* eslint-disable */
import React from "react";
import {
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa6";
import { FaGooglePlay, FaAppStoreIos } from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";

interface ContactUsProps {
  onBack?: () => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ onBack }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Your request has been submitted!");
  };

  const handleBack = () => {
    onBack && onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-10 text-black">ServEaso</h1>

      {/* Paper-style wrapper */}
      <div className="relative max-w-5xl w-full">
        {/* Paper shadow (top-left) */}
        <div className="absolute -top-3 -left-3 w-full h-full bg-gray-200 rounded-2xl" />

        {/* Main Card */}
        <div className="relative bg-white rounded-2xl shadow-xl p-10 grid md:grid-cols-2 gap-10">
          {/* LEFT SIDE */}
          <div>
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-600 hover:text-blue transition"
            >
              <IoArrowBackOutline className="text-lg" />
              Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900">
              Get in touch with us
            </h2>
            <p className="text-gray-500 mt-2">
              Fill out the form below or schedule a meeting with us at your
              convenience.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter Your Message"
                  className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree with{" "}
                  <span className="text-indigo-600 underline">
                    Terms and Conditions
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Send Your Request
              </button>
            </form>

            {/* Contact Info */}
            <div className="mt-8">
              <p className="text-gray-700 font-medium">
                You can also contact us via
              </p>
              <div className="flex flex-col gap-2 mt-3 text-gray-600">
                <p className="flex items-center gap-2">
                  <FaPhone className="text-indigo-600" />
                  <a href="tel:918792827744">+91-8792827744</a>
                </p>
                <p className="flex items-center gap-2">
                  <FaEnvelope className="text-indigo-600" />
                  <a href="mailto:support@serveaso.com">
                    support@serveaso.com
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <FaWhatsapp className="text-green-500" />
                  <a
                    href="https://wa.me/918792827744"
                    target="_blank"
                    rel="noreferrer"
                  >
                    +91-8792827744
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              With our services you can
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>1. Improve usability of your product</li>
              <li>
                2. Engage users at a higher level and outperform competition
              </li>
              <li>3. Reduce onboarding time and improve sales</li>
              <li>4. Balance user needs with your business goals</li>
            </ul>

            {/* Social Links */}
            <div className="mt-8">
              <h4 className="text-md font-semibold text-gray-700 mb-3">
                Follow us
              </h4>
              <div className="flex gap-4 text-2xl text-gray-700">
              <a href="https://www.linkedin.com/in/serveaso-media-7b7719381/" target="_blank" rel="noreferrer"><FaLinkedin /></a>
              <a href="https://www.facebook.com/profile.php?id=61572701168852"  target="_blank" rel="noreferrer"><FaFacebook /></a>
              <a href="https://www.instagram.com/serveaso?igsh=cHQxdmdubnZocjRn" target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href="https://www.youtube.com/@ServEaso" target="_blank" rel="noreferrer"><FaYoutube /></a>
              <a href="https://x.com/ServEaso" target="_blank" rel="noreferrer"><FaXTwitter /></a>
            </div>
          </div>

            {/* App Stores */}
            <div className="mt-8">
              <h4 className="text-md font-semibold text-gray-700 mb-3">
                Download Our App
              </h4>
              <div className="flex gap-4 text-3xl text-gray-800">
              <a href="https://play.google.com" target="_blank" rel="noreferrer"><FaGooglePlay /></a>
              <a href="https://apps.apple.com" target="_blank" rel="noreferrer"><FaAppStoreIos /></a>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
