// contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available languages - ADDED 'bn' for Bengali and 'kn' for Kannada
export type Language = 'en' | 'kn' | 'fr' | 'de' | 'it' | 'pt' | 'hi' | 'ar' | 'zh' | 'ja' | 'bn';

// Define the translation structure
interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

// All your app translations
export const translations: Translations = {
  // Footer translations
  description: {
    en: "Book trusted, trained house-help instantly. ServEaso provides safe, affordable maids, cooks, and caregivers.",
    kn: "ವಿಶ್ವಾಸಾರ್ಹ, ತರಬೇತಿ ಪಡೆದ ಮನೆ ಸಹಾಯಕರನ್ನು ತಕ್ಷಣವೇ ಬುಕ್ ಮಾಡಿ. ServEaso ಸುರಕ್ಷಿತ, ಕೈಗೆಟುಕುವ ದರದಲ್ಲಿ ಮನೆಕೆಲಸದವರು, ಅಡುಗೆಯವರು ಮತ್ತು ಆರೈಕೆದಾರರನ್ನು ಒದಗಿಸುತ್ತದೆ.",
    fr: "Réservez instantanément une aide ménagère fiable et formée. ServEaso fournit des femmes de ménage, des cuisiniers et des aidants sûrs et abordables.",
    de: "Buchen Sie sofort vertrauenswürdige, ausgebildete Haushaltshilfen. ServEaso bietet sichere, erschwingliche Haushaltshilfen, Köche und Betreuer.",
    it: "Prenota assistenza domestica affidabile e formata istantaneamente. ServEaso fornisce colf, cuochi e badanti sicuri e convenienti.",
    pt: "Reserve ajuda doméstica confiável e treinada instantaneamente. ServEaso fornece empregadas, cozinheiros e cuidadores seguros e acessíveis.",
    hi: "विश्वसनीय, प्रशिक्षित घरेलू सहायता को तुरंत बुक करें। ServEaso सुरक्षित, किफायती नौकरानियां, रसोइया और देखभालकर्ता प्रदान करता है।",
    ar: "احجز مساعدة منزلية موثوقة ومدربة على الفور. توفر ServEaso خادمات وطهاة ومقدمي رعاية آمنين وبأسعار معقولة.",
    zh: "立即预订值得信赖、训练有素的家政帮手。ServEaso 提供安全、实惠的保姆、厨师和护理人员。",
    ja: "信頼できる訓練された家事ヘルパーを即座に予約。ServEasoは安全で手頃な価格のメイド、料理人、介護者を提供します。",
    bn: "বিশ্বস্ত, প্রশিক্ষিত গৃহকর্মী তাৎক্ষণিকভাবে বুক করুন। ServEaso নিরাপদ, সাশ্রয়ী মূল্যের গৃহকর্মী, বাবুর্চি এবং পরিচর্যাকারী প্রদান করে।"
  },
  termsOfService: {
    en: "Terms of Service",
    kn: "ಸೇವಾ ನಿಯಮಗಳು",
    fr: "Conditions d'utilisation",
    de: "Nutzungsbedingungen",
    it: "Termini di servizio",
    pt: "Termos de Serviço",
    hi: "सेवा की शर्तें",
    ar: "شروط الخدمة",
    zh: "服务条款",
    ja: "利用規約",
    bn: "সেবার শর্তাবলী"
  },
  privacyPolicy: {
    en: "Privacy Policy",
    kn: "ಗೌಪ್ಯತಾ ನೀತಿ",
    fr: "Politique de confidentialité",
    de: "Datenschutzrichtlinie",
    it: "Informativa sulla privacy",
    pt: "Política de Privacidade",
    hi: "गोपनीयता नीति",
    ar: "سياسة الخصوصية",
    zh: "隐私政策",
    ja: "プライバシーポリシー",
    bn: "গোপনীয়তা নীতি"
  },
  tutorials: {
    en: "Tutorials",
    kn: "ಟ್ಯುಟೋರಿಯಲ್ಗಳು",
    fr: "Tutoriels",
    de: "Tutorials",
    it: "Tutorial",
    pt: "Tutoriais",
    hi: "ट्यूटोरियल",
    ar: "الدروس",
    zh: "教程",
    ja: "チュートリアル",
    bn: "টিউটোরিয়াল"
  },
  blog: {
    en: "Blog",
    kn: "ಬ್ಲಾಗ್",
    fr: "Blog",
    de: "Blog",
    it: "Blog",
    pt: "Blog",
    hi: "ब्लॉग",
    ar: "مدونة",
    zh: "博客",
    ja: "ブログ",
    bn: "ব্লগ"
  },
  contactUs: {
    en: "Contact Us",
    kn: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
    fr: "Contactez-nous",
    de: "Kontakt",
    it: "Contattaci",
    pt: "Contate-nos",
    hi: "संपर्क करें",
    ar: "اتصل بنا",
    zh: "联系我们",
    ja: "お問い合わせ",
    bn: "যোগাযোগ করুন"
  },
  partners: {
    en: "Partners",
    kn: "ಪಾಲುದಾರರು",
    fr: "Partenaires",
    de: "Partner",
    it: "Partner",
    pt: "Parceiros",
    hi: "भागीदार",
    ar: "شركاء",
    zh: "合作伙伴",
    ja: "パートナー",
    bn: "অংশীদার"
  },
  pricing: {
    en: "Pricing",
    kn: "ಬೆಲೆಗಳು",
    fr: "Tarifs",
    de: "Preise",
    it: "Prezzi",
    pt: "Preços",
    hi: "मूल्य निर्धारण",
    ar: "التسعير",
    zh: "定价",
    ja: "料金",
    bn: "মূল্য তালিকা"
  },
  about: {
    en: "About",
    kn: "ನಮ್ಮ ಬಗ್ಗೆ",
    fr: "À propos",
    de: "Über uns",
    it: "Chi siamo",
    pt: "Sobre",
    hi: "हमारे बारे में",
    ar: "حول",
    zh: "关于",
    ja: "概要",
    bn: "আমাদের সম্পর্কে"
  },
  copyright: {
    en: "© 2025 ServEaso. All rights reserved.",
    kn: "© 2025 ServEaso. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    fr: "© 2025 ServEaso. Tous droits réservés.",
    de: "© 2025 ServEaso. Alle Rechte vorbehalten.",
    it: "© 2025 ServEaso. Tutti i diritti riservati.",
    pt: "© 2025 ServEaso. Todos os direitos reservados.",
    hi: "© 2025 ServEaso। सर्वाधिकार सुरक्षित।",
    ar: "© 2025 ServEaso. جميع الحقوق محفوظة.",
    zh: "© 2025 ServEaso。保留所有权利。",
    ja: "© 2025 ServEaso。無断転載を禁じます。",
    bn: "© ২০২৫ ServEaso। সর্বস্বত্ব সংরক্ষিত।"
  },
  language: {
    en: "Language",
    kn: "ಭಾಷೆ",
    fr: "Langue",
    de: "Sprache",
    it: "Lingua",
    pt: "Idioma",
    hi: "भाषा",
    ar: "اللغة",
    zh: "语言",
    ja: "言語",
    bn: "ভাষা"
  },

  // ============ HEADER TRANSLATIONS ============
  home: {
    en: "Home",
    kn: "ಮುಖಪುಟ",
    fr: "Accueil",
    de: "Startseite",
    it: "Home",
    pt: "Início",
    hi: "होम",
    ar: "الرئيسية",
    zh: "首页",
    ja: "ホーム",
    bn: "হোম"
  },
  
  ourServices: {
    en: "Our Services",
    kn: "ನಮ್ಮ ಸೇವೆಗಳು",
    fr: "Nos Services",
    de: "Unsere Dienstleistungen",
    it: "I Nostri Servizi",
    pt: "Nossos Serviços",
    hi: "हमारी सेवाएं",
    ar: "خدماتنا",
    zh: "我们的服务",
    ja: "サービス",
    bn: "আমাদের সেবাসমূহ"
  },
  
  homeCook: {
    en: "Home Cook",
    kn: "ಮನೆ ಅಡುಗೆಯವರು",
    fr: "Cuisinier à Domicile",
    de: "Hauskoch",
    it: "Cuoco a Domicilio",
    pt: "Cozinheiro em Casa",
    hi: "घरेलू रसोइया",
    ar: "طباخ منزلي",
    zh: "家庭厨师",
    ja: "家庭料理",
    bn: "গৃহস্থালি রাঁধুনি"
  },
  
  cleaningHelp: {
    en: "Cleaning Help",
    kn: "ಸ್ವಚ್ಛತಾ ಸಹಾಯ",
    fr: "Aide au Nettoyage",
    de: "Reinigungshilfe",
    it: "Aiuto per le Pulizie",
    pt: "Ajuda de Limpeza",
    hi: "सफाई सहायता",
    ar: "مساعدة في التنظيف",
    zh: "清洁帮助",
    ja: "掃除ヘルプ",
    bn: "পরিষ্কার সহায়তা"
  },
  
  caregiver: {
    en: "Caregiver",
    kn: "ಆರೈಕೆದಾರ",
    fr: "Aidant",
    de: "Pflegekraft",
    it: "Badante",
    pt: "Cuidador",
    hi: "देखभालकर्ता",
    ar: "مقدم رعاية",
    zh: "护理人员",
    ja: "介護者",
    bn: "পরিচর্যাকারী"
  },
  
  myBookings: {
    en: "My Bookings",
    kn: "ನನ್ನ ಬುಕಿಂಗ್ಗಳು",
    fr: "Mes Réservations",
    de: "Meine Buchungen",
    it: "Le Mie Prenotazioni",
    pt: "Minhas Reservas",
    hi: "मेरी बुकिंग",
    ar: "حجوزاتي",
    zh: "我的预订",
    ja: "予約一覧",
    bn: "আমার বুকিং"
  },
  
  dashboard: {
    en: "Dashboard",
    kn: "ಡ್ಯಾಶ್ಬೋರ್ಡ್",
    fr: "Tableau de Bord",
    de: "Dashboard",
    it: "Dashboard",
    pt: "Painel de Controle",
    hi: "डैशबोर्ड",
    ar: "لوحة القيادة",
    zh: "仪表板",
    ja: "ダッシュボード",
    bn: "ড্যাশবোর্ড"
  },
  
  aboutUs: {
    en: "About Us",
    kn: "ನಮ್ಮ ಬಗ್ಗೆ",
    fr: "À Propos de Nous",
    de: "Über Uns",
    it: "Chi Siamo",
    pt: "Sobre Nós",
    hi: "हमारे बारे में",
    ar: "معلومات عنا",
    zh: "关于我们",
    ja: "会社概要",
    bn: "আমাদের সম্পর্কে"
  },
  
  location: {
    en: "Location",
    kn: "ಸ್ಥಳ",
    fr: "Emplacement",
    de: "Standort",
    it: "Posizione",
    pt: "Localização",
    hi: "स्थान",
    ar: "الموقع",
    zh: "位置",
    ja: "場所",
    bn: "অবস্থান"
  },
  
  detectLocation: {
    en: "Detect Location",
    kn: "ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ",
    fr: "Détecter la Position",
    de: "Standort erkennen",
    it: "Rileva Posizione",
    pt: "Detectar Localização",
    hi: "स्थान का पता लगाएं",
    ar: "كشف الموقع",
    zh: "检测位置",
    ja: "現在地を検出",
    bn: "অবস্থান সনাক্ত করুন"
  },
  
  addAddress: {
    en: "Add Address",
    kn: "ವಿಳಾಸ ಸೇರಿಸಿ",
    fr: "Ajouter une Adresse",
    de: "Adresse hinzufügen",
    it: "Aggiungi Indirizzo",
    pt: "Adicionar Endereço",
    hi: "पता जोड़ें",
    ar: "إضافة عنوان",
    zh: "添加地址",
    ja: "住所を追加",
    bn: "ঠিকানা যোগ করুন"
  },
  
  locationNotFound: {
    en: "Location not found",
    kn: "ಸ್ಥಳ ಕಂಡುಬಂದಿಲ್ಲ",
    fr: "Emplacement non trouvé",
    de: "Standort nicht gefunden",
    it: "Posizione non trovata",
    pt: "Localização não encontrada",
    hi: "स्थान नहीं मिला",
    ar: "الموقع غير موجود",
    zh: "未找到位置",
    ja: "場所が見つかりません",
    bn: "অবস্থান পাওয়া যায়নি"
  },
  
  loading: {
    en: "Loading",
    kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ",
    fr: "Chargement",
    de: "Laden",
    it: "Caricamento",
    pt: "Carregando",
    hi: "लोड हो रहा है",
    ar: "جاري التحميل",
    zh: "加载中",
    ja: "読み込み中",
    bn: "লোড হচ্ছে"
  },
  
  profile: {
    en: "Profile",
    kn: "ಪ್ರೊಫೈಲ್",
    fr: "Profil",
    de: "Profil",
    it: "Profilo",
    pt: "Perfil",
    hi: "प्रोफ़ाइल",
    ar: "الملف الشخصي",
    zh: "个人资料",
    ja: "プロフィール",
    bn: "প্রোফাইল"
  },
  
  logout: {
    en: "Logout",
    kn: "ನಿರ್ಗಮಿಸಿ",
    fr: "Déconnexion",
    de: "Abmelden",
    it: "Esci",
    pt: "Sair",
    hi: "लॉग आउट",
    ar: "تسجيل الخروج",
    zh: "退出",
    ja: "ログアウト",
    bn: "লগআউট"
  },
  
  setLocation: {
    en: "Set Location",
    kn: "ಸ್ಥಳ ಹೊಂದಿಸಿ",
    fr: "Définir l'Emplacement",
    de: "Standort festlegen",
    it: "Imposta Posizione",
    pt: "Definir Localização",
    hi: "स्थान सेट करें",
    ar: "تعيين الموقع",
    zh: "设置位置",
    ja: "場所を設定",
    bn: "অবস্থান সেট করুন"
  },
  
  cancel: {
    en: "Cancel",
    kn: "ರದ್ದುಮಾಡಿ",
    fr: "Annuler",
    de: "Abbrechen",
    it: "Annulla",
    pt: "Cancelar",
    hi: "रद्द करें",
    ar: "إلغاء",
    zh: "取消",
    ja: "キャンセル",
    bn: "বাতিল"
  },
  
  save: {
    en: "Save",
    kn: "ಉಳಿಸಿ",
    fr: "Enregistrer",
    de: "Speichern",
    it: "Salva",
    pt: "Salvar",
    hi: "सहेजें",
    ar: "حفظ",
    zh: "保存",
    ja: "保存",
    bn: "সংরক্ষণ"
  },
  
  saveAs: {
    en: "Save As",
    kn: "ಹೀಗೆ ಉಳಿಸಿ",
    fr: "Enregistrer Sous",
    de: "Speichern Als",
    it: "Salva Come",
    pt: "Salvar Como",
    hi: "इस रूप में सहेजें",
    ar: "حفظ باسم",
    zh: "另存为",
    ja: "名前を付けて保存",
    bn: "হিসেবে সংরক্ষণ"
  },
  
  office: {
    en: "Office",
    kn: "ಕಚೇರಿ",
    fr: "Bureau",
    de: "Büro",
    it: "Ufficio",
    pt: "Escritório",
    hi: "कार्यालय",
    ar: "مكتب",
    zh: "办公室",
    ja: "オフィス",
    bn: "অফিস"
  },
  
  others: {
    en: "Others",
    kn: "ಇತರೆ",
    fr: "Autres",
    de: "Andere",
    it: "Altri",
    pt: "Outros",
    hi: "अन्य",
    ar: "أخرى",
    zh: "其他",
    ja: "その他",
    bn: "অন্যান্য"
  },
  
  enterLocationName: {
    en: "Enter Location Name",
    kn: "ಸ್ಥಳದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    fr: "Entrez le Nom de l'Emplacement",
    de: "Standortnamen eingeben",
    it: "Inserisci il Nome della Posizione",
    pt: "Digite o Nome da Localização",
    hi: "स्थान का नाम दर्ज करें",
    ar: "أدخل اسم الموقع",
    zh: "输入位置名称",
    ja: "場所名を入力",
    bn: "অবস্থানের নাম লিখুন"
  },
  
  saving: {
    en: "Saving...",
    kn: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    fr: "Enregistrement...",
    de: "Speichern...",
    it: "Salvataggio...",
    pt: "Salvando...",
    hi: "सहेजा जा रहा है...",
    ar: "جاري الحفظ...",
    zh: "保存中...",
    ja: "保存中...",
    bn: "সংরক্ষণ করা হচ্ছে..."
  },
  
  locationSavedSuccess: {
    en: "Location saved successfully!",
    kn: "ಸ್ಥಳವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!",
    fr: "Emplacement enregistré avec succès!",
    de: "Standort erfolgreich gespeichert!",
    it: "Posizione salvata con successo!",
    pt: "Localização salva com sucesso!",
    hi: "स्थान सफलतापूर्वक सहेजा गया!",
    ar: "تم حفظ الموقع بنجاح!",
    zh: "位置保存成功！",
    ja: "場所が正常に保存されました！",
    bn: "অবস্থান সফলভাবে সংরক্ষিত হয়েছে!"
  },
  
  locationSaveError: {
    en: "Failed to save location. Please try again.",
    kn: "ಸ್ಥಳವನ್ನು ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    fr: "Échec de l'enregistrement de l'emplacement. Veuillez réessayer.",
    de: "Fehler beim Speichern des Standorts. Bitte versuchen Sie es erneut.",
    it: "Impossibile salvare la posizione. Per favore riprova.",
    pt: "Falha ao salvar a localização. Por favor, tente novamente.",
    hi: "स्थान सहेजने में विफल। कृपया पुनः प्रयास करें।",
    ar: "فشل في حفظ الموقع. يرجى المحاولة مرة أخرى.",
    zh: "保存位置失败。请重试。",
    ja: "場所の保存に失敗しました。もう一度お試しください。",
    bn: "অবস্থান সংরক্ষণ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
  },
  // ============ END HEADER TRANSLATIONS ============

  // ============ HOMEPAGE TRANSLATIONS ============
  heroTitle: {
    en: "Book trusted and trained house-help in minutes",
    kn: "ವಿಶ್ವಾಸಾರ್ಹ ಮತ್ತು ತರಬೇತಿ ಪಡೆದ ಮನೆ ಸಹಾಯಕರನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ಬುಕ್ ಮಾಡಿ",
    fr: "Réservez une aide ménagère fiable et formée en quelques minutes",
    de: "Buchen Sie vertrauenswürdige, ausgebildete Haushaltshilfen in Minuten",
    it: "Prenota assistenza domestica affidabile e formata in pochi minuti",
    pt: "Reserve ajuda doméstica confiável e treinada em minutos",
    hi: "विश्वसनीय और प्रशिक्षित घरेलू सहायता को मिनटों में बुक करें",
    ar: "احجز مساعدة منزلية موثوقة ومدربة في دقائق",
    zh: "在几分钟内预订值得信赖且训练有素的家政帮手",
    ja: "信頼できる訓練された家事ヘルパーを数分で予約",
    bn: "মিনিটের মধ্যে বিশ্বস্ত এবং প্রশিক্ষিত গৃহকর্মী বুক করুন"
  },

  heroDescription: {
    en: "ServEaso delivers instant, regular and short term access to safe, affordable, and trained maids, cooks, and caregivers.",
    kn: "ServEaso ಸುರಕ್ಷಿತ, ಕೈಗೆಟುಕುವ ಮತ್ತು ತರಬೇತಿ ಪಡೆದ ಮನೆಕೆಲಸದವರು, ಅಡುಗೆಯವರು ಮತ್ತು ಆರೈಕೆದಾರರಿಗೆ ತಕ್ಷಣದ, ನಿಯಮಿತ ಮತ್ತು ಅಲ್ಪಾವಧಿಯ ಪ್ರವೇಶವನ್ನು ಒದಗಿಸುತ್ತದೆ.",
    fr: "ServEaso offre un accès instantané, régulier et à court terme à des femmes de ménage, des cuisiniers et des aidants sûrs, abordables et formés.",
    de: "ServEaso bietet sofortigen, regelmäßigen und kurzfristigen Zugang zu sicheren, erschwinglichen und ausgebildeten Haushaltshilfen, Köchen und Betreuern.",
    it: "ServEaso fornisce accesso istantaneo, regolare e a breve termine a colf, cuochi e badanti sicuri, convenienti e formati.",
    pt: "A ServEaso oferece acesso instantâneo, regular e de curto prazo a empregadas, cozinheiros e cuidadores seguros, acessíveis e treinados.",
    hi: "ServEaso सुरक्षित, किफायती और प्रशिक्षित नौकरानियों, रसोइयों और देखभाल करने वालों तक तत्काल, नियमित और अल्पकालिक पहुंच प्रदान करता है।",
    ar: "تقدم ServEaso وصولاً فوريًا ومنتظمًا وقصير المدى إلى خادمات وطهاة ومقدمي رعاية آمنين وبأسعار معقولة ومدربين.",
    zh: "ServEaso 提供即时、定期和短期的安全、实惠且训练有素的保姆、厨师和护理人员。",
    ja: "ServEasoは、安全で手頃な価格で訓練されたメイド、料理人、介護者への即時、定期、短期アクセスを提供します。",
    bn: "ServEaso নিরাপদ, সাশ্রয়ী মূল্যের এবং প্রশিক্ষিত গৃহকর্মী, বাবুর্চি এবং পরিচর্যাকারীদের তাত্ক্ষণিক, নিয়মিত এবং স্বল্পমেয়াদী অ্যাক্সেস প্রদান করে।"
  },

  registerAsUser: {
    en: "Register as a User",
    kn: "ಬಳಕೆದಾರರಾಗಿ ನೋಂದಾಯಿಸಿ",
    fr: "S'inscrire en tant qu'Utilisateur",
    de: "Als Benutzer registrieren",
    it: "Registrati come Utente",
    pt: "Registrar como Usuário",
    hi: "उपयोगकर्ता के रूप में पंजीकरण करें",
    ar: "التسجيل كمستخدم",
    zh: "注册为用户",
    ja: "ユーザーとして登録",
    bn: "ব্যবহারকারী হিসাবে নিবন্ধন করুন"
  },

  registerAsProvider: {
    en: "Register as a Provider",
    kn: "ಸೇವೆ ಒದಗಿಸುವವರಾಗಿ ನೋಂದಾಯಿಸಿ",
    fr: "S'inscrire en tant que Prestataire",
    de: "Als Anbieter registrieren",
    it: "Registrati come Fornitore",
    pt: "Registrar como Prestador",
    hi: "प्रदाता के रूप में पंजीकरण करें",
    ar: "التسجيل كمقدم خدمة",
    zh: "注册为服务提供者",
    ja: "プロバイダーとして登録",
    bn: "প্রদানকারী হিসাবে নিবন্ধন করুন"
  },

  registerAsAgent: {
    en: "Register as an Agent",
    kn: "ಏಜೆಂಟ್ ಆಗಿ ನೋಂದಾಯಿಸಿ",
    fr: "S'inscrire en tant qu'Agent",
    de: "Als Agent registrieren",
    it: "Registrati come Agente",
    pt: "Registrar como Agente",
    hi: "एजेंट के रूप में पंजीकरण करें",
    ar: "التسجيل كوكيل",
    zh: "注册为代理",
    ja: "エージェントとして登録",
    bn: "এজেন্ট হিসাবে নিবন্ধন করুন"
  },

  service: {
    en: "Service",
    kn: "ಸೇವೆ",
    fr: "Service",
    de: "Dienstleistung",
    it: "Servizio",
    pt: "Serviço",
    hi: "सेवा",
    ar: "خدمة",
    zh: "服务",
    ja: "サービス",
    bn: "সেবা"
  },

  previousSlide: {
    en: "Previous slide",
    kn: "ಹಿಂದಿನ ಸ್ಲೈಡ್",
    fr: "Diapositive précédente",
    de: "Vorherige Folie",
    it: "Diapositiva precedente",
    pt: "Slide anterior",
    hi: "पिछली स्लाइड",
    ar: "الشريحة السابقة",
    zh: "上一张",
    ja: "前のスライド",
    bn: "পূর্ববর্তী স্লাইড"
  },

  nextSlide: {
    en: "Next slide",
    kn: "ಮುಂದಿನ ಸ್ಲೈಡ್",
    fr: "Diapositive suivante",
    de: "Nächste Folie",
    it: "Prossima diapositiva",
    pt: "Próximo slide",
    hi: "अगली स्लाइड",
    ar: "الشريحة التالية",
    zh: "下一张",
    ja: "次のスライド",
    bn: "পরবর্তী স্লাইড"
  },

  goToSlide: {
    en: "Go to slide",
    kn: "ಸ್ಲೈಡ್ಗೆ ಹೋಗಿ",
    fr: "Aller à la diapositive",
    de: "Gehe zu Folie",
    it: "Vai alla diapositiva",
    pt: "Ir para o slide",
    hi: "स्लाइड पर जाएं",
    ar: "الانتقال إلى الشريحة",
    zh: "转到幻灯片",
    ja: "スライドに移動",
    bn: "স্লাইডে যান"
  },

  popularServices: {
    en: "Popular Services",
    kn: "ಜನಪ್ರಿಯ ಸೇವೆಗಳು",
    fr: "Services Populaires",
    de: "Beliebte Dienstleistungen",
    it: "Servizi Popolari",
    pt: "Serviços Populares",
    hi: "लोकप्रिय सेवाएं",
    ar: "الخدمات الشائعة",
    zh: "热门服务",
    ja: "人気のサービス",
    bn: "জনপ্রিয় সেবাসমূহ"
  },

  homeCookDesc: {
    en: "Skilled and hygienic cooks who specialize in home-style meals.",
    kn: "ಮನೆ ಶೈಲಿಯ ಊಟಗಳಲ್ಲಿ ಪರಿಣತಿ ಹೊಂದಿರುವ ಕುಶಲ ಮತ್ತು ಸ್ವಚ್ಛತೆಯ ಅಡುಗೆಯವರು.",
    fr: "Cuisiniers qualifiés et hygiéniques spécialisés dans les repas faits maison.",
    de: "Geschickte und hygienische Köche, die sich auf hausgemachte Mahlzeiten spezialisiert haben.",
    it: "Cuochi qualificati e igienici specializzati in pasti casalinghi.",
    pt: "Cozinheiros qualificados e higiênicos especializados em refeições caseiras.",
    hi: "कुशल और स्वच्छ रसोइया जो घरेलू शैली के भोजन में विशेषज्ञता रखते हैं।",
    ar: "طهاة ماهرون وصحيون متخصصون في الوجبات المنزلية.",
    zh: "熟练且卫生的厨师，专门提供家常饭菜。",
    ja: "家庭料理を専門とする熟練した衛生的な料理人。",
    bn: "দক্ষ এবং স্বাস্থ্যকর রাঁধুনি যারা ঘরোয়া ধাঁচের খাবারে বিশেষজ্ঞ।"
  },

  cleaningHelpDesc: {
    en: "Reliable maids for daily, deep, or special occasion cleaning.",
    kn: "ದೈನಂದಿನ, ಆಳವಾದ, ಅಥವಾ ವಿಶೇಷ ಸಂದರ್ಭಗಳ ಸ್ವಚ್ಛತೆಗಾಗಿ ವಿಶ್ವಾಸಾರ್ಹ ಮನೆಕೆಲಸದವರು.",
    fr: "Femmes de ménage fiables pour le nettoyage quotidien, en profondeur ou pour des occasions spéciales.",
    de: "Zuverlässige Haushaltshilfen für die tägliche, gründliche oder besondere Reinigung.",
    it: "Colf affidabili per pulizie quotidiane, approfondite o per occasioni speciali.",
    pt: "Empregadas confiáveis para limpeza diária, profunda ou de ocasiões especiais.",
    hi: "दैनिक, गहरी या विशेष अवसर की सफाई के लिए विश्वसनीय नौकरानियां।",
    ar: "خادمات موثوقات للتنظيف اليومي أو العميق أو للمناسبات الخاصة.",
    zh: "可靠的保姆，适合日常、深度或特殊场合清洁。",
    ja: "日常、徹底的、または特別な機会の清掃のための信頼できるメイド。",
    bn: "দৈনিক, গভীর বা বিশেষ অনুষ্ঠানের পরিষ্কারের জন্য নির্ভরযোগ্য গৃহকর্মী।"
  },

  caregiverDesc: {
    en: "Trained support for children, seniors, or patients at home.",
    kn: "ಮನೆಯಲ್ಲಿ ಮಕ್ಕಳು, ಹಿರಿಯರು ಅಥವಾ ರೋಗಿಗಳಿಗೆ ತರಬೇತಿ ಪಡೆದ ಬೆಂಬಲ.",
    fr: "Soutien formé pour les enfants, les personnes âgées ou les patients à domicile.",
    de: "Geschulte Unterstützung für Kinder, Senioren oder Patienten zu Hause.",
    it: "Supporto formato per bambini, anziani o pazienti a casa.",
    pt: "Apoio treinado para crianças, idosos ou pacientes em casa.",
    hi: "घर पर बच्चों, वरिष्ठ नागरिकों या रोगियों के लिए प्रशिक्षित सहायता।",
    ar: "دعم مدرب للأطفال أو كبار السن أو المرضى في المنزل.",
    zh: "为儿童、老人或患者提供训练有素的支持。",
    ja: "子供、高齢者、または在宅患者のための訓練されたサポート。",
    bn: "বাচ্চাদের, বয়স্কদের বা বাড়িতে রোগীদের জন্য প্রশিক্ষিত সহায়তা।"
  },

  learnMore: {
    en: "Learn More",
    kn: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
    fr: "En Savoir Plus",
    de: "Mehr Erfahren",
    it: "Scopri di Più",
    pt: "Saiba Mais",
    hi: "और जानें",
    ar: "معرفة المزيد",
    zh: "了解更多",
    ja: "もっと詳しく",
    bn: "আরও জানুন"
  },

  howItWorks: {
    en: "How It Works",
    kn: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    fr: "Comment Ça Marche",
    de: "So Funktioniert's",
    it: "Come Funziona",
    pt: "Como Funciona",
    hi: "यह कैसे काम करता है",
    ar: "كيف يعمل",
    zh: "如何运作",
    ja: "使い方",
    bn: "এটি কিভাবে কাজ করে"
  },

  chooseService: {
    en: "Choose your service",
    kn: "ನಿಮ್ಮ ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    fr: "Choisissez votre service",
    de: "Wählen Sie Ihren Service",
    it: "Scegli il tuo servizio",
    pt: "Escolha seu serviço",
    hi: "अपनी सेवा चुनें",
    ar: "اختر خدمتك",
    zh: "选择您的服务",
    ja: "サービスを選択",
    bn: "আপনার সেবা নির্বাচন করুন"
  },

  chooseServiceDesc: {
    en: "Select from a variety of tasks that suit your needs.",
    kn: "ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ಸೂಕ್ತವಾದ ವಿವಿಧ ಕಾರ್ಯಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ.",
    fr: "Choisissez parmi une variété de tâches qui correspondent à vos besoins.",
    de: "Wählen Sie aus einer Vielzahl von Aufgaben, die Ihren Bedürfnissen entsprechen.",
    it: "Scegli tra una varietà di attività che si adattano alle tue esigenze.",
    pt: "Selecione entre uma variedade de tarefas que atendam às suas necessidades.",
    hi: "अपनी आवश्यकताओं के अनुरूप विभिन्न कार्यों में से चुनें।",
    ar: "اختر من بين مجموعة متنوعة من المهام التي تناسب احتياجاتك.",
    zh: "从各种适合您需求的任务中进行选择。",
    ja: "ニーズに合ったさまざまなタスクから選択します。",
    bn: "আপনার প্রয়োজনে উপযোগী বিভিন্ন কাজ থেকে নির্বাচন করুন।"
  },

  scheduleInMinutes: {
    en: "Schedule in minutes",
    kn: "ನಿಮಿಷಗಳಲ್ಲಿ ವೇಳಾಪಟ್ಟಿ ಮಾಡಿ",
    fr: "Planifiez en quelques minutes",
    de: "In Minuten planen",
    it: "Pianifica in pochi minuti",
    pt: "Agende em minutos",
    hi: "मिनटों में शेड्यूल करें",
    ar: "جدول في دقائق",
    zh: "几分钟内安排",
    ja: "数分でスケジュール",
    bn: "মিনিটের মধ্যে সময়সূচী করুন"
  },

  scheduleInMinutesDesc: {
    en: "Book a time that works for you, quickly and easily.",
    kn: "ನಿಮಗೆ ಅನುಕೂಲಕರವಾದ ಸಮಯವನ್ನು ತ್ವರಿತವಾಗಿ ಮತ್ತು ಸುಲಭವಾಗಿ ಬುಕ್ ಮಾಡಿ.",
    fr: "Réservez un créneau qui vous convient, rapidement et facilement.",
    de: "Buchen Sie schnell und einfach einen Termin, der für Sie passt.",
    it: "Prenota un orario che funziona per te, rapidamente e facilmente.",
    pt: "Reserve um horário que funcione para você, de forma rápida e fácil.",
    hi: "अपने लिए सुविधाजनक समय जल्दी और आसानी से बुक करें।",
    ar: "احجز وقتًا يناسبك بسرعة وسهولة.",
    zh: "快速轻松地预订适合您的时间。",
    ja: "都合の良い時間をすばやく簡単に予約します。",
    bn: "আপনার জন্য উপযুক্ত সময় দ্রুত এবং সহজেই বুক করুন।"
  },

  relaxWeHandle: {
    en: "Relax, we'll handle the rest",
    kn: "ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ, ಉಳಿದುದನ್ನು ನಾವು ನೋಡಿಕೊಳ್ಳುತ್ತೇವೆ",
    fr: "Détendez-vous, nous nous occupons du reste",
    de: "Entspannen Sie sich, wir kümmern uns um den Rest",
    it: "Rilassati, al resto ci pensiamo noi",
    pt: "Relaxe, nós cuidamos do resto",
    hi: "आराम करें, बाकी हम संभाल लेंगे",
    ar: "استرخِ، سنتولى الباقي",
    zh: "放松，剩下的交给我们",
    ja: "リラックスしてください、残りは私たちが処理します",
    bn: "আরাম করুন, বাকিটা আমরা সামলাব"
  },

  relaxWeHandleDesc: {
    en: "Our verified professionals ensure your peace of mind.",
    kn: "ನಮ್ಮ ಪರಿಶೀಲಿತ ವೃತ್ತಿಪರರು ನಿಮ್ಮ ಮನಸ್ಸಿನ ಶಾಂತಿಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತಾರೆ.",
    fr: "Nos professionnels vérifiés vous assurent la tranquillité d'esprit.",
    de: "Unsere geprüften Fachkräfte sorgen für Ihre Ruhe.",
    it: "I nostri professionisti verificati ti garantiscono la tranquillità.",
    pt: "Nossos profissionais verificados garantem sua tranquilidade.",
    hi: "हमारे सत्यापित पेशेवर आपकी मानसिक शांति सुनिश्चित करते हैं।",
    ar: "يضمن محترفونا الموثوقون راحة بالك.",
    zh: "我们经过验证的专业人士确保您安心。",
    ja: "検証済みのプロフェッショナルが安心を保証します。",
    bn: "আমাদের যাচাইকৃত পেশাজীবীরা আপনার মানসিক শান্তি নিশ্চিত করে।"
  },

  serviceProviderRegistration: {
    en: "Service Provider Registration",
    kn: "ಸೇವೆ ಒದಗಿಸುವವರ ನೋಂದಣಿ",
    fr: "Inscription du Prestataire de Services",
    de: "Dienstleister Registrierung",
    it: "Registrazione Fornitore di Servizi",
    pt: "Registro de Prestador de Serviços",
    hi: "सेवा प्रदाता पंजीकरण",
    ar: "تسجيل مقدم الخدمة",
    zh: "服务提供者注册",
    ja: "サービスプロバイダー登録",
    bn: "সেবা প্রদানকারী নিবন্ধন"
  },
  // ============ END HOMEPAGE TRANSLATIONS ============

  // Add this section after the HOMEPAGE TRANSLATIONS and before the language names

  // Add these to your translations object in LanguageContext.tsx

// Service Details Dialog Translations
maidServicesTitle: {
  en: "ServEaso Maid Services",
  kn: "ServEaso ಮನೆಕೆಲಸದವರ ಸೇವೆಗಳು",
  fr: "Services de Femme de Ménage ServEaso",
  de: "ServEaso Haushaltshilfe-Dienste",
  it: "Servizi di Colf ServEaso",
  pt: "Serviços de Empregada Doméstica ServEaso",
  hi: "सर्वएसो की नौकरानी सेवाएं",
  ar: "خدمات الخادمات من ServEaso",
  zh: "ServEaso保姆服务",
  ja: "ServEasoメイドサービス",
  bn: "সার্ভইজোর গৃহকর্মী সেবা"
},
maidServicesDescription: {
  en: "Professional cleaning and household services",
  kn: "ವೃತ್ತಿಪರ ಸ್ವಚ್ಛತೆ ಮತ್ತು ಮನೆಕೆಲಸ ಸೇವೆಗಳು",
  fr: "Services professionnels de nettoyage et d'entretien ménager",
  de: "Professionelle Reinigungs- und Haushaltsdienstleistungen",
  it: "Servizi professionali di pulizia e cura della casa",
  pt: "Serviços profissionais de limpeza e domésticos",
  hi: "पेशेवर सफाई और घरेलू सेवाएं",
  ar: "خدمات تنظيف ومنزلية احترافية",
  zh: "专业清洁和家政服务",
  ja: "プロフェッショナルな清掃と家事サービス",
  bn: "পেশাদার পরিষ্কার এবং গৃহস্থালি সেবা"
},
cleaning: {
  en: "Cleaning",
  kn: "ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage",
  de: "Reinigung",
  it: "Pulizia",
  pt: "Limpeza",
  hi: "सफाई",
  ar: "تنظيف",
  zh: "清洁",
  ja: "掃除",
  bn: "পরিষ্কার"
},
utensilsCleaning: {
  en: "Utensils cleaning",
  kn: "ಪಾತ್ರೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸುವುದು",
  fr: "Nettoyage des ustensiles",
  de: "Reinigung von Utensilien",
  it: "Pulizia degli utensili",
  pt: "Limpeza de utensílios",
  hi: "बर्तनों की सफाई",
  ar: "تنظيف الأواني",
  zh: "餐具清洁",
  ja: "器具の洗浄",
  bn: "বাসন পরিষ্কার"
},
dusting: {
  en: "Dusting",
  kn: "ಧೂಳು ಒರೆಸುವುದು",
  fr: "Dépoussiérage",
  de: "Staubwischen",
  it: "Spolveratura",
  pt: "Tirar o pó",
  hi: "धूल झाड़ना",
  ar: "إزالة الغبار",
  zh: "除尘",
  ja: "ほこり取り",
  bn: "ধুলো মুছা"
},
vacuuming: {
  en: "Vacuuming",
  kn: "ವ್ಯಾಕ್ಯೂಮ್ ಮಾಡುವುದು",
  fr: "Passer l'aspirateur",
  de: "Staubsaugen",
  it: "Aspirare",
  pt: "Aspirar",
  hi: "वैक्यूम करना",
  ar: "كنس بالمكنسة الكهربائية",
  zh: "吸尘",
  ja: "掃除機がけ",
  bn: "ভ্যাকুয়াম করা"
},
mopping: {
  en: "Mopping",
  kn: "ಒರೆಸುವುದು",
  fr: "Nettoyer le sol",
  de: "Wischen",
  it: "Lavare il pavimento",
  pt: "Passar pano",
  hi: "पोछा लगाना",
  ar: "مسح الأرضية",
  zh: "拖地",
  ja: "モップがけ",
  bn: "মুছা"
},
sweeping: {
  en: "Sweeping",
  kn: "ಗುಡಿಸುವುದು",
  fr: "Balayer",
  de: "Kehren",
  it: "Spazzare",
  pt: "Varrer",
  hi: "झाड़ू लगाना",
  ar: "كنس",
  zh: "扫地",
  ja: "掃き掃除",
  bn: "ঝাড়ু দেওয়া"
},
cleaningBathroomsKitchens: {
  en: "Cleaning bathrooms and kitchens",
  kn: "ಸ್ನಾನಗೃಹಗಳು ಮತ್ತು ಅಡುಗೆಮನೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸುವುದು",
  fr: "Nettoyage des salles de bain et des cuisines",
  de: "Reinigung von Bädern und Küchen",
  it: "Pulizia di bagni e cucine",
  pt: "Limpeza de banheiros e cozinhas",
  hi: "बाथरूम और रसोई की सफाई",
  ar: "تنظيف الحمامات والمطابخ",
  zh: "清洁卫生间和厨房",
  ja: "浴室とキッチンの清掃",
  bn: "বাথরুম এবং রান্নাঘর পরিষ্কার"
},
laundry: {
  en: "Laundry",
  kn: "ಬಟ್ಟೆ ಒಗೆಯುವುದು",
  fr: "Buanderie",
  de: "Wäsche",
  it: "Bucato",
  pt: "Lavanderia",
  hi: "कपड़े धोना",
  ar: "غسيل الملابس",
  zh: "洗衣",
  ja: "洗濯",
  bn: "কাপড় কাচা"
},
washingClothes: {
  en: "Washing clothes",
  kn: "ಬಟ್ಟೆಗಳನ್ನು ತೊಳೆಯುವುದು",
  fr: "Laver les vêtements",
  de: "Kleidung waschen",
  it: "Lavare i vestiti",
  pt: "Lavar roupas",
  hi: "कपड़े धोना",
  ar: "غسل الملابس",
  zh: "洗衣服",
  ja: "衣類の洗濯",
  bn: "কাপড় ধোয়া"
},
dryingClothes: {
  en: "Drying clothes",
  kn: "ಬಟ್ಟೆಗಳನ್ನು ಒಣಗಿಸುವುದು",
  fr: "Sécher les vêtements",
  de: "Kleidung trocknen",
  it: "Asciugare i vestiti",
  pt: "Secar roupas",
  hi: "कपड़े सुखाना",
  ar: "تجفيف الملابس",
  zh: "晾衣服",
  ja: "衣類の乾燥",
  bn: "কাপড় শুকানো"
},
foldingClothes: {
  en: "Folding clothes",
  kn: "ಬಟ್ಟೆಗಳನ್ನು ಮಡಚುವುದು",
  fr: "Plier les vêtements",
  de: "Kleidung falten",
  it: "Piegare i vestiti",
  pt: "Dobrar roupas",
  hi: "कपड़े मोड़ना",
  ar: "طي الملابس",
  zh: "叠衣服",
  ja: "衣類をたたむ",
  bn: "কাপড় ভাঁজ করা"
},
ironingClothes: {
  en: "Ironing clothes",
  kn: "ಬಟ್ಟೆಗಳನ್ನು ಇಸ್ತ್ರಿ ಮಾಡುವುದು",
  fr: "Repasser les vêtements",
  de: "Kleidung bügeln",
  it: "Stirare i vestiti",
  pt: "Passar roupas",
  hi: "कपड़े इस्त्री करना",
  ar: "كي الملابس",
  zh: "熨衣服",
  ja: "衣類にアイロンをかける",
  bn: "কাপড় ইস্ত্রি করা"
},
errands: {
  en: "Errands",
  kn: "ಕೆಲಸಗಳು",
  fr: "Commissions",
  de: "Besorgungen",
  it: "Commissioni",
  pt: "Recados",
  hi: "काम-काज",
  ar: "المهمات",
  zh: "跑腿",
  ja: "用事",
  bn: "ছোটখাটো কাজ"
},
runningErrands: {
  en: "Running errands for customers",
  kn: "ಗ್ರಾಹಕರಿಗಾಗಿ ಕೆಲಸಗಳನ್ನು ಮಾಡುವುದು",
  fr: "Faire des courses pour les clients",
  de: "Besorgungen für Kunden erledigen",
  it: "Fare commissioni per i clienti",
  pt: "Fazer recados para os clientes",
  hi: "ग्राहकों के काम-काज करना",
  ar: "تنفيذ المهمات للعملاء",
  zh: "为客户跑腿",
  ja: "顧客の用事を済ませる",
  bn: "গ্রাহকদের জন্য ছোটখাটো কাজ করা"
},
pickingGroceries: {
  en: "Picking up groceries",
  kn: "ಕಿರಾಣಿ ಸಾಮಾನುಗಳನ್ನು ತರುವುದು",
  fr: "Faire les courses",
  de: "Lebensmittel abholen",
  it: "Fare la spesa",
  pt: "Pegar compras",
  hi: "किराने का सामान लाना",
  ar: "شراء البقالة",
  zh: "取杂货",
  ja: "食料品の受け取り",
  bn: "মুদি কেনাকাটা করা"
},
dryCleaningPickup: {
  en: "Dry cleaning pickup/dropoff",
  kn: "ಡ್ರೈ ಕ್ಲೀನಿಂಗ್ ಪಿಕಪ್/ಡ್ರಾಪ್ಆಫ್",
  fr: "Ramassage/dépôt de nettoyage à sec",
  de: "Abholung/Abgabe von chemischer Reinigung",
  it: "Ritiro/consegna in lavanderia",
  pt: "Retirada/entrega de lavanderia",
  hi: "ड्राई क्लीनिंग पिकअप/ड्रॉपऑफ",
  ar: "استلام/تسليم الملابس من وإلى المغسلة",
  zh: "干洗取送",
  ja: "ドライクリーニングの受け取り/配送",
  bn: "ড্রাই ক্লিনিং পিকআপ/ডেলিভারি"
},
respectfulProperty: {
  en: "Respectful of customer's property",
  kn: "ಗ್ರಾಹಕರ ಆಸ್ತಿಯನ್ನು ಗೌರವಿಸುವುದು",
  fr: "Respectueux de la propriété du client",
  de: "Respektvoll mit dem Eigentum des Kunden",
  it: "Rispettoso della proprietà del cliente",
  pt: "Respeitoso com a propriedade do cliente",
  hi: "ग्राहक की संपत्ति का सम्मान",
  ar: "احترام ممتلكات العميل",
  zh: "尊重客户的财产",
  ja: "顧客の財産を尊重",
  bn: "গ্রাহকের সম্পত্তির প্রতি সম্মান"
},
punctualReliable: {
  en: "Punctual and reliable",
  kn: "ಸಮಯಪಾಲನೆ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ",
  fr: "Ponctuel et fiable",
  de: "Pünktlich und zuverlässig",
  it: "Puntuale e affidabile",
  pt: "Pontual e confiável",
  hi: "समयनिष्ठ और विश्वसनीय",
  ar: "دقيق وموثوق",
  zh: "准时可靠",
  ja: "時間厳守で信頼できる",
  bn: "সময়নিষ্ঠ এবং নির্ভরযোগ্য"
},
professionalCourteous: {
  en: "Professional and courteous",
  kn: "ವೃತ್ತಿಪರ ಮತ್ತು ಸೌಜನ್ಯಯುತ",
  fr: "Professionnel et courtois",
  de: "Professionell und höflich",
  it: "Professionale e cortese",
  pt: "Profissional e cortês",
  hi: "पेशेवर और विनम्र",
  ar: "مهذب ومحترف",
  zh: "专业礼貌",
  ja: "プロフェッショナルで礼儀正しい",
  bn: "পেশাদার এবং ভদ্র"
},
discreetRespectful: {
  en: "Discreet and respectful of privacy",
  kn: "ವಿವೇಚನೆಯುಳ್ಳ ಮತ್ತು ಗೌಪ್ಯತೆಯನ್ನು ಗೌರವಿಸುವ",
  fr: "Discret et respectueux de la vie privée",
  de: "Diskret und respektvoll der Privatsphäre gegenüber",
  it: "Discreto e rispettoso della privacy",
  pt: "Discreto e respeitoso da privacidade",
  hi: "विवेकशील और गोपनीयता का सम्मान",
  ar: "متكتّم ومحترم للخصوصية",
  zh: "谨慎尊重隐私",
  ja: "慎重でプライバシーを尊重",
  bn: "বিবেচক এবং গোপনীয়তার প্রতি শ্রদ্ধাশীল"
},
cookServicesTitle: {
  en: "ServEaso Cook Services",
  kn: "ServEaso ಅಡುಗೆಯವರ ಸೇವೆಗಳು",
  fr: "Services de Cuisine ServEaso",
  de: "ServEaso Kochdienste",
  it: "Servizi di Cucina ServEaso",
  pt: "Serviços de Cozinha ServEaso",
  hi: "सर्वएसो की रसोइया सेवाएं",
  ar: "خدمات الطبخ من ServEaso",
  zh: "ServEaso厨师服务",
  ja: "ServEaso料理人サービス",
  bn: "সার্ভইজোর রাঁধুনি সেবা"
},
cookServicesDescription: {
  en: "Professional cooking services with strict standards",
  kn: "ಕಟ್ಟುನಿಟ್ಟಾದ ಮಾನದಂಡಗಳೊಂದಿಗೆ ವೃತ್ತಿಪರ ಅಡುಗೆ ಸೇವೆಗಳು",
  fr: "Services de cuisine professionnels avec des normes strictes",
  de: "Professionelle Kochdienste mit strengen Standards",
  it: "Servizi di cucina professionali con standard rigorosi",
  pt: "Serviços profissionais de culinária com padrões rigorosos",
  hi: "सख्त मानकों के साथ पेशेवर खाना पकाने की सेवाएं",
  ar: "خدمات طبخ احترافية بمعايير صارمة",
  zh: "具有严格标准的专业烹饪服务",
  ja: "厳格な基準を持つプロの料理サービス",
  bn: "কঠোর মান সহ পেশাদার রান্নার সেবা"
},
hygiene: {
  en: "Hygiene",
  kn: "ಸ್ವಚ್ಛತೆ",
  fr: "Hygiène",
  de: "Hygiene",
  it: "Igiene",
  pt: "Higiene",
  hi: "स्वच्छता",
  ar: "النظافة",
  zh: "卫生",
  ja: "衛生",
  bn: "স্বাস্থ্যবিধি"
},
strictHygiene: {
  en: "Adhere to strict hygiene standards",
  kn: "ಕಟ್ಟುನಿಟ್ಟಾದ ಸ್ವಚ್ಛತಾ ಮಾನದಂಡಗಳನ್ನು ಅನುಸರಿಸಿ",
  fr: "Respecter des normes d'hygiène strictes",
  de: "Einhaltung strenger Hygienestandards",
  it: "Rispettare rigorosi standard igienici",
  pt: "Cumprir padrões rigorosos de higiene",
  hi: "सख्त स्वच्छता मानकों का पालन करें",
  ar: "الالتزام بمعايير النظافة الصارمة",
  zh: "遵守严格的卫生标准",
  ja: "厳格な衛生基準を遵守",
  bn: "কঠোর স্বাস্থ্যবিধি মান মেনে চলা"
},
frequentHandwashing: {
  en: "Frequent handwashing",
  kn: "ಆಗಾಗ್ಗೆ ಕೈ ತೊಳೆಯುವುದು",
  fr: "Lavage fréquent des mains",
  de: "Häufiges Händewaschen",
  it: "Lavaggio frequente delle mani",
  pt: "Lavagem frequente das mãos",
  hi: "बार-बार हाथ धोना",
  ar: "غسل اليدين بشكل متكرر",
  zh: "经常洗手",
  ja: "頻繁な手洗い",
  bn: "ঘন ঘন হাত ধোয়া"
},
cleanUniforms: {
  en: "Wear clean uniforms and hairnets",
  kn: "ಸ್ವಚ್ಛ ಸಮವಸ್ತ್ರ ಮತ್ತು ಕೂದಲಿನ ಜಾಲರಿ ಧರಿಸಿ",
  fr: "Porter des uniformes propres et des charlottes",
  de: "Tragen sauberer Uniformen und Haarnetze",
  it: "Indossare uniformi pulite e retine per capelli",
  pt: "Usar uniformes limpos e redes para o cabelo",
  hi: "साफ वर्दी और हेयरनेट पहनें",
  ar: "ارتداء زيّ نظيف وشبكات شعر",
  zh: "穿戴干净的制服和发网",
  ja: "清潔なユニフォームとヘアネットを着用",
  bn: "পরিষ্কার ইউনিফর্ম এবং হেয়ারনেট পরিধান"
},
spotlessEnvironment: {
  en: "Maintain spotless work environment",
  kn: "ನಿರ್ಮಲ ಕಾರ್ಯ ವಾತಾವರಣವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ",
  fr: "Maintenir un environnement de travail impeccable",
  de: "Aufrechterhaltung einer makellosen Arbeitsumgebung",
  it: "Mantenere un ambiente di lavoro impeccabile",
  pt: "Manter um ambiente de trabalho impecável",
  hi: "बेदाग कार्य वातावरण बनाए रखें",
  ar: "الحفاظ على بيئة عمل نظيفة",
  zh: "保持一尘不染的工作环境",
  ja: "清潔な作業環境を維持",
  bn: "নির্মল কাজের পরিবেশ বজায় রাখা"
},
temperatureControl: {
  en: "Temperature Control",
  kn: "ತಾಪಮಾನ ನಿಯಂತ್ರಣ",
  fr: "Contrôle de la Température",
  de: "Temperaturkontrolle",
  it: "Controllo della Temperatura",
  pt: "Controle de Temperatura",
  hi: "तापमान नियंत्रण",
  ar: "التحكم في درجة الحرارة",
  zh: "温度控制",
  ja: "温度管理",
  bn: "তাপমাত্রা নিয়ন্ত্রণ"
},
monitorTemperatures: {
  en: "Meticulously monitor food temperatures",
  kn: "ಆಹಾರದ ತಾಪಮಾನವನ್ನು ನಿಖರವಾಗಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ",
  fr: "Surveiller méticuleusement les températures des aliments",
  de: "Akribische Überwachung der Lebensmitteltemperaturen",
  it: "Monitorare meticolosamente le temperature degli alimenti",
  pt: "Monitorar meticulosamente as temperaturas dos alimentos",
  hi: "भोजन के तापमान की सूक्ष्मता से निगरानी करें",
  ar: "مراقبة دقيقة لدرجات حرارة الطعام",
  zh: " meticulously监测食物温度",
  ja: "細心の注意を払って食品の温度を監視",
  bn: "সতর্কতার সাথে খাবারের তাপমাত্রা পর্যবেক্ষণ"
},
preventBacterialGrowth: {
  en: "Prevent bacterial growth",
  kn: "ಬ್ಯಾಕ್ಟೀರಿಯಾದ ಬೆಳವಣಿಗೆಯನ್ನು ತಡೆಗಟ್ಟಿ",
  fr: "Prévenir la croissance bactérienne",
  de: "Bakterienwachstum verhindern",
  it: "Prevenire la crescita batterica",
  pt: "Prevenir o crescimento bacteriano",
  hi: "जीवाणु वृद्धि को रोकें",
  ar: "منع نمو البكتيريا",
  zh: "防止细菌生长",
  ja: "細菌の増殖を防ぐ",
  bn: "ব্যাকটেরিয়া বৃদ্ধি প্রতিরোধ"
},
properCookingStorage: {
  en: "Ensure proper cooking, storage, and reheating",
  kn: "ಸರಿಯಾದ ಅಡುಗೆ, ಸಂಗ್ರಹಣೆ ಮತ್ತು ಮತ್ತೆ ಬಿಸಿಮಾಡುವುದನ್ನು ಖಚಿತಪಡಿಸಿ",
  fr: "Assurer une cuisson, un stockage et un réchauffage appropriés",
  de: "Sicherstellung ordnungsgemäßen Kochens, Lagerns und Aufwärmens",
  it: "Garantire una corretta cottura, conservazione e riscaldamento",
  pt: "Garantir cozimento, armazenamento e reaquecimento adequados",
  hi: "उचित खाना पकाने, भंडारण और दोबारा गर्म करने को सुनिश्चित करें",
  ar: "ضمان الطهي والتخزين وإعادة التسخين بشكل صحيح",
  zh: "确保正确的烹饪、储存和重新加热",
  ja: "適切な調理、保存、再加熱を確保",
  bn: "সঠিক রান্না, সংরক্ষণ এবং পুনরায় গরম করা নিশ্চিত"
},
allergenAwareness: {
  en: "Allergen Awareness",
  kn: "ಅಲರ್ಜಿನ್ ಅರಿವು",
  fr: "Sensibilisation aux Allergènes",
  de: "Allergenbewusstsein",
  it: "Consapevolezza degli Allergeni",
  pt: "Conscientização sobre Alérgenos",
  hi: "एलर्जेन जागरूकता",
  ar: "التوعية بالمواد المسببة للحساسية",
  zh: "过敏原意识",
  ja: "アレルゲン認識",
  bn: "অ্যালার্জেন সচেতনতা"
},
handleAllergens: {
  en: "Handle allergens carefully",
  kn: "ಅಲರ್ಜಿನ್ಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸಿ",
  fr: "Manipuler les allergènes avec soin",
  de: "Sorgfältiger Umgang mit Allergenen",
  it: "Maneggiare gli allergeni con cura",
  pt: "Manusear alérgenos com cuidado",
  hi: "एलर्जेन को सावधानी से संभालें",
  ar: "التعامل مع المواد المسببة للحساسية بحذر",
  zh: "小心处理过敏原",
  ja: "アレルゲンを慎重に扱う",
  bn: "অ্যালার্জেন সাবধানে পরিচালনা"
},
preventCrossContamination: {
  en: "Prevent cross-contamination",
  kn: "ಅಡ್ಡ-ಮಾಲಿನ್ಯವನ್ನು ತಡೆಗಟ್ಟಿ",
  fr: "Prévenir la contamination croisée",
  de: "Kreuzkontamination verhindern",
  it: "Prevenire la contaminazione incrociata",
  pt: "Prevenir contaminação cruzada",
  hi: "क्रॉस-संदूषण को रोकें",
  ar: "منع التلوث المتبادل",
  zh: "防止交叉污染",
  ja: "交差汚染を防ぐ",
  bn: "ক্রস-দূষণ প্রতিরোধ"
},
accurateAllergenInfo: {
  en: "Provide accurate allergen information",
  kn: "ನಿಖರವಾದ ಅಲರ್ಜಿನ್ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ",
  fr: "Fournir des informations précises sur les allergènes",
  de: "Bereitstellung genauer Allergeninformationen",
  it: "Fornire informazioni accurate sugli allergeni",
  pt: "Fornecer informações precisas sobre alérgenos",
  hi: "सटीक एलर्जेन जानकारी प्रदान करें",
  ar: "توفير معلومات دقيقة عن المواد المسببة للحساسية",
  zh: "提供准确的过敏原信息",
  ja: "正確なアレルゲン情報を提供",
  bn: "সঠিক অ্যালার্জেন তথ্য প্রদান"
},
safeFoodHandling: {
  en: "Safe Food Handling",
  kn: "ಸುರಕ್ಷಿತ ಆಹಾರ ನಿರ್ವಹಣೆ",
  fr: "Manipulation Sécuritaire des Aliments",
  de: "Sicherer Umgang mit Lebensmitteln",
  it: "Manipolazione Sicura degli Alimenti",
  pt: "Manuseio Seguro de Alimentos",
  hi: "सुरक्षित भोजन प्रबंधन",
  ar: "التعامل الآمن مع الطعام",
  zh: "安全食品处理",
  ja: "安全な食品取扱い",
  bn: "নিরাপদ খাদ্য পরিচালনা"
},
followProcedures: {
  en: "Follow proper procedures for raw and cooked foods",
  kn: "ಕಚ್ಚಾ ಮತ್ತು ಬೇಯಿಸಿದ ಆಹಾರಗಳಿಗೆ ಸರಿಯಾದ ಕಾರ್ಯವಿಧಾನಗಳನ್ನು ಅನುಸರಿಸಿ",
  fr: "Suivre les procédures appropriées pour les aliments crus et cuits",
  de: "Befolgung der richtigen Verfahren für rohe und gekochte Lebensmittel",
  it: "Seguire le procedure corrette per alimenti crudi e cotti",
  pt: "Seguir procedimentos adequados para alimentos crus e cozidos",
  hi: "कच्चे और पके हुए खाद्य पदार्थों के लिए उचित प्रक्रियाओं का पालन करें",
  ar: "اتباع الإجراءات المناسبة للأطعمة النيئة والمطبوخة",
  zh: "遵循生熟食品的正确程序",
  ja: "生鮮食品と調理済み食品の適切な手順に従う",
  bn: "কাঁচা এবং রান্না করা খাবারের জন্য সঠিক পদ্ধতি অনুসরণ"
},
minimizeContamination: {
  en: "Minimize contamination risk",
  kn: "ಮಾಲಿನ್ಯದ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡಿ",
  fr: "Minimiser les risques de contamination",
  de: "Minimierung des Kontaminationsrisikos",
  it: "Minimizzare il rischio di contaminazione",
  pt: "Minimizar o risco de contaminação",
  hi: "संदूषण जोखिम को कम करें",
  ar: "تقليل مخاطر التلوث",
  zh: "最小化污染风险",
  ja: "汚染リスクを最小限に抑える",
  bn: "দূষণের ঝুঁকি কমানো"
},
freshness: {
  en: "Freshness",
  kn: "ತಾಜಾತನ",
  fr: "Fraîcheur",
  de: "Frische",
  it: "Freschezza",
  pt: "Frescura",
  hi: "ताजगी",
  ar: "النضارة",
  zh: "新鲜度",
  ja: "新鮮さ",
  bn: "তাজাতা"
},
freshIngredients: {
  en: "Use fresh, high-quality ingredients",
  kn: "ತಾಜಾ, ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಪದಾರ್ಥಗಳನ್ನು ಬಳಸಿ",
  fr: "Utiliser des ingrédients frais et de haute qualité",
  de: "Verwendung frischer, hochwertiger Zutaten",
  it: "Usare ingredienti freschi e di alta qualità",
  pt: "Usar ingredientes frescos e de alta qualidade",
  hi: "ताजा, उच्च गुणवत्ता वाली सामग्री का उपयोग करें",
  ar: "استخدام مكونات طازجة وعالية الجودة",
  zh: "使用新鲜、高品质的食材",
  ja: "新鮮で高品質の食材を使用",
  bn: "তাজা, উচ্চমানের উপকরণ ব্যবহার"
},
selectBestProduce: {
  en: "Select best produce, meats, and components",
  kn: "ಅತ್ಯುತ್ತಮ ಉತ್ಪನ್ನಗಳು, ಮಾಂಸಗಳು ಮತ್ತು ಘಟಕಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  fr: "Sélectionner les meilleurs produits, viandes et composants",
  de: "Auswahl der besten Produkte, Fleischsorten und Komponenten",
  it: "Selezionare i migliori prodotti, carni e componenti",
  pt: "Selecionar os melhores produtos, carnes e componentes",
  hi: "सर्वोत्तम उपज, मांस और घटकों का चयन करें",
  ar: "اختيار أفضل المنتجات واللحوم والمكونات",
  zh: "选择最好的农产品、肉类和配料",
  ja: "最高の農産物、肉、食材を選ぶ",
  bn: "সেরা ফলমূল, মাংস এবং উপাদান নির্বাচন"
},
properTechniques: {
  en: "Proper Techniques",
  kn: "ಸರಿಯಾದ ತಂತ್ರಗಳು",
  fr: "Techniques Appropriées",
  de: "Richtige Techniken",
  it: "Tecniche Adeguate",
  pt: "Técnicas Adequadas",
  hi: "उचित तकनीक",
  ar: "التقنيات المناسبة",
  zh: "适当的技术",
  ja: "適切な技術",
  bn: "সঠিক কৌশল"
},
employTechniques: {
  en: "Employ proper cooking techniques",
  kn: "ಸರಿಯಾದ ಅಡುಗೆ ತಂತ್ರಗಳನ್ನು ಬಳಸಿ",
  fr: "Employer des techniques de cuisson appropriées",
  de: "Anwendung richtiger Kochtechniken",
  it: "Impiegare tecniche di cottura adeguate",
  pt: "Empregar técnicas de culinária adequadas",
  hi: "उचित खाना पकाने की तकनीकों का प्रयोग करें",
  ar: "استخدام تقنيات الطهي المناسبة",
  zh: "采用适当的烹饪技术",
  ja: "適切な調理技術を用いる",
  bn: "সঠিক রান্নার কৌশল প্রয়োগ"
},
maximizeFlavor: {
  en: "Maximize flavor, texture, and nutritional value",
  kn: "ರುಚಿ, ವಿನ್ಯಾಸ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶದ ಮೌಲ್ಯವನ್ನು ಗರಿಷ್ಠಗೊಳಿಸಿ",
  fr: "Maximiser la saveur, la texture et la valeur nutritionnelle",
  de: "Maximierung von Geschmack, Textur und Nährwert",
  it: "Massimizzare sapore, consistenza e valore nutrizionale",
  pt: "Maximizar sabor, textura e valor nutricional",
  hi: "स्वाद, बनावट और पोषण मूल्य को अधिकतम करें",
  ar: "تعظيم النكهة والملمس والقيمة الغذائية",
  zh: "最大化风味、口感和营养价值",
  ja: "風味、食感、栄養価を最大化",
  bn: "স্বাদ, টেক্সচার এবং পুষ্টিগুণ সর্বাধিক করা"
},
highestStandards: {
  en: "Ensure highest preparation standards",
  kn: "ಅತ್ಯುನ್ನತ ತಯಾರಿ ಮಾನದಂಡಗಳನ್ನು ಖಚಿತಪಡಿಸಿ",
  fr: "Assurer les normes de préparation les plus élevées",
  de: "Gewährleistung höchster Zubereitungsstandards",
  it: "Garantire i più alti standard di preparazione",
  pt: "Garantir os mais altos padrões de preparo",
  hi: "उच्चतम तैयारी मानकों को सुनिश्चित करें",
  ar: "ضمان أعلى معايير الإعداد",
  zh: "确保最高的准备标准",
  ja: "最高の調理基準を確保",
  bn: "সর্বোচ্চ প্রস্তুতির মান নিশ্চিত"
},
attentionToDetail: {
  en: "Attention to Detail",
  kn: "ವಿವರಗಳಿಗೆ ಗಮನ",
  fr: "Attention aux Détails",
  de: "Liebe zum Detail",
  it: "Attenzione ai Dettagli",
  pt: "Atenção aos Detalhes",
  hi: "विस्तार पर ध्यान",
  ar: "الاهتمام بالتفاصيل",
  zh: "注重细节",
  ja: "細部へのこだわり",
  bn: "বিস্তারিত মনোযোগ"
},
closeAttention: {
  en: "Pay close attention to every step",
  kn: "ಪ್ರತಿ ಹಂತಕ್ಕೂ ನಿಕಟ ಗಮನ ಕೊಡಿ",
  fr: "Prêter une attention particulière à chaque étape",
  de: "Jeden Schritt genau beachten",
  it: "Prestare molta attenzione ad ogni passaggio",
  pt: "Prestar muita atenção a cada etapa",
  hi: "हर कदम पर पूरा ध्यान दें",
  ar: "إيلاء اهتمام وثيق لكل خطوة",
  zh: "密切关注每一步",
  ja: "すべての工程に細心の注意を払う",
  bn: "প্রতিটি ধাপে গভীর মনোযোগ দেওয়া"
},
choppingToPlating: {
  en: "From chopping vegetables to final plating",
  kn: "ತರಕಾರಿಗಳನ್ನು ಕತ್ತರಿಸುವುದರಿಂದ ಹಿಡಿದು ಅಂತಿಮ ಪ್ಲೇಟಿಂಗ್ವರೆಗೆ",
  fr: "De la coupe des légumes à la présentation finale",
  de: "Vom Gemüseschneiden bis zum finalen Anrichten",
  it: "Dal taglio delle verdure all'impiattamento finale",
  pt: "Do corte de legumes à apresentação final",
  hi: "सब्जियां काटने से लेकर अंतिम प्लेटिंग तक",
  ar: "من تقطيع الخضار إلى التقديم النهائي",
  zh: "从切菜到最后的摆盘",
  ja: "野菜の切り方から盛り付けまで",
  bn: "সবজি কাটা থেকে চূড়ান্ত পরিবেশন পর্যন্ত"
},
consistencyVisual: {
  en: "Ensure consistency and visual appeal",
  kn: "ಸ್ಥಿರತೆ ಮತ್ತು ದೃಶ್ಯ ಆಕರ್ಷಣೆಯನ್ನು ಖಚಿತಪಡಿಸಿ",
  fr: "Assurer la cohérence et l'attrait visuel",
  de: "Sicherstellung von Konsistenz und optischer Attraktivität",
  it: "Garantire coerenza e appeal visivo",
  pt: "Garantir consistência e apelo visual",
  hi: "स्थिरता और दृश्य अपील सुनिश्चित करें",
  ar: "ضمان الاتساق والجاذبية البصرية",
  zh: "确保一致性和视觉吸引力",
  ja: "一貫性と視覚的魅力を確保",
  bn: "সংগতি এবং দৃশ্যমান আবেদন নিশ্চিত"
},
dietaryRestrictions: {
  en: "Dietary Restrictions",
  kn: "ಆಹಾರ ನಿರ್ಬಂಧಗಳು",
  fr: "Restrictions Alimentaires",
  de: "Ernährungsbeschränkungen",
  it: "Restrizioni Dietetiche",
  pt: "Restrições Alimentares",
  hi: "आहार प्रतिबंध",
  ar: "القيود الغذائية",
  zh: "饮食限制",
  ja: "食事制限",
  bn: "খাদ্যতালিকাগত সীমাবদ্ধতা"
},
accommodateGlutenFree: {
  en: "Accommodate gluten-free needs",
  kn: "ಗ್ಲುಟನ್-ಮುಕ್ತ ಅಗತ್ಯಗಳನ್ನು ಪೂರೈಸಿ",
  fr: "Répondre aux besoins sans gluten",
  de: "Berücksichtigung glutenfreier Bedürfnisse",
  it: "Soddisfare esigenze senza glutine",
  pt: "Atender necessidades sem glúten",
  hi: "ग्लूटेन-मुक्त आवश्यकताओं को पूरा करें",
  ar: "تلبية الاحتياجات الخالية من الغلوتين",
  zh: "满足无麸质需求",
  ja: "グルテンフリーのニーズに対応",
  bn: "গ্লুটেন-মুক্ত প্রয়োজন মেটানো"
},
vegetarianVegan: {
  en: "Prepare vegetarian and vegan meals",
  kn: "ಸಸ್ಯಾಹಾರಿ ಮತ್ತು ವೇಗನ್ ಊಟಗಳನ್ನು ತಯಾರಿಸಿ",
  fr: "Préparer des repas végétariens et végétaliens",
  de: "Zubereitung vegetarischer und veganer Mahlzeiten",
  it: "Preparare pasti vegetariani e vegani",
  pt: "Preparar refeições vegetarianas e veganas",
  hi: "शाकाहारी और वीगन भोजन तैयार करें",
  ar: "تحضير وجبات نباتية ونباتية صرفة",
  zh: "准备素食和纯素餐点",
  ja: "ベジタリアンとビーガンの食事を準備",
  bn: "নিরামিষ এবং ভেগান খাবার প্রস্তুত"
},
specificAllergies: {
  en: "Tailor to specific allergies/intolerances",
  kn: "ನಿರ್ದಿಷ್ಟ ಅಲರ್ಜಿಗಳು/ಅಸಹಿಷ್ಣುತೆಗಳಿಗೆ ಹೊಂದಿಸಿ",
  fr: "Adapter aux allergies/intolérances spécifiques",
  de: "Anpassung an spezifische Allergien/Unverträglichkeiten",
  it: "Adattare ad allergie/intolleranze specifiche",
  pt: "Adaptar a alergias/intolerâncias específicas",
  hi: "विशिष्ट एलर्जी/असहिष्णुता के अनुरूप बनाएं",
  ar: "التكيف مع الحساسية/عدم التحمل المحددة",
  zh: "针对特定过敏/不耐受进行调整",
  ja: "特定のアレルギー/不耐性に合わせる",
  bn: "নির্দিষ্ট অ্যালার্জি/অসহিষ্ণুতার সাথে মানিয়ে নেওয়া"
},
customization: {
  en: "Customization",
  kn: "ಗ್ರಾಹಕೀಕರಣ",
  fr: "Personnalisation",
  de: "Anpassung",
  it: "Personalizzazione",
  pt: "Personalização",
  hi: "अनुकूलन",
  ar: "التخصيص",
  zh: "定制",
  ja: "カスタマイズ",
  bn: "কাস্টমাইজেশন"
},
adjustSpice: {
  en: "Adjust spice levels",
  kn: "ಮಸಾಲೆಯ ಮಟ್ಟವನ್ನು ಹೊಂದಿಸಿ",
  fr: "Ajuster les niveaux d'épices",
  de: "Anpassung der Schärfegrade",
  it: "Regolare i livelli di spezie",
  pt: "Ajustar níveis de tempero",
  hi: "मसाला स्तर समायोजित करें",
  ar: "تعديل مستويات البهارات",
  zh: "调整辣度",
  ja: "香辛料のレベルを調整",
  bn: "মসলার মাত্রা সামঞ্জস্য"
},
modifyIngredients: {
  en: "Modify ingredients",
  kn: "ಪದಾರ್ಥಗಳನ್ನು ಮಾರ್ಪಡಿಸಿ",
  fr: "Modifier les ingrédients",
  de: "Zutaten ändern",
  it: "Modificare gli ingredienti",
  pt: "Modificar ingredientes",
  hi: "सामग्री संशोधित करें",
  ar: "تعديل المكونات",
  zh: "修改食材",
  ja: "材料を変更",
  bn: "উপকরণ পরিবর্তন"
},
customizePortions: {
  en: "Customize portion sizes",
  kn: "ಭಾಗದ ಗಾತ್ರಗಳನ್ನು ಗ್ರಾಹಕೀಕರಿಸಿ",
  fr: "Personnaliser les tailles des portions",
  de: "Anpassung der Portionsgrößen",
  it: "Personalizzare le dimensioni delle porzioni",
  pt: "Personalizar tamanhos das porções",
  hi: "भाग के आकार को अनुकूलित करें",
  ar: "تخصيص أحجام الحصص",
  zh: "定制份量大小",
  ja: "分量をカスタマイズ",
  bn: "পরিবেশনের আকার কাস্টমাইজ"
},
caregiverServicesTitle: {
  en: "ServEaso Caregiver Services",
  kn: "ServEaso ಆರೈಕೆದಾರ ಸೇವೆಗಳು",
  fr: "Services de Soignant ServEaso",
  de: "ServEaso Pflegedienste",
  it: "Servizi di Assistenza ServEaso",
  pt: "Serviços de Cuidador ServEaso",
  hi: "सर्वएसो की देखभालकर्ता सेवाएं",
  ar: "خدمات مقدمي الرعاية من ServEaso",
  zh: "ServEaso护理人员服务",
  ja: "ServEaso介護サービス",
  bn: "সার্ভইজোর পরিচর্যাকারী সেবা"
},
caregiverServicesDescription: {
  en: "Professional child care services",
  kn: "ವೃತ್ತಿಪರ ಮಕ್ಕಳ ಆರೈಕೆ ಸೇವೆಗಳು",
  fr: "Services professionnels de garde d'enfants",
  de: "Professionelle Kinderbetreuungsdienste",
  it: "Servizi professionali per la cura dei bambini",
  pt: "Serviços profissionais de cuidado infantil",
  hi: "पेशेवर बच्चों की देखभाल सेवाएं",
  ar: "خدمات رعاية الأطفال المهنية",
  zh: "专业儿童护理服务",
  ja: "プロのチャイルドケアサービス",
  bn: "পেশাদার শিশু যত্ন সেবা"
},
nurtureEnvironment: {
  en: "Nurture and Safe Environment",
  kn: "ಪೋಷಣೆ ಮತ್ತು ಸುರಕ್ಷಿತ ವಾತಾವರಣ",
  fr: "Environnement Nourrissant et Sûr",
  de: "Fürsorgliche und sichere Umgebung",
  it: "Ambiente Nutriente e Sicuro",
  pt: "Ambiente Nutritivo e Seguro",
  hi: "पोषण और सुरक्षित वातावरण",
  ar: "بيئة راعية وآمنة",
  zh: "培育和安全的环境",
  ja: "育成と安全な環境",
  bn: "লালন এবং নিরাপদ পরিবেশ"
},
lovingSupportive: {
  en: "Provide loving and supportive environment",
  kn: "ಪ್ರೀತಿಯ ಮತ್ತು ಬೆಂಬಲಿಸುವ ವಾತಾವರಣವನ್ನು ಒದಗಿಸಿ",
  fr: "Fournir un environnement aimant et favorable",
  de: "Bereitstellung einer liebevollen und unterstützenden Umgebung",
  it: "Fornire un ambiente amorevole e di supporto",
  pt: "Fornecer um ambiente amoroso e de apoio",
  hi: "प्यार और सहायक वातावरण प्रदान करें",
  ar: "توفير بيئة محبة وداعمة",
  zh: "提供充满爱心和支持的环境",
  ja: "愛情とサポートのある環境を提供",
  bn: "স্নেহময় এবং সহায়ক পরিবেশ প্রদান"
},
safeSecure: {
  en: "Children feel safe, secure, and understood",
  kn: "ಮಕ್ಕಳು ಸುರಕ್ಷಿತ, ಭದ್ರ ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲ್ಪಟ್ಟ ಭಾವನೆ ಹೊಂದಿರುತ್ತಾರೆ",
  fr: "Les enfants se sentent en sécurité, protégés et compris",
  de: "Kinder fühlen sich sicher, geborgen und verstanden",
  it: "I bambini si sentono al sicuro, protetti e compresi",
  pt: "As crianças se sentem seguras, protegidas e compreendidas",
  hi: "बच्चे सुरक्षित, संरक्षित और समझा हुआ महसूस करते हैं",
  ar: "يشعر الأطفال بالأمان والأمان والفهم",
  zh: "孩子感到安全、有保障和被理解",
  ja: "子供たちは安全で、守られ、理解されていると感じる",
  bn: "শিশুরা নিরাপদ, সুরক্ষিত এবং বোঝা অনুভব করে"
},
comfortEncouragement: {
  en: "Offer comfort and encouragement",
  kn: "ಆಶ್ವಾಸನೆ ಮತ್ತು ಪ್ರೋತ್ಸಾಹವನ್ನು ನೀಡಿ",
  fr: "Offrir réconfort et encouragement",
  de: "Trost und Ermutigung bieten",
  it: "Offrire conforto e incoraggiamento",
  pt: "Oferecer conforto e incentivo",
  hi: "आराम और प्रोत्साहन प्रदान करें",
  ar: "تقديم الراحة والتشجيع",
  zh: "提供安慰和鼓励",
  ja: "慰めと励ましを提供",
  bn: "সান্ত্বনা এবং উত্সাহ প্রদান"
},
emotionalConnection: {
  en: "Build strong emotional connection",
  kn: "ಬಲವಾದ ಭಾವನಾತ್ಮಕ ಸಂಪರ್ಕವನ್ನು ನಿರ್ಮಿಸಿ",
  fr: "Établir un lien émotionnel fort",
  de: "Aufbau einer starken emotionalen Verbindung",
  it: "Costruire un forte legame emotivo",
  pt: "Construir uma forte conexão emocional",
  hi: "मजबूत भावनात्मक संबंध बनाएं",
  ar: "بناء رابط عاطفي قوي",
  zh: "建立强烈的情感联系",
  ja: "強い感情的なつながりを築く",
  bn: "শক্তিশালী মানসিক সংযোগ গড়ে তোলা"
},
physicalSafety: {
  en: "Physical Safety",
  kn: "ದೈಹಿಕ ಸುರಕ್ಷತೆ",
  fr: "Sécurité Physique",
  de: "Physische Sicherheit",
  it: "Sicurezza Fisica",
  pt: "Segurança Física",
  hi: "शारीरिक सुरक्षा",
  ar: "السلامة البدنية",
  zh: "人身安全",
  ja: "身体的 safety",
  bn: "শারীরিক নিরাপত্তা"
},
hazardFree: {
  en: "Ensure hazard-free environment",
  kn: "ಅಪಾಯ-ಮುಕ್ತ ವಾತಾವರಣವನ್ನು ಖಚಿತಪಡಿಸಿ",
  fr: "Assurer un environnement sans danger",
  de: "Gewährleistung einer gefahrenfreien Umgebung",
  it: "Garantire un ambiente privo di pericoli",
  pt: "Garantir um ambiente livre de perigos",
  hi: "खतरा-मुक्त वातावरण सुनिश्चित करें",
  ar: "ضمان بيئة خالية من المخاطر",
  zh: "确保无危险环境",
  ja: "危険のない環境を確保",
  bn: "বিপদমুক্ত পরিবেশ নিশ্চিত"
},
superviseActivities: {
  en: "Supervise all activities",
  kn: "ಎಲ್ಲಾ ಚಟುವಟಿಕೆಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ",
  fr: "Superviser toutes les activités",
  de: "Überwachung aller Aktivitäten",
  it: "Supervisionare tutte le attività",
  pt: "Supervisionar todas as atividades",
  hi: "सभी गतिविधियों की निगरानी करें",
  ar: "الإشراف على جميع الأنشطة",
  zh: "监督所有活动",
  ja: "すべての活動を監督",
  bn: "সমস্ত কার্যকলাপ তত্ত্বাবধান"
},
emergencyPrepared: {
  en: "Prepare for emergencies",
  kn: "ತುರ್ತು ಸಂದರ್ಭಗಳಿಗೆ ಸಿದ್ಧರಾಗಿ",
  fr: "Se préparer aux urgences",
  de: "Vorbereitung auf Notfälle",
  it: "Prepararsi alle emergenze",
  pt: "Preparar-se para emergências",
  hi: "आपात स्थितियों के लिए तैयार रहें",
  ar: "الاستعداد للحالات الطارئة",
  zh: "为紧急情况做好准备",
  ja: "緊急時に備える",
  bn: "জরুরি অবস্থার জন্য প্রস্তুত থাকা"
},
medicalSafety: {
  en: "Medical Safety",
  kn: "ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತೆ",
  fr: "Sécurité Médicale",
  de: "Medizinische Sicherheit",
  it: "Sicurezza Medica",
  pt: "Segurança Médica",
  hi: "चिकित्सा सुरक्षा",
  ar: "السلامة الطبية",
  zh: "医疗安全",
  ja: "医療 safety",
  bn: "চিকিৎসা নিরাপত্তা"
},
trainedCPR: {
  en: "Trained in CPR",
  kn: "CPR ನಲ್ಲಿ ತರಬೇತಿ ಪಡೆದಿದ್ದಾರೆ",
  fr: "Formé aux gestes de premiers secours",
  de: "In CPR geschult",
  it: "Addestrato al CPR",
  pt: "Treinado em RCP",
  hi: "सीपीआर में प्रशिक्षित",
  ar: "مدرب على الإنعاش القلبي الرئوي",
  zh: "接受过心肺复苏术培训",
  ja: "CPRの訓練を受けている",
  bn: "সিপিআর-এ প্রশিক্ষিত"
},
firstAidCertified: {
  en: "First aid certified for medical emergencies",
  kn: "ವೈದ್ಯಕೀಯ ತುರ್ತು ಸಂದರ್ಭಗಳಿಗೆ ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಪ್ರಮಾಣೀಕೃತ",
  fr: "Certifié aux premiers secours pour les urgences médicales",
  de: "Zertifiziert in Erster Hilfe für medizinische Notfälle",
  it: "Certificato al primo soccorso per emergenze mediche",
  pt: "Certificado em primeiros socorros para emergências médicas",
  hi: "चिकित्सा आपात स्थितियों के लिए प्राथमिक चिकित्सा प्रमाणित",
  ar: "معتمد في الإسعافات الأولية للحالات الطبية الطارئة",
  zh: "获得医疗急救认证",
  ja: "医療緊急事態に対する応急処置の認定",
  bn: "চিকিৎসা জরুরি অবস্থার জন্য প্রাথমিক চিকিৎসা প্রত্যয়িত"
},
cognitiveDevelopment: {
  en: "Cognitive Development",
  kn: "ಅರಿವಿನ ಬೆಳವಣಿಗೆ",
  fr: "Développement Cognitif",
  de: "Kognitive Entwicklung",
  it: "Sviluppo Cognitivo",
  pt: "Desenvolvimento Cognitivo",
  hi: "संज्ञानात्मक विकास",
  ar: "التطور المعرفي",
  zh: "认知发展",
  ja: "認知発達",
  bn: "জ্ঞানীয় বিকাশ"
},
ageAppropriateActivities: {
  en: "Engage in age-appropriate activities",
  kn: "ವಯಸ್ಸಿಗೆ ಸೂಕ್ತವಾದ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ",
  fr: "Participer à des activités adaptées à l'âge",
  de: "Teilnahme an altersgerechten Aktivitäten",
  it: "Impegnarsi in attività adatte all'età",
  pt: "Envolver-se em atividades adequadas à idade",
  hi: "आयु-उपयुक्त गतिविधियों में शामिल हों",
  ar: "المشاركة في أنشطة مناسبة للعمر",
  zh: "参与适合年龄的活动",
  ja: "年齢に適した活動に参加",
  bn: "বয়স-উপযুক্ত কার্যক্রমে অংশগ্রহণ"
},
readingEducational: {
  en: "Reading and educational games",
  kn: "ಓದುವುದು ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಆಟಗಳು",
  fr: "Lecture et jeux éducatifs",
  de: "Lesen und Lernspiele",
  it: "Lettura e giochi educativi",
  pt: "Leitura e jogos educativos",
  hi: "पढ़ना और शैक्षिक खेल",
  ar: "القراءة والألعاب التعليمية",
  zh: "阅读和教育游戏",
  ja: "読書と教育ゲーム",
  bn: "পড়া এবং শিক্ষামূলক খেলা"
},
exploreInterests: {
  en: "Explore children's interests",
  kn: "ಮಕ್ಕಳ ಆಸಕ್ತಿಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
  fr: "Explorer les intérêts des enfants",
  de: "Erkundung der Interessen von Kindern",
  it: "Esplorare gli interessi dei bambini",
  pt: "Explorar os interesses das crianças",
  hi: "बच्चों की रुचियों का अन्वेषण करें",
  ar: "استكشاف اهتمامات الأطفال",
  zh: "探索孩子的兴趣",
  ja: "子どもの興味を探る",
  bn: "শিশুদের আগ্রহ অন্বেষণ"
},
homeworkHelp: {
  en: "Help with homework",
  kn: "ಮನೆಕೆಲಸದಲ್ಲಿ ಸಹಾಯ",
  fr: "Aide aux devoirs",
  de: "Hilfe bei Hausaufgaben",
  it: "Aiuto con i compiti",
  pt: "Ajuda com a lição de casa",
  hi: "होमवर्क में मदद",
  ar: "المساعدة في الواجبات المنزلية",
  zh: "帮助做作业",
  ja: "宿題の手伝い",
  bn: "হোমওয়ার্কে সাহায্য"
},
encourageLearning: {
  en: "Encourage learning",
  kn: "ಕಲಿಕೆಯನ್ನು ಪ್ರೋತ್ಸಾಹಿಸಿ",
  fr: "Encourager l'apprentissage",
  de: "Förderung des Lernens",
  it: "Incoraggiare l'apprendimento",
  pt: "Incentivar o aprendizado",
  hi: "सीखने को प्रोत्साहित करें",
  ar: "تشجيع التعلم",
  zh: "鼓励学习",
  ja: "学習を奨励",
  bn: "শেখার উত্সাহ দেওয়া"
},
socialEmotional: {
  en: "Social/Emotional Development",
  kn: "ಸಾಮಾಜಿಕ/ಭಾವನಾತ್ಮಕ ಬೆಳವಣಿಗೆ",
  fr: "Développement Social/Émotionnel",
  de: "Soziale/Emotionale Entwicklung",
  it: "Sviluppo Sociale/Emotivo",
  pt: "Desenvolvimento Social/Emocional",
  hi: "सामाजिक/भावनात्मक विकास",
  ar: "التطور الاجتماعي/العاطفي",
  zh: "社交/情感发展",
  ja: "社会的/感情的発達",
  bn: "সামাজিক/আবেগীয় বিকাশ"
},
teachSharing: {
  en: "Teach sharing and empathy",
  kn: "ಹಂಚಿಕೊಳ್ಳುವುದು ಮತ್ತು ಸಹಾನುಭೂತಿಯನ್ನು ಕಲಿಸಿ",
  fr: "Apprendre le partage et l'empathie",
  de: "Teilen und Empathie lehren",
  it: "Insegnare a condividere e l'empatia",
  pt: "Ensinar a compartilhar e a empatia",
  hi: "साझा करना और सहानुभूति सिखाएं",
  ar: "تعليم المشاركة والتعاطف",
  zh: "教导分享和同理心",
  ja: "共有と共感を教える",
  bn: "ভাগ করে নেওয়া এবং সহানুভূতি শেখানো"
},
conflictResolution: {
  en: "Conflict resolution skills",
  kn: "ಸಂಘರ್ಷ ಪರಿಹಾರ ಕೌಶಲ್ಯಗಳು",
  fr: "Compétences en résolution de conflits",
  de: "Konfliktlösungsfähigkeiten",
  it: "Capacità di risoluzione dei conflitti",
  pt: "Habilidades de resolução de conflitos",
  hi: "संघर्ष समाधान कौशल",
  ar: "مهارات حل النزاعات",
  zh: "冲突解决技能",
  ja: "紛争解決スキル",
  bn: "দ্বন্দ্ব সমাধানের দক্ষতা"
},
selfConfidence: {
  en: "Develop self-confidence",
  kn: "ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಿ",
  fr: "Développer la confiance en soi",
  de: "Entwicklung von Selbstvertrauen",
  it: "Sviluppare la fiducia in se stessi",
  pt: "Desenvolver autoconfiança",
  hi: "आत्मविश्वास विकसित करें",
  ar: "تطوير الثقة بالنفس",
  zh: "培养自信心",
  ja: "自信を育む",
  bn: "আত্মবিশ্বাস বিকাশ"
},
emotionalIntelligence: {
  en: "Build emotional intelligence",
  kn: "ಭಾವನಾತ್ಮಕ ಬುದ್ಧಿಮತ್ತೆಯನ್ನು ನಿರ್ಮಿಸಿ",
  fr: "Développer l'intelligence émotionnelle",
  de: "Aufbau emotionaler Intelligenz",
  it: "Sviluppare l'intelligenza emotiva",
  pt: "Construir inteligência emocional",
  hi: "भावनात्मक बुद्धिमत्ता का निर्माण करें",
  ar: "بناء الذكاء العاطفي",
  zh: "培养情商",
  ja: "感情的知性を育む",
  bn: "আবেগীয় বুদ্ধিমত্তা গড়ে তোলা"
},
physicalDevelopment: {
  en: "Physical Development",
  kn: "ದೈಹಿಕ ಬೆಳವಣಿಗೆ",
  fr: "Développement Physique",
  de: "Körperliche Entwicklung",
  it: "Sviluppo Fisico",
  pt: "Desenvolvimento Físico",
  hi: "शारीरिक विकास",
  ar: "التطور البدني",
  zh: "身体发展",
  ja: "身体的発達",
  bn: "শারীরিক বিকাশ"
},
encourageActivity: {
  en: "Encourage physical activity",
  kn: "ದೈಹಿಕ ಚಟುವಟಿಕೆಯನ್ನು ಪ್ರೋತ್ಸಾಹಿಸಿ",
  fr: "Encourager l'activité physique",
  de: "Förderung körperlicher Aktivität",
  it: "Incoraggiare l'attività fisica",
  pt: "Incentivar a atividade física",
  hi: "शारीरिक गतिविधि को प्रोत्साहित करें",
  ar: "تشجيع النشاط البدني",
  zh: "鼓励体育活动",
  ja: "身体活動を奨励",
  bn: "শারীরিক কার্যকলাপ উত্সাহিত"
},
outdoorAdventures: {
  en: "Outdoor adventures",
  kn: "ಹೊರಾಂಗಣ ಸಾಹಸಗಳು",
  fr: "Aventures en plein air",
  de: "Abenteuer im Freien",
  it: "Avventure all'aperto",
  pt: "Aventuras ao ar livre",
  hi: "बाहरी रोमांच",
  ar: "مغامرات خارجية",
  zh: "户外探险",
  ja: "屋外での冒険",
  bn: "বাইরের দুঃসাহসিক কাজ"
},
ageSports: {
  en: "Age-appropriate sports",
  kn: "ವಯಸ್ಸಿಗೆ ಸೂಕ್ತವಾದ ಕ್ರೀಡೆಗಳು",
  fr: "Sports adaptés à l'âge",
  de: "Altersgerechte Sportarten",
  it: "Sport adatti all'età",
  pt: "Esportes adequados à idade",
  hi: "आयु-उपयुक्त खेल",
  ar: "رياضات مناسبة للعمر",
  zh: "适合年龄的运动",
  ja: "年齢に適したスポーツ",
  bn: "বয়স-উপযুক্ত খেলাধুলা"
},
healthyMeals: {
  en: "Prepare healthy meals and snacks",
  kn: "ಆರೋಗ್ಯಕರ ಊಟ ಮತ್ತು ತಿಂಡಿಗಳನ್ನು ತಯಾರಿಸಿ",
  fr: "Préparer des repas et collations sains",
  de: "Zubereitung gesunder Mahlzeiten und Snacks",
  it: "Preparare pasti e spuntini sani",
  pt: "Preparar refeições e lanches saudáveis",
  hi: "स्वस्थ भोजन और नाश्ता तैयार करें",
  ar: "تحضير وجبات ووجبات خفيفة صحية",
  zh: "准备健康的餐点和零食",
  ja: "健康的な食事とおやつを準備",
  bn: "স্বাস্থ্যকর খাবার এবং নাস্তা প্রস্তুত"
},
communication: {
  en: "Communication",
  kn: "ಸಂವಹನ",
  fr: "Communication",
  de: "Kommunikation",
  it: "Comunicazione",
  pt: "Comunicação",
  hi: "संचार",
  ar: "التواصل",
  zh: "沟通",
  ja: "コミュニケーション",
  bn: "যোগাযোগ"
},
openCommunication: {
  en: "Maintain open communication with parents",
  kn: "ಪೋಷಕರೊಂದಿಗೆ ಮುಕ್ತ ಸಂವಹನವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ",
  fr: "Maintenir une communication ouverte avec les parents",
  de: "Aufrechterhaltung einer offenen Kommunikation mit den Eltern",
  it: "Mantenere una comunicazione aperta con i genitori",
  pt: "Manter comunicação aberta com os pais",
  hi: "माता-पिता के साथ खुला संचार बनाए रखें",
  ar: "الحفاظ على تواصل مفتوح مع الوالدين",
  zh: "与父母保持开放沟通",
  ja: "親とのオープンなコミュニケーションを維持",
  bn: "পিতামাতার সাথে খোলা যোগাযোগ বজায় রাখা"
},
dailyUpdates: {
  en: "Share daily updates",
  kn: "ದೈನಂದಿನ ನವೀಕರಣಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
  fr: "Partager des mises à jour quotidiennes",
  de: "Tägliche Updates teilen",
  it: "Condividere aggiornamenti quotidiani",
  pt: "Compartilhar atualizações diárias",
  hi: "दैनिक अपडेट साझा करें",
  ar: "مشاركة التحديثات اليومية",
  zh: "分享每日更新",
  ja: "毎日の更新を共有",
  bn: "দৈনিক আপডেট শেয়ার করা"
},
discussProgress: {
  en: "Discuss development progress",
  kn: "ಬೆಳವಣಿಗೆಯ ಪ್ರಗತಿಯನ್ನು ಚರ್ಚಿಸಿ",
  fr: "Discuter des progrès du développement",
  de: "Besprechung des Entwicklungsfortschritts",
  it: "Discutere i progressi dello sviluppo",
  pt: "Discutir o progresso do desenvolvimento",
  hi: "विकास प्रगति पर चर्चा करें",
  ar: "مناقشة تقدم التطور",
  zh: "讨论发展进度",
  ja: "発達の進捗について話し合う",
  bn: "বিকাশের অগ্রগতি নিয়ে আলোচনা"
},
listenAttentively: {
  en: "Listen attentively to child",
  kn: "ಮಗುವಿಗೆ ಗಮನವಿಟ್ಟು ಕೇಳಿ",
  fr: "Écouter attentivement l'enfant",
  de: "Dem Kind aufmerksam zuhören",
  it: "Ascoltare attentamente il bambino",
  pt: "Ouvir atentamente a criança",
  hi: "बच्चे को ध्यान से सुनें",
  ar: "الاستماع بانتباه للطفل",
  zh: "认真倾听孩子",
  ja: "子どもの話に注意深く耳を傾ける",
  bn: "শিশুর কথা মনোযোগ দিয়ে শোনা"
},
respondEmpathy: {
  en: "Respond with empathy",
  kn: "ಸಹಾನುಭೂತಿಯಿಂದ ಪ್ರತಿಕ್ರಿಯಿಸಿ",
  fr: "Répondre avec empathie",
  de: "Mit Empathie reagieren",
  it: "Rispondere con empatia",
  pt: "Responder com empatia",
  hi: "सहानुभूति के साथ प्रतिक्रिया दें",
  ar: "الرد بتعاطف",
  zh: "以同理心回应",
  ja: "共感を持って応答",
  bn: "সহানুভূতির সাথে সাড়া দেওয়া"
},
collaboration: {
  en: "Collaboration",
  kn: "ಸಹಯೋಗ",
  fr: "Collaboration",
  de: "Zusammenarbeit",
  it: "Collaborazione",
  pt: "Colaboração",
  hi: "सहयोग",
  ar: "التعاون",
  zh: "合作",
  ja: "協力",
  bn: "সহযোগিতা"
},
workPartnership: {
  en: "Work in partnership with parents",
  kn: "ಪೋಷಕರೊಂದಿಗೆ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಕೆಲಸ ಮಾಡಿ",
  fr: "Travailler en partenariat avec les parents",
  de: "Zusammenarbeit mit den Eltern",
  it: "Lavorare in collaborazione con i genitori",
  pt: "Trabalhar em parceria com os pais",
  hi: "माता-पिता के साथ साझेदारी में काम करें",
  ar: "العمل بشراكة مع الوالدين",
  zh: "与父母合作",
  ja: "親と協力して働く",
  bn: "পিতামাতার সাথে অংশীদারিত্বে কাজ করা"
},
consistencyCare: {
  en: "Ensure consistency in care",
  kn: "ಆರೈಕೆಯಲ್ಲಿ ಸ್ಥಿರತೆಯನ್ನು ಖಚಿತಪಡಿಸಿ",
  fr: "Assurer la cohérence des soins",
  de: "Sicherstellung der Konsistenz in der Pflege",
  it: "Garantire coerenza nella cura",
  pt: "Garantir consistência no cuidado",
  hi: "देखभाल में स्थिरता सुनिश्चित करें",
  ar: "ضمان الاتساق في الرعاية",
  zh: "确保护理的一致性",
  ja: "ケアの一貫性を確保",
  bn: "যত্নে ধারাবাহিকতা নিশ্চিত"
},
respectValues: {
  en: "Respect parents' values",
  kn: "ಪೋಷಕರ ಮೌಲ್ಯಗಳನ್ನು ಗೌರವಿಸಿ",
  fr: "Respecter les valeurs des parents",
  de: "Respektierung der Werte der Eltern",
  it: "Rispettare i valori dei genitori",
  pt: "Respeitar os valores dos pais",
  hi: "माता-पिता के मूल्यों का सम्मान करें",
  ar: "احترام قيم الوالدين",
  zh: "尊重父母的价值观",
  ja: "親の価値観を尊重",
  bn: "পিতামাতার মূল্যবোধকে সম্মান করা"
},
followStyles: {
  en: "Follow parenting styles",
  kn: "ಪೋಷಕತ್ವ ಶೈಲಿಗಳನ್ನು ಅನುಸರಿಸಿ",
  fr: "Suivre les styles parentaux",
  de: "Befolgung der Erziehungsstile",
  it: "Seguire gli stili genitoriali",
  pt: "Seguir estilos parentais",
  hi: "पेरेंटिंग शैलियों का पालन करें",
  ar: "اتباع أساليب التربية",
  zh: "遵循育儿方式",
  ja: "育児スタイルに従う",
  bn: "প্যারেন্টিং শৈলী অনুসরণ"
},
close: {
  en: "Close",
  kn: "ಮುಚ್ಚಿ",
  fr: "Fermer",
  de: "Schließen",
  it: "Chiudi",
  pt: "Fechar",
  hi: "बंद करें",
  ar: "إغلاق",
  zh: "关闭",
  ja: "閉じる",
  bn: "বন্ধ করুন"
},

  // ============ ABOUT US PAGE TRANSLATIONS ============
  backToHome: {
    en: "Back to Home",
    kn: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    fr: "Retour à l'Accueil",
    de: "Zurück zur Startseite",
    it: "Torna alla Home",
    pt: "Voltar para Início",
    hi: "होम पर वापस जाएं",
    ar: "العودة إلى الرئيسية",
    zh: "返回首页",
    ja: "ホームに戻る",
    bn: "হোমে ফিরুন"
  },

  aboutUsHero1: {
    en: "We are",
    kn: "ನಾವು",
    fr: "Nous sommes",
    de: "Wir sind",
    it: "Siamo",
    pt: "Nós somos",
    hi: "हम हैं",
    ar: "نحن",
    zh: "我们是",
    ja: "私たちは",
    bn: "আমরা হলাম"
  },

  aboutUsHero2: {
    en: "– a house helps service provider. 'ServEaso' collectively means 'Service Made Easy' or 'Easy Services.' We simplify the process of connecting customers who need home services with reliable and verified professionals.",
    kn: "– ಮನೆ ಸಹಾಯಕ ಸೇವೆ ಒದಗಿಸುವವರು. 'ServEaso' ಒಟ್ಟಾರೆಯಾಗಿ 'ಸೇವೆಯನ್ನು ಸುಲಭಗೊಳಿಸಲಾಗಿದೆ' ಅಥವಾ 'ಸುಲಭ ಸೇವೆಗಳು' ಎಂದರ್ಥ. ಮನೆ ಸೇವೆಗಳ ಅಗತ್ಯವಿರುವ ಗ್ರಾಹಕರನ್ನು ವಿಶ್ವಾಸಾರ್ಹ ಮತ್ತು ಪರಿಶೀಲಿತ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ಪ್ರಕ್ರಿಯೆಯನ್ನು ನಾವು ಸರಳಗೊಳಿಸುತ್ತೇವೆ.",
    fr: "– un fournisseur de services d'aide ménagère. 'ServEaso' signifie collectivement 'Service Rendu Facile' ou 'Services Faciles'. Nous simplifions le processus de mise en relation des clients ayant besoin de services à domicile avec des professionnels fiables et vérifiés.",
    de: "– ein Dienstleister für Haushaltshilfen. 'ServEaso' bedeutet gemeinsam 'Service leicht gemacht' oder 'Einfache Dienstleistungen'. Wir vereinfachen den Prozess, Kunden, die Haushaltsdienstleistungen benötigen, mit zuverlässigen und geprüften Fachleuten zu verbinden.",
    it: "– un fornitore di servizi di assistenza domestica. 'ServEaso' significa collettivamente 'Servizio Semplificato' o 'Servizi Facili'. Semplifichiamo il processo di connessione dei clienti che necessitano di servizi domestici con professionisti affidabili e verificati.",
    pt: "– um provedor de serviços de ajuda doméstica. 'ServEaso' significa coletivamente 'Serviço Facilitado' ou 'Serviços Fáceis'. Simplificamos o processo de conectar clientes que precisam de serviços domésticos com profissionais confiáveis e verificados.",
    hi: "– एक घरेलू सहायता सेवा प्रदाता। 'ServEaso' का सामूहिक अर्थ है 'सेवा आसान बनाई गई' या 'आसान सेवाएं'। हम घरेलू सेवाओं की आवश्यकता वाले ग्राहकों को विश्वसनीय और सत्यापित पेशेवरों से जोड़ने की प्रक्रिया को सरल बनाते हैं।",
    ar: "– مزود خدمة المساعدة المنزلية. 'ServEaso' تعني مجتمعة 'الخدمة أصبحت سهلة' أو 'الخدمات السهلة'. نحن نبسط عملية ربط العملاء الذين يحتاجون إلى خدمات منزلية بمهنيين موثوقين وموثقين.",
    zh: "– 家政服务提供商。'ServEaso' 共同意为'服务变得简单'或'简易服务'。我们简化了需要家庭服务的客户与可靠且经过验证的专业人士之间的联系过程。",
    ja: "– 家事ヘルプサービスプロバイダー。'ServEaso'は総合的に「サービスを簡単に」または「簡単なサービス」を意味します。家庭サービスを必要とする顧客と信頼できる検証済みの専門家をつなぐプロセスを簡素化します。",
    bn: "– একটি গৃহকর্মী সেবা প্রদানকারী। 'ServEaso' সমষ্টিগতভাবে অর্থ 'সেবা সহজ করা' বা 'সহজ সেবা'। আমরা গৃহস্থালি সেবার প্রয়োজন এমন গ্রাহকদের বিশ্বস্ত এবং যাচাইকৃত পেশাজীবীদের সাথে সংযুক্ত করার প্রক্রিয়াটি সহজ করি।"
  },

  ourStory: {
    en: "Our Story",
    kn: "ನಮ್ಮ ಕಥೆ",
    fr: "Notre Histoire",
    de: "Unsere Geschichte",
    it: "La Nostra Storia",
    pt: "Nossa História",
    hi: "हमारी कहानी",
    ar: "قصتنا",
    zh: "我们的故事",
    ja: "私たちのストーリー",
    bn: "আমাদের গল্প"
  },

  ourStory1: {
    en: "ServEaso provides trained and verified house helps to simplify the lives of individuals and families who struggle to balance their professional commitments with household responsibilities.",
    kn: "ವೃತ್ತಿಪರ ಬದ್ಧತೆಗಳನ್ನು ಮನೆಯ ಜವಾಬ್ದಾರಿಗಳೊಂದಿಗೆ ಸಮತೋಲನಗೊಳಿಸಲು ಹೆಣಗಾಡುವ ವ್ಯಕ್ತಿಗಳು ಮತ್ತು ಕುಟುಂಬಗಳ ಜೀವನವನ್ನು ಸರಳಗೊಳಿಸಲು ServEaso ತರಬೇತಿ ಪಡೆದ ಮತ್ತು ಪರಿಶೀಲಿತ ಮನೆ ಸಹಾಯಕರನ್ನು ಒದಗಿಸುತ್ತದೆ.",
    fr: "ServEaso fournit des aides ménagères formées et vérifiées pour simplifier la vie des personnes et des familles qui ont du mal à concilier leurs engagements professionnels et leurs responsabilités ménagères.",
    de: "ServEaso bietet geschulte und geprüfte Haushaltshilfen, um das Leben von Einzelpersonen und Familien zu vereinfachen, die Schwierigkeiten haben, ihre beruflichen Verpflichtungen mit den Haushaltspflichten in Einklang zu bringen.",
    it: "ServEaso fornisce assistenti domestici formati e verificati per semplificare la vita di individui e famiglie che faticano a bilanciare i propri impegni professionali con le responsabilità domestiche.",
    pt: "A ServEaso fornece ajudas domésticas treinadas e verificadas para simplificar a vida de indivíduos e famílias que lutam para equilibrar seus compromissos profissionais com as responsabilidades domésticas.",
    hi: "ServEaso उन व्यक्तियों और परिवारों के जीवन को सरल बनाने के लिए प्रशिक्षित और सत्यापित घरेलू सहायक प्रदान करता है जो अपनी पेशेवर प्रतिबद्धताओं को घरेलू जिम्मेदारियों के साथ संतुलित करने के लिए संघर्ष करते हैं।",
    ar: "توفر ServEaso مساعدين منزليين مدربين وموثقين لتبسيط حياة الأفراد والعائلات الذين يكافحون لتحقيق التوازن بين التزاماتهم المهنية ومسؤولياتهم المنزلية.",
    zh: "ServEaso 提供经过培训和验证的家政助手，以简化那些难以平衡职业承诺和家庭责任的个人和家庭的生活。",
    ja: "ServEasoは、職業上の責任と家事の責任のバランスを取るのに苦労している個人や家族の生活を簡素化するために、訓練され検証された家事ヘルパーを提供します。",
    bn: "ServEaso প্রশিক্ষিত এবং যাচাইকৃত গৃহকর্মী সরবরাহ করে যারা পেশাগত প্রতিশ্রুতি এবং গৃহস্থালির দায়িত্বের মধ্যে ভারসাম্য রাখতে সংগ্রাম করে এমন ব্যক্তি এবং পরিবারের জীবন সহজ করতে।"
  },

  ourStory2: {
    en: "ServEaso offers a convenient and reliable solution for those in need of house care services, ensuring peace of mind and quality care for customers.",
    kn: "ServEaso ಮನೆ ಆರೈಕೆ ಸೇವೆಗಳ ಅಗತ್ಯವಿರುವವರಿಗೆ ಅನುಕೂಲಕರ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಪರಿಹಾರವನ್ನು ನೀಡುತ್ತದೆ, ಗ್ರಾಹಕರಿಗೆ ಮನಸ್ಸಿನ ಶಾಂತಿ ಮತ್ತು ಗುಣಮಟ್ಟದ ಆರೈಕೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
    fr: "ServEaso offre une solution pratique et fiable pour ceux qui ont besoin de services de soins à domicile, garantissant tranquillité d'esprit et soins de qualité pour les clients.",
    de: "ServEaso bietet eine bequeme und zuverlässige Lösung für diejenigen, die häusliche Pflegedienste benötigen, und gewährleistet Ruhe und qualitativ hochwertige Betreuung für die Kunden.",
    it: "ServEaso offre una soluzione conveniente e affidabile per coloro che necessitano di servizi di assistenza domiciliare, garantendo tranquillità e cure di qualità per i clienti.",
    pt: "A ServEaso oferece uma solução conveniente e confiável para aqueles que precisam de serviços de cuidados domésticos, garantindo tranquilidade e atendimento de qualidade para os clientes.",
    hi: "ServEaso उन लोगों के लिए एक सुविधाजनक और विश्वसनीय समाधान प्रदान करता है जिन्हें घरेलू देखभाल सेवाओं की आवश्यकता होती है, जिससे ग्राहकों के लिए मानसिक शांति और गुणवत्तापूर्ण देखभाल सुनिश्चित होती है।",
    ar: "تقدم ServEaso حلاً مريحًا وموثوقًا لمن يحتاجون إلى خدمات الرعاية المنزلية، مما يضمن راحة البال ورعاية عالية الجودة للعملاء.",
    zh: "ServEaso 为需要家庭护理服务的人提供方便可靠的解决方案，确保客户安心并获得优质护理。",
    ja: "ServEasoは、在宅ケアサービスを必要とする人々に便利で信頼性の高いソリューションを提供し、顧客に安心と質の高いケアを保証します。",
    bn: "ServEaso গৃহস্থালি যত্ন সেবার প্রয়োজন那些দের জন্য একটি সুবিধাজনক এবং নির্ভরযোগ্য সমাধান প্রদান করে, গ্রাহকদের জন্য মানসিক শান্তি এবং মানসম্পন্ন যত্ন নিশ্চিত করে।"
  },

  challengesWeSolve: {
    en: "Challenges We Solve",
    kn: "ನಾವು ಪರಿಹರಿಸುವ ಸವಾಲುಗಳು",
    fr: "Défis que Nous Résolvons",
    de: "Herausforderungen, die Wir Lösen",
    it: "Sfide che Risolviamo",
    pt: "Desafios que Resolvemos",
    hi: "हम जिन चुनौतियों का समाधान करते हैं",
    ar: "التحديات التي نحلها",
    zh: "我们解决的挑战",
    ja: "私たちが解決する課題",
    bn: "আমরা যে চ্যালেঞ্জগুলি সমাধান করি"
  },

  highTurnover: {
    en: "High Turnover",
    kn: "ಅಧಿಕ ವಹಿವಾಟು",
    fr: "Rotation Élevée",
    de: "Hohe Fluktuation",
    it: "Alto Turnover",
    pt: "Alta Rotatividade",
    hi: "उच्च कारोबार",
    ar: "ارتفاع معدل الدوران",
    zh: "高流失率",
    ja: "離職率の高さ",
    bn: "উচ্চ টার্নওভার"
  },

  highTurnoverDesc: {
    en: "Difficulty in retaining house helps due to factors like demanding work conditions, low wages, or lack of work-life balance.",
    kn: "ಕಠಿಣ ಕೆಲಸದ ಪರಿಸ್ಥಿತಿಗಳು, ಕಡಿಮೆ ವೇತನ, ಅಥವಾ ಕೆಲಸ-ಜೀವನ ಸಮತೋಲನದ ಕೊರತೆಯಂತಹ ಅಂಶಗಳಿಂದ ಮನೆ ಸಹಾಯಕರನ್ನು ಉಳಿಸಿಕೊಳ್ಳುವಲ್ಲಿ ತೊಂದರೆ.",
    fr: "Difficulté à retenir les aides ménagères en raison de facteurs tels que des conditions de travail exigeantes, des bas salaires ou un manque d'équilibre entre vie professionnelle et vie privée.",
    de: "Schwierigkeiten, Haushaltshilfen zu halten, aufgrund von Faktoren wie anspruchsvollen Arbeitsbedingungen, niedrigen Löhnen oder mangelnder Work-Life-Balance.",
    it: "Difficoltà nel trattenere gli assistenti domestici a causa di fattori come condizioni di lavoro impegnative, bassi salari o mancanza di equilibrio tra lavoro e vita privata.",
    pt: "Dificuldade em reter ajudas domésticas devido a fatores como condições de trabalho exigentes, baixos salários ou falta de equilíbrio entre vida profissional e pessoal.",
    hi: "मांग वाली कार्य स्थितियों, कम मजदूरी या कार्य-जीवन संतुलन की कमी जैसे कारकों के कारण घरेलू सहायकों को बनाए रखने में कठिनाई।",
    ar: "صعوبة في الاحتفاظ بالمساعدين المنزليين بسبب عوامل مثل ظروف العمل الصعبة، أو الأجور المنخفضة، أو عدم التوازن بين العمل والحياة.",
    zh: "由于工作条件苛刻、工资低或缺乏工作与生活平衡等因素，难以留住家政助手。",
    ja: "厳しい労働条件、低賃金、ワークライフバランスの欠如などの要因により、家事ヘルパーを維持することが困難。",
    bn: "কঠিন কাজের পরিবেশ, কম মজুরি, বা কাজ-জীবনের ভারসাম্যের অভাবের মতো কারণে গৃহকর্মী ধরে রাখতে অসুবিধা।"
  },

  skillsGap: {
    en: "Skills Gap",
    kn: "ಕೌಶಲ್ಯ ಅಂತರ",
    fr: "Déficit de Compétences",
    de: "Qualifikationslücke",
    it: "Divario di Competenze",
    pt: "Lacuna de Habilidades",
    hi: "कौशल अंतर",
    ar: "فجوة المهارات",
    zh: "技能差距",
    ja: "スキルギャップ",
    bn: "দক্ষতার অভাব"
  },

  skillsGapDesc: {
    en: "Lack of necessary skills or training for specific tasks, leading to subpar performance or safety concerns.",
    kn: "ನಿರ್ದಿಷ್ಟ ಕಾರ್ಯಗಳಿಗೆ ಅಗತ್ಯ ಕೌಶಲ್ಯಗಳು ಅಥವಾ ತರಬೇತಿಯ ಕೊರತೆ, ಇದು ಕಳಪೆ ಕಾರ್ಯಕ್ಷಮತೆ ಅಥವಾ ಸುರಕ್ಷತಾ ಕಾಳಜಿಗಳಿಗೆ ಕಾರಣವಾಗುತ್ತದೆ.",
    fr: "Manque de compétences ou de formation nécessaires pour des tâches spécifiques, entraînant des performances médiocres ou des problèmes de sécurité.",
    de: "Mangel an erforderlichen Fähigkeiten oder Schulungen für bestimmte Aufgaben, was zu unterdurchschnittlicher Leistung oder Sicherheitsbedenken führt.",
    it: "Mancanza delle competenze o della formazione necessarie per compiti specifici, che portano a prestazioni insufficienti o problemi di sicurezza.",
    pt: "Falta de habilidades ou treinamento necessários para tarefas específicas, levando a desempenho abaixo do esperado ou preocupações com a segurança.",
    hi: "विशिष्ट कार्यों के लिए आवश्यक कौशल या प्रशिक्षण की कमी, जिससे कम प्रदर्शन या सुरक्षा संबंधी चिंताएं होती हैं।",
    ar: "نقص المهارات أو التدريب اللازم لمهام محددة، مما يؤدي إلى أداء دون المستوى أو مخاوف تتعلق بالسلامة.",
    zh: "缺乏特定任务所需的技能或培训，导致表现不佳或安全问题。",
    ja: "特定のタスクに必要なスキルやトレーニングが不足しており、パフォーマンスの低下や安全上の懸念につながります。",
    bn: "নির্দিষ্ট কাজের জন্য প্রয়োজনীয় দক্ষতা বা প্রশিক্ষণের অভাব, যা নিম্নমানের কর্মক্ষমতা বা নিরাপত্তা উদ্বেগের দিকে নিয়ে যায়।"
  },

  communicationBarriers: {
    en: "Communication Barriers",
    kn: "ಸಂವಹನ ಅಡೆತಡೆಗಳು",
    fr: "Barrières de Communication",
    de: "Kommunikationsbarrieren",
    it: "Barriere Comunicative",
    pt: "Barreiras de Comunicação",
    hi: "संचार बाधाएं",
    ar: "حواجز التواصل",
    zh: "沟通障碍",
    ja: "コミュニケーション障壁",
    bn: "যোগাযোগের বাধা"
  },

  communicationBarriersDesc: {
    en: "Language or cultural differences hindering effective communication.",
    kn: "ಭಾಷೆ ಅಥವಾ ಸಾಂಸ್ಕೃತಿಕ ವ್ಯತ್ಯಾಸಗಳು ಪರಿಣಾಮಕಾರಿ ಸಂವಹನಕ್ಕೆ ಅಡ್ಡಿಯಾಗುತ್ತವೆ.",
    fr: "Differences linguistiques ou culturelles entravant une communication efficace.",
    de: "Sprachliche oder kulturelle Unterschiede, die eine effektive Kommunikation behindern.",
    it: "Differenze linguistiche o culturali che ostacolano una comunicazione efficace.",
    pt: "Diferenças de idioma ou culturais que dificultam a comunicação eficaz.",
    hi: "भाषा या सांस्कृतिक अंतर प्रभावी संचार में बाधा डालते हैं।",
    ar: "الاختلافات اللغوية أو الثقافية تعيق التواصل الفعال.",
    zh: "语言或文化差异阻碍有效沟通。",
    ja: "言語や文化の違いが効果的なコミュニケーションを妨げています。",
    bn: "ভাষাগত বা সাংস্কৃতিক পার্থক্য কার্যকর যোগাযোগে বাধা সৃষ্টি করে।"
  },

  trustAndSecurity: {
    en: "Trust and Security",
    kn: "ನಂಬಿಕೆ ಮತ್ತು ಸುರಕ್ಷತೆ",
    fr: "Confiance et Sécurité",
    de: "Vertrauen und Sicherheit",
    it: "Fiducia e Sicurezza",
    pt: "Confiança e Segurança",
    hi: "विश्वास और सुरक्षा",
    ar: "الثقة والأمان",
    zh: "信任与安全",
    ja: "信頼とセキュリティ",
    bn: "বিশ্বাস ও নিরাপত্তা"
  },

  trustAndSecurityDesc: {
    en: "Concerns about theft, privacy violations, or family safety.",
    kn: "ಕಳ್ಳತನ, ಗೌಪ್ಯತೆ ಉಲ್ಲಂಘನೆಗಳು ಅಥವಾ ಕುಟುಂಬದ ಸುರಕ್ಷತೆಯ ಬಗ್ಗೆ ಕಾಳಜಿಗಳು.",
    fr: "Préoccupations concernant le vol, les violations de la vie privée ou la sécurité familiale.",
    de: "Bedenken hinsichtlich Diebstahl, Verletzung der Privatsphäre oder Familiensicherheit.",
    it: "Preoccupazioni per furti, violazioni della privacy o sicurezza familiare.",
    pt: "Preocupações sobre roubo, violações de privacidade ou segurança familiar.",
    hi: "चोरी, गोपनीयता उल्लंघन या परिवार की सुरक्षा के बारे में चिंताएं।",
    ar: "مخاوف بشأن السرقة أو انتهاكات الخصوصية أو سلامة الأسرة.",
    zh: "担心盗窃、隐私侵犯或家庭安全。",
    ja: "盗難、プライバシー侵害、家族の安全に関する懸念。",
    bn: "চুরি, গোপনীয়তা লঙ্ঘন, বা পরিবারের নিরাপত্তা সম্পর্কে উদ্বেগ।"
  },

  dependenceAndEntitlement: {
    en: "Dependence and Entitlement",
    kn: "ಅವಲಂಬನೆ ಮತ್ತು ಹಕ್ಕು",
    fr: "Dépendance et Droit",
    de: "Abhängigkeit und Anspruchsdenken",
    it: "Dipendenza e Diritto",
    pt: "Dependência e Direito",
    hi: "निर्भरता और अधिकार",
    ar: "الاعتماد والاستحقاق",
    zh: "依赖与权利",
    ja: "依存と権利意識",
    bn: "নির্ভরশীলতা এবং অধিকারবোধ"
  },

  dependenceAndEntitlementDesc: {
    en: "Overreliance on employers, reducing household independence.",
    kn: "ಉದ್ಯೋಗದಾತರ ಮೇಲೆ ಅತಿಯಾದ ಅವಲಂಬನೆ, ಮನೆಯ ಸ್ವಾತಂತ್ರ್ಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.",
    fr: "Dépendance excessive envers les employeurs, réduisant l'indépendance du ménage.",
    de: "Übermäßige Abhängigkeit von Arbeitgebern, die die Unabhängigkeit des Haushalts verringert.",
    it: "Eccessiva dipendenza dai datori di lavoro, riducendo l'indipendenza domestica.",
    pt: "Dependência excessiva dos empregadores, reduzindo a independência doméstica.",
    hi: "नियोक्ताओं पर अत्यधिक निर्भरता, घरेलू स्वतंत्रता को कम करना।",
    ar: "الاعتماد المفرط على أرباب العمل، مما يقلل من استقلالية الأسرة.",
    zh: "过度依赖雇主，降低家庭独立性。",
    ja: "雇用主への過度の依存、家庭の自立性を低下させる。",
    bn: "নিয়োগকর্তাদের উপর অতিরিক্ত নির্ভরশীলতা, গৃহস্থালির স্বাধীনতা হ্রাস করে।"
  },

  lackOfLegalProtection: {
    en: "Lack of Legal Protection",
    kn: "ಕಾನೂನು ರಕ್ಷಣೆಯ ಕೊರತೆ",
    fr: "Manque de Protection Juridique",
    de: "Mangel an Rechtsschutz",
    it: "Mancanza di Protezione Legale",
    pt: "Falta de Proteção Legal",
    hi: "कानूनी संरक्षण का अभाव",
    ar: "نقص الحماية القانونية",
    zh: "缺乏法律保护",
    ja: "法的保護の欠如",
    bn: "আইনি সুরক্ষার অভাব"
  },

  lackOfLegalProtectionDesc: {
    en: "Exploitation due to unclear legal frameworks or poor enforcement.",
    kn: "ಅಸ್ಪಷ್ಟ ಕಾನೂನು ಚೌಕಟ್ಟುಗಳು ಅಥವಾ ಕಳಪೆ ಜಾರಿಯಿಂದಾಗಿ ಶೋಷಣೆ.",
    fr: "Exploitation due à des cadres juridiques flous ou à une mauvaise application.",
    de: "Ausbeutung aufgrund unklarer rechtlicher Rahmenbedingungen oder schlechter Durchsetzung.",
    it: "Sfruttamento a causa di quadri giuridici poco chiari o scarsa applicazione.",
    pt: "Exploração devido a estruturas legais pouco claras ou má aplicação.",
    hi: "अस्पष्ट कानूनी ढांचे या खराब प्रवर्तन के कारण शोषण।",
    ar: "الاستغلال بسبب الأطر القانونية غير الواضحة أو ضعف التنفيذ.",
    zh: "由于法律框架不明确或执法不力而导致的剥削。",
    ja: "不明確な法的枠組みや執行の不備による搾取。",
    bn: "অস্পষ্ট আইনি কাঠামো বা দুর্বল প্রয়োগের কারণে শোষণ।"
  },

  socialIsolation: {
    en: "Social Isolation",
    kn: "ಸಾಮಾಜಿಕ ಪ್ರತ್ಯೇಕತೆ",
    fr: "Isolement Social",
    de: "Soziale Isolation",
    it: "Isolamento Sociale",
    pt: "Isolamento Social",
    hi: "सामाजिक अलगाव",
    ar: "العزلة الاجتماعية",
    zh: "社会孤立",
    ja: "社会的孤立",
    bn: "সামাজিক বিচ্ছিন্নতা"
  },

  socialIsolationDesc: {
    en: "Loneliness from living away from families and communities.",
    kn: "ಕುಟುಂಬಗಳು ಮತ್ತು ಸಮುದಾಯಗಳಿಂದ ದೂರವಿರುವುದರಿಂದ ಒಂಟಿತನ.",
    fr: "Solitude due à l'éloignement des familles et des communautés.",
    de: "Einsamkeit durch das Leben fern von Familie und Gemeinschaft.",
    it: "Solitudine per vivere lontano da famiglie e comunità.",
    pt: "Solidão por viver longe de famílias e comunidades.",
    hi: "परिवारों और समुदायों से दूर रहने से अकेलापन।",
    ar: "الشعور بالوحدة نتيجة العيش بعيدًا عن العائلات والمجتمعات.",
    zh: "因远离家庭和社区而感到孤独。",
    ja: "家族やコミュニティから離れて暮らすことによる孤独。",
    bn: "পরিবার এবং সম্প্রদায় থেকে দূরে থাকার কারণে একাকীত্ব।"
  },

  employerMaidRelationship: {
    en: "Employer-Maid Relationship Dynamics",
    kn: "ಉದ್ಯೋಗದಾತ-ಮನೆಕೆಲಸದವರ ಸಂಬಂಧದ ಡೈನಾಮಿಕ್ಸ್",
    fr: "Dynamique de la Relation Employeur-Femme de Ménage",
    de: "Dynamik der Arbeitgeber-Haushaltshilfe-Beziehung",
    it: "Dinamiche del Rapporto Datore di Lavoro-Colf",
    pt: "Dinâmica do Relacionamento Empregador-Empregada",
    hi: "नियोक्ता-नौकरानी संबंध गतिशीलता",
    ar: "ديناميكيات العلاقة بين صاحب العمل والخادمة",
    zh: "雇主与保姆关系动态",
    ja: "雇用主とメイドの関係性",
    bn: "নিয়োগকর্তা-গৃহকর্মী সম্পর্কের গতিশীলতা"
  },

  employerMaidRelationshipDesc: {
    en: "Difficulty in building respectful, trust-based relationships.",
    kn: "ಗೌರವಯುತ, ವಿಶ್ವಾಸ-ಆಧಾರಿತ ಸಂಬಂಧಗಳನ್ನು ನಿರ್ಮಿಸುವಲ್ಲಿ ತೊಂದರೆ.",
    fr: "Difficulté à établir des relations respectueuses et fondées sur la confiance.",
    de: "Schwierigkeiten beim Aufbau respektvoller, vertrauensbasierter Beziehungen.",
    it: "Difficoltà nel costruire relazioni rispettose e basate sulla fiducia.",
    pt: "Dificuldade em construir relacionamentos respeitosos e baseados na confiança.",
    hi: "सम्मानजनक, विश्वास-आधारित संबंध बनाने में कठिनाई।",
    ar: "صعوبة في بناء علاقات محترمة قائمة على الثقة.",
    zh: "难以建立尊重、基于信任的关系。",
    ja: "敬意と信頼に基づく関係構築の難しさ。",
    bn: "সম্মানজনক, বিশ্বাস-ভিত্তিক সম্পর্ক গড়তে অসুবিধা।"
  },

  limitedAccessToHealthcare: {
    en: "Limited Access to Healthcare",
    kn: "ಆರೋಗ್ಯ ರಕ್ಷಣೆಗೆ ಸೀಮಿತ ಪ್ರವೇಶ",
    fr: "Accès Limité aux Soins de Santé",
    de: "Eingeschränkter Zugang zur Gesundheitsversorgung",
    it: "Accesso Limitato all'Assistenza Sanitaria",
    pt: "Acesso Limitado à Saúde",
    hi: "स्वास्थ्य सेवा तक सीमित पहुंच",
    ar: "محدودية الوصول إلى الرعاية الصحية",
    zh: "获得医疗保健的机会有限",
    ja: "医療へのアクセス制限",
    bn: "স্বাস্থ্যসেবায় সীমিত অ্যাক্সেস"
  },

  limitedAccessToHealthcareDesc: {
    en: "Lack of affordable healthcare or insurance coverage.",
    kn: "ಕೈಗೆಟುಕುವ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಅಥವಾ ವಿಮಾ ರಕ್ಷಣೆಯ ಕೊರತೆ.",
    fr: "Manque de soins de santé abordables ou de couverture d'assurance.",
    de: "Mangel an erschwinglicher Gesundheitsversorgung oder Versicherungsschutz.",
    it: "Mancanza di assistenza sanitaria a prezzi accessibili o copertura assicurativa.",
    pt: "Falta de saúde acessível ou cobertura de seguro.",
    hi: "किफायती स्वास्थ्य सेवा या बीमा कवरेज का अभाव।",
    ar: "نقص الرعاية الصحية الميسورة التكلفة أو التغطية التأمينية.",
    zh: "缺乏负担得起的医疗保健或保险。",
    ja: "手頃な価格の医療や保険の欠如。",
    bn: "সাশ্রয়ী মূল্যের স্বাস্থ্যসেবা বা বীমা কভারেজের অভাব।"
  },

  lackOfStandardizedPractices: {
    en: "Lack of Standardized Practices",
    kn: "ಪ್ರಮಾಣೀಕೃತ ಅಭ್ಯಾಸಗಳ ಕೊರತೆ",
    fr: "Manque de Pratiques Standardisées",
    de: "Mangel an standardisierten Praktiken",
    it: "Mancanza di Pratiche Standardizzate",
    pt: "Falta de Práticas Padronizadas",
    hi: "मानकीकृत प्रथाओं का अभाव",
    ar: "نقص الممارسات الموحدة",
    zh: "缺乏标准化实践",
    ja: "標準化された実践の欠如",
    bn: "মানসম্মত অনুশীলনের অভাব"
  },

  lackOfStandardizedPracticesDesc: {
    en: "No clear guidelines for hiring, training, and managing domestic workers.",
    kn: "ಗೃಹ ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿಕೊಳ್ಳುವುದು, ತರಬೇತಿ ನೀಡುವುದು ಮತ್ತು ನಿರ್ವಹಿಸುವುದಕ್ಕಾಗಿ ಸ್ಪಷ್ಟ ಮಾರ್ಗಸೂಚಿಗಳಿಲ್ಲ.",
    fr: "Absence de directives claires pour l'embauche, la formation et la gestion des travailleurs domestiques.",
    de: "Keine klaren Richtlinien für die Einstellung, Schulung und Verwaltung von Hausangestellten.",
    it: "Nessuna linea guida chiara per l'assunzione, la formazione e la gestione dei lavoratori domestici.",
    pt: "Não há diretrizes claras para contratar, treinar e gerenciar trabalhadores domésticos.",
    hi: "घरेलू कामगारों को काम पर रखने, प्रशिक्षण देने और प्रबंधित करने के लिए कोई स्पष्ट दिशानिर्देश नहीं।",
    ar: "لا توجد إرشادات واضحة لتوظيف وتدريب وإدارة العمال المنزليين.",
    zh: "没有明确的雇用、培训和管理家政人员的指导方针。",
    ja: "家事労働者の採用、トレーニング、管理に関する明確なガイドラインがない。",
    bn: "গৃহকর্মী নিয়োগ, প্রশিক্ষণ এবং পরিচালনার জন্য কোন স্পষ্ট নির্দেশিকা নেই।"
  },
  // ============ END ABOUT US PAGE TRANSLATIONS ============

  // ============ CONTACT US PAGE TRANSLATIONS ============
  requestSubmitted: {
    en: "Your request has been submitted!",
    kn: "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ!",
    fr: "Votre demande a été soumise !",
    de: "Ihre Anfrage wurde übermittelt!",
    it: "La tua richiesta è stata inviata!",
    pt: "Sua solicitação foi enviada!",
    hi: "आपका अनुरोध सबमिट कर दिया गया है!",
    ar: "تم تقديم طلبك!",
    zh: "您的请求已提交！",
    ja: "リクエストが送信されました！",
    bn: "আপনার অনুরোধ জমা দেওয়া হয়েছে!"
  },

  back: {
    en: "Back",
    kn: "ಹಿಂದೆ",
    fr: "Retour",
    de: "Zurück",
    it: "Indietro",
    pt: "Voltar",
    hi: "वापस",
    ar: "رجوع",
    zh: "返回",
    ja: "戻る",
    bn: "পিছনে"
  },

  getInTouch: {
    en: "Get in touch with us",
    kn: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
    fr: "Entrez en contact avec nous",
    de: "Setzen Sie sich mit uns in Verbindung",
    it: "Mettiti in contatto con noi",
    pt: "Entre em contato conosco",
    hi: "हमसे संपर्क करें",
    ar: "تواصل معنا",
    zh: "与我们取得联系",
    ja: "お問い合わせ",
    bn: "আমাদের সাথে যোগাযোগ করুন"
  },

  contactDescription: {
    en: "Fill out the form below or schedule a meeting with us at your convenience.",
    kn: "ಕೆಳಗಿನ ಫಾರ್ಮ್ ಅನ್ನು ಭರ್ತಿ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ನಮ್ಮೊಂದಿಗೆ ಸಭೆಯನ್ನು ನಿಗದಿಪಡಿಸಿ.",
    fr: "Remplissez le formulaire ci-dessous ou planifiez une réunion avec nous à votre convenance.",
    de: "Füllen Sie das untenstehende Formular aus oder vereinbaren Sie einen Termin mit uns nach Ihren Wünschen.",
    it: "Compila il modulo sottostante o pianifica un incontro con noi quando preferisci.",
    pt: "Preencha o formulário abaixo ou agende uma reunião conosco em sua conveniência.",
    hi: "नीचे दिए गए फॉर्म को भरें या अपनी सुविधानुसार हमारे साथ मीटिंग शेड्यूल करें।",
    ar: "املأ النموذج أدناه أو حدد موعدًا لاجتماع معنا في الوقت المناسب لك.",
    zh: "填写下面的表格，或在我们方便的时候安排会议。",
    ja: "以下のフォームに記入するか、ご都合のよいときにミーティングをスケジュールしてください。",
    bn: "নীচের ফর্মটি পূরণ করুন বা আপনার সুবিধামত আমাদের সাথে একটি মিটিং নির্ধারণ করুন।"
  },

  name: {
    en: "Name",
    kn: "ಹೆಸರು",
    fr: "Nom",
    de: "Name",
    it: "Nome",
    pt: "Nome",
    hi: "नाम",
    ar: "الاسم",
    zh: "姓名",
    ja: "名前",
    bn: "নাম"
  },

  yourName: {
    en: "Your name",
    kn: "ನಿಮ್ಮ ಹೆಸರು",
    fr: "Votre nom",
    de: "Ihr Name",
    it: "Il tuo nome",
    pt: "Seu nome",
    hi: "आपका नाम",
    ar: "اسمك",
    zh: "您的姓名",
    ja: "あなたの名前",
    bn: "আপনার নাম"
  },

  email: {
    en: "Email",
    kn: "ಇಮೇಲ್",
    fr: "E-mail",
    de: "E-Mail",
    it: "Email",
    pt: "E-mail",
    hi: "ईमेल",
    ar: "البريد الإلكتروني",
    zh: "电子邮件",
    ja: "メールアドレス",
    bn: "ইমেল"
  },

  enterEmail: {
    en: "Enter Your Email",
    kn: "ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    fr: "Entrez votre E-mail",
    de: "Geben Sie Ihre E-Mail ein",
    it: "Inserisci la tua Email",
    pt: "Digite seu E-mail",
    hi: "अपना ईमेल दर्ज करें",
    ar: "أدخل بريدك الإلكتروني",
    zh: "输入您的电子邮件",
    ja: "メールアドレスを入力",
    bn: "আপনার ইমেল লিখুন"
  },

  message: {
    en: "Message",
    kn: "ಸಂದೇಶ",
    fr: "Message",
    de: "Nachricht",
    it: "Messaggio",
    pt: "Mensagem",
    hi: "संदेश",
    ar: "رسالة",
    zh: "消息",
    ja: "メッセージ",
    bn: "বার্তা"
  },

  enterMessage: {
    en: "Enter Your Message",
    kn: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ನಮೂದಿಸಿ",
    fr: "Entrez votre Message",
    de: "Geben Sie Ihre Nachricht ein",
    it: "Inserisci il tuo Messaggio",
    pt: "Digite sua Mensagem",
    hi: "अपना संदेश दर्ज करें",
    ar: "أدخل رسالتك",
    zh: "输入您的消息",
    ja: "メッセージを入力",
    bn: "আপনার বার্তা লিখুন"
  },

  iAgreeWith: {
    en: "I agree with",
    kn: "ನಾನು ಸಮ್ಮತಿಸುತ್ತೇನೆ",
    fr: "J'accepte les",
    de: "Ich stimme zu",
    it: "Accetto i",
    pt: "Eu concordo com os",
    hi: "मैं सहमत हूँ",
    ar: "أوافق على",
    zh: "我同意",
    ja: "同意します",
    bn: "আমি সম্মত"
  },

  termsAndConditions: {
    en: "Terms and Conditions",
    kn: "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು",
    fr: "Termes et Conditions",
    de: "Allgemeine Geschäftsbedingungen",
    it: "Termini e Condizioni",
    pt: "Termos e Condições",
    hi: "नियम और शर्तें",
    ar: "الشروط والأحكام",
    zh: "条款和条件",
    ja: "利用規約",
    bn: "শর্তাবলী"
  },

  sendRequest: {
    en: "Send Your Request",
    kn: "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಿ",
    fr: "Envoyer votre Demande",
    de: "Anfrage senden",
    it: "Invia la tua Richiesta",
    pt: "Enviar sua Solicitação",
    hi: "अपना अनुरोध भेजें",
    ar: "أرسل طلبك",
    zh: "发送您的请求",
    ja: "リクエストを送信",
    bn: "আপনার অনুরোধ পাঠান"
  },

  contactVia: {
    en: "You can also contact us via",
    kn: "ನೀವು ನಮ್ಮನ್ನು ಇವುಗಳ ಮೂಲಕವೂ ಸಂಪರ್ಕಿಸಬಹುದು",
    fr: "Vous pouvez également nous contacter via",
    de: "Sie können uns auch kontaktieren über",
    it: "Puoi anche contattarci tramite",
    pt: "Você também pode nos contatar via",
    hi: "आप हमसे इसके माध्यम से भी संपर्क कर सकते हैं",
    ar: "يمكنك أيضًا الاتصال بنا عبر",
    zh: "您也可以通过以下方式联系我们",
    ja: "以下の方法でもお問い合わせいただけます",
    bn: "আপনি আমাদের সাথে যোগাযোগ করতে পারেন"
  },

  withOurServices: {
    en: "With our services you can",
    kn: "ನಮ್ಮ ಸೇವೆಗಳೊಂದಿಗೆ ನೀವು",
    fr: "Avec nos services, vous pouvez",
    de: "Mit unseren Dienstleistungen können Sie",
    it: "Con i nostri servizi puoi",
    pt: "Com nossos serviços você pode",
    hi: "हमारी सेवाओं से आप",
    ar: "باستخدام خدماتنا يمكنك",
    zh: "通过我们的服务，您可以",
    ja: "当社のサービスを利用すると、以下のことが可能です",
    bn: "আমাদের সেবার মাধ্যমে আপনি পারেন"
  },

  benefit1: {
    en: "Improve usability of your product",
    kn: "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಬಳಕೆಯನ್ನು ಸುಧಾರಿಸಿ",
    fr: "Améliorer la convivialité de votre produit",
    de: "Verbessern Sie die Benutzerfreundlichkeit Ihres Produkts",
    it: "Migliorare l'usabilità del tuo prodotto",
    pt: "Melhorar a usabilidade do seu produto",
    hi: "अपने उत्पाद की उपयोगिता में सुधार करें",
    ar: "تحسين قابلية استخدام منتجك",
    zh: "提高产品的可用性",
    ja: "製品の使いやすさを向上させる",
    bn: "আপনার পণ্যের ব্যবহারযোগ্যতা উন্নত করুন"
  },

  benefit2: {
    en: "Engage users at a higher level and outperform competition",
    kn: "ಬಳಕೆದಾರರನ್ನು ಉನ್ನತ ಮಟ್ಟದಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ಸ್ಪರ್ಧೆಯನ್ನು ಮೀರಿಸಿ",
    fr: "Engager les utilisateurs à un niveau supérieur et surpasser la concurrence",
    de: "Binden Sie Benutzer auf einer höheren Ebene ein und übertreffen Sie die Konkurrenz",
    it: "Coinvolgere gli utenti a un livello superiore e superare la concorrenza",
    pt: "Engajar usuários em um nível superior e superar a concorrência",
    hi: "उपयोगकर्ताओं को उच्च स्तर पर संलग्न करें और प्रतिस्पर्धा से आगे निकलें",
    ar: "إشراك المستخدمين على مستوى أعلى والتفوق على المنافسة",
    zh: "在更高层次上吸引用户并超越竞争对手",
    ja: "より高いレベルでユーザーを引き付け、競合他社を凌駕する",
    bn: "ব্যবহারকারীদের উচ্চ স্তরে যুক্ত করুন এবং প্রতিযোগিতাকে ছাড়িয়ে যান"
  },

  benefit3: {
    en: "Reduce onboarding time and improve sales",
    kn: "ಆನ್ಬೋರ್ಡಿಂಗ್ ಸಮಯವನ್ನು ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ಮಾರಾಟವನ್ನು ಸುಧಾರಿಸಿ",
    fr: "Réduire le temps d'intégration et améliorer les ventes",
    de: "Reduzieren Sie die Einarbeitungszeit und verbessern Sie den Umsatz",
    it: "Ridurre i tempi di onboarding e migliorare le vendite",
    pt: "Reduzir o tempo de integração e melhorar as vendas",
    hi: "ऑनबोर्डिंग समय कम करें और बिक्री में सुधार करें",
    ar: "تقليل وقت الإعداد وتحسين المبيعات",
    zh: "减少入职时间并提高销售额",
    ja: "オンボーディング時間を短縮し、売上を向上させる",
    bn: "অনবোর্ডিং সময় হ্রাস করুন এবং বিক্রয় উন্নত করুন"
  },

  benefit4: {
    en: "Balance user needs with your business goals",
    kn: "ಬಳಕೆದಾರರ ಅಗತ್ಯಗಳನ್ನು ನಿಮ್ಮ ವ್ಯಾಪಾರ ಗುರಿಗಳೊಂದಿಗೆ ಸಮತೋಲನಗೊಳಿಸಿ",
    fr: "Équilibrer les besoins des utilisateurs avec vos objectifs commerciaux",
    de: "Bringen Sie Benutzerbedürfnisse mit Ihren Geschäftszielen in Einklang",
    it: "Bilanciare le esigenze degli utenti con i tuoi obiettivi aziendali",
    pt: "Equilibrar as necessidades do usuário com seus objetivos de negócios",
    hi: "उपयोगकर्ता की जरूरतों को अपने व्यावसायिक लक्ष्यों के साथ संतुलित करें",
    ar: "تحقيق التوازن بين احتياجات المستخدمين وأهداف عملك",
    zh: "平衡用户需求与您的业务目标",
    ja: "ユーザーニーズとビジネス目標のバランスを取る",
    bn: "ব্যবহারকারীর চাহিদা এবং আপনার ব্যবসায়িক লক্ষ্যগুলির মধ্যে ভারসাম্য বজায় রাখুন"
  },

  followUs: {
    en: "Follow us",
    kn: "ನಮ್ಮನ್ನು ಅನುಸರಿಸಿ",
    fr: "Suivez-nous",
    de: "Folgen Sie uns",
    it: "Seguici",
    pt: "Siga-nos",
    hi: "हमें फॉलो करें",
    ar: "تابعنا",
    zh: "关注我们",
    ja: "フォローする",
    bn: "অনুসরণ করুন"
  },

  downloadApp: {
    en: "Download Our App",
    kn: "ನಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    fr: "Téléchargez Notre Application",
    de: "Laden Sie Unsere App Herunter",
    it: "Scarica La Nostra App",
    pt: "Baixe Nosso Aplicativo",
    hi: "हमारा ऐप डाउनलोड करें",
    ar: "تحميل تطبيقنا",
    zh: "下载我们的应用",
    ja: "アプリをダウンロード",
    bn: "আমাদের অ্যাপ ডাউনলোড করুন"
  },
  // ============ END CONTACT US PAGE TRANSLATIONS ============

  // Add this after the CONTACT US PAGE TRANSLATIONS and before the language names
// ============ AGENT REGISTRATION FORM TRANSLATIONS ============
agentRegistration: {
  en: "Agent Registration",
  kn: "ಏಜೆಂಟ್ ನೋಂದಣಿ",
  fr: "Inscription d'Agent",
  de: "Agentenregistrierung",
  it: "Registrazione Agente",
  pt: "Registro de Agente",
  hi: "एजेंट पंजीकरण",
  ar: "تسجيل الوكيل",
  zh: "代理注册",
  ja: "エージェント登録",
  bn: "এজেন্ট নিবন্ধন"
},

companyName: {
  en: "Company Name *",
  kn: "ಕಂಪನಿ ಹೆಸರು *",
  fr: "Nom de l'Entreprise *",
  de: "Firmenname *",
  it: "Nome dell'Azienda *",
  pt: "Nome da Empresa *",
  hi: "कंपनी का नाम *",
  ar: "اسم الشركة *",
  zh: "公司名称 *",
  ja: "会社名 *",
  bn: "কোম্পানির নাম *"
},

mobileNumber: {
  en: "Mobile Number *",
  kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *",
  fr: "Numéro de Mobile *",
  de: "Handynummer *",
  it: "Numero di Cellulare *",
  pt: "Número de Celular *",
  hi: "मोबाइल नंबर *",
  ar: "رقم الجوال *",
  zh: "手机号码 *",
  ja: "携帯番号 *",
  bn: "মোবাইল নম্বর *"
},

emailId: {
  en: "Email ID *",
  kn: "ಇಮೇಲ್ ಐಡಿ *",
  fr: "Adresse E-mail *",
  de: "E-Mail-Adresse *",
  it: "Indirizzo Email *",
  pt: "E-mail *",
  hi: "ईमेल आईडी *",
  ar: "البريد الإلكتروني *",
  zh: "电子邮件 *",
  ja: "メールアドレス *",
  bn: "ইমেল আইডি *"
},

registrationId: {
  en: "Registration ID *",
  kn: "ನೋಂದಣಿ ಐಡಿ *",
  fr: "ID d'Inscription *",
  de: "Registrierungs-ID *",
  it: "ID di Registrazione *",
  pt: "ID de Registro *",
  hi: "पंजीकरण आईडी *",
  ar: "معرف التسجيل *",
  zh: "注册ID *",
  ja: "登録ID *",
  bn: "নিবন্ধন আইডি *"
},

password: {
  en: "Password *",
  kn: "ಪಾಸ್ವರ್ಡ್ *",
  fr: "Mot de Passe *",
  de: "Passwort *",
  it: "Password *",
  pt: "Senha *",
  hi: "पासवर्ड *",
  ar: "كلمة المرور *",
  zh: "密码 *",
  ja: "パスワード *",
  bn: "পাসওয়ার্ড *"
},

confirmPassword: {
  en: "Confirm Password *",
  kn: "ಪಾಸ್ವರ್ಡ್ ದೃಢೀಕರಿಸಿ *",
  fr: "Confirmer le Mot de Passe *",
  de: "Passwort Bestätigen *",
  it: "Conferma Password *",
  pt: "Confirmar Senha *",
  hi: "पासवर्ड की पुष्टि करें *",
  ar: "تأكيد كلمة المرور *",
  zh: "确认密码 *",
  ja: "パスワード確認 *",
  bn: "পাসওয়ার্ড নিশ্চিত করুন *"
},

companyAddress: {
  en: "Company Address *",
  kn: "ಕಂಪನಿ ವಿಳಾಸ *",
  fr: "Adresse de l'Entreprise *",
  de: "Firmenadresse *",
  it: "Indirizzo dell'Azienda *",
  pt: "Endereço da Empresa *",
  hi: "कंपनी का पता *",
  ar: "عنوان الشركة *",
  zh: "公司地址 *",
  ja: "会社住所 *",
  bn: "কোম্পানির ঠিকানা *"
},

submit: {
  en: "Submit",
  kn: "ಸಲ್ಲಿಸಿ",
  fr: "Soumettre",
  de: "Einreichen",
  it: "Invia",
  pt: "Enviar",
  hi: "जमा करें",
  ar: "إرسال",
  zh: "提交",
  ja: "送信",
  bn: "জমা দিন"
},

submitting: {
  en: "Submitting...",
  kn: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
  fr: "Envoi en cours...",
  de: "Wird gesendet...",
  it: "Invio in corso...",
  pt: "Enviando...",
  hi: "जमा किया जा रहा है...",
  ar: "جاري الإرسال...",
  zh: "提交中...",
  ja: "送信中...",
  bn: "জমা দেওয়া হচ্ছে..."
},

phoneValidationError: {
  en: "Enter a valid 10-digit mobile number",
  kn: "ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
  fr: "Entrez un numéro de mobile valide à 10 chiffres",
  de: "Geben Sie eine gültige 10-stellige Handynummer ein",
  it: "Inserisci un numero di cellulare valido di 10 cifre",
  pt: "Digite um número de celular válido de 10 dígitos",
  hi: "एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें",
  ar: "أدخل رقم جوال صالحًا مكونًا من 10 أرقام",
  zh: "输入有效的10位手机号码",
  ja: "有効な10桁の携帯電話番号を入力してください",
  bn: "একটি বৈধ 10-অঙ্কের মোবাইল নম্বর লিখুন"
},

emailValidationError: {
  en: "Enter a valid email address",
  kn: "ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ",
  fr: "Entrez une adresse e-mail valide",
  de: "Geben Sie eine gültige E-Mail-Adresse ein",
  it: "Inserisci un indirizzo email valido",
  pt: "Digite um endereço de e-mail válido",
  hi: "एक वैध ईमेल पता दर्ज करें",
  ar: "أدخل عنوان بريد إلكتروني صالح",
  zh: "输入有效的电子邮件地址",
  ja: "有効なメールアドレスを入力してください",
  bn: "একটি বৈধ ইমেল ঠিকানা লিখুন"
},

registrationIdRequired: {
  en: "Registration ID is required",
  kn: "ನೋಂದಣಿ ಐಡಿ ಅಗತ್ಯವಿದೆ",
  fr: "L'ID d'inscription est requis",
  de: "Registrierungs-ID ist erforderlich",
  it: "L'ID di registrazione è richiesto",
  pt: "O ID de registro é obrigatório",
  hi: "पंजीकरण आईडी आवश्यक है",
  ar: "معرف التسجيل مطلوب",
  zh: "注册ID是必需的",
  ja: "登録IDが必要です",
  bn: "নিবন্ধন আইডি প্রয়োজন"
},

registrationIdValidationError: {
  en: "Registration ID should be alphanumeric and 10-20 characters long",
  kn: "ನೋಂದಣಿ ಐಡಿ ಅಕ್ಷರಸಂಖ್ಯಾತ್ಮಕವಾಗಿರಬೇಕು ಮತ್ತು 10-20 ಅಕ್ಷರಗಳ ಉದ್ದವಿರಬೇಕು",
  fr: "L'ID d'inscription doit être alphanumérique et comporter entre 10 et 20 caractères",
  de: "Die Registrierungs-ID muss alphanumerisch sein und 10-20 Zeichen lang sein",
  it: "L'ID di registrazione deve essere alfanumerico e lungo 10-20 caratteri",
  pt: "O ID de registro deve ser alfanumérico e ter entre 10 e 20 caracteres",
  hi: "पंजीकरण आईडी अल्फ़ान्यूमेरिक होनी चाहिए और 10-20 अक्षर लंबी होनी चाहिए",
  ar: "يجب أن يكون معرف التسجيل أبجديًا رقميًا وطوله 10-20 حرفًا",
  zh: "注册ID应为字母数字，长度为10-20个字符",
  ja: "登録IDは英数字で10〜20文字である必要があります",
  bn: "নিবন্ধন আইডি অক্ষরসংখ্যাসূচক হতে হবে এবং ১০-২০ অক্ষর দীর্ঘ হতে হবে"
},

passwordValidationError: {
  en: "Password must contain at least 8 characters, including 1 letter, 1 number, and 1 special character",
  kn: "ಪಾಸ್ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳನ್ನು ಒಳಗೊಂಡಿರಬೇಕು, 1 ಅಕ್ಷರ, 1 ಸಂಖ್ಯೆ ಮತ್ತು 1 ವಿಶೇಷ ಅಕ್ಷರ ಸೇರಿದಂತೆ",
  fr: "Le mot de passe doit contenir au moins 8 caractères, dont 1 lettre, 1 chiffre et 1 caractère spécial",
  de: "Das Passwort muss mindestens 8 Zeichen enthalten, darunter 1 Buchstaben, 1 Zahl und 1 Sonderzeichen",
  it: "La password deve contenere almeno 8 caratteri, inclusi 1 lettera, 1 numero e 1 carattere speciale",
  pt: "A senha deve conter pelo menos 8 caracteres, incluindo 1 letra, 1 número e 1 caractere especial",
  hi: "पासवर्ड में कम से कम 8 अक्षर होने चाहिए, जिसमें 1 अक्षर, 1 संख्या और 1 विशेष वर्ण शामिल हो",
  ar: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، بما في ذلك حرف واحد ورقم واحد وحرف خاص واحد",
  zh: "密码必须至少包含8个字符，包括1个字母、1个数字和1个特殊字符",
  ja: "パスワードは少なくとも8文字（1文字、1数字、1特殊文字を含む）である必要があります",
  bn: "পাসওয়ার্ডে কমপক্ষে ৮টি অক্ষর থাকতে হবে, যার মধ্যে ১টি অক্ষর, ১টি সংখ্যা এবং ১টি বিশেষ অক্ষর থাকতে হবে"
},

passwordMismatch: {
  en: "Passwords do not match",
  kn: "ಪಾಸ್ವರ್ಡ್ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
  fr: "Les mots de passe ne correspondent pas",
  de: "Passwörter stimmen nicht überein",
  it: "Le password non corrispondono",
  pt: "As senhas não coincidem",
  hi: "पासवर्ड मेल नहीं खाते",
  ar: "كلمات المرور غير متطابقة",
  zh: "密码不匹配",
  ja: "パスワードが一致しません",
  bn: "পাসওয়ার্ড মেলে না"
},

fillRequiredFields: {
  en: "Please fill in all required fields",
  kn: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
  fr: "Veuillez remplir tous les champs obligatoires",
  de: "Bitte füllen Sie alle Pflichtfelder aus",
  it: "Si prega di compilare tutti i campi obbligatori",
  pt: "Por favor, preencha todos os campos obrigatórios",
  hi: "कृपया सभी आवश्यक फ़ील्ड भरें",
  ar: "يرجى ملء جميع الحقول المطلوبة",
  zh: "请填写所有必填字段",
  ja: "すべての必須フィールドに入力してください",
  bn: "অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন"
},

ensureValidFields: {
  en: "Please ensure all fields are valid and email/mobile are available",
  kn: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳು ಮಾನ್ಯವಾಗಿವೆ ಮತ್ತು ಇಮೇಲ್/ಮೊಬೈಲ್ ಲಭ್ಯವಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ",
  fr: "Veuillez vous assurer que tous les champs sont valides et que l'email/le mobile sont disponibles",
  de: "Bitte stellen Sie sicher, dass alle Felder gültig sind und E-Mail/Handy verfügbar sind",
  it: "Assicurati che tutti i campi siano validi e che email/cellulare siano disponibili",
  pt: "Certifique-se de que todos os campos são válidos e que e-mail/celular estão disponíveis",
  hi: "कृपया सुनिश्चित करें कि सभी फ़ील्ड मान्य हैं और ईमेल/मोबाइल उपलब्ध हैं",
  ar: "يرجى التأكد من أن جميع الحقول صالحة وأن البريد الإلكتروني/الجوال متاحان",
  zh: "请确保所有字段有效且电子邮件/手机可用",
  ja: "すべてのフィールドが有効で、メール/携帯が利用可能であることを確認してください",
  bn: "অনুগ্রহ করে নিশ্চিত করুন যে সমস্ত ক্ষেত্র বৈধ এবং ইমেল/মোবাইল উপলব্ধ"
},

vendorAdded: {
  en: "Vendor added successfully!",
  kn: "ಮಾರಾಟಗಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!",
  fr: "Fournisseur ajouté avec succès!",
  de: "Anbieter erfolgreich hinzugefügt!",
  it: "Fornitore aggiunto con successo!",
  pt: "Prestador adicionado com sucesso!",
  hi: "विक्रेता सफलतापूर्वक जोड़ा गया!",
  ar: "تمت إضافة المورد بنجاح!",
  zh: "供应商添加成功！",
  ja: "ベンダーが正常に追加されました！",
  bn: "বিক্রেতা সফলভাবে যুক্ত করা হয়েছে!"
},

vendorAddFailed: {
  en: "Failed to add vendor.",
  kn: "ಮಾರಾಟಗಾರರನ್ನು ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ.",
  fr: "Échec de l'ajout du fournisseur.",
  de: "Fehler beim Hinzufügen des Anbieters.",
  it: "Impossibile aggiungere il fornitore.",
  pt: "Falha ao adicionar prestador.",
  hi: "विक्रेता जोड़ने में विफल।",
  ar: "فشل في إضافة المورد.",
  zh: "添加供应商失败。",
  ja: "ベンダーの追加に失敗しました。",
  bn: "বিক্রেতা যোগ করতে ব্যর্থ হয়েছে।"
},

serverError: {
  en: "Server error occurred",
  kn: "ಸರ್ವರ್ ದೋಷ ಸಂಭವಿಸಿದೆ",
  fr: "Erreur du serveur",
  de: "Serverfehler aufgetreten",
  it: "Errore del server",
  pt: "Erro do servidor",
  hi: "सर्वर त्रुटि हुई",
  ar: "حدث خطأ في الخادم",
  zh: "发生服务器错误",
  ja: "サーバーエラーが発生しました",
  bn: "সার্ভার ত্রুটি ঘটেছে"
},

noServerResponse: {
  en: "No response from server. Please check your connection.",
  kn: "ಸರ್ವರ್‌ನಿಂದ ಪ್ರತಿಕ್ರಿಯೆ ಇಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.",
  fr: "Pas de réponse du serveur. Veuillez vérifier votre connexion.",
  de: "Keine Antwort vom Server. Bitte überprüfen Sie Ihre Verbindung.",
  it: "Nessuna risposta dal server. Per favore controlla la tua connessione.",
  pt: "Sem resposta do servidor. Por favor, verifique sua conexão.",
  hi: "सर्वर से कोई प्रतिक्रिया नहीं। कृपया अपना कनेक्शन जांचें।",
  ar: "لا يوجد رد من الخادم. يرجى التحقق من اتصالك.",
  zh: "服务器无响应。请检查您的连接。",
  ja: "サーバーからの応答がありません。接続を確認してください。",
  bn: "সার্ভার থেকে কোন সাড়া নেই। আপনার সংযোগ পরীক্ষা করুন।"
},

apiConnectionError: {
  en: "An error occurred while connecting to the API.",
  kn: "API ಗೆ ಸಂಪರ್ಕಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ.",
  fr: "Une erreur s'est produite lors de la connexion à l'API.",
  de: "Beim Verbinden mit der API ist ein Fehler aufgetreten.",
  it: "Si è verificato un errore durante la connessione all'API.",
  pt: "Ocorreu um erro ao conectar à API.",
  hi: "एपीआई से कनेक्ट करते समय एक त्रुटि हुई।",
  ar: "حدث خطأ أثناء الاتصال بواجهة برمجة التطبيقات.",
  zh: "连接到API时发生错误。",
  ja: "APIへの接続中にエラーが発生しました。",
  bn: "এপিআই-তে সংযোগ করার সময় একটি ত্রুটি ঘটেছে।"
},

registrationIdCopied: {
  en: "Registration ID copied to clipboard!",
  kn: "ನೋಂದಣಿ ಐಡಿಯನ್ನು ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ!",
  fr: "ID d'inscription copié dans le presse-papiers!",
  de: "Registrierungs-ID in die Zwischenablage kopiert!",
  it: "ID di registrazione copiato negli appunti!",
  pt: "ID de registro copiado para a área de transferência!",
  hi: "पंजीकरण आईडी क्लिपबोर्ड पर कॉपी की गई!",
  ar: "تم نسخ معرف التسجيل إلى الحافظة!",
  zh: "注册ID已复制到剪贴板！",
  ja: "登録IDをクリップボードにコピーしました！",
  bn: "নিবন্ধন আইডি ক্লিপবোর্ডে কপি করা হয়েছে!"
},

mobileAlreadyRegistered: {
  en: "This mobile number is already registered",
  kn: "ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ",
  fr: "Ce numéro de mobile est déjà enregistré",
  de: "Diese Handynummer ist bereits registriert",
  it: "Questo numero di cellulare è già registrato",
  pt: "Este número de celular já está registrado",
  hi: "यह मोबाइल नंबर पहले से पंजीकृत है",
  ar: "رقم الجوال هذا مسجل بالفعل",
  zh: "此手机号码已注册",
  ja: "この携帯番号は既に登録されています",
  bn: "এই মোবাইল নম্বরটি আগে থেকেই নিবন্ধিত"
},

emailAlreadyRegistered: {
  en: "This email is already registered",
  kn: "ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ",
  fr: "Cet e-mail est déjà enregistré",
  de: "Diese E-Mail ist bereits registriert",
  it: "Questa email è già registrata",
  pt: "Este e-mail já está registrado",
  hi: "यह ईमेल पहले से पंजीकृत है",
  ar: "هذا البريد الإلكتروني مسجل بالفعل",
  zh: "此电子邮件已注册",
  ja: "このメールは既に登録されています",
  bn: "এই ইমেলটি আগে থেকেই নিবন্ধিত"
},
// ============ END AGENT REGISTRATION FORM TRANSLATIONS ============

// ============ ADDRESS COMPONENT TRANSLATIONS ============
permanentAddress: {
  en: "Permanent Address *",
  kn: "ಶಾಶ್ವತ ವಿಳಾಸ *",
  fr: "Adresse Permanente *",
  de: "Ständige Adresse *",
  it: "Indirizzo Permanente *",
  pt: "Endereço Permanente *",
  hi: "स्थायी पता *",
  ar: "العنوان الدائم *",
  zh: "永久地址 *",
  ja: "永住住所 *",
  bn: "স্থায়ী ঠিকানা *"
},

correspondenceAddress: {
  en: "Correspondence Address *",
  kn: "ಪತ್ರ ವ್ಯವಹಾರದ ವಿಳಾಸ *",
  fr: "Adresse de Correspondance *",
  de: "Korrespondenzadresse *",
  it: "Indirizzo di Corrispondenza *",
  pt: "Endereço de Correspondência *",
  hi: "पत्राचार पता *",
  ar: "عنوان المراسلات *",
  zh: "通讯地址 *",
  ja: "連絡先住所 *",
  bn: "পত্র correspondence ঠিকানা *"
},

apartmentLabel: {
  en: "Apartment/Flat Name or Number *",
  kn: "ಅಪಾರ್ಟ್‌ಮೆಂಟ್/ಫ್ಲಾಟ್ ಹೆಸರು ಅಥವಾ ಸಂಖ್ಯೆ *",
  fr: "Nom ou Numéro d'Appartement *",
  de: "Wohnungsname oder -nummer *",
  it: "Nome o Numero dell'Appartamento *",
  pt: "Nome ou Número do Apartamento *",
  hi: "अपार्टमेंट/फ्लैट का नाम या नंबर *",
  ar: "اسم أو رقم الشقة *",
  zh: "公寓名称或编号 *",
  ja: "アパート名または番号 *",
  bn: "অ্যাপার্টমেন্ট/ফ্ল্যাটের নাম বা নম্বর *"
},

streetLabel: {
  en: "Street Name/Locality *",
  kn: "ರಸ್ತೆ ಹೆಸರು/ಪ್ರದೇಶ *",
  fr: "Nom de la Rue/Localité *",
  de: "Straßenname/Ortsteil *",
  it: "Nome della Via/Località *",
  pt: "Nome da Rua/Localidade *",
  hi: "गली का नाम/इलाका *",
  ar: "اسم الشارع/المنطقة *",
  zh: "街道名称/地区 *",
  ja: "通り名/地域 *",
  bn: "রাস্তার নাম/এলাকা *"
},

cityLabel: {
  en: "City *",
  kn: "ನಗರ *",
  fr: "Ville *",
  de: "Stadt *",
  it: "Città *",
  pt: "Cidade *",
  hi: "शहर *",
  ar: "المدينة *",
  zh: "城市 *",
  ja: "都市 *",
  bn: "শহর *"
},

countryLabel: {
  en: "Country *",
  kn: "ದೇಶ *",
  fr: "Pays *",
  de: "Land *",
  it: "Paese *",
  pt: "País *",
  hi: "देश *",
  ar: "البلد *",
  zh: "国家 *",
  ja: "国 *",
  bn: "দেশ *"
},

stateLabel: {
  en: "State *",
  kn: "ರಾಜ್ಯ *",
  fr: "État *",
  de: "Bundesland *",
  it: "Stato *",
  pt: "Estado *",
  hi: "राज्य *",
  ar: "الولاية *",
  zh: "州 *",
  ja: "州 *",
  bn: "রাজ্য *"
},

pincodeLabel: {
  en: "Pincode *",
  kn: "ಪಿನ್‌ಕೋಡ್ *",
  fr: "Code Postal *",
  de: "Postleitzahl *",
  it: "Codice Postale *",
  pt: "Código Postal *",
  hi: "पिनकोड *",
  ar: "الرمز البريدي *",
  zh: "邮政编码 *",
  ja: "郵便番号 *",
  bn: "পিনকোড *"
},

pincodeHelper: {
  en: "6-digit code",
  kn: "6-ಅಂಕಿಯ ಕೋಡ್",
  fr: "Code à 6 chiffres",
  de: "6-stellige Code",
  it: "Codice a 6 cifre",
  pt: "Código de 6 dígitos",
  hi: "6-अंकीय कोड",
  ar: "رمز من 6 أرقام",
  zh: "6位代码",
  ja: "6桁のコード",
  bn: "৬-অঙ্কের কোড"
},

pincodeHelp: {
  en: "Enter your 6-digit postal code. For international addresses, enter ZIP code.",
  kn: "ನಿಮ್ಮ 6-ಅಂಕಿಯ ಅಂಚೆ ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ. ಅಂತರರಾಷ್ಟ್ರೀಯ ವಿಳಾಸಗಳಿಗಾಗಿ, ZIP ಕೋಡ್ ಅನ್ನು ನಮೂದಿಸಿ.",
  fr: "Entrez votre code postal à 6 chiffres. Pour les adresses internationales, entrez le code ZIP.",
  de: "Geben Sie Ihre 6-stellige Postleitzahl ein. Für internationale Adressen geben Sie die ZIP-Code ein.",
  it: "Inserisci il tuo codice postale a 6 cifre. Per indirizzi internazionali, inserisci il codice ZIP.",
  pt: "Digite seu código postal de 6 dígitos. Para endereços internacionais, digite o código ZIP.",
  hi: "अपना 6-अंकीय पिनकोड दर्ज करें। अंतरराष्ट्रीय पतों के लिए, ZIP कोड दर्ज करें।",
  ar: "أدخل الرمز البريدي المكون من 6 أرقام. للعناوين الدولية، أدخل الرمز ZIP.",
  zh: "输入您的6位邮政编码。对于国际地址，请输入邮政编码。",
  ja: "6桁の郵便番号を入力してください。国際的な住所の場合は、ZIPコードを入力してください。",
  bn: "আপনার ৬-অঙ্কের পিনকোড লিখুন। আন্তর্জাতিক ঠিকানার জন্য, জিপ কোড লিখুন।"
},

useSameAddress: {
  en: "Use same address for correspondence",
  kn: "ಪತ್ರ ವ್ಯವಹಾರಕ್ಕಾಗಿ ಅದೇ ವಿಳಾಸವನ್ನು ಬಳಸಿ",
  fr: "Utiliser la même adresse pour la correspondance",
  de: "Dieselbe Adresse für Korrespondenz verwenden",
  it: "Usa lo stesso indirizzo per la corrispondenza",
  pt: "Usar o mesmo endereço para correspondência",
  hi: "पत्राचार के लिए एक ही पते का उपयोग करें",
  ar: "استخدم نفس العنوان للمراسلات",
  zh: "使用相同地址进行通讯",
  ja: "連絡先にも同じ住所を使用する",
  bn: "পত্র correspondence এর জন্য একই ঠিকানা ব্যবহার করুন"
},

addressSynced: {
  en: "Correspondence address is currently synced with permanent address",
  kn: "ಪತ್ರ ವ್ಯವಹಾರದ ವಿಳಾಸವು ಪ್ರಸ್ತುತ ಶಾಶ್ವತ ವಿಳಾಸದೊಂದಿಗೆ ಸಿಂಕ್ ಆಗಿದೆ",
  fr: "L'adresse de correspondance est actuellement synchronisée avec l'adresse permanente",
  de: "Die Korrespondenzadresse ist derzeit mit der ständigen Adresse synchronisiert",
  it: "L'indirizzo di corrispondenza è attualmente sincronizzato con l'indirizzo permanente",
  pt: "O endereço de correspondência está atualmente sincronizado com o endereço permanente",
  hi: "पत्राचार का पता वर्तमान में स्थायी पते के साथ समन्वयित है",
  ar: "عنوان المراسلات متزامن حاليًا مع العنوان الدائم",
  zh: "通讯地址当前与永久地址同步",
  ja: "連絡先住所は現在、永住住所と同期されています",
  bn: "পত্র correspondence ঠিকানা বর্তমানে স্থায়ী ঠিকানার সাথে সিঙ্ক হয়েছে"
},

correspondenceDescription: {
  en: "This is where we'll send your official documents and communications",
  kn: "ನಿಮ್ಮ ಅಧಿಕೃತ ದಾಖಲೆಗಳು ಮತ್ತು ಸಂವಹನಗಳನ್ನು ನಾವು ಇಲ್ಲಿಗೆ ಕಳುಹಿಸುತ್ತೇವೆ",
  fr: "C'est ici que nous enverrons vos documents officiels et communications",
  de: "Hierhin senden wir Ihre offiziellen Dokumente und Mitteilungen",
  it: "Qui invieremo i tuoi documenti ufficiali e comunicazioni",
  pt: "É aqui que enviaremos seus documentos oficiais e comunicações",
  hi: "यह वह जगह है जहां हम आपके आधिकारिक दस्तावेज और संचार भेजेंगे",
  ar: "هنا سنرسل مستنداتك الرسمية ومراسلاتك",
  zh: "我们将在此处发送您的官方文件和通讯",
  ja: "ここに公式文書や連絡事項をお送りします",
  bn: "এখানেই আমরা আপনার অফিসিয়াল নথি এবং যোগাযোগ পাঠাব"
},

selectCountryFirst: {
  en: "Select country first",
  kn: "ಮೊದಲು ದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  fr: "Sélectionnez d'abord le pays",
  de: "Wählen Sie zuerst das Land",
  it: "Seleziona prima il paese",
  pt: "Selecione primeiro o país",
  hi: "पहले देश चुनें",
  ar: "حدد البلد أولاً",
  zh: "请先选择国家",
  ja: "最初に国を選択してください",
  bn: "প্রথমে দেশ নির্বাচন করুন"
},

noStatesAvailable: {
  en: "No states available for this country",
  kn: "ಈ ದೇಶಕ್ಕೆ ಯಾವುದೇ ರಾಜ್ಯಗಳು ಲಭ್ಯವಿಲ್ಲ",
  fr: "Aucun état disponible pour ce pays",
  de: "Keine Bundesländer für dieses Land verfügbar",
  it: "Nessuno stato disponibile per questo paese",
  pt: "Nenhum estado disponível para este país",
  hi: "इस देश के लिए कोई राज्य उपलब्ध नहीं हैं",
  ar: "لا توجد ولايات متاحة لهذا البلد",
  zh: "此国家没有可用的州",
  ja: "この国には利用可能な州がありません",
  bn: "এই দেশের জন্য কোন রাজ্য উপলব্ধ নেই"
},

addressNote: {
  en: "Note: Please ensure your address details are accurate as they will be used for verification and communication purposes.",
  kn: "ಸೂಚನೆ: ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿಳಾಸದ ವಿವರಗಳು ನಿಖರವಾಗಿವೆಯೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ ಏಕೆಂದರೆ ಅವುಗಳನ್ನು ಪರಿಶೀಲನೆ ಮತ್ತು ಸಂವಹನ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.",
  fr: "Remarque : Veuillez vous assurer que les détails de votre adresse sont exacts car ils seront utilisés à des fins de vérification et de communication.",
  de: "Hinweis: Bitte stellen Sie sicher, dass Ihre Adressdaten korrekt sind, da sie für Verifizierungs- und Kommunikationszwecke verwendet werden.",
  it: "Nota: assicurati che i dettagli del tuo indirizzo siano accurati poiché verranno utilizzati per scopi di verifica e comunicazione.",
  pt: "Nota: certifique-se de que os detalhes do seu endereço estão corretos, pois serão usados para fins de verificação e comunicação.",
  hi: "नोट: कृपया सुनिश्चित करें कि आपके पते का विवरण सटीक है क्योंकि इसका उपयोग सत्यापन और संचार उद्देश्यों के लिए किया जाएगा।",
  ar: "ملاحظة: يرجى التأكد من دقة تفاصيل عنوانك حيث سيتم استخدامها لأغراض التحقق والاتصال.",
  zh: "注意：请确保您的地址详细信息准确无误，因为它们将用于验证和通信目的。",
  ja: "注：住所の詳細は、確認および連絡目的で使用されるため、正確であることを確認してください。",
  bn: "দ্রষ্টব্য: আপনার ঠিকানার বিবরণ সঠিক কিনা তা নিশ্চিত করুন কারণ এটি যাচাইকরণ এবং যোগাযোগের উদ্দেশ্যে ব্যবহার করা হবে।"
},

failedToLoadCountries: {
  en: "Failed to load countries. Using default list.",
  kn: "ದೇಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ. ಡೀಫಾಲ್ಟ್ ಪಟ್ಟಿಯನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.",
  fr: "Échec du chargement des pays. Utilisation de la liste par défaut.",
  de: "Laden der Länder fehlgeschlagen. Standardliste wird verwendet.",
  it: "Impossibile caricare i paesi. Utilizzo dell'elenco predefinito.",
  pt: "Falha ao carregar países. Usando lista padrão.",
  hi: "देश लोड करने में विफल। डिफ़ॉल्ट सूची का उपयोग कर रहे हैं।",
  ar: "فشل تحميل البلدان. استخدام القائمة الافتراضية.",
  zh: "加载国家/地区失败。使用默认列表。",
  ja: "国の読み込みに失敗しました。デフォルトのリストを使用しています。",
  bn: "দেশ লোড করতে ব্যর্থ। ডিফল্ট তালিকা ব্যবহার করা হচ্ছে।"
},
// ============ END ADDRESS COMPONENT TRANSLATIONS ============

// ============ BASIC INFORMATION TRANSLATIONS ============
firstNamePlaceholder: {
  en: "First Name *",
  kn: "ಮೊದಲ ಹೆಸರು *",
  fr: "Prénom *",
  de: "Vorname *",
  it: "Nome *",
  pt: "Nome *",
  hi: "पहला नाम *",
  ar: "الاسم الأول *",
  zh: "名字 *",
  ja: "名 *",
  bn: "প্রথম নাম *"
},

middleNamePlaceholder: {
  en: "Middle Name",
  kn: "ಮಧ್ಯದ ಹೆಸರು",
  fr: "Deuxième Prénom",
  de: "Zweiter Vorname",
  it: "Secondo Nome",
  pt: "Nome do Meio",
  hi: "मध्य नाम",
  ar: "الاسم الأوسط",
  zh: "中间名",
  ja: "ミドルネーム",
  bn: "মধ্য নাম"
},

lastNamePlaceholder: {
  en: "Last Name *",
  kn: "ಕೊನೆಯ ಹೆಸರು *",
  fr: "Nom de Famille *",
  de: "Nachname *",
  it: "Cognome *",
  pt: "Sobrenome *",
  hi: "अंतिम नाम *",
  ar: "الاسم الأخير *",
  zh: "姓氏 *",
  ja: "姓 *",
  bn: "শেষ নাম *"
},

dobLabel: {
  en: "Date of Birth *",
  kn: "ಜನ್ಮ ದಿನಾಂಕ *",
  fr: "Date de Naissance *",
  de: "Geburtsdatum *",
  it: "Data di Nascita *",
  pt: "Data de Nascimento *",
  hi: "जन्म तिथि *",
  ar: "تاريخ الميلاد *",
  zh: "出生日期 *",
  ja: "生年月日 *",
  bn: "জন্ম তারিখ *"
},

dobHelperText: {
  en: "You must be at least 18 years old",
  kn: "ನಿಮ್ಮ ವಯಸ್ಸು ಕನಿಷ್ಠ 18 ವರ್ಷ ಇರಬೇಕು",
  fr: "Vous devez avoir au moins 18 ans",
  de: "Sie müssen mindestens 18 Jahre alt sein",
  it: "Devi avere almeno 18 anni",
  pt: "Você deve ter pelo menos 18 anos",
  hi: "आपकी आयु कम से कम 18 वर्ष होनी चाहिए",
  ar: "يجب أن يكون عمرك 18 عامًا على الأقل",
  zh: "您必须年满18岁",
  ja: "18歳以上である必要があります",
  bn: "আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে"
},

genderLabel: {
  en: "Gender *",
  kn: "ಲಿಂಗ *",
  fr: "Genre *",
  de: "Geschlecht *",
  it: "Genere *",
  pt: "Gênero *",
  hi: "लिंग *",
  ar: "الجنس *",
  zh: "性别 *",
  ja: "性別 *",
  bn: "লিঙ্গ *"
},

male: {
  en: "Male",
  kn: "ಪುರುಷ",
  fr: "Homme",
  de: "Männlich",
  it: "Maschio",
  pt: "Masculino",
  hi: "पुरुष",
  ar: "ذكر",
  zh: "男",
  ja: "男性",
  bn: "পুরুষ"
},

female: {
  en: "Female",
  kn: "ಸ್ತ್ರೀ",
  fr: "Femme",
  de: "Weiblich",
  it: "Femmina",
  pt: "Feminino",
  hi: "महिला",
  ar: "أنثى",
  zh: "女",
  ja: "女性",
  bn: "মহিলা"
},

other: {
  en: "Other",
  kn: "ಇತರೆ",
  fr: "Autre",
  de: "Andere",
  it: "Altro",
  pt: "Outro",
  hi: "अन्य",
  ar: "آخر",
  zh: "其他",
  ja: "その他",
  bn: "অন্যান্য"
},

emailPlaceholder: {
  en: "Email *",
  kn: "ಇಮೇಲ್ *",
  fr: "E-mail *",
  de: "E-Mail *",
  it: "Email *",
  pt: "E-mail *",
  hi: "ईमेल *",
  ar: "البريد الإلكتروني *",
  zh: "电子邮件 *",
  ja: "メールアドレス *",
  bn: "ইমেল *"
},

checkingAvailability: {
  en: "Checking availability...",
  kn: "ಲಭ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
  fr: "Vérification de la disponibilité...",
  de: "Verfügbarkeit wird geprüft...",
  it: "Controllo disponibilità...",
  pt: "Verificando disponibilidade...",
  hi: "उपलब्धता जांची जा रही है...",
  ar: "جاري التحقق من التوفر...",
  zh: "正在检查可用性...",
  ja: "利用可能か確認中...",
  bn: "উপলব্ধতা পরীক্ষা করা হচ্ছে..."
},

emailAvailable: {
  en: "Email is available",
  kn: "ಇಮೇಲ್ ಲಭ್ಯವಿದೆ",
  fr: "L'email est disponible",
  de: "E-Mail ist verfügbar",
  it: "L'email è disponibile",
  pt: "O e-mail está disponível",
  hi: "ईमेल उपलब्ध है",
  ar: "البريد الإلكتروني متاح",
  zh: "电子邮件可用",
  ja: "メールは利用可能です",
  bn: "ইমেলটি উপলব্ধ"
},

passwordPlaceholder: {
  en: "Password *",
  kn: "ಪಾಸ್ವರ್ಡ್ *",
  fr: "Mot de Passe *",
  de: "Passwort *",
  it: "Password *",
  pt: "Senha *",
  hi: "पासवर्ड *",
  ar: "كلمة المرور *",
  zh: "密码 *",
  ja: "パスワード *",
  bn: "পাসওয়ার্ড *"
},

confirmPasswordPlaceholder: {
  en: "Confirm Password *",
  kn: "ಪಾಸ್ವರ್ಡ್ ದೃಢೀಕರಿಸಿ *",
  fr: "Confirmer le Mot de Passe *",
  de: "Passwort Bestätigen *",
  it: "Conferma Password *",
  pt: "Confirmar Senha *",
  hi: "पासवर्ड की पुष्टि करें *",
  ar: "تأكيد كلمة المرور *",
  zh: "确认密码 *",
  ja: "パスワード確認 *",
  bn: "পাসওয়ার্ড নিশ্চিত করুন *"
},

mobilePlaceholder: {
  en: "Mobile Number *",
  kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *",
  fr: "Numéro de Mobile *",
  de: "Handynummer *",
  it: "Numero di Cellulare *",
  pt: "Número de Celular *",
  hi: "मोबाइल नंबर *",
  ar: "رقم الجوال *",
  zh: "手机号码 *",
  ja: "携帯番号 *",
  bn: "মোবাইল নম্বর *"
},

mobileAvailable: {
  en: "Mobile number is available",
  kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಲಭ್ಯವಿದೆ",
  fr: "Le numéro de mobile est disponible",
  de: "Handynummer ist verfügbar",
  it: "Il numero di cellulare è disponibile",
  pt: "O número de celular está disponível",
  hi: "मोबाइल नंबर उपलब्ध है",
  ar: "رقم الجوال متاح",
  zh: "手机号码可用",
  ja: "携帯番号は利用可能です",
  bn: "মোবাইল নম্বরটি উপলব্ধ"
},

alternatePlaceholder: {
  en: "Alternate Number",
  kn: "ಪರ್ಯಾಯ ಸಂಖ್ಯೆ",
  fr: "Numéro Alternatif",
  de: "Alternative Nummer",
  it: "Numero Alternativo",
  pt: "Número Alternativo",
  hi: "वैकल्पिक नंबर",
  ar: "رقم بديل",
  zh: "备用号码",
  ja: "代替番号",
  bn: "বিকল্প নম্বর"
},

alternateAvailable: {
  en: "Alternate number is available",
  kn: "ಪರ್ಯಾಯ ಸಂಖ್ಯೆ ಲಭ್ಯವಿದೆ",
  fr: "Le numéro alternatif est disponible",
  de: "Alternative Nummer ist verfügbar",
  it: "Il numero alternativo è disponibile",
  pt: "O número alternativo está disponível",
  hi: "वैकल्पिक नंबर उपलब्ध है",
  ar: "الرقم البديل متاح",
  zh: "备用号码可用",
  ja: "代替番号は利用可能です",
  bn: "বিকল্প নম্বরটি উপলব্ধ"
},
// ============ END BASIC INFORMATION TRANSLATIONS ============

// ============ CUSTOM FILE INPUT TRANSLATIONS ============
chooseFile: {
  en: "Choose File",
  kn: "ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
  fr: "Choisir un Fichier",
  de: "Datei Auswählen",
  it: "Scegli File",
  pt: "Escolher Arquivo",
  hi: "फ़ाइल चुनें",
  ar: "اختر ملف",
  zh: "选择文件",
  ja: "ファイルを選択",
  bn: "ফাইল নির্বাচন করুন"
},

selectedFile: {
  en: "Selected File:",
  kn: "ಆಯ್ಕೆಮಾಡಿದ ಫೈಲ್:",
  fr: "Fichier Sélectionné:",
  de: "Ausgewählte Datei:",
  it: "File Selezionato:",
  pt: "Arquivo Selecionado:",
  hi: "चयनित फ़ाइल:",
  ar: "الملف المحدد:",
  zh: "已选择文件:",
  ja: "選択されたファイル:",
  bn: "নির্বাচিত ফাইল:"
},

removeFile: {
  en: "Remove file",
  kn: "ಫೈಲ್ ತೆಗೆದುಹಾಕಿ",
  fr: "Supprimer le fichier",
  de: "Datei entfernen",
  it: "Rimuovi file",
  pt: "Remover arquivo",
  hi: "फ़ाइल हटाएं",
  ar: "إزالة الملف",
  zh: "移除文件",
  ja: "ファイルを削除",
  bn: "ফাইল সরান"
},

preview: {
  en: "Preview:",
  kn: "ಮುನ್ನೋಟ:",
  fr: "Aperçu:",
  de: "Vorschau:",
  it: "Anteprima:",
  pt: "Visualização:",
  hi: "पूर्वावलोकन:",
  ar: "معاينة:",
  zh: "预览:",
  ja: "プレビュー:",
  bn: "প্রিভিউ:"
},

changeFile: {
  en: "Change File",
  kn: "ಫೈಲ್ ಬದಲಾಯಿಸಿ",
  fr: "Changer de Fichier",
  de: "Datei ändern",
  it: "Cambia File",
  pt: "Alterar Arquivo",
  hi: "फ़ाइल बदलें",
  ar: "تغيير الملف",
  zh: "更改文件",
  ja: "ファイルを変更",
  bn: "ফাইল পরিবর্তন করুন"
},

documentPreview: {
  en: "Document preview",
  kn: "ಡಾಕ್ಯುಮೆಂಟ್ ಮುನ್ನೋಟ",
  fr: "Aperçu du document",
  de: "Dokumentenvorschau",
  it: "Anteprima del documento",
  pt: "Visualização do documento",
  hi: "दस्तावेज़ पूर्वावलोकन",
  ar: "معاينة المستند",
  zh: "文档预览",
  ja: "ドキュメントプレビュー",
  bn: "নথির প্রিভিউ"
},
// ============ END CUSTOM FILE INPUT TRANSLATIONS ============

// ============ KYC VERIFICATION TRANSLATIONS ============
selectKycDocumentType: {
  en: "Select KYC Document Type *",
  kn: "KYC ಡಾಕ್ಯುಮೆಂಟ್ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ *",
  fr: "Sélectionnez le Type de Document KYC *",
  de: "Wählen Sie den KYC-Dokumenttyp *",
  it: "Seleziona il Tipo di Documento KYC *",
  pt: "Selecione o Tipo de Documento KYC *",
  hi: "केवाईसी दस्तावेज़ प्रकार चुनें *",
  ar: "اختر نوع مستند KYC *",
  zh: "选择KYC文件类型 *",
  ja: "KYC書類タイプを選択 *",
  bn: "কেওয়াইসি ডকুমেন্টের ধরন নির্বাচন করুন *"
},

aadhaarCard: {
  en: "Aadhaar Card",
  kn: "ಆಧಾರ್ ಕಾರ್ಡ್",
  fr: "Carte Aadhaar",
  de: "Aadhaar-Karte",
  it: "Carta Aadhaar",
  pt: "Cartão Aadhaar",
  hi: "आधार कार्ड",
  ar: "بطاقة أدهار",
  zh: "Aadhaar卡",
  ja: "アーダールカード",
  bn: "আধার কার্ড"
},

governmentIdProof: {
  en: "Government ID proof",
  kn: "ಸರ್ಕಾರಿ ಗುರುತಿನ ಚೀಟಿ",
  fr: "Preuve d'identité gouvernementale",
  de: "Regierungsausweis",
  it: "Prova d'identità governativa",
  pt: "Comprovante de identidade governamental",
  hi: "सरकारी पहचान प्रमाण",
  ar: "إثبات الهوية الحكومية",
  zh: "政府身份证件",
  ja: "政府発行の身分証明書",
  bn: "সরকারি পরিচয় প্রমাণ"
},

aadhaarNumberPlaceholder: {
  en: "Aadhaar Number *",
  kn: "ಆಧಾರ್ ಸಂಖ್ಯೆ *",
  fr: "Numéro Aadhaar *",
  de: "Aadhaar-Nummer *",
  it: "Numero Aadhaar *",
  pt: "Número do Aadhaar *",
  hi: "आधार नंबर *",
  ar: "رقم أدهار *",
  zh: "Aadhaar号码 *",
  ja: "アーダール番号 *",
  bn: "আধার নম্বর *"
},

aadhaarHelperText: {
  en: "Enter 12-digit Aadhaar number",
  kn: "12-ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
  fr: "Entrez le numéro Aadhaar à 12 chiffres",
  de: "Geben Sie die 12-stellige Aadhaar-Nummer ein",
  it: "Inserisci il numero Aadhaar a 12 cifre",
  pt: "Digite o número do Aadhaar de 12 dígitos",
  hi: "12-अंकीय आधार नंबर दर्ज करें",
  ar: "أدخل رقم أدهار المكون من 12 رقمًا",
  zh: "输入12位Aadhaar号码",
  ja: "12桁のアーダール番号を入力してください",
  bn: "১২-অঙ্কের আধার নম্বর লিখুন"
},

panCard: {
  en: "PAN Card",
  kn: "PAN ಕಾರ್ಡ್",
  fr: "Carte PAN",
  de: "PAN-Karte",
  it: "Carta PAN",
  pt: "Cartão PAN",
  hi: "पैन कार्ड",
  ar: "بطاقة PAN",
  zh: "PAN卡",
  ja: "PANカード",
  bn: "প্যান কার্ড"
},

panDescription: {
  en: "Permanent Account Number",
  kn: "ಶಾಶ್ವತ ಖಾತೆ ಸಂಖ್ಯೆ",
  fr: "Numéro de compte permanent",
  de: "Permanente Kontonummer",
  it: "Numero di conto permanente",
  pt: "Número de Conta Permanente",
  hi: "स्थायी खाता संख्या",
  ar: "رقم الحساب الدائم",
  zh: "永久账号",
  ja: "永久アカウント番号",
  bn: "স্থায়ী অ্যাকাউন্ট নম্বর"
},

panNumberPlaceholder: {
  en: "PAN Number *",
  kn: "PAN ಸಂಖ್ಯೆ *",
  fr: "Numéro PAN *",
  de: "PAN-Nummer *",
  it: "Numero PAN *",
  pt: "Número do PAN *",
  hi: "पैन नंबर *",
  ar: "رقم PAN *",
  zh: "PAN号码 *",
  ja: "PAN番号 *",
  bn: "প্যান নম্বর *"
},

panHelperText: {
  en: "Enter 10-digit PAN (e.g., ABCDE1234F)",
  kn: "10-ಅಂಕಿಯ PAN ಅನ್ನು ನಮೂದಿಸಿ (ಉದಾ, ABCDE1234F)",
  fr: "Entrez le PAN à 10 chiffres (ex., ABCDE1234F)",
  de: "Geben Sie die 10-stellige PAN ein (z.B. ABCDE1234F)",
  it: "Inserisci il PAN a 10 cifre (es., ABCDE1234F)",
  pt: "Digite o PAN de 10 dígitos (ex., ABCDE1234F)",
  hi: "10-अंकीय पैन दर्ज करें (उदा., ABCDE1234F)",
  ar: "أدخل PAN المكون من 10 أرقام (مثل ABCDE1234F)",
  zh: "输入10位PAN（例如：ABCDE1234F）",
  ja: "10桁のPANを入力してください（例：ABCDE1234F）",
  bn: "১০-অঙ্কের প্যান লিখুন (যেমন, ABCDE1234F)"
},

drivingLicense: {
  en: "Driving License",
  kn: "ಚಾಲನಾ ಪರವಾನಗಿ",
  fr: "Permis de Conduire",
  de: "Führerschein",
  it: "Patente di Guida",
  pt: "Carteira de Motorista",
  hi: "ड्राइविंग लाइसेंस",
  ar: "رخصة القيادة",
  zh: "驾照",
  ja: "運転免許証",
  bn: "ড্রাইভিং লাইসেন্স"
},

drivingLicensePlaceholder: {
  en: "Driving License Number *",
  kn: "ಚಾಲನಾ ಪರವಾನಗಿ ಸಂಖ್ಯೆ *",
  fr: "Numéro de Permis de Conduire *",
  de: "Führerscheinnummer *",
  it: "Numero di Patente *",
  pt: "Número da Carteira de Motorista *",
  hi: "ड्राइविंग लाइसेंस नंबर *",
  ar: "رقم رخصة القيادة *",
  zh: "驾照号码 *",
  ja: "運転免許証番号 *",
  bn: "ড্রাইভিং লাইসেন্স নম্বর *"
},

drivingLicenseHelperText: {
  en: "Enter your driving license number",
  kn: "ನಿಮ್ಮ ಚಾಲನಾ ಪರವಾನಗಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
  fr: "Entrez votre numéro de permis de conduire",
  de: "Geben Sie Ihre Führerscheinnummer ein",
  it: "Inserisci il numero della tua patente",
  pt: "Digite o número da sua carteira de motorista",
  hi: "अपना ड्राइविंग लाइसेंस नंबर दर्ज करें",
  ar: "أدخل رقم رخصة القيادة الخاصة بك",
  zh: "输入您的驾照号码",
  ja: "運転免許証番号を入力してください",
  bn: "আপনার ড্রাইভিং লাইসেন্স নম্বর লিখুন"
},

voterId: {
  en: "Voter ID",
  kn: "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ",
  fr: "Carte d'Électeur",
  de: "Wählerausweis",
  it: "Tessera Elettorale",
  pt: "Título de Eleitor",
  hi: "वोटर आईडी",
  ar: "بطاقة الناخب",
  zh: "选民证",
  ja: "有権者ID",
  bn: "ভোটার আইডি"
},

voterIdDescription: {
  en: "Voter Identification Card",
  kn: "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ",
  fr: "Carte d'identification de l'électeur",
  de: "Wähleridentifikationskarte",
  it: "Carta di identificazione dell'elettore",
  pt: "Cartão de Identificação do Eleitor",
  hi: "मतदाता पहचान पत्र",
  ar: "بطاقة تعريف الناخب",
  zh: "选民身份证",
  ja: "有権者識別カード",
  bn: "ভোটার শনাক্তকরণ কার্ড"
},

voterIdPlaceholder: {
  en: "Voter ID Number *",
  kn: "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ ಸಂಖ್ಯೆ *",
  fr: "Numéro de Carte d'Électeur *",
  de: "Wählerausweisnummer *",
  it: "Numero Tessera Elettorale *",
  pt: "Número do Título de Eleitor *",
  hi: "वोटर आईडी नंबर *",
  ar: "رقم بطاقة الناخب *",
  zh: "选民证号码 *",
  ja: "有権者ID番号 *",
  bn: "ভোটার আইডি নম্বর *"
},

voterIdHelperText: {
  en: "Enter 10-digit Voter ID",
  kn: "10-ಅಂಕಿಯ ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
  fr: "Entrez l'ID d'électeur à 10 chiffres",
  de: "Geben Sie die 10-stellige Wähler-ID ein",
  it: "Inserisci l'ID elettore a 10 cifre",
  pt: "Digite o título de eleitor de 10 dígitos",
  hi: "10-अंकीय वोटर आईडी दर्ज करें",
  ar: "أدخل بطاقة الناخب المكونة من 10 أرقام",
  zh: "输入10位选民证号码",
  ja: "10桁の有権者IDを入力してください",
  bn: "১০-অঙ্কের ভোটার আইডি লিখুন"
},

passport: {
  en: "Passport",
  kn: "ಪಾಸ್‌ಪೋರ್ಟ್",
  fr: "Passeport",
  de: "Reisepass",
  it: "Passaporto",
  pt: "Passaporte",
  hi: "पासपोर्ट",
  ar: "جواز سفر",
  zh: "护照",
  ja: "パスポート",
  bn: "পাসপোর্ট"
},

passportPlaceholder: {
  en: "Passport Number *",
  kn: "ಪಾಸ್‌ಪೋರ್ಟ್ ಸಂಖ್ಯೆ *",
  fr: "Numéro de Passeport *",
  de: "Reisepassnummer *",
  it: "Numero di Passaporto *",
  pt: "Número do Passaporte *",
  hi: "पासपोर्ट नंबर *",
  ar: "رقم جواز السفر *",
  zh: "护照号码 *",
  ja: "パスポート番号 *",
  bn: "পাসপোর্ট নম্বর *"
},

passportHelperText: {
  en: "Enter 8-character passport number",
  kn: "8-ಅಕ್ಷರದ ಪಾಸ್‌ಪೋರ್ಟ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
  fr: "Entrez le numéro de passeport à 8 caractères",
  de: "Geben Sie die 8-stellige Reisepassnummer ein",
  it: "Inserisci il numero di passaporto a 8 caratteri",
  pt: "Digite o número do passaporte de 8 caracteres",
  hi: "8-अक्षर का पासपोर्ट नंबर दर्ज करें",
  ar: "أدخل رقم جواز السفر المكون من 8 أحرف",
  zh: "输入8位护照号码",
  ja: "8桁のパスポート番号を入力してください",
  bn: "৮-অক্ষরের পাসপোর্ট নম্বর লিখুন"
},

uploadDocument: {
  en: "Upload {documentName} Document",
  kn: "{documentName} ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
  fr: "Télécharger le Document {documentName}",
  de: "{documentName} Dokument hochladen",
  it: "Carica Documento {documentName}",
  pt: "Enviar Documento {documentName}",
  hi: "{documentName} दस्तावेज़ अपलोड करें",
  ar: "تحميل مستند {documentName}",
  zh: "上传{documentName}文件",
  ja: "{documentName}書類をアップロード",
  bn: "{documentName} ডকুমেন্ট আপলোড করুন"
},

kycNote: {
  en: "Note: Please upload a clear image of your {documentName}. Accepted formats: JPG, PNG, PDF. Max size: 5MB.",
  kn: "ಸೂಚನೆ: ದಯವಿಟ್ಟು ನಿಮ್ಮ {documentName} ನ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಸ್ವೀಕರಿಸಿದ ಸ್ವರೂಪಗಳು: JPG, PNG, PDF. ಗರಿಷ್ಠ ಗಾತ್ರ: 5MB.",
  fr: "Remarque : Veuillez télécharger une image claire de votre {documentName}. Formats acceptés : JPG, PNG, PDF. Taille max : 5 Mo.",
  de: "Hinweis: Bitte laden Sie ein klares Bild Ihres {documentName} hoch. Akzeptierte Formate: JPG, PNG, PDF. Max. Größe: 5 MB.",
  it: "Nota: carica un'immagine chiara del tuo {documentName}. Formati accettati: JPG, PNG, PDF. Dimensione max: 5MB.",
  pt: "Nota: envie uma imagem clara do seu {documentName}. Formatos aceitos: JPG, PNG, PDF. Tamanho máximo: 5MB.",
  hi: "नोट: कृपया अपने {documentName} की एक स्पष्ट छवि अपलोड करें। स्वीकृत प्रारूप: JPG, PNG, PDF। अधिकतम आकार: 5MB।",
  ar: "ملاحظة: يرجى تحميل صورة واضحة لـ {documentName}. الصيغ المقبولة: JPG, PNG, PDF. الحجم الأقصى: 5 ميجابايت.",
  zh: "注意：请上传清晰的{documentName}图像。接受的格式：JPG、PNG、PDF。最大尺寸：5MB。",
  ja: "注：{documentName}の鮮明な画像をアップロードしてください。対応形式：JPG、PNG、PDF。最大サイズ：5MB。",
  bn: "দ্রষ্টব্য: আপনার {documentName} এর একটি পরিষ্কার ছবি আপলোড করুন। গৃহীত ফরম্যাট: JPG, PNG, PDF। সর্বোচ্চ আকার: ৫এমবি।"
},
// ============ END KYC VERIFICATION TRANSLATIONS ============


// ============ PROFILE IMAGE UPLOAD TRANSLATIONS ============
uploadProfilePicture: {
  en: "Upload Profile Picture",
  kn: "ಪ್ರೊಫೈಲ್ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
  fr: "Télécharger la Photo de Profil",
  de: "Profilbild Hochladen",
  it: "Carica Immagine del Profilo",
  pt: "Enviar Foto de Perfil",
  hi: "प्रोफ़ाइल चित्र अपलोड करें",
  ar: "تحميل صورة الملف الشخصي",
  zh: "上传个人资料图片",
  ja: "プロフィール画像をアップロード",
  bn: "প্রোফাইল ছবি আপলোড করুন"
},

confirm: {
  en: "Confirm",
  kn: "ದೃಢೀಕರಿಸಿ",
  fr: "Confirmer",
  de: "Bestätigen",
  it: "Conferma",
  pt: "Confirmar",
  hi: "पुष्टि करें",
  ar: "تأكيد",
  zh: "确认",
  ja: "確認",
  bn: "নিশ্চিত করুন"
},
// ============ END PROFILE IMAGE UPLOAD TRANSLATIONS ============

// ============ SERVICE DETAILS TRANSLATIONS ============
serviceDetails: {
  en: "Service Details",
  kn: "ಸೇವಾ ವಿವರಗಳು",
  fr: "Détails du Service",
  de: "Servicedetails",
  it: "Dettagli del Servizio",
  pt: "Detalhes do Serviço",
  hi: "सेवा विवरण",
  ar: "تفاصيل الخدمة",
  zh: "服务详情",
  ja: "サービス詳細",
  bn: "সেবার বিবরণ"
},

selectServiceType: {
  en: "Select Service Type(s)",
  kn: "ಸೇವಾ ಪ್ರಕಾರ(ಗಳನ್ನು) ಆಯ್ಕೆಮಾಡಿ",
  fr: "Sélectionnez le(s) Type(s) de Service",
  de: "Servicetyp(en) auswählen",
  it: "Seleziona Tipo(i) di Servizio",
  pt: "Selecione o(s) Tipo(s) de Serviço",
  hi: "सेवा प्रकार चुनें",
  ar: "اختر نوع (أنواع) الخدمة",
  zh: "选择服务类型",
  ja: "サービスタイプを選択",
  bn: "সেবার ধরন নির্বাচন করুন"
},

cook: {
  en: "Cook",
  kn: "ಅಡುಗೆಯವರು",
  fr: "Cuisinier",
  de: "Koch",
  it: "Cuoco",
  pt: "Cozinheiro",
  hi: "रसोइया",
  ar: "طباخ",
  zh: "厨师",
  ja: "料理人",
  bn: "রাঁধুনি"
},

nanny: {
  en: "Nanny",
  kn: "ದಾದಿ",
  fr: "Nounou",
  de: "Kindermädchen",
  it: "Tata",
  pt: "Babá",
  hi: "आया",
  ar: "مربية",
  zh: "保姆",
  ja: "ナニー",
  bn: "আয়া"
},

maid: {
  en: "Maid",
  kn: "ಮನೆಕೆಲಸದವರು",
  fr: "Femme de ménage",
  de: "Haushaltshilfe",
  it: "Colf",
  pt: "Empregada",
  hi: "नौकरानी",
  ar: "خادمة",
  zh: "女佣",
  ja: "メイド",
  bn: "গৃহকর্মী"
},

cookingSpeciality: {
  en: "Cooking Speciality",
  kn: "ಅಡುಗೆ ವಿಶೇಷತೆ",
  fr: "Spécialité Culinaire",
  de: "Kochspezialität",
  it: "Specialità Culinaria",
  pt: "Especialidade Culinária",
  hi: "खाना पकाने की विशेषज्ञता",
  ar: "تخصص الطبخ",
  zh: "烹饪特长",
  ja: "料理の得意分野",
  bn: "রান্নার বিশেষত্ব"
},

veg: {
  en: "Veg",
  kn: "ಸಸ್ಯಾಹಾರಿ",
  fr: "Végétarien",
  de: "Vegetarisch",
  it: "Vegetariano",
  pt: "Vegetariano",
  hi: "शाकाहारी",
  ar: "نباتي",
  zh: "素食",
  ja: "ベジタリアン",
  bn: "নিরামিষ"
},

nonVeg: {
  en: "Non-Veg",
  kn: "ಮಾಂಸಾಹಾರಿ",
  fr: "Non Végétarien",
  de: "Nicht-vegetarisch",
  it: "Non Vegetariano",
  pt: "Não Vegetariano",
  hi: "मांसाहारी",
  ar: "غير نباتي",
  zh: "非素食",
  ja: "非ベジタリアン",
  bn: "আমিষ"
},

both: {
  en: "Both",
  kn: "ಎರಡೂ",
  fr: "Les Deux",
  de: "Beides",
  it: "Entrambi",
  pt: "Ambos",
  hi: "दोनों",
  ar: "كلاهما",
  zh: "两者",
  ja: "両方",
  bn: "উভয়"
},

careType: {
  en: "Care Type",
  kn: "ಆರೈಕೆಯ ಪ್ರಕಾರ",
  fr: "Type de Soin",
  de: "Betreuungsart",
  it: "Tipo di Assistenza",
  pt: "Tipo de Cuidado",
  hi: "देखभाल प्रकार",
  ar: "نوع الرعاية",
  zh: "护理类型",
  ja: "ケアの種類",
  bn: "যত্নের ধরন"
},

babyCare: {
  en: "Baby Care",
  kn: "ಶಿಶು ಆರೈಕೆ",
  fr: "Soins pour Bébés",
  de: "Babypflege",
  it: "Cura del Bambino",
  pt: "Cuidados com Bebês",
  hi: "शिशु देखभाल",
  ar: "رعاية الأطفال",
  zh: "婴儿护理",
  ja: "ベビーケア",
  bn: "শিশু যত্ন"
},

elderlyCare: {
  en: "Elderly Care",
  kn: "ಹಿರಿಯರ ಆರೈಕೆ",
  fr: "Soins aux Personnes Âgées",
  de: "Seniorenbetreuung",
  it: "Cura degli Anziani",
  pt: "Cuidados com Idosos",
  hi: "वृद्ध देखभाल",
  ar: "رعاية المسنين",
  zh: "老人护理",
  ja: "高齢者介護",
  bn: "বয়স্ক যত্ন"
},

dietPreference: {
  en: "Diet Preference",
  kn: "ಆಹಾರದ ಆದ್ಯತೆ",
  fr: "Préférence Alimentaire",
  de: "Ernährungspräferenz",
  it: "Preferenza Alimentare",
  pt: "Preferência Alimentar",
  hi: "आहार प्राथमिकता",
  ar: "التفضيل الغذائي",
  zh: "饮食偏好",
  ja: "食事の好み",
  bn: "খাদ্য পছন্দ"
},

serviceDescription: {
  en: "Description",
  kn: "ವಿವರಣೆ",
  fr: "Description",
  de: "Beschreibung",
  it: "Descrizione",
  pt: "Descrição",
  hi: "विवरण",
  ar: "الوصف",
  zh: "描述",
  ja: "説明",
  bn: "বর্ণনা"
},

experience: {
  en: "Experience *",
  kn: "ಅನುಭವ *",
  fr: "Expérience *",
  de: "Erfahrung *",
  it: "Esperienza *",
  pt: "Experiência *",
  hi: "अनुभव *",
  ar: "الخبرة *",
  zh: "经验 *",
  ja: "経験 *",
  bn: "অভিজ্ঞতা *"
},

experienceHelperText: {
  en: "Years in business or relevant experience",
  kn: "ವ್ಯವಹಾರದಲ್ಲಿ ಅಥವಾ ಸಂಬಂಧಿತ ಅನುಭವದ ವರ್ಷಗಳು",
  fr: "Années d'activité ou expérience pertinente",
  de: "Jahre im Geschäft oder relevante Erfahrung",
  it: "Anni di attività o esperienza rilevante",
  pt: "Anos de negócio ou experiência relevante",
  hi: "व्यवसाय में वर्ष या प्रासंगिक अनुभव",
  ar: "سنوات في العمل أو الخبرة ذات الصلة",
  zh: "从业年限或相关经验",
  ja: "事業年数または関連する経験",
  bn: "ব্যবসায় বছর বা প্রাসঙ্গিক অভিজ্ঞতা"
},

referralCode: {
  en: "Referral Code (Optional)",
  kn: "ರೆಫರಲ್ ಕೋಡ್ (ಐಚ್ಛಿಕ)",
  fr: "Code de Parrainage (Optionnel)",
  de: "Empfehlungscode (Optional)",
  it: "Codice di Riferimento (Opzionale)",
  pt: "Código de Indicação (Opcional)",
  hi: "रेफरल कोड (वैकल्पिक)",
  ar: "رمز الإحالة (اختياري)",
  zh: "推荐码（可选）",
  ja: "紹介コード（オプション）",
  bn: "রেফারেল কোড (ঐচ্ছিক)"
},

selectAvailableTimeSlots: {
  en: "Select Your Available Time Slots",
  kn: "ನಿಮ್ಮ ಲಭ್ಯವಿರುವ ಸಮಯದ ಸ್ಲಾಟ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  fr: "Sélectionnez Vos Créneaux Horaires Disponibles",
  de: "Wählen Sie Ihre Verfügbaren Zeitfenster",
  it: "Seleziona i Tuoi Slot Orari Disponibili",
  pt: "Selecione Seus Horários Disponíveis",
  hi: "अपने उपलब्ध समय स्लॉट चुनें",
  ar: "حدد الأوقات المتاحة لك",
  zh: "选择您的可用时间段",
  ja: "利用可能な時間枠を選択",
  bn: "আপনার উপলব্ধ সময় স্লট নির্বাচন করুন"
},

fullTimeAvailability: {
  en: "Full Time Availability",
  kn: "ಪೂರ್ಣ ಸಮಯದ ಲಭ್ಯತೆ",
  fr: "Disponibilité à Temps Plein",
  de: "Vollzeitverfügbarkeit",
  it: "Disponibilità a Tempo Pieno",
  pt: "Disponibilidade em Tempo Integral",
  hi: "पूर्णकालिक उपलब्धता",
  ar: "التفرغ الكامل",
  zh: "全职可用",
  ja: "フルタイム可能",
  bn: "পূর্ণকালীন উপলব্ধতা"
},

fullTimeDescription: {
  en: "6:00 AM - 8:00 PM (All slots covered)",
  kn: "ಬೆಳಿಗ್ಗೆ 6:00 - ರಾತ್ರಿ 8:00 (ಎಲ್ಲಾ ಸ್ಲಾಟ್‌ಗಳು ಆವರಿಸಲ್ಪಟ್ಟಿವೆ)",
  fr: "6h00 - 20h00 (Tous les créneaux couverts)",
  de: "6:00 - 20:00 Uhr (Alle Zeitfenster abgedeckt)",
  it: "6:00 - 20:00 (Tutti gli slot coperti)",
  pt: "6:00 - 20:00 (Todos os horários cobertos)",
  hi: "सुबह 6:00 - रात 8:00 (सभी स्लॉट कवर)",
  ar: "٦:٠٠ صباحاً - ٨:٠٠ مساءً (جميع الأوقات مغطاة)",
  zh: "上午6:00 - 晚上8:00（涵盖所有时间段）",
  ja: "6:00 - 20:00（すべての枠をカバー）",
  bn: "সকাল ৬:০০ - রাত ৮:০০ (সমস্ত স্লট কভার)"
},

morningAvailability: {
  en: "Morning Availability",
  kn: "ಬೆಳಗಿನ ಲಭ್ಯತೆ",
  fr: "Disponibilité Matinale",
  de: "Morgenverfügbarkeit",
  it: "Disponibilità Mattutina",
  pt: "Disponibilidade Matutina",
  hi: "सुबह की उपलब्धता",
  ar: "التوفر الصباحي",
  zh: "上午可用性",
  ja: "午前中の利用可能時間",
  bn: "সকালের উপলব্ধতা"
},

notAvailable: {
  en: "Not Available",
  kn: "ಲಭ್ಯವಿಲ್ಲ",
  fr: "Non Disponible",
  de: "Nicht Verfügbar",
  it: "Non Disponibile",
  pt: "Não Disponível",
  hi: "उपलब्ध नहीं",
  ar: "غير متاح",
  zh: "不可用",
  ja: "利用不可",
  bn: "উপলব্ধ নয়"
},

slot: {
  en: "slot(s)",
  kn: "ಸ್ಲಾಟ್(ಗಳು)",
  fr: "créneau(x)",
  de: "Zeitfenster",
  it: "slot",
  pt: "horário(s)",
  hi: "स्लॉट",
  ar: "موعد/مواعيد",
  zh: "个时间段",
  ja: "枠",
  bn: "টি স্লট"
},

addSlot: {
  en: "Add Slot",
  kn: "ಸ್ಲಾಟ್ ಸೇರಿಸಿ",
  fr: "Ajouter un Créneau",
  de: "Zeitfenster hinzufügen",
  it: "Aggiungi Slot",
  pt: "Adicionar Horário",
  hi: "स्लॉट जोड़ें",
  ar: "إضافة موعد",
  zh: "添加时间段",
  ja: "枠を追加",
  bn: "স্লট যোগ করুন"
},

clearAll: {
  en: "Clear All",
  kn: "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ",
  fr: "Tout Effacer",
  de: "Alle löschen",
  it: "Cancella Tutto",
  pt: "Limpar Tudo",
  hi: "सभी हटाएं",
  ar: "مسح الكل",
  zh: "全部清除",
  ja: "すべてクリア",
  bn: "সব মুছুন"
},

notAvailableMorning: {
  en: "Not available in the morning",
  kn: "ಬೆಳಿಗ್ಗೆ ಲಭ್ಯವಿಲ್ಲ",
  fr: "Non disponible le matin",
  de: "Morgens nicht verfügbar",
  it: "Non disponibile al mattino",
  pt: "Não disponível pela manhã",
  hi: "सुबह उपलब्ध नहीं",
  ar: "غير متاح في الصباح",
  zh: "上午不可用",
  ja: "午前中は利用できません",
  bn: "সকালে উপলব্ধ নয়"
},

addMorningSlots: {
  en: "Add Morning Slots",
  kn: "ಬೆಳಗಿನ ಸ್ಲಾಟ್‌ಗಳನ್ನು ಸೇರಿಸಿ",
  fr: "Ajouter des Créneaux Matinaux",
  de: "Morgenzeitfenster hinzufügen",
  it: "Aggiungi Slot Mattutini",
  pt: "Adicionar Horários Matutinos",
  hi: "सुबह के स्लॉट जोड़ें",
  ar: "إضافة مواعيد صباحية",
  zh: "添加上午时间段",
  ja: "午前中の枠を追加",
  bn: "সকালের স্লট যোগ করুন"
},

timeSlot: {
  en: "Time Slot",
  kn: "ಸಮಯ ಸ್ಲಾಟ್",
  fr: "Créneau Horaire",
  de: "Zeitfenster",
  it: "Slot Orario",
  pt: "Horário",
  hi: "समय स्लॉट",
  ar: "الموعد",
  zh: "时间段",
  ja: "時間枠",
  bn: "সময় স্লট"
},

selected: {
  en: "Selected:",
  kn: "ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ:",
  fr: "Sélectionné:",
  de: "Ausgewählt:",
  it: "Selezionato:",
  pt: "Selecionado:",
  hi: "चयनित:",
  ar: "المحدد:",
  zh: "已选择:",
  ja: "選択済み:",
  bn: "নির্বাচিত:"
},

warningGrayAreas: {
  en: "⚠️ Gray areas are already selected in other slots",
  kn: "⚠️ ಬೂದು ಪ್ರದೇಶಗಳು ಈಗಾಗಲೇ ಇತರ ಸ್ಲಾಟ್‌ಗಳಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲ್ಪಟ್ಟಿವೆ",
  fr: "⚠️ Les zones grises sont déjà sélectionnées dans d'autres créneaux",
  de: "⚠️ Graue Bereiche sind bereits in anderen Zeitfenstern ausgewählt",
  it: "⚠️ Le aree grigie sono già selezionate in altri slot",
  pt: "⚠️ As áreas cinzas já estão selecionadas em outros horários",
  hi: "⚠️ ग्रे क्षेत्र पहले से ही अन्य स्लॉट में चयनित हैं",
  ar: "⚠️ المناطق الرمادية محددة بالفعل في مواعيد أخرى",
  zh: "⚠️ 灰色区域已在其他时间段中被选择",
  ja: "⚠️ グレーの領域は他の枠ですでに選択されています",
  bn: "⚠️ ধূসর এলাকাগুলি ইতিমধ্যে অন্যান্য স্লটে নির্বাচিত হয়েছে"
},

eveningAvailability: {
  en: "Evening Availability",
  kn: "ಸಂಜೆಯ ಲಭ್ಯತೆ",
  fr: "Disponibilité en Soirée",
  de: "Abendverfügbarkeit",
  it: "Disponibilità Serale",
  pt: "Disponibilidade Vespertina",
  hi: "शाम की उपलब्धता",
  ar: "التوفر المسائي",
  zh: "晚上可用性",
  ja: "午後の利用可能時間",
  bn: "সন্ধ্যার উপলব্ধতা"
},

notAvailableEvening: {
  en: "Not available in the evening",
  kn: "ಸಂಜೆ ಲಭ್ಯವಿಲ್ಲ",
  fr: "Non disponible le soir",
  de: "Abends nicht verfügbar",
  it: "Non disponibile la sera",
  pt: "Não disponível à tarde",
  hi: "शाम उपलब्ध नहीं",
  ar: "غير متاح في المساء",
  zh: "晚上不可用",
  ja: "午後は利用できません",
  bn: "সন্ধ্যায় উপলব্ধ নয়"
},

addEveningSlots: {
  en: "Add Evening Slots",
  kn: "ಸಂಜೆಯ ಸ್ಲಾಟ್‌ಗಳನ್ನು ಸೇರಿಸಿ",
  fr: "Ajouter des Créneaux en Soirée",
  de: "Abendzeitfenster hinzufügen",
  it: "Aggiungi Slot Serali",
  pt: "Adicionar Horários Vespertinos",
  hi: "शाम के स्लॉट जोड़ें",
  ar: "إضافة مواعيد مسائية",
  zh: "添加晚上时间段",
  ja: "午後の枠を追加",
  bn: "সন্ধ্যার স্লট যোগ করুন"
},

yourSelectedTimeSlots: {
  en: "Your Selected Time Slots:",
  kn: "ನಿಮ್ಮ ಆಯ್ಕೆಮಾಡಿದ ಸಮಯದ ಸ್ಲಾಟ್‌ಗಳು:",
  fr: "Vos Créneaux Horaires Sélectionnés:",
  de: "Ihre Ausgewählten Zeitfenster:",
  it: "I Tuoi Slot Orari Selezionati:",
  pt: "Seus Horários Selecionados:",
  hi: "आपके चयनित समय स्लॉट:",
  ar: "الأوقات التي اخترتها:",
  zh: "您选择的时间段:",
  ja: "選択した時間枠:",
  bn: "আপনার নির্বাচিত সময় স্লট:"
},
// ============ END SERVICE DETAILS TRANSLATIONS ============

// ============ SERVICE PROVIDER REGISTRATION TRANSLATIONS ============
basicInformation: {
  en: "Basic Information",
  kn: "ಮೂಲ ಮಾಹಿತಿ",
  fr: "Informations de Base",
  de: "Grundinformationen",
  it: "Informazioni di Base",
  pt: "Informações Básicas",
  hi: "मूल जानकारी",
  ar: "المعلومات الأساسية",
  zh: "基本信息",
  ja: "基本情報",
  bn: "মৌলিক তথ্য"
},

addressInformation: {
  en: "Address Information",
  kn: "ವಿಳಾಸ ಮಾಹಿತಿ",
  fr: "Informations d'Adresse",
  de: "Adressinformationen",
  it: "Informazioni sull'Indirizzo",
  pt: "Informações de Endereço",
  hi: "पता जानकारी",
  ar: "معلومات العنوان",
  zh: "地址信息",
  ja: "住所情報",
  bn: "ঠিকানা তথ্য"
},

additionalDetails: {
  en: "Additional Details",
  kn: "ಹೆಚ್ಚುವರಿ ವಿವರಗಳು",
  fr: "Détails Supplémentaires",
  de: "Zusätzliche Details",
  it: "Dettagli Aggiuntivi",
  pt: "Detalhes Adicionais",
  hi: "अतिरिक्त विवरण",
  ar: "تفاصيل إضافية",
  zh: "附加详情",
  ja: "追加詳細",
  bn: "অতিরিক্ত বিবরণ"
},

kycVerification: {
  en: "KYC Verification",
  kn: "KYC ಪರಿಶೀಲನೆ",
  fr: "Vérification KYC",
  de: "KYC-Verifizierung",
  it: "Verifica KYC",
  pt: "Verificação KYC",
  hi: "केवाईसी सत्यापन",
  ar: "التحقق من KYC",
  zh: "KYC验证",
  ja: "KYC確認",
  bn: "কেওয়াইসি যাচাইকরণ"
},

confirmation: {
  en: "Confirmation",
  kn: "ದೃಢೀಕರಣ",
  fr: "Confirmation",
  de: "Bestätigung",
  it: "Conferma",
  pt: "Confirmação",
  hi: "पुष्टि",
  ar: "تأكيد",
  zh: "确认",
  ja: "確認",
  bn: "নিশ্চিতকরণ"
},
timeRangeOverlaps: {
  en: "This time range overlaps with another selected slot",
  kn: "ಈ ಸಮಯದ ವ್ಯಾಪ್ತಿಯು ಮತ್ತೊಂದು ಆಯ್ಕೆಮಾಡಿದ ಸ್ಲಾಟ್‌ನೊಂದಿಗೆ ಅತಿಕ್ರಮಿಸುತ್ತದೆ",
  fr: "Cette plage horaire chevauche un autre créneau sélectionné",
  de: "Dieser Zeitbereich überschneidet sich mit einem anderen ausgewählten Slot",
  it: "Questo intervallo di tempo si sovrappone a un altro slot selezionato",
  pt: "Este intervalo de tempo se sobrepõe a outro horário selecionado",
  hi: "यह समय सीमा किसी अन्य चयनित स्लॉट के साथ ओवरलैप होती है",
  ar: "يتداخل هذا النطاق الزمني مع موعد آخر محدد",
  zh: "此时间段与另一个选定的时间段重叠",
  ja: "この時間帯は選択された別のスロットと重なっています",
  bn: "এই সময়সীমা অন্য নির্বাচিত স্লটের সাথে ওভারল্যাপ করে"
},

alreadySelected: {
  en: "Already selected",
  kn: "ಈಗಾಗಲೇ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ",
  fr: "Déjà sélectionné",
  de: "Bereits ausgewählt",
  it: "Già selezionato",
  pt: "Já selecionado",
  hi: "पहले से चयनित",
  ar: "تم التحديد بالفعل",
  zh: "已选择",
  ja: "既に選択済み",
  bn: "ইতিমধ্যে নির্বাচিত"
},
next: {
  en: "Next",
  kn: "ಮುಂದೆ",
  fr: "Suivant",
  de: "Weiter",
  it: "Avanti",
  pt: "Próximo",
  hi: "अगला",
  ar: "التالي",
  zh: "下一步",
  ja: "次へ",
  bn: "পরবর্তী"
},

currentLocation: {
  en: "Current Location",
  kn: "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
  fr: "Emplacement Actuel",
  de: "Aktueller Standort",
  it: "Posizione Attuale",
  pt: "Localização Atual",
  hi: "वर्तमान स्थान",
  ar: "الموقع الحالي",
  zh: "当前位置",
  ja: "現在地",
  bn: "বর্তমান অবস্থান"
},

useGpsToFetchLocation: {
  en: "Use GPS to automatically fetch your current location coordinates",
  kn: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳದ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪಡೆಯಲು GPS ಬಳಸಿ",
  fr: "Utilisez le GPS pour récupérer automatiquement les coordonnées de votre position actuelle",
  de: "Verwenden Sie GPS, um automatisch Ihre aktuellen Standortkoordinaten abzurufen",
  it: "Usa il GPS per ottenere automaticamente le coordinate della tua posizione attuale",
  pt: "Use o GPS para obter automaticamente as coordenadas da sua localização atual",
  hi: "अपने वर्तमान स्थान निर्देशांक स्वचालित रूप से प्राप्त करने के लिए GPS का उपयोग करें",
  ar: "استخدم GPS للحصول تلقائيًا على إحداثيات موقعك الحالي",
  zh: "使用GPS自动获取您当前的位置坐标",
  ja: "GPSを使用して現在地の座標を自動取得する",
  bn: "আপনার বর্তমান অবস্থানের স্থানাঙ্ক স্বয়ংক্রিয়ভাবে পেতে GPS ব্যবহার করুন"
},

fetchMyLocation: {
  en: "Fetch My Location (GPS)",
  kn: "ನನ್ನ ಸ್ಥಳವನ್ನು ಪಡೆದುಕೊಳ್ಳಿ (GPS)",
  fr: "Obtenir Ma Position (GPS)",
  de: "Meinen Standort abrufen (GPS)",
  it: "Ottieni La Mia Posizione (GPS)",
  pt: "Obter Minha Localização (GPS)",
  hi: "मेरा स्थान प्राप्त करें (GPS)",
  ar: "الحصول على موقعي (GPS)",
  zh: "获取我的位置（GPS）",
  ja: "現在地を取得（GPS）",
  bn: "আমার অবস্থান পান (GPS)"
},

addressDetected: {
  en: "Address detected:",
  kn: "ವಿಳಾಸ ಪತ್ತೆಯಾಗಿದೆ:",
  fr: "Adresse détectée :",
  de: "Adresse erkannt:",
  it: "Indirizzo rilevato:",
  pt: "Endereço detectado:",
  hi: "पता मिला:",
  ar: "العنوان الذي تم اكتشافه:",
  zh: "检测到的地址:",
  ja: "検出された住所:",
  bn: "ঠিকানা সনাক্ত করা হয়েছে:"
},

pleaseAgreeToFollowing: {
  en: "Please agree to the following before proceeding with your Registration:",
  kn: "ನಿಮ್ಮ ನೋಂದಣಿಯೊಂದಿಗೆ ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನವುಗಳಿಗೆ ಒಪ್ಪಿಕೊಳ್ಳಿ:",
  fr: "Veuillez accepter les conditions suivantes avant de procéder à votre inscription :",
  de: "Bitte stimmen Sie den folgenden Bedingungen zu, bevor Sie mit Ihrer Registrierung fortfahren:",
  it: "Accetta quanto segue prima di procedere con la registrazione:",
  pt: "Por favor, concorde com o seguinte antes de prosseguir com seu registro:",
  hi: "कृपया अपना पंजीकरण जारी रखने से पहले निम्नलिखित से सहमत हों:",
  ar: "يرجى الموافقة على ما يلي قبل المتابعة مع تسجيلك:",
  zh: "在继续注册之前，请同意以下条款：",
  ja: "登録を進める前に、以下に同意してください：",
  bn: "আপনার নিবন্ধন চালিয়ে যাওয়ার আগে অনুগ্রহ করে নিম্নলিখিতগুলিতে সম্মত হন:"
},

validatingEmailMobile: {
  en: "Validating email/mobile, please wait...",
  kn: "ಇಮೇಲ್/ಮೊಬೈಲ್ ಅನ್ನು ಮೌಲ್ಯೀಕರಿಸಲಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...",
  fr: "Validation de l'email/téléphone, veuillez patienter...",
  de: "E-Mail/Handy wird validiert, bitte warten...",
  it: "Convalida email/cellulare, attendere...",
  pt: "Validando e-mail/celular, aguarde...",
  hi: "ईमेल/मोबाइल सत्यापित किया जा रहा है, कृपया प्रतीक्षा करें...",
  ar: "جارٍ التحقق من البريد الإلكتروني/الجوال، يرجى الانتظار...",
  zh: "正在验证电子邮件/手机，请稍候...",
  ja: "メール/携帯を検証中です。お待ちください...",
  bn: "ইমেল/মোবাইল যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন..."
},

fixValidationErrors: {
  en: "Please fix all validation errors including Date of Birth (must be 18+ years)",
  kn: "ದಯವಿಟ್ಟು ಜನ್ಮ ದಿನಾಂಕ ಸೇರಿದಂತೆ ಎಲ್ಲಾ ಮೌಲ್ಯೀಕರಣ ದೋಷಗಳನ್ನು ಸರಿಪಡಿಸಿ (ವಯಸ್ಸು 18+ ವರ್ಷ ಇರಬೇಕು)",
  fr: "Veuillez corriger toutes les erreurs de validation, y compris la date de naissance (doit avoir 18 ans ou plus)",
  de: "Bitte beheben Sie alle Validierungsfehler, einschließlich des Geburtsdatums (muss 18+ Jahre alt sein)",
  it: "Correggi tutti gli errori di convalida, inclusa la data di nascita (deve avere 18+ anni)",
  pt: "Corrija todos os erros de validação, incluindo data de nascimento (deve ter 18+ anos)",
  hi: "कृपया सभी सत्यापन त्रुटियों को ठीक करें, जिसमें जन्म तिथि भी शामिल है (18+ वर्ष होना चाहिए)",
  ar: "يرجى إصلاح جميع أخطاء التحقق بما في ذلك تاريخ الميلاد (يجب أن يكون عمرك 18+ سنة)",
  zh: "请修复所有验证错误，包括出生日期（必须年满18岁）",
  ja: "生年月日を含むすべての検証エラーを修正してください（18歳以上である必要があります）",
  bn: "অনুগ্রহ করে সমস্ত যাচাইকরণ ত্রুটি ঠিক করুন, যার মধ্যে জন্ম তারিখ অন্তর্ভুক্ত (বয়স ১৮+ হতে হবে)"
},

completeAllRequiredFields: {
  en: "Please complete all required fields including Date of Birth",
  kn: "ದಯವಿಟ್ಟು ಜನ್ಮ ದಿನಾಂಕ ಸೇರಿದಂತೆ ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
  fr: "Veuillez remplir tous les champs obligatoires, y compris la date de naissance",
  de: "Bitte füllen Sie alle Pflichtfelder aus, einschließlich des Geburtsdatums",
  it: "Completa tutti i campi obbligatori, inclusa la data di nascita",
  pt: "Preencha todos os campos obrigatórios, incluindo data de nascimento",
  hi: "कृपया जन्म तिथि सहित सभी आवश्यक फ़ील्ड भरें",
  ar: "يرجى ملء جميع الحقول المطلوبة بما في ذلك تاريخ الميلاد",
  zh: "请填写所有必填字段，包括出生日期",
  ja: "生年月日を含むすべての必須フィールドに入力してください",
  bn: "অনুগ্রহ করে জন্ম তারিখ সহ সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন"
},

pleaseSelectServiceType: {
  en: "Please select at least one service type",
  kn: "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಸೇವಾ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  fr: "Veuillez sélectionner au moins un type de service",
  de: "Bitte wählen Sie mindestens einen Servicetyp aus",
  it: "Seleziona almeno un tipo di servizio",
  pt: "Selecione pelo menos um tipo de serviço",
  hi: "कृपया कम से कम एक सेवा प्रकार चुनें",
  ar: "يرجى تحديد نوع خدمة واحد على الأقل",
  zh: "请至少选择一种服务类型",
  ja: "少なくとも1つのサービスタイプを選択してください",
  bn: "অনুগ্রহ করে কমপক্ষে একটি সেবার ধরন নির্বাচন করুন"
},

pleaseCompleteKyc: {
  en: "Please complete KYC verification",
  kn: "ದಯವಿಟ್ಟು KYC ಪರಿಶೀಲನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
  fr: "Veuillez compléter la vérification KYC",
  de: "Bitte schließen Sie die KYC-Verifizierung ab",
  it: "Completa la verifica KYC",
  pt: "Por favor, complete a verificação KYC",
  hi: "कृपया केवाईसी सत्यापन पूरा करें",
  ar: "يرجى إكمال التحقق من KYC",
  zh: "请完成KYC验证",
  ja: "KYC確認を完了してください",
  bn: "অনুগ্রহ করে কেওয়াইসি যাচাইকরণ সম্পূর্ণ করুন"
},

pleaseWaitForValidation: {
  en: "Please wait for email/mobile validation to complete.",
  kn: "ದಯವಿಟ್ಟು ಇಮೇಲ್/ಮೊಬೈಲ್ ಮೌಲ್ಯೀಕರಣ ಪೂರ್ಣಗೊಳ್ಳಲು ನಿರೀಕ್ಷಿಸಿ.",
  fr: "Veuillez attendre la fin de la validation de l'email/téléphone.",
  de: "Bitte warten Sie, bis die E-Mail/Handy-Validierung abgeschlossen ist.",
  it: "Attendi il completamento della convalida email/cellulare.",
  pt: "Aguarde a conclusão da validação de e-mail/celular.",
  hi: "कृपया ईमेल/मोबाइल सत्यापन पूरा होने की प्रतीक्षा करें।",
  ar: "يرجى الانتظار حتى يكتمل التحقق من البريد الإلكتروني/الجوال.",
  zh: "请等待电子邮件/手机验证完成。",
  ja: "メール/携帯の検証が完了するまでお待ちください。",
  bn: "অনুগ্রহ করে ইমেল/মোবাইল যাচাইকরণ সম্পূর্ণ হওয়ার জন্য অপেক্ষা করুন।"
},

pleaseFixValidationErrors: {
  en: "Please fix all validation errors before proceeding.",
  kn: "ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಮೌಲ್ಯೀಕರಣ ದೋಷಗಳನ್ನು ಸರಿಪಡಿಸಿ.",
  fr: "Veuillez corriger toutes les erreurs de validation avant de continuer.",
  de: "Bitte beheben Sie alle Validierungsfehler, bevor Sie fortfahren.",
  it: "Correggi tutti gli errori di convalida prima di procedere.",
  pt: "Corrija todos os erros de validação antes de prosseguir.",
  hi: "कृपया आगे बढ़ने से पहले सभी सत्यापन त्रुटियों को ठीक करें।",
  ar: "يرجى إصلاح جميع أخطاء التحقق قبل المتابعة.",
  zh: "请先修复所有验证错误，然后再继续。",
  ja: "続行する前に、すべての検証エラーを修正してください。",
  bn: "এগিয়ে যাওয়ার আগে অনুগ্রহ করে সমস্ত যাচাইকরণ ত্রুটি ঠিক করুন।"
},

registrationSuccessful: {
  en: "Registration Successful!",
  kn: "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ!",
  fr: "Inscription Réussie !",
  de: "Registrierung Erfolgreich!",
  it: "Registrazione Completata!",
  pt: "Registro Bem-sucedido!",
  hi: "पंजीकरण सफल!",
  ar: "تم التسجيل بنجاح!",
  zh: "注册成功！",
  ja: "登録成功！",
  bn: "নিবন্ধন সফল হয়েছে!"
},

serviceProviderAdded: {
  en: "Service provider added successfully!",
  kn: "ಸೇವಾ ಒದಗಿಸುವವರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!",
  fr: "Prestataire de services ajouté avec succès !",
  de: "Dienstleister erfolgreich hinzugefügt!",
  it: "Fornitore di servizi aggiunto con successo!",
  pt: "Prestador de serviços adicionado com sucesso!",
  hi: "सेवा प्रदाता सफलतापूर्वक जोड़ा गया!",
  ar: "تمت إضافة مقدم الخدمة بنجاح!",
  zh: "服务提供者添加成功！",
  ja: "サービスプロバイダーが正常に追加されました！",
  bn: "সেবা প্রদানকারী সফলভাবে যুক্ত করা হয়েছে!"
},

failedToAddServiceProvider: {
  en: "Failed to add service provider. Please try again.",
  kn: "ಸೇವಾ ಒದಗಿಸುವವರನ್ನು ಸೇರಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  fr: "Échec de l'ajout du prestataire de services. Veuillez réessayer.",
  de: "Fehler beim Hinzufügen des Dienstleisters. Bitte versuchen Sie es erneut.",
  it: "Impossibile aggiungere il fornitore di servizi. Per favore riprova.",
  pt: "Falha ao adicionar prestador de serviços. Por favor, tente novamente.",
  hi: "सेवा प्रदाता जोड़ने में विफल। कृपया पुनः प्रयास करें।",
  ar: "فشل في إضافة مقدم الخدمة. يرجى المحاولة مرة أخرى.",
  zh: "添加服务提供者失败。请重试。",
  ja: "サービスプロバイダーの追加に失敗しました。もう一度お試しください。",
  bn: "সেবা প্রদানকারী যোগ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
},

locationFetchedSuccessfully: {
  en: "Location fetched successfully!",
  kn: "ಸ್ಥಳವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪಡೆಯಲಾಗಿದೆ!",
  fr: "Position récupérée avec succès !",
  de: "Standort erfolgreich abgerufen!",
  it: "Posizione ottenuta con successo!",
  pt: "Localização obtida com sucesso!",
  hi: "स्थान सफलतापूर्वक प्राप्त हुआ!",
  ar: "تم الحصول على الموقع بنجاح!",
  zh: "位置获取成功！",
  ja: "現在地の取得に成功しました！",
  bn: "অবস্থান সফলভাবে পাওয়া গেছে!"
},

failedToFetchLocation: {
  en: "Failed to fetch location data. Please try again.",
  kn: "ಸ್ಥಳದ ಡೇಟಾವನ್ನು ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  fr: "Échec de la récupération des données de position. Veuillez réessayer.",
  de: "Fehler beim Abrufen der Standortdaten. Bitte versuchen Sie es erneut.",
  it: "Impossibile ottenere i dati sulla posizione. Per favore riprova.",
  pt: "Falha ao obter dados de localização. Por favor, tente novamente.",
  hi: "स्थान डेटा प्राप्त करने में विफल। कृपया पुनः प्रयास करें।",
  ar: "فشل في الحصول على بيانات الموقع. يرجى المحاولة مرة أخرى.",
  zh: "获取位置数据失败。请重试。",
  ja: "位置情報の取得に失敗しました。もう一度お試しください。",
  bn: "অবস্থান ডেটা পাওয়া ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
},

geolocationFailed: {
  en: "Geolocation failed. Please check your browser permissions.",
  kn: "ಜಿಯೋಲೊಕೇಷನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
  fr: "La géolocalisation a échoué. Veuillez vérifier les autorisations de votre navigateur.",
  de: "Geolokalisierung fehlgeschlagen. Bitte überprüfen Sie Ihre Browser-Berechtigungen.",
  it: "Geolocalizzazione fallita. Controlla le autorizzazioni del browser.",
  pt: "Geolocalização falhou. Por favor, verifique as permissões do seu navegador.",
  hi: "जियोलोकेशन विफल। कृपया अपनी ब्राउज़र अनुमतियाँ जांचें।",
  ar: "فشل تحديد الموقع الجغرافي. يرجى التحقق من أذونات المتصفح الخاص بك.",
  zh: "地理位置定位失败。请检查您的浏览器权限。",
  ja: "ジオロケーションに失敗しました。ブラウザの権限を確認してください。",
  bn: "জিওলোকেশন ব্যর্থ হয়েছে। আপনার ব্রাউজার অনুমতি পরীক্ষা করুন।"
},

geolocationNotSupported: {
  en: "Geolocation is not supported by your browser.",
  kn: "ಜಿಯೋಲೊಕೇಷನ್ ಅನ್ನು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
  fr: "La géolocalisation n'est pas prise en charge par votre navigateur.",
  de: "Geolokalisierung wird von Ihrem Browser nicht unterstützt.",
  it: "La geolocalizzazione non è supportata dal tuo browser.",
  pt: "Geolocalização não é suportada pelo seu navegador.",
  hi: "जियोलोकेशन आपके ब्राउज़र द्वारा समर्थित नहीं है।",
  ar: "تحديد الموقع الجغرافي غير مدعوم من قبل متصفحك.",
  zh: "您的浏览器不支持地理位置定位。",
  ja: "お使いのブラウザはジオロケーションをサポートしていません。",
  bn: "আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না।"
},

checkTermsToEnableSubmit: {
  en: "Check terms and conditions to enable Submit",
  kn: "ಸಲ್ಲಿಸು ಸಕ್ರಿಯಗೊಳಿಸಲು ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
  fr: "Cochez les conditions générales pour activer Soumettre",
  de: "Aktivieren Sie die Allgemeinen Geschäftsbedingungen, um das Senden zu ermöglichen",
  it: "Seleziona i termini e le condizioni per abilitare Invia",
  pt: "Marque os termos e condições para ativar Enviar",
  hi: "सबमिट सक्षम करने के लिए नियम और शर्तें देखें",
  ar: "حدد الشروط والأحكام لتمكين إرسال",
  zh: "勾选条款和条件以启用提交",
  ja: "送信を有効にするには利用規約に同意してください",
  bn: "জমা সক্ষম করতে শর্তাবলী চেক করুন"
},
// ============ END SERVICE PROVIDER REGISTRATION TRANSLATIONS ============

// ============ FIELD VALIDATION TRANSLATIONS ============
invalidEmailFormat: {
  en: "Invalid email format",
  kn: "ಅಮಾನ್ಯ ಇಮೇಲ್ ಸ್ವರೂಪ",
  fr: "Format d'email invalide",
  de: "Ungültiges E-Mail-Format",
  it: "Formato email non valido",
  pt: "Formato de e-mail inválido",
  hi: "अमान्य ईमेल प्रारूप",
  ar: "تنسيق بريد إلكتروني غير صالح",
  zh: "无效的电子邮件格式",
  ja: "無効なメール形式",
  bn: "অবৈধ ইমেল ফরম্যাট"
},

invalidMobileFormat: {
  en: "Invalid mobile number format",
  kn: "ಅಮಾನ್ಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಸ್ವರೂಪ",
  fr: "Format de numéro de mobile invalide",
  de: "Ungültiges Handynummernformat",
  it: "Formato numero di cellulare non valido",
  pt: "Formato de número de celular inválido",
  hi: "अमान्य मोबाइल नंबर प्रारूप",
  ar: "تنسيق رقم جوال غير صالح",
  zh: "无效的手机号码格式",
  ja: "無効な携帯番号形式",
  bn: "অবৈধ মোবাইল নম্বর ফরম্যাট"
},

errorCheckingEmail: {
  en: "Error checking email",
  kn: "ಇಮೇಲ್ ಪರಿಶೀಲಿಸುವಲ್ಲಿ ದೋಷ",
  fr: "Erreur lors de la vérification de l'email",
  de: "Fehler beim Überprüfen der E-Mail",
  it: "Errore durante la verifica dell'email",
  pt: "Erro ao verificar e-mail",
  hi: "ईमेल जांचने में त्रुटि",
  ar: "خطأ في التحقق من البريد الإلكتروني",
  zh: "检查电子邮件时出错",
  ja: "メールの確認中にエラーが発生しました",
  bn: "ইমেল পরীক্ষা করতে ত্রুটি"
},

errorCheckingMobile: {
  en: "Error checking mobile number",
  kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಪರಿಶೀಲಿಸುವಲ್ಲಿ ದೋಷ",
  fr: "Erreur lors de la vérification du numéro de mobile",
  de: "Fehler beim Überprüfen der Handynummer",
  it: "Errore durante la verifica del numero di cellulare",
  pt: "Erro ao verificar número de celular",
  hi: "मोबाइल नंबर जांचने में त्रुटि",
  ar: "خطأ في التحقق من رقم الجوال",
  zh: "检查手机号码时出错",
  ja: "携帯番号の確認中にエラーが発生しました",
  bn: "মোবাইল নম্বর পরীক্ষা করতে ত্রুটি"
},
// ============ END FIELD VALIDATION TRANSLATIONS ============

// ============ BATHROOM CLEANING TRANSLATIONS ============
type: {
  en: "Type:",
  kn: "ಪ್ರಕಾರ:",
  fr: "Type :",
  de: "Typ:",
  it: "Tipo:",
  pt: "Tipo:",
  hi: "प्रकार:",
  ar: "النوع:",
  zh: "类型:",
  ja: "タイプ:",
  bn: "ধরন:"
},

noOfWashrooms: {
  en: "No. of Washrooms:",
  kn: "ಸ್ನಾನಗೃಹಗಳ ಸಂಖ್ಯೆ:",
  fr: "Nombre de Salles de Bain:",
  de: "Anzahl der Badezimmer:",
  it: "Numero di Bagni:",
  pt: "Número de Banheiros:",
  hi: "बाथरूम की संख्या:",
  ar: "عدد الحمامات:",
  zh: "卫生间数量:",
  ja: "浴室の数:",
  bn: "বাথরুমের সংখ্যা:"
},

frequency: {
  en: "Frequency:",
  kn: "ಆವರ್ತನ:",
  fr: "Fréquence :",
  de: "Häufigkeit:",
  it: "Frequenza:",
  pt: "Frequência:",
  hi: "आवृत्ति:",
  ar: "التكرار:",
  zh: "频率:",
  ja: "頻度:",
  bn: "ফ্রিকোয়েন্সি:"
},

pricePerMonth: {
  en: "Price: ₹{price}/month",
  kn: "ಬೆಲೆ: ₹{price}/ತಿಂಗಳು",
  fr: "Prix : ₹{price}/mois",
  de: "Preis: ₹{price}/Monat",
  it: "Prezzo: ₹{price}/mese",
  pt: "Preço: ₹{price}/mês",
  hi: "मूल्य: ₹{price}/महीना",
  ar: "السعر: ₹{price}/شهر",
  zh: "价格: ₹{price}/月",
  ja: "価格: ₹{price}/月",
  bn: "মূল্য: ₹{price}/মাস"
},

jobDescription: {
  en: "Job Description: {description}",
  kn: "ಕೆಲಸದ ವಿವರಣೆ: {description}",
  fr: "Description du Poste : {description}",
  de: "Stellenbeschreibung: {description}",
  it: "Descrizione del Lavoro: {description}",
  pt: "Descrição do Trabalho: {description}",
  hi: "कार्य विवरण: {description}",
  ar: "وصف الوظيفة: {description}",
  zh: "工作描述: {description}",
  ja: "仕事内容: {description}",
  bn: "কাজের বিবরণ: {description}"
},

normalCleaning: {
  en: "Normal cleaning",
  kn: "ಸಾಮಾನ್ಯ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage normal",
  de: "Normale Reinigung",
  it: "Pulizia normale",
  pt: "Limpeza normal",
  hi: "सामान्य सफाई",
  ar: "تنظيف عادي",
  zh: "普通清洁",
  ja: "通常清掃",
  bn: "সাধারণ পরিষ্কার"
},

deepCleaning: {
  en: "Deep cleaning",
  kn: "ಆಳವಾದ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage en profondeur",
  de: "Tiefenreinigung",
  it: "Pulizia profonda",
  pt: "Limpeza profunda",
  hi: "गहरी सफाई",
  ar: "تنظيف عميق",
  zh: "深度清洁",
  ja: "徹底清掃",
  bn: "গভীর পরিষ্কার"
},

dayWeek: {
  en: "{days} day / week",
  kn: "{days} ದಿನ / ವಾರ",
  fr: "{days} jour / semaine",
  de: "{days} Tag / Woche",
  it: "{days} giorno / settimana",
  pt: "{days} dia / semana",
  hi: "{days} दिन / सप्ताह",
  ar: "{days} يوم / أسبوع",
  zh: "{days}天/周",
  ja: "{days}日/週",
  bn: "{days} দিন / সপ্তাহ"
},

daily: {
  en: "Daily",
  kn: "ದೈನಂದಿನ",
  fr: "Quotidien",
  de: "Täglich",
  it: "Giornaliero",
  pt: "Diário",
  hi: "दैनिक",
  ar: "يومي",
  zh: "每日",
  ja: "毎日",
  bn: "দৈনিক"
},

weeklyCleaningBathroom: {
  en: "Weekly cleaning of bathroom",
  kn: "ಸ್ನಾನಗೃಹದ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage hebdomadaire de la salle de bain",
  de: "Wöchentliche Reinigung des Badezimmers",
  it: "Pulizia settimanale del bagno",
  pt: "Limpeza semanal do banheiro",
  hi: "बाथरूम की साप्ताहिक सफाई",
  ar: "تنظيف أسبوعي للحمام",
  zh: "每周清洁卫生间",
  ja: "毎週の浴室清掃",
  bn: "সাপ্তাহিক বাথরুম পরিষ্কার"
},

twoDaysWeekCleaningBathroom: {
  en: "2 days in a week cleaning of bathroom",
  kn: "ವಾರದಲ್ಲಿ 2 ದಿನ ಸ್ನಾನಗೃಹ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "2 jours par semaine nettoyage de la salle de bain",
  de: "2 Tage pro Woche Reinigung des Badezimmers",
  it: "2 giorni a settimana pulizia del bagno",
  pt: "2 dias por semana limpeza do banheiro",
  hi: "सप्ताह में 2 दिन बाथरूम की सफाई",
  ar: "يومين في الأسبوع تنظيف الحمام",
  zh: "每周2天清洁卫生间",
  ja: "週2日の浴室清掃",
  bn: "সপ্তাহে ২ দিন বাথরুম পরিষ্কার"
},

twoBathroomsWeeklyCleaning: {
  en: "2 bathrooms of weekly cleaning",
  kn: "2 ಸ್ನಾನಗೃಹಗಳ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "2 salles de bain de nettoyage hebdomadaire",
  de: "2 Badezimmer wöchentliche Reinigung",
  it: "2 bagni di pulizia settimanale",
  pt: "2 banheiros de limpeza semanal",
  hi: "2 बाथरूम की साप्ताहिक सफाई",
  ar: "2 حمامات من التنظيف الأسبوعي",
  zh: "2个卫生间每周清洁",
  ja: "2つの浴室の毎週清掃",
  bn: "২টি বাথরুমের সাপ্তাহিক পরিষ্কার"
},

premiumCleaningBathroomWeekly: {
  en: "Premium cleaning of bathroom weekly",
  kn: "ಸ್ನಾನಗೃಹದ ಪ್ರೀಮಿಯಂ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage premium de la salle de bain hebdomadaire",
  de: "Premium-Reinigung des Badezimmers wöchentlich",
  it: "Pulizia premium del bagno settimanale",
  pt: "Limpeza premium do banheiro semanal",
  hi: "बाथरूम की प्रीमियम साप्ताहिक सफाई",
  ar: "تنظيف ممتاز للحمام أسبوعي",
  zh: "每周高级清洁卫生间",
  ja: "プレミアム毎週浴室清掃",
  bn: "প্রিমিয়াম সাপ্তাহিক বাথরুম পরিষ্কার"
},

premiumCleaningBathroomTwoDays: {
  en: "Premium cleaning of bathroom 2 days/week",
  kn: "ಸ್ನಾನಗೃಹದ ಪ್ರೀಮಿಯಂ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ 2 ದಿನ/ವಾರ",
  fr: "Nettoyage premium de la salle de bain 2 jours/semaine",
  de: "Premium-Reinigung des Badezimmers 2 Tage/Woche",
  it: "Pulizia premium del bagno 2 giorni/settimana",
  pt: "Limpeza premium do banheiro 2 dias/semana",
  hi: "बाथरूम की प्रीमियम सफाई 2 दिन/सप्ताह",
  ar: "تنظيف ممتاز للحمام يومين/أسبوع",
  zh: "每周2天高级清洁卫生间",
  ja: "週2日のプレミアム浴室清掃",
  bn: "প্রিমিয়াম বাথরুম পরিষ্কার সপ্তাহে ২ দিন"
},

twoBathroomsPremiumWeekly: {
  en: "2 bathrooms premium weekly cleaning",
  kn: "2 ಸ್ನಾನಗೃಹಗಳ ಪ್ರೀಮಿಯಂ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "2 salles de bain nettoyage premium hebdomadaire",
  de: "2 Badezimmer Premium wöchentliche Reinigung",
  it: "2 bagni pulizia premium settimanale",
  pt: "2 banheiros limpeza premium semanal",
  hi: "2 बाथरूम की प्रीमियम साप्ताहिक सफाई",
  ar: "2 حمامات تنظيف ممتاز أسبوعي",
  zh: "2个卫生间每周高级清洁",
  ja: "2つの浴室のプレミアム毎週清掃",
  bn: "২টি বাথরুমের প্রিমিয়াম সাপ্তাহিক পরিষ্কার"
},

deepCleaningDescription: {
  en: "Weekly cleaning of bathroom + All bathroom walls cleaning",
  kn: "ಸ್ನಾನಗೃಹದ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ + ಎಲ್ಲಾ ಸ್ನಾನಗೃಹದ ಗೋಡೆಗಳ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage hebdomadaire de la salle de bain + Nettoyage de tous les murs de la salle de bain",
  de: "Wöchentliche Reinigung des Badezimmers + Reinigung aller Badezimmerwände",
  it: "Pulizia settimanale del bagno + Pulizia di tutte le pareti del bagno",
  pt: "Limpeza semanal do banheiro + Limpeza de todas as paredes do banheiro",
  hi: "बाथरूम की साप्ताहिक सफाई + सभी बाथरूम की दीवारों की सफाई",
  ar: "تنظيف أسبوعي للحمام + تنظيف جميع جدران الحمام",
  zh: "每周清洁卫生间 + 所有卫生间墙壁清洁",
  ja: "毎週の浴室清掃 + すべての浴室の壁の清掃",
  bn: "সাপ্তাহিক বাথরুম পরিষ্কার + সমস্ত বাথরুমের দেয়াল পরিষ্কার"
},
// ============ END BATHROOM CLEANING TRANSLATIONS ============



// ============ CLOTH DRYING TRANSLATIONS ============

threeDaysWeek: {
  en: "3 days / week",
  kn: "3 ದಿನ / ವಾರ",
  fr: "3 jours / semaine",
  de: "3 Tage / Woche",
  it: "3 giorni / settimana",
  pt: "3 dias / semana",
  hi: "3 दिन / सप्ताह",
  ar: "3 أيام / أسبوع",
  zh: "3天/周",
  ja: "3日/週",
  bn: "৩ দিন / সপ্তাহ"
},

clothDryingJobDescription: {
  en: "Househelp will get clothes from drying place and make proper arrangements in shelf",
  kn: "ಮನೆ ಸಹಾಯಕರು ಬಟ್ಟೆಗಳನ್ನು ಒಣಗಿಸುವ ಸ್ಥಳದಿಂದ ತಂದು ಕಪಾಟಿನಲ್ಲಿ ಸರಿಯಾಗಿ ಜೋಡಿಸುತ್ತಾರೆ",
  fr: "L'aide ménagère ira chercher les vêtements de l'étendoir et les rangera correctement dans l'armoire",
  de: "Die Haushaltshilfe holt die Kleidung vom Wäscheständer und räumt sie ordentlich in den Schrank",
  it: "La colf prenderà i vestiti dallo stenditoio e li sistemerà correttamente nell'armadio",
  pt: "A ajudante pegará as roupas do varal e fará a arrumação adequada no armário",
  hi: "घरेलू सहायक कपड़े सुखाने की जगह से लाएगा और शेल्फ में उचित व्यवस्था करेगा",
  ar: "ستأخذ المساعدة المنزلية الملابس من مكان التجفيف وتقوم بترتيبها بشكل مناسب في الرف",
  zh: "家政助手将从晾衣处取回衣物并在架子上妥善整理",
  ja: "家事ヘルパーは乾燥場所から衣類を取り出し、棚に適切に整理します",
  bn: "গৃহকর্মী কাপড় শুকানোর জায়গা থেকে নিয়ে এসে তাকে সঠিকভাবে তাকে সাজিয়ে রাখবেন"
},
noDescriptionAvailable: {
  en: "No description available",
  kn: "ಯಾವುದೇ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ",
  fr: "Aucune description disponible",
  de: "Keine Beschreibung verfügbar",
  it: "Nessuna descrizione disponibile",
  pt: "Nenhuma descrição disponível",
  hi: "कोई विवरण उपलब्ध नहीं",
  ar: "لا يوجد وصف متاح",
  zh: "无可用描述",
  ja: "説明はありません",
  bn: "কোন বিবরণ উপলব্ধ নেই"
},
// ============ END CLOTH DRYING TRANSLATIONS ============

// ============ DUSTING TRANSLATIONS ============
dustingType: {
  en: "Dusting type:",
  kn: "ಧೂಳು ಒರೆಸುವ ಪ್ರಕಾರ:",
  fr: "Type de dépoussiérage :",
  de: "Staubart:",
  it: "Tipo di spolveratura:",
  pt: "Tipo de limpeza:",
  hi: "धूल झाड़ने का प्रकार:",
  ar: "نوع التنظيف:",
  zh: "除尘类型:",
  ja: "ほこり取りの種類:",
  bn: "ধুলো মুছার ধরন:"
},

roomType: {
  en: "Room type:",
  kn: "ಕೋಣೆಯ ಪ್ರಕಾರ:",
  fr: "Type de pièce :",
  de: "Raumtyp:",
  it: "Tipo di stanza:",
  pt: "Tipo de cômodo:",
  hi: "कमरे का प्रकार:",
  ar: "نوع الغرفة:",
  zh: "房间类型:",
  ja: "部屋のタイプ:",
  bn: "রুমের ধরন:"
},

normal: {
  en: "Normal",
  kn: "ಸಾಮಾನ್ಯ",
  fr: "Normal",
  de: "Normal",
  it: "Normale",
  pt: "Normal",
  hi: "सामान्य",
  ar: "عادي",
  zh: "普通",
  ja: "通常",
  bn: "সাধারণ"
},

deep: {
  en: "Deep",
  kn: "ಆಳವಾದ",
  fr: "Profond",
  de: "Tief",
  it: "Profondo",
  pt: "Profundo",
  hi: "गहरा",
  ar: "عميق",
  zh: "深度",
  ja: "ディープ",
  bn: "গভীর"
},

twoBHK: {
  en: "2 BHK",
  kn: "2 BHK",
  fr: "2 Pièces",
  de: "2 Zimmer",
  it: "2 Locali",
  pt: "2 Quartos",
  hi: "2 बीएचके",
  ar: "2 غرف",
  zh: "2室",
  ja: "2部屋",
  bn: "২ বিএইচকে"
},

twoHalfBHK: {
  en: "2.5 - 3 BHK",
  kn: "2.5 - 3 BHK",
  fr: "2.5 - 3 Pièces",
  de: "2.5 - 3 Zimmer",
  it: "2.5 - 3 Locali",
  pt: "2.5 - 3 Quartos",
  hi: "2.5 - 3 बीएचके",
  ar: "2.5 - 3 غرف",
  zh: "2.5 - 3室",
  ja: "2.5 - 3部屋",
  bn: "২.৫ - ৩ বিএইচকে"
},

normalDustingDescription: {
  en: "Includes furniture dusting, gate, decor items, carpet, bed making. Weekly: windows, glasses, cupboards, kitchen cabinet outer cleaning. Monthly: fan and cobweb cleaning.",
  kn: "ಫರ್ನಿಚರ್ ಧೂಳು ಒರೆಸುವುದು, ಗೇಟ್, ಅಲಂಕಾರಿಕ ವಸ್ತುಗಳು, ಕಾರ್ಪೆಟ್, ಹಾಸಿಗೆ ಮಾಡುವುದು ಸೇರಿವೆ. ಸಾಪ್ತಾಹಿಕ: ಕಿಟಕಿಗಳು, ಗಾಜುಗಳು, ಅಲಮಾರುಗಳು, ಅಡುಗೆಮನೆ ಕ್ಯಾಬಿನೆಟ್ ಹೊರಗಿನ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ. ಮಾಸಿಕ: ಫ್ಯಾನ್ ಮತ್ತು ಜೇಡರ ಬಲೆ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ.",
  fr: "Comprend le dépoussiérage des meubles, de la porte, des objets de décoration, du tapis, la confection des lits. Hebdomadaire : fenêtres, vitres, placards, nettoyage extérieur des armoires de cuisine. Mensuel : nettoyage des ventilateurs et des toiles d'araignée.",
  de: "Beinhaltet Möbelstaubwischen, Tor, Dekorationsgegenstände, Teppich, Bettenmachen. Wöchentlich: Fenster, Gläser, Schränke, äußere Reinigung von Küchenschränken. Monatlich: Ventilator- und Spinnwebenreinigung.",
  it: "Include spolveratura mobili, cancello, oggetti decorativi, tappeto, rifacimento letti. Settimanale: finestre, vetri, armadi, pulizia esterna dei mobili della cucina. Mensile: pulizia di ventilatori e ragnatele.",
  pt: "Inclui limpeza de móveis, portão, itens de decoração, tapete, arrumação de cama. Semanal: janelas, vidros, armários, limpeza externa de armários de cozinha. Mensal: limpeza de ventiladores e teias de aranha.",
  hi: "फर्नीचर की धूल झाड़ना, गेट, सजावटी वस्तुएं, कालीन, बिस्तर बनाना शामिल है। साप्ताहिक: खिड़कियां, कांच, अलमारियाँ, किचन कैबिनेट की बाहरी सफाई। मासिक: पंखा और मकड़ी के जाले की सफाई।",
  ar: "يشمل تنظيف الغبار من الأثاث، البوابة، العناصر الزخرفية، السجاد، ترتيب السرير. أسبوعي: النوافذ، الزجاج، الخزائن، تنظيف خارجي لخزائن المطبخ. شهري: تنظيف المراوح وأنسجة العنكبوت.",
  zh: "包括家具除尘、门、装饰品、地毯、整理床铺。每周：窗户、玻璃、橱柜、厨房橱柜外部清洁。每月：风扇和蜘蛛网清洁。",
  ja: "家具のほこり取り、門、装飾品、カーペット、ベッドメイキングを含む。毎週：窓、ガラス、食器棚、キッチンキャビネットの外側の清掃。毎月：扇風機とクモの巣の清掃。",
  bn: "আসবাবপত্রে ধুলো মুছা, গেট, সাজসজ্জার জিনিস, কার্পেট, বিছানা তৈরি অন্তর্ভুক্ত। সাপ্তাহিক: জানালা, কাচ, আলমারি, রান্নাঘরের ক্যাবিনেটের বাইরের পরিষ্কার। মাসিক: পাখা এবং মাকড়সার জাল পরিষ্কার।"
},

deepDustingDescription: {
  en: "Normal Dusting + kitchen slab cleaning.",
  kn: "ಸಾಮಾನ್ಯ ಧೂಳು ಒರೆಸುವುದು + ಅಡುಗೆಮನೆಯ ಸ್ಲ್ಯಾಬ್ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ.",
  fr: "Dépoussiérage normal + nettoyage du plan de travail de la cuisine.",
  de: "Normales Staubwischen + Reinigung der Küchenarbeitsplatte.",
  it: "Spolveratura normale + pulizia del piano cottura.",
  pt: "Limpeza normal + limpeza da bancada da cozinha.",
  hi: "सामान्य धूल झाड़ना + किचन स्लैब की सफाई।",
  ar: "تنظيف عادي + تنظيف سطح المطبخ.",
  zh: "普通除尘 + 厨房台面清洁。",
  ja: "通常のほこり取り + キッチンスラブの清掃。",
  bn: "সাধারণ ধুলো মুছা + রান্নাঘরের স্ল্যাব পরিষ্কার।"
},
// ============ END DUSTING TRANSLATIONS ============

// ============ MAID SERVICES TRANSLATIONS ============
regular: {
  en: "Regular",
  kn: "ನಿಯಮಿತ",
  fr: "Régulier",
  de: "Regulär",
  it: "Regolare",
  pt: "Regular",
  hi: "नियमित",
  ar: "عادي",
  zh: "常规",
  ja: "レギュラー",
  bn: "নিয়মিত"
},

premium: {
  en: "Premium",
  kn: "ಪ್ರೀಮಿಯಂ",
  fr: "Premium",
  de: "Premium",
  it: "Premium",
  pt: "Premium",
  hi: "प्रीमियम",
  ar: "ممتاز",
  zh: "高级",
  ja: "プレミアム",
  bn: "প্রিমিয়াম"
},

selectedPrice: {
  en: "Selected Price",
  kn: "ಆಯ್ಕೆಮಾಡಿದ ಬೆಲೆ",
  fr: "Prix Sélectionné",
  de: "Ausgewählter Preis",
  it: "Prezzo Selezionato",
  pt: "Preço Selecionado",
  hi: "चयनित मूल्य",
  ar: "السعر المحدد",
  zh: "所选价格",
  ja: "選択された価格",
  bn: "নির্বাচিত মূল্য"
},

proceedToCheckout: {
  en: "Proceed to Checkout",
  kn: "ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ",
  fr: "Procéder au Paiement",
  de: "Zur Kasse gehen",
  it: "Procedi al Checkout",
  pt: "Prosseguir para o Pagamento",
  hi: "चेकआउट के लिए आगे बढ़ें",
  ar: "المتابعة إلى الدفع",
  zh: "前往结账",
  ja: "チェックアウトに進む",
  bn: "চেকআউটে যান"
},

itemAddedToCart: {
  en: "Item added to cart successfully!",
  kn: "ಐಟಂ ಅನ್ನು ಕಾರ್ಟ್‌ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!",
  fr: "Article ajouté au panier avec succès !",
  de: "Artikel erfolgreich zum Warenkorb hinzugefügt!",
  it: "Articolo aggiunto al carrello con successo!",
  pt: "Item adicionado ao carrinho com sucesso!",
  hi: "आइटम कार्ट में सफलतापूर्वक जोड़ा गया!",
  ar: "تمت إضافة العنصر إلى السلة بنجاح!",
  zh: "商品成功添加到购物车！",
  ja: "アイテムがカートに正常に追加されました！",
  bn: "আইটেম সফলভাবে কার্টে যুক্ত করা হয়েছে!"
},

people: {
  en: "People",
  kn: "ಜನರು",
  fr: "Personnes",
  de: "Personen",
  it: "Persone",
  pt: "Pessoas",
  hi: "लोग",
  ar: "أشخاص",
  zh: "人数",
  ja: "人数",
  bn: "লোক"
},

rooms: {
  en: "Rooms",
  kn: "ಕೊಠಡಿಗಳು",
  fr: "Pièces",
  de: "Zimmer",
  it: "Stanze",
  pt: "Cômodos",
  hi: "कमरे",
  ar: "غرف",
  zh: "房间",
  ja: "部屋",
  bn: "রুম"
},

number: {
  en: "Number",
  kn: "ಸಂಖ್ಯೆ",
  fr: "Numéro",
  de: "Anzahl",
  it: "Numero",
  pt: "Número",
  hi: "संख्या",
  ar: "رقم",
  zh: "数量",
  ja: "数",
  bn: "সংখ্যা"
},
// ============ END MAID SERVICES TRANSLATIONS ============
// ============ COOK SERVICES DIALOG TRANSLATIONS ============
persons: {
  en: "Persons:",
  kn: "ವ್ಯಕ್ತಿಗಳು:",
  fr: "Personnes :",
  de: "Personen:",
  it: "Persone:",
  pt: "Pessoas:",
  hi: "व्यक्ति:",
  ar: "الأشخاص:",
  zh: "人数:",
  ja: "人数:",
  bn: "ব্যক্তি:"
},

additionalChargesApplied: {
  en: "*Additional charges applied",
  kn: "*ಹೆಚ್ಚುವರಿ ಶುಲ್ಕಗಳು ಅನ್ವಯಿಸುತ್ತವೆ",
  fr: "*Frais supplémentaires appliqués",
  de: "*Zusätzliche Gebühren werden berechnet",
  it: "*Costi aggiuntivi applicati",
  pt: "*Taxas adicionais aplicadas",
  hi: "*अतिरिक्त शुल्क लागू",
  ar: "*رسوم إضافية مطبقة",
  zh: "*额外费用已应用",
  ja: "*追加料金が適用されます",
  bn: "*অতিরিক্ত চার্জ প্রযোজ্য"
},

addToCart: {
  en: "ADD TO CART",
  kn: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
  fr: "AJOUTER AU PANIER",
  de: "IN DEN WARENKORB",
  it: "AGGIUNGI AL CARRELLO",
  pt: "ADICIONAR AO CARRINHO",
  hi: "कार्ट में जोड़ें",
  ar: "أضف إلى السلة",
  zh: "加入购物车",
  ja: "カートに追加",
  bn: "কার্টে যোগ করুন"
},

addedToCart: {
  en: "ADDED TO CART",
  kn: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ",
  fr: "AJOUTÉ AU PANIER",
  de: "ZUM WARENKORB HINZUGEFÜGT",
  it: "AGGIUNTO AL CARRELLO",
  pt: "ADICIONADO AO CARRINHO",
  hi: "कार्ट में जोड़ा गया",
  ar: "تمت الإضافة إلى السلة",
  zh: "已加入购物车",
  ja: "カートに追加済み",
  bn: "কার্টে যুক্ত করা হয়েছে"
},

applyVoucher: {
  en: "Apply Voucher",
  kn: "ವೋಚರ್ ಅನ್ವಯಿಸಿ",
  fr: "Appliquer le Bon",
  de: "Gutschein einlösen",
  it: "Applica Voucher",
  pt: "Aplicar Voucher",
  hi: "वाउचर लागू करें",
  ar: "تطبيق القسيمة",
  zh: "应用优惠券",
  ja: "バウチャーを適用",
  bn: "ভাউচার প্রয়োগ করুন"
},

enterVoucherCode: {
  en: "Enter voucher code",
  kn: "ವೋಚರ್ ಕೋಡ್ ನಮೂದಿಸಿ",
  fr: "Entrez le code du bon",
  de: "Gutscheincode eingeben",
  it: "Inserisci codice voucher",
  pt: "Digite o código do voucher",
  hi: "वाउचर कोड दर्ज करें",
  ar: "أدخل رمز القسيمة",
  zh: "输入优惠券代码",
  ja: "バウチャーコードを入力",
  bn: "ভাউচার কোড লিখুন"
},

apply: {
  en: "APPLY",
  kn: "ಅನ್ವಯಿಸಿ",
  fr: "APPLIQUER",
  de: "ANWENDEN",
  it: "APPLICA",
  pt: "APLICAR",
  hi: "लागू करें",
  ar: "تطبيق",
  zh: "应用",
  ja: "適用",
  bn: "প্রয়োগ করুন"
},

totalForItems: {
  en: "Total for {count} item{plural} ({persons} person{personPlural})",
  kn: "ಒಟ್ಟು {count} ಐಟಂ{plural} ({persons} ವ್ಯಕ್ತಿ{personPlural})",
  fr: "Total pour {count} article{plural} ({persons} personne{personPlural})",
  de: "Gesamt für {count} Artikel{plural} ({persons} Person{personPlural})",
  it: "Totale per {count} articolo{plural} ({persons} persona{personPlural})",
  pt: "Total para {count} item{plural} ({persons} pessoa{personPlural})",
  hi: "कुल {count} आइटम{plural} ({persons} व्यक्ति{personPlural}) के लिए",
  ar: "المجموع لـ {count} عنصر{plural} ({persons} شخص{personPlural})",
  zh: "共{count}件商品{plural}（{persons}人{personPlural}）的总价",
  ja: "合計 {count}アイテム{plural}（{persons}人{personPlural}）",
  bn: "মোট {count}টি আইটেম{plural} ({persons} জন{personPlural}) এর জন্য"
},

loginToContinue: {
  en: "LOGIN TO CONTINUE",
  kn: "ಮುಂದುವರಿಯಲು ಲಾಗಿನ್ ಮಾಡಿ",
  fr: "CONNECTEZ-VOUS POUR CONTINUER",
  de: "ANMELDEN ZUM FORTFAHREN",
  it: "ACCEDI PER CONTINUARE",
  pt: "FAÇA LOGIN PARA CONTINUAR",
  hi: "जारी रखने के लिए लॉगिन करें",
  ar: "تسجيل الدخول للمتابعة",
  zh: "登录以继续",
  ja: "続行するにはログイン",
  bn: "চালিয়ে যেতে লগইন করুন"
},

checkout: {
  en: "CHECKOUT",
  kn: "ಚೆಕ್‌ಔಟ್",
  fr: "PAIEMENT",
  de: "KASSE",
  it: "CHECKOUT",
  pt: "FINALIZAR",
  hi: "चेकआउट",
  ar: "الدفع",
  zh: "结账",
  ja: "チェックアウト",
  bn: "চেকআউট"
},

youNeedToLogin: {
  en: "You need to login to proceed with checkout",
  kn: "ಚೆಕ್‌ಔಟ್‌ನೊಂದಿಗೆ ಮುಂದುವರಿಯಲು ನೀವು ಲಾಗಿನ್ ಆಗಬೇಕಾಗುತ್ತದೆ",
  fr: "Vous devez vous connecter pour procéder au paiement",
  de: "Sie müssen sich anmelden, um zur Kasse zu gehen",
  it: "Devi accedere per procedere al checkout",
  pt: "Você precisa fazer login para prosseguir com o checkout",
  hi: "चेकआउट के लिए आगे बढ़ने के लिए आपको लॉगिन करना होगा",
  ar: "تحتاج إلى تسجيل الدخول للمتابعة إلى الدفع",
  zh: "您需要登录才能继续结账",
  ja: "チェックアウトを続行するにはログインが必要です",
  bn: "চেকআউটে যেতে আপনাকে লগইন করতে হবে"
},

minutesPreparation: {
  en: "{minutes} mins preparation",
  kn: "{minutes} ನಿಮಿಷಗಳ ತಯಾರಿ",
  fr: "{minutes} minutes de préparation",
  de: "{minutes} Minuten Zubereitung",
  it: "{minutes} minuti di preparazione",
  pt: "{minutes} minutos de preparo",
  hi: "{minutes} मिनट तैयारी",
  ar: "{minutes} دقائق تحضير",
  zh: "{minutes}分钟准备",
  ja: "{minutes}分の準備",
  bn: "{minutes} মিনিট প্রস্তুতি"
},

hoursPreparation: {
  en: "{hours} hrs preparation",
  kn: "{hours} ಗಂಟೆಗಳ ತಯಾರಿ",
  fr: "{hours} heures de préparation",
  de: "{hours} Stunden Zubereitung",
  it: "{hours} ore di preparazione",
  pt: "{hours} horas de preparo",
  hi: "{hours} घंटे तैयारी",
  ar: "{hours} ساعات تحضير",
  zh: "{hours}小时准备",
  ja: "{hours}時間の準備",
  bn: "{hours} ঘন্টা প্রস্তুতি"
},

reviews: {
  en: "({count} reviews)",
  kn: "({count} ವಿಮರ್ಶೆಗಳು)",
  fr: "({count} avis)",
  de: "({count} Bewertungen)",
  it: "({count} recensioni)",
  pt: "({count} avaliações)",
  hi: "({count} समीक्षाएँ)",
  ar: "({count} تقييمات)",
  zh: "({count}条评论)",
  ja: "({count}件のレビュー)",
  bn: "({count}টি পর্যালোচনা)"
},
// ============ END COOK SERVICES DIALOG TRANSLATIONS ============

// ============ MAID SERVICE DIALOG TRANSLATIONS ============
maidService: {
  en: "🧹 Maid Service",
  kn: "🧹 ಮನೆಕೆಲಸದವರ ಸೇವೆ",
  fr: "🧹 Service de Ménage",
  de: "🧹 Reinigungsdienst",
  it: "🧹 Servizio di Pulizia",
  pt: "🧹 Serviço de Limpeza",
  hi: "🧹 सफाई सेवा",
  ar: "🧹 خدمة التنظيف",
  zh: "🧹 清洁服务",
  ja: "🧹 掃除サービス",
  bn: "🧹 পরিচ্ছন্নতা সেবা"
},

utensilCleaning: {
  en: "Utensil Cleaning",
  kn: "ಪಾತ್ರೆ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage d'Ustensiles",
  de: "Geschirrreinigung",
  it: "Pulizia Utensili",
  pt: "Limpeza de Utensílios",
  hi: "बर्तन सफाई",
  ar: "تنظيف الأواني",
  zh: "餐具清洁",
  ja: "食器洗い",
  bn: "বাসন পরিষ্কার"
},

sweepingMopping: {
  en: "Sweeping & Mopping",
  kn: "ಗುಡಿಸುವುದು ಮತ್ತು ಒರೆಸುವುದು",
  fr: "Balayage et Nettoyage",
  de: "Kehren und Wischen",
  it: "Spazzare e Lavare",
  pt: "Varrer e Passar Pano",
  hi: "झाड़ू और पोछा",
  ar: "كنس ومسح",
  zh: "清扫和拖地",
  ja: "掃き掃除と拭き掃除",
  bn: "ঝাড়ু দেওয়া ও মুছা"
},

bathroomCleaning: {
  en: "Bathroom Cleaning",
  kn: "ಸ್ನಾನಗೃಹ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage de Salle de Bain",
  de: "Badezimmerreinigung",
  it: "Pulizia Bagno",
  pt: "Limpeza de Banheiro",
  hi: "बाथरूम सफाई",
  ar: "تنظيف الحمام",
  zh: "卫生间清洁",
  ja: "浴室清掃",
  bn: "বাথরুম পরিষ্কার"
},

utensilCleaningDesc1: {
  en: "All kind of daily utensil cleaning",
  kn: "ಎಲ್ಲಾ ರೀತಿಯ ದೈನಂದಿನ ಪಾತ್ರೆ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Tous types de nettoyage quotidien d'ustensiles",
  de: "Alle Arten der täglichen Geschirrreinigung",
  it: "Tutti i tipi di pulizia quotidiana degli utensili",
  pt: "Todos os tipos de limpeza diária de utensílios",
  hi: "सभी प्रकार के दैनिक बर्तन सफाई",
  ar: "جميع أنواع تنظيف الأواني اليومية",
  zh: "各种日常餐具清洁",
  ja: "あらゆる種類の日常的な食器洗い",
  bn: "সব ধরনের দৈনিক বাসন পরিষ্কার"
},

utensilCleaningDesc2: {
  en: "Party used type utensil cleaning",
  kn: "ಪಾರ್ಟಿಯಲ್ಲಿ ಬಳಸಿದ ಪಾತ್ರೆ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage d'ustensiles utilisés pour les fêtes",
  de: "Reinigung von Partygeschirr",
  it: "Pulizia di utensili usati per feste",
  pt: "Limpeza de utensílios usados em festas",
  hi: "पार्टी में उपयोग किए गए बर्तनों की सफाई",
  ar: "تنظيف الأواني المستخدمة في الحفلات",
  zh: "派对用过的餐具清洁",
  ja: "パーティーで使用された食器の洗浄",
  bn: "পার্টিতে ব্যবহৃত বাসন পরিষ্কার"
},

sweepingMoppingDesc: {
  en: "Daily sweeping and mopping of 2 rooms, 1 Hall",
  kn: "2 ಕೊಠಡಿಗಳು, 1 ಹಾಲ್ ನ ದೈನಂದಿನ ಗುಡಿಸುವುದು ಮತ್ತು ಒರೆಸುವುದು",
  fr: "Balayage et nettoyage quotidiens de 2 chambres, 1 salon",
  de: "Tägliches Kehren und Wischen von 2 Zimmern, 1 Wohnzimmer",
  it: "Spazzare e lavare quotidianamente 2 stanze, 1 soggiorno",
  pt: "Varrer e passar pano diariamente em 2 quartos, 1 sala",
  hi: "2 कमरों, 1 हॉल की दैनिक झाड़ू और पोछा",
  ar: "كنس ومسح يومي لغرفتين وصالة واحدة",
  zh: "每天清扫和拖地2个房间，1个客厅",
  ja: "毎日の掃き掃除と拭き掃除（2部屋、1リビング）",
  bn: "২টি ঘর, ১টি হলের দৈনিক ঝাড়ু দেওয়া ও মুছা"
},

bathroomCleaningDesc: {
  en: "Weekly cleaning of bathrooms",
  kn: "ಸ್ನಾನಗೃಹಗಳ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage hebdomadaire des salles de bain",
  de: "Wöchentliche Reinigung der Badezimmer",
  it: "Pulizia settimanale dei bagni",
  pt: "Limpeza semanal de banheiros",
  hi: "बाथरूम की साप्ताहिक सफाई",
  ar: "تنظيف أسبوعي للحمامات",
  zh: "每周清洁卫生间",
  ja: "毎週の浴室清掃",
  bn: "সাপ্তাহিক বাথরুম পরিষ্কার"
},

regularAddonServices: {
  en: "Regular Add-on Services",
  kn: "ನಿಯಮಿತ ಆಡ್-ಆನ್ ಸೇವೆಗಳು",
  fr: "Services Complémentaires Réguliers",
  de: "Reguläre Zusatzdienste",
  it: "Servizi Aggiuntivi Regolari",
  pt: "Serviços Adicionais Regulares",
  hi: "नियमित ऐड-ऑन सेवाएं",
  ar: "خدمات إضافية منتظمة",
  zh: "常规附加服务",
  ja: "通常のアドオンサービス",
  bn: "নিয়মিত অ্যাড-অন সেবা"
},

bathroomDeepCleaning: {
  en: "Bathroom Deep Cleaning",
  kn: "ಸ್ನಾನಗೃಹದ ಆಳವಾದ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ",
  fr: "Nettoyage en Profondeur de Salle de Bain",
  de: "Tiefenreinigung Badezimmer",
  it: "Pulizia Profonda del Bagno",
  pt: "Limpeza Profunda do Banheiro",
  hi: "बाथरूम गहरी सफाई",
  ar: "تنظيف عميق للحمام",
  zh: "卫生间深度清洁",
  ja: "浴室の徹底清掃",
  bn: "বাথরুম গভীর পরিষ্কার"
},

bathroomDeepCleaningDesc: {
  en: "Weekly cleaning of bathrooms, all bathroom walls cleaned",
  kn: "ಸ್ನಾನಗೃಹಗಳ ಸಾಪ್ತಾಹಿಕ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ, ಎಲ್ಲಾ ಸ್ನಾನಗೃಹದ ಗೋಡೆಗಳು ಸ್ವಚ್ಛಗೊಳಿಸಲ್ಪಡುತ್ತವೆ",
  fr: "Nettoyage hebdomadaire des salles de bain, nettoyage de tous les murs de la salle de bain",
  de: "Wöchentliche Reinigung der Badezimmer, Reinigung aller Badezimmerwände",
  it: "Pulizia settimanale dei bagni, pulizia di tutte le pareti del bagno",
  pt: "Limpeza semanal de banheiros, limpeza de todas as paredes do banheiro",
  hi: "बाथरूम की साप्ताहिक सफाई, सभी बाथरूम की दीवारों की सफाई",
  ar: "تنظيف أسبوعي للحمامات، تنظيف جميع جدران الحمام",
  zh: "每周清洁卫生间，清洁所有卫生间墙壁",
  ja: "毎週の浴室清掃、すべての浴室の壁の清掃",
  bn: "সাপ্তাহিক বাথরুম পরিষ্কার, সমস্ত বাথরুমের দেয়াল পরিষ্কার"
},

normalDusting: {
  en: "Normal Dusting",
  kn: "ಸಾಮಾನ್ಯ ಧೂಳು ಒರೆಸುವುದು",
  fr: "Dépoussiérage Normal",
  de: "Normales Staubwischen",
  it: "Spolveratura Normale",
  pt: "Limpeza Normal",
  hi: "सामान्य धूल झाड़ना",
  ar: "تنظيف عادي",
  zh: "普通除尘",
  ja: "通常のほこり取り",
  bn: "সাধারণ ধুলো মুছা"
},

normalDustingDesc: {
  en: "Daily furniture dusting, doors, carpet, bed making",
  kn: "ದೈನಂದಿನ ಫರ್ನಿಚರ್ ಧೂಳು ಒರೆಸುವುದು, ಬಾಗಿಲುಗಳು, ಕಾರ್ಪೆಟ್, ಹಾಸಿಗೆ ಮಾಡುವುದು",
  fr: "Dépoussiérage quotidien des meubles, portes, tapis, confection des lits",
  de: "Tägliches Staubwischen von Möbeln, Türen, Teppich, Bettenmachen",
  it: "Spolveratura quotidiana di mobili, porte, tappeto, rifacimento letti",
  pt: "Limpeza diária de móveis, portas, tapete, arrumação de cama",
  hi: "दैनिक फर्नीचर धूल झाड़ना, दरवाजे, कालीन, बिस्तर बनाना",
  ar: "تنظيف يومي للأثاث، الأبواب، السجاد، ترتيب السرير",
  zh: "每日家具除尘、门、地毯、整理床铺",
  ja: "毎日の家具のほこり取り、ドア、カーペット、ベッドメイキング",
  bn: "দৈনিক আসবাবপত্রে ধুলো মুছা, দরজা, কার্পেট, বিছানা তৈরি"
},

deepDusting: {
  en: "Deep Dusting",
  kn: "ಆಳವಾದ ಧೂಳು ಒರೆಸುವುದು",
  fr: "Dépoussiérage Profond",
  de: "Tiefenreinigung",
  it: "Spolveratura Profonda",
  pt: "Limpeza Profunda",
  hi: "गहरी धूल झाड़ना",
  ar: "تنظيف عميق",
  zh: "深度除尘",
  ja: "徹底的なほこり取り",
  bn: "গভীর ধুলো মুছা"
},

deepDustingDesc: {
  en: "Includes chemical agents cleaning: décor items, furniture",
  kn: "ರಾಸಾಯನಿಕ ಏಜೆಂಟ್ ಸ್ವಚ್ಛಗೊಳಿಸುವಿಕೆ ಸೇರಿದೆ: ಅಲಂಕಾರಿಕ ವಸ್ತುಗಳು, ಫರ್ನಿಚರ್",
  fr: "Comprend le nettoyage avec des agents chimiques : articles de décoration, meubles",
  de: "Beinhaltet Reinigung mit chemischen Mitteln: Dekorationsgegenstände, Möbel",
  it: "Include pulizia con agenti chimici: oggetti decorativi, mobili",
  pt: "Inclui limpeza com agentes químicos: itens de decoração, móveis",
  hi: "रासायनिक एजेंटों की सफाई शामिल है: सजावटी वस्तुएं, फर्नीचर",
  ar: "يشمل التنظيف بعوامل كيميائية: العناصر الزخرفية، الأثاث",
  zh: "包括化学剂清洁：装饰品、家具",
  ja: "化学薬品による清掃を含む：装飾品、家具",
  bn: "রাসায়নিক এজেন্ট পরিষ্কার অন্তর্ভুক্ত: সাজসজ্জার জিনিস, আসবাবপত্র"
},

utensilDrying: {
  en: "Utensil Drying",
  kn: "ಪಾತ್ರೆ ಒಣಗಿಸುವುದು",
  fr: "Séchage d'Ustensiles",
  de: "Geschirrtrocknen",
  it: "Asciugatura Utensili",
  pt: "Secagem de Utensílios",
  hi: "बर्तन सुखाना",
  ar: "تجفيف الأواني",
  zh: "餐具晾干",
  ja: "食器の乾燥",
  bn: "বাসন শুকানো"
},

utensilDryingDesc: {
  en: "Househelp will dry and make proper arrangements",
  kn: "ಮನೆ ಸಹಾಯಕರು ಒಣಗಿಸಿ ಸರಿಯಾದ ವ್ಯವಸ್ಥೆ ಮಾಡುತ್ತಾರೆ",
  fr: "L'aide ménagère séchera et fera les arrangements appropriés",
  de: "Die Haushaltshilfe trocknet und trifft die richtigen Vorkehrungen",
  it: "La colf asciugherà e farà gli opportuni accordi",
  pt: "A ajudante secará e fará os arranjos adequados",
  hi: "घरेलू सहायक सुखाएगा और उचित व्यवस्था करेगा",
  ar: "ستقوم المساعدة المنزلية بالتجفيف والترتيب المناسب",
  zh: "家政助手将晾干并妥善安排",
  ja: "家事ヘルパーが乾燥させ、適切に整理します",
  bn: "গৃহকর্মী শুকিয়ে সঠিকভাবে সাজিয়ে রাখবেন"
},

clothesDrying: {
  en: "Clothes Drying",
  kn: "ಬಟ್ಟೆ ಒಣಗಿಸುವುದು",
  fr: "Séchage de Vêtements",
  de: "Wäschetrocknen",
  it: "Asciugatura Vestiti",
  pt: "Secagem de Roupas",
  hi: "कपड़े सुखाना",
  ar: "تجفيف الملابس",
  zh: "衣物晾干",
  ja: "衣類の乾燥",
  bn: "কাপড় শুকানো"
},

clothesDryingDesc: {
  en: "Househelp will get clothes from/to drying place",
  kn: "ಮನೆ ಸಹಾಯಕರು ಒಣಗಿಸುವ ಸ್ಥಳದಿಂದ/ಗೆ ಬಟ್ಟೆಗಳನ್ನು ತರುತ್ತಾರೆ/ಕೊಂಡೊಯ್ಯುತ್ತಾರೆ",
  fr: "L'aide ménagère ira chercher/rapportera les vêtements du lieu de séchage",
  de: "Die Haushaltshilfe holt/bringt die Wäsche vom/zum Trockenplatz",
  it: "La colf prenderà/porterà i vestiti dal luogo di asciugatura",
  pt: "A ajudante pegará/levará as roupas do local de secagem",
  hi: "घरेलू सहायक कपड़े सुखाने की जगह से लाएगा/ले जाएगा",
  ar: "ستأخذ المساعدة المنزلية الملابس من/إلى مكان التجفيف",
  zh: "家政助手将从/到晾衣处取送衣物",
  ja: "家事ヘルパーが乾燥場所から衣類を取り出し/運びます",
  bn: "গৃহকর্মী শুকানোর জায়গা থেকে কাপড় আনবেন/নিয়ে যাবেন"
},


houseSize: {
  en: "House Size:",
  kn: "ಮನೆಯ ಗಾತ್ರ:",
  fr: "Taille de la Maison :",
  de: "Hausgröße:",
  it: "Dimensioni Casa:",
  pt: "Tamanho da Casa:",
  hi: "घर का आकार:",
  ar: "حجم المنزل:",
  zh: "房屋大小:",
  ja: "家の広さ:",
  bn: "বাড়ির আকার:"
},

bathrooms: {
  en: "Bathrooms:",
  kn: "ಸ್ನಾನಗೃಹಗಳು:",
  fr: "Salles de Bain :",
  de: "Badezimmer:",
  it: "Bagni:",
  pt: "Banheiros:",
  hi: "बाथरूम:",
  ar: "الحمامات:",
  zh: "卫生间:",
  ja: "浴室:",
  bn: "বাথরুম:"
},

monthlyService: {
  en: "Monthly service",
  kn: "ಮಾಸಿಕ ಸೇವೆ",
  fr: "Service mensuel",
  de: "Monatlicher Service",
  it: "Servizio mensile",
  pt: "Serviço mensal",
  hi: "मासिक सेवा",
  ar: "خدمة شهرية",
  zh: "月度服务",
  ja: "月額サービス",
  bn: "মাসিক সেবা"
},

addThisService: {
  en: "+ Add This Service",
  kn: "+ ಈ ಸೇವೆಯನ್ನು ಸೇರಿಸಿ",
  fr: "+ Ajouter Ce Service",
  de: "+ Diesen Service hinzufügen",
  it: "+ Aggiungi Questo Servizio",
  pt: "+ Adicionar Este Serviço",
  hi: "+ यह सेवा जोड़ें",
  ar: "+ أضف هذه الخدمة",
  zh: "+ 添加此服务",
  ja: "+ このサービスを追加",
  bn: "+ এই সেবা যোগ করুন"
},

added: {
  en: "ADDED",
  kn: "ಸೇರಿಸಲಾಗಿದೆ",
  fr: "AJOUTÉ",
  de: "HINZUGEFÜGT",
  it: "AGGIUNTO",
  pt: "ADICIONADO",
  hi: "जोड़ा गया",
  ar: "تمت الإضافة",
  zh: "已添加",
  ja: "追加済み",
  bn: "যুক্ত হয়েছে"
},

totalForServices: {
  en: "Total for {services} services ({addons} add-ons)",
  kn: "ಒಟ್ಟು {services} ಸೇವೆಗಳಿಗೆ ({addons} ಆಡ್-ಆನ್‌ಗಳು)",
  fr: "Total pour {services} services ({addons} compléments)",
  de: "Gesamt für {services} Dienste ({addons} Zusätze)",
  it: "Totale per {services} servizi ({addons} aggiuntivi)",
  pt: "Total para {services} serviços ({addons} adicionais)",
  hi: "कुल {services} सेवाओं के लिए ({addons} ऐड-ऑन)",
  ar: "المجموع لـ {services} خدمات ({addons} إضافات)",
  zh: "共{services}项服务（{addons}项附加服务）的总价",
  ja: "合計 {services}サービス（{addons}アドオン）",
  bn: "মোট {services}টি সেবার জন্য ({addons}টি অ্যাড-অন)"
},
// ============ END MAID SERVICE DIALOG TRANSLATIONS ============

// ============ NANNY SERVICES DIALOG TRANSLATIONS ============
caregiverService: {
  en: "❤️ Caregiver Service",
  kn: "❤️ ಆರೈಕೆದಾರ ಸೇವೆ",
  fr: "❤️ Service de Soignant",
  de: "❤️ Pflegedienst",
  it: "❤️ Servizio di Assistenza",
  pt: "❤️ Serviço de Cuidador",
  hi: "❤️ देखभालकर्ता सेवा",
  ar: "❤️ خدمة مقدم الرعاية",
  zh: "❤️ 护理人员服务",
  ja: "❤️ 介護サービス",
  bn: "❤️ পরিচর্যাকারী সেবা"
},

dayService: {
  en: "Day",
  kn: "ಹಗಲು",
  fr: "Jour",
  de: "Tag",
  it: "Giorno",
  pt: "Dia",
  hi: "दिन",
  ar: "نهار",
  zh: "日间",
  ja: "デイ",
  bn: "দিন"
},

nightService: {
  en: "Night",
  kn: "ರಾತ್ರಿ",
  fr: "Nuit",
  de: "Nacht",
  it: "Notte",
  pt: "Noite",
  hi: "रात",
  ar: "ليل",
  zh: "夜间",
  ja: "ナイト",
  bn: "রাত"
},

fullTimeService: {
  en: "Fulltime",
  kn: "ಪೂರ್ಣ ಸಮಯ",
  fr: "Temps Plein",
  de: "Vollzeit",
  it: "Tempo Pieno",
  pt: "Tempo Integral",
  hi: "पूर्णकालिक",
  ar: "دوام كامل",
  zh: "全职",
  ja: "フルタイム",
  bn: "পূর্ণকালীন"
},

age: {
  en: "Age:",
  kn: "ವಯಸ್ಸು:",
  fr: "Âge :",
  de: "Alter:",
  it: "Età:",
  pt: "Idade:",
  hi: "आयु:",
  ar: "العمر:",
  zh: "年龄:",
  ja: "年齢:",
  bn: "বয়স:"
},

ageInfoBaby: {
  en: "Age 1 includes babies from 1 to 12 months",
  kn: "ವಯಸ್ಸು 1 ರಲ್ಲಿ 1 ರಿಂದ 12 ತಿಂಗಳ ಮಕ್ಕಳು ಸೇರಿದ್ದಾರೆ",
  fr: "L'âge 1 comprend les bébés de 1 à 12 mois",
  de: "Alter 1 umfasst Babys von 1 bis 12 Monaten",
  it: "Età 1 include bambini da 1 a 12 mesi",
  pt: "Idade 1 inclui bebês de 1 a 12 meses",
  hi: "आयु 1 में 1 से 12 महीने के शिशु शामिल हैं",
  ar: "العمر 1 يشمل الأطفال من 1 إلى 12 شهرًا",
  zh: "年龄1包括1至12个月的婴儿",
  ja: "年齢1は生後1〜12ヶ月の赤ちゃんを含みます",
  bn: "বয়স ১ এ ১ থেকে ১২ মাসের শিশু অন্তর্ভুক্ত"
},

ageInfoElderly: {
  en: "For seniors aged 60 and above",
  kn: "60 ಮತ್ತು ಅದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ವಯಸ್ಸಿನ ಹಿರಿಯರಿಗೆ",
  fr: "Pour les seniors de 60 ans et plus",
  de: "Für Senioren ab 60 Jahren",
  it: "Per anziani dai 60 anni in su",
  pt: "Para idosos com 60 anos ou mais",
  hi: "60 वर्ष और उससे अधिक आयु के वरिष्ठ नागरिकों के लिए",
  ar: "لكبار السن من 60 سنة فما فوق",
  zh: "适用于60岁及以上的老年人",
  ja: "60歳以上の高齢者向け",
  bn: "৬০ বছর ও তার বেশি বয়সের বয়স্কদের জন্য"
},

totalForService: {
  en: "Total for {count} service{plural}",
  kn: "ಒಟ್ಟು {count} ಸೇವೆ{plural}",
  fr: "Total pour {count} service{plural}",
  de: "Gesamt für {count} Dienstleistung{plural}",
  it: "Totale per {count} servizio{plural}",
  pt: "Total para {count} serviço{plural}",
  hi: "कुल {count} सेवा{plural} के लिए",
  ar: "المجموع لـ {count} خدمة{plural}",
  zh: "共{count}项服务{plural}的总价",
  ja: "合計 {count}サービス{plural}",
  bn: "মোট {count}টি সেবা{plural} এর জন্য"
},

// ============ END NANNY SERVICES DIALOG TRANSLATIONS ============

// Add these to your translations object in LanguageContext.tsx
availabilityDetails: {
  en: "Availability Details",
  kn: "ಲಭ್ಯತೆಯ ವಿವರಗಳು",
  fr: "Détails de Disponibilité",
  de: "Verfügbarkeitsdetails",
  it: "Dettagli Disponibilità",
  pt: "Detalhes de Disponibilidade",
  hi: "उपलब्धता विवरण",
  ar: "تفاصيل التوفر",
  zh: "可用性详情",
  ja: "空き状況の詳細",
  bn: "উপলব্ধতার বিবরণ"
},
bestMatch: {
  en: "Best Match",
  kn: "ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ",
  fr: "Meilleure Correspondance",
  de: "Beste Übereinstimmung",
  it: "Miglior corrispondenza",
  pt: "Melhor Correspondência",
  hi: "सर्वोत्तम मिलान",
  ar: "أفضل تطابق",
  zh: "最佳匹配",
  ja: "ベストマッチ",
  bn: "সেরা মিল"
},
bestMatchProvider: {
  en: "Best Match Provider!",
  kn: "ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆಯ ಪ್ರದಾತಾ!",
  fr: "Meilleur Prestataire !",
  de: "Bester Anbieter!",
  it: "Miglior Fornitore!",
  pt: "Melhor Prestador!",
  hi: "सर्वोत्तम प्रदाता!",
  ar: "أفضل مقدم خدمة!",
  zh: "最佳服务提供者！",
  ja: "ベストプロバイダー！",
  bn: "সেরা প্রদানকারী!"
},
bestMatchDescription: {
  en: "This provider perfectly matches all your requirements and preferences.",
  kn: "ಈ ಪ್ರದಾತಾ ನಿಮ್ಮ ಎಲ್ಲಾ ಅವಶ್ಯಕತೆಗಳು ಮತ್ತು ಆದ್ಯತೆಗಳಿಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.",
  fr: "Ce prestataire correspond parfaitement à toutes vos exigences et préférences.",
  de: "Dieser Anbieter entspricht perfekt allen Ihren Anforderungen und Präferenzen.",
  it: "Questo fornitore corrisponde perfettamente a tutte le tue esigenze e preferenze.",
  pt: "Este prestador corresponde perfeitamente a todos os seus requisitos e preferências.",
  hi: "यह प्रदाता आपकी सभी आवश्यकताओं और प्राथमिकताओं से पूरी तरह मेल खाता है।",
  ar: "هذا المقدم يطابق تمامًا جميع متطلباتك وتفضيلاتك.",
  zh: "该服务提供者完全符合您的所有要求和偏好。",
  ja: "このプロバイダーは、お客様のすべての要件と好みに完全に一致します。",
  bn: "এই প্রদানকারী আপনার সমস্ত প্রয়োজন এবং পছন্দের সাথে পুরোপুরি মেলে।"
},
goodMatch: {
  en: "Good Match",
  kn: "ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ",
  fr: "Bonne Correspondance",
  de: "Gute Übereinstimmung",
  it: "Buona corrispondenza",
  pt: "Boa Correspondência",
  hi: "अच्छा मिलान",
  ar: "تطابق جيد",
  zh: "良好匹配",
  ja: "良いマッチ",
  bn: "ভাল মিল"
},
unknown: {
  en: "Unknown",
  kn: "ಅಜ್ಞಾತ",
  fr: "Inconnu",
  de: "Unbekannt",
  it: "Sconosciuto",
  pt: "Desconhecido",
  hi: "अज्ञात",
  ar: "غير معروف",
  zh: "未知",
  ja: "不明",
  bn: "অজানা"
},
fullyAvailable: {
  en: "Fully Available",
  kn: "ಸಂಪೂರ್ಣವಾಗಿ ಲಭ್ಯವಿದೆ",
  fr: "Totalement Disponible",
  de: "Vollständig Verfügbar",
  it: "Completamente Disponibile",
  pt: "Totalmente Disponível",
  hi: "पूरी तरह उपलब्ध",
  ar: "متاح بالكامل",
  zh: "完全可用",
  ja: "完全に利用可能",
  bn: "সম্পূর্ণ উপলব্ধ"
},
partiallyAvailable: {
  en: "Partially Available",
  kn: "ಭಾಗಶಃ ಲಭ್ಯವಿದೆ",
  fr: "Partiellement Disponible",
  de: "Teilweise Verfügbar",
  it: "Parzialmente Disponibile",
  pt: "Parcialmente Disponível",
  hi: "आंशिक रूप से उपलब्ध",
  ar: "متاح جزئيًا",
  zh: "部分可用",
  ja: "部分的に利用可能",
  bn: "আংশিকভাবে উপলব্ধ"
},
bestMatchMessage: {
  en: "This provider is our best match for your requirements!",
  kn: "ಈ ಪ್ರದಾತಾ ನಿಮ್ಮ ಅವಶ್ಯಕತೆಗಳಿಗೆ ನಮ್ಮ ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ!",
  fr: "Ce prestataire est notre meilleure correspondance pour vos exigences !",
  de: "Dieser Anbieter ist unsere beste Übereinstimmung für Ihre Anforderungen!",
  it: "Questo fornitore è la nostra migliore corrispondenza per le tue esigenze!",
  pt: "Este prestador é a nossa melhor correspondência para os seus requisitos!",
  hi: "यह प्रदाता आपकी आवश्यकताओं के लिए हमारा सर्वोत्तम मिलान है!",
  ar: "هذا المقدم هو أفضل تطابق لدينا لمتطلباتك!",
  zh: "该服务提供者是我们最符合您要求的！",
  ja: "このプロバイダーはお客様の要件に最適です！",
  bn: "এই প্রদানকারী আপনার প্রয়োজনীয়তার জন্য আমাদের সেরা মিল!"
},
partialAvailabilityMessage: {
  en: "This provider has some schedule variations. Check availability details below.",
  kn: "ಈ ಪ್ರದಾತಾ ಕೆಲವು ವೇಳಾಪಟ್ಟಿ ವ್ಯತ್ಯಾಸಗಳನ್ನು ಹೊಂದಿದೆ. ಕೆಳಗೆ ಲಭ್ಯತೆಯ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
  fr: "Ce prestataire a des variations d'horaires. Consultez les détails de disponibilité ci-dessous.",
  de: "Dieser Anbieter hat einige Zeitplanvariationen. Überprüfen Sie die Verfügbarkeitsdetails unten.",
  it: "Questo fornitore ha alcune variazioni di orario. Controlla i dettagli di disponibilità qui sotto.",
  pt: "Este prestador tem algumas variações de horário. Verifique os detalhes de disponibilidade abaixo.",
  hi: "इस प्रदाता के पास कुछ कार्यक्रम भिन्नताएं हैं। नीचे उपलब्धता विवरण देखें।",
  ar: "هذا المقدم لديه بعض الاختلافات في الجدول الزمني. تحقق من تفاصيل التوفر أدناه.",
  zh: "该服务提供者有一些日程变化。请查看下面的可用性详情。",
  ja: "このプロバイダーにはスケジュールの変動があります。以下の空き状況の詳細をご確認ください。",
  bn: "এই প্রদানকারীর কিছু সময়সূচী পরিবর্তন আছে। নীচে উপলব্ধতার বিবরণ দেখুন।"
},
goodMatchMessage: {
  en: "This provider matches most of your requirements.",
  kn: "ಈ ಪ್ರದಾತಾ ನಿಮ್ಮ ಹೆಚ್ಚಿನ ಅವಶ್ಯಕತೆಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.",
  fr: "Ce prestataire correspond à la plupart de vos exigences.",
  de: "Dieser Anbieter entspricht den meisten Ihrer Anforderungen.",
  it: "Questo fornitore soddisfa la maggior parte delle tue esigenze.",
  pt: "Este prestador corresponde à maioria dos seus requisitos.",
  hi: "यह प्रदाता आपकी अधिकांश आवश्यकताओं से मेल खाता है।",
  ar: "هذا المقدم يطابق معظم متطلباتك.",
  zh: "该服务提供者符合您的大部分要求。",
  ja: "このプロバイダーはお客様の要件のほとんどを満たしています。",
  bn: "এই প্রদানকারী আপনার অধিকাংশ প্রয়োজনীয়তা পূরণ করে।"
},
preferredWorkingTime: {
  en: "Preferred Working Time",
  kn: "ಆದ್ಯತೆಯ ಕೆಲಸದ ಸಮಯ",
  fr: "Horaire de Travail Préféré",
  de: "Bevorzugte Arbeitszeit",
  it: "Orario di Lavoro Preferito",
  pt: "Horário de Trabalho Preferido",
  hi: "पसंदीदा कार्य समय",
  ar: "وقت العمل المفضل",
  zh: "首选工作时间",
  ja: "希望勤務時間",
  bn: "পছন্দের কাজের সময়"
},
availabilitySummary: {
  en: "Availability Summary (Next 30 days)",
  kn: "ಲಭ್ಯತೆಯ ಸಾರಾಂಶ (ಮುಂದಿನ 30 ದಿನಗಳು)",
  fr: "Résumé de Disponibilité (30 prochains jours)",
  de: "Verfügbarkeitsübersicht (Nächste 30 Tage)",
  it: "Riepilogo Disponibilità (Prossimi 30 giorni)",
  pt: "Resumo de Disponibilidade (Próximos 30 dias)",
  hi: "उपलब्धता सारांश (अगले 30 दिन)",
  ar: "ملخص التوفر (الأيام الـ30 القادمة)",
  zh: "可用性摘要（未来30天）",
  ja: "空き状況の概要（今後30日間）",
  bn: "উপলব্ধতার সারাংশ (পরবর্তী ৩০ দিন)"
},
daysAtPreferredTime: {
  en: "Days at preferred time",
  kn: "ಆದ್ಯತೆಯ ಸಮಯದಲ್ಲಿ ದಿನಗಳು",
  fr: "Jours à l'heure préférée",
  de: "Tage zur bevorzugten Zeit",
  it: "Giorni all'orario preferito",
  pt: "Dias no horário preferido",
  hi: "पसंदीदा समय पर दिन",
  ar: "أيام في الوقت المفضل",
  zh: "首选时间的天数",
  ja: "希望時間の日数",
  bn: "পছন্দের সময়ে দিন"
},
daysWithDifferentTime: {
  en: "Days with different time",
  kn: "ವಿಭಿನ್ನ ಸಮಯದ ದಿನಗಳು",
  fr: "Jours à heure différente",
  de: "Tage mit abweichender Zeit",
  it: "Giorni con orario diverso",
  pt: "Dias com horário diferente",
  hi: "अलग समय वाले दिन",
  ar: "أيام بوقت مختلف",
  zh: "不同时间的天数",
  ja: "異なる時間の日数",
  bn: "ভিন্ন সময়ের দিন"
},
unavailableDays: {
  en: "Unavailable days",
  kn: "ಲಭ್ಯವಿಲ್ಲದ ದಿನಗಳು",
  fr: "Jours non disponibles",
  de: "Nicht verfügbare Tage",
  it: "Giorni non disponibili",
  pt: "Dias indisponíveis",
  hi: "अनुपलब्ध दिन",
  ar: "أيام غير متاحة",
  zh: "不可用天数",
  ja: "利用不可の日数",
  bn: "অনুপলব্ধ দিন"
},
totalAvailableDays: {
  en: "Total available days",
  kn: "ಒಟ್ಟು ಲಭ್ಯವಿರುವ ದಿನಗಳು",
  fr: "Total des jours disponibles",
  de: "Verfügbare Tage insgesamt",
  it: "Totale giorni disponibili",
  pt: "Total de dias disponíveis",
  hi: "कुल उपलब्ध दिन",
  ar: "إجمالي الأيام المتاحة",
  zh: "总可用天数",
  ja: "利用可能日数合計",
  bn: "মোট উপলব্ধ দিন"
},
days: {
  en: "days",
  kn: "ದಿನಗಳು",
  fr: "jours",
  de: "Tage",
  it: "giorni",
  pt: "dias",
  hi: "दिन",
  ar: "أيام",
  zh: "天",
  ja: "日",
  bn: "দিন"
},
scheduleExceptions: {
  en: "Schedule Exceptions",
  kn: "ವೇಳಾಪಟ್ಟಿ ಅಪವಾದಗಳು",
  fr: "Exceptions d'Horaire",
  de: "Ausnahmen im Zeitplan",
  it: "Eccezioni di Orario",
  pt: "Exceções de Horário",
  hi: "अनुसूची अपवाद",
  ar: "استثناءات الجدول",
  zh: "日程例外",
  ja: "スケジュール例外",
  bn: "সময়সূচী ব্যতিক্রম"
},
exceptions: {
  en: "exception(s)",
  kn: "ಅಪವಾದ(ಗಳು)",
  fr: "exception(s)",
  de: "Ausnahme(n)",
  it: "eccezione(i)",
  pt: "exceção(ões)",
  hi: "अपवाद",
  ar: "استثناء(ات)",
  zh: "例外",
  ja: "例外",
  bn: "ব্যতিক্রম(সমূহ)"
},
on_demand: {
  en: "ON DEMAND",
  kn: "ಬೇಡಿಕೆಯ ಮೇರೆಗೆ",
  fr: "SUR DEMANDE",
  de: "AUF ANFRAGE",
  it: "SU RICHIESTA",
  pt: "SOB DEMANDA",
  hi: "मांग पर",
  ar: "عند الطلب",
  zh: "按需",
  ja: "オンデマンド",
  bn: "চাহিদা সাপেক্ষে"
},
availableOnDemand: {
  en: "Available on demand at different time",
  kn: "ವಿಭಿನ್ನ ಸಮಯದಲ್ಲಿ ಬೇಡಿಕೆಯ ಮೇರೆಗೆ ಲಭ್ಯವಿದೆ",
  fr: "Disponible sur demande à un horaire différent",
  de: "Auf Anfrage zu einer anderen Zeit verfügbar",
  it: "Disponibile su richiesta in orario diverso",
  pt: "Disponível sob demanda em horário diferente",
  hi: "अलग समय पर मांग पर उपलब्ध",
  ar: "متاح عند الطلب في وقت مختلف",
  zh: "可在不同时间按需提供",
  ja: "別の時間にオンデマンドで利用可能",
  bn: "ভিন্ন সময়ে চাহিদা সাপেক্ষে উপলব্ধ"
},
notAvailableAtPreferredTime: {
  en: "Not available at preferred time",
  kn: "ಆದ್ಯತೆಯ ಸಮಯದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ",
  fr: "Non disponible à l'heure préférée",
  de: "Nicht zur bevorzugten Zeit verfügbar",
  it: "Non disponibile all'orario preferito",
  pt: "Não disponível no horário preferido",
  hi: "पसंदीदा समय पर उपलब्ध नहीं",
  ar: "غير متاح في الوقت المفضل",
  zh: "首选时间不可用",
  ja: "希望時間には利用できません",
  bn: "পছন্দের সময়ে উপলব্ধ নয়"
},
suggestedTime: {
  en: "Suggested time",
  kn: "ಸೂಚಿಸಿದ ಸಮಯ",
  fr: "Heure suggérée",
  de: "Vorgeschlagene Zeit",
  it: "Orario suggerito",
  pt: "Horário sugerido",
  hi: "सुझाया गया समय",
  ar: "الوقت المقترح",
  zh: "建议时间",
  ja: "推奨時間",
  bn: "প্রস্তাবিত সময়"
},
scheduleExceptionsInfo: {
  en: "These dates have different availability. You can still book for these dates, but the timing might vary.",
  kn: "ಈ ದಿನಾಂಕಗಳು ವಿಭಿನ್ನ ಲಭ್ಯತೆಯನ್ನು ಹೊಂದಿವೆ. ನೀವು ಇನ್ನೂ ಈ ದಿನಾಂಕಗಳಿಗಾಗಿ ಬುಕ್ ಮಾಡಬಹುದು, ಆದರೆ ಸಮಯ ಬದಲಾಗಬಹುದು.",
  fr: "Ces dates ont une disponibilité différente. Vous pouvez toujours réserver pour ces dates, mais l'horaire peut varier.",
  de: "Diese Daten haben eine andere Verfügbarkeit. Sie können diese Daten weiterhin buchen, aber die Zeiten können abweichen.",
  it: "Queste date hanno disponibilità diversa. Puoi comunque prenotare per queste date, ma gli orari potrebbero variare.",
  pt: "Estas datas têm disponibilidade diferente. Você ainda pode reservar para estas datas, mas o horário pode variar.",
  hi: "इन तारीखों में अलग उपलब्धता है। आप अभी भी इन तारीखों के लिए बुक कर सकते हैं, लेकिन समय भिन्न हो सकता है।",
  ar: "هذه التواريخ لها توفر مختلف. لا يزال بإمكانك الحجز لهذه التواريخ، لكن التوقيت قد يختلف.",
  zh: "这些日期有不同的可用性。您仍然可以预订这些日期，但时间可能会有所不同。",
  ja: "これらの日付は空き状況が異なります。これらの日付を予約することはできますが、時間が異なる場合があります。",
  bn: "এই তারিখগুলিতে ভিন্ন উপলব্ধতা রয়েছে। আপনি এখনও এই তারিখগুলির জন্য বুক করতে পারেন, তবে সময় পরিবর্তিত হতে পারে।"
},
perfectAvailability: {
  en: "Perfect Availability!",
  kn: "ಪರಿಪೂರ್ಣ ಲಭ್ಯತೆ!",
  fr: "Disponibilité Parfaite !",
  de: "Perfekte Verfügbarkeit!",
  it: "Disponibilità Perfetta!",
  pt: "Disponibilidade Perfeita!",
  hi: "संपूर्ण उपलब्धता!",
  ar: "توفر مثالي!",
  zh: "完美可用性！",
  ja: "完璧な空き状況！",
  bn: "নিখুঁত উপলব্ধতা!"
},
perfectAvailabilityDescription: {
  en: "This provider is fully available at their preferred time for the entire month. No schedule conflicts or exceptions.",
  kn: "ಈ ಪ್ರದಾತಾ ಇಡೀ ತಿಂಗಳು ತಮ್ಮ ಆದ್ಯತೆಯ ಸಮಯದಲ್ಲಿ ಸಂಪೂರ್ಣವಾಗಿ ಲಭ್ಯವಿದೆ. ಯಾವುದೇ ವೇಳಾಪಟ್ಟಿ ಸಂಘರ್ಷಗಳು ಅಥವಾ ಅಪವಾದಗಳಿಲ್ಲ.",
  fr: "Ce prestataire est entièrement disponible à son heure préférée pour tout le mois. Aucun conflit d'horaire ni exception.",
  de: "Dieser Anbieter ist den ganzen Monat zu seiner bevorzugten Zeit voll verfügbar. Keine Terminkonflikte oder Ausnahmen.",
  it: "Questo fornitore è completamente disponibile all'orario preferito per l'intero mese. Nessun conflitto di orario o eccezioni.",
  pt: "Este prestador está totalmente disponível no seu horário preferido durante todo o mês. Sem conflitos de horário ou exceções.",
  hi: "यह प्रदाता पूरे महीने अपने पसंदीदा समय पर पूरी तरह उपलब्ध है। कोई कार्यक्रम विरोध या अपवाद नहीं।",
  ar: "هذا المقدم متاح بالكامل في الوقت المفضل له طوال الشهر. لا توجد تعارضات في الجدول أو استثناءات.",
  zh: "该服务提供者在整个月的首选时间完全可用。没有日程冲突或例外。",
  ja: "このプロバイダーは、月を通して希望の時間に完全に利用可能です。スケジュールの競合や例外はありません。",
  bn: "এই প্রদানকারী পুরো মাস জুড়ে তাদের পছন্দের সময়ে সম্পূর্ণ উপলব্ধ। কোন সময়সূচী দ্বন্দ্ব বা ব্যতিক্রম নেই।"
},
whyNotBestMatch: {
  en: "Why this isn't a Best Match?",
  kn: "ಇದು ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ ಏಕೆ ಅಲ್ಲ?",
  fr: "Pourquoi ce n'est pas une Meilleure Correspondance ?",
  de: "Warum ist das keine beste Übereinstimmung?",
  it: "Perché questa non è una Miglior Corrispondenza?",
  pt: "Por que isso não é uma Melhor Correspondência?",
  hi: "यह सर्वोत्तम मिलान क्यों नहीं है?",
  ar: "لماذا هذا ليس أفضل تطابق؟",
  zh: "为什么这不是最佳匹配？",
  ja: "なぜこれがベストマッチではないのですか？",
  bn: "কেন এটি সেরা মিল নয়?"
},
whyNotBestMatchDescription: {
  en: "This provider has some schedule variations during the month which prevents them from being marked as a 'Best Match'. However, they're still highly available and can accommodate your needs on most days.",
  kn: "ಈ ಪ್ರದಾತಾ ತಿಂಗಳಿನಲ್ಲಿ ಕೆಲವು ವೇಳಾಪಟ್ಟಿ ವ್ಯತ್ಯಾಸಗಳನ್ನು ಹೊಂದಿದ್ದು, ಅವುಗಳನ್ನು 'ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆ' ಎಂದು ಗುರುತಿಸುವುದನ್ನು ತಡೆಯುತ್ತದೆ. ಆದಾಗ್ಯೂ, ಅವರು ಇನ್ನೂ ಹೆಚ್ಚು ಲಭ್ಯವಿದ್ದಾರೆ ಮತ್ತು ಹೆಚ್ಚಿನ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಅಗತ್ಯಗಳನ್ನು ಪೂರೈಸಬಹುದು.",
  fr: "Ce prestataire a des variations d'horaires pendant le mois qui l'empêchent d'être marqué comme 'Meilleure Correspondance'. Cependant, il est toujours très disponible et peut répondre à vos besoins la plupart des jours.",
  de: "Dieser Anbieter hat einige Terminabweichungen während des Monats, die verhindern, dass er als 'Beste Übereinstimmung' markiert wird. Er ist jedoch immer noch sehr verfügbar und kann an den meisten Tagen Ihre Bedürfnisse erfüllen.",
  it: "Questo fornitore ha alcune variazioni di orario durante il mese che gli impediscono di essere contrassegnato come 'Miglior Corrispondenza'. Tuttavia, è ancora molto disponibile e può soddisfare le tue esigenze nella maggior parte dei giorni.",
  pt: "Este prestador tem algumas variações de horário durante o mês que o impedem de ser marcado como 'Melhor Correspondência'. No entanto, eles ainda estão altamente disponíveis e podem atender às suas necessidades na maioria dos dias.",
  hi: "इस प्रदाता के पास महीने के दौरान कुछ कार्यक्रम भिन्नताएं हैं जो उन्हें 'सर्वोत्तम मिलान' के रूप में चिह्नित होने से रोकती हैं। हालाँकि, वे अभी भी अत्यधिक उपलब्ध हैं और अधिकांश दिनों में आपकी आवश्यकताओं को पूरा कर सकते हैं।",
  ar: "هذا المقدم لديه بعض الاختلافات في الجدول خلال الشهر مما يمنع وضع علامة عليه كـ 'أفضل تطابق'. ومع ذلك، لا يزالون متاحين بشكل كبير ويمكنهم تلبية احتياجاتك في معظم الأيام.",
  zh: "该服务提供者在当月有一些日程变化，因此无法被标记为“最佳匹配”。但是，他们仍然高度可用，并且可以在大多数日子满足您的需求。",
  ja: "このプロバイダーには月内にスケジュールの変動があり、「ベストマッチ」としてマークできません。ただし、ほとんどの日は利用可能であり、お客様のニーズに対応できます。",
  bn: "এই প্রদানকারীর মাসের মধ্যে কিছু সময়সূচী পরিবর্তন রয়েছে যা তাদের 'সেরা মিল' হিসাবে চিহ্নিত হতে বাধা দেয়। তবে, তারা এখনও অত্যন্ত উপলব্ধ এবং অধিকাংশ দিনে আপনার চাহিদা পূরণ করতে পারে।"
},

// Add these to your translations object in LanguageContext.tsx
timeRangeWarning: {
  en: "The time range must be at least 4 hours.",
  kn: "ಸಮಯದ ವ್ಯಾಪ್ತಿಯು ಕನಿಷ್ಠ 4 ಗಂಟೆಗಳಿರಬೇಕು.",
  fr: "La plage horaire doit être d'au moins 4 heures.",
  de: "Der Zeitbereich muss mindestens 4 Stunden betragen.",
  it: "L'intervallo di tempo deve essere di almeno 4 ore.",
  pt: "O intervalo de tempo deve ser de pelo menos 4 horas.",
  hi: "समय सीमा कम से कम 4 घंटे की होनी चाहिए।",
  ar: "يجب أن يكون النطاق الزمني 4 ساعات على الأقل.",
  zh: "时间范围必须至少为4小时。",
  ja: "時間範囲は少なくとも4時間必要です。",
  bn: "সময়সীমা কমপক্ষে ৪ ঘন্টা হতে হবে।"
},
available: {
  en: "Available",
  kn: "ಲಭ್ಯವಿದೆ",
  fr: "Disponible",
  de: "Verfügbar",
  it: "Disponibile",
  pt: "Disponível",
  hi: "उपलब्ध",
  ar: "متاح",
  zh: "可用",
  ja: "利用可能",
  bn: "উপলব্ধ"
},
availabilityNotSpecified: {
  en: "Availability not specified",
  kn: "ಲಭ್ಯತೆಯನ್ನು ನಿರ್ದಿಷ್ಟಪಡಿಸಲಾಗಿಲ್ಲ",
  fr: "Disponibilité non spécifiée",
  de: "Verfügbarkeit nicht angegeben",
  it: "Disponibilità non specificata",
  pt: "Disponibilidade não especificada",
  hi: "उपलब्धता निर्दिष्ट नहीं है",
  ar: "التوفر غير محدد",
  zh: "未指定可用性",
  ja: "空き状況が指定されていません",
  bn: "উপলব্ধতা নির্দিষ্ট করা হয়নি"
},
availableAt: {
  en: "Available at",
  kn: "ಇಲ್ಲಿ ಲಭ್ಯವಿದೆ",
  fr: "Disponible à",
  de: "Verfügbar um",
  it: "Disponibile alle",
  pt: "Disponível às",
  hi: "उपलब्ध समय",
  ar: "متاح في",
  zh: "可用时间",
  ja: "利用可能時間",
  bn: "উপলব্ধ সময়"
},
veryLimitedAvailability: {
  en: "Very limited availability",
  kn: "ಬಹಳ ಸೀಮಿತ ಲಭ್ಯತೆ",
  fr: "Disponibilité très limitée",
  de: "Sehr begrenzte Verfügbarkeit",
  it: "Disponibilità molto limitata",
  pt: "Disponibilidade muito limitada",
  hi: "बहुत सीमित उपलब्धता",
  ar: "توفر محدود للغاية",
  zh: "可用性非常有限",
  ja: "非常に限られた空き状況",
  bn: "খুব সীমিত উপলব্ধতা"
},
limitedAvailability: {
  en: "Limited availability this month",
  kn: "ಈ ತಿಂಗಳು ಸೀಮಿತ ಲಭ್ಯತೆ",
  fr: "Disponibilité limitée ce mois-ci",
  de: "Begrenzte Verfügbarkeit in diesem Monat",
  it: "Disponibilità limitata questo mese",
  pt: "Disponibilidade limitada este mês",
  hi: "इस महीने सीमित उपलब्धता",
  ar: "توفر محدود هذا الشهر",
  zh: "本月可用性有限",
  ja: "今月は空き状況が限られています",
  bn: "এই মাসে সীমিত উপলব্ধতা"
},
usuallyAvailableAt: {
  en: "Usually available at",
  kn: "ಸಾಮಾನ್ಯವಾಗಿ ಇಲ್ಲಿ ಲಭ್ಯವಿದೆ",
  fr: "Généralement disponible à",
  de: "Normalerweise verfügbar um",
  it: "Di solito disponibile alle",
  pt: "Geralmente disponível às",
  hi: "आमतौर पर उपलब्ध समय",
  ar: "عادة متاح في",
  zh: "通常可用时间",
  ja: "通常の利用可能時間",
  bn: "সাধারণত উপলব্ধ সময়"
},
english: {
  en: "English",
  kn: "ಆಂಗ್ಲ",
  fr: "Anglais",
  de: "Englisch",
  it: "Inglese",
  pt: "Inglês",
  hi: "अंग्रेज़ी",
  ar: "الإنجليزية",
  zh: "英语",
  ja: "英語",
  bn: "ইংরেজি"
},
nearby: {
  en: "Nearby",
  kn: "ಹತ್ತಿರದ",
  fr: "À proximité",
  de: "In der Nähe",
  it: "Vicino",
  pt: "Próximo",
  hi: "आस-पास",
  ar: "قريب",
  zh: "附近",
  ja: "近く",
  bn: "কাছাকাছি"
},
availability: {
  en: "Availability",
  kn: "ಲಭ್ಯತೆ",
  fr: "Disponibilité",
  de: "Verfügbarkeit",
  it: "Disponibilità",
  pt: "Disponibilidade",
  hi: "उपलब्धता",
  ar: "التوفر",
  zh: "可用性",
  ja: "空き状況",
  bn: "উপলব্ধতা"
},
monthly: {
  en: "Monthly",
  kn: "ಮಾಸಿಕ",
  fr: "Mensuel",
  de: "Monatlich",
  it: "Mensile",
  pt: "Mensal",
  hi: "मासिक",
  ar: "شهري",
  zh: "月度",
  ja: "月額",
  bn: "মাসিক"
},
shortTerm: {
  en: "Short Term",
  kn: "ಅಲ್ಪಾವಧಿ",
  fr: "Court Terme",
  de: "Kurzfristig",
  it: "Breve Termine",
  pt: "Curto Prazo",
  hi: "अल्पकालिक",
  ar: "قصير الأجل",
  zh: "短期",
  ja: "短期",
  bn: "স্বল্পমেয়াদী"
},
scheduleExceptionsCount: {
  en: "schedule exception(s) this month",
  kn: "ಈ ತಿಂಗಳು ವೇಳಾಪಟ್ಟಿ ಅಪವಾದ(ಗಳು)",
  fr: "exception(s) d'horaire ce mois-ci",
  de: "Zeitplanausnahme(n) diesen Monat",
  it: "eccezione(i) di orario questo mese",
  pt: "exceção(ões) de horário este mês",
  hi: "इस महीने अनुसूची अपवाद",
  ar: "استثناء(ات) الجدول هذا الشهر",
  zh: "本月日程例外",
  ja: "今月のスケジュール例外",
  bn: "এই মাসে সময়সূচী ব্যতিক্রম(সমূহ)"
},
fullyAvailableAllMonth: {
  en: "Fully available all month",
  kn: "ಇಡೀ ತಿಂಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಲಭ್ಯವಿದೆ",
  fr: "Entièrement disponible tout le mois",
  de: "Den ganzen Monat voll verfügbar",
  it: "Completamente disponibile tutto il mese",
  pt: "Totalmente disponível o mês todo",
  hi: "पूरे महीने पूरी तरह उपलब्ध",
  ar: "متاح بالكامل طوال الشهر",
  zh: "整月完全可用",
  ja: "月を通して完全に利用可能",
  bn: "সারা মাস সম্পূর্ণ উপলব্ধ"
},
partiallyAvailableMonth: {
  en: "Partially available this month",
  kn: "ಈ ತಿಂಗಳು ಭಾಗಶಃ ಲಭ್ಯವಿದೆ",
  fr: "Partiellement disponible ce mois-ci",
  de: "Teilweise verfügbar diesen Monat",
  it: "Parzialmente disponibile questo mese",
  pt: "Parcialmente disponível este mês",
  hi: "इस महीने आंशिक रूप से उपलब्ध",
  ar: "متاح جزئيًا هذا الشهر",
  zh: "本月部分可用",
  ja: "今月は部分的に利用可能",
  bn: "এই মাসে আংশিকভাবে উপলব্ধ"
},
additionalServices: {
  en: "Additional Services",
  kn: "ಹೆಚ್ಚುವರಿ ಸೇವೆಗಳು",
  fr: "Services Supplémentaires",
  de: "Zusätzliche Dienstleistungen",
  it: "Servizi Aggiuntivi",
  pt: "Serviços Adicionais",
  hi: "अतिरिक्त सेवाएं",
  ar: "خدمات إضافية",
  zh: "附加服务",
  ja: "追加サービス",
  bn: "অতিরিক্ত সেবা"
},
kmAway: {
  en: "km away",
  kn: "ಕಿ.ಮೀ. ದೂರದಲ್ಲಿ",
  fr: "km de distance",
  de: "km entfernt",
  it: "km di distanza",
  pt: "km de distância",
  hi: "किमी दूर",
  ar: "كم بعيدًا",
  zh: "公里远",
  ja: "km先",
  bn: "কিমি দূরে"
},
yrsExperience: {
  en: "yrs experience",
  kn: "ವರ್ಷಗಳ ಅನುಭವ",
  fr: "années d'expérience",
  de: "Jahre Erfahrung",
  it: "anni di esperienza",
  pt: "anos de experiência",
  hi: "वर्षों का अनुभव",
  ar: "سنوات خبرة",
  zh: "年经验",
  ja: "年の経験",
  bn: "বছরের অভিজ্ঞতা"
},
details: {
  en: "Details",
  kn: "ವಿವರಗಳು",
  fr: "Détails",
  de: "Details",
  it: "Dettagli",
  pt: "Detalhes",
  hi: "विवरण",
  ar: "التفاصيل",
  zh: "详情",
  ja: "詳細",
  bn: "বিবরণ"
},
viewDetails: {
  en: "View Details",
  kn: "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
  fr: "Voir Détails",
  de: "Details anzeigen",
  it: "Visualizza Dettagli",
  pt: "Ver Detalhes",
  hi: "विवरण देखें",
  ar: "عرض التفاصيل",
  zh: "查看详情",
  ja: "詳細を見る",
  bn: "বিবরণ দেখুন"
},
book: {
  en: "Book",
  kn: "ಬುಕ್ ಮಾಡಿ",
  fr: "Réserver",
  de: "Buchen",
  it: "Prenota",
  pt: "Reservar",
  hi: "बुक करें",
  ar: "احجز",
  zh: "预订",
  ja: "予約",
  bn: "বুক করুন"
},
bookNow: {
  en: "Book Now",
  kn: "ಈಗಲೇ ಬುಕ್ ಮಾಡಿ",
  fr: "Réserver Maintenant",
  de: "Jetzt Buchen",
  it: "Prenota Ora",
  pt: "Reservar Agora",
  hi: "अभी बुक करें",
  ar: "احجز الآن",
  zh: "立即预订",
  ja: "今すぐ予約",
  bn: "এখনই বুক করুন"
},
  // Add language names in their native language
  en: {
    en: "English",
    kn: "ಆಂಗ್ಲ",
    fr: "Anglais",
    de: "Englisch",
    it: "Inglese",
    pt: "Inglês",
    hi: "अंग्रेज़ी",
    ar: "الإنجليزية",
    zh: "英语",
    ja: "英語",
    bn: "ইংরেজি"
  },
  kn: {
    en: "Kannada",
    kn: "ಕನ್ನಡ",
    fr: "Kannada",
    de: "Kannada",
    it: "Kannada",
    pt: "Kannada",
    hi: "कन्नड़",
    ar: "الكانادا",
    zh: "卡纳达语",
    ja: "カンナダ語",
    bn: "কন্নড়"
  },
  fr: {
    en: "French",
    kn: "ಫ್ರೆಂಚ್",
    fr: "Français",
    de: "Französisch",
    it: "Francese",
    pt: "Francês",
    hi: "फ़्रेंच",
    ar: "الفرنسية",
    zh: "法语",
    ja: "フランス語",
    bn: "ফরাসি"
  },
  de: {
    en: "German",
    kn: "ಜರ್ಮನ್",
    fr: "Allemand",
    de: "Deutsch",
    it: "Tedesco",
    pt: "Alemão",
    hi: "जर्मन",
    ar: "الألمانية",
    zh: "德语",
    ja: "ドイツ語",
    bn: "জার্মান"
  },
  it: {
    en: "Italian",
    kn: "ಇಟಾಲಿಯನ್",
    fr: "Italien",
    de: "Italienisch",
    it: "Italiano",
    pt: "Italiano",
    hi: "इतालवी",
    ar: "الإيطالية",
    zh: "意大利语",
    ja: "イタリア語",
    bn: "ইতালিয়ান"
  },
  pt: {
    en: "Portuguese",
    kn: "ಪೋರ್ಚುಗೀಸ್",
    fr: "Portugais",
    de: "Portugiesisch",
    it: "Portoghese",
    pt: "Português",
    hi: "पुर्तगाली",
    ar: "البرتغالية",
    zh: "葡萄牙语",
    ja: "ポルトガル語",
    bn: "পর্তুগিজ"
  },
  hi: {
    en: "Hindi",
    kn: "ಹಿಂದಿ",
    fr: "Hindi",
    de: "Hindi",
    it: "Hindi",
    pt: "Hindi",
    hi: "हिन्दी",
    ar: "الهندية",
    zh: "印地语",
    ja: "ヒンディー語",
    bn: "হিন্দি"
  },
  ar: {
    en: "Arabic",
    kn: "ಅರೇಬಿಕ್",
    fr: "Arabe",
    de: "Arabisch",
    it: "Arabo",
    pt: "Árabe",
    hi: "अरबी",
    ar: "العربية",
    zh: "阿拉伯语",
    ja: "アラビア語",
    bn: "আরবি"
  },
  zh: {
    en: "Chinese",
    kn: "ಚೈನೀಸ್",
    fr: "Chinois",
    de: "Chinesisch",
    it: "Cinese",
    pt: "Chinês",
    hi: "चीनी",
    ar: "الصينية",
    zh: "中文",
    ja: "中国語",
    bn: "চীনা"
  },
  ja: {
    en: "Japanese",
    kn: "ಜಪಾನೀಸ್",
    fr: "Japonais",
    de: "Japanisch",
    it: "Giapponese",
    pt: "Japonês",
    hi: "जापानी",
    ar: "اليابانية",
    zh: "日语",
    ja: "日本語",
    bn: "জাপানি"
  },
  bn: {
    en: "Bengali",
    kn: "ಬಂಗಾಳಿ",
    fr: "Bengali",
    de: "Bengalisch",
    it: "Bengalese",
    pt: "Bengali",
    hi: "बंगाली",
    ar: "البنغالية",
    zh: "孟加拉语",
    ja: "ベンガル語",
    bn: "বাংলা"
  }
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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
    // Check if savedLanguage exists and is a valid Language
    if (savedLanguage && ['en', 'kn', 'fr', 'de', 'it', 'pt', 'hi', 'ar', 'zh', 'ja', 'bn'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const t = (key: string): string => {
    if (translations[key] && translations[key][currentLanguage]) {
      return translations[key][currentLanguage];
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