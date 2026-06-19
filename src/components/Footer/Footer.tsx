/* eslint-disable */
import React, { useEffect, useState } from "react";
import {
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaXTwitter,
  FaPhone,
} from "react-icons/fa6";
import { publicAsset } from "src/utils/publicAsset";
import {
  DEFAULT_FOOTER_SETTINGS,
  FOOTER_SOCIAL_ORDER,
  FooterSettings,
  FooterSocialKey,
  fetchPublicFooterSettings,
  formatPhoneDisplay,
} from "src/services/footerSettingsApi";

interface FooterProps {
  onAboutClick: () => void;
  onContactClick: () => void;
  onPrivacyPolicyClick: () => void;
  onTermsClick: () => void;
}

const SOCIAL_ICONS: Record<FooterSocialKey, typeof FaXTwitter> = {
  x: FaXTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  facebook: FaFacebook,
};

const SOCIAL_LABELS: Record<FooterSocialKey, string> = {
  x: "X (Twitter)",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  facebook: "Facebook",
};

const Footer: React.FC<FooterProps> = ({ onTermsClick }) => {
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);

  useEffect(() => {
    let active = true;
    void fetchPublicFooterSettings().then((settings) => {
      if (active) setFooterSettings(settings);
    });
    return () => {
      active = false;
    };
  }, []);

  const helplineLabel = formatPhoneDisplay(footerSettings.helplinePhone);
  const joinUsLabel = formatPhoneDisplay(footerSettings.joinUsPhone);

  return (
    <footer className="relative mt-auto w-full overflow-hidden border-t border-[#c4c6cf]/60 bg-[#f2f4f6] text-[#191c1e]">
      <div className="mx-auto w-full max-w-lg px-5 py-6 sm:max-w-2xl sm:px-6 sm:py-8">
        <div className="w-full rounded-2xl border border-[#c4c6cf] bg-white px-4 py-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#c4c6cf] bg-[#dae2ff]">
              <img
                src={publicAsset("ServEaso_Logo.png")}
                alt=""
                className="h-10 w-10 rounded-full object-contain"
              />
            </div>
            <p className="text-xl font-extrabold tracking-tight text-[#191c1e]">ServeEaso</p>
            <p className="mt-1 text-sm font-medium text-[#43474e]">Trusted home services</p>
          </div>

          <div className="my-5 h-px bg-[#c4c6cf]/80" />

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#43474e]">
            Contact us
          </p>
          <div className="grid w-full gap-2.5 sm:grid-cols-2">
            <a
              href={`tel:${footerSettings.helplinePhone}`}
              className="flex items-center gap-3 rounded-[14px] border border-[#c4c6cf] bg-[#dae2ff]/55 px-3 py-3 transition hover:bg-[#dae2ff]/80"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#335baf]">
                <FaPhone className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#43474e]">
                  Helpline
                </span>
                <span className="block truncate text-sm font-semibold text-[#191c1e]">
                  {helplineLabel}
                </span>
              </span>
            </a>
            <a
              href={`tel:${footerSettings.joinUsPhone}`}
              className="flex items-center gap-3 rounded-[14px] border border-[#c4c6cf] bg-[#dae2ff]/55 px-3 py-3 transition hover:bg-[#dae2ff]/80"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#335baf]">
                <FaPhone className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#43474e]">
                  Join us
                </span>
                <span className="block truncate text-sm font-semibold text-[#191c1e]">
                  {joinUsLabel}
                </span>
              </span>
            </a>
          </div>

          <div className="my-5 h-px bg-[#c4c6cf]/80" />

          <div className="flex w-full flex-col items-center gap-3">
            <p className="w-full text-xs font-semibold uppercase tracking-[0.08em] text-[#43474e]">
              Follow us
            </p>
            <div className="flex w-full flex-wrap items-center justify-center gap-2">
              {FOOTER_SOCIAL_ORDER.map((key) => {
                const href = footerSettings.social[key];
                if (!href) return null;
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[key]}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c4c6cf] bg-[#dae2ff]/70 text-[#124296] transition hover:bg-[#dae2ff]"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onTermsClick}
            className="mx-auto mt-5 block text-sm font-semibold text-[#335baf] underline underline-offset-2 transition hover:text-[#124296]"
          >
            Terms &amp; Conditions
          </button>
        </div>

        <div className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#001630] to-[#0d2b4d] px-4 py-3 text-center">
          <p className="text-xs font-semibold tracking-wide text-[#7993bb]">
            ServeEaso — home help you can trust
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
