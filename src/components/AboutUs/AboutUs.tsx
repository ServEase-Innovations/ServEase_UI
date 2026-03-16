/* eslint-disable */
import React from 'react';
import { useLanguage } from 'src/context/LanguageContext';


interface AboutUsProps {
  onBack: () => void;
}

const AboutUs = ({ onBack }: AboutUsProps) => {
  // Use the language hook
  const { t } = useLanguage();

  return (
    <div className="font-sans text-gray-800">
      {/* Back Button */}
      <div className="p-4 bg-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <span className="mr-2">←</span> {t('backToHome')} {/* Updated to use t() */}
        </button>
      </div>

       {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?fit=crop&w=1600&q=80')",
        }}
      >
        <div className="bg-black bg-opacity-50 p-16">
          <h1 className="text-4xl font-bold">{t('aboutUs')}</h1> {/* Updated to use t() */}
          <p className="mt-4 max-w-2xl">
            {t('aboutUsHero1')} <strong>ServEaso</strong> {t('aboutUsHero2')}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-8 text-center bg-gray-50">
        <h2 className="text-3xl font-bold mb-10">{t('ourStory')}</h2> {/* Updated to use t() */}
        <div className="max-w-5xl mx-auto text-left text-gray-700 space-y-6">
          <p>
            {t('ourStory1')}
          </p>
          <p>
            {t('ourStory2')}
          </p>
          <h3 className="text-xl font-semibold mt-8 mb-4">
            {t('challengesWeSolve')} {/* Updated to use t() */}
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>{t('highTurnover')}:</strong> {t('highTurnoverDesc')}
            </li>
            <li>
              <strong>{t('skillsGap')}:</strong> {t('skillsGapDesc')}
            </li>
            <li>
              <strong>{t('communicationBarriers')}:</strong> {t('communicationBarriersDesc')}
            </li>
            <li>
              <strong>{t('trustAndSecurity')}:</strong> {t('trustAndSecurityDesc')}
            </li>
            <li>
              <strong>{t('dependenceAndEntitlement')}:</strong> {t('dependenceAndEntitlementDesc')}
            </li>
            <li>
              <strong>{t('lackOfLegalProtection')}:</strong> {t('lackOfLegalProtectionDesc')}
            </li>
            <li>
              <strong>{t('socialIsolation')}:</strong> {t('socialIsolationDesc')}
            </li>
            <li>
              <strong>{t('employerMaidRelationship')}:</strong> {t('employerMaidRelationshipDesc')}
            </li>
            <li>
              <strong>{t('limitedAccessToHealthcare')}:</strong> {t('limitedAccessToHealthcareDesc')}
            </li>
            <li>
              <strong>{t('lackOfStandardizedPractices')}:</strong> {t('lackOfStandardizedPracticesDesc')}
            </li>
          </ul>
        </div>
      </section>

      {/* Team Section - Commented out as in original */}
    </div>
  );
};

export default AboutUs;