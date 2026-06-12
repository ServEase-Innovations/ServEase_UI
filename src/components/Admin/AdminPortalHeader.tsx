import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe, LogIn, UserPlus } from "lucide-react";
import { useMediaQuery } from "@mui/material";
import { publicAsset } from "src/utils/publicAsset";
import { CHROME_BAR_GRADIENT, CHROME_BAR_SHADOW } from "src/Constants/chromeBar";
import { useLanguage, type Language } from "src/context/LanguageContext";

type AdminView = "register" | "login";

type AdminPortalHeaderProps = {
  view: AdminView;
  onViewChange: (view: AdminView) => void;
};

export function AdminPortalHeader({ view, onViewChange }: AdminPortalHeaderProps) {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width:768px)");
  const languages: Language[] = ["en", "hi", "kn", "bn"];

  useEffect(() => {
    if (!isLanguageMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const node = languageMenuRef.current;
      if (node && !node.contains(e.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLanguageMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isLanguageMenuOpen]);

  const tabClass = (active: boolean) =>
    [
      "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950",
      active
        ? "bg-white/15 text-white ring-1 ring-white/25"
        : "text-white/85 hover:bg-white/12 hover:text-white",
    ].join(" ");

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 overflow-visible border-b border-white/10 pt-[env(safe-area-inset-top,0px)] ${CHROME_BAR_GRADIENT} ${CHROME_BAR_SHADOW}`}
    >
      <div className="relative mx-auto flex h-11 max-w-[90rem] items-center justify-between gap-2 overflow-visible px-2 py-0 sm:h-12 sm:gap-3 sm:px-3 md:h-14 md:px-5 lg:px-7">
        <div className="relative flex h-full min-w-0 shrink-0 items-center">
          <div className="relative h-full min-w-0 w-[5.25rem] max-w-full sm:min-w-[10.75rem] sm:w-[11.75rem] md:min-w-[13.5rem] md:w-[15rem] lg:min-w-[15.5rem] lg:w-[17.25rem] xl:min-w-[17.5rem] xl:w-[19.25rem]">
            <div
              className="absolute left-0 top-1/2 z-20 flex -translate-y-1/2 items-center"
              aria-label="ServEaso admin"
            >
              <img
                src={publicAsset("ServEaso_Logo.png")}
                alt=""
                className="h-11 w-auto max-w-[5.25rem] object-contain object-left opacity-95 sm:h-[4.75rem] sm:max-w-[14rem] md:h-24 md:max-w-[17rem] lg:h-28 lg:max-w-[19rem] xl:h-32 xl:max-w-[21rem]"
              />
            </div>
          </div>
        </div>

        <p className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.14em] text-white/50 md:block">
          Admin Portal
        </p>

        <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-2 md:gap-3">
          <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Admin sign-in options">
            <button
              type="button"
              onClick={() => onViewChange("register")}
              className={tabClass(view === "register")}
            >
              <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {!isMobile && <span>Register</span>}
            </button>
            <button
              type="button"
              onClick={() => onViewChange("login")}
              className={tabClass(view === "login")}
            >
              <LogIn className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {!isMobile && <span>Login</span>}
            </button>
          </nav>

          <div ref={languageMenuRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isLanguageMenuOpen}
              onClick={() => setIsLanguageMenuOpen((open) => !open)}
              className={`flex h-8 shrink-0 items-center rounded-md border border-white/25 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition sm:h-9 ${
                isMobile ? "w-8 justify-center px-0" : "gap-1.5 px-1.5 sm:gap-2 sm:px-2 md:px-2.5"
              } ${
                isLanguageMenuOpen
                  ? "bg-white/15 ring-2 ring-white/35 ring-offset-0"
                  : "hover:bg-white/12"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-sky-200 sm:h-7 sm:w-7">
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
              </span>
              {!isMobile && (
                <>
                  <span className="text-[10px] font-bold tabular-nums tracking-wide sm:text-xs">
                    {currentLanguage.toUpperCase()}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-white/70 transition-transform sm:h-4 sm:w-4 ${
                      isLanguageMenuOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </>
              )}
            </button>

            {isLanguageMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-[100] mt-1.5 min-w-[min(calc(100vw-2rem),13.5rem)] max-w-[min(92vw,17rem)] overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 py-0 text-slate-800 shadow-lg shadow-slate-900/15 ring-1 ring-slate-900/[0.04] backdrop-blur-md"
              >
                <div className="border-b border-slate-100 px-2 py-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {t("language")}
                  </p>
                </div>
                <div className="py-1">
                  {languages.map((lang) => {
                    const selected = currentLanguage === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLanguage(lang);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`group flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors focus-visible:outline-none ${
                          selected
                            ? "bg-sky-50/95 hover:bg-sky-50 focus-visible:bg-sky-50"
                            : "hover:bg-slate-50 focus-visible:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold uppercase tabular-nums shadow-sm ring-1 transition ${
                            selected
                              ? "bg-sky-600 text-white ring-sky-500/40"
                              : "bg-slate-100 text-slate-600 ring-slate-200/80 group-hover:bg-slate-200/70 group-hover:text-slate-800"
                          }`}
                        >
                          {lang}
                        </span>
                        <span className="min-w-0 flex-1 text-xs font-semibold leading-tight text-slate-900">
                          {t(lang)}
                        </span>
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                          {selected ? <Check className="h-4 w-4 text-sky-600" strokeWidth={2.5} /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
