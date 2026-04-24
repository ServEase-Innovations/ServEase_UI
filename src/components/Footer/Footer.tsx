/* eslint-disable */
import React from "react";
import {
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaXTwitter,
} from "react-icons/fa6";
import { useLanguage } from "src/context/LanguageContext";
import { publicAsset } from "src/utils/publicAsset";
import { CHROME_BAR_GRADIENT, CHROME_BAR_SHADOW } from "src/Constants/chromeBar";

interface FooterProps {
  onAboutClick: () => void;
  onContactClick: () => void;
  onPrivacyPolicyClick: () => void;
  onTermsClick: () => void;
}

const socialLinks = [
  {
    href: "https://x.com/ServEaso",
    label: "X (Twitter)",
    icon: FaXTwitter,
    hoverClass: "hover:bg-white/18 hover:text-white",
  },
  {
    href: "https://www.instagram.com/serveaso?igsh=cHQxdmdubnZocjRn",
    label: "Instagram",
    icon: FaInstagram,
    hoverClass: "hover:bg-white/18 hover:text-pink-200",
  },
  {
    href: "https://www.linkedin.com/in/serveaso-media-7b7719381/",
    label: "LinkedIn",
    icon: FaLinkedin,
    hoverClass: "hover:bg-white/18 hover:text-sky-200",
  },
  {
    href: "https://www.youtube.com/@ServEaso",
    label: "YouTube",
    icon: FaYoutube,
    hoverClass: "hover:bg-white/18 hover:text-red-200",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61572701168852",
    label: "Facebook",
    icon: FaFacebook,
    hoverClass: "hover:bg-white/18 hover:text-sky-100",
  },
] as const;

const Footer: React.FC<FooterProps> = ({
  onAboutClick,
  onContactClick,
  onPrivacyPolicyClick,
  onTermsClick,
}) => {
  const { t } = useLanguage();

  const linkBase =
    "flex w-full items-center justify-start rounded-md px-0 py-1.5 text-left text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70";

  /* Shared min-height so column titles line up across the row (incl. wrapped labels). */
  const sectionTitle =
    "flex min-h-[2.75rem] w-full items-end text-left text-[11px] font-semibold uppercase leading-snug tracking-[0.12em] text-white/45 sm:min-h-[3rem]";

  return (
    <footer
      className={`relative mt-auto w-full overflow-hidden border-t border-white/10 text-slate-200 ${CHROME_BAR_GRADIENT} ${CHROME_BAR_SHADOW}`}
    >
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-10 lg:items-start">
          <div className="text-left lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <img
                src={publicAsset("ServEaso_Logo.png")}
                alt=""
                className="h-9 w-9 rounded-xl object-contain ring-1 ring-white/20 sm:h-10 sm:w-10"
              />
              <span className="text-lg font-semibold tracking-tight text-white">
                ServEaso
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              {t("description")}
            </p>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
              {t("footerFollowUs")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {socialLinks.map(({ href, label, icon: Icon, hoverClass }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition ${hoverClass}`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] items-start gap-x-6 gap-y-8 text-left md:grid-cols-[repeat(4,minmax(0,1fr))] md:gap-x-5 lg:col-span-8 lg:gap-x-6">
            <nav
              className="flex min-w-0 flex-col gap-1.5 items-stretch text-left"
              aria-label={t("footerSectionLegal")}
            >
              <h2 className={sectionTitle}>{t("footerSectionLegal")}</h2>
              <ul className="m-0 w-full list-none space-y-0.5 p-0">
                <li className="w-full">
                  <button type="button" onClick={onTermsClick} className={linkBase}>
                    {t("termsOfService")}
                  </button>
                </li>
                <li className="w-full">
                  <button
                    type="button"
                    onClick={onPrivacyPolicyClick}
                    className={linkBase}
                  >
                    {t("privacyPolicy")}
                  </button>
                </li>
              </ul>
            </nav>

            <nav
              className="flex min-w-0 flex-col gap-1.5 items-stretch text-left"
              aria-label={t("footerSectionResources")}
            >
              <h2 className={sectionTitle}>{t("footerSectionResources")}</h2>
              <ul className="m-0 w-full list-none space-y-0.5 p-0">
                <li className="w-full">
                  <a href="#!" className={linkBase}>
                    {t("tutorials")}
                  </a>
                </li>
                <li className="w-full">
                  <a href="#!" className={linkBase}>
                    {t("blog")}
                  </a>
                </li>
              </ul>
            </nav>

            <nav
              className="flex min-w-0 flex-col gap-1.5 items-stretch text-left"
              aria-label={t("footerSectionCompany")}
            >
              <h2 className={sectionTitle}>{t("footerSectionCompany")}</h2>
              <ul className="m-0 w-full list-none space-y-0.5 p-0">
                <li className="w-full">
                  <button type="button" onClick={onContactClick} className={linkBase}>
                    {t("contactUs")}
                  </button>
                </li>
                <li className="w-full">
                  <a href="#!" className={linkBase}>
                    {t("partners")}
                  </a>
                </li>
              </ul>
            </nav>

            <nav
              className="flex min-w-0 flex-col gap-1.5 items-stretch text-left"
              aria-label={t("footerSectionExplore")}
            >
              <h2 className={sectionTitle}>{t("footerSectionExplore")}</h2>
              <ul className="m-0 w-full list-none space-y-0.5 p-0">
                <li className="w-full">
                  <a href="#!" className={linkBase}>
                    {t("pricing")}
                  </a>
                </li>
                <li className="w-full">
                  <button type="button" onClick={onAboutClick} className={linkBase}>
                    {t("about")}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs leading-relaxed text-white/55">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
