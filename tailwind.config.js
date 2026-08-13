/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          accent: "#193f79",
          accentSoft: "#e8f1ff",
          accentDark: "#0848b0",
          logoLight: "#246097",
          logoDark: "#0b375f",
          bookingNavy: "#0c1e3d",
          bookingSky: "#4f8ff7",
          skyCta: "#0ea5e9",
          text: "#0f172a",
          textMuted: "#64748b",
          line: "#e2e8f0",
          canvas: "#f1f5f9",
          surface: "#ffffff",
          chromeStart: "#020617",
          chromeMid: "#0b2a5c",
          chromeEnd: "#082f49",
          headerTint: "#c8e4ff",
          footerTint: "#b8dbfc",
        },
        m3: {
          primary: "#001630",
          primaryContainer: "#0d2b4d",
          onPrimary: "#ffffff",
          onPrimaryContainer: "#7993bb",
          secondary: "#335baf",
          secondaryContainer: "#82a6ff",
          onSecondary: "#ffffff",
          onSecondaryContainer: "#00388b",
          surface: "#f7f9fb",
          surfaceContainerLowest: "#ffffff",
          surfaceContainerLow: "#f2f4f6",
          onSurface: "#191c1e",
          onSurfaceVariant: "#43474e",
          error: "#ba1a1a",
        }
      },
      backgroundImage: {
        'gradient-chrome': 'linear-gradient(to right, #020617, #0b2a5c, #082f49)',
        'gradient-booking-header': 'linear-gradient(to right, #0c1e3d, #193f79, #4f8ff7)',
        'gradient-hero': 'linear-gradient(to right, #0c1e3d, #193f79, #4f8ff7)',
        'gradient-primary-btn': 'linear-gradient(135deg, #193f79, #2563eb)',
      }
    },
  },
  plugins: [],
}