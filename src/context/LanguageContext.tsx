// contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available languages - keeping only English, Hindi, Kannada, and Bengali
export type Language = 'en' | 'hi' | 'kn' | 'bn';

// Define the translation structure
interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

// All your app translations - filtered to only include the four languages
export const translations: Translations = {
  // Footer translations
  description: {
    en: "Book trusted, trained house-help instantly. ServEaso provides safe, affordable maids, cooks, and caregivers.",
    hi: "विश्वसनीय, प्रशिक्षित घरेलू सहायता को तुरंत बुक करें। ServEaso सुरक्षित, किफायती नौकरानियां, रसोइया और देखभालकर्ता प्रदान करता है।",
    kn: "ವಿಶ್ವಾಸಾರ್ಹ, ತರಬೇತಿ ಪಡೆದ ಮನೆ ಸಹಾಯಕರನ್ನು ತಕ್ಷಣವೇ ಬುಕ್ ಮಾಡಿ. ServEaso ಸುರಕ್ಷಿತ, ಕೈಗೆಟುಕುವ ದರದಲ್ಲಿ ಮನೆಕೆಲಸದವರು, ಅಡುಗೆಯವರು ಮತ್ತು ಆರೈಕೆದಾರರನ್ನು ಒದಗಿಸುತ್ತದೆ.",
    bn: "বিশ্বস্ত, প্রশিক্ষিত গৃহকর্মী তাৎক্ষণিকভাবে বুক করুন। ServEaso নিরাপদ, সাশ্রয়ী মূল্যের গৃহকর্মী, বাবুর্চি এবং পরিচর্যাকারী প্রদান করে।"
  },
  termsOfService: {
    en: "Terms of Service",
    hi: "सेवा की शर्तें",
    kn: "ಸೇವಾ ನಿಯಮಗಳು",
    bn: "সেবার শর্তাবলী"
  },
  privacyPolicy: {
    en: "Privacy Policy",
    hi: "गोपनीयता नीति",
    kn: "ಗೌಪ್ಯತಾ ನೀತಿ",
    bn: "গোপনীয়তা নীতি"
  },
  tutorials: {
    en: "Tutorials",
    hi: "ट्यूटोरियल",
    kn: "ಟ್ಯುಟೋರಿಯಲ್ಗಳು",
    bn: "টিউটোরিয়াল"
  },
  blog: {
    en: "Blog",
    hi: "ब्लॉग",
    kn: "ಬ್ಲಾಗ್",
    bn: "ব্লগ"
  },
  contactUs: {
    en: "Contact Us",
    hi: "संपर्क करें",
    kn: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
    bn: "যোগাযোগ করুন"
  },
  partners: {
    en: "Partners",
    hi: "भागीदार",
    kn: "ಪಾಲುದಾರರು",
    bn: "অংশীদার"
  },
  pricing: {
    en: "Pricing",
    hi: "मूल्य निर्धारण",
    kn: "ಬೆಲೆಗಳು",
    bn: "মূল্য তালিকা"
  },
  about: {
    en: "About",
    hi: "हमारे बारे में",
    kn: "ನಮ್ಮ ಬಗ್ಗೆ",
    bn: "আমাদের সম্পর্কে"
  },
  copyright: {
    en: "© 2026 ServEaso. All rights reserved.",
    hi: "© 2026 ServEaso। सर्वाधिकार सुरक्षित।",
    kn: "© 2026 ServEaso. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    bn: "© ২০২৬ ServEaso। সর্বস্বত্ব সংরক্ষিত।"
  },
  footerSectionLegal: {
    en: "Legal",
    hi: "कानूनी",
    kn: "ಕಾನೂನು",
    bn: "আইনি"
  },
  footerSectionResources: {
    en: "Resources",
    hi: "संसाधन",
    kn: "ಸಂಪನ್ಮೂಲಗಳು",
    bn: "রিসোর্স"
  },
  footerSectionCompany: {
    en: "Company",
    hi: "कंपनी",
    kn: "ಕಂಪನಿ",
    bn: "কোম্পানি"
  },
  footerSectionExplore: {
    en: "Explore",
    hi: "अन्वेषण",
    kn: "ಅನ್ವೇಷಿಸಿ",
    bn: "অন্বেষণ"
  },
  footerFollowUs: {
    en: "Follow us",
    hi: "हमें फॉलो करें",
    kn: "ನಮ್ಮನ್ನು ಅನುಸರಿಸಿ",
    bn: "আমাদের অনুসরণ করুন"
  },
  language: {
    en: "Language",
    hi: "भाषा",
    kn: "ಭಾಷೆ",
    bn: "ভাষা"
  },

  // ============ HEADER TRANSLATIONS ============
  home: {
    en: "Home",
    hi: "होम",
    kn: "ಮುಖಪುಟ",
    bn: "হোম"
  },
  
  ourServices: {
    en: "Our Services",
    hi: "हमारी सेवाएं",
    kn: "ನಮ್ಮ ಸೇವೆಗಳು",
    bn: "আমাদের সেবাসমূহ"
  },
  
  homeCook: {
    en: "Home Cook",
    hi: "घरेलू रसोइया",
    kn: "ಮನೆ ಅಡುಗೆಯವರು",
    bn: "গৃহস্থালি রাঁধুনি"
  },
  
  cleaningHelp: {
    en: "Cleaning Help",
    hi: "सफाई सहायता",
    kn: "ಸ್ವಚ್ಛತಾ ಸಹಾಯ",
    bn: "পরিষ্কার সহায়তা"
  },
  
  caregiver: {
    en: "Caregiver",
    hi: "देखभालकर्ता",
    kn: "ಆರೈಕೆದಾರ",
    bn: "পরিচর্যাকারী"
  },

  bookService: {
    en: "Book",
    hi: "बुक करें",
    kn: "ಬುಕ್ ಮಾಡಿ",
    bn: "বুক করুন"
  },
  
  myBookings: {
    en: "My Bookings",
    hi: "मेरी बुकिंग",
    kn: "ನನ್ನ ಬುಕಿಂಗ್ಗಳು",
    bn: "আমার বুকিং"
  },
  
  dashboard: {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    kn: "ಡ್ಯಾಶ್ಬೋರ್ಡ್",
    bn: "ড্যাশবোর্ড"
  },
  
  aboutUs: {
    en: "About Us",
    hi: "हमारे बारे में",
    kn: "ನಮ್ಮ ಬಗ್ಗೆ",
    bn: "আমাদের সম্পর্কে"
  },
  
  location: {
    en: "Location",
    hi: "स्थान",
    kn: "ಸ್ಥಳ",
    bn: "অবস্থান"
  },
  
  detectLocation: {
    en: "Detect Location",
    hi: "स्थान का पता लगाएं",
    kn: "ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ",
    bn: "অবস্থান সনাক্ত করুন"
  },
  
  addAddress: {
    en: "Add Address",
    hi: "पता जोड़ें",
    kn: "ವಿಳಾಸ ಸೇರಿಸಿ",
    bn: "ঠিকানা যোগ করুন"
  },
  
  locationNotFound: {
    en: "Location not found",
    hi: "स्थान नहीं मिला",
    kn: "ಸ್ಥಳ ಕಂಡುಬಂದಿಲ್ಲ",
    bn: "অবস্থান পাওয়া যায়নি"
  },
  
  loading: {
    en: "Loading",
    hi: "लोड हो रहा है",
    kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ",
    bn: "লোড হচ্ছে"
  },
  
  profile: {
    en: "Profile",
    hi: "प्रोफ़ाइल",
    kn: "ಪ್ರೊಫೈಲ್",
    bn: "প্রোফাইল"
  },
  
  logout: {
    en: "Logout",
    hi: "लॉग आउट",
    kn: "ನಿರ್ಗಮಿಸಿ",
    bn: "লগআউট"
  },
  
  setLocation: {
    en: "Set Location",
    hi: "स्थान सेट करें",
    kn: "ಸ್ಥಳ ಹೊಂದಿಸಿ",
    bn: "অবস্থান সেট করুন"
  },

  pickLocationOnMap: {
    en: "Drag the map or tap to place the pin, then save.",
    hi: "नक्शा खींचें या पिन जोड़ने के लिए टैप करें, फिर सहेजें।",
    kn: "ನಕ್ಶೆಯನ್ನು ಎಳೆದು ಅಥವಾ ಟ್ಯಾಪ್ ಮಾಡಿ ಪಿನ್‌ ಇರಿಸಿ, ನಂತರ ಉಳಿಸಿ.",
    bn: "ম্যাপ টেনে বা পিনে ট্যাপ করে ঠিক করুন, তারপর সেভ করুন।"
  },

  saveLocationAs: {
    en: "How should we label this place?",
    hi: "हम इस जगह को क्या कहें?",
    kn: "ಈ ಸ್ಥಳದ ಹೆಸರೇನು ಎಂದು ಉಳಿಸಬೇಕು?",
    bn: "এই জায়গাটি কী নামে সংরক্ষণ করবেন?"
  },

  mapSearchPlaceholder: {
    en: "Search for an address or place",
    hi: "किसी पते या जगह को खोजें",
    kn: "ವಿಳಾಣ ಅಥವಾ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ",
    bn: "ঠিকানা বা জায়গা খুঁজুন"
  },
  mapSelectedAddress: {
    en: "Selected address",
    hi: "चयनित पता",
    kn: "ಆಯ್ಕೆಮಾಡಿದ ವಿಳಾಸ",
    bn: "নির্বাচিত ঠিকানা"
  },
  mapAddressEmptyHint: {
    en: "Search above or tap the map to pick a point.",
    hi: "ऊपर खोजें या पिन सेट करने के लिए मानचित्र पर टैप करें।",
    kn: "ಮೇಲೆ ಹುಡುಕಿ ಅಥವಾ ಮ್ಯಾಪ್‌ ಟ್ಯಾಪ್‌ ಮಾಡಿ ಪುಲ್ ಪಿನ್‌ ಇರಿಸಿ.",
    bn: "খুঁজুন বা পিন ঠিক করতে ম্যাপে ট্যাপ করুন।"
  },
  mapGeocodeNotFound: {
    en: "No address could be found for that spot. Try again.",
    hi: "उस जगह के लिए पता नहीं मिला। फिर कोशिश करें।",
    kn: "ಆ ಸ್ಥಳಕ್ಕೆ ವಿಳಾಸ ಸಿಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    bn: "ঐ স্থানে কোন ঠিকানা মিলল না। আবার চেষ্টা করুন।"
  },
  mapGeocodeError: {
    en: "Couldn’t look up the address. Try again.",
    hi: "पते की जानकारी नहीं मिली। पुनः प्रयास करें।",
    kn: "ವಿಳಾಸ ಪಡೆದುಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    bn: "ঠিকানা খুঁজে পাওয়া যায়নি। আবার চেষ্টা করুন।"
  },
  useMyCurrentLocation: {
    en: "My location",
    hi: "मेरी जगह",
    kn: "ನನ್ನ ಸ್ಥಳ",
    bn: "আমার অবস্থান"
  },
  mapClearSearch: {
    en: "Clear search",
    hi: "खोज साफ़ करें",
    kn: "ಹುಡುಕಾಟ ಖಾಲಿ",
    bn: "খুঁজা মুছুন"
  },

  cancel: {
    en: "Cancel",
    hi: "रद्द करें",
    kn: "ರದ್ದುಮಾಡಿ",
    bn: "বাতিল"
  },
  
  save: {
    en: "Save",
    hi: "सहेजें",
    kn: "ಉಳಿಸಿ",
    bn: "সংরক্ষণ"
  },
  
  saveAs: {
    en: "Save As",
    hi: "इस रूप में सहेजें",
    kn: "ಹೀಗೆ ಉಳಿಸಿ",
    bn: "হিসেবে সংরক্ষণ"
  },
  
  office: {
    en: "Office",
    hi: "कार्यालय",
    kn: "ಕಚೇರಿ",
    bn: "অফিস"
  },
  
  others: {
    en: "Others",
    hi: "अन्य",
    kn: "ಇತರೆ",
    bn: "অন্যান্য"
  },
  
  enterLocationName: {
    en: "Enter Location Name",
    hi: "स्थान का नाम दर्ज करें",
    kn: "ಸ್ಥಳದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    bn: "অবস্থানের নাম লিখুন"
  },
  
  saving: {
    en: "Saving...",
    hi: "सहेजा जा रहा है...",
    kn: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    bn: "সংরক্ষণ করা হচ্ছে..."
  },
  
  locationSavedSuccess: {
    en: "Location saved successfully!",
    hi: "स्थान सफलतापूर्वक सहेजा गया!",
    kn: "ಸ್ಥಳವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!",
    bn: "অবস্থান সফলভাবে সংরক্ষিত হয়েছে!"
  },
  
  locationSaveError: {
    en: "Failed to save location. Please try again.",
    hi: "स्थान सहेजने में विफल। कृपया पुनः प्रयास करें।",
    kn: "ಸ್ಥಳವನ್ನು ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    bn: "অবস্থান সংরক্ষণ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
  },
  // ============ END HEADER TRANSLATIONS ============

  // ============ HOMEPAGE TRANSLATIONS ============
  heroTitle: {
    en: "Book trusted and trained house-help in minutes",
    hi: "विश्वसनीय और प्रशिक्षित घरेलू सहायता को मिनटों में बुक करें",
    kn: "ವಿಶ್ವಾಸಾರ್ಹ ಮತ್ತು ತರಬೇತಿ ಪಡೆದ ಮನೆ ಸಹಾಯಕರನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ಬುಕ್ ಮಾಡಿ",
    bn: "মিনিটের মধ্যে বিশ্বস্ত এবং প্রশিক্ষিত গৃহকর্মী বুক করুন"
  },

  heroDescription: {
    en: "ServEaso delivers instant, regular and short term access to safe, affordable, and trained maids, cooks, and caregivers.",
    hi: "ServEaso सुरक्षित, किफायती और प्रशिक्षित नौकरानियों, रसोइयों और देखभाल करने वालों तक तत्काल, नियमित और अल्पकालिक पहुंच प्रदान करता है।",
    kn: "ServEaso ಸುರಕ್ಷಿತ, ಕೈಗೆಟುಕುವ ಮತ್ತು ತರಬೇತಿ ಪಡೆದ ಮನೆಕೆಲಸದವರು, ಅಡುಗೆಯವರು ಮತ್ತು ಆರೈಕೆದಾರರಿಗೆ ತಕ್ಷಣದ, ನಿಯಮಿತ ಮತ್ತು ಅಲ್ಪಾವಧಿಯ ಪ್ರವೇಶವನ್ನು ಒದಗಿಸುತ್ತದೆ.",
    bn: "ServEaso নিরাপদ, সাশ্রয়ী মূল্যের এবং প্রশিক্ষিত গৃহকর্মী, বাবুর্চি এবং পরিচর্যাকারীদের তাত্ক্ষণিক, নিয়মিত এবং স্বল্পমেয়াদী অ্যাক্সেস প্রদান করে।"
  },

  registerAsUser: {
    en: "Register as a User",
    hi: "उपयोगकर्ता के रूप में पंजीकरण करें",
    kn: "ಬಳಕೆದಾರರಾಗಿ ನೋಂದಾಯಿಸಿ",
    bn: "ব্যবহারকারী হিসাবে নিবন্ধন করুন"
  },

  registerAsProvider: {
    en: "Register as a Provider",
    hi: "प्रदाता के रूप में पंजीकरण करें",
    kn: "ಸೇವೆ ಒದಗಿಸುವವರಾಗಿ ನೋಂದಾಯಿಸಿ",
    bn: "প্রদানকারী হিসাবে নিবন্ধন করুন"
  },

  registerAsAgent: {
    en: "Register as an Agent",
    hi: "एजेंट के रूप में पंजीकरण करें",
    kn: "ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಿ",
    bn: "এজেন্ট হিসাবে নিবন্ধন করুন"
  },

  service: {
    en: "Service",
    hi: "सेवा",
    kn: "ಸೇವೆ",
    bn: "সেবা"
  },

  previousSlide: {
    en: "Previous slide",
    hi: "पिछली स्लाइड",
    kn: "ಹಿಂದಿನ ಸ್ಲೈಡ್",
    bn: "পূর্ববর্তী স্লাইড"
  },

  nextSlide: {
    en: "Next slide",
    hi: "अगली स्लाइड",
    kn: "ಮುಂದಿನ ಸ್ಲೈಡ್",
    bn: "পরবর্তী স্লাইড"
  },

  goToSlide: {
    en: "Go to slide",
    hi: "स्लाइड पर जाएं",
    kn: "ಸ್ಲೈಡ್ಗೆ ಹೋಗಿ",
    bn: "স্লাইডে যান"
  },

  popularServices: {
    en: "Popular Services",
    hi: "लोकप्रिय सेवाएं",
    kn: "ಜನಪ್ರಿಯ ಸೇವೆಗಳು",
    bn: "জনপ্রিয় সেবাসমূহ"
  },

  homeCookDesc: {
    en: "Skilled and hygienic cooks who specialize in home-style meals.",
    hi: "कुशल और स्वच्छ रसोइया जो घरेलू शैली के भोजन में विशेषज्ञता रखते हैं।",
    kn: "ಮನೆ ಶೈಲಿಯ ಊಟಗಳಲ್ಲಿ ಪರಿಣತಿ ಹೊಂದಿರುವ ಕುಶಲ ಮತ್ತು ಸ್ವಚ್ಛತೆಯ ಅಡುಗೆಯವರು.",
    bn: "দক্ষ এবং স্বাস্থ্যকর রাঁধুনি যারা ঘরোয়া ধাঁচের খাবারে বিশেষজ্ঞ।"
  },

  cleaningHelpDesc: {
    en: "Reliable maids for daily, deep, or special occasion cleaning.",
    hi: "दैनिक, गहरी या विशेष अवसर की सफाई के लिए विश्वसनीय नौकरानियां।",
    kn: "ದೈನಂದಿನ, ಆಳವಾದ, ಅಥವಾ ವಿಶೇಷ ಸಂದರ್ಭಗಳ ಸ್ವಚ್ಛತೆಗಾಗಿ ವಿಶ್ವಾಸಾರ್ಹ ಮನೆಕೆಲಸದವರು.",
    bn: "দৈনিক, গভীর বা বিশেষ অনুষ্ঠানের পরিষ্কারের জন্য নির্ভরযোগ্য গৃহকর্মী।"
  },

  caregiverDesc: {
    en: "Trained support for children, seniors, or patients at home.",
    hi: "घर पर बच्चों, वरिष्ठ नागरिकों या रोगियों के लिए प्रशिक्षित सहायता।",
    kn: "ಮನೆಯಲ್ಲಿ ಮಕ್ಕಳು, ಹಿರಿಯರು ಅಥವಾ ರೋಗಿಗಳಿಗೆ ತರಬೇತಿ ಪಡೆದ ಬೆಂಬಲ.",
    bn: "বাচ্চাদের, বয়স্কদের বা বাড়িতে রোগীদের জন্য প্রশিক্ষিত সহায়তা।"
  },

  learnMore: {
    en: "Learn More",
    hi: "और जानें",
    kn: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
    bn: "আরও জানুন"
  },

  howItWorks: {
    en: "How It Works",
    hi: "यह कैसे काम करता है",
    kn: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    bn: "এটি কিভাবে কাজ করে"
  },

  chooseService: {
    en: "Choose your service",
    hi: "अपनी सेवा चुनें",
    kn: "ನಿಮ್ಮ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    bn: "আপনার সেবা নির্বাচন করুন"
  },

  chooseServiceDesc: {
    en: "Select from a variety of tasks that suit your needs.",
    hi: "अपनी आवश्यकताओं के अनुरूप विभिन्न कार्यों में से चुनें।",
    kn: "ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ಸೂಕ್ತವಾದ ವಿವಿಧ ಕಾರ್ಯಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ.",
    bn: "আপনার প্রয়োজনে উপযোগী বিভিন্ন কাজ থেকে নির্বাচন করুন।"
  },

  scheduleInMinutes: {
    en: "Schedule in minutes",
    hi: "मिनटों में शेड्यूल करें",
    kn: "ನಿಮಿಷಗಳಲ್ಲಿ ವೇಳಾಪಟ್ಟಿ ಮಾಡಿ",
    bn: "মিনিটের মধ্যে সময়সূচী করুন"
  },

  scheduleInMinutesDesc: {
    en: "Book a time that works for you, quickly and easily.",
    hi: "अपने लिए सुविधाजनक समय जल्दी और आसानी से बुक करें।",
    kn: "ನಿಮಗೆ ಅನುಕೂಲಕರವಾದ ಸಮಯವನ್ನು ತ್ವರಿತವಾಗಿ ಮತ್ತು ಸುಲಭವಾಗಿ ಬುಕ್ ಮಾಡಿ.",
    bn: "আপনার জন্য উপযুক্ত সময় দ্রুত এবং সহজেই বুক করুন।"
  },

  relaxWeHandle: {
    en: "Relax, we'll handle the rest",
    hi: "आराम करें, बाकी हम संभाल लेंगे",
    kn: "ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ, ಉಳಿದುದನ್ನು ನಾವು ನೋಡಿಕೊಳ್ಳುತ್ತೇವೆ",
    bn: "আরাম করুন, বাকিটা আমরা সামলাব"
  },

  relaxWeHandleDesc: {
    en: "Our verified professionals ensure your peace of mind.",
    hi: "हमारे सत्यापित पेशेवर आपकी मानसिक शांति सुनिश्चित करते हैं।",
    kn: "ನಮ್ಮ ಪರಿಶೀಲಿತ ವೃತ್ತಿಪರರು ನಿಮ್ಮ ಮನಸ್ಸಿನ ಶಾಂತಿಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತಾರೆ.",
    bn: "আমাদের যাচাইকৃত পেশাজীবীরা আপনার মানসিক শান্তি নিশ্চিত করে।"
  },

  serviceProviderRegistration: {
    en: "Service Provider Registration",
    hi: "सेवा प्रदाता पंजीकरण",
    kn: "ಸೇವೆ ಒದಗಿಸುವವರ ನೋಂದಣಿ",
    bn: "সেবা প্রদানকারী নিবন্ধন"
  },
  // ============ END HOMEPAGE TRANSLATIONS ============

  // Add this section after the HOMEPAGE TRANSLATIONS

  // Service Details Dialog Translations
  maidServicesTitle: {
    en: "ServEaso Maid Services",
    hi: "सर्वएसो की नौकरानी सेवाएं",
    kn: "ServEaso ಮನೆಕೆಲಸದವರ ಸೇವೆಗಳು",
    bn: "সার্ভইজোর গৃহকর্মী সেবা"
  },
  maidServicesDescription: {
    en: "Professional cleaning and household services",
    hi: "पेशेवर सफाई और घरेलू सेवाएं",
    kn: "ವೃತ್ತಿಪರ ಸ್ವಚ್ಛತೆ ಮತ್ತು ಮನೆಕೆಲಸ ಸೇವೆಗಳು",
    bn: "পেশাদার পরিষ্কার এবং গৃহস্থালি সেবা"
  },
  cleaning: {
    en: "Cleaning",
    hi: "सफाई",
    kn: "ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "পরিষ্কার"
  },
  utensilsCleaning: {
    en: "Utensils cleaning",
    hi: "बर्तनों की सफाई",
    kn: "ಪಾತ್ರೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸುವುದು",
    bn: "বাসন পরিষ্কার"
  },
  dusting: {
    en: "Dusting",
    hi: "धूल झाड़ना",
    kn: "ಧೂಳು ಒರೆಸುವುದು",
    bn: "ধুলো মুছা"
  },
  vacuuming: {
    en: "Vacuuming",
    hi: "वैक्यूम करना",
    kn: "ವ್ಯಾಕ್ಯೂಮ್ ಮಾಡುವುದು",
    bn: "ভ্যাকুয়াম করা"
  },
  mopping: {
    en: "Mopping",
    hi: "पोछा लगाना",
    kn: "ಒರೆಸುವುದು",
    bn: "মুছা"
  },
  sweeping: {
    en: "Sweeping",
    hi: "झाड़ू लगाना",
    kn: "ಗುಡಿಸುವುದು",
    bn: "ঝাড়ু দেওয়া"
  },
  cleaningBathroomsKitchens: {
    en: "Cleaning bathrooms and kitchens",
    hi: "बाथरूम और रसोई की सफाई",
    kn: "ಸ್ನಾನಗೃಹಗಳು ಮತ್ತು ಅಡುಗೆಮನೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸುವುದು",
    bn: "বাথরুম এবং রান্নাঘর পরিষ্কার"
  },
  laundry: {
    en: "Laundry",
    hi: "कपड़े धोना",
    kn: "ಬಟ್ಟೆ ಒಗೆಯುವುದು",
    bn: "কাপড় কাচা"
  },
  washingClothes: {
    en: "Washing clothes",
    hi: "कपड़े धोना",
    kn: "ಬಟ್ಟೆಗಳನ್ನು ತೊಳೆಯುವುದು",
    bn: "কাপড় ধোয়া"
  },
  dryingClothes: {
    en: "Drying clothes",
    hi: "कपड़े सुखाना",
    kn: "ಬಟ್ಟೆಗಳನ್ನು ಒಣಗಿಸುವುದು",
    bn: "কাপড় শুকানো"
  },
  foldingClothes: {
    en: "Folding clothes",
    hi: "कपड़े मोड़ना",
    kn: "ಬಟ್ಟೆಗಳನ್ನು ಮಡಚುವುದು",
    bn: "কাপড় ভাঁজ করা"
  },
  ironingClothes: {
    en: "Ironing clothes",
    hi: "कपड़े इस्त्री करना",
    kn: "ಬಟ್ಟೆಗಳನ್ನು ಇಸ್ತ್ರಿ ಮಾಡುವುದು",
    bn: "কাপড় ইস্ত্রি করা"
  },
  errands: {
    en: "Errands",
    hi: "काम-काज",
    kn: "ಕೆಲಸಗಳು",
    bn: "ছোটখাটো কাজ"
  },
  runningErrands: {
    en: "Running errands for customers",
    hi: "ग्राहकों के काम-काज करना",
    kn: "ಗ್ರಾಹಕರಿಗಾಗಿ ಕೆಲಸಗಳನ್ನು ಮಾಡುವುದು",
    bn: "গ্রাহকদের জন্য ছোটখাটো কাজ করা"
  },
  pickingGroceries: {
    en: "Picking up groceries",
    hi: "किराने का सामान लाना",
    kn: "ಕಿರಾಣಿ ಸಾಮಾನುಗಳನ್ನು ತರುವುದು",
    bn: "মুদি কেনাকাটা করা"
  },
  dryCleaningPickup: {
    en: "Dry cleaning pickup/dropoff",
    hi: "ड्राई क्लीनिंग पिकअप/ड्रॉपऑफ",
    kn: "ಡ್ರೈ ಕ್ಲೀನಿಂಗ್ ಪಿಕಪ್/ಡ್ರಾಪ್ಆಫ್",
    bn: "ড্রাই ক্লিনিং পিকআপ/ডেলিভারি"
  },
  respectfulProperty: {
    en: "Respectful of customer's property",
    hi: "ग्राहक की संपत्ति का सम्मान",
    kn: "ಗ್ರಾಹಕರ ಆಸ್ತಿಯನ್ನು ಗೌರವಿಸುವುದು",
    bn: "গ্রাহকের সম্পত্তির প্রতি সম্মান"
  },
  punctualReliable: {
    en: "Punctual and reliable",
    hi: "समयनिष्ठ और विश्वसनीय",
    kn: "ಸಮಯಪಾಲನೆ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ",
    bn: "সময়নিষ্ঠ এবং নির্ভরযোগ্য"
  },
  professionalCourteous: {
    en: "Professional and courteous",
    hi: "पेशेवर और विनम्र",
    kn: "ವೃತ್ತಿಪರ ಮತ್ತು ಸೌಜನ್ಯಯುತ",
    bn: "পেশাদার এবং ভদ্র"
  },
  discreetRespectful: {
    en: "Discreet and respectful of privacy",
    hi: "विवेकशील और गोपनीयता का सम्मान",
    kn: "ವಿವೇಚನೆಯುಳ್ಳ ಮತ್ತು ಗೌಪ್ಯತೆಯನ್ನು ಗೌರವಿಸುವ",
    bn: "বিবেচক এবং গোপনীয়তার প্রতি শ্রদ্ধাশীল"
  },
  cookServicesTitle: {
    en: "ServEaso Cook Services",
    hi: "सर्वएसो की रसोइया सेवाएं",
    kn: "ServEaso ಅಡುಗೆಯವರ ಸೇವೆಗಳು",
    bn: "সার্ভইজোর রাঁধুনি সেবা"
  },
  cookServicesDescription: {
    en: "Professional cooking services with strict standards",
    hi: "सख्त मानकों के साथ पेशेवर खाना पकाने की सेवाएं",
    kn: "ಕಟ್ಟುನಿಟ್ಟಾದ ಮಾನದಂಡಗಳೊಂದಿಗೆ ವೃತ್ತಿಪರ ಅಡುಗೆ ಸೇವೆಗಳು",
    bn: "কঠোর মান সহ পেশাদার রান্নার সেবা"
  },
  hygiene: {
    en: "Hygiene",
    hi: "स्वच्छता",
    kn: "ಸ್ವಚ್ಛತೆ",
    bn: "স্বাস্থ্যবিধি"
  },
  strictHygiene: {
    en: "Adhere to strict hygiene standards",
    hi: "सख्त स्वच्छता मानकों का पालन करें",
    kn: "ಕಟ್ಟುನಿಟ್ಟಾದ ಸ್ವಚ್ಛತಾ ಮಾನದಂಡಗಳನ್ನು ಅನುಸರಿಸಿ",
    bn: "কঠোর স্বাস্থ্যবিধি মান মেনে চলা"
  },
  frequentHandwashing: {
    en: "Frequent handwashing",
    hi: "बार-बार हाथ धोना",
    kn: "ಆಗಾಗ್ಗೆ ಕೈ ತೊಳೆಯುವುದು",
    bn: "ঘন ঘন হাত ধোয়া"
  },
  cleanUniforms: {
    en: "Wear clean uniforms and hairnets",
    hi: "साफ वर्दी और हेयरनेट पहनें",
    kn: "ಸ್ವಚ್ಛ ಸಮವಸ್ತ್ರ ಮತ್ತು ಕೂದಲಿನ ಜಾಲರಿ ಧರಿಸಿ",
    bn: "পরিষ্কার ইউনিফর্ম এবং হেয়ারনেট পরিধান"
  },
  spotlessEnvironment: {
    en: "Maintain spotless work environment",
    hi: "बेदाग कार्य वातावरण बनाए रखें",
    kn: "ನಿರ್ಮಲ ಕಾರ್ಯ ವಾತಾವರಣವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ",
    bn: "নির্মল কাজের পরিবেশ বজায় রাখা"
  },
  temperatureControl: {
    en: "Temperature Control",
    hi: "तापमान नियंत्रण",
    kn: "ತಾಪಮಾನ ನಿಯಂತ್ರಣ",
    bn: "তাপমাত্রা নিয়ন্ত্রণ"
  },
  monitorTemperatures: {
    en: "Meticulously monitor food temperatures",
    hi: "भोजन के तापमान की सूक्ष्मता से निगरानी करें",
    kn: "ಆಹಾರದ ತಾಪಮಾನವನ್ನು ನಿಖರವಾಗಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ",
    bn: "সতর্কতার সাথে খাবারের তাপমাত্রা পর্যবেক্ষণ"
  },
  preventBacterialGrowth: {
    en: "Prevent bacterial growth",
    hi: "जीवाणु वृद्धि को रोकें",
    kn: "ಬ್ಯಾಕ್ಟೀರಿಯಾದ ಬೆಳವಣಿಗೆಯನ್ನು ತಡೆಗಟ್ಟಿ",
    bn: "ব্যাকটেরিয়া বৃদ্ধি প্রতিরোধ"
  },
  properCookingStorage: {
    en: "Ensure proper cooking, storage, and reheating",
    hi: "उचित खाना पकाने, भंडारण और दोबारा गर्म करने को सुनिश्चित करें",
    kn: "ಸರಿಯಾದ ಅಡುಗೆ, ಸಂಗ್ರಹಣೆ ಮತ್ತು ಮತ್ತೆ ಬಿಸಿಮಾಡುವುದನ್ನು ಖಚಿತಪಡಿಸಿ",
    bn: "সঠিক রান্না, সংরক্ষণ এবং পুনরায় গরম করা নিশ্চিত"
  },
  allergenAwareness: {
    en: "Allergen Awareness",
    hi: "एलर्जेन जागरूकता",
    kn: "ಅಲರ್ಜಿನ್ ಅರಿವು",
    bn: "অ্যালার্জেন সচেতনতা"
  },
  handleAllergens: {
    en: "Handle allergens carefully",
    hi: "एलर्जेन को सावधानी से संभालें",
    kn: "ಅಲರ್ಜಿನ್ಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸಿ",
    bn: "অ্যালার্জেন সাবধানে পরিচালনা"
  },
  preventCrossContamination: {
    en: "Prevent cross-contamination",
    hi: "क्रॉस-संदूषण को रोकें",
    kn: "ಅಡ್ಡ-ಮಾಲಿನ್ಯವನ್ನು ತಡೆಗಟ್ಟಿ",
    bn: "ক্রস-দূষণ প্রতিরোধ"
  },
  accurateAllergenInfo: {
    en: "Provide accurate allergen information",
    hi: "सटीक एलर्जेन जानकारी प्रदान करें",
    kn: "ನಿಖರವಾದ ಅಲರ್ಜಿನ್ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ",
    bn: "সঠিক অ্যালার্জেন তথ্য প্রদান"
  },
  safeFoodHandling: {
    en: "Safe Food Handling",
    hi: "सुरक्षित भोजन प्रबंधन",
    kn: "ಸುರಕ್ಷಿತ ಆಹಾರ ನಿರ್ವಹಣೆ",
    bn: "নিরাপদ খাদ্য পরিচালনা"
  },
  followProcedures: {
    en: "Follow proper procedures for raw and cooked foods",
    hi: "कच्चे और पके हुए खाद्य पदार्थों के लिए उचित प्रक्रियाओं का पालन करें",
    kn: "ಕಚ್ಚಾ ಮತ್ತು ಬೇಯಿಸಿದ ಆಹಾರಗಳಿಗೆ ಸರಿಯಾದ ಕಾರ್ಯವಿಧಾನಗಳನ್ನು ಅನುಸರಿಸಿ",
    bn: "কাঁচা এবং রান্না করা খাবারের জন্য সঠিক পদ্ধতি অনুসরণ"
  },
  minimizeContamination: {
    en: "Minimize contamination risk",
    hi: "संदूषण जोखिम को कम करें",
    kn: "ಮಾಲಿನ್ಯದ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡಿ",
    bn: "দূষণের ঝুঁকি কমানো"
  },
  freshness: {
    en: "Freshness",
    hi: "ताजगी",
    kn: "ತಾಜಾತನ",
    bn: "তাজাতা"
  },
  freshIngredients: {
    en: "Use fresh, high-quality ingredients",
    hi: "ताजा, उच्च गुणवत्ता वाली सामग्री का उपयोग करें",
    kn: "ತಾಜಾ, ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಪದಾರ್ಥಗಳನ್ನು ಬಳಸಿ",
    bn: "তাজা, উচ্চমানের উপকরণ ব্যবহার"
  },
  selectBestProduce: {
    en: "Select best produce, meats, and components",
    hi: "सर्वोत्तम उपज, मांस और घटकों का चयन करें",
    kn: "ಅತ್ಯುತ್ತಮ ಉತ್ಪನ್ನಗಳು, ಮಾಂಸಗಳು ಮತ್ತು ಘಟಕಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    bn: "সেরা ফলমূল, মাংস এবং উপাদান নির্বাচন"
  },
  properTechniques: {
    en: "Proper Techniques",
    hi: "उचित तकनीक",
    kn: "ಸರಿಯಾದ ತಂತ್ರಗಳು",
    bn: "সঠিক কৌশল"
  },
  employTechniques: {
    en: "Employ proper cooking techniques",
    hi: "उचित खाना पकाने की तकनीकों का प्रयोग करें",
    kn: "ಸರಿಯಾದ ಅಡುಗೆ ತಂತ್ರಗಳನ್ನು ಬಳಸಿ",
    bn: "সঠিক রান্নার কৌশল প্রয়োগ"
  },
  maximizeFlavor: {
    en: "Maximize flavor, texture, and nutritional value",
    hi: "स्वाद, बनावट और पोषण मूल्य को अधिकतम करें",
    kn: "ರುಚಿ, ವಿನ್ಯಾಸ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶದ ಮೌಲ್ಯವನ್ನು ಗರಿಷ್ಠಗೊಳಿಸಿ",
    bn: "স্বাদ, টেক্সচার এবং পুষ্টিগুণ সর্বাধিক করা"
  },
  highestStandards: {
    en: "Ensure highest preparation standards",
    hi: "उच्चतम तैयारी मानकों को सुनिश्चित करें",
    kn: "ಅತ್ಯುನ್ನತ ತಯಾರಿ ಮಾನದಂಡಗಳನ್ನು ಖಚಿತಪಡಿಸಿ",
    bn: "সর্বোচ্চ প্রস্তুতির মান নিশ্চিত"
  },
  attentionToDetail: {
    en: "Attention to Detail",
    hi: "विस्तार पर ध्यान",
    kn: "ವಿವರಗಳಿಗೆ ಗಮನ",
    bn: "বিস্তারিত মনোযোগ"
  },
  closeAttention: {
    en: "Pay close attention to every step",
    hi: "हर कदम पर पूरा ध्यान दें",
    kn: "ಪ್ರತಿ ಹಂತಕ್ಕೂ ನಿಕಟ ಗಮನ ಕೊಡಿ",
    bn: "প্রতিটি ধাপে গভীর মনোযোগ দেওয়া"
  },
  choppingToPlating: {
    en: "From chopping vegetables to final plating",
    hi: "सब्जियां काटने से लेकर अंतिम प्लेटिंग तक",
    kn: "ತರಕಾರಿಗಳನ್ನು ಕತ್ತರಿಸುವುದರಿಂದ ಹಿಡಿದು ಅಂತಿಮ ಪ್ಲೇಟಿಂಗ್ವರೆಗೆ",
    bn: "সবজি কাটা থেকে চূড়ান্ত পরিবেশন পর্যন্ত"
  },
  consistencyVisual: {
    en: "Ensure consistency and visual appeal",
    hi: "स्थिरता और दृश्य अपील सुनिश्चित करें",
    kn: "ಸ್ಥಿರತೆ ಮತ್ತು ದೃಶ್ಯ ಆಕರ್ಷಣೆಯನ್ನು ಖಚಿತಪಡಿಸಿ",
    bn: "সংগতি এবং দৃশ্যমান আবেদন নিশ্চিত"
  },
  dietaryRestrictions: {
    en: "Dietary Restrictions",
    hi: "आहार प्रतिबंध",
    kn: "ಆಹಾರ ನಿರ್ಬಂಧಗಳು",
    bn: "খাদ্যতালিকাগত সীমাবদ্ধতা"
  },
  accommodateGlutenFree: {
    en: "Accommodate gluten-free needs",
    hi: "ग्लूटेन-मुक्त आवश्यकताओं को पूरा करें",
    kn: "ಗ್ಲುಟನ್-ಮುಕ್ತ ಅಗತ್ಯಗಳನ್ನು ಪೂರೈಸಿ",
    bn: "গ্লুটেন-মুক্ত প্রয়োজন মেটানো"
  },
  vegetarianVegan: {
    en: "Prepare vegetarian and vegan meals",
    hi: "शाकाहारी और वीगन भोजन तैयार करें",
    kn: "ಸಸ್ಯಾಹಾರಿ ಮತ್ತು ವೇಗನ್ ಊಟಗಳನ್ನು ತಯಾರಿಸಿ",
    bn: "নিরামিষ এবং ভেগান খাবার প্রস্তুত"
  },
  specificAllergies: {
    en: "Tailor to specific allergies/intolerances",
    hi: "विशिष्ट एलर्जी/असहिष्णुता के अनुरूप बनाएं",
    kn: "ನಿರ್ದಿಷ್ಟ ಅಲರ್ಜಿಗಳು/ಅಸಹಿಷ್ಣುತೆಗಳಿಗೆ ಹೊಂದಿಸಿ",
    bn: "নির্দিষ্ট অ্যালার্জি/অসহিষ্ণুতার সাথে মানিয়ে নেওয়া"
  },
  customization: {
    en: "Customization",
    hi: "अनुकूलन",
    kn: "ಗ್ರಾಹಕೀಕರಣ",
    bn: "কাস্টমাইজেশন"
  },
  adjustSpice: {
    en: "Adjust spice levels",
    hi: "मसाला स्तर समायोजित करें",
    kn: "ಮಸಾಲೆಯ ಮಟ್ಟವನ್ನು ಹೊಂದಿಸಿ",
    bn: "মসলার মাত্রা সামঞ্জস্য"
  },
  modifyIngredients: {
    en: "Modify ingredients",
    hi: "सामग्री संशोधित करें",
    kn: "ಪದಾರ್ಥಗಳನ್ನು ಮಾರ್ಪಡಿಸಿ",
    bn: "উপকরণ পরিবর্তন"
  },
  customizePortions: {
    en: "Customize portion sizes",
    hi: "भाग के आकार को अनुकूलित करें",
    kn: "ಭಾಗದ ಗಾತ್ರಗಳನ್ನು ಗ್ರಾಹಕೀಕರಿಸಿ",
    bn: "পরিবেশনের আকার কাস্টমাইজ"
  },
  caregiverServicesTitle: {
    en: "ServEaso Caregiver Services",
    hi: "सर्वएसो की देखभालकर्ता सेवाएं",
    kn: "ServEaso ಆರೈಕೆದಾರ ಸೇವೆಗಳು",
    bn: "সার্ভইজোর পরিচর্যাকারী সেবা"
  },
  caregiverServicesDescription: {
    en: "Professional child care services",
    hi: "पेशेवर बच्चों की देखभाल सेवाएं",
    kn: "ವೃತ್ತಿಪರ ಮಕ್ಕಳ ಆರೈಕೆ ಸೇವೆಗಳು",
    bn: "পেশাদার শিশু যত্ন সেবা"
  },
  nurtureEnvironment: {
    en: "Nurture and Safe Environment",
    hi: "पोषण और सुरक्षित वातावरण",
    kn: "ಪೋಷಣೆ ಮತ್ತು ಸುರಕ್ಷಿತ ವಾತಾವರಣ",
    bn: "লালন এবং নিরাপদ পরিবেশ"
  },
  lovingSupportive: {
    en: "Provide loving and supportive environment",
    hi: "प्यार और सहायक वातावरण प्रदान करें",
    kn: "ಪ್ರೀತಿಯ ಮತ್ತು ಬೆಂಬಲಿಸುವ ವಾತಾವರಣವನ್ನು ಒದಗಿಸಿ",
    bn: "স্নেহময় এবং সহায়ক পরিবেশ প্রদান"
  },
  safeSecure: {
    en: "Children feel safe, secure, and understood",
    hi: "बच्चे सुरक्षित, संरक्षित और समझा हुआ महसूस करते हैं",
    kn: "ಮಕ್ಕಳು ಸುರಕ್ಷಿತ, ಭದ್ರ ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲ್ಪಟ್ಟ ಭಾವನೆ ಹೊಂದಿರುತ್ತಾರೆ",
    bn: "শিশুরা নিরাপদ, সুরক্ষিত এবং বোঝা অনুভব করে"
  },
  comfortEncouragement: {
    en: "Offer comfort and encouragement",
    hi: "आराम और प्रोत्साहन प्रदान करें",
    kn: "ಆಶ್ವಾಸನೆ ಮತ್ತು ಪ್ರೋತ್ಸಾಹವನ್ನು ನೀಡಿ",
    bn: "সান্ত্বনা এবং উত্সাহ প্রদান"
  },
  emotionalConnection: {
    en: "Build strong emotional connection",
    hi: "मजबूत भावनात्मक संबंध बनाएं",
    kn: "ಬಲವಾದ ಭಾವನಾತ್ಮಕ ಸಂಪರ್ಕವನ್ನು ನಿರ್ಮಿಸಿ",
    bn: "শক্তিশালী মানসিক সংযোগ গড়ে তোলা"
  },
  physicalSafety: {
    en: "Physical Safety",
    hi: "शारीरिक सुरक्षा",
    kn: "ದೈಹಿಕ ಸುರಕ್ಷತೆ",
    bn: "শারীরিক নিরাপত্তা"
  },
  hazardFree: {
    en: "Ensure hazard-free environment",
    hi: "खतरा-मुक्त वातावरण सुनिश्चित करें",
    kn: "ಅಪಾಯ-ಮುಕ್ತ ವಾತಾವರಣವನ್ನು ಖಚಿತಪಡಿಸಿ",
    bn: "বিপদমুক্ত পরিবেশ নিশ্চিত"
  },
  superviseActivities: {
    en: "Supervise all activities",
    hi: "सभी गतिविधियों की निगरानी करें",
    kn: "ಎಲ್ಲಾ ಚಟುವಟಿಕೆಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ",
    bn: "সমস্ত কার্যকলাপ তত্ত্বাবধান"
  },
  emergencyPrepared: {
    en: "Prepare for emergencies",
    hi: "आपात स्थितियों के लिए तैयार रहें",
    kn: "ತುರ್ತು ಸಂದರ್ಭಗಳಿಗೆ ಸಿದ್ಧರಾಗಿ",
    bn: "জরুরি অবস্থার জন্য প্রস্তুত থাকা"
  },
  medicalSafety: {
    en: "Medical Safety",
    hi: "चिकित्सा सुरक्षा",
    kn: "ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತೆ",
    bn: "চিকিৎসা নিরাপত্তা"
  },
  trainedCPR: {
    en: "Trained in CPR",
    hi: "सीपीआर में प्रशिक्षित",
    kn: "CPR ನಲ್ಲಿ ತರಬೇತಿ ಪಡೆದಿದ್ದಾರೆ",
    bn: "সিপিআর-এ প্রশিক্ষিত"
  },
  firstAidCertified: {
    en: "First aid certified for medical emergencies",
    hi: "चिकित्सा आपात स्थितियों के लिए प्राथमिक चिकित्सा प्रमाणित",
    kn: "ವೈದ್ಯಕೀಯ ತುರ್ತು ಸಂದರ್ಭಗಳಿಗೆ ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಪ್ರಮಾಣೀಕೃತ",
    bn: "চিকিৎসা জরুরি অবস্থার জন্য প্রাথমিক চিকিৎসা প্রত্যয়িত"
  },
  cognitiveDevelopment: {
    en: "Cognitive Development",
    hi: "संज्ञानात्मक विकास",
    kn: "ಅರಿವಿನ ಬೆಳವಣಿಗೆ",
    bn: "জ্ঞানীয় বিকাশ"
  },
  ageAppropriateActivities: {
    en: "Engage in age-appropriate activities",
    hi: "आयु-उपयुक्त गतिविधियों में शामिल हों",
    kn: "ವಯಸ್ಸಿಗೆ ಸೂಕ್ತವಾದ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ",
    bn: "বয়স-উপযুক্ত কার্যক্রমে অংশগ্রহণ"
  },
  readingEducational: {
    en: "Reading and educational games",
    hi: "पढ़ना और शैक्षिक खेल",
    kn: "ಓದುವುದು ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಆಟಗಳು",
    bn: "পড়া এবং শিক্ষামূলক খেলা"
  },
  exploreInterests: {
    en: "Explore children's interests",
    hi: "बच्चों की रुचियों का अन्वेषण करें",
    kn: "ಮಕ್ಕಳ ಆಸಕ್ತಿಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    bn: "শিশুদের আগ্রহ অন্বেষণ"
  },
  homeworkHelp: {
    en: "Help with homework",
    hi: "होमवर्क में मदद",
    kn: "ಮನೆಕೆಲಸದಲ್ಲಿ ಸಹಾಯ",
    bn: "হোমওয়ার্কে সাহায্য"
  },
  encourageLearning: {
    en: "Encourage learning",
    hi: "सीखने को प्रोत्साहित करें",
    kn: "ಕಲಿಕೆಯನ್ನು ಪ್ರೋತ್ಸಾಹಿಸಿ",
    bn: "শেখার উত্সাহ দেওয়া"
  },
  socialEmotional: {
    en: "Social/Emotional Development",
    hi: "सामाजिक/भावनात्मक विकास",
    kn: "ಸಾಮಾಜಿಕ/ಭಾವನಾತ್ಮಕ ಬೆಳವಣಿಗೆ",
    bn: "সামাজিক/আবেগীয় বিকাশ"
  },
  teachSharing: {
    en: "Teach sharing and empathy",
    hi: "साझा करना और सहानुभूति सिखाएं",
    kn: "ಹಂಚಿಕೊಳ್ಳುವುದು ಮತ್ತು ಸಹಾನುಭೂತಿಯನ್ನು ಕಲಿಸಿ",
    bn: "ভাগ করে নেওয়া এবং সহানুভূতি শেখানো"
  },
  conflictResolution: {
    en: "Conflict resolution skills",
    hi: "संघर्ष समाधान कौशल",
    kn: "ಸಂಘರ್ಷ ಪರಿಹಾರ ಕೌಶಲ್ಯಗಳು",
    bn: "দ্বন্দ্ব সমাধানের দক্ষতা"
  },
  selfConfidence: {
    en: "Develop self-confidence",
    hi: "आत्मविश्वास विकसित करें",
    kn: "ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ",
    bn: "আত্মবিশ্বাস বিকাশ"
  },
  emotionalIntelligence: {
    en: "Build emotional intelligence",
    hi: "भावनात्मक बुद्धिमत्ता का निर्माण करें",
    kn: "ಭಾವನಾತ್ಮಕ ಬುದ್ಧಿಮತ್ತೆಯನ್ನು ನಿರ್ಮಿಸಿ",
    bn: "আবেগীয় বুদ্ধিমত্তা গড়ে তোলা"
  },
  physicalDevelopment: {
    en: "Physical Development",
    hi: "शारीरिक विकास",
    kn: "ದೈಹಿಕ ಬೆಳವಣಿಗೆ",
    bn: "শারীরিক বিকাশ"
  },
  encourageActivity: {
    en: "Encourage physical activity",
    hi: "शारीरिक गतिविधि को प्रोत्साहित करें",
    kn: "ದೈಹಿಕ ಚಟುವಟಿಕೆಯನ್ನು ಪ್ರೋತ್ಸಾಹಿಸಿ",
    bn: "শারীরিক কার্যকলাপ উত্সাহিত"
  },
  outdoorAdventures: {
    en: "Outdoor adventures",
    hi: "बाहरी रोमांच",
    kn: "ಹೊರಾಂಗಣ ಸಾಹಸಗಳು",
    bn: "বাইরের দুঃসাহসিক কাজ"
  },
  ageSports: {
    en: "Age-appropriate sports",
    hi: "आयु-उपयुक्त खेल",
    kn: "ವಯಸ್ಸಿಗೆ ಸೂಕ್ತವಾದ ಕ್ರೀಡೆಗಳು",
    bn: "বয়স-উপযুক্ত খেলাধুলা"
  },
  healthyMeals: {
    en: "Prepare healthy meals and snacks",
    hi: "स्वस्थ भोजन और नाश्ता तैयार करें",
    kn: "ಆರೋಗ್ಯಕರ ಊಟ ಮತ್ತು ತಿಂಡಿಗಳನ್ನು ತಯಾರಿಸಿ",
    bn: "স্বাস্থ্যকর খাবার এবং নাস্তা প্রস্তুত"
  },
  communication: {
    en: "Communication",
    hi: "संचार",
    kn: "ಸಂವಹನ",
    bn: "যোগাযোগ"
  },
  openCommunication: {
    en: "Maintain open communication with parents",
    hi: "माता-पिता के साथ खुला संचार बनाए रखें",
    kn: "ಪೋಷಕರೊಂದಿಗೆ ಮುಕ್ತ ಸಂವಹನವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ",
    bn: "পিতামাতার সাথে খোলা যোগাযোগ বজায় রাখা"
  },
  dailyUpdates: {
    en: "Share daily updates",
    hi: "दैनिक अपडेट साझा करें",
    kn: "ದೈನಂದಿನ ನವೀಕರಣಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
    bn: "দৈনিক আপডেট শেয়ার করা"
  },
  discussProgress: {
    en: "Discuss development progress",
    hi: "विकास प्रगति पर चर्चा करें",
    kn: "ಬೆಳವಣಿಗೆಯ ಪ್ರಗತಿಯನ್ನು ಚರ್ಚಿಸಿ",
    bn: "বিকাশের অগ্রগতি নিয়ে আলোচনা"
  },
  listenAttentively: {
    en: "Listen attentively to child",
    hi: "बच्चे को ध्यान से सुनें",
    kn: "ಮಗುವಿಗೆ ಗಮನವಿಟ್ಟು ಕೇಳಿ",
    bn: "শিশুর কথা মনোযোগ দিয়ে শোনা"
  },
  respondEmpathy: {
    en: "Respond with empathy",
    hi: "सहानुभूति के साथ प्रतिक्रिया दें",
    kn: "ಸಹಾನುಭೂತಿಯಿಂದ ಪ್ರತಿಕ್ರಿಯಿಸಿ",
    bn: "সহানুভূতির সাথে সাড়া দেওয়া"
  },
  collaboration: {
    en: "Collaboration",
    hi: "सहयोग",
    kn: "ಸಹಯೋಗ",
    bn: "সহযোগিতা"
  },
  workPartnership: {
    en: "Work in partnership with parents",
    hi: "माता-पिता के साथ साझेदारी में काम करें",
    kn: "ಪೋಷಕರೊಂದಿಗೆ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಕೆಲಸ ಮಾಡಿ",
    bn: "পিতামাতার সাথে অংশীদারিত্বে কাজ করা"
  },
  consistencyCare: {
    en: "Ensure consistency in care",
    hi: "देखभाल में स्थिरता सुनिश्चित करें",
    kn: "ಆರೈಕೆಯಲ್ಲಿ ಸ್ಥಿರತೆಯನ್ನು ಖಚಿತಪಡಿಸಿ",
    bn: "যত্নে ধারাবাহিকতা নিশ্চিত"
  },
  respectValues: {
    en: "Respect parents' values",
    hi: "माता-पिता के मूल्यों का सम्मान करें",
    kn: "ಪೋಷಕರ ಮೌಲ್ಯಗಳನ್ನು ಗೌರವಿಸಿ",
    bn: "পিতামাতার মূল্যবোধকে সম্মান করা"
  },
  followStyles: {
    en: "Follow parenting styles",
    hi: "पेरेंटिंग शैलियों का पालन करें",
    kn: "ಪೋಷಕತ್ವ ಶೈಲಿಗಳನ್ನು ಅನುಸರಿಸಿ",
    bn: "প্যারেন্টিং শৈলী অনুসরণ"
  },
  close: {
    en: "Close",
    hi: "बंद करें",
    kn: "ಮುಚ್ಚಿ",
    bn: "বন্ধ করুন"
  },

  // ============ ABOUT US PAGE TRANSLATIONS ============
  backToHome: {
    en: "Back to Home",
    hi: "होम पर वापस जाएं",
    kn: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    bn: "হোমে ফিরুন"
  },

  aboutUsHero1: {
    en: "We are",
    hi: "हम हैं",
    kn: "ನಾವು",
    bn: "আমরা হলাম"
  },

  aboutUsHero2: {
    en: "– a house helps service provider. 'ServEaso' collectively means 'Service Made Easy' or 'Easy Services.' We simplify the process of connecting customers who need home services with reliable and verified professionals.",
    hi: "– एक घरेलू सहायता सेवा प्रदाता। 'ServEaso' का सामूहिक अर्थ है 'सेवा आसान बनाई गई' या 'आसान सेवाएं'। हम घरेलू सेवाओं की आवश्यकता वाले ग्राहकों को विश्वसनीय और सत्यापित पेशेवरों से जोड़ने की प्रक्रिया को सरल बनाते हैं।",
    kn: "– ಮನೆ ಸಹಾಯಕ ಸೇವೆ ಒದಗಿಸುವವರು. 'ServEaso' ಒಟ್ಟಾರೆಯಾಗಿ 'ಸೇವೆಯನ್ನು ಸುಲಭಗೊಳಿಸಲಾಗಿದೆ' ಅಥವಾ 'ಸುಲಭ ಸೇವೆಗಳು' ಎಂದರ್ಥ. ಮನೆ ಸೇವೆಗಳ ಅಗತ್ಯವಿರುವ ಗ್ರಾಹಕರನ್ನು ವಿಶ್ವಾಸಾರ್ಹ ಮತ್ತು ಪರಿಶೀಲಿತ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಪ್ರಕ್ರಿಯೆಯನ್ನು ನಾವು ಸರಳಗೊಳಿಸುತ್ತೇವೆ.",
    bn: "– একটি গৃহকর্মী সেবা প্রদানকারী। 'ServEaso' সমষ্টিগতভাবে অর্থ 'সেবা সহজ করা' বা 'সহজ সেবা'। আমরা গৃহস্থালি সেবার প্রয়োজন এমন গ্রাহকদের বিশ্বস্ত এবং যাচাইকৃত পেশাজীবীদের সাথে সংযুক্ত করার প্রক্রিয়াটি সহজ করি।"
  },

  ourStory: {
    en: "Our Story",
    hi: "हमारी कहानी",
    kn: "ನಮ್ಮ ಕಥೆ",
    bn: "আমাদের গল্প"
  },

  ourStory1: {
    en: "ServEaso provides trained and verified house helps to simplify the lives of individuals and families who struggle to balance their professional commitments with household responsibilities.",
    hi: "ServEaso उन व्यक्तियों और परिवारों के जीवन को सरल बनाने के लिए प्रशिक्षित और सत्यापित घरेलू सहायक प्रदान करता है जो अपनी पेशेवर प्रतिबद्धताओं को घरेलू जिम्मेदारियों के साथ संतुलित करने के लिए संघर्ष करते हैं।",
    kn: "ವೃತ್ತಿಪರ ಬದ್ಧತೆಗಳನ್ನು ಮನೆಯ ಜವಾಬ್ದಾರಿಗಳೊಂದಿಗೆ ಸಮತೋಲನಗೊಳಿಸಲು ಹೆಣಗಾಡುವ ವ್ಯಕ್ತಿಗಳು ಮತ್ತು ಕುಟುಂಬಗಳ ಜೀವನವನ್ನು ಸರಳಗೊಳಿಸಲು ServEaso ತರಬೇತಿ ಪಡೆದ ಮತ್ತು ಪರಿಶೀಲಿತ ಮನೆ ಸಹಾಯಕರನ್ನು ಒದಗಿಸುತ್ತದೆ.",
    bn: "ServEaso প্রশিক্ষিত এবং যাচাইকৃত গৃহকর্মী সরবরাহ করে যারা পেশাগত প্রতিশ্রুতি এবং গৃহস্থালির দায়িত্বের মধ্যে ভারসাম্য রাখতে সংগ্রাম করে এমন ব্যক্তি এবং পরিবারের জীবন সহজ করতে।"
  },

  ourStory2: {
    en: "ServEaso offers a convenient and reliable solution for those in need of house care services, ensuring peace of mind and quality care for customers.",
    hi: "ServEaso उन लोगों के लिए एक सुविधाजनक और विश्वसनीय समाधान प्रदान करता है जिन्हें घरेलू देखभाल सेवाओं की आवश्यकता होती है, जिससे ग्राहकों के लिए मानसिक शांति और गुणवत्तापूर्ण देखभाल सुनिश्चित होती है।",
    kn: "ServEaso ಮನೆ ಆರೈಕೆ ಸೇವೆಗಳ ಅಗತ್ಯವಿರುವವರಿಗೆ ಅನುಕೂಲಕರ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಪರಿಹಾರವನ್ನು ನೀಡುತ್ತದೆ, ಗ್ರಾಹಕರಿಗೆ ಮನಸ್ಸಿನ ಶಾಂತಿ ಮತ್ತು ಗುಣಮಟ್ಟದ ಆರೈಕೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
    bn: "ServEaso গৃহস্থালি যত্ন সেবার প্রয়োজন তাদের জন্য একটি সুবিধাজনক এবং নির্ভরযোগ্য সমাধান প্রদান করে, গ্রাহকদের জন্য মানসিক শান্তি এবং মানসম্পন্ন যত্ন নিশ্চিত করে।"
  },

  challengesWeSolve: {
    en: "Challenges We Solve",
    hi: "हम जिन चुनौतियों का समाधान करते हैं",
    kn: "ನಾವು ಪರಿಹರಿಸುವ ಸವಾಲುಗಳು",
    bn: "আমরা যে চ্যালেঞ্জগুলি সমাধান করি"
  },

  highTurnover: {
    en: "High Turnover",
    hi: "उच्च कारोबार",
    kn: "ಅಧಿಕ ವಹಿವಾಟು",
    bn: "উচ্চ টার্নওভার"
  },

  highTurnoverDesc: {
    en: "Difficulty in retaining house helps due to factors like demanding work conditions, low wages, or lack of work-life balance.",
    hi: "मांग वाली कार्य स्थितियों, कम मजदूरी या कार्य-जीवन संतुलन की कमी जैसे कारकों के कारण घरेलू सहायकों को बनाए रखने में कठिनाई।",
    kn: "ಕಠಿಣ ಕೆಲಸದ ಪರಿಸ್ಥಿತಿಗಳು, ಕಡಿಮೆ ವೇತನ, ಅಥವಾ ಕೆಲಸ-ಜೀವನ ಸಮತೋಲನದ ಕೊರತೆಯಂತಹ ಅಂಶಗಳಿಂದ ಮನೆ ಸಹಾಯಕರನ್ನು ಉಳಿಸಿಕೊಳ್ಳುವಲ್ಲಿ ತೊಂದರೆ.",
    bn: "কঠিন কাজের পরিবেশ, কম মজুরি, বা কাজ-জীবনের ভারসাম্যের অভাবের মতো কারণে গৃহকর্মী ধরে রাখতে অসুবিধা।"
  },

  skillsGap: {
    en: "Skills Gap",
    hi: "कौशल अंतर",
    kn: "ಕೌಶಲ್ಯ ಅಂತರ",
    bn: "দক্ষতার অভাব"
  },

  skillsGapDesc: {
    en: "Lack of necessary skills or training for specific tasks, leading to subpar performance or safety concerns.",
    hi: "विशिष्ट कार्यों के लिए आवश्यक कौशल या प्रशिक्षण की कमी, जिससे कम प्रदर्शन या सुरक्षा संबंधी चिंताएं होती हैं।",
    kn: "ನಿರ್ದಿಷ್ಟ ಕಾರ್ಯಗಳಿಗೆ ಅಗತ್ಯ ಕೌಶಲ್ಯಗಳು ಅಥವಾ ತರಬೇತಿಯ ಕೊರತೆ, ಇದು ಕಳಪೆ ಕಾರ್ಯಕ್ಷಮತೆ ಅಥವಾ ಸುರಕ್ಷತಾ ಕಾಳಜಿಗಳಿಗೆ ಕಾರಣವಾಗುತ್ತದೆ.",
    bn: "নির্দিষ্ট কাজের জন্য প্রয়োজনীয় দক্ষতা বা প্রশিক্ষণের অভাব, যা নিম্নমানের কর্মক্ষমতা বা নিরাপত্তা উদ্বেগের দিকে নিয়ে যায়।"
  },

  communicationBarriers: {
    en: "Communication Barriers",
    hi: "संचार बाधाएं",
    kn: "ಸಂವಹನ ಅಡೆತಡೆಗಳು",
    bn: "যোগাযোগের বাধা"
  },

  communicationBarriersDesc: {
    en: "Language or cultural differences hindering effective communication.",
    hi: "भाषा या सांस्कृतिक अंतर प्रभावी संचार में बाधा डालते हैं।",
    kn: "ಭಾಷೆ ಅಥವಾ ಸಾಂಸ್ಕೃತಿಕ ವ್ಯತ್ಯಾಸಗಳು ಪರಿಣಾಮಕಾರಿ ಸಂವಹನಕ್ಕೆ ಅಡ್ಡಿಯಾಗುತ್ತವೆ.",
    bn: "ভাষাগত বা সাংস্কৃতিক পার্থক্য কার্যকর যোগাযোগে বাধা সৃষ্টি করে।"
  },

  trustAndSecurity: {
    en: "Trust and Security",
    hi: "विश्वास और सुरक्षा",
    kn: "ನಂಬಿಕೆ ಮತ್ತು ಸುರಕ್ಷತೆ",
    bn: "বিশ্বাস ও নিরাপত্তা"
  },

  trustAndSecurityDesc: {
    en: "Concerns about theft, privacy violations, or family safety.",
    hi: "चोरी, गोपनीयता उल्लंघन या परिवार की सुरक्षा के बारे में चिंताएं।",
    kn: "ಕಳ್ಳತನ, ಗೌಪ್ಯತೆ ಉಲ್ಲಂಘನೆಗಳು ಅಥವಾ ಕುಟುಂಬದ ಸುರಕ್ಷತೆಯ ಬಗ್ಗೆ ಕಾಳಜಿಗಳು.",
    bn: "চুরি, গোপনীয়তা লঙ্ঘন, বা পরিবারের নিরাপত্তা সম্পর্কে উদ্বেগ।"
  },

  dependenceAndEntitlement: {
    en: "Dependence and Entitlement",
    hi: "निर्भरता और अधिकार",
    kn: "ಅವಲಂಬನೆ ಮತ್ತು ಹಕ್ಕು",
    bn: "নির্ভরশীলতা এবং অধিকারবোধ"
  },

  dependenceAndEntitlementDesc: {
    en: "Overreliance on employers, reducing household independence.",
    hi: "नियोक्ताओं पर अत्यधिक निर्भरता, घरेलू स्वतंत्रता को कम करना।",
    kn: "ಉದ್ಯೋಗದಾತರ ಮೇಲೆ ಅತಿಯಾದ ಅವಲಂಬನೆ, ಮನೆಯ ಸ್ವಾತಂತ್ರ್ಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.",
    bn: "নিয়োগকর্তাদের উপর অতিরিক্ত নির্ভরশীলতা, গৃহস্থালির স্বাধীনতা হ্রাস করে।"
  },

  lackOfLegalProtection: {
    en: "Lack of Legal Protection",
    hi: "कानूनी संरक्षण का अभाव",
    kn: "ಕಾನೂನು ರಕ್ಷಣೆಯ ಕೊರತೆ",
    bn: "আইনি সুরক্ষার অভাব"
  },

  lackOfLegalProtectionDesc: {
    en: "Exploitation due to unclear legal frameworks or poor enforcement.",
    hi: "अस्पष्ट कानूनी ढांचे या खराब प्रवर्तन के कारण शोषण।",
    kn: "ಅಸ್ಪಷ್ಟ ಕಾನೂನು ಚೌಕಟ್ಟುಗಳು ಅಥವಾ ಕಳಪೆ ಜಾರಿಯಿಂದಾಗಿ ಶೋಷಣೆ.",
    bn: "অস্পষ্ট আইনি কাঠামো বা দুর্বল প্রয়োগের কারণে শোষণ।"
  },

  socialIsolation: {
    en: "Social Isolation",
    hi: "सामाजिक अलगाव",
    kn: "ಸಾಮಾಜಿಕ ಪ್ರತ್ಯೇಕತೆ",
    bn: "সামাজিক বিচ্ছিন্নতা"
  },

  socialIsolationDesc: {
    en: "Loneliness from living away from families and communities.",
    hi: "परिवारों और समुदायों से दूर रहने से अकेलापन।",
    kn: "ಕುಟುಂಬಗಳು ಮತ್ತು ಸಮುದಾಯಗಳಿಂದ ದೂರವಿರುವುದರಿಂದ ಒಂಟಿತನ.",
    bn: "পরিবার এবং সম্প্রদায় থেকে দূরে থাকার কারণে একাকীত্ব।"
  },

  employerMaidRelationship: {
    en: "Employer-Maid Relationship Dynamics",
    hi: "नियोक्ता-नौकरानी संबंध गतिशीलता",
    kn: "ಉದ್ಯೋಗದಾತ-ಮನೆಕೆಲಸದವರ ಸಂಬಂಧದ ಡೈನಾಮಿಕ್ಸ್",
    bn: "নিয়োগকর্তা-গৃহকর্মী সম্পর্কের গতিশীলতা"
  },

  employerMaidRelationshipDesc: {
    en: "Difficulty in building respectful, trust-based relationships.",
    hi: "सम्मानजनक, विश्वास-आधारित संबंध बनाने में कठिनाई।",
    kn: "ಗೌರವಯುತ, ವಿಶ್ವಾಸ-ಆಧಾರಿತ ಸಂಬಂಧಗಳನ್ನು ನಿರ್ಮಿಸುವಲ್ಲಿ ತೊಂದರೆ.",
    bn: "সম্মানজনক, বিশ্বাস-ভিত্তিক সম্পর্ক গড়তে অসুবিধা।"
  },

  limitedAccessToHealthcare: {
    en: "Limited Access to Healthcare",
    hi: "स्वास्थ्य सेवा तक सीमित पहुंच",
    kn: "ಆರೋಗ್ಯ ರಕ್ಷಣೆಗೆ ಸೀಮಿತ ಪ್ರವೇಶ",
    bn: "স্বাস্থ্যসেবায় সীমিত অ্যাক্সেস"
  },

  limitedAccessToHealthcareDesc: {
    en: "Lack of affordable healthcare or insurance coverage.",
    hi: "किफायती स्वास्थ्य सेवा या बीमा कवरेज का अभाव।",
    kn: "ಕೈಗೆಟುಕುವ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಅಥವಾ ವಿಮಾ ರಕ್ಷಣೆಯ ಕೊರತೆ.",
    bn: "সাশ্রয়ী মূল্যের স্বাস্থ্যসেবা বা বীমা কভারেজের অভাব।"
  },

  lackOfStandardizedPractices: {
    en: "Lack of Standardized Practices",
    hi: "मानकीकृत प्रथाओं का अभाव",
    kn: "ಪ್ರಮಾಣೀಕೃತ ಅಭ್ಯಾಸಗಳ ಕೊರತೆ",
    bn: "মানসম্মত অনুশীলনের অভাব"
  },

  lackOfStandardizedPracticesDesc: {
    en: "No clear guidelines for hiring, training, and managing domestic workers.",
    hi: "घरेलू कामगारों को काम पर रखने, प्रशिक्षण देने और प्रबंधित करने के लिए कोई स्पष्ट दिशानिर्देश नहीं।",
    kn: "ಗೃಹ ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳುವುದು, ತರಬೇತಿ ನೀಡುವುದು ಮತ್ತು ನಿರ್ವಹಿಸುವುದಕ್ಕಾಗಿ ಸ್ಪಷ್ಟ ಮಾರ್ಗಸೂಚಿಗಳಿಲ್ಲ.",
    bn: "গৃহকর্মী নিয়োগ, প্রশিক্ষণ এবং পরিচালনার জন্য কোন স্পষ্ট নির্দেশিকা নেই।"
  },
  // ============ END ABOUT US PAGE TRANSLATIONS ============

  // ============ CONTACT US PAGE TRANSLATIONS ============
  requestSubmitted: {
    en: "Your request has been submitted!",
    hi: "आपका अनुरोध सबमिट कर दिया गया है!",
    kn: "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ!",
    bn: "আপনার অনুরোধ জমা দেওয়া হয়েছে!"
  },

  back: {
    en: "Back",
    hi: "वापस",
    kn: "ಹಿಂದೆ",
    bn: "পিছনে"
  },

  detailsFilters: {
    en: "Filters",
    hi: "फ़िल्टर",
    kn: "ಫಿಲ್ಟರ್‌ಗಳು",
    bn: "ফিল্টার"
  },
  detailsOneProviderFound: {
    en: "1 provider found",
    hi: "1 प्रदाता मिला",
    kn: "1 ಒದಗಿಸುವವರು ದೊರೆತಿದ್ದಾರೆ",
    bn: "১ জন প্রদানকারী পাওয়া গেছে"
  },
  detailsManyProvidersFound: {
    en: "{count} providers found",
    hi: "{count} प्रदाता मिले",
    kn: "{count} ಒದಗಿಸುವವರು ದೊರೆತಿದ್ದಾರೆ",
    bn: "{count} জন প্রদানকারী পাওয়া গেছে"
  },
  detailsNoMatchTitle: {
    en: "No providers match your filters",
    hi: "आपके फ़िल्टर से कोई प्रदाता मेल नहीं खाता",
    kn: "ನಿಮ್ಮ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಒದಗಿಸುವವರು ಇಲ್ಲ",
    bn: "আপনার ফিল্টারের সাথে কোনো প্রদানকারী মিলছে না"
  },
  detailsNoMatchBody: {
    en: "Try relaxing filters or clear them to see more results.",
    hi: "अधिक परिणाम देखने के लिए फ़िल्टर ढीले करें या साफ़ करें।",
    kn: "ಹೆಚ್ಚಿನ ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಲು ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಅಥವಾ ತೆರವುಗೊಳಿಸಿ.",
    bn: "আরও ফলাফল দেখতে ফিল্টার শিথিল করুন বা মুছে ফেলুন।"
  },
  detailsNoAreaTitle: {
    en: "No providers in this area yet",
    hi: "इस क्षेत्र में अभी कोई प्रदाता नहीं",
    kn: "ಈ ಪ್ರದೇಶದಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಒದಗಿಸುವವರು ಇಲ್ಲ",
    bn: "এই এলাকায় এখনও কোনো প্রদানকারী নেই"
  },
  detailsNoAreaBody: {
    en: "Try a different location or check back soon as we expand coverage.",
    hi: "कोई अन्य स्थान आज़माएँ या कवरेज बढ़ने पर जल्दी फिर देखें।",
    kn: "ಬೇರೆ ಸ್ಥಳವನ್ನು ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ವಿಸ್ತರಣೆಯಾದಾಗ ಶೀಘ್ರದಲ್ಲೇ ಪರಿಶೀಲಿಸಿ.",
    bn: "অন্য অবস্থান চেষ্টা করুন বা কভারেজ বাড়লে আবার দেখুন।"
  },
  detailsClearFilters: {
    en: "Clear filters",
    hi: "फ़िल्टर साफ़ करें",
    kn: "ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ",
    bn: "ফিল্টার মুছুন"
  },
  detailsEndOfList: {
    en: "You've reached the end of the list",
    hi: "आप सूची के अंत तक पहुँच गए",
    kn: "ನೀವು ಪಟ್ಟಿಯ ಅಂತ್ಯವನ್ನು ತಲುಪಿದ್ದೀರಿ",
    bn: "আপনি তালিকার শেষে পৌঁছেছেন"
  },
  detailsNoResultsShort: {
    en: "No providers to show",
    hi: "दिखाने के लिए कोई प्रदाता नहीं",
    kn: "ತೋರಿಸಲು ಯಾವುದೇ ಒದಗಿಸುವವರು ಇಲ್ಲ",
    bn: "দেখানোর মতো কোনো প্রদানকারী নেই"
  },

  getInTouch: {
    en: "Get in touch with us",
    hi: "हमसे संपर्क करें",
    kn: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
    bn: "আমাদের সাথে যোগাযোগ করুন"
  },

  contactDescription: {
    en: "Fill out the form below or schedule a meeting with us at your convenience.",
    hi: "नीचे दिए गए फॉर्म को भरें या अपनी सुविधानुसार हमारे साथ मीटिंग शेड्यूल करें।",
    kn: "ಕೆಳಗಿನ ಫಾರ್ಮ್ ಅನ್ನು ಭರ್ತಿ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ನಮ್ಮೊಂದಿಗೆ ಸಭೆಯನ್ನು ನಿಗದಿಪಡಿಸಿ.",
    bn: "নীচের ফর্মটি পূরণ করুন বা আপনার সুবিধামত আমাদের সাথে একটি মিটিং নির্ধারণ করুন।"
  },

  name: {
    en: "Name",
    hi: "नाम",
    kn: "ಹೆಸರು",
    bn: "নাম"
  },

  yourName: {
    en: "Your name",
    hi: "आपका नाम",
    kn: "ನಿಮ್ಮ ಹೆಸರು",
    bn: "আপনার নাম"
  },

  email: {
    en: "Email",
    hi: "ईमेल",
    kn: "ಇಮೇಲ್",
    bn: "ইমেল"
  },

  enterEmail: {
    en: "Enter Your Email",
    hi: "अपना ईमेल दर्ज करें",
    kn: "ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    bn: "আপনার ইমেল লিখুন"
  },

  message: {
    en: "Message",
    hi: "संदेश",
    kn: "ಸಂದೇಶ",
    bn: "বার্তা"
  },

  enterMessage: {
    en: "Enter Your Message",
    hi: "अपना संदेश दर्ज करें",
    kn: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ನಮೂದಿಸಿ",
    bn: "আপনার বার্তা লিখুন"
  },

  iAgreeWith: {
    en: "I agree with",
    hi: "मैं सहमत हूँ",
    kn: "ನಾನು ಸಮ್ಮತಿಸುತ್ತೇನೆ",
    bn: "আমি সম্মত"
  },

  termsAndConditions: {
    en: "Terms and Conditions",
    hi: "नियम और शर्तें",
    kn: "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು",
    bn: "শর্তাবলী"
  },

  sendRequest: {
    en: "Send Your Request",
    hi: "अपना अनुरोध भेजें",
    kn: "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಿ",
    bn: "আপনার অনুরোধ পাঠান"
  },

  contactVia: {
    en: "You can also contact us via",
    hi: "आप हमसे इसके माध्यम से भी संपर्क कर सकते हैं",
    kn: "ನೀವು ನಮ್ಮನ್ನು ಇವುಗಳ ಮೂಲಕವೂ ಸಂಪರ್ಕಿಸಬಹುದು",
    bn: "আপনি আমাদের সাথে যোগাযোগ করতে পারেন"
  },

  withOurServices: {
    en: "With our services you can",
    hi: "हमारी सेवाओं से आप",
    kn: "ನಮ್ಮ ಸೇವೆಗಳೊಂದಿಗೆ ನೀವು",
    bn: "আমাদের সেবার মাধ্যমে আপনি পারেন"
  },

  benefit1: {
    en: "Improve usability of your product",
    hi: "अपने उत्पाद की उपयोगिता में सुधार करें",
    kn: "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಬಳಕೆಯನ್ನು ಸುಧಾರಿಸಿ",
    bn: "আপনার পণ্যের ব্যবহারযোগ্যতা উন্নত করুন"
  },

  benefit2: {
    en: "Engage users at a higher level and outperform competition",
    hi: "उपयोगकर्ताओं को उच्च स्तर पर संलग्न करें और प्रतिस्पर्धा से आगे निकलें",
    kn: "ಬಳಕೆದಾರರನ್ನು ಉನ್ನತ ಮಟ್ಟದಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಸ್ಪರ್ಧೆಯನ್ನು ಮೀರಿಸಿ",
    bn: "ব্যবহারকারীদের উচ্চ স্তরে যুক্ত করুন এবং প্রতিযোগিতাকে ছাড়িয়ে যান"
  },

  benefit3: {
    en: "Reduce onboarding time and improve sales",
    hi: "ऑनबोर्डिंग समय कम करें और बिक्री में सुधार करें",
    kn: "ಆನ್ಬೋರ್ಡಿಂಗ್ ಸಮಯವನ್ನು ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ಮಾರಾಟವನ್ನು ಸುಧಾರಿಸಿ",
    bn: "অনবোর্ডিং সময় হ্রাস করুন এবং বিক্রয় উন্নত করুন"
  },

  benefit4: {
    en: "Balance user needs with your business goals",
    hi: "उपयोगकर्ता की जरूरतों को अपने व्यावसायिक लक्ष्यों के साथ संतुलित करें",
    kn: "ಬಳಕೆದಾರರ ಅಗತ್ಯಗಳನ್ನು ನಿಮ್ಮ ವ್ಯಾಪಾರ ಗುರಿಗಳೊಂದಿಗೆ ಸಮತೋಲನಗೊಳಿಸಿ",
    bn: "ব্যবহারকারীর চাহিদা এবং আপনার ব্যবসায়িক লক্ষ্যগুলির মধ্যে ভারসাম্য বজায় রাখুন"
  },

  followUs: {
    en: "Follow us",
    hi: "हमें फॉलो करें",
    kn: "ನಮ್ಮನ್ನು ಅನುಸರಿಸಿ",
    bn: "অনুসরণ করুন"
  },

  downloadApp: {
    en: "Download Our App",
    hi: "हमारा ऐप डाउनलोड करें",
    kn: "ನಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    bn: "আমাদের অ্যাপ ডাউনলোড করুন"
  },
  // ============ END CONTACT US PAGE TRANSLATIONS ============

  // ============ AGENT REGISTRATION FORM TRANSLATIONS ============
  agentRegistration: {
    en: "Agent Registration",
    hi: "एजेंट पंजीकरण",
    kn: "ಏಜೆಂಟ್ ನೋಂದಣಿ",
    bn: "এজেন্ট নিবন্ধন"
  },

  companyName: {
    en: "Company Name *",
    hi: "कंपनी का नाम *",
    kn: "ಕಂಪನಿ ಹೆಸರು *",
    bn: "কোম্পানির নাম *"
  },

  mobileNumber: {
    en: "Mobile Number *",
    hi: "मोबाइल नंबर *",
    kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *",
    bn: "মোবাইল নম্বর *"
  },

  emailId: {
    en: "Email ID *",
    hi: "ईमेल आईडी *",
    kn: "ಇಮೇಲ್ ಐಡಿ *",
    bn: "ইমেল আইডি *"
  },

  registrationId: {
    en: "Registration ID *",
    hi: "पंजीकरण आईडी *",
    kn: "ನೋಂದಣಿ ಐಡಿ *",
    bn: "নিবন্ধন আইডি *"
  },

  password: {
    en: "Password *",
    hi: "पासवर्ड *",
    kn: "ಪಾಸ್ವರ್ಡ್ *",
    bn: "পাসওয়ার্ড *"
  },

  confirmPassword: {
    en: "Confirm Password *",
    hi: "पासवर्ड की पुष्टि करें *",
    kn: "ಪಾಸ್ವರ್ಡ್ ದೃಢೀಕರಿಸಿ *",
    bn: "পাসওয়ার্ড নিশ্চিত করুন *"
  },

  companyAddress: {
    en: "Company Address *",
    hi: "कंपनी का पता *",
    kn: "ಕಂಪನಿ ವಿಳಾಸ *",
    bn: "কোম্পানির ঠিকানা *"
  },

  submit: {
    en: "Submit",
    hi: "जमा करें",
    kn: "ಸಲ್ಲಿಸಿ",
    bn: "জমা দিন"
  },

  submitting: {
    en: "Submitting...",
    hi: "जमा किया जा रहा है...",
    kn: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    bn: "জমা দেওয়া হচ্ছে..."
  },

  phoneValidationError: {
    en: "Enter a valid 10-digit mobile number",
    hi: "एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें",
    kn: "ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    bn: "একটি বৈধ 10-অঙ্কের মোবাইল নম্বর লিখুন"
  },

  emailValidationError: {
    en: "Enter a valid email address",
    hi: "एक वैध ईमेल पता दर्ज करें",
    kn: "ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ",
    bn: "একটি বৈধ ইমেল ঠিকানা লিখুন"
  },

  registrationIdRequired: {
    en: "Registration ID is required",
    hi: "पंजीकरण आईडी आवश्यक है",
    kn: "ನೋಂದಣಿ ಐಡಿ ಅಗತ್ಯವಿದೆ",
    bn: "নিবন্ধন আইডি প্রয়োজন"
  },

  registrationIdValidationError: {
    en: "Registration ID should be alphanumeric and 10-20 characters long",
    hi: "पंजीकरण आईडी अल्फ़ान्यूमेरिक होनी चाहिए और 10-20 अक्षर लंबी होनी चाहिए",
    kn: "ನೋಂದಣಿ ಐಡಿ ಅಕ್ಷರಸಂಖ್ಯಾತ್ಮಕವಾಗಿರಬೇಕು ಮತ್ತು 10-20 ಅಕ್ಷರಗಳ ಉದ್ದವಿರಬೇಕು",
    bn: "নিবন্ধন আইডি অক্ষরসংখ্যাসূচক হতে হবে এবং ১০-২০ অক্ষর দীর্ঘ হতে হবে"
  },

  passwordValidationError: {
    en: "Password must contain at least 8 characters, including 1 letter, 1 number, and 1 special character",
    hi: "पासवर्ड में कम से कम 8 अक्षर होने चाहिए, जिसमें 1 अक्षर, 1 संख्या और 1 विशेष वर्ण शामिल हो",
    kn: "ಪಾಸ್ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳನ್ನು ಒಳಗೊಂಡಿರಬೇಕು, 1 ಅಕ್ಷರ, 1 ಸಂಖ್ಯೆ ಮತ್ತು 1 ವಿಶೇಷ ಅಕ್ಷರ ಸೇರಿದಂತೆ",
    bn: "পাসওয়ার্ডে কমপক্ষে ৮টি অক্ষর থাকতে হবে, যার মধ্যে ১টি অক্ষর, ১টি সংখ্যা এবং ১টি বিশেষ অক্ষর থাকতে হবে"
  },

  passwordMismatch: {
    en: "Passwords do not match",
    hi: "पासवर्ड मेल नहीं खाते",
    kn: "ಪಾಸ್ವರ್ಡ್ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
    bn: "পাসওয়ার্ড মেলে না"
  },

  fillRequiredFields: {
    en: "Please fill in all required fields",
    hi: "कृपया सभी आवश्यक फ़ील्ड भरें",
    kn: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
    bn: "অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন"
  },

  ensureValidFields: {
    en: "Please ensure all fields are valid and email/mobile are available",
    hi: "कृपया सुनिश्चित करें कि सभी फ़ील्ड मान्य हैं और ईमेल/मोबाइल उपलब्ध हैं",
    kn: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳು ಮಾನ್ಯವಾಗಿವೆ ಮತ್ತು ಇಮೇಲ್/ಮೊಬೈಲ್ ಲಭ್ಯವಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ",
    bn: "অনুগ্রহ করে নিশ্চিত করুন যে সমস্ত ক্ষেত্র বৈধ এবং ইমেল/মোবাইল উপলব্ধ"
  },

  vendorAdded: {
    en: "Vendor added successfully!",
    hi: "विक्रेता सफलतापूर्वक जोड़ा गया!",
    kn: "ಮಾರಾಟಗಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!",
    bn: "বিক্রেতা সফলভাবে যুক্ত করা হয়েছে!"
  },

  vendorAddFailed: {
    en: "Failed to add vendor.",
    hi: "विक्रेता जोड़ने में विफल।",
    kn: "ಮಾರಾಟಗಾರರನ್ನು ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ.",
    bn: "বিক্রেতা যোগ করতে ব্যর্থ হয়েছে।"
  },

  serverError: {
    en: "Server error occurred",
    hi: "सर्वर त्रुटि हुई",
    kn: "ಸರ್ವರ್ ದೋಷ ಸಂಭವಿಸಿದೆ",
    bn: "সার্ভার ত্রুটি ঘটেছে"
  },

  noServerResponse: {
    en: "No response from server. Please check your connection.",
    hi: "सर्वर से कोई प्रतिक्रिया नहीं। कृपया अपना कनेक्शन जांचें।",
    kn: "ಸರ್ವರ್‌ನಿಂದ ಪ್ರತಿಕ್ರಿಯೆ ಇಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.",
    bn: "সার্ভার থেকে কোন সাড়া নেই। আপনার সংযোগ পরীক্ষা করুন।"
  },

  apiConnectionError: {
    en: "An error occurred while connecting to the API.",
    hi: "एपीआई से कनेक्ट करते समय एक त्रुटि हुई।",
    kn: "API ಗೆ ಸಂಪರ್ಕಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ.",
    bn: "এপিআই-তে সংযোগ করার সময় একটি ত্রুটি ঘটেছে।"
  },

  registrationIdCopied: {
    en: "Registration ID copied to clipboard!",
    hi: "पंजीकरण आईडी क्लिपबोर्ड पर कॉपी की गई!",
    kn: "ನೋಂದಣಿ ಐಡಿಯನ್ನು ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ!",
    bn: "নিবন্ধন আইডি ক্লিপবোর্ডে কপি করা হয়েছে!"
  },

  mobileAlreadyRegistered: {
    en: "This mobile number is already registered",
    hi: "यह मोबाइल नंबर पहले से पंजीकृत है",
    kn: "ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ",
    bn: "এই মোবাইল নম্বরটি আগে থেকেই নিবন্ধিত"
  },

  emailAlreadyRegistered: {
    en: "This email is already registered",
    hi: "यह ईमेल पहले से पंजीकृत है",
    kn: "ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ",
    bn: "এই ইমেলটি আগে থেকেই নিবন্ধিত"
  },
  // ============ END AGENT REGISTRATION FORM TRANSLATIONS ============

  // ============ ADDRESS COMPONENT TRANSLATIONS ============
  permanentAddress: {
    en: "Permanent Address *",
    hi: "स्थायी पता *",
    kn: "ಶಾಶ್ವತ ವಿಳಾಸ *",
    bn: "স্থায়ী ঠিকানা *"
  },

  correspondenceAddress: {
    en: "Correspondence Address *",
    hi: "पत्राचार पता *",
    kn: "ಪತ್ರ ವ್ಯವಹಾರದ ವಿಳಾಸ *",
    bn: "পত্র correspondence ঠিকানা *"
  },

  apartmentLabel: {
    en: "Apartment/Flat Name or Number *",
    hi: "अपार्टमेंट/फ्लैट का नाम या नंबर *",
    kn: "ಅಪಾರ್ಟ್‌ಮೆಂಟ್/ಫ್ಲಾಟ್ ಹೆಸರು ಅಥವಾ ಸಂಖ್ಯೆ *",
    bn: "অ্যাপার্টমেন্ট/ফ্ল্যাটের নাম বা নম্বর *"
  },

  streetLabel: {
    en: "Street Name/Locality *",
    hi: "गली का नाम/इलाका *",
    kn: "ರಸ್ತೆ ಹೆಸರು/ಪ್ರದೇಶ *",
    bn: "রাস্তার নাম/এলাকা *"
  },

  cityLabel: {
    en: "City *",
    hi: "शहर *",
    kn: "ನಗರ *",
    bn: "শহর *"
  },

  countryLabel: {
    en: "Country *",
    hi: "देश *",
    kn: "ದೇಶ *",
    bn: "দেশ *"
  },

  stateLabel: {
    en: "State *",
    hi: "राज्य *",
    kn: "ರಾಜ್ಯ *",
    bn: "রাজ্য *"
  },

  pincodeLabel: {
    en: "Pincode *",
    hi: "पिनकोड *",
    kn: "ಪಿನ್‌ಕೋಡ್ *",
    bn: "পিনকোড *"
  },

  pincodeHelper: {
    en: "6-digit code",
    hi: "6-अंकीय कोड",
    kn: "6-ಅಂಕಿಯ ಕೋಡ್",
    bn: "৬-অঙ্কের কোড"
  },

  pincodeHelp: {
    en: "Enter your 6-digit postal code. For international addresses, enter ZIP code.",
    hi: "अपना 6-अंकीय पिनकोड दर्ज करें। अंतरराष्ट्रीय पतों के लिए, ZIP कोड दर्ज करें।",
    kn: "ನಿಮ್ಮ 6-ಅಂಕಿಯ ಅಂಚೆ ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ. ಅಂತರರಾಷ್ಟ್ರೀಯ ವಿಳಾಸಗಳಿಗಾಗಿ, ZIP ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ.",
    bn: "আপনার ৬-অঙ্কের পিনকোড লিখুন। আন্তর্জাতিক ঠিকানার জন্য, জিপ কোড লিখুন।"
  },

  useSameAddress: {
    en: "Use same address for correspondence",
    hi: "पत्राचार के लिए एक ही पते का उपयोग करें",
    kn: "ಪತ್ರ ವ್ಯವಹಾರಕ್ಕಾಗಿ ಅದೇ ವಿಳಾಸವನ್ನು ಬಳಸಿ",
    bn: "পত্র correspondence এর জন্য একই ঠিকানা ব্যবহার করুন"
  },

  addressSynced: {
    en: "Correspondence address is currently synced with permanent address",
    hi: "पत्राचार का पता वर्तमान में स्थायी पते के साथ समन्वयित है",
    kn: "ಪತ್ರ ವ್ಯವಹಾರದ ವಿಳಾಸವು ಪ್ರಸ್ತುತ ಶಾಶ್ವತ ವಿಳಾಸದೊಂದಿಗೆ ಸಿಂಕ್ ಆಗಿದೆ",
    bn: "পত্র correspondence ঠিকানা বর্তমানে স্থায়ী ঠিকানার সাথে সিঙ্ক হয়েছে"
  },

  correspondenceDescription: {
    en: "This is where we'll send your official documents and communications",
    hi: "यह वह जगह है जहां हम आपके आधिकारिक दस्तावेज और संचार भेजेंगे",
    kn: "ನಿಮ್ಮ ಅಧಿಕೃತ ದಾಖಲೆಗಳು ಮತ್ತು ಸಂವಹನಗಳನ್ನು ನಾವು ಇಲ್ಲಿಗೆ ಕಳುಹಿಸುತ್ತೇವೆ",
    bn: "এখানেই আমরা আপনার অফিসিয়াল নথি এবং যোগাযোগ পাঠাব"
  },

  selectCountryFirst: {
    en: "Select country first",
    hi: "पहले देश चुनें",
    kn: "ಮೊದಲು ದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    bn: "প্রথমে দেশ নির্বাচন করুন"
  },

  noStatesAvailable: {
    en: "No states available for this country",
    hi: "इस देश के लिए कोई राज्य उपलब्ध नहीं हैं",
    kn: "ಈ ದೇಶಕ್ಕೆ ಯಾವುದೇ ರಾಜ್ಯಗಳು ಲಭ್ಯವಿಲ್ಲ",
    bn: "এই দেশের জন্য কোন রাজ্য উপলব্ধ নেই"
  },

  addressNote: {
    en: "Note: Please ensure your address details are accurate as they will be used for verification and communication purposes.",
    hi: "नोट: कृपया सुनिश्चित करें कि आपके पते का विवरण सटीक है क्योंकि इसका उपयोग सत्यापन और संचार उद्देश्यों के लिए किया जाएगा।",
    kn: "ಸೂಚನೆ: ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿಳಾಸದ ವಿವರಗಳು ನಿಖರವಾಗಿವೆಯೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ ಏಕೆಂದರೆ ಅವುಗಳನ್ನು ಪರಿಶೀಲನೆ ಮತ್ತು ಸಂವಹನ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.",
    bn: "দ্রষ্টব্য: আপনার ঠিকানার বিবরণ সঠিক কিনা তা নিশ্চিত করুন কারণ এটি যাচাইকরণ এবং যোগাযোগের উদ্দেশ্যে ব্যবহার করা হবে।"
  },

  failedToLoadCountries: {
    en: "Failed to load countries. Using default list.",
    hi: "देश लोड करने में विफल। डिफ़ॉल्ट सूची का उपयोग कर रहे हैं।",
    kn: "ದೇಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ. ಡೀಫಾಲ್ಟ್ ಪಟ್ಟಿಯನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.",
    bn: "দেশ লোড করতে ব্যর্থ। ডিফল্ট তালিকা ব্যবহার করা হচ্ছে।"
  },
  // ============ END ADDRESS COMPONENT TRANSLATIONS ============

  // ============ BASIC INFORMATION TRANSLATIONS ============
  firstNamePlaceholder: {
    en: "First Name *",
    hi: "पहला नाम *",
    kn: "ಮೊದಲ ಹೆಸರು *",
    bn: "প্রথম নাম *"
  },

  middleNamePlaceholder: {
    en: "Middle Name",
    hi: "मध्य नाम",
    kn: "ಮಧ್ಯದ ಹೆಸರು",
    bn: "মধ্য নাম"
  },

  lastNamePlaceholder: {
    en: "Last Name *",
    hi: "अंतिम नाम *",
    kn: "ಕೊನೆಯ ಹೆಸರು *",
    bn: "শেষ নাম *"
  },

  dobLabel: {
    en: "Date of Birth *",
    hi: "जन्म तिथि *",
    kn: "ಜನ್ಮ ದಿನಾಂಕ *",
    bn: "জন্ম তারিখ *"
  },

  dobHelperText: {
    en: "You must be at least 18 years old",
    hi: "आपकी आयु कम से कम 18 वर्ष होनी चाहिए",
    kn: "ನಿಮ್ಮ ವಯಸ್ಸು ಕನಿಷ್ಠ 18 ವರ್ಷ ಇರಬೇಕು",
    bn: "আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে"
  },

  genderLabel: {
    en: "Gender *",
    hi: "लिंग *",
    kn: "ಲಿಂಗ *",
    bn: "লিঙ্গ *"
  },

  male: {
    en: "Male",
    hi: "पुरुष",
    kn: "ಪುರುಷ",
    bn: "পুরুষ"
  },

  female: {
    en: "Female",
    hi: "महिला",
    kn: "ಸ್ತ್ರೀ",
    bn: "মহিলা"
  },

  other: {
    en: "Other",
    hi: "अन्य",
    kn: "ಇತರೆ",
    bn: "অন্যান্য"
  },

  emailPlaceholder: {
    en: "Email *",
    hi: "ईमेल *",
    kn: "ಇಮೇಲ್ *",
    bn: "ইমেল *"
  },

  checkingAvailability: {
    en: "Checking availability...",
    hi: "उपलब्धता जांची जा रही है...",
    kn: "ಲಭ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    bn: "উপলব্ধতা পরীক্ষা করা হচ্ছে..."
  },

  emailAvailable: {
    en: "Email is available",
    hi: "ईमेल उपलब्ध है",
    kn: "ಇಮೇಲ್ ಲಭ್ಯವಿದೆ",
    bn: "ইমেলটি উপলব্ধ"
  },

  passwordPlaceholder: {
    en: "Password *",
    hi: "पासवर्ड *",
    kn: "ಪಾಸ್ವರ್ಡ್ *",
    bn: "পাসওয়ার্ড *"
  },

  confirmPasswordPlaceholder: {
    en: "Confirm Password *",
    hi: "पासवर्ड की पुष्टि करें *",
    kn: "ಪಾಸ್ವರ್ಡ್ ದೃಢೀಕರಿಸಿ *",
    bn: "পাসওয়ার্ড নিশ্চিত করুন *"
  },

  mobilePlaceholder: {
    en: "Mobile Number *",
    hi: "मोबाइल नंबर *",
    kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *",
    bn: "মোবাইল নম্বর *"
  },

  mobileAvailable: {
    en: "Mobile number is available",
    hi: "मोबाइल नंबर उपलब्ध है",
    kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಲಭ್ಯವಿದೆ",
    bn: "মোবাইল নম্বরটি উপলব্ধ"
  },

  alternatePlaceholder: {
    en: "Alternate Number",
    hi: "वैकल्पिक नंबर",
    kn: "ಪರ್ಯಾಯ ಸಂಖ್ಯೆ",
    bn: "বিকল্প নম্বর"
  },

  alternateAvailable: {
    en: "Alternate number is available",
    hi: "वैकल्पिक नंबर उपलब्ध है",
    kn: "ಪರ್ಯಾಯ ಸಂಖ್ಯೆ ಲಭ್ಯವಿದೆ",
    bn: "বিকল্প নম্বরটি উপলব্ধ"
  },
  // ============ END BASIC INFORMATION TRANSLATIONS ============

  // ============ CUSTOM FILE INPUT TRANSLATIONS ============
  chooseFile: {
    en: "Choose File",
    hi: "फ़ाइल चुनें",
    kn: "ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
    bn: "ফাইল নির্বাচন করুন"
  },

  selectedFile: {
    en: "Selected File:",
    hi: "चयनित फ़ाइल:",
    kn: "ಆಯ್ಕೆಮಾಡಿದ ಫೈಲ್:",
    bn: "নির্বাচিত ফাইল:"
  },

  removeFile: {
    en: "Remove file",
    hi: "फ़ाइल हटाएं",
    kn: "ಫೈಲ್ ತೆಗೆದುಹಾಕಿ",
    bn: "ফাইল সরান"
  },

  preview: {
    en: "Preview:",
    hi: "पूर्वावलोकन:",
    kn: "ಮುನ್ನೋಟ:",
    bn: "প্রিভিউ:"
  },

  changeFile: {
    en: "Change File",
    hi: "फ़ाइल बदलें",
    kn: "ಫೈಲ್ ಬದಲಾಯಿಸಿ",
    bn: "ফাইল পরিবর্তন করুন"
  },

  documentPreview: {
    en: "Document preview",
    hi: "दस्तावेज़ पूर्वावलोकन",
    kn: "ಡಾಕ್ಯುಮೆಂಟ್ ಮುನ್ನೋಟ",
    bn: "নথির প্রিভিউ"
  },
  // ============ END CUSTOM FILE INPUT TRANSLATIONS ============

  // ============ KYC VERIFICATION TRANSLATIONS ============
  selectKycDocumentType: {
    en: "Select KYC Document Type *",
    hi: "केवाईसी दस्तावेज़ प्रकार चुनें *",
    kn: "KYC ಡಾಕ್ಯುಮೆಂಟ್ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ *",
    bn: "কেওয়াইসি ডকুমেন্টের ধরন নির্বাচন করুন *"
  },

  aadhaarCard: {
    en: "Aadhaar Card",
    hi: "आधार कार्ड",
    kn: "ಆಧಾರ್ ಕಾರ್ಡ್",
    bn: "আধার কার্ড"
  },

  governmentIdProof: {
    en: "Government ID proof",
    hi: "सरकारी पहचान प्रमाण",
    kn: "ಸರ್ಕಾರಿ ಗುರುತಿನ ಚೀಟಿ",
    bn: "সরকারি পরিচয় প্রমাণ"
  },

  aadhaarNumberPlaceholder: {
    en: "Aadhaar Number *",
    hi: "आधार नंबर *",
    kn: "ಆಧಾರ್ ಸಂಖ್ಯೆ *",
    bn: "আধার নম্বর *"
  },

  aadhaarHelperText: {
    en: "Enter 12-digit Aadhaar number",
    hi: "12-अंकीय आधार नंबर दर्ज करें",
    kn: "12-ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    bn: "১২-অঙ্কের আধার নম্বর লিখুন"
  },

  panCard: {
    en: "PAN Card",
    hi: "पैन कार्ड",
    kn: "PAN ಕಾರ್ಡ್",
    bn: "প্যান কার্ড"
  },

  panDescription: {
    en: "Permanent Account Number",
    hi: "स्थायी खाता संख्या",
    kn: "ಶಾಶ್ವತ ಖಾತೆ ಸಂಖ್ಯೆ",
    bn: "স্থায়ী অ্যাকাউন্ট নম্বর"
  },

  panNumberPlaceholder: {
    en: "PAN Number *",
    hi: "पैन नंबर *",
    kn: "PAN ಸಂಖ್ಯೆ *",
    bn: "প্যান নম্বর *"
  },

  panHelperText: {
    en: "Enter 10-digit PAN (e.g., ABCDE1234F)",
    hi: "10-अंकीय पैन दर्ज करें (उदा., ABCDE1234F)",
    kn: "10-ಅಂಕಿಯ PAN ಅನ್ನು ನಮೂದಿಸಿ (ಉದಾ, ABCDE1234F)",
    bn: "১০-অঙ্কের প্যান লিখুন (যেমন, ABCDE1234F)"
  },

  drivingLicense: {
    en: "Driving License",
    hi: "ड्राइविंग लाइसेंस",
    kn: "ಚಾಲನಾ ಪರವಾನಗಿ",
    bn: "ড্রাইভিং লাইসেন্স"
  },

  drivingLicensePlaceholder: {
    en: "Driving License Number *",
    hi: "ड्राइविंग लाइसेंस नंबर *",
    kn: "ಚಾಲನಾ ಪರವಾನಗಿ ಸಂಖ್ಯೆ *",
    bn: "ড্রাইভিং লাইসেন্স নম্বর *"
  },

  drivingLicenseHelperText: {
    en: "Enter your driving license number",
    hi: "अपना ड्राइविंग लाइसेंस नंबर दर्ज करें",
    kn: "ನಿಮ್ಮ ಚಾಲನಾ ಪರವಾನಗಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    bn: "আপনার ড্রাইভিং লাইসেন্স নম্বর লিখুন"
  },

  voterId: {
    en: "Voter ID",
    hi: "वोटर आईडी",
    kn: "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ",
    bn: "ভোটার আইডি"
  },

  voterIdDescription: {
    en: "Voter Identification Card",
    hi: "मतदाता पहचान पत्र",
    kn: "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ",
    bn: "ভোটার শনাক্তকরণ কার্ড"
  },

  voterIdPlaceholder: {
    en: "Voter ID Number *",
    hi: "वोटर आईडी नंबर *",
    kn: "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ ಸಂಖ್ಯೆ *",
    bn: "ভোটার আইডি নম্বর *"
  },

  voterIdHelperText: {
    en: "Enter 10-digit Voter ID",
    hi: "10-अंकीय वोटर आईडी दर्ज करें",
    kn: "10-ಅಂಕಿಯ ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    bn: "১০-অঙ্কের ভোটার আইডি লিখুন"
  },

  passport: {
    en: "Passport",
    hi: "पासपोर्ट",
    kn: "ಪಾಸ್‌ಪೋರ್ಟ್",
    bn: "পাসপোর্ট"
  },

  passportPlaceholder: {
    en: "Passport Number *",
    hi: "पासपोर्ट नंबर *",
    kn: "ಪಾಸ್‌ಪೋರ್ಟ್ ಸಂಖ್ಯೆ *",
    bn: "পাসপোর্ট নম্বর *"
  },

  passportHelperText: {
    en: "Enter 8-character passport number",
    hi: "8-अक्षर का पासपोर्ट नंबर दर्ज करें",
    kn: "8-ಅಕ್ಷರದ ಪಾಸ್‌ಪೋರ್ಟ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    bn: "৮-অক্ষরের পাসপোর্ট নম্বর লিখুন"
  },

  uploadDocument: {
    en: "Upload {documentName} Document",
    hi: "{documentName} दस्तावेज़ अपलोड करें",
    kn: "{documentName} ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    bn: "{documentName} ডকুমেন্ট আপলোড করুন"
  },

  kycNote: {
    en: "Note: Please upload a clear image of your {documentName}. Accepted formats: JPG, PNG, PDF. Max size: 5MB.",
    hi: "नोट: कृपया अपने {documentName} की एक स्पष्ट छवि अपलोड करें। स्वीकृत प्रारूप: JPG, PNG, PDF। अधिकतम आकार: 5MB।",
    kn: "ಸೂಚನೆ: ದಯವಿಟ್ಟು ನಿಮ್ಮ {documentName} ನ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಸ್ವೀಕರಿಸಿದ ಸ್ವರೂಪಗಳು: JPG, PNG, PDF. ಗರಿಷ್ಠ ಗಾತ್ರ: 5MB.",
    bn: "দ্রষ্টব্য: আপনার {documentName} এর একটি পরিষ্কার ছবি আপলোড করুন। গৃহীত ফরম্যাট: JPG, PNG, PDF। সর্বোচ্চ আকার: ৫এমবি।"
  },
  // ============ END KYC VERIFICATION TRANSLATIONS ============


  // ============ PROFILE IMAGE UPLOAD TRANSLATIONS ============
  uploadProfilePicture: {
    en: "Upload Profile Picture",
    hi: "प्रोफ़ाइल चित्र अपलोड करें",
    kn: "ಪ್ರೊಫೈಲ್ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    bn: "প্রোফাইল ছবি আপলোড করুন"
  },

  confirm: {
    en: "Confirm",
    hi: "पुष्टि करें",
    kn: "ದೃಢೀಕರಿಸಿ",
    bn: "নিশ্চিত করুন"
  },
  // ============ END PROFILE IMAGE UPLOAD TRANSLATIONS ============

  // ============ SERVICE DETAILS TRANSLATIONS ============
  serviceDetails: {
    en: "Service Details",
    hi: "सेवा विवरण",
    kn: "ಸೇವಾ ವಿವರಗಳು",
    bn: "সেবার বিবরণ"
  },

  selectServiceType: {
    en: "Select Service Type(s)",
    hi: "सेवा प्रकार चुनें",
    kn: "ಸೇವಾ ಪ್ರಕಾರ(ಗಳನ್ನು) ಆಯ್ಕೆಮಾಡಿ",
    bn: "সেবার ধরন নির্বাচন করুন"
  },

  cook: {
    en: "Cook",
    hi: "रसोइया",
    kn: "ಅಡುಗೆಯವರು",
    bn: "রাঁধুনি"
  },

  nanny: {
    en: "Nanny",
    hi: "आया",
    kn: "ದಾದಿ",
    bn: "আয়া"
  },

  maid: {
    en: "Maid",
    hi: "नौकरानी",
    kn: "ಮನೆಕೆಲಸದವರು",
    bn: "গৃহকর্মী"
  },

  cookingSpeciality: {
    en: "Cooking Speciality",
    hi: "खाना पकाने की विशेषज्ञता",
    kn: "ಅಡುಗೆ ವಿಶೇಷತೆ",
    bn: "রান্নার বিশেষত্ব"
  },

  veg: {
    en: "Veg",
    hi: "शाकाहारी",
    kn: "ಸಸ್ಯಾಹಾರಿ",
    bn: "নিরামিষ"
  },

  nonVeg: {
    en: "Non-Veg",
    hi: "मांसाहारी",
    kn: "ಮಾಂಸಾಹಾರಿ",
    bn: "আমিষ"
  },

  both: {
    en: "Both",
    hi: "दोनों",
    kn: "ಎರಡೂ",
    bn: "উভয়"
  },

  careType: {
    en: "Care Type",
    hi: "देखभाल प्रकार",
    kn: "ಆರೈಕೆಯ ಪ್ರಕಾರ",
    bn: "যত্নের ধরন"
  },

  babyCare: {
    en: "Baby Care",
    hi: "शिशु देखभाल",
    kn: "ಶಿಶು ಆರೈಕೆ",
    bn: "শিশু যত্ন"
  },

  elderlyCare: {
    en: "Elderly Care",
    hi: "वृद्ध देखभाल",
    kn: "ಹಿರಿಯರ ಆರೈಕೆ",
    bn: "বয়স্ক যত্ন"
  },

  dietPreference: {
    en: "Diet Preference",
    hi: "आहार प्राथमिकता",
    kn: "ಆಹಾರದ ಆದ್ಯತೆ",
    bn: "খাদ্য পছন্দ"
  },

  serviceDescription: {
    en: "Description",
    hi: "विवरण",
    kn: "ವಿವರಣೆ",
    bn: "বর্ণনা"
  },

  experience: {
    en: "Experience *",
    hi: "अनुभव *",
    kn: "ಅನುಭವ *",
    bn: "অভিজ্ঞতা *"
  },

  experienceHelperText: {
    en: "Years in business or relevant experience",
    hi: "व्यवसाय में वर्ष या प्रासंगिक अनुभव",
    kn: "ವ್ಯವಹಾರದಲ್ಲಿ ಅಥವಾ ಸಂಬಂಧಿತ ಅನುಭವದ ವರ್ಷಗಳು",
    bn: "ব্যবসায় বছর বা প্রাসঙ্গিক অভিজ্ঞতা"
  },

  referralCode: {
    en: "Referral Code (Optional)",
    hi: "रेफरल कोड (वैकल्पिक)",
    kn: "ರೆಫರಲ್ ಕೋಡ್ (ಐಚ್ಛಿಕ)",
    bn: "রেফারেল কোড (ঐচ্ছিক)"
  },

  selectAvailableTimeSlots: {
    en: "Select Your Available Time Slots",
    hi: "अपने उपलब्ध समय स्लॉट चुनें",
    kn: "ನಿಮ್ಮ ಲಭ್ಯವಿರುವ ಸಮಯದ ಸ್ಲಾಟ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    bn: "আপনার উপলব্ধ সময় স্লট নির্বাচন করুন"
  },

  fullTimeAvailability: {
    en: "Full Time Availability",
    hi: "पूर्णकालिक उपलब्धता",
    kn: "ಪೂರ್ಣ ಸಮಯದ ಲಭ್ಯತೆ",
    bn: "পূর্ণকালীন উপলব্ধতা"
  },

  fullTimeDescription: {
    en: "6:00 AM - 8:00 PM (All slots covered)",
    hi: "सुबह 6:00 - रात 8:00 (सभी स्लॉट कवर)",
    kn: "ಬೆಳಿಗ್ಗೆ 6:00 - ರಾತ್ರಿ 8:00 (ಎಲ್ಲಾ ಸ್ಲಾಟ್‌ಗಳು ಆವರಿಸಲ್ಪಟ್ಟಿವೆ)",
    bn: "সকাল ৬:০০ - রাত ৮:০০ (সমস্ত স্লট কভার)"
  },

  morningAvailability: {
    en: "Morning Availability",
    hi: "सुबह की उपलब्धता",
    kn: "ಬೆಳಗಿನ ಲಭ್ಯತೆ",
    bn: "সকালের উপলব্ধতা"
  },

  notAvailable: {
    en: "Not Available",
    hi: "उपलब्ध नहीं",
    kn: "ಲಭ್ಯವಿಲ್ಲ",
    bn: "উপলব্ধ নয়"
  },

  slot: {
    en: "slot(s)",
    hi: "स्लॉट",
    kn: "ಸ್ಲಾಟ್(ಗಳು)",
    bn: "টি স্লট"
  },

  addSlot: {
    en: "Add Slot",
    hi: "स्लॉट जोड़ें",
    kn: "ಸ್ಲಾಟ್ ಸೇರಿಸಿ",
    bn: "স্লট যোগ করুন"
  },

  clearAll: {
    en: "Clear All",
    hi: "सभी हटाएं",
    kn: "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ",
    bn: "সব মুছুন"
  },

  notAvailableMorning: {
    en: "Not available in the morning",
    hi: "सुबह उपलब्ध नहीं",
    kn: "ಬೆಳಿಗ್ಗೆ ಲಭ್ಯವಿಲ್ಲ",
    bn: "সকালে উপলব্ধ নয়"
  },

  addMorningSlots: {
    en: "Add Morning Slots",
    hi: "सुबह के स्लॉट जोड़ें",
    kn: "ಬೆಳಗಿನ ಸ್ಲಾಟ್‌ಗಳನ್ನು ಸೇರಿಸಿ",
    bn: "সকালের স্লট যোগ করুন"
  },

  timeSlot: {
    en: "Time Slot",
    hi: "समय स्लॉट",
    kn: "ಸಮಯ ಸ್ಲಾಟ್",
    bn: "সময় স্লট"
  },

  selected: {
    en: "Selected:",
    hi: "चयनित:",
    kn: "ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ:",
    bn: "নির্বাচিত:"
  },

  warningGrayAreas: {
    en: "⚠️ Gray areas are already selected in other slots",
    hi: "⚠️ ग्रे क्षेत्र पहले से ही अन्य स्लॉट में चयनित हैं",
    kn: "⚠️ ಬೂದು ಪ್ರದೇಶಗಳು ಈಗಾಗಲೇ ಇತರ ಸ್ಲಾಟ್‌ಗಳಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲ್ಪಟ್ಟಿವೆ",
    bn: "⚠️ ধূসর এলাকাগুলি ইতিমধ্যে অন্যান্য স্লটে নির্বাচিত হয়েছে"
  },

  eveningAvailability: {
    en: "Evening Availability",
    hi: "शाम की उपलब्धता",
    kn: "ಸಂಜೆಯ ಲಭ್ಯತೆ",
    bn: "সন্ধ্যার উপলব্ধতা"
  },

  notAvailableEvening: {
    en: "Not available in the evening",
    hi: "शाम उपलब्ध नहीं",
    kn: "ಸಂಜೆ ಲಭ್ಯವಿಲ್ಲ",
    bn: "সন্ধ্যায় উপলব্ধ নয়"
  },

  addEveningSlots: {
    en: "Add Evening Slots",
    hi: "शाम के स्लॉट जोड़ें",
    kn: "ಸಂಜೆಯ ಸ್ಲಾಟ್‌ಗಳನ್ನು ಸೇರಿಸಿ",
    bn: "সন্ধ্যার স্লট যোগ করুন"
  },

  yourSelectedTimeSlots: {
    en: "Your Selected Time Slots:",
    hi: "आपके चयनित समय स्लॉट:",
    kn: "ನಿಮ್ಮ ಆಯ್ಕೆಮಾಡಿದ ಸಮಯದ ಸ್ಲಾಟ್‌ಗಳು:",
    bn: "আপনার নির্বাচিত সময় স্লট:"
  },
  // Add these to your translations object in LanguageContext.tsx

// Language selection section
languagesSpoken: {
  en: "Languages Spoken",
  hi: "बोली जाने वाली भाषाएं",
  kn: "ಮಾತನಾಡುವ ಭಾಷೆಗಳು",
  bn: "ভাষা জ্ঞান"
},

selectLanguagesYouSpeak: {
  en: "Select languages you speak",
  hi: "अपनी बोली जाने वाली भाषाएं चुनें",
  kn: "ನೀವು ಮಾತನಾಡುವ ಭಾಷೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  bn: "আপনার বলা ভাষাগুলি নির্বাচন করুন"
},

selectLanguagesHelper: {
  en: "You can select multiple languages or type your own",
  hi: "आप कई भाषाएं चुन सकते हैं या अपनी खुद की टाइप कर सकते हैं",
  kn: "ನೀವು ಬಹು ಭಾಷೆಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು ಅಥವಾ ನಿಮ್ಮದೇ ಆದದನ್ನು ಟೈಪ್ ಮಾಡಬಹುದು",
  bn: "আপনি একাধিক ভাষা নির্বাচন করতে পারেন অথবা নিজের টাইপ করতে পারেন"
},

selectedLanguagesCount: {
  en: "Selected Languages ({count}):",
  hi: "चयनित भाषाएं ({count}):",
  kn: "ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಗಳು ({count}):",
  bn: "নির্বাচিত ভাষা ({count}):"
},

// Agent Referral ID field
agentReferralId: {
  en: "Agent Referral ID (Optional)",
  hi: "एजेंट रेफरल आईडी (वैकल्पिक)",
  kn: "ಏಜೆಂಟ್ ರೆಫರಲ್ ಐಡಿ (ಐಚ್ಛಿಕ)",
  bn: "এজেন্ট রেফারেল আইডি (ঐচ্ছিক)"
},

agentReferralHelper: {
  en: "If you were referred by an agent, please enter their referral ID",
  hi: "यदि आपको किसी एजेंट द्वारा संदर्भित किया गया है, तो कृपया उनकी रेफरल आईडी दर्ज करें",
  kn: "ನಿಮ್ಮನ್ನು ಏಜೆಂಟ್ ಉಲ್ಲೇಖಿಸಿದ್ದರೆ, ದಯವಿಟ್ಟು ಅವರ ರೆಫರಲ್ ಐಡಿಯನ್ನು ನಮೂದಿಸಿ",
  bn: "যদি আপনাকে কোন এজেন্ট রেফার করে থাকে, অনুগ্রহ করে তাদের রেফারেল আইডি লিখুন"
},

// Additional language names for the dropdown (optional - for consistency)
assamese: {
  en: "Assamese",
  hi: "অসমীয়া",
  kn: "ಅಸ್ಸಾಮೀಸ್",
  bn: "অসমীয়া"
},
gujarati: {
  en: "Gujarati",
  hi: "ગુજરાતી",
  kn: "ಗುಜರಾತಿ",
  bn: "গুজরাটি"
},
kashmiri: {
  en: "Kashmiri",
  hi: "कश्मीरी",
  kn: "ಕಾಶ್ಮೀರಿ",
  bn: "কাশ্মীরি"
},
marathi: {
  en: "Marathi",
  hi: "मराठी",
  kn: "ಮರಾಠಿ",
  bn: "মারাঠি"
},
malayalam: {
  en: "Malayalam",
  hi: "മലയാളം",
  kn: "മലയാളം",
  bn: "মালয়ালম"
},
oriya: {
  en: "Oriya",
  hi: "ଓଡ଼ିଆ",
  kn: "ಒರಿಯಾ",
  bn: "ওড়িয়া"
},
punjabi: {
  en: "Punjabi",
  hi: "ਪੰਜਾਬੀ",
  kn: "ಪಂಜಾಬಿ",
  bn: "পাঞ্জাবি"
},
sanskrit: {
  en: "Sanskrit",
  hi: "संस्कृतम्",
  kn: "ಸಂಸ್ಕೃತ",
  bn: "সংস্কৃত"
},
tamil: {
  en: "Tamil",
  hi: "தமிழ்",
  kn: "தமிழ்",
  bn: "তামিল"
},
telugu: {
  en: "Telugu",
  hi: "తెలుగు",
  kn: "తెలుగు",
  bn: "তেলেগু"
},
urdu: {
  en: "Urdu",
  hi: "اردو",
  kn: "ಉರ್ದು",
  bn: "উর্দু"
},
sindhi: {
  en: "Sindhi",
  hi: "सिन्धी",
  kn: "ಸಿಂಧಿ",
  bn: "সিন্ধি"
},
konkani: {
  en: "Konkani",
  hi: "कोंकणी",
  kn: "ಕೊಂಕಣಿ",
  bn: "কোঙ্কণী"
},
nepali: {
  en: "Nepali",
  hi: "नेपाली",
  kn: "ನೇಪಾಳಿ",
  bn: "নেপালি"
},
manipuri: {
  en: "Manipuri",
  hi: "মণিপুরী",
  kn: "ಮಣಿಪುರಿ",
  bn: "মণিপুরী"
},
bodo: {
  en: "Bodo",
  hi: "बोडो",
  kn: "ಬೋಡೋ",
  bn: "বোড়ো"
},
dogri: {
  en: "Dogri",
  hi: "डोगरी",
  kn: "ಡೋಗ್ರಿ",
  bn: "ডোগরি"
},
maithili: {
  en: "Maithili",
  hi: "मैथिली",
  kn: "ಮೈಥಿಲಿ",
  bn: "মৈথিলী"
},
santhali: {
  en: "Santhali",
  hi: "संथाली",
  kn: "ಸಂತಾಲಿ",
  bn: "সাঁওতালি"
},
  // ============ END SERVICE DETAILS TRANSLATIONS ============

  // ============ SERVICE PROVIDER REGISTRATION TRANSLATIONS ============
  basicInformation: {
    en: "Basic Information",
    hi: "मूल जानकारी",
    kn: "ಮೂಲ ಮಾಹಿತಿ",
    bn: "মৌলিক তথ্য"
  },

  addressInformation: {
    en: "Address Information",
    hi: "पता जानकारी",
    kn: "ವಿಳಾಸ ಮಾಹಿತಿ",
    bn: "ঠিকানা তথ্য"
  },

  additionalDetails: {
    en: "Additional Details",
    hi: "अतिरिक्त विवरण",
    kn: "ಹೆಚ್ಚುವರಿ ವಿವರಗಳು",
    bn: "অতিরিক্ত বিবরণ"
  },

  kycVerification: {
    en: "KYC Verification",
    hi: "केवाईसी सत्यापन",
    kn: "KYC ಪರಿಶೀಲನೆ",
    bn: "কেওয়াইসি যাচাইকরণ"
  },

  confirmation: {
    en: "Confirmation",
    hi: "पुष्टि",
    kn: "ದೃಢೀಕರಣ",
    bn: "নিশ্চিতকরণ"
  },
  timeRangeOverlaps: {
    en: "This time range overlaps with another selected slot",
    hi: "यह समय सीमा किसी अन्य चयनित स्लॉट के साथ ओवरलैप होती है",
    kn: "ಈ ಸಮಯದ ವ್ಯಾಪ್ತಿಯು ಮತ್ತೊಂದು ಆಯ್ಕೆಮಾಡಿದ ಸ್ಲಾಟ್‌ನೊಂದಿಗೆ ಅತಿಕ್ರಮಿಸುತ್ತದೆ",
    bn: "এই সময়সীমা অন্য নির্বাচিত স্লটের সাথে ওভারল্যাপ করে"
  },

  alreadySelected: {
    en: "Already selected",
    hi: "पहले से चयनित",
    kn: "ಈಗಾಗಲೇ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ",
    bn: "ইতিমধ্যে নির্বাচিত"
  },
  next: {
    en: "Next",
    hi: "अगला",
    kn: "ಮುಂದೆ",
    bn: "পরবর্তী"
  },

  currentLocation: {
    en: "Current Location",
    hi: "वर्तमान स्थान",
    kn: "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    bn: "বর্তমান অবস্থান"
  },

  useGpsToFetchLocation: {
    en: "Use GPS to automatically fetch your current location coordinates",
    hi: "अपने वर्तमान स्थान निर्देशांक स्वचालित रूप से प्राप्त करने के लिए GPS का उपयोग करें",
    kn: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳದ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪಡೆಯಲು GPS ಬಳಸಿ",
    bn: "আপনার বর্তমান অবস্থানের স্থানাঙ্ক স্বয়ংক্রিয়ভাবে পেতে GPS ব্যবহার করুন"
  },

  fetchMyLocation: {
    en: "Fetch My Location (GPS)",
    hi: "मेरा स्थान प्राप्त करें (GPS)",
    kn: "ನನ್ನ ಸ್ಥಳವನ್ನು ಪಡೆದುಕೊಳ್ಳಿ (GPS)",
    bn: "আমার অবস্থান পান (GPS)"
  },

  addressDetected: {
    en: "Address detected:",
    hi: "पता मिला:",
    kn: "ವಿಳಾಸ ಪತ್ತೆಯಾಗಿದೆ:",
    bn: "ঠিকানা সনাক্ত করা হয়েছে:"
  },

  pleaseAgreeToFollowing: {
    en: "Please agree to the following before proceeding with your Registration:",
    hi: "कृपया अपना पंजीकरण जारी रखने से पहले निम्नलिखित से सहमत हों:",
    kn: "ನಿಮ್ಮ ನೋಂದಣಿಯೊಂದಿಗೆ ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನವುಗಳಿಗೆ ಒಪ್ಪಿಕೊಳ್ಳಿ:",
    bn: "আপনার নিবন্ধন চালিয়ে যাওয়ার আগে অনুগ্রহ করে নিম্নলিখিতগুলিতে সম্মত হন:"
  },

  validatingEmailMobile: {
    en: "Validating email/mobile, please wait...",
    hi: "ईमेल/मोबाइल सत्यापित किया जा रहा है, कृपया प्रतीक्षा करें...",
    kn: "ಇಮೇಲ್/ಮೊಬೈಲ್ ಅನ್ನು ಮೌಲ್ಯೀಕರಿಸಲಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...",
    bn: "ইমেল/মোবাইল যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন..."
  },

  fixValidationErrors: {
    en: "Please fix all validation errors including Date of Birth (must be 18+ years)",
    hi: "कृपया सभी सत्यापन त्रुटियों को ठीक करें, जिसमें जन्म तिथि भी शामिल है (18+ वर्ष होना चाहिए)",
    kn: "ದಯವಿಟ್ಟು ಜನ್ಮ ದಿನಾಂಕ ಸೇರಿದಂತೆ ಎಲ್ಲಾ ಮೌಲ್ಯೀಕರಣ ದೋಷಗಳನ್ನು ಸರಿಪಡಿಸಿ (ವಯಸ್ಸು 18+ ವರ್ಷ ಇರಬೇಕು)",
    bn: "অনুগ্রহ করে সমস্ত যাচাইকরণ ত্রুটি ঠিক করুন, যার মধ্যে জন্ম তারিখ অন্তর্ভুক্ত (বয়স ১৮+ হতে হবে)"
  },

  completeAllRequiredFields: {
    en: "Please complete all required fields including Date of Birth",
    hi: "कृपया जन्म तिथि सहित सभी आवश्यक फ़ील्ड भरें",
    kn: "ದಯವಿಟ್ಟು ಜನ್ಮ ದಿನಾಂಕ ಸೇರಿದಂತೆ ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
    bn: "অনুগ্রহ করে জন্ম তারিখ সহ সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন"
  },

  pleaseSelectServiceType: {
    en: "Please select at least one service type",
    hi: "कृपया कम से कम एक सेवा प्रकार चुनें",
    kn: "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಸೇವಾ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    bn: "অনুগ্রহ করে কমপক্ষে একটি সেবার ধরন নির্বাচন করুন"
  },

  pleaseCompleteKyc: {
    en: "Please complete KYC verification",
    hi: "कृपया केवाईसी सत्यापन पूरा करें",
    kn: "ದಯವಿಟ್ಟು KYC ಪರಿಶೀಲನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
    bn: "অনুগ্রহ করে কেওয়াইসি যাচাইকরণ সম্পূর্ণ করুন"
  },

  pleaseWaitForValidation: {
    en: "Please wait for email/mobile validation to complete.",
    hi: "कृपया ईमेल/मोबाइल सत्यापन पूरा होने की प्रतीक्षा करें।",
    kn: "ದಯವಿಟ್ಟು ಇಮೇಲ್/ಮೊಬೈಲ್ ಮೌಲ್ಯೀಕರಣ ಪೂರ್ಣಗೊಳ್ಳಲು ನಿರೀಕ್ಷಿಸಿ.",
    bn: "অনুগ্রহ করে ইমেল/মোবাইল যাচাইকরণ সম্পূর্ণ হওয়ার জন্য অপেক্ষা করুন।"
  },

  pleaseFixValidationErrors: {
    en: "Please fix all validation errors before proceeding.",
    hi: "कृपया आगे बढ़ने से पहले सभी सत्यापन त्रुटियों को ठीक करें।",
    kn: "ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಮೌಲ್ಯೀಕರಣ ದೋಷಗಳನ್ನು ಸರಿಪಡಿಸಿ.",
    bn: "এগিয়ে যাওয়ার আগে অনুগ্রহ করে সমস্ত যাচাইকরণ ত্রুটি ঠিক করুন।"
  },

  registrationSuccessful: {
    en: "Registration Successful!",
    hi: "पंजीकरण सफल!",
    kn: "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ!",
    bn: "নিবন্ধন সফল হয়েছে!"
  },

  serviceProviderAdded: {
    en: "Service provider added successfully!",
    hi: "सेवा प्रदाता सफलतापूर्वक जोड़ा गया!",
    kn: "ಸೇವಾ ಒದಗಿಸುವವರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!",
    bn: "সেবা প্রদানকারী সফলভাবে যুক্ত করা হয়েছে!"
  },

  failedToAddServiceProvider: {
    en: "Failed to add service provider. Please try again.",
    hi: "सेवा प्रदाता जोड़ने में विफल। कृपया पुनः प्रयास करें।",
    kn: "ಸೇವಾ ಒದಗಿಸುವವರನ್ನು ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    bn: "সেবা প্রদানকারী যোগ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
  },

  locationFetchedSuccessfully: {
    en: "Location fetched successfully!",
    hi: "स्थान सफलतापूर्वक प्राप्त हुआ!",
    kn: "ಸ್ಥಳವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪಡೆಯಲಾಗಿದೆ!",
    bn: "অবস্থান সফলভাবে পাওয়া গেছে!"
  },

  failedToFetchLocation: {
    en: "Failed to fetch location data. Please try again.",
    hi: "स्थान डेटा प्राप्त करने में विफल। कृपया पुनः प्रयास करें।",
    kn: "ಸ್ಥಳದ ಡೇಟಾವನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    bn: "অবস্থান ডেটা পাওয়া ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
  },

  geolocationFailed: {
    en: "Geolocation failed. Please check your browser permissions.",
    hi: "जियोलोकेशन विफल। कृपया अपनी ब्राउज़र अनुमतियाँ जांचें।",
    kn: "ಜಿಯೋಲೊಕೇಷನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    bn: "জিওলোকেশন ব্যর্থ হয়েছে। আপনার ব্রাউজার অনুমতি পরীক্ষা করুন।"
  },

  geolocationNotSupported: {
    en: "Geolocation is not supported by your browser.",
    hi: "जियोलोकेशन आपके ब्राउज़र द्वारा समर्थित नहीं है।",
    kn: "ಜಿಯೋಲೊಕೇಷನ್ ಅನ್ನು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
    bn: "আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না।"
  },

  checkTermsToEnableSubmit: {
    en: "Check terms and conditions to enable Submit",
    hi: "सबमिट सक्षम करने के लिए नियम और शर्तें देखें",
    kn: "ಸಲ್ಲಿಸು ಸಕ್ರಿಯಗೊಳಿಸಲು ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    bn: "জমা সক্ষম করতে শর্তাবলী চেক করুন"
  },
  // ============ END SERVICE PROVIDER REGISTRATION TRANSLATIONS ============

  // ============ FIELD VALIDATION TRANSLATIONS ============
  invalidEmailFormat: {
    en: "Invalid email format",
    hi: "अमान्य ईमेल प्रारूप",
    kn: "ಅಮಾನ್ಯ ಇಮೇಲ್ ಸ್ವರೂಪ",
    bn: "অবৈধ ইমেল ফরম্যাট"
  },

  invalidMobileFormat: {
    en: "Invalid mobile number format",
    hi: "अमान्य मोबाइल नंबर प्रारूप",
    kn: "ಅಮಾನ್ಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಸ್ವರೂಪ",
    bn: "অবৈধ মোবাইল নম্বর ফরম্যাট"
  },

  errorCheckingEmail: {
    en: "Error checking email",
    hi: "ईमेल जांचने में त्रुटि",
    kn: "ಇಮೇಲ್ ಪರಿಶೀಲಿಸುವಲ್ಲಿ ದೋಷ",
    bn: "ইমেল পরীক্ষা করতে ত্রুটি"
  },

  errorCheckingMobile: {
    en: "Error checking mobile number",
    hi: "मोबाइल नंबर जांचने में त्रुटि",
    kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸುವಲ್ಲಿ ದೋಷ",
    bn: "মোবাইল নম্বর পরীক্ষা করতে ত্রুটি"
  },
  // ============ END FIELD VALIDATION TRANSLATIONS ============

  // ============ BATHROOM CLEANING TRANSLATIONS ============
  type: {
    en: "Type:",
    hi: "प्रकार:",
    kn: "ಪ್ರಕಾರ:",
    bn: "ধরন:"
  },

  noOfWashrooms: {
    en: "No. of Washrooms:",
    hi: "बाथरूम की संख्या:",
    kn: "ಸ್ನಾನಗೃಹಗಳ ಸಂಖ್ಯೆ:",
    bn: "বাথরুমের সংখ্যা:"
  },

  frequency: {
    en: "Frequency:",
    hi: "आवृत्ति:",
    kn: "ಆವರ್ತನ:",
    bn: "ফ্রিকোয়েন্সি:"
  },

  pricePerMonth: {
    en: "Price: ₹{price}/month",
    hi: "मूल्य: ₹{price}/महीना",
    kn: "ಬೆಲೆ: ₹{price}/ತಿಂಗಳು",
    bn: "মূল্য: ₹{price}/মাস"
  },

  jobDescription: {
    en: "Job Description: {description}",
    hi: "कार्य विवरण: {description}",
    kn: "ಕೆಲಸದ ವಿವರಣೆ: {description}",
    bn: "কাজের বিবরণ: {description}"
  },

  normalCleaning: {
    en: "Normal cleaning",
    hi: "सामान्य सफाई",
    kn: "ಸಾಮಾನ್ಯ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "সাধারণ পরিষ্কার"
  },

  deepCleaning: {
    en: "Deep cleaning",
    hi: "गहरी सफाई",
    kn: "ಆಳವಾದ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "গভীর পরিষ্কার"
  },

  dayWeek: {
    en: "{days} day / week",
    hi: "{days} दिन / सप्ताह",
    kn: "{days} ದಿನ / ವಾರ",
    bn: "{days} দিন / সপ্তাহ"
  },

  daily: {
    en: "Daily",
    hi: "दैनिक",
    kn: "ದೈನಂದಿನ",
    bn: "দৈনিক"
  },

  weeklyCleaningBathroom: {
    en: "Weekly cleaning of bathroom",
    hi: "बाथरूम की साप्ताहिक सफाई",
    kn: "ಸ್ನಾನಗೃಹದ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "সাপ্তাহিক বাথরুম পরিষ্কার"
  },

  twoDaysWeekCleaningBathroom: {
    en: "2 days in a week cleaning of bathroom",
    hi: "सप्ताह में 2 दिन बाथरूम की सफाई",
    kn: "ವಾರದಲ್ಲಿ 2 ದಿನ ಸ್ನಾನಗೃಹ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "সপ্তাহে ২ দিন বাথরুম পরিষ্কার"
  },

  twoBathroomsWeeklyCleaning: {
    en: "2 bathrooms of weekly cleaning",
    hi: "2 बाथरूम की साप्ताहिक सफाई",
    kn: "2 ಸ್ನಾನಗೃಹಗಳ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "২টি বাথরুমের সাপ্তাহিক পরিষ্কার"
  },

  premiumCleaningBathroomWeekly: {
    en: "Premium cleaning of bathroom weekly",
    hi: "बाथरूम की प्रीमियम साप्ताहिक सफाई",
    kn: "ಸ್ನಾನಗೃಹದ ಪ್ರೀಮಿಯಂ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "প্রিমিয়াম সাপ্তাহিক বাথরুম পরিষ্কার"
  },

  premiumCleaningBathroomTwoDays: {
    en: "Premium cleaning of bathroom 2 days/week",
    hi: "बाथरूम की प्रीमियम सफाई 2 दिन/सप्ताह",
    kn: "ಸ್ನಾನಗೃಹದ ಪ್ರೀಮಿಯಂ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ 2 ದಿನ/ವಾರ",
    bn: "প্রিমিয়াম বাথরুম পরিষ্কার সপ্তাহে ২ দিন"
  },

  twoBathroomsPremiumWeekly: {
    en: "2 bathrooms premium weekly cleaning",
    hi: "2 बाथरूम की प्रीमियम साप्ताहिक सफाई",
    kn: "2 ಸ್ನಾನಗೃಹಗಳ ಪ್ರೀಮಿಯಂ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "২টি বাথরুমের প্রিমিয়াম সাপ্তাহিক পরিষ্কার"
  },

  deepCleaningDescription: {
    en: "Weekly cleaning of bathroom + All bathroom walls cleaning",
    hi: "बाथरूम की साप्ताहिक सफाई + सभी बाथरूम की दीवारों की सफाई",
    kn: "ಸ್ನಾನಗೃಹದ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ + ಎಲ್ಲಾ ಸ್ನಾನಗೃಹದ ಗೋಡೆಗಳ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "সাপ্তাহিক বাথরুম পরিষ্কার + সমস্ত বাথরুমের দেয়াল পরিষ্কার"
  },
  // ============ END BATHROOM CLEANING TRANSLATIONS ============



  // ============ CLOTH DRYING TRANSLATIONS ============

  threeDaysWeek: {
    en: "3 days / week",
    hi: "3 दिन / सप्ताह",
    kn: "3 ದಿನ / ವಾರ",
    bn: "৩ দিন / সপ্তাহ"
  },

  clothDryingJobDescription: {
    en: "Househelp will get clothes from drying place and make proper arrangements in shelf",
    hi: "घरेलू सहायक कपड़े सुखाने की जगह से लाएगा और शेल्फ में उचित व्यवस्था करेगा",
    kn: "ಮನೆ ಸಹಾಯಕರು ಬಟ್ಟೆಗಳನ್ನು ಒಣಗಿಸುವ ಸ್ಥಳದಿಂದ ತಂದು ಕಪಾಟಿನಲ್ಲಿ ಸರಿಯಾಗಿ ಜೋಡಿಸುತ್ತಾರೆ",
    bn: "গৃহকর্মী কাপড় শুকানোর জায়গা থেকে নিয়ে এসে তাকে সঠিকভাবে তাকে সাজিয়ে রাখবেন"
  },
  noDescriptionAvailable: {
    en: "No description available",
    hi: "कोई विवरण उपलब्ध नहीं",
    kn: "ಯಾವುದೇ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ",
    bn: "কোন বিবরণ উপলব্ধ নেই"
  },
  // ============ END CLOTH DRYING TRANSLATIONS ============

  // ============ DUSTING TRANSLATIONS ============
  dustingType: {
    en: "Dusting type:",
    hi: "धूल झाड़ने का प्रकार:",
    kn: "ಧೂಳು ಒರೆಸುವ ಪ್ರಕಾರ:",
    bn: "ধুলো মুছার ধরন:"
  },

  roomType: {
    en: "Room type:",
    hi: "कमरे का प्रकार:",
    kn: "ಕೋಣೆಯ ಪ್ರಕಾರ:",
    bn: "রুমের ধরন:"
  },

  normal: {
    en: "Normal",
    hi: "सामान्य",
    kn: "ಸಾಮಾನ್ಯ",
    bn: "সাধারণ"
  },

  deep: {
    en: "Deep",
    hi: "गहरा",
    kn: "ಆಳವಾದ",
    bn: "গভীর"
  },

  twoBHK: {
    en: "2 BHK",
    hi: "2 बीएचके",
    kn: "2 BHK",
    bn: "২ বিএইচকে"
  },

  twoHalfBHK: {
    en: "2.5 - 3 BHK",
    hi: "2.5 - 3 बीएचके",
    kn: "2.5 - 3 BHK",
    bn: "২.৫ - ৩ বিএইচকে"
  },

  normalDustingDescription: {
    en: "Includes furniture dusting, gate, decor items, carpet, bed making. Weekly: windows, glasses, cupboards, kitchen cabinet outer cleaning. Monthly: fan and cobweb cleaning.",
    hi: "फर्नीचर की धूल झाड़ना, गेट, सजावटी वस्तुएं, कालीन, बिस्तर बनाना शामिल है। साप्ताहिक: खिड़कियां, कांच, अलमारियाँ, किचन कैबिनेट की बाहरी सफाई। मासिक: पंखा और मकड़ी के जाले की सफाई।",
    kn: "ಫರ್ನಿಚರ್ ಧೂಳು ಒರೆಸುವುದು, ಗೇಟ್, ಅಲಂಕಾರಿಕ ವಸ್ತುಗಳು, ಕಾರ್ಪೆಟ್, ಹಾಸಿಗೆ ಮಾಡುವುದು ಸೇರಿವೆ. ಸಾಪ್ತಾಹಿಕ: ಕಿಟಕಿಗಳು, ಗಾಜುಗಳು, ಅಲಮಾರುಗಳು, ಅಡುಗೆಮನೆ ಕ್ಯಾಬಿನೆಟ್ ಹೊರಗಿನ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ. ಮಾಸಿಕ: ಫ್ಯಾನ್ ಮತ್ತು ಜೇಡರ ಬಲೆ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ.",
    bn: "আসবাবপত্রে ধুলো মুছা, গেট, সাজসজ্জার জিনিস, কার্পেট, বিছানা তৈরি অন্তর্ভুক্ত। সাপ্তাহিক: জানালা, কাচ, আলমারি, রান্নাঘরের ক্যাবিনেটের বাইরের পরিষ্কার। মাসিক: পাখা এবং মাকড়সার জাল পরিষ্কার।"
  },

  deepDustingDescription: {
    en: "Normal Dusting + kitchen slab cleaning.",
    hi: "सामान्य धूल झाड़ना + किचन स्लैब की सफाई।",
    kn: "ಸಾಮಾನ್ಯ ಧೂಳು ಒರೆಸುವುದು + ಅಡುಗೆಮನೆಯ ಸ್ಲ್ಯಾಬ್ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ.",
    bn: "সাধারণ ধুলো মুছা + রান্নাঘরের স্ল্যাব পরিষ্কার।"
  },
  // ============ END DUSTING TRANSLATIONS ============

  // ============ MAID SERVICES TRANSLATIONS ============
  regular: {
    en: "Regular",
    hi: "नियमित",
    kn: "ನಿಯಮಿತ",
    bn: "নিয়মিত"
  },

  premium: {
    en: "Premium",
    hi: "प्रीमियम",
    kn: "ಪ್ರೀಮಿಯಂ",
    bn: "প্রিমিয়াম"
  },

  selectedPrice: {
    en: "Selected Price",
    hi: "चयनित मूल्य",
    kn: "ಆಯ್ಕೆಮಾಡಿದ ಬೆಲೆ",
    bn: "নির্বাচিত মূল্য"
  },

  proceedToCheckout: {
    en: "Proceed to Checkout",
    hi: "चेकआउट के लिए आगे बढ़ें",
    kn: "ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ",
    bn: "চেকআউটে যান"
  },

  itemAddedToCart: {
    en: "Item added to cart successfully!",
    hi: "आइटम कार्ट में सफलतापूर्वक जोड़ा गया!",
    kn: "ಐಟಂ ಅನ್ನು ಕಾರ್ಟ್‌ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!",
    bn: "আইটেম সফলভাবে কার্টে যুক্ত করা হয়েছে!"
  },

  people: {
    en: "People",
    hi: "लोग",
    kn: "ಜನರು",
    bn: "লোক"
  },

  rooms: {
    en: "Rooms",
    hi: "कमरे",
    kn: "ಕೊಠಡಿಗಳು",
    bn: "রুম"
  },

  number: {
    en: "Number",
    hi: "संख्या",
    kn: "ಸಂಖ್ಯೆ",
    bn: "সংখ্যা"
  },
  // ============ END MAID SERVICES TRANSLATIONS ============
  // ============ COOK SERVICES DIALOG TRANSLATIONS ============
  persons: {
    en: "Persons:",
    hi: "व्यक्ति:",
    kn: "ವ್ಯಕ್ತಿಗಳು:",
    bn: "ব্যক্তি:"
  },

  additionalChargesApplied: {
    en: "*Additional charges applied",
    hi: "*अतिरिक्त शुल्क लागू",
    kn: "*ಹೆಚ್ಚುವರಿ ಶುಲ್ಕಗಳು ಅನ್ವಯಿಸುತ್ತವೆ",
    bn: "*অতিরিক্ত চার্জ প্রযোজ্য"
  },

  addToCart: {
    en: "ADD TO CART",
    hi: "कार्ट में जोड़ें",
    kn: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    bn: "কার্টে যোগ করুন"
  },

  addedToCart: {
    en: "ADDED TO CART",
    hi: "कार्ट में जोड़ा गया",
    kn: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ",
    bn: "কার্টে যুক্ত করা হয়েছে"
  },

  applyVoucher: {
    en: "Apply Voucher",
    hi: "वाउचर लागू करें",
    kn: "ವೋಚರ್ ಅನ್ವಯಿಸಿ",
    bn: "ভাউচার প্রয়োগ করুন"
  },

  enterVoucherCode: {
    en: "Enter voucher code",
    hi: "वाउचर कोड दर्ज करें",
    kn: "ವೋಚರ್ ಕೋಡ್ ನಮೂದಿಸಿ",
    bn: "ভাউচার কোড লিখুন"
  },

  apply: {
    en: "APPLY",
    hi: "लागू करें",
    kn: "ಅನ್ವಯಿಸಿ",
    bn: "প্রয়োগ করুন"
  },

  totalForItems: {
    en: "Total for {count} item{plural} ({persons} person{personPlural})",
    hi: "कुल {count} आइटम{plural} ({persons} व्यक्ति{personPlural}) के लिए",
    kn: "ಒಟ್ಟು {count} ಐಟಂ{plural} ({persons} ವ್ಯಕ್ತಿ{personPlural})",
    bn: "মোট {count}টি আইটেম{plural} ({persons} জন{personPlural}) এর জন্য"
  },

  loginToContinue: {
    en: "LOGIN TO CONTINUE",
    hi: "जारी रखने के लिए लॉगिन करें",
    kn: "ಮುಂದುವರಿಯಲು ಲಾಗಿನ್ ಮಾಡಿ",
    bn: "চালিয়ে যেতে লগইন করুন"
  },

  checkout: {
    en: "CHECKOUT",
    hi: "चेकआउट",
    kn: "ಚೆಕ್‌ಔಟ್",
    bn: "চেকআউট"
  },

  youNeedToLogin: {
    en: "You need to login to proceed with checkout",
    hi: "चेकआउट के लिए आगे बढ़ने के लिए आपको लॉगिन करना होगा",
    kn: "ಚೆಕ್‌ಔಟ್‌ನೊಂದಿಗೆ ಮುಂದುವರಿಯಲು ನೀವು ಲಾಗಿನ್ ಆಗಬೇಕಾಗುತ್ತದೆ",
    bn: "চেকআউটে যেতে আপনাকে লগইন করতে হবে"
  },

  minutesPreparation: {
    en: "{minutes} mins preparation",
    hi: "{minutes} मिनट तैयारी",
    kn: "{minutes} ನಿಮಿಷಗಳ ತಯಾರಿ",
    bn: "{minutes} মিনিট প্রস্তুতি"
  },

  hoursPreparation: {
    en: "{hours} hrs preparation",
    hi: "{hours} घंटे तैयारी",
    kn: "{hours} ಗಂಟೆಗಳ ತಯಾರಿ",
    bn: "{hours} ঘন্টা প্রস্তুতি"
  },

  reviews: {
    en: "({count} reviews)",
    hi: "({count} समीक्षाएँ)",
    kn: "({count} ವಿಮರ್ಶೆಗಳು)",
    bn: "({count}টি পর্যালোচনা)"
  },
  // ============ END COOK SERVICES DIALOG TRANSLATIONS ============

  // ============ MAID SERVICE DIALOG TRANSLATIONS ============
  maidService: {
    en: "🧹 Maid Service",
    hi: "🧹 सफाई सेवा",
    kn: "🧹 ಮನೆಕೆಲಸದವರ ಸೇವೆ",
    bn: "🧹 পরিচ্ছন্নতা সেবা"
  },

  utensilCleaning: {
    en: "Utensil Cleaning",
    hi: "बर्तन सफाई",
    kn: "ಪಾತ್ರೆ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "বাসন পরিষ্কার"
  },

  sweepingMopping: {
    en: "Sweeping & Mopping",
    hi: "झाड़ू और पोछा",
    kn: "ಗುಡಿಸುವುದು ಮತ್ತು ಒರೆಸುವುದು",
    bn: "ঝাড়ু দেওয়া ও মুছা"
  },

  bathroomCleaning: {
    en: "Bathroom Cleaning",
    hi: "बाथरूम सफाई",
    kn: "ಸ್ನಾನಗೃಹ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "বাথরুম পরিষ্কার"
  },

  utensilCleaningDesc1: {
    en: "All kind of daily utensil cleaning",
    hi: "सभी प्रकार के दैनिक बर्तन सफाई",
    kn: "ಎಲ್ಲಾ ರೀತಿಯ ದೈನಂದಿನ ಪಾತ್ರೆ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "সব ধরনের দৈনিক বাসন পরিষ্কার"
  },

  utensilCleaningDesc2: {
    en: "Party used type utensil cleaning",
    hi: "पार्टी में उपयोग किए गए बर्तनों की सफाई",
    kn: "ಪಾರ್ಟಿಯಲ್ಲಿ ಬಳಸಿದ ಪಾತ್ರೆ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "পার্টিতে ব্যবহৃত বাসন পরিষ্কার"
  },

  sweepingMoppingDesc: {
    en: "Daily sweeping and mopping of 2 rooms, 1 Hall",
    hi: "2 कमरों, 1 हॉल की दैनिक झाड़ू और पोछा",
    kn: "2 ಕೊಠಡಿಗಳು, 1 ಹಾಲ್ ನ ದೈನಂದಿನ ಗುಡಿಸುವುದು ಮತ್ತು ಒರೆಸುವುದು",
    bn: "২টি ঘর, ১টি হলের দৈনিক ঝাড়ু দেওয়া ও মুছা"
  },

  bathroomCleaningDesc: {
    en: "Weekly cleaning of bathrooms",
    hi: "बाथरूम की साप्ताहिक सफाई",
    kn: "ಸ್ನಾನಗೃಹಗಳ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "সাপ্তাহিক বাথরুম পরিষ্কার"
  },

  regularAddonServices: {
    en: "Regular Add-on Services",
    hi: "नियमित ऐड-ऑन सेवाएं",
    kn: "ನಿಯಮಿತ ಆಡ್-ಆನ್ ಸೇವೆಗಳು",
    bn: "নিয়মিত অ্যাড-অন সেবা"
  },

  bathroomDeepCleaning: {
    en: "Bathroom Deep Cleaning",
    hi: "बाथरूम गहरी सफाई",
    kn: "ಸ್ನಾನಗೃಹದ ಆಳವಾದ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
    bn: "বাথরুম গভীর পরিষ্কার"
  },

  bathroomDeepCleaningDesc: {
    en: "Weekly cleaning of bathrooms, all bathroom walls cleaned",
    hi: "बाथरूम की साप्ताहिक सफाई, सभी बाथरूम की दीवारों की सफाई",
    kn: "ಸ್ನಾನಗೃಹಗಳ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ, ಎಲ್ಲಾ ಸ್ನಾನಗೃಹದ ಗೋಡೆಗಳು ಸ್ವಚ್ಛಗೊಳಿಸಲ್ಪಡುತ್ತವೆ",
    bn: "সাপ্তাহিক বাথরুম পরিষ্কার, সমস্ত বাথরুমের দেয়াল পরিষ্কার"
  },

  normalDusting: {
    en: "Normal Dusting",
    hi: "सामान्य धूल झाड़ना",
    kn: "ಸಾಮಾನ್ಯ ಧೂಳು ಒರೆಸುವುದು",
    bn: "সাধারণ ধুলো মুছা"
  },

  normalDustingDesc: {
    en: "Daily furniture dusting, doors, carpet, bed making",
    hi: "दैनिक फर्नीचर धूल झाड़ना, दरवाजे, कालीन, बिस्तर बनाना",
    kn: "ದೈನಂದಿನ ಫರ್ನಿಚರ್ ಧೂಳು ಒರೆಸುವುದು, ಬಾಗಿಲುಗಳು, ಕಾರ್ಪೆಟ್, ಹಾಸಿಗೆ ಮಾಡುವುದು",
    bn: "দৈনিক আসবাবপত্রে ধুলো মুছা, দরজা, কার্পেট, বিছানা তৈরি"
  },

  deepDusting: {
    en: "Deep Dusting",
    hi: "गहरी धूल झाड़ना",
    kn: "ಆಳವಾದ ಧೂಳು ಒರೆಸುವುದು",
    bn: "গভীর ধুলো মুছা"
  },

  deepDustingDesc: {
    en: "Includes chemical agents cleaning: décor items, furniture",
    hi: "रासायनिक एजेंटों की सफाई शामिल है: सजावटी वस्तुएं, फर्नीचर",
    kn: "ರಾಸಾಯನಿಕ ಏಜೆಂಟ್ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ ಸೇರಿದೆ: ಅಲಂಕಾರಿಕ ವಸ್ತುಗಳು, ಫರ್ನಿಚರ್",
    bn: "রাসায়নিক এজেন্ট পরিষ্কার অন্তর্ভুক্ত: সাজসজ্জার জিনিস, আসবাবপত্র"
  },

  utensilDrying: {
    en: "Utensil Drying",
    hi: "बर्तन सुखाना",
    kn: "ಪಾತ್ರೆ ಒಣಗಿಸುವುದು",
    bn: "বাসন শুকানো"
  },

  utensilDryingDesc: {
    en: "Househelp will dry and make proper arrangements",
    hi: "घरेलू सहायक सुखाएगा और उचित व्यवस्था करेगा",
    kn: "ಮನೆ ಸಹಾಯಕರು ಒಣಗಿಸಿ ಸರಿಯಾದ ವ್ಯವಸ್ಥೆ ಮಾಡುತ್ತಾರೆ",
    bn: "গৃহকর্মী শুকিয়ে সঠিকভাবে সাজিয়ে রাখবেন"
  },

  clothesDrying: {
    en: "Clothes Drying",
    hi: "कपड़े सुखाना",
    kn: "ಬಟ್ಟೆ ಒಣಗಿಸುವುದು",
    bn: "কাপড় শুকানো"
  },

  clothesDryingDesc: {
    en: "Househelp will get clothes from/to drying place",
    hi: "घरेलू सहायक कपड़े सुखाने की जगह से लाएगा/ले जाएगा",
    kn: "ಮನೆ ಸಹಾಯಕರು ಒಣಗಿಸುವ ಸ್ಥಳದಿಂದ/ಗೆ ಬಟ್ಟೆಗಳನ್ನು ತರುತ್ತಾರೆ/ಕೊಂಡೊಯ್ಯುತ್ತಾರೆ",
    bn: "গৃহকর্মী শুকানোর জায়গা থেকে কাপড় আনবেন/নিয়ে যাবেন"
  },


  houseSize: {
    en: "House Size:",
    hi: "घर का आकार:",
    kn: "ಮನೆಯ ಗಾತ್ರ:",
    bn: "বাড়ির আকার:"
  },

  bathrooms: {
    en: "Bathrooms:",
    hi: "बाथरूम:",
    kn: "ಸ್ನಾನಗೃಹಗಳು:",
    bn: "বাথরুম:"
  },

  monthlyService: {
    en: "Monthly service",
    hi: "मासिक सेवा",
    kn: "ಮಾಸಿಕ ಸೇವೆ",
    bn: "মাসিক সেবা"
  },

  addThisService: {
    en: "+ Add This Service",
    hi: "+ यह सेवा जोड़ें",
    kn: "+ ಈ ಸೇವೆಯನ್ನು ಸೇರಿಸಿ",
    bn: "+ এই সেবা যোগ করুন"
  },

  added: {
    en: "ADDED",
    hi: "जोड़ा गया",
    kn: "ಸೇರಿಸಲಾಗಿದೆ",
    bn: "যুক্ত হয়েছে"
  },

  totalForServices: {
    en: "Total for {services} services ({addons} add-ons)",
    hi: "कुल {services} सेवाओं के लिए ({addons} ऐड-ऑन)",
    kn: "ಒಟ್ಟು {services} ಸೇವೆಗಳಿಗೆ ({addons} ಆಡ್-ಆನ್‌ಗಳು)",
    bn: "মোট {services}টি সেবার জন্য ({addons}টি অ্যাড-অন)"
  },
  // ============ END MAID SERVICE DIALOG TRANSLATIONS ============

  // ============ NANNY SERVICES DIALOG TRANSLATIONS ============
  caregiverService: {
    en: "❤️ Caregiver Service",
    hi: "❤️ देखभालकर्ता सेवा",
    kn: "❤️ ಆರೈಕೆದಾರ ಸೇವೆ",
    bn: "❤️ পরিচর্যাকারী সেবা"
  },

  dayService: {
    en: "Day",
    hi: "दिन",
    kn: "ಹಗಲು",
    bn: "দিন"
  },

  nightService: {
    en: "Night",
    hi: "रात",
    kn: "ರಾತ್ರಿ",
    bn: "রাত"
  },

  fullTimeService: {
    en: "Fulltime",
    hi: "पूर्णकालिक",
    kn: "ಪೂರ್ಣ ಸಮಯ",
    bn: "পূর্ণকালীন"
  },

  age: {
    en: "Age:",
    hi: "आयु:",
    kn: "ವಯಸ್ಸು:",
    bn: "বয়স:"
  },

  ageInfoBaby: {
    en: "Age 1 includes babies from 1 to 12 months",
    hi: "आयु 1 में 1 से 12 महीने के शिशु शामिल हैं",
    kn: "ವಯಸ್ಸು 1 ರಲ್ಲಿ 1 ರಿಂದ 12 ತಿಂಗಳ ಮಕ್ಕಳು ಸೇರಿದ್ದಾರೆ",
    bn: "বয়স ১ এ ১ থেকে ১২ মাসের শিশু অন্তর্ভুক্ত"
  },

  ageInfoElderly: {
    en: "For seniors aged 60 and above",
    hi: "60 वर्ष और उससे अधिक आयु के वरिष्ठ नागरिकों के लिए",
    kn: "60 ಮತ್ತು ಅದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ವಯಸ್ಸಿನ ಹಿರಿಯರಿಗೆ",
    bn: "৬০ বছর ও তার বেশি বয়সের বয়স্কদের জন্য"
  },

  totalForService: {
    en: "Total for {count} service{plural}",
    hi: "कुल {count} सेवा{plural} के लिए",
    kn: "ಒಟ್ಟು {count} ಸೇವೆ{plural}",
    bn: "মোট {count}টি সেবা{plural} এর জন্য"
  },

  // ============ END NANNY SERVICES DIALOG TRANSLATIONS ============

  // Add these to your translations object
  availabilityDetails: {
    en: "Availability Details",
    hi: "उपलब्धता विवरण",
    kn: "ಲಭ್ಯತೆಯ ವಿವರಗಳು",
    bn: "উপলব্ধতার বিবরণ"
  },
  bestMatch: {
    en: "Best Match",
    hi: "सर्वोत्तम मिलान",
    kn: "ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ",
    bn: "সেরা মিল"
  },
  bestMatchProvider: {
    en: "Best Match Provider!",
    hi: "सर्वोत्तम प्रदाता!",
    kn: "ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆಯ ಪ್ರದಾತಾ!",
    bn: "সেরা প্রদানকারী!"
  },
  bestMatchDescription: {
    en: "This provider perfectly matches all your requirements and preferences.",
    hi: "यह प्रदाता आपकी सभी आवश्यकताओं और प्राथमिकताओं से पूरी तरह मेल खाता है।",
    kn: "ಈ ಪ್ರದಾತಾ ನಿಮ್ಮ ಎಲ್ಲಾ ಅವಶ್ಯಕತೆಗಳು ಮತ್ತು ಆದ್ಯತೆಗಳಿಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.",
    bn: "এই প্রদানকারী আপনার সমস্ত প্রয়োজন এবং পছন্দের সাথে পুরোপুরি মেলে।"
  },
  goodMatch: {
    en: "Good Match",
    hi: "अच्छा मिलान",
    kn: "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ",
    bn: "ভাল মিল"
  },
  unknown: {
    en: "Unknown",
    hi: "अज्ञात",
    kn: "ಅಜ್ಞಾತ",
    bn: "অজানা"
  },
  fullyAvailable: {
    en: "Fully Available",
    hi: "पूरी तरह उपलब्ध",
    kn: "ಸಂಪೂರ್ಣವಾಗಿ ಲಭ್ಯವಿದೆ",
    bn: "সম্পূর্ণ উপলব্ধ"
  },
  partiallyAvailable: {
    en: "Partially Available",
    hi: "आंशिक रूप से उपलब्ध",
    kn: "ಭಾಗಶಃ ಲಭ್ಯವಿದೆ",
    bn: "আংশিকভাবে উপলব্ধ"
  },
  bestMatchMessage: {
    en: "This provider is our best match for your requirements!",
    hi: "यह प्रदाता आपकी आवश्यकताओं के लिए हमारा सर्वोत्तम मिलान है!",
    kn: "ಈ ಪ್ರದಾತಾ ನಿಮ್ಮ ಅವಶ್ಯಕತೆಗಳಿಗೆ ನಮ್ಮ ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ!",
    bn: "এই প্রদানকারী আপনার প্রয়োজনীয়তার জন্য আমাদের সেরা মিল!"
  },
  partialAvailabilityMessage: {
    en: "This provider has some schedule variations. Check availability details below.",
    hi: "इस प्रदाता के पास कुछ कार्यक्रम भिन्नताएं हैं। नीचे उपलब्धता विवरण देखें।",
    kn: "ಈ ಪ್ರದಾತಾ ಕೆಲವು ವೇಳಾಪಟ್ಟಿ ವ್ಯತ್ಯಾಸಗಳನ್ನು ಹೊಂದಿದೆ. ಕೆಳಗೆ ಲಭ್ಯತೆಯ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    bn: "এই প্রদানকারীর কিছু সময়সূচী পরিবর্তন আছে। নীচে উপলব্ধতার বিবরণ দেখুন।"
  },
  goodMatchMessage: {
    en: "This provider matches most of your requirements.",
    hi: "यह प्रदाता आपकी अधिकांश आवश्यकताओं से मेल खाता है।",
    kn: "ಈ ಪ್ರದಾತಾ ನಿಮ್ಮ ಹೆಚ್ಚಿನ ಅವಶ್ಯಕತೆಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.",
    bn: "এই প্রদানকারী আপনার অধিকাংশ প্রয়োজনীয়তা পূরণ করে।"
  },
  preferredWorkingTime: {
    en: "Preferred Working Time",
    hi: "पसंदीदा कार्य समय",
    kn: "ಆದ್ಯತೆಯ ಕೆಲಸದ ಸಮಯ",
    bn: "পছন্দের কাজের সময়"
  },
  availabilitySummary: {
    en: "Availability Summary (Next 30 days)",
    hi: "उपलब्धता सारांश (अगले 30 दिन)",
    kn: "ಲಭ್ಯತೆಯ ಸಾರಾಂಶ (ಮುಂದಿನ 30 ದಿನಗಳು)",
    bn: "উপলব্ধতার সারাংশ (পরবর্তী ৩০ দিন)"
  },
  daysAtPreferredTime: {
    en: "Days at preferred time",
    hi: "पसंदीदा समय पर दिन",
    kn: "ಆದ್ಯತೆಯ ಸಮಯದಲ್ಲಿ ದಿನಗಳು",
    bn: "পছন্দের সময়ে দিন"
  },
  daysWithDifferentTime: {
    en: "Days with different time",
    hi: "अलग समय वाले दिन",
    kn: "ವಿಭಿನ್ನ ಸಮಯದ ದಿನಗಳು",
    bn: "ভিন্ন সময়ের দিন"
  },
  unavailableDays: {
    en: "Unavailable days",
    hi: "अनुपलब्ध दिन",
    kn: "ಲಭ್ಯವಿಲ್ಲದ ದಿನಗಳು",
    bn: "অনুপলব্ধ দিন"
  },
  totalAvailableDays: {
    en: "Total available days",
    hi: "कुल उपलब्ध दिन",
    kn: "ಒಟ್ಟು ಲಭ್ಯವಿರುವ ದಿನಗಳು",
    bn: "মোট উপলব্ধ দিন"
  },
  days: {
    en: "days",
    hi: "दिन",
    kn: "ದಿನಗಳು",
    bn: "দিন"
  },
  scheduleExceptions: {
    en: "Schedule Exceptions",
    hi: "अनुसूची अपवाद",
    kn: "ವೇಳಾಪಟ್ಟಿ ಅಪವಾದಗಳು",
    bn: "সময়সূচী ব্যতিক্রম"
  },
  exceptions: {
    en: "exception(s)",
    hi: "अपवाद",
    kn: "ಅಪವಾದ(ಗಳು)",
    bn: "ব্যতিক্রম(সমূহ)"
  },
  on_demand: {
    en: "ON DEMAND",
    hi: "मांग पर",
    kn: "ಬೇಡಿಕೆಯ ಮೇರೆಗೆ",
    bn: "চাহিদা সাপেক্ষে"
  },
  availableOnDemand: {
    en: "Available on demand at different time",
    hi: "अलग समय पर मांग पर उपलब्ध",
    kn: "ವಿಭಿನ್ನ ಸಮಯದಲ್ಲಿ ಬೇಡಿಕೆಯ ಮೇರೆಗೆ ಲಭ್ಯವಿದೆ",
    bn: "ভিন্ন সময়ে চাহিদা সাপেক্ষে উপলব্ধ"
  },
  notAvailableAtPreferredTime: {
    en: "Not available at preferred time",
    hi: "पसंदीदा समय पर उपलब्ध नहीं",
    kn: "ಆದ್ಯತೆಯ ಸಮಯದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ",
    bn: "পছন্দের সময়ে উপলব্ধ নয়"
  },
  suggestedTime: {
    en: "Suggested time",
    hi: "सुझाया गया समय",
    kn: "ಸೂಚಿಸಿದ ಸಮಯ",
    bn: "প্রস্তাবিত সময়"
  },
  scheduleExceptionsInfo: {
    en: "These dates have different availability. You can still book for these dates, but the timing might vary.",
    hi: "इन तारीखों में अलग उपलब्धता है। आप अभी भी इन तारीखों के लिए बुक कर सकते हैं, लेकिन समय भिन्न हो सकता है।",
    kn: "ಈ ದಿನಾಂಕಗಳು ವಿಭಿನ್ನ ಲಭ್ಯತೆಯನ್ನು ಹೊಂದಿವೆ. ನೀವು ಇನ್ನೂ ಈ ದಿನಾಂಕಗಳಿಗಾಗಿ ಬುಕ್ ಮಾಡಬಹುದು, ಆದರೆ ಸಮಯ ಬದಲಾಗಬಹುದು.",
    bn: "এই তারিখগুলিতে ভিন্ন উপলব্ধতা রয়েছে। আপনি এখনও এই তারিখগুলির জন্য বুক করতে পারেন, তবে সময় পরিবর্তিত হতে পারে।"
  },
  perfectAvailability: {
    en: "Perfect Availability!",
    hi: "संपूर्ण उपलब्धता!",
    kn: "ಪರಿಪೂರ್ಣ ಲಭ್ಯತೆ!",
    bn: "নিখুঁত উপলব্ধতা!"
  },
  perfectAvailabilityDescription: {
    en: "This provider is fully available at their preferred time for the entire month. No schedule conflicts or exceptions.",
    hi: "यह प्रदाता पूरे महीने अपने पसंदीदा समय पर पूरी तरह उपलब्ध है। कोई कार्यक्रम विरोध या अपवाद नहीं।",
    kn: "ಈ ಪ್ರದಾತಾ ಇಡೀ ತಿಂಗಳು ತಮ್ಮ ಆದ್ಯತೆಯ ಸಮಯದಲ್ಲಿ ಸಂಪೂರ್ಣವಾಗಿ ಲಭ್ಯವಿದೆ. ಯಾವುದೇ ವೇಳಾಪಟ್ಟಿ ಸಂಘರ್ಷಗಳು ಅಥವಾ ಅಪವಾದಗಳಿಲ್ಲ.",
    bn: "এই প্রদানকারী পুরো মাস জুড়ে তাদের পছন্দের সময়ে সম্পূর্ণ উপলব্ধ। কোন সময়সূচী দ্বন্দ্ব বা ব্যতিক্রম নেই।"
  },
  whyNotBestMatch: {
    en: "Why this isn't a Best Match?",
    hi: "यह सर्वोत्तम मिलान क्यों नहीं है?",
    kn: "ಇದು ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ ಏಕೆ ಅಲ್ಲ?",
    bn: "কেন এটি সেরা মিল নয়?"
  },
  whyNotBestMatchDescription: {
    en: "This provider has some schedule variations during the month which prevents them from being marked as a 'Best Match'. However, they're still highly available and can accommodate your needs on most days.",
    hi: "इस प्रदाता के पास महीने के दौरान कुछ कार्यक्रम भिन्नताएं हैं जो उन्हें 'सर्वोत्तम मिलान' के रूप में चिह्नित होने से रोकती हैं। हालाँकि, वे अभी भी अत्यधिक उपलब्ध हैं और अधिकांश दिनों में आपकी आवश्यकताओं को पूरा कर सकते हैं।",
    kn: "ಈ ಪ್ರದಾತಾ ತಿಂಗಳಿನಲ್ಲಿ ಕೆಲವು ವೇಳಾಪಟ್ಟಿ ವ್ಯತ್ಯಾಸಗಳನ್ನು ಹೊಂದಿದ್ದು, ಅವುಗಳನ್ನು 'ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ' ಎಂದು ಗುರುತಿಸುವುದನ್ನು ತಡೆಯುತ್ತದೆ. ಆದಾಗ್ಯೂ, ಅವರು ಇನ್ನೂ ಹೆಚ್ಚು ಲಭ್ಯವಿದ್ದಾರೆ ಮತ್ತು ಹೆಚ್ಚಿನ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಅಗತ್ಯಗಳನ್ನು ಪೂರೈಸಬಹುದು.",
    bn: "এই প্রদানকারীর মাসের মধ্যে কিছু সময়সূচী পরিবর্তন রয়েছে যা তাদের 'সেরা মিল' হিসাবে চিহ্নিত হতে বাধা দেয়। তবে, তারা এখনও অত্যন্ত উপলব্ধ এবং অধিকাংশ দিনে আপনার চাহিদা পূরণ করতে পারে।"
  },

  // Add these to your translations object
  timeRangeWarning: {
    en: "The time range must be at least 4 hours.",
    hi: "समय सीमा कम से कम 4 घंटे की होनी चाहिए।",
    kn: "ಸಮಯದ ವ್ಯಾಪ್ತಿಯು ಕನಿಷ್ಠ 4 ಗಂಟೆಗಳಿರಬೇಕು.",
    bn: "সময়সীমা কমপক্ষে ৪ ঘন্টা হতে হবে।"
  },
  available: {
    en: "Available",
    hi: "उपलब्ध",
    kn: "ಲಭ್ಯವಿದೆ",
    bn: "উপলব্ধ"
  },
  notSpecified: {
    en: "Not specified",
    hi: "निर्दिष्ट नहीं",
    kn: "ನಿರ್ದಿಷ್ಟಪಡಿಸಲಾಗಿಲ್ಲ",
    bn: "নির্দিষ্ট করা হয়নি"
  },
  availabilityNotSpecified: {
    en: "Availability not specified",
    hi: "उपलब्धता निर्दिष्ट नहीं है",
    kn: "ಲಭ್ಯತೆಯನ್ನು ನಿರ್ದಿಷ್ಟಪಡಿಸಲಾಗಿಲ್ಲ",
    bn: "উপলব্ধতা নির্দিষ্ট করা হয়নি"
  },
  availableAt: {
    en: "Available at",
    hi: "उपलब्ध समय",
    kn: "ಇಲ್ಲಿ ಲಭ್ಯವಿದೆ",
    bn: "উপলব্ধ সময়"
  },
  veryLimitedAvailability: {
    en: "Very limited availability",
    hi: "बहुत सीमित उपलब्धता",
    kn: "ಬಹಳ ಸೀಮಿತ ಲಭ್ಯತೆ",
    bn: "খুব সীমিত উপলব্ধতা"
  },
  limitedAvailability: {
    en: "Limited availability this month",
    hi: "इस महीने सीमित उपलब्धता",
    kn: "ಈ ತಿಂಗಳು ಸೀಮಿತ ಲಭ್ಯತೆ",
    bn: "এই মাসে সীমিত উপলব্ধতা"
  },
  usuallyAvailableAt: {
    en: "Usually available at",
    hi: "आमतौर पर उपलब्ध समय",
    kn: "ಸಾಮಾನ್ಯವಾಗಿ ಇಲ್ಲಿ ಲಭ್ಯವಿದೆ",
    bn: "সাধারণত উপলব্ধ সময়"
  },
  english: {
    en: "English",
    hi: "अंग्रेज़ी",
    kn: "ಆಂಗ್ಲ",
    bn: "ইংরেজি"
  },
  nearby: {
    en: "Nearby",
    hi: "आस-पास",
    kn: "ಹತ್ತಿರದ",
    bn: "কাছাকাছি"
  },
  availability: {
    en: "Availability",
    hi: "उपलब्धता",
    kn: "ಲಭ್ಯತೆ",
    bn: "উপলব্ধতা"
  },
  monthly: {
    en: "Monthly",
    hi: "मासिक",
    kn: "ಮಾಸಿಕ",
    bn: "মাসিক"
  },
  shortTerm: {
    en: "Short Term",
    hi: "अल्पकालिक",
    kn: "ಅಲ್ಪಾವಧಿ",
    bn: "স্বল্পমেয়াদী"
  },
  scheduleExceptionsCount: {
    en: "schedule exception(s) this month",
    hi: "इस महीने अनुसूची अपवाद",
    kn: "ಈ ತಿಂಗಳು ವೇಳಾಪಟ್ಟಿ ಅಪವಾದ(ಗಳು)",
    bn: "এই মাসে সময়সূচী ব্যতিক্রম(সমূহ)"
  },
  fullyAvailableAllMonth: {
    en: "Fully available all month",
    hi: "पूरे महीने पूरी तरह उपलब्ध",
    kn: "ಇಡೀ ತಿಂಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಲಭ್ಯವಿದೆ",
    bn: "সারা মাস সম্পূর্ণ উপলব্ধ"
  },
  partiallyAvailableMonth: {
    en: "Partially available this month",
    hi: "इस महीने आंशिक रूप से उपलब्ध",
    kn: "ಈ ತಿಂಗಳು ಭಾಗಶಃ ಲಭ್ಯವಿದೆ",
    bn: "এই মাসে আংশিকভাবে উপলব্ধ"
  },
  additionalServices: {
    en: "Additional Services",
    hi: "अतिरिक्त सेवाएं",
    kn: "ಹೆಚ್ಚುವರಿ ಸೇವೆಗಳು",
    bn: "অতিরিক্ত সেবা"
  },
  kmAway: {
    en: "km away",
    hi: "किमी दूर",
    kn: "ಕಿ.ಮೀ. ದೂರದಲ್ಲಿ",
    bn: "কিমি দূরে"
  },
  yrsExperience: {
    en: "yrs experience",
    hi: "वर्षों का अनुभव",
    kn: "ವರ್ಷಗಳ ಅನುಭವ",
    bn: "বছরের অভিজ্ঞতা"
  },
  details: {
    en: "Details",
    hi: "विवरण",
    kn: "ವಿವರಗಳು",
    bn: "বিবরণ"
  },
  viewDetails: {
    en: "View Details",
    hi: "विवरण देखें",
    kn: "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    bn: "বিবরণ দেখুন"
  },
  book: {
    en: "Book",
    hi: "बुक करें",
    kn: "ಬುಕ್ ಮಾಡಿ",
    bn: "বুক করুন"
  },
  bookNow: {
    en: "Book Now",
    hi: "अभी बुक करें",
    kn: "ಈಗಲೇ ಬುಕ್ ಮಾಡಿ",
    bn: "এখনই বুক করুন"
  },
  // Add these to your translations object in LanguageContext.tsx
selectBookingOption: {
  en: "Select your Booking Option",
  hi: "अपना बुकिंग विकल्प चुनें",
  kn: "ನಿಮ್ಮ ಬುಕಿಂಗ್ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ",
  bn: "আপনার বুকিং বিকল্প নির্বাচন করুন"
},
  subscriptionPeriodLabel: {
    en: "Subscription period",
    hi: "सदस्यता अवधि",
    kn: "ಚಂದಾದಾರಿಕೆ ಅವಧಿ",
    bn: "সাবস্ক্রিপশন সময়কাল"
  },
bookBy: {
  en: "Book by",
  hi: "द्वारा बुक करें",
  kn: "ಮೂಲಕ ಬುಕ್ ಮಾಡಿ",
  bn: "দ্বারা বুক করুন"
},
dateOption: {
  en: "Date",
  hi: "तारीख",
  kn: "ದಿನಾಂಕ",
  bn: "তারিখ"
},
bookingTimeRestriction: {
  en: "Please select a time between 5 AM and 10 PM, at least 30 minutes from now",
  hi: "কৃपया अभी থেকে কমপক্ষে ৩০ মিনিট পরের সময় নির্বাচন করুন, সকাল ৫টা থেকে রাত ১০টার মধ্যে",
  kn: "ದಯವಿಟ್ಟು ಈಗಿನಿಂದ ಕನಿಷ್ಠ 30 ನಿಮಿಷಗಳ ನಂತರದ ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಬೆಳಿಗ್ಗೆ 5 ಮತ್ತು ರಾತ್ರಿ 10 ರ ನಡುವೆ",
  bn: "অনুগ্রহ করে এখন থেকে কমপক্ষে ৩০ মিনিট পরের সময় নির্বাচন করুন, সকাল ৫টা থেকে রাত ১০টার মধ্যে"
},
timeMinuteRestriction: {
  en: "Please select a time at least 30 minutes from now",
  hi: "কৃপया अभी থেকে কমপক্ষে ৩০ মিনিট পরের সময় নির্বাচন করুন",
  kn: "ದಯವಿಟ್ಟು ಈಗಿನಿಂದ ಕನಿಷ್ಠ 30 ನಿಮಿಷಗಳ ನಂತರದ ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  bn: "অনুগ্রহ করে এখন থেকে কমপক্ষে ৩০ মিনিট পরের সময় নির্বাচন করুন"
},
timeHourRestriction: {
  en: "Time must be between 5 AM and 9 PM",
  hi: "সময় সকাল ৫টা থেকে রাত ৯টার মধ্যে হতে হবে",
  kn: "ಸಮಯವು ಬೆಳಿಗ್ಗೆ 5 ಮತ್ತು ರಾತ್ರಿ 9 ರ ನಡುವೆ ಇರಬೇಕು",
  bn: "সময় সকাল ৫টা থেকে রাত ৯টার মধ্যে হতে হবে"
},
dateExceedRestriction: {
  en: "Date exceeds allowed range",
  hi: "তারিখ অনুমোদিত সীমা অতিক্রম করেছে",
  kn: "ದಿನಾಂಕ ಅನುಮತಿಸಲಾದ ವ್ಯಾಪ್ತಿಯನ್ನು ಮೀರಿದೆ",
  bn: "তারিখ অনুমোদিত সীমা অতিক্রম করেছে"
},
monthlyDateExceedRestriction: {
  en: "Date exceeds allowed range (maximum 90 days)",
  hi: "তারিখ অনুমোদিত সীমা অতিক্রম করেছে (সর্বোচ্চ ৯০ দিন)",
  kn: "ದಿನಾಂಕ ಅನುಮತಿಸಲಾದ ವ್ಯಾಪ್ತಿಯನ್ನು ಮೀರಿದೆ (ಗರಿಷ್ಠ 90 ದಿನಗಳು)",
  bn: "তারিখ অনুমোদিত সীমা অতিক্রম করেছে (সর্বোচ্চ ৯০ দিন)"
},
pastDateRestriction: {
  en: "Past dates are not allowed",
  hi: "অতীতের তারিখ অনুমোদিত নয়",
  kn: "ಹಿಂದಿನ ದಿನಾಂಕಗಳನ್ನು ಅನುಮತಿಸಲಾಗುವುದಿಲ್ಲ",
  bn: "অতীতের তারিখ অনুমোদিত নয়"
},
confirmBooking: {
  en: "Confirm Your Booking",
  hi: "আপনার বুকিং নিশ্চিত করুন",
  kn: "ನಿಮ್ಮ ಬುಕಿಂಗ್ ಅನ್ನು ದೃಢೀಕರಿಸಿ",
  bn: "আপনার বুকিং নিশ্চিত করুন"
},
bookingDetails: {
  en: "Booking Details",
  hi: "বুকিংয়ের বিবরণ",
  kn: "ಬುಕಿಂಗ್ ವಿವರಗಳು",
  bn: "বুকিংয়ের বিবরণ"
},
startDate: {
  en: "Start Date",
  hi: "শুরুর তারিখ",
  kn: "ಪ್ರಾರಂಭ ದಿನಾಂಕ",
  bn: "শুরুর তারিখ"
},
startTime: {
  en: "Start Time",
  hi: "শুরুর সময়",
  kn: "ಪ್ರಾರಂಭ ಸಮಯ",
  bn: "শুরুর সময়"
},
notSelected: {
  en: "Not selected",
  hi: "নির্বাচিত নয়",
  kn: "ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ",
  bn: "নির্বাচিত নয়"
},
serviceStartMessage: {
  en: "Your service is set to start on {date} at {time}.",
  hi: "আপনার সেবা {date} তারিখে {time} এ শুরু হবে।",
  kn: "ನಿಮ್ಮ ಸೇವೆಯು {date} ರಂದು {time} ಗೆ ಪ್ರಾರಂಭವಾಗಲಿದೆ.",
  bn: "আপনার সেবা {date} তারিখে {time} এ শুরু হবে।"
},
serviceDuration: {
  en: "Service Duration",
  hi: "সেবার সময়কাল",
  kn: "ಸೇವೆಯ ಅವಧಿ",
  bn: "সেবার সময়কাল"
},
durationMessage: {
  en: "If you need more time, adjust your service duration below.",
  hi: "আপনার যদি আরও সময়ের প্রয়োজন হয়, নীচে আপনার সেবার সময়কাল সামঞ্জস্য করুন।",
  kn: "ನಿಮಗೆ ಹೆಚ್ಚಿನ ಸಮಯ ಬೇಕಾದರೆ, ಕೆಳಗೆ ನಿಮ್ಮ ಸೇವೆಯ ಅವಧಿಯನ್ನು ಹೊಂದಿಸಿ.",
  bn: "আপনার যদি আরও সময়ের প্রয়োজন হয়, নীচে আপনার সেবার সময়কাল সামঞ্জস্য করুন।"
},
hourUnit: {
  en: "hour",
  hi: "ঘন্টা",
  kn: "ಗಂಟೆ",
  bn: "ঘন্টা"
},
// Add these to your translations object in LanguageContext.tsx
orderSummary: {
  en: "Your Order Summary",
  hi: "आपका ऑर्डर सारांश",
  kn: "ನಿಮ್ಮ ಆರ್ಡರ್ ಸಾರಾಂಶ",
  bn: "আপনার অর্ডারের সারসংক্ষেপ"
},
cartEmpty: {
  en: "Your cart is empty",
  hi: "आपकी कार्ट खाली है",
  kn: "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿ ಇದೆ",
  bn: "আপনার কার্ট খালি"
},
browseServices: {
  en: "Browse Services",
  hi: "सेवाएं ब्राउज़ करें",
  kn: "ಸೇವೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ",
  bn: "সেবা ব্রাউজ করুন"
},
mealServices: {
  en: "Meal Services",
  hi: "भोजन सेवाएं",
  kn: "ಊಟದ ಸೇವೆಗಳು",
  bn: "খাবার সেবা"
},
maidServices: {
  en: "Maid Services",
  hi: "सफाई सेवाएं",
  kn: "ಮನೆಕೆಲಸದವರ ಸೇವೆಗಳು",
  bn: "পরিচ্ছন্নতা সেবা"
},
nannyServices: {
  en: "Nanny Services",
  hi: "आया सेवाएं",
  kn: "ದಾದಿ ಸೇವೆಗಳು",
  bn: "আয়া সেবা"
},
subtotal: {
  en: "Subtotal",
  hi: "उप-योग",
  kn: "ಉಪ-ಮೊತ್ತ",
  bn: "উপ-মোট"
},
tax: {
  en: "Tax ({percentage}%)",
  hi: "कर ({percentage}%)",
  kn: "ತೆರಿಗೆ ({percentage}%)",
  bn: "কর ({percentage}%)"
},
platformFee: {
  en: "Platform Fee ({percentage}%)",
  hi: "प्लेटफॉर्म शुल्क ({percentage}%)",
  kn: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕ ({percentage}%)",
  bn: "প্ল্যাটফর্ম ফি ({percentage}%)"
},
total: {
  en: "Total",
  hi: "कुल",
  kn: "ಒಟ್ಟು",
  bn: "মোট"
},
itemsSelected: {
  en: "{count} item{count > 1 ? 's' : ''} selected",
  hi: "{count} आइटम{count > 1 ? ' चयनित' : ' चयनित'}",
  kn: "{count} ಐಟಂ{count > 1 ? 'ಗಳು' : ''} ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ",
  bn: "{count}টি আইটেম নির্বাচিত"
},
modifyBooking: {
  en: "Modify Booking",
  hi: "बुकिंग संशोधित करें",
  kn: "ಬುಕಿಂಗ್ ಮಾರ್ಪಡಿಸಿ",
  bn: "বুকিং পরিবর্তন করুন"
},
processing: {
  en: "Processing...",
  hi: "प्रोसेसिंग...",
  kn: "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",
  bn: "প্রক্রিয়াকরণ..."
},
checking: {
  en: "Checking...",
  hi: "जांच हो रही है...",
  kn: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
  bn: "পরীক্ষা করা হচ্ছে..."
},
noCustomerId: {
  en: "No customer ID found",
  hi: "कोई ग्राहक आईडी नहीं मिली",
  kn: "ಯಾವುದೇ ಗ್ರಾಹಕ ID ಕಂಡುಬಂದಿಲ್ಲ",
  bn: "কোন গ্রাহক আইডি পাওয়া যায়নি"
},
loadingCustomerDetails: {
  en: "Still loading customer details...",
  hi: "ग्राहक विवरण लोड हो रहा है...",
  kn: "ಗ್ರಾಹಕರ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
  bn: "গ্রাহকের বিবরণ লোড হচ্ছে..."
},
mobileNumberStatusUnknown: {
  en: "Customer mobile number status unknown. Proceeding with checkout.",
  hi: "ग्राहक मोबाइल नंबर स्थिति अज्ञात। चेकआउट के साथ आगे बढ़ रहे हैं।",
  kn: "ಗ್ರಾಹಕರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯ ಸ್ಥಿತಿ ತಿಳಿದಿಲ್ಲ. ಚೆಕ್‌ಔಟ್‌ನೊಂದಿಗೆ ಮುಂದುವರಿಯಲಾಗುತ್ತಿದೆ.",
  bn: "গ্রাহকের মোবাইল নম্বরের অবস্থা অজানা। চেকআউটে এগিয়ে যাচ্ছি।"
},
noCheckoutHandler: {
  en: "No checkout handler available for cart items",
  hi: "कार्ट आइटम के लिए कोई चेकआउट हैंडलर उपलब्ध नहीं है",
  kn: "ಕಾರ್ಟ್ ಐಟಂಗಳಿಗೆ ಯಾವುದೇ ಚೆಕ್‌ಔಟ್ ಹ್ಯಾಂಡ್ಲರ್ ಲಭ್ಯವಿಲ್ಲ",
  bn: "কার্ট আইটেমের জন্য কোন চেকআউট হ্যান্ডলার উপলব্ধ নেই"
},
nannyService: {
  en: "Nanny Service",
  hi: "आया सेवा",
  kn: "ದಾದಿ ಸೇವೆ",
  bn: "আয়া সেবা"
},
package: {
  en: "Package",
  hi: "पैकेज",
  kn: "ಪ್ಯಾಕೇಜ್",
  bn: "প্যাকেজ"
},
addOn: {
  en: "Add-on",
  hi: "ऐड-ऑन",
  kn: "ಆಡ್-ಆನ್",
  bn: "অ্যাড-অন"
},
mealPackage: {
  en: "Meal Package",
  hi: "भोजन पैकेज",
  kn: "ಊಟದ ಪ್ಯಾಕೇಜ್",
  bn: "খাবার প্যাকেজ"
},
careTypeService: {
  en: "{careType} Care - {packageType}",
  hi: "{careType} देखभाल - {packageType}",
  kn: "{careType} ಆರೈಕೆ - {packageType}",
  bn: "{careType} যত্ন - {packageType}"
},
baby: {
  en: "Baby",
  hi: "शिशु",
  kn: "ಶಿಶು",
  bn: "শিশু"
},
elderly: {
  en: "Elderly",
  hi: "वरिष्ठ",
  kn: "ಹಿರಿಯ",
  bn: "বয়স্ক"
},
removeItem: {
  en: "Remove item",
  hi: "आइटम हटाएं",
  kn: "ಐಟಂ ತೆಗೆದುಹಾಕಿ",
  bn: "আইটেম সরান"
},
includes: {
  en: "Includes",
  hi: "शामिल हैं",
  kn: "ಒಳಗೊಂಡಿದೆ",
  bn: "অন্তর্ভুক্ত"
},
price: {
  en: "Price",
  hi: "मूल्य",
  kn: "ಬೆಲೆ",
  bn: "মূল্য"
},
// ============ TermsCheckboxes TRANSLATIONS ============

reviewAndAgree: {
  en: "Please review and agree to the following policies before proceeding.",
  hi: "कृपया आगे बढ़ने से पहले निम्नलिखित नीतियों की समीक्षा करें और उनसे सहमत हों।",
  kn: "ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು ಕೆಳಗಿನ ನೀತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಒಪ್ಪಿಕೊಳ್ಳಿ.",
  bn: "এগিয়ে যাওয়ার আগে অনুগ্রহ করে নিম্নলিখিত নীতিগুলি পর্যালোচনা করুন এবং সম্মত হন।"
},
iAgreeToServEaso: {
  en: "I agree to the ServEaso",
  hi: "मैं ServEaso से सहमत हूँ",
  kn: "ನಾನು ServEaso ಗೆ ಒಪ್ಪುತ್ತೇನೆ",
  bn: "আমি ServEaso-এর সাথে সম্মত"
},
keyFactsStatement: {
  en: "Key Facts Statement",
  hi: "मुख्य तथ्य विवरण",
  kn: "ಪ್ರಮುಖ ಸಂಗತಿಗಳ ಹೇಳಿಕೆ",
  bn: "মূল তথ্য বিবৃতি"
},
privacyStatement: {
  en: "Privacy Statement",
  hi: "गोपनीयता नीति",
  kn: "ಗೌಪ್ಯತಾ ಹೇಳಿಕೆ",
  bn: "গোপনীয়তা বিবৃতি"
},

// ============ Tnc TRANSLATIONS ============

forServEasoApp: {
  en: "For ServEaso App - Unit of ServEase Innovation Talent Tap Pvt Ltd.",
  hi: "सर्वएसो ऐप के लिए - सर्वईज इनोवेशन टैलेंट टैप प्राइवेट लिमिटेड की इकाई।",
  kn: "ServEaso ಅಪ್ಲಿಕೇಶನ್‌ಗಾಗಿ - ServEase ಇನ್ನೋವೇಶನ್ ಟ್ಯಾಲೆಂಟ್ ಟ್ಯಾಪ್ ಪ್ರೈವೇಟ್ ಲಿಮಿಟೆಡ್ ನ ಘಟಕ.",
  bn: "সার্ভইজো অ্যাপের জন্য - সার্ভইজ ইনোভেশন ট্যালেন্ট ট্যাপ প্রাইভেট লিমিটেডের একটি ইউনিট।"
},
tncWelcomeMessage: {
  en: "Welcome to ServEaso App! We are delighted to provide you with professional household services, including maid, nanny, and cook services. By engaging our services, you agree to the following terms and conditions:",
  hi: "सर्वएसो ऐप में आपका स्वागत है! हमें आपको पेशेवर घरेलू सेवाएं प्रदान करने में खुशी हो रही है, जिसमें नौकरानी, आया और रसोइया सेवाएं शामिल हैं। हमारी सेवाओं का उपयोग करके, आप निम्नलिखित नियमों और शर्तों से सहमत होते हैं:",
  kn: "ServEaso ಅಪ್ಲಿಕೇಶನ್‌ಗೆ ಸುಸ್ವಾಗತ! ಮನೆಕೆಲಸದವರು, ದಾದಿ ಮತ್ತು ಅಡುಗೆಯವರ ಸೇವೆಗಳನ್ನು ಒಳಗೊಂಡಂತೆ ವೃತ್ತಿಪರ ಗೃಹ ಸೇವೆಗಳನ್ನು ನಿಮಗೆ ಒದಗಿಸಲು ನಾವು ಸಂತೋಷಪಡುತ್ತೇವೆ. ನಮ್ಮ ಸೇವೆಗಳನ್ನು ಬಳಸುವ ಮೂಲಕ, ನೀವು ಈ ಕೆಳಗಿನ ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳಿಗೆ ಒಪ್ಪುತ್ತೀರಿ:",
  bn: "সার্ভইজো অ্যাপ-এ স্বাগতম! আমরা আপনাকে পেশাদার গৃহস্থালি সেবা প্রদান করতে পেরে আনন্দিত, যার মধ্যে গৃহকর্মী, আয়া এবং রাঁধুনি সেবা অন্তর্ভুক্ত। আমাদের সেবা ব্যবহার করে, আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হন:"
},
definitions: {
  en: "1. Definitions",
  hi: "1. परिभाषाएं",
  kn: "1. ವ್ಯಾಖ್ಯಾನಗಳು",
  bn: "১. সংজ্ঞা"
},
definition1: {
  en: "• 'Company', 'We', 'Us', 'Our': ServEaso App – a unit of ServEase Innovation Talent Tap.",
  hi: "• 'कंपनी', 'हम', 'हमें', 'हमारा': सर्वएसो ऐप – सर्वईज इनोवेशन टैलेंट टैप की एक इकाई।",
  kn: "• 'ಕಂಪನಿ', 'ನಾವು', 'ನಮಗೆ', 'ನಮ್ಮ': ServEaso ಅಪ್ಲಿಕೇಶನ್ – ServEase ಇನ್ನೋವೇಶನ್ ಟ್ಯಾಲೆಂಟ್ ಟ್ಯಾಪ್ ನ ಘಟಕ.",
  bn: "• 'কোম্পানি', 'আমরা', 'আমাদের': সার্ভইজো অ্যাপ – সার্ভইজ ইনোভেশন ট্যালেন্ট ট্যাপের একটি ইউনিট।"
},
definition2: {
  en: "• 'Client', 'You', 'Your': Refers to the individual or entity engaging our services.",
  hi: "• 'ग्राहक', 'आप', 'आपका': हमारी सेवाओं का उपयोग करने वाले व्यक्ति या संस्था को संदर्भित करता है।",
  kn: "• 'ಗ್ರಾಹಕ', 'ನೀವು', 'ನಿಮ್ಮ': ನಮ್ಮ ಸೇವೆಗಳನ್ನು ಬಳಸಿಕೊಳ್ಳುವ ವ್ಯಕ್ತಿ ಅಥವಾ ಸಂಸ್ಥೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
  bn: "• 'ক্লায়েন্ট', 'আপনি', 'আপনার': আমাদের সেবা গ্রহণকারী ব্যক্তি বা প্রতিষ্ঠানকে বোঝায়।"
},
definition3: {
  en: "• 'Service Provider(s)': Refers to the maid(s), nanny(ies), or cook(s) provided by the Company.",
  hi: "• 'सेवा प्रदाता': कंपनी द्वारा प्रदान की जाने वाली नौकरानी(यां), आया(यां), या रसोइया(यों) को संदर्भित करता है।",
  kn: "• 'ಸೇವಾ ಒದಗಿಸುವವರು': ಕಂಪನಿಯು ಒದಗಿಸುವ ಮನೆಕೆಲಸದವರು, ದಾದಿಯರು, ಅಥವಾ ಅಡುಗೆಯವರನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
  bn: "• 'সেবা প্রদানকারী': কোম্পানি দ্বারা প্রদত্ত গৃহকর্মী, আয়া, বা রাঁধুনিকে বোঝায়।"
},
definition4: {
  en: "• 'Services': Refers to the household services provided by the Company.",
  hi: "• 'सेवाएं': कंपनी द्वारा प्रदान की जाने वाली घरेलू सेवाओं को संदर्भित करता है।",
  kn: "• 'ಸೇವೆಗಳು': ಕಂಪನಿಯು ಒದಗಿಸುವ ಗೃಹ ಸೇವೆಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
  bn: "• 'সেবাসমূহ': কোম্পানি দ্বারা প্রদত্ত গৃহস্থালি সেবা বোঝায়।"
},
definition5: {
  en: "• 'Agreement': Refers to these Terms and Conditions.",
  hi: "• 'समझौता': इन नियमों और शर्तों को संदर्भित करता है।",
  kn: "• 'ಒಪ್ಪಂದ': ಈ ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
  bn: "• 'চুক্তি': এই শর্তাবলী বোঝায়।"
},
serviceAgreement: {
  en: "2. Service Agreement",
  hi: "2. सेवा समझौता",
  kn: "2. ಸೇವಾ ಒಪ್ಪಂದ",
  bn: "২. সেবা চুক্তি"
},
serviceAgreementA: {
  en: "a. Engagement: By requesting and accepting our services, you enter into a service agreement with ServEase Innovation subject to these Terms and Conditions.",
  hi: "क. अनुबंध: हमारी सेवाओं का अनुरोध और स्वीकार करके, आप इन नियमों और शर्तों के अधीन सर्वईज इनोवेशन के साथ एक सेवा समझौते में प्रवेश करते हैं।",
  kn: "ಎ. ಒಪ್ಪಂದ: ನಮ್ಮ ಸೇವೆಗಳನ್ನು ವಿನಂತಿಸಿ ಮತ್ತು ಸ್ವೀಕರಿಸುವ ಮೂಲಕ, ನೀವು ಈ ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳಿಗೆ ಒಳಪಟ್ಟು ServEase ಇನ್ನೋವೇಶನ್ ಜೊತೆ ಸೇವಾ ಒಪ್ಪಂದವನ್ನು ಮಾಡಿಕೊಳ್ಳುತ್ತೀರಿ.",
  bn: "ক. চুক্তি: আমাদের সেবা অনুরোধ এবং গ্রহণ করে, আপনি এই শর্তাবলী সাপেক্ষে সার্ভইজ ইনোভেশনের সাথে একটি সেবা চুক্তিতে প্রবেশ করেন।"
},
serviceAgreementB: {
  en: "b. Scope of Work: The specific services to be provided, the schedule, and any special instructions will be agreed upon in writing prior to the commencement of services.",
  hi: "ख. कार्य का दायरा: प्रदान की जाने वाली विशिष्ट सेवाएं, कार्यक्रम, और कोई विशेष निर्देश सेवाओं की शुरुआत से पहले लिखित रूप में सहमत होंगे।",
  kn: "ಬಿ. ಕೆಲಸದ ವ್ಯಾಪ್ತಿ: ಒದಗಿಸಬೇಕಾದ ನಿರ್ದಿಷ್ಟ ಸೇವೆಗಳು, ವೇಳಾಪಟ್ಟಿ, ಮತ್ತು ಯಾವುದೇ ವಿಶೇಷ ಸೂಚನೆಗಳನ್ನು ಸೇವೆಗಳ ಪ್ರಾರಂಭಕ್ಕೂ ಮೊದಲು ಲಿಖಿತವಾಗಿ ಒಪ್ಪಿಕೊಳ್ಳಲಾಗುವುದು.",
  bn: "খ. কাজের পরিধি: প্রদেয় নির্দিষ্ট সেবা, সময়সূচী, এবং কোন বিশেষ নির্দেশনা সেবা শুরুর পূর্বে লিখিতভাবে সম্মত হবে।"
},
serviceAgreementC: {
  en: "c. Changes to Services: Any changes to the agreed-upon services must be communicated to and approved by the Company in advance. Additional charges may apply.",
  hi: "ग. सेवाओं में परिवर्तन: सहमत सेवाओं में किसी भी परिवर्तन की सूचना कंपनी को दी जानी चाहिए और उसकी पूर्व स्वीकृति आवश्यक है। अतिरिक्त शुल्क लागू हो सकते हैं।",
  kn: "ಸಿ. ಸೇವೆಗಳಿಗೆ ಬದಲಾವಣೆಗಳು: ಒಪ್ಪಿದ ಸೇವೆಗಳಿಗೆ ಯಾವುದೇ ಬದಲಾವಣೆಗಳನ್ನು ಕಂಪನಿಗೆ ಮುಂಚಿತವಾಗಿ ತಿಳಿಸಬೇಕು ಮತ್ತು ಅನುಮೋದಿಸಬೇಕು. ಹೆಚ್ಚುವರಿ ಶುಲ್ಕಗಳು ಅನ್ವಯಿಸಬಹುದು.",
  bn: "গ. সেবায় পরিবর্তন: সম্মত সেবায় কোন পরিবর্তন কোম্পানিকে আগেই জানাতে হবে এবং অনুমোদন নিতে হবে। অতিরিক্ত চার্জ প্রযোজ্য হতে পারে।"
},
clientResponsibilities: {
  en: "3. Client Responsibilities",
  hi: "3. ग्राहक की जिम्मेदारियां",
  kn: "3. ಗ್ರಾಹಕರ ಜವಾಬ್ದಾರಿಗಳು",
  bn: "৩. ক্লায়েন্টের দায়িত্ব"
},
clientResponsibilityA: {
  en: "a. Safe Environment: You agree to provide a safe, secure, and appropriate working environment for the Service Provider(s).",
  hi: "क. सुरक्षित वातावरण: आप सेवा प्रदाता(ओं) के लिए एक सुरक्षित और उचित कार्य वातावरण प्रदान करने के लिए सहमत हैं।",
  kn: "ಎ. ಸುರಕ್ಷಿತ ವಾತಾವರಣ: ಸೇವಾ ಒದಗಿಸುವವರಿಗೆ ಸುರಕ್ಷಿತ ಮತ್ತು ಸೂಕ್ತ ಕೆಲಸದ ವಾತಾವರಣವನ್ನು ಒದಗಿಸಲು ನೀವು ಒಪ್ಪುತ್ತೀರಿ.",
  bn: "ক. নিরাপদ পরিবেশ: আপনি সেবা প্রদানকারীর জন্য একটি নিরাপদ ও উপযুক্ত কাজের পরিবেশ প্রদানে সম্মত হন।"
},
clientResponsibilityB: {
  en: "b. Access: You must provide timely and unobstructed access to your premises at the agreed-upon service times.",
  hi: "ख. पहुंच: आपको सहमत सेवा समय पर अपने परिसर तक समय पर और निर्बाध पहुंच प्रदान करनी होगी।",
  kn: "ಬಿ. ಪ್ರವೇಶ: ಒಪ್ಪಿದ ಸೇವಾ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಆವರಣಕ್ಕೆ ಸಮಯೋಚಿತ ಮತ್ತು ಅಡಚಣೆಯಿಲ್ಲದ ಪ್ರವೇಶವನ್ನು ನೀವು ಒದಗಿಸಬೇಕು.",
  bn: "খ. প্রবেশাধিকার: সম্মত সেবা সময়ে আপনার প্রাঙ্গণে সময়মত ও বাধাহীন প্রবেশাধিকার প্রদান করতে হবে।"
},
clientResponsibilityC: {
  en: "c. Information Accuracy: You are responsible for providing accurate and complete information regarding your needs.",
  hi: "ग. जानकारी की सटीकता: आप अपनी आवश्यकताओं के बारे में सटीक और पूरी जानकारी प्रदान करने के लिए जिम्मेदार हैं।",
  kn: "ಸಿ. ಮಾಹಿತಿಯ ನಿಖರತೆ: ನಿಮ್ಮ ಅಗತ್ಯಗಳ ಬಗ್ಗೆ ನಿಖರ ಮತ್ತು ಸಂಪೂರ್ಣ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸುವ ಜವಾಬ್ದಾರಿ ನಿಮ್ಮ ಮೇಲಿದೆ.",
  bn: "গ. তথ্যের নির্ভুলতা: আপনার প্রয়োজন সম্পর্কে সঠিক ও সম্পূর্ণ তথ্য প্রদানের দায়িত্ব আপনার।"
},
clientResponsibilityD: {
  en: "d. Supervision (for Nannies): While our nannies are experienced professionals, the Client retains overall responsibility for the safety and well-being of their children.",
  hi: "घ. पर्यवेक्षण (आया के लिए): हालांकि हमारी आया अनुभवी पेशेवर हैं, ग्राहक अपने बच्चों की सुरक्षा और कल्याण की समग्र जिम्मेदारी बरकरार रखता है।",
  kn: "ಡಿ. ಮೇಲ್ವಿಚಾರಣೆ (ದಾದಿಯರಿಗೆ): ನಮ್ಮ ದಾದಿಯರು ಅನುಭವಿ ವೃತ್ತಿಪರರಾಗಿದ್ದರೂ, ಮಕ್ಕಳ ಸುರಕ್ಷತೆ ಮತ್ತು ಕ್ಷೇಮದ ಒಟ್ಟಾರೆ ಜವಾಬ್ದಾರಿಯನ್ನು ಗ್ರಾಹಕರು ಹೊಂದಿರುತ್ತಾರೆ.",
  bn: "ঘ. তত্ত্বাবধান (আয়ার জন্য): আমাদের আয়ারা অভিজ্ঞ পেশাদার হলেও, শিশুদের নিরাপত্তা ও কল্যাণের সামগ্রিক দায়িত্ব ক্লায়েন্টের উপর বর্তায়।"
},
clientResponsibilityE: {
  en: "e. Equipment & Supplies: Unless otherwise agreed, you are responsible for providing necessary cleaning supplies, equipment, and cooking ingredients.",
  hi: "ङ. उपकरण और आपूर्ति: जब तक अन्यथा सहमति न हो, आवश्यक सफाई आपूर्ति, उपकरण और खाना पकाने की सामग्री प्रदान करने के लिए आप जिम्मेदार हैं।",
  kn: "ಇ. ಉಪಕರಣಗಳು ಮತ್ತು ಸರಬರಾಜುಗಳು: ಬೇರೆ ರೀತಿಯಲ್ಲಿ ಒಪ್ಪದ ಹೊರತು, ಅಗತ್ಯ ಶುಚಿಗೊಳಿಸುವ ಸರಬರಾಜುಗಳು, ಉಪಕರಣಗಳು ಮತ್ತು ಅಡುಗೆ ಸಾಮಗ್ರಿಗಳನ್ನು ಒದಗಿಸುವ ಜವಾಬ್ದಾರಿ ನಿಮ್ಮ ಮೇಲಿದೆ.",
  bn: "ঙ. সরঞ্জাম ও সামগ্রী: অন্যথায় সম্মত না হলে, প্রয়োজনীয় পরিষ্কারের সামগ্রী, সরঞ্জাম এবং রান্নার উপকরণ প্রদানের দায়িত্ব আপনার।"
},
clientResponsibilityF: {
  en: "f. Direct Engagement Prohibition: You agree not to directly hire any Service Provider introduced to you by ServEaso for a period of 12 months from the last date of service.",
  hi: "च. प्रत्यक्ष अनुबंध निषेध: आप सेवा की अंतिम तिथि से 12 महीने की अवधि के लिए ServEaso द्वारा आपसे परिचित कराए गए किसी भी सेवा प्रदाता को सीधे काम पर नहीं रखने के लिए सहमत हैं।",
  kn: "ಎಫ್. ನೇರ ನೇಮಕಾತಿ ನಿಷೇಧ: ಸೇವೆಯ ಕೊನೆಯ ದಿನಾಂಕದಿಂದ 12 ತಿಂಗಳ ಅವಧಿಗೆ ServEaso ನಿಂದ ನಿಮಗೆ ಪರಿಚಯಿಸಲಾದ ಯಾವುದೇ ಸೇವಾ ಒದಗಿಸುವವರನ್ನು ನೇರವಾಗಿ ನೇಮಿಸಿಕೊಳ್ಳದಿರಲು ನೀವು ಒಪ್ಪುತ್ತೀರಿ.",
  bn: "চ. প্রত্যক্ষ নিয়োগ নিষেধাজ্ঞা: আপনি সেবার শেষ তারিখ থেকে ১২ মাসের জন্য ServEaso দ্বারা পরিচিত কোন সেবা প্রদানকারীকে সরাসরি নিয়োগ না করতে সম্মত হন।"
},
contactInformation: {
  en: "13. Contact Information",
  hi: "13. संपर्क जानकारी",
  kn: "13. ಸಂಪರ್ಕ ಮಾಹಿತಿ",
  bn: "১৩. যোগাযোগের তথ্য"
},
contactInfoMessage: {
  en: "For any questions or concerns regarding these Terms and Conditions or our services, please contact us at:",
  hi: "इन नियमों और शर्तों या हमारी सेवाओं के बारे में किसी भी प्रश्न या चिंता के लिए, कृपया हमसे यहां संपर्क करें:",
  kn: "ಈ ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು ಅಥವಾ ನಮ್ಮ ಸೇವೆಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ಕಾಳಜಿಗಳಿಗಾಗಿ, ದಯವಿಟ್ಟು ನಮ್ಮನ್ನು ಇಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ:",
  bn: "এই শর্তাবলী বা আমাদের সেবা সম্পর্কে কোন প্রশ্ন বা উদ্বেগের জন্য, অনুগ্রহ করে আমাদের এখানে যোগাযোগ করুন:"
},
tncCompanyName: {
  en: "ServEase Innovation Talent Tap",
  hi: "सर्वईज इनोवेशन टैलेंट टैप",
  kn: "ServEase ಇನ್ನೋವೇಶನ್ ಟ್ಯಾಲೆಂಟ್ ಟ್ಯಾಪ್",
  bn: "সার্ভইজ ইনোভেশন ট্যালেন্ট ট্যাপ"
},
tncCompanyAddress: {
  en: "#58 Sir MV Nagar, Ramamurthy Nagar, Bengaluru, Karnataka",
  hi: "#58 सर एमवी नगर, राममूर्ति नगर, बेंगलुरु, कर्नाटक",
  kn: "#58 ಸರ್ MV ನಗರ, ರಾಮಮೂರ್ತಿ ನಗರ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ",
  bn: "#৫৮ স্যার এমভি নগর, রামমূর্তি নগর, বেঙ্গালুরু, কর্ণাটক"
},
companyEmail: {
  en: "Email - support@serveasinnovation.com or support@serveaso.com",
  hi: "ईमेल - support@serveasinnovation.com या support@serveaso.com",
  kn: "ಇಮೇಲ್ - support@serveasinnovation.com ಅಥವಾ support@serveaso.com",
  bn: "ইমেল - support@serveasinnovation.com অথবা support@serveaso.com"
},
importantConsiderations: {
  en: "Important Considerations:",
  hi: "महत्वपूर्ण विचार:",
  kn: "ಪ್ರಮುಖ ಪರಿಗಣನೆಗಳು:",
  bn: "গুরুত্বপূর্ণ বিবেচনা:"
},
consideration1: {
  en: "Local Labor Laws: Extremely critical for employment status, working hours, rest breaks, and termination procedures.",
  hi: "स्थानीय श्रम कानून: रोजगार की स्थिति, काम के घंटे, आराम अवकाश और समाप्ति प्रक्रियाओं के लिए अत्यंत महत्वपूर्ण।",
  kn: "ಸ್ಥಳೀಯ ಕಾರ್ಮಿಕ ಕಾನೂನುಗಳು: ಉದ್ಯೋಗ ಸ್ಥಿತಿ, ಕೆಲಸದ ಸಮಯ, ವಿಶ್ರಾಂತಿ ವಿರಾಮಗಳು ಮತ್ತು ಸಮಾಪ್ತಿ ಕಾರ್ಯವಿಧಾನಗಳಿಗೆ ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ.",
  bn: "স্থানীয় শ্রম আইন: কর্মসংস্থানের অবস্থা, কাজের সময়, বিশ্রামের বিরতি এবং সমাপ্তি পদ্ধতির জন্য অত্যন্ত গুরুত্বপূর্ণ।"
},
consideration2: {
  en: "Consumer Protection Laws: Ensure fairness and transparency.",
  hi: "उपभोक्ता संरक्षण कानून: निष्पक्षता और पारदर्शिता सुनिश्चित करते हैं।",
  kn: "ಗ್ರಾಹಕ ಸಂರಕ್ಷಣಾ ಕಾನೂನುಗಳು: ನ್ಯಾಯಸಮ್ಮತತೆ ಮತ್ತು ಪಾರದರ್ಶಕತೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತವೆ.",
  bn: "ভোক্তা সুরক্ষা আইন: ন্যায্যতা ও স্বচ্ছতা নিশ্চিত করে।"
},
consideration3: {
  en: "Data Privacy Laws: If you collect any personal data, you'll need a privacy policy.",
  hi: "डेटा गोपनीयता कानून: यदि आप कोई व्यक्तिगत डेटा एकत्र करते हैं, तो आपको एक गोपनीयता नीति की आवश्यकता होगी।",
  kn: "ಡೇಟಾ ಗೌಪ್ಯತಾ ಕಾನೂನುಗಳು: ನೀವು ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಡೇಟಾವನ್ನು ಸಂಗ್ರಹಿಸಿದರೆ, ನಿಮಗೆ ಗೌಪ್ಯತಾ ನೀತಿಯ ಅಗತ್ಯವಿರುತ್ತದೆ.",
  bn: "তথ্য গোপনীয়তা আইন: আপনি যদি কোন ব্যক্তিগত তথ্য সংগ্রহ করেন, তাহলে আপনার একটি গোপনীয়তা নীতি প্রয়োজন হবে।"
},
consideration4: {
  en: "Specific Service Nuances for different types of service providers.",
  hi: "विभिन्न प्रकार के सेवा प्रदाताओं के लिए विशिष्ट सेवा बारीकियां।",
  kn: "ವಿವಿಧ ರೀತಿಯ ಸೇವಾ ಒದಗಿಸುವವರಿಗೆ ನಿರ್ದಿಷ್ಟ ಸೇವಾ ಸೂಕ್ಷ್ಮತೆಗಳು.",
  bn: "বিভিন্ন ধরণের সেবা প্রদানকারীর জন্য নির্দিষ্ট সেবা সূক্ষ্মতা।"
},
consideration5: {
  en: "Insurance Coverage: Ensure your insurance policies align with your liability clauses.",
  hi: "बीमा कवरेज: सुनिश्चित करें कि आपकी बीमा पॉलिसियां आपके दायित्व खंडों के अनुरूप हों।",
  kn: "ವಿಮಾ ರಕ್ಷಣೆ: ನಿಮ್ಮ ವಿಮಾ ಪಾಲಿಸಿಗಳು ನಿಮ್ಮ ಹೊಣೆಗಾರಿಕೆಯ ಷರತ್ತುಗಳೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತವೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
  bn: "বীমা কভারেজ: নিশ্চিত করুন আপনার বীমা পলিসিগুলি আপনার দায়বদ্ধতার ধারাগুলির সাথে সামঞ্জস্যপূর্ণ।"
},
consideration6: {
  en: "Dispute Resolution: Consider arbitration or mediation as alternatives to court.",
  hi: "विवाद समाधान: अदालत के विकल्प के रूप में मध्यस्थता या मध्यस्थता पर विचार करें।",
  kn: "ವಿವಾದ ಪರಿಹಾರ: ನ್ಯಾಯಾಲಯಕ್ಕೆ ಪರ್ಯಾಯವಾಗಿ ಮಧ್ಯಸ್ಥಿಕೆ ಅಥವಾ ಸಮಾಲೋಚನೆಯನ್ನು ಪರಿಗಣಿಸಿ.",
  bn: "বিরোধ নিষ্পত্তি: আদালতের বিকল্প হিসেবে সালিশি বা মধ্যস্থতা বিবেচনা করুন।"
},

// ============ PRIVACY POLICY TRANSLATIONS ============
effectiveDate: {
  en: "Effective Date: {date}",
  hi: "प्रभावी तिथि: {date}",
  kn: "ಜಾರಿಗೆ ಬರುವ ದಿನಾಂಕ: {date}",
  bn: "কার্যকর তারিখ: {date}"
},
privacyIntro: {
  en: "At ServEase Innovation Talent Tap, we are committed to protecting the privacy and personal data of our clients and service providers. This Privacy Statement explains how we collect, use, disclose, and protect your personal information when you use our maid, nanny, and cook services.",
  hi: "सर्वईज इनोवेशन टैलेंट टैप में, हम अपने ग्राहकों और सेवा प्रदाताओं की गोपनीयता और व्यक्तिगत डेटा की सुरक्षा के लिए प्रतिबद्ध हैं। यह गोपनीयता विवरण बताता है कि जब आप हमारी नौकरानी, आया और रसोइया सेवाओं का उपयोग करते हैं तो हम आपकी व्यक्तिगत जानकारी कैसे एकत्र, उपयोग, खुलासा और सुरक्षित करते हैं।",
  kn: "ServEase ಇನ್ನೋವೇಶನ್ ಟ್ಯಾಲೆಂಟ್ ಟ್ಯಾಪ್ ನಲ್ಲಿ, ನಾವು ನಮ್ಮ ಗ್ರಾಹಕರು ಮತ್ತು ಸೇವಾ ಒದಗಿಸುವವರ ಗೌಪ್ಯತೆ ಮತ್ತು ವೈಯಕ್ತಿಕ ಡೇಟಾವನ್ನು ರಕ್ಷಿಸಲು ಬದ್ಧರಾಗಿದ್ದೇವೆ. ನಮ್ಮ ಮನೆಕೆಲಸದವರು, ದಾದಿ ಮತ್ತು ಅಡುಗೆಯವರ ಸೇವೆಗಳನ್ನು ನೀವು ಬಳಸುವಾಗ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ನಾವು ಹೇಗೆ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ, ಬಳಸುತ್ತೇವೆ, ಬಹಿರಂಗಪಡಿಸುತ್ತೇವೆ ಮತ್ತು ರಕ್ಷಿಸುತ್ತೇವೆ ಎಂಬುದನ್ನು ಈ ಗೌಪ್ಯತಾ ಹೇಳಿಕೆ ವಿವರಿಸುತ್ತದೆ.",
  bn: "সার্ভইজ ইনোভেশন ট্যালেন্ট ট্যাপ-এ, আমরা আমাদের ক্লায়েন্ট এবং সেবা প্রদানকারীদের গোপনীয়তা এবং ব্যক্তিগত তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা বিবৃতি ব্যাখ্যা করে যে আপনি আমাদের গৃহকর্মী, আয়া এবং রাঁধুনি সেবা ব্যবহার করার সময় আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, প্রকাশ এবং সুরক্ষা করি।"
},
whoWeAre: {
  en: "1. Who We Are",
  hi: "1. हम कौन हैं",
  kn: "1. ನಾವು ಯಾರು",
  bn: "১. আমরা কারা"
},
whoWeAreDesc: {
  en: "ServEase Innovation Talent Tap is a service provider based in Karnataka, India, specializing in connecting clients with qualified household service professionals.",
  hi: "सर्वईज इनोवेशन टैलेंट टैप कर्नाटक, भारत में स्थित एक सेवा प्रदाता है, जो ग्राहकों को योग्य घरेलू सेवा पेशेवरों से जोड़ने में विशेषज्ञता रखता है।",
  kn: "ServEase ಇನ್ನೋವೇಶನ್ ಟ್ಯಾಲೆಂಟ್ ಟ್ಯಾಪ್ ಕರ್ನಾಟಕ, ಭಾರತದಲ್ಲಿ ನೆಲೆಗೊಂಡಿರುವ ಸೇವಾ ಒದಗಿಸುವವರಾಗಿದ್ದು, ಗ್ರಾಹಕರನ್ನು ಅರ್ಹ ಗೃಹ ಸೇವಾ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವಲ್ಲಿ ಪರಿಣತಿ ಹೊಂದಿದೆ.",
  bn: "সার্ভইজ ইনোভেশন ট্যালেন্ট ট্যাপ কর্ণাটক, ভারতে অবস্থিত একটি সেবা প্রদানকারী, যা গ্রাহকদের যোগ্য গৃহস্থালি সেবা পেশাজীবীদের সাথে সংযুক্ত করতে বিশেষজ্ঞ।"
},
infoWeCollect: {
  en: "2. Information We Collect",
  hi: "2. हम कौन सी जानकारी एकत्र करते हैं",
  kn: "2. ನಾವು ಸಂಗ್ರಹಿಸುವ ಮಾಹಿತಿ",
  bn: "২. আমরা কী তথ্য সংগ্রহ করি"
},
infoWeCollectDesc: {
  en: "We collect various types of information to provide and improve our services to you. This may include:",
  hi: "हम आपको हमारी सेवाएं प्रदान करने और सुधारने के लिए विभिन्न प्रकार की जानकारी एकत्र करते हैं। इसमें शामिल हो सकता है:",
  kn: "ನಿಮಗೆ ನಮ್ಮ ಸೇವೆಗಳನ್ನು ಒದಗಿಸಲು ಮತ್ತು ಸುಧಾರಿಸಲು ನಾವು ವಿವಿಧ ರೀತಿಯ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ. ಇದು ಒಳಗೊಂಡಿರಬಹುದು:",
  bn: "আমাদের সেবা প্রদান এবং উন্নত করার জন্য আমরা বিভিন্ন ধরণের তথ্য সংগ্রহ করি। এর মধ্যে অন্তর্ভুক্ত থাকতে পারে:"
},
infoYouProvide: {
  en: "a. Information You Provide Directly:",
  hi: "क. आप सीधे जो जानकारी प्रदान करते हैं:",
  kn: "ಎ. ನೀವು ನೇರವಾಗಿ ಒದಗಿಸುವ ಮಾಹಿತಿ:",
  bn: "ক. আপনি সরাসরি যে তথ্য প্রদান করেন:"
},
servicePreferences: {
  en: "Service Preferences: Details about the type of service required (maid, nanny, cook), frequency, schedule, specific tasks, special instructions.",
  hi: "सेवा प्राथमिकताएं: आवश्यक सेवा के प्रकार (नौकरानी, आया, रसोइया), आवृत्ति, कार्यक्रम, विशिष्ट कार्य, विशेष निर्देशों के बारे में विवरण।",
  kn: "ಸೇವಾ ಆದ್ಯತೆಗಳು: ಅಗತ್ಯವಿರುವ ಸೇವೆಯ ಪ್ರಕಾರ (ಮನೆಕೆಲಸದವರು, ದಾದಿ, ಅಡುಗೆಯವರು), ಆವರ್ತನ, ವೇಳಾಪಟ್ಟಿ, ನಿರ್ದಿಷ್ಟ ಕಾರ್ಯಗಳು, ವಿಶೇಷ ಸೂಚನೆಗಳ ಕುರಿತು ವಿವರಗಳು.",
  bn: "সেবা পছন্দ: প্রয়োজনীয় সেবার ধরন (গৃহকর্মী, আয়া, রাঁধুনি), ফ্রিকোয়েন্সি, সময়সূচী, নির্দিষ্ট কাজ, বিশেষ নির্দেশনা সম্পর্কে বিবরণ।"
},
householdInformation: {
  en: "Household Information: Number of children, pets, size of residence, specific areas to be serviced.",
  hi: "घरेलू जानकारी: बच्चों की संख्या, पालतू जानवर, निवास का आकार, सेवा किए जाने वाले विशिष्ट क्षेत्र।",
  kn: "ಮನೆಯ ಮಾಹಿತಿ: ಮಕ್ಕಳ ಸಂಖ್ಯೆ, ಸಾಕುಪ್ರಾಣಿಗಳು, ವಸತಿ ಗಾತ್ರ, ಸೇವೆ ಮಾಡಬೇಕಾದ ನಿರ್ದಿಷ್ಟ ಪ್ರದೇಶಗಳು.",
  bn: "গৃহস্থালি তথ্য: শিশুর সংখ্যা, পোষা প্রাণী, বাসস্থানের আকার, সেবা দেওয়ার নির্দিষ্ট এলাকা।"
},
paymentInformation: {
  en: "Payment Information: Billing address, UPI, credit/debit card details (processed securely via third-party payment processors).",
  hi: "भुगतान जानकारी: बिलिंग पता, यूपीआई, क्रेडिट/डेबिट कार्ड विवरण (तृतीय-पक्ष भुगतान प्रोसेसर के माध्यम से सुरक्षित रूप से संसाधित)।",
  kn: "ಪಾವತಿ ಮಾಹಿತಿ: ಬಿಲ್ಲಿಂಗ್ ವಿಳಾಸ, UPI, ಕ್ರೆಡಿಟ್/ಡೆಬಿಟ್ ಕಾರ್ಡ್ ವಿವರಗಳು (ಮೂರನೇ-ವ್ಯಕ್ತಿ ಪಾವತಿ ಪ್ರೊಸೆಸರ್ಗಳ ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ).",
  bn: "পেমেন্ট তথ্য: বিলিং ঠিকানা, ইউপিআই, ক্রেডিট/ডেবিট কার্ডের বিবরণ (তৃতীয়-পক্ষের পেমেন্ট প্রসেসরের মাধ্যমে নিরাপদে প্রক্রিয়াকৃত)।"
},
identificationForProviders: {
  en: "Identification (for Service Providers): Aadhar Card, passport details, work permits, educational qualifications, previous employment history.",
  hi: "पहचान (सेवा प्रदाताओं के लिए): आधार कार्ड, पासपोर्ट विवरण, कार्य परमिट, शैक्षिक योग्यता, पिछला रोजगार इतिहास।",
  kn: "ಗುರುತಿನ (ಸೇವಾ ಒದಗಿಸುವವರಿಗೆ): ಆಧಾರ್ ಕಾರ್ಡ್, ಪಾಸ್‌ಪೋರ್ಟ್ ವಿವರಗಳು, ಕೆಲಸದ ಅನುಮತಿಗಳು, ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆಗಳು, ಹಿಂದಿನ ಉದ್ಯೋಗ ಇತಿಹಾಸ.",
  bn: "পরিচয় (সেবা প্রদানকারীদের জন্য): আধার কার্ড, পাসপোর্টের বিবরণ, কাজের অনুমতি, শিক্ষাগত যোগ্যতা, পূর্ববর্তী কর্মসংস্থানের ইতিহাস।"
},
communicationContent: {
  en: "Communication Content: Information you provide when communicating with us via phone, email, or messaging apps.",
  hi: "संचार सामग्री: जब आप फोन, ईमेल या मैसेजिंग ऐप के माध्यम से हमसे संवाद करते हैं तो आपके द्वारा प्रदान की गई जानकारी।",
  kn: "ಸಂವಹನ ವಿಷಯ: ಫೋನ್, ಇಮೇಲ್ ಅಥವಾ ಮೆಸೇಜಿಂಗ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಳ ಮೂಲಕ ನೀವು ನಮ್ಮೊಂದಿಗೆ ಸಂವಹನ ನಡೆಸುವಾಗ ಒದಗಿಸುವ ಮಾಹಿತಿ.",
  bn: "যোগাযোগের বিষয়বস্তু: ফোন, ইমেল বা মেসেজিং অ্যাপের মাধ্যমে আমাদের সাথে যোগাযোগ করার সময় আপনি যে তথ্য প্রদান করেন।"
},
autoCollectedInfo: {
  en: "b. Information We Collect Automatically:",
  hi: "ख. हम स्वचालित रूप से कौन सी जानकारी एकत्र करते हैं:",
  kn: "ಬಿ. ನಾವು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಂಗ್ರಹಿಸುವ ಮಾಹಿತಿ:",
  bn: "খ. আমরা স্বয়ংক্রিয়ভাবে যে তথ্য সংগ্রহ করি:"
},
usageData: {
  en: "Usage Data: Information about how you interact with our website or mobile application.",
  hi: "उपयोग डेटा: आप हमारी वेबसाइट या मोबाइल एप्लिकेशन के साथ कैसे इंटरैक्ट करते हैं, इसके बारे में जानकारी।",
  kn: "ಬಳಕೆಯ ಡೇಟಾ: ನೀವು ನಮ್ಮ ವೆಬ್‌ಸೈಟ್ ಅಥವಾ ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್‌ನೊಂದಿಗೆ ಹೇಗೆ ಸಂವಹನ ನಡೆಸುತ್ತೀರಿ ಎಂಬುದರ ಕುರಿತು ಮಾಹಿತಿ.",
  bn: "ব্যবহারের তথ্য: আপনি আমাদের ওয়েবসাইট বা মোবাইল অ্যাপ্লিকেশনের সাথে কীভাবে ইন্টারঅ্যাক্ট করেন সে সম্পর্কে তথ্য।"
},
technicalData: {
  en: "Technical Data: IP address, browser type, operating system, device identifiers.",
  hi: "तकनीकी डेटा: आईपी पता, ब्राउज़र प्रकार, ऑपरेटिंग सिस्टम, डिवाइस पहचानकर्ता।",
  kn: "ತಾಂತ್ರಿಕ ಡೇಟಾ: IP ವಿಳಾಸ, ಬ್ರೌಸರ್ ಪ್ರಕಾರ, ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಮ್, ಸಾಧನ ಗುರುತಿಸುವಿಕೆಗಳು.",
  bn: "প্রযুক্তিগত তথ্য: আইপি ঠিকানা, ব্রাউজারের ধরন, অপারেটিং সিস্টেম, ডিভাইস শনাক্তকারী।"
},
cookiesAndTracking: {
  en: "Cookies and Tracking Technologies: We may use cookies and similar technologies to enhance your experience.",
  hi: "कुकीज़ और ट्रैकिंग प्रौद्योगिकियां: आपके अनुभव को बेहतर बनाने के लिए हम कुकीज़ और समान तकनीकों का उपयोग कर सकते हैं।",
  kn: "ಕುಕೀಗಳು ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್ ತಂತ್ರಜ್ಞಾನಗಳು: ನಿಮ್ಮ ಅನುಭವವನ್ನು ಹೆಚ್ಚಿಸಲು ನಾವು ಕುಕೀಗಳು ಮತ್ತು ಇದೇ ತಂತ್ರಜ್ಞಾನಗಳನ್ನು ಬಳಸಬಹುದು.",
  bn: "কুকিজ এবং ট্র্যাকিং প্রযুক্তি: আপনার অভিজ্ঞতা উন্নত করতে আমরা কুকিজ এবং অনুরূপ প্রযুক্তি ব্যবহার করতে পারি।"
},
privacyContactDesc: {
  en: "If you have any questions or concerns about this Privacy Statement or our data practices, please contact us at:",
  hi: "यदि आपके पास इस गोपनीयता विवरण या हमारी डेटा प्रथाओं के बारे में कोई प्रश्न या चिंता है, तो कृपया हमसे यहां संपर्क करें:",
  kn: "ಈ ಗೌಪ್ಯತಾ ಹೇಳಿಕೆ ಅಥವಾ ನಮ್ಮ ಡೇಟಾ ಅಭ್ಯಾಸಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ಕಾಳಜಿಗಳಿದ್ದರೆ, ದಯವಿಟ್ಟು ನಮ್ಮನ್ನು ಇಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ:",
  bn: "এই গোপনীয়তা বিবৃতি বা আমাদের তথ্য অনুশীলন সম্পর্কে আপনার কোন প্রশ্ন বা উদ্বেগ থাকলে, অনুগ্রহ করে আমাদের এখানে যোগাযোগ করুন:"
},
privacyNote: {
  en: "Important Note: This should be reviewed and customized by a legal professional to ensure full compliance with India's data protection laws.",
  hi: "महत्वपूर्ण नोट: भारत के डेटा संरक्षण कानूनों का पूर्ण अनुपालन सुनिश्चित करने के लिए इसकी समीक्षा और अनुकूलन किसी कानूनी पेशेवर द्वारा किया जाना चाहिए।",
  kn: "ಪ್ರಮುಖ ಟಿಪ್ಪಣಿ: ಭಾರತದ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಕಾನೂನುಗಳೊಂದಿಗೆ ಸಂಪೂರ್ಣ ಅನುಸರಣೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಇದನ್ನು ಕಾನೂನು ವೃತ್ತಿಪರರಿಂದ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಗ್ರಾಹಕೀಕರಿಸಬೇಕು.",
  bn: "গুরুত্বপূর্ণ নোট: ভারতের তথ্য সুরক্ষা আইনের সাথে সম্পূর্ণ সম্মতি নিশ্চিত করতে এটি একজন আইনী পেশাদার দ্বারা পর্যালোচনা এবং কাস্টমাইজ করা উচিত।"
},
  // ============ END PRIVACY POLICY TRANSLATIONS ============


// ============ CUSTOMER PROFILE SECTION TRANSLATIONS ============
myAccount: {
  en: "My account",
  hi: "मेरा खाता",
  kn: "ನನ್ನ ಖಾತೆ",
  bn: "আমার অ্যাকাউন্ট"
},
edit: {
  en: "Edit",
  hi: "संपादित करें",
  kn: "ಸಂಪಾದಿಸಿ",
  bn: "সম্পাদনা"
},
userInformation: {
  en: "User Information",
  hi: "उपयोगकर्ता जानकारी",
  kn: "ಬಳಕೆದಾರರ ಮಾಹಿತಿ",
  bn: "ব্যবহারকারীর তথ্য"
},
/** Use in account/profile; `contactInformation` is reserved for T&Cs (numbered sections). */
profileContactInformation: {
  en: "Contact information",
  hi: "संपर्क जानकारी",
  kn: "ಸಂಪರ್ಕ ಮಾಹಿತಿ",
  bn: "যোগাযোগের তথ্য"
},

noEmailAvailable: {
  en: "No email available",
  hi: "कोई ईमेल उपलब्ध नहीं",
  kn: "ಇಮೇಲ್ ಲಭ್ಯವಿಲ್ಲ",
  bn: "কোন ইমেল উপলব্ধ নেই"
},
userId: {
  en: "User ID",
  hi: "उपयोगकर्ता आईडी",
  kn: "ಬಳಕೆದಾರ ID",
  bn: "ব্যবহারকারী আইডি"
},
firstName: {
  en: "First name",
  hi: "पहला नाम",
  kn: "ಮೊದಲ ಹೆಸರು",
  bn: "প্রথম নাম"
},
lastName: {
  en: "Last name",
  hi: "अंतिम नाम",
  kn: "ಕೊನೆಯ ಹೆಸರು",
  bn: "শেষ নাম"
},
contactNumber: {
  en: "Contact Number",
  hi: "संपर्क नंबर",
  kn: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ",
  bn: "যোগাযোগ নম্বর"
},
verified: {
  en: "Verified",
  hi: "सत्यापित",
  kn: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
  bn: "যাচাইকৃত"
},
required: {
  en: "Required",
  hi: "आवश्यक",
  kn: "ಅಗತ್ಯವಿದೆ",
  bn: "প্রয়োজনীয়"
},
enter10DigitNumber: {
  en: "Enter 10-digit number",
  hi: "10-अंकीय संख्या दर्ज करें",
  kn: "10-ಅಂಕಿಯ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
  bn: "১০-অঙ্কের নম্বর লিখুন"
},
mobileNumberRequired: {
  en: "Mobile number is required for bookings",
  hi: "बुकिंग के लिए मोबाइल नंबर आवश्यक है",
  kn: "ಬುಕಿಂಗ್‌ಗೆ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿದೆ",
  bn: "বুকিংয়ের জন্য মোবাইল নম্বর প্রয়োজন"
},
alternativeContactNumber: {
  en: "Alternative Contact Number",
  hi: "वैकल्पिक संपर्क नंबर",
  kn: "ಪರ್ಯಾಯ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ",
  bn: "বিকল্প যোগাযোগ নম্বর"
},
alternate: {
  en: "Alternate",
  hi: "वैकल्पिक",
  kn: "ಪರ್ಯಾಯ",
  bn: "বিকল্প"
},
mobile: {
  en: "Mobile",
  hi: "मोबाइल",
  kn: "ಮೊಬೈಲ್",
  bn: "মোবাইল"
},
numberAlreadyRegistered: {
  en: "number is already registered",
  hi: "नंबर पहले से पंजीकृत है",
  kn: "ಸಂಖ್ಯೆ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ",
  bn: "নম্বরটি আগে থেকেই নিবন্ধিত"
},
errorCheckingNumber: {
  en: "Error checking number",
  hi: "नंबर जांचने में त्रुटि",
  kn: "ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸುವಲ್ಲಿ ದೋಷ",
  bn: "নম্বর পরীক্ষা করতে ত্রুটি"
},
alternateNumberCannotBeSame: {
  en: "Alternate number cannot be same as contact number",
  hi: "वैकल्पिक नंबर संपर्क नंबर के समान नहीं हो सकता",
  kn: "ಪರ್ಯಾಯ ಸಂಖ್ಯೆಯು ಸಂಪರ್ಕ ಸಂಖ್ಯೆಯಂತೆ ಇರುವಂತಿಲ್ಲ",
  bn: "বিকল্প নম্বর যোগাযোগ নম্বরের মতো একই হতে পারে না"
},
addresses: {
  en: "Addresses",
  hi: "पते",
  kn: "ವಿಳಾಸಗಳು",
  bn: "ঠিকানাসমূহ"
},
addNewAddress: {
  en: "Add New Address",
  hi: "नया पता जोड़ें",
  kn: "ಹೊಸ ವಿಳಾಸ ಸೇರಿಸಿ",
  bn: "নতুন ঠিকানা যোগ করুন"
},
work: {
  en: "Work",
  hi: "कार्यालय",
  kn: "ಕೆಲಸ",
  bn: "অফিস"
},
locationName: {
  en: "Location Name",
  hi: "स्थान का नाम",
  kn: "ಸ್ಥಳದ ಹೆಸರು",
  bn: "অবস্থানের নাম"
},
streetAddress: {
  en: "Street Address",
  hi: "गली का पता",
  kn: "ರಸ್ತೆ ವಿಳಾಸ",
  bn: "রাস্তার ঠিকানা"
},
city: {
  en: "City",
  hi: "शहर",
  kn: "ನಗರ",
  bn: "শহর"
},
country: {
  en: "Country",
  hi: "देश",
  kn: "ದೇಶ",
  bn: "দেশ"
},
postalCode: {
  en: "Postal Code",
  hi: "पिन कोड",
  kn: "ಪಿನ್ ಕೋಡ್",
  bn: "পোস্টাল কোড"
},
saveAddress: {
  en: "Save Address",
  hi: "पता सहेजें",
  kn: "ವಿಳಾಸ ಉಳಿಸಿ",
  bn: "ঠিকানা সংরক্ষণ করুন"
},
noAddressesSaved: {
  en: "No addresses saved yet",
  hi: "अभी तक कोई पता सहेजा नहीं गया",
  kn: "ಇನ್ನೂ ಯಾವುದೇ ವಿಳಾಸಗಳನ್ನು ಉಳಿಸಲಾಗಿಲ್ಲ",
  bn: "এখনও কোন ঠিকানা সংরক্ষিত হয়নি"
},
fillAllAddressFields: {
  en: "Please fill in all address fields",
  hi: "कृपया सभी पता फ़ील्ड भरें",
  kn: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿಳಾಸ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
  bn: "অনুগ্রহ করে সমস্ত ঠিকানা ক্ষেত্র পূরণ করুন"
},
addressSaveError: {
  en: "Could not save address. Try again.",
  hi: "पता सहेजा नहीं जा सका। पुनः प्रयास करें।",
  kn: "ವಿಳಾಸವನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  bn: "ঠিকানা সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"
},
addressRemoveError: {
  en: "Could not remove address. Try again.",
  hi: "पता हटाया नहीं जा सका। पुनः प्रयास करें।",
  kn: "ವಿಳಾಸವನ್ನು ತೆಗೆದುಹಾಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  bn: "ঠিকানা সরানো যায়নি। আবার চেষ্টা করুন।"
},
contactNumbersMustBeDifferent: {
  en: "Contact number and alternate contact number must be different",
  hi: "संपर्क नंबर और वैकल्पिक संपर्क नंबर अलग-अलग होने चाहिए",
  kn: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ ಮತ್ತು ಪರ್ಯಾಯ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ ವಿಭಿನ್ನವಾಗಿರಬೇಕು",
  bn: "যোগাযোগ নম্বর এবং বিকল্প যোগাযোগ নম্বর ভিন্ন হতে হবে"
},
saveFailed: {
  en: "Failed to save changes. Please try again.",
  hi: "परिवर्तन सहेजने में विफल। कृपया पुनः प्रयास करें।",
  kn: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  bn: "পরিবর্তন সংরক্ষণ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
},
saveChanges: {
  en: "Save Changes",
  hi: "परिवर्तन सहेजें",
  kn: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
  bn: "পরিবর্তন সংরক্ষণ করুন"
},
// ============ END CUSTOMER PROFILE SECTION TRANSLATIONS ============

// Add these to your translations object in LanguageContext.tsx

// ============ PROFILE SCREEN TRANSLATIONS ============
customer: {
  en: "Customer",
  hi: "ग्राहक",
  kn: "ಗ್ರಾಹಕ",
  bn: "গ্রাহক"
},
serviceProvider: {
  en: "Service Provider",
  hi: "सेवा प्रदाता",
  kn: "ಸೇವಾ ಒದಗಿಸುವವರು",
  bn: "সেবা প্রদানকারী"
},
vendor: {
  en: "Vendor",
  hi: "विक्रेता",
  kn: "ಮಾರಾಟಗಾರ",
  bn: "বিক্রেতা"
},
user: {
  en: "User",
  hi: "उपयोगकर्ता",
  kn: "ಬಳಕೆದಾರ",
  bn: "ব্যবহারকারী"
},
hello: {
  en: "Hello",
  hi: "नमस्ते",
  kn: "ನಮಸ್ಕಾರ",
  bn: "হ্যালো"
},
addMobileNumber: {
  en: "Add Mobile Number",
  hi: "मोबाइल नंबर जोड़ें",
  kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಸೇರಿಸಿ",
  bn: "মোবাইল নম্বর যোগ করুন"
},
vendorId: {
  en: "Vendor ID",
  hi: "विक्रेता आईडी",
  kn: "ಮಾರಾಟಗಾರ ID",
  bn: "বিক্রেতা আইডি"
},
allRightsReserved: {
  en: "All rights reserved.",
  hi: "सर्वाधिकार सुरक्षित।",
  kn: "ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
  bn: "সর্বস্বত্ব সংরক্ষিত।"
},
// ============ END PROFILE SCREEN TRANSLATIONS ============

// ============ UserProfile TRANSLATIONS ============
account: {
  en: "Account",
  hi: "खाता",
  kn: "ಖಾತೆ",
  bn: "অ্যাকাউন্ট"
},
locationDetails: {
  en: "Location Details",
  hi: "स्थान विवरण",
  kn: "ಸ್ಥಳ ವಿವರಗಳು",
  bn: "অবস্থানের বিবরণ"
},
aadhaarCardNumber: {
  en: "Aadhaar Card Number",
  hi: "आधार कार्ड नंबर",
  kn: "ಆಧಾರ್ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ",
  bn: "আধার কার্ড নম্বর"
},
housekeepingRole: {
  en: "Housekeeping Role",
  hi: "गृह व्यवस्था भूमिका",
  kn: "ಮನೆಕೆಲಸದ ಪಾತ್ರ",
  bn: "গৃহস্থালি ভূমিকা"
},
changesSaved: {
  en: "Form data updated successfully!",
  hi: "फॉर्म डेटा सफलतापूर्वक अपडेट किया गया!",
  kn: "ಫಾರ್ಮ್ ಡೇಟಾವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!",
  bn: "ফর্ম ডেটা সফলভাবে আপডেট করা হয়েছে!"
},
// ============ END UserProfile TRANSLATIONS ============
// ============ WALLET TRANSLATIONS ============
myWallet: {
  en: "My Wallet",
  hi: "मेरा वॉलेट",
  kn: "ನನ್ನ ವ್ಯಾಲೆಟ್",
  bn: "আমার ওয়ালেট"
},
loadingWallet: {
  en: "Loading Wallet",
  hi: "वॉलेट लोड हो रहा है",
  kn: "ವ್ಯಾಲೆಟ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ",
  bn: "ওয়ালেট লোড হচ্ছে"
},
retrievingAccountInfo: {
  en: "Retrieving your account information",
  hi: "आपकी खाता जानकारी प्राप्त की जा रही है",
  kn: "ನಿಮ್ಮ ಖಾತೆ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ",
  bn: "আপনার অ্যাকাউন্টের তথ্য সংগ্রহ করা হচ্ছে"
},
noWalletFound: {
  en: "No wallet account found",
  hi: "कोई वॉलेट खाता नहीं मिला",
  kn: "ಯಾವುದೇ ವ್ಯಾಲೆಟ್ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ",
  bn: "কোন ওয়ালেট অ্যাকাউন্ট পাওয়া যায়নি"
},
noWalletMessage: {
  en: "We couldn't find a wallet associated with your account.",
  hi: "हमें आपके खाते से जुड़ा कोई वॉलेट नहीं मिला।",
  kn: "ನಿಮ್ಮ ಖಾತೆಯೊಂದಿಗೆ ಸಂಯೋಜಿತವಾದ ವ್ಯಾಲೆಟ್ ಅನ್ನು ನಾವು ಕಂಡುಹಿಡಿಯಲಾಗಲಿಲ್ಲ.",
  bn: "আমরা আপনার অ্যাকাউন্টের সাথে সংযুক্ত কোন ওয়ালেট খুঁজে পাইনি।"
},
tryAgain: {
  en: "Try Again",
  hi: "पुनः प्रयास करें",
  kn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
  bn: "আবার চেষ্টা করুন"
},
currentBalance: {
  en: "Current Balance",
  hi: "वर्तमान शेष",
  kn: "ಪ್ರಸ್ತುತ ಬಾಕಿ",
  bn: "বর্তমান ব্যালেন্স"
},
addMoney: {
  en: "Add Money",
  hi: "पैसे जोड़ें",
  kn: "ಹಣ ಸೇರಿಸಿ",
  bn: "টাকা যোগ করুন"
},
transfer: {
  en: "Transfer",
  hi: "स्थानांतरण",
  kn: "ವರ್ಗಾಯಿಸಿ",
  bn: "স্থানান্তর"
},
transactions: {
  en: "Transactions",
  hi: "लेन-देन",
  kn: "ವಹಿವಾಟುಗಳು",
  bn: "লেনদেন"
},
rewards: {
  en: "Rewards",
  hi: "पुरस्कार",
  kn: "ಬಹುಮಾನಗಳು",
  bn: "পুরস্কার"
},
recentTransactions: {
  en: "Recent Transactions",
  hi: "हाल के लेन-देन",
  kn: "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು",
  bn: "সাম্প্রতিক লেনদেন"
},
yourRewards: {
  en: "Your Rewards",
  hi: "आपके पुरस्कार",
  kn: "ನಿಮ್ಮ ಬಹುಮಾನಗಳು",
  bn: "আপনার পুরস্কার"
},
points: {
  en: "Points",
  hi: "अंक",
  kn: "ಅಂಕಗಳು",
  bn: "পয়েন্ট"
},
earnMorePoints: {
  en: "Earn more points by completing services and referring friends",
  hi: "सेवाएं पूरी करके और दोस्तों को रेफर करके अधिक अंक अर्जित करें",
  kn: "ಸೇವೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸುವ ಮೂಲಕ ಮತ್ತು ಸ್ನೇಹಿತರನ್ನು ಉಲ್ಲೇಖಿಸುವ ಮೂಲಕ ಹೆಚ್ಚಿನ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ",
  bn: "সেবা সম্পন্ন করে এবং বন্ধুদের রেফার করে আরও পয়েন্ট অর্জন করুন"
},
viewRewardsCatalog: {
  en: "View Rewards Catalog",
  hi: "पुरस्कार सूची देखें",
  kn: "ಬಹುಮಾನಗಳ ಕ್ಯಾಟಲಾಗ್ ವೀಕ್ಷಿಸಿ",
  bn: "পুরস্কার ক্যাটালগ দেখুন"
},
// ============ END WALLET TRANSLATIONS ============
// ============ VACATIONMANAGEMENT TRANSLATIONS ============

modifyVacation: {
  en: "Modify Vacation",
  hi: "अवकाश संशोधित करें",
  kn: "ರಜೆಯನ್ನು ಮಾರ್ಪಡಿಸಿ",
  bn: "ছুটি পরিবর্তন করুন"
},
currentVacationPeriod: {
  en: "Current Vacation Period",
  hi: "वर्तमान अवकाश अवधि",
  kn: "ಪ್ರಸ್ತುತ ರಜೆಯ ಅವಧಿ",
  bn: "বর্তমান ছুটির সময়কাল"
},
to: {
  en: "to",
  hi: "से",
  kn: "ರಿಂದ",
  bn: "থেকে"
},
updateVacationDates: {
  en: "Update Vacation Dates",
  hi: "अवकाश तिथियां अपडेट करें",
  kn: "ರಜೆಯ ದಿನಾಂಕಗಳನ್ನು ನವೀಕರಿಸಿ",
  bn: "ছুটির তারিখ আপডেট করুন"
},
endDate: {
  en: "End Date",
  hi: "समाप्ति तिथि",
  kn: "ಅಂತಿಮ ದಿನಾಂಕ",
  bn: "শেষ তারিখ"
},
selectStartDate: {
  en: "Select start date",
  hi: "प्रारंभ तिथि चुनें",
  kn: "ಪ್ರಾರಂಭ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  bn: "শুরুর তারিখ নির্বাচন করুন"
},
selectEndDate: {
  en: "Select end date",
  hi: "समाप्ति तिथि चुनें",
  kn: "ಅಂತಿಮ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  bn: "শেষ তারিখ নির্বাচন করুন"
},
dateInformation: {
  en: "Date Information",
  hi: "तिथि जानकारी",
  kn: "ದಿನಾಂಕ ಮಾಹಿತಿ",
  bn: "তারিখের তথ্য"
},
start: {
  en: "Start",
  hi: "प्रारंभ",
  kn: "ಪ್ರಾರಂಭ",
  bn: "শুরু"
},
end: {
  en: "End",
  hi: "समाप्ति",
  kn: "ಅಂತ್ಯ",
  bn: "শেষ"
},
totalDays: {
  en: "Total days",
  hi: "कुल दिन",
  kn: "ಒಟ್ಟು ದಿನಗಳು",
  bn: "মোট দিন"
},
minimumDaysRequired: {
  en: "Minimum 10 days required",
  hi: "न्यूनतम 10 दिन आवश्यक",
  kn: "ಕನಿಷ್ಠ 10 ದಿನಗಳ ಅಗತ್ಯವಿದೆ",
  bn: "সর্বনিম্ন ১০ দিন প্রয়োজন"
},
minimumVacationNote: {
  en: "Note: Minimum 10 days vacation required. Select end date on or after",
  hi: "नोट: न्यूनतम 10 दिन की छुट्टी आवश्यक है। समाप्ति तिथि इस तिथि या बाद में चुनें",
  kn: "ಸೂಚನೆ: ಕನಿಷ್ಠ 10 ದಿನಗಳ ರಜೆ ಅಗತ್ಯವಿದೆ. ಅಂತಿಮ ದಿನಾಂಕವನ್ನು ಈ ದಿನಾಂಕ ಅಥವಾ ನಂತರ ಆಯ್ಕೆಮಾಡಿ",
  bn: "দ্রষ্টব্য: সর্বনিম্ন ১০ দিনের ছুটি প্রয়োজন। শেষ তারিখ এই তারিখ বা তার পরে নির্বাচন করুন"
},
vacationPolicy: {
  en: "Vacation Policy",
  hi: "अवकाश नीति",
  kn: "ರಜಾ ನೀತಿ",
  bn: "ছুটির নীতি"
},
minimumVacationPeriod: {
  en: "Minimum vacation period",
  hi: "न्यूनतम अवकाश अवधि",
  kn: "ಕನಿಷ್ಠ ರಜೆಯ ಅವಧಿ",
  bn: "সর্বনিম্ন ছুটির সময়কাল"
},
vacationPauseMessage: {
  en: "During vacation period, services will be paused and applicable refunds will be processed to your wallet",
  hi: "अवकाश अवधि के दौरान, सेवाएं रोक दी जाएंगी और लागू रिफंड आपके वॉलेट में संसाधित किए जाएंगे",
  kn: "ರಜೆಯ ಅವಧಿಯಲ್ಲಿ, ಸೇವೆಗಳನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಅನ್ವಯವಾಗುವ ಮರುಪಾವತಿಗಳನ್ನು ನಿಮ್ಮ ವ್ಯಾಲೆಟ್‌ಗೆ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ",
  bn: "ছুটির সময়কালে, পরিষেবাগুলি বিরতি দেওয়া হবে এবং প্রযোজ্য ফেরত আপনার ওয়ালেটে প্রক্রিয়া করা হবে"
},
penaltyMessage: {
  en: "A penalty may apply for modifications to existing vacation periods",
  hi: "मौजूदा अवकाश अवधियों में संशोधन के लिए जुर्माना लागू हो सकता है",
  kn: "ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ರಜೆಯ ಅವಧಿಗಳಿಗೆ ಮಾರ್ಪಾಡುಗಳಿಗೆ ದಂಡ ಅನ್ವಯಿಸಬಹುದು",
  bn: "বিদ্যমান ছুটির সময়সীমা পরিবর্তনের জন্য জরিমানা প্রযোজ্য হতে পারে"
},
cancelVacation: {
  en: "Cancel Vacation",
  hi: "अवकाश रद्द करें",
  kn: "ರಜೆಯನ್ನು ರದ್ದುಗೊಳಿಸಿ",
  bn: "ছুটি বাতিল করুন"
},
updateVacation: {
  en: "Update Vacation",
  hi: "अवकाश अपडेट करें",
  kn: "ರಜೆಯನ್ನು ನವೀಕರಿಸಿ",
  bn: "ছুটি আপডেট করুন"
},
updating: {
  en: "Updating...",
  hi: "अपडेट हो रहा है...",
  kn: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
  bn: "আপডেট হচ্ছে..."
},
selectBothDates: {
  en: "Please select both start and end dates",
  hi: "कृपया प्रारंभ और समाप्ति दोनों तिथियां चुनें",
  kn: "ದಯವಿಟ್ಟು ಪ್ರಾರಂಭ ಮತ್ತು ಅಂತಿಮ ದಿನಾಂಕಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  bn: "অনুগ্রহ করে শুরুর এবং শেষের তারিখ উভয়ই নির্বাচন করুন"
},
startDateCannotBePast: {
  en: "Vacation start date cannot be in the past",
  hi: "अवकाश प्रारंभ तिथि अतीत में नहीं हो सकती",
  kn: "ರಜೆಯ ಪ್ರಾರಂಭ ದಿನಾಂಕವು ಹಿಂದಿನದಾಗಿರಬಾರದು",
  bn: "ছুটি শুরুর তারিখ অতীত হতে পারে না"
},
endDateMustBeAfterStart: {
  en: "Vacation end date must be after start date",
  hi: "अवकाश समाप्ति तिथि प्रारंभ तिथि के बाद होनी चाहिए",
  kn: "ರಜೆಯ ಅಂತಿಮ ದಿನಾಂಕವು ಪ್ರಾರಂಭ ದಿನಾಂಕದ ನಂತರ ಇರಬೇಕು",
  bn: "ছুটির শেষ তারিখ শুরুর তারিখের পরে হতে হবে"
},
minimumVacationDays: {
  en: "Vacation must be for minimum 10 days. Please select a later end date.",
  hi: "अवकाश न्यूनतम 10 दिनों का होना चाहिए। कृपया बाद की समाप्ति तिथि चुनें।",
  kn: "ರಜೆಯು ಕನಿಷ್ಠ 10 ದಿನಗಳವರೆಗೆ ಇರಬೇಕು. ದಯವಿಟ್ಟು ನಂತರದ ಅಂತಿಮ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  bn: "ছুটি সর্বনিম্ন ১০ দিনের হতে হবে। অনুগ্রহ করে পরবর্তী শেষ তারিখ নির্বাচন করুন।"
},
vacationUpdated: {
  en: "Vacation updated successfully!",
  hi: "अवकाश सफलतापूर्वक अपडेट किया गया!",
  kn: "ರಜೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!",
  bn: "ছুটি সফলভাবে আপডেট করা হয়েছে!"
},
updateFailed: {
  en: "Failed to update vacation. Please try again.",
  hi: "अवकाश अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
  kn: "ರಜೆಯನ್ನು ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  bn: "ছুটি আপডেট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
},
vacationCancelled: {
  en: "Vacation cancelled successfully!",
  hi: "अवकाश सफलतापूर्वक रद्द किया गया!",
  kn: "ರಜೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ!",
  bn: "ছুটি সফলভাবে বাতিল করা হয়েছে!"
},
cancelFailed: {
  en: "Failed to cancel vacation. Please try again.",
  hi: "अवकाश रद्द करने में विफल। कृपया पुनः प्रयास करें।",
  kn: "ರಜೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  bn: "ছুটি বাতিল করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
},
// ============END VACATIONMANAGEMENT TRANSLATIONS ============

// Add these to your translations object in LanguageContext.tsx
vendorInfoUnavailable: {
  en: "Vendor Information Unavailable",
  hi: "विक्रेता की जानकारी अनुपलब्ध",
  kn: "ಮಾರಾಟಗಾರರ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
  bn: "বিক্রেতার তথ্য অনুপলব্ধ"
},
unableToLoadVendorDetails: {
  en: "Unable to load vendor details. Please try again later.",
  hi: "विक्रेता विवरण लोड करने में असमर्थ। कृपया बाद में पुनः प्रयास करें।",
  kn: "ಮಾರಾಟಗಾರರ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  bn: "বিক্রেতার বিবরণ লোড করতে অক্ষম। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
},
active: {
  en: "Active",
  hi: "सक्रिय",
  kn: "ಸಕ್ರಿಯ",
  bn: "সক্রিয়"
},
inactive: {
  en: "Inactive",
  hi: "निष्क्रिय",
  kn: "ನಿಷ್ಕ್ರಿಯ",
  bn: "নিষ্ক্রিয়"
},
emailAddress: {
  en: "Email Address",
  hi: "ईमेल पता",
  kn: "ಇಮೇಲ್ ವಿಳಾಸ",
  bn: "ইমেল ঠিকানা"
},
phoneNumber: {
  en: "Phone Number",
  hi: "फ़ोन नंबर",
  kn: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
  bn: "ফোন নম্বর"
},
businessAddress: {
  en: "Business Address",
  hi: "व्यवसाय का पता",
  kn: "ವ್ಯಾಪಾರ ವಿಳಾಸ",
  bn: "ব্যবসার ঠিকানা"
},
notProvided: {
  en: "Not provided",
  hi: "प्रदान नहीं किया गया",
  kn: "ಒದಗಿಸಿಲ್ಲ",
  bn: "প্রদান করা হয়নি"
},
businessDetails: {
  en: "Business Details",
  hi: "व्यवसाय विवरण",
  kn: "ವ್ಯಾಪಾರ ವಿವರಗಳು",
  bn: "ব্যবসার বিবরণ"
},
registeredSince: {
  en: "Registered Since",
  hi: "पंजीकृत से",
  kn: "ನೋಂದಾಯಿತ ದಿನಾಂಕ",
  bn: "নিবন্ধনের তারিখ"
},
associatedProviders: {
  en: "Associated Providers",
  hi: "संबद्ध प्रदाता",
  kn: "ಸಂಯೋಜಿತ ಸೇವಾ ಒದಗಿಸುವವರು",
  bn: "সংশ্লিষ্ট প্রদানকারী"
},
providers: {
  en: "providers",
  hi: "प्रदाता",
  kn: "ಒದಗಿಸುವವರು",
  bn: "প্রদানকারী"
},
quickActions: {
  en: "Quick Actions",
  hi: "त्वरित कार्रवाई",
  kn: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
  bn: "দ্রুত কর্ম"
},
manageProviders: {
  en: "Manage Providers",
  hi: "प्रदाता प्रबंधित करें",
  kn: "ಒದಗಿಸುವವರನ್ನು ನಿರ್ವಹಿಸಿ",
  bn: "প্রদানকারী পরিচালনা করুন"
},
viewAnalytics: {
  en: "View Analytics",
  hi: "एनालिटिक्स देखें",
  kn: "ಅನಾಲಿಟಿಕ್ಸ್ ವೀಕ್ಷಿಸಿ",
  bn: "অ্যানালিটিক্স দেখুন"
},
editProfile: {
  en: "Edit Profile",
  hi: "प्रोफ़ाइल संपादित करें",
  kn: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
  bn: "প্রোফাইল সম্পাদনা করুন"
},
summary: {
  en: "Summary",
  hi: "सारांश",
  kn: "ಸಾರಾಂಶ",
  bn: "সারাংশ"
},
accountStatus: {
  en: "Account Status",
  hi: "खाता स्थिति",
  kn: "ಖಾತೆ ಸ್ಥಿತಿ",
  bn: "অ্যাকাউন্টের অবস্থা"
},
totalProviders: {
  en: "Total Providers",
  hi: "कुल प्रदाता",
  kn: "ಒಟ್ಟು ಒದಗಿಸುವವರು",
  bn: "মোট প্রদানকারী"
},
fetchFailed: {
  en: "Failed to fetch vendor data",
  hi: "विक्रेता डेटा प्राप्त करने में विफल",
  kn: "ಮಾರಾಟಗಾರರ ಡೇಟಾವನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ",
  bn: "বিক্রেতার ডেটা আনতে ব্যর্থ হয়েছে"
},
unableToLoad: {
  en: "Unable to load vendor information",
  hi: "विक्रेता जानकारी लोड करने में असमर्थ",
  kn: "ಮಾರಾಟಗಾರರ ಮಾಹಿತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ",
  bn: "বিক্রেতার তথ্য লোড করতে অক্ষম"
},
  // Add language names in their native language
  en: {
    en: "English",
    hi: "अंग्रेज़ी",
    kn: "ಆಂಗ್ಲ",
    bn: "ইংরেজি"
  },
  hi: {
    en: "Hindi",
    hi: "हिन्दी",
    kn: "ಹಿಂದಿ",
    bn: "হিন্দি"
  },
  kn: {
    en: "Kannada",
    hi: "कन्नड़",
    kn: "ಕನ್ನಡ",
    bn: "কন্নড়"
  },
  bn: {
    en: "Bengali",
    hi: "बंगाली",
    kn: "ಬಂಗಾಳಿ",
    bn: "বাংলা"
  }
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    
    // Dispatch event for components that might not be using the context yet
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  };

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    // Check if savedLanguage exists and is a valid Language (only the four we want)
    if (savedLanguage && ['en', 'hi', 'kn', 'bn'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (translations[key] && translations[key][currentLanguage]) {
      let text = translations[key][currentLanguage];
      
      // Replace parameters if provided
      if (params) {
        Object.keys(params).forEach(paramKey => {
          text = text.replace(`{${paramKey}}`, String(params[paramKey]));
        });
      }
      
      return text;
    }
    console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};