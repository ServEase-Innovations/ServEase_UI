import React from "react";

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full max-w-5xl px-6 py-4">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center"
        >
          &larr; Back to Home
        </button>
      </div>
      
      {/* Container */}
      <div className="w-full max-w-5xl px-6 py-12">
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

export default PrivacyPolicy;