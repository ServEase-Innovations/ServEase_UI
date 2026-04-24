/* ContactUs.tsx */
/* eslint-disable */
import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
import { useLanguage } from "src/context/LanguageContext";
import { CHROME_BAR_GRADIENT, CHROME_BAR_SHADOW } from "src/Constants/chromeBar";

interface ContactUsProps {
  onBack?: () => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const theme = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t("requestSubmitted"));
  };

  const handleBack = () => {
    onBack?.();
  };

  const benefits = [t("benefit1"), t("benefit2"), t("benefit3"), t("benefit4")];

  const socialLinks = [
    { href: "https://www.linkedin.com/in/serveaso-media-7b7719381/", icon: <FaLinkedin />, label: "LinkedIn" },
    { href: "https://www.facebook.com/profile.php?id=61572701168852", icon: <FaFacebook />, label: "Facebook" },
    { href: "https://www.instagram.com/serveaso?igsh=cHQxdmdubnZocjRn", icon: <FaInstagram />, label: "Instagram" },
    { href: "https://www.youtube.com/@ServEaso", icon: <FaYoutube />, label: "YouTube" },
    { href: "https://x.com/ServEaso", icon: <FaXTwitter />, label: "X" },
  ];

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100%",
        bgcolor: "grey.50",
        pb: { xs: 4, md: 6 },
      }}
    >
      <Box
        className={`${CHROME_BAR_GRADIENT} ${CHROME_BAR_SHADOW}`}
        sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Container maxWidth="lg" sx={{ py: 1.25 }}>
          <Button
            type="button"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: "rgba(255,255,255,0.95)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            {t("back")}
          </Button>
        </Container>
      </Box>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "common.white",
          py: { xs: 4, md: 6 },
          background: `linear-gradient(125deg, ${theme.palette.primary.dark} 0%, #0a3d5c 45%, ${theme.palette.primary.main} 78%, #0369a1 100%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 55% at 100% 0%, rgba(255,255,255,0.12), transparent 50%), radial-gradient(ellipse 55% 45% at 0% 100%, rgba(14,165,233,0.22), transparent 48%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: "0.2em", fontWeight: 700, opacity: 0.9, display: "block", mb: 1 }}
          >
            ServEaso
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
              lineHeight: 1.2,
            }}
          >
            {t("getInTouch")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              maxWidth: 640,
              opacity: 0.94,
              lineHeight: 1.7,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
            }}
          >
            {t("contactDescription")}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -2.5, md: -3.5 }, position: "relative", zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 4 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 24px 48px -24px rgba(15, 23, 42, 0.18)",
            bgcolor: "background.paper",
          }}
        >
          <Grid container spacing={{ xs: 3, md: 5 }}>
            <Grid item xs={12} md={7}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.25}>
                  <TextField
                    name="name"
                    label={t("name")}
                    placeholder={t("yourName")}
                    required
                    fullWidth
                    variant="outlined"
                    autoComplete="name"
                  />
                  <TextField
                    name="email"
                    type="email"
                    label={t("email")}
                    placeholder={t("enterEmail")}
                    required
                    fullWidth
                    variant="outlined"
                    autoComplete="email"
                  />
                  <TextField
                    name="message"
                    label={t("message")}
                    placeholder={t("enterMessage")}
                    required
                    fullWidth
                    multiline
                    minRows={4}
                    variant="outlined"
                  />

                  <FormControlLabel
                    required
                    control={<Checkbox color="primary" />}
                    label={
                      <Typography variant="body2" color="text.secondary" component="span">
                        {t("iAgreeWith")}{" "}
                        <Link
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          underline="hover"
                          sx={{ fontWeight: 600 }}
                        >
                          {t("termsAndConditions")}
                        </Link>
                      </Typography>
                    }
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      mt: 1,
                      py: 1.35,
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 55%, #0369a1 100%)",
                      boxShadow: "0 8px 22px -6px rgba(14, 165, 233, 0.45)",
                      "&:hover": {
                        boxShadow: "0 12px 28px -6px rgba(14, 165, 233, 0.5)",
                        background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0369a1 100%)",
                      },
                    }}
                  >
                    {t("sendRequest")}
                  </Button>
                </Stack>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
                {t("contactVia")}
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaPhone size={18} />
                  </Box>
                  <Link href="tel:918792827744" underline="hover" fontWeight={600} color="text.primary">
                    +91-8792827744
                  </Link>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaEnvelope size={18} />
                  </Box>
                  <Link href="mailto:support@serveaso.com" underline="hover" fontWeight={600} color="text.primary">
                    support@serveaso.com
                  </Link>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "success.main",
                      color: "success.contrastText",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaWhatsapp size={18} />
                  </Box>
                  <Link
                    href="https://wa.me/918792827744"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    fontWeight={600}
                    color="text.primary"
                  >
                    +91-8792827744
                  </Link>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  {t("withOurServices")}
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {benefits.map((line, i) => (
                    <Stack key={i} direction="row" spacing={1.25} alignItems="flex-start">
                      <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 22, mt: 0.1, flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                        {line}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  {t("followUs")}
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 1.5 }}>
                  {socialLinks.map(({ href, icon, label }) => (
                    <IconButton
                      key={label}
                      component="a"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        color: "text.secondary",
                        "&:hover": {
                          color: "primary.main",
                          borderColor: "primary.light",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      {icon}
                    </IconButton>
                  ))}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  {t("downloadApp")}
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                  <IconButton
                    component="a"
                    href="https://play.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Google Play"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      fontSize: 28,
                      color: "text.primary",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <FaGooglePlay />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="App Store"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      fontSize: 28,
                      color: "text.primary",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <FaAppStoreIos />
                  </IconButton>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default ContactUs;
