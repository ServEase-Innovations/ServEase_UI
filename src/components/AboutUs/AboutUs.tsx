/* eslint-disable */
import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useLanguage } from "src/context/LanguageContext";
import { CHROME_BAR_GRADIENT, CHROME_BAR_SHADOW } from "src/Constants/chromeBar";

interface AboutUsProps {
  onBack: () => void;
}

const AboutUs = ({ onBack }: AboutUsProps) => {
  const { t } = useLanguage();
  const theme = useTheme();

  const challenges = [
    { title: t("highTurnover"), desc: t("highTurnoverDesc") },
    { title: t("skillsGap"), desc: t("skillsGapDesc") },
    { title: t("communicationBarriers"), desc: t("communicationBarriersDesc") },
    { title: t("trustAndSecurity"), desc: t("trustAndSecurityDesc") },
    { title: t("dependenceAndEntitlement"), desc: t("dependenceAndEntitlementDesc") },
    { title: t("lackOfLegalProtection"), desc: t("lackOfLegalProtectionDesc") },
    { title: t("socialIsolation"), desc: t("socialIsolationDesc") },
    { title: t("employerMaidRelationship"), desc: t("employerMaidRelationshipDesc") },
    { title: t("limitedAccessToHealthcare"), desc: t("limitedAccessToHealthcareDesc") },
    { title: t("lackOfStandardizedPractices"), desc: t("lackOfStandardizedPracticesDesc") },
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
        sx={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 1.25 }}>
          <Button
            type="button"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: "rgba(255,255,255,0.95)",
              textTransform: "none",
              fontWeight: 600,
              px: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            {t("backToHome")}
          </Button>
        </Container>
      </Box>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "common.white",
          py: { xs: 5, md: 8 },
          px: 0,
          background: `linear-gradient(125deg, ${theme.palette.primary.dark} 0%, #0a3d5c 42%, ${theme.palette.primary.main} 72%, #0369a1 100%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(255,255,255,0.14), transparent 55%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(14,165,233,0.25), transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, opacity: 0.9 }}>
            <GroupsOutlinedIcon sx={{ fontSize: 22 }} />
            <Typography variant="overline" sx={{ letterSpacing: "0.2em", fontWeight: 700 }}>
              ServEaso
            </Typography>
          </Stack>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              lineHeight: 1.15,
            }}
          >
            {t("aboutUs")}
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              mt: 2.5,
              maxWidth: 720,
              fontWeight: 400,
              opacity: 0.94,
              lineHeight: 1.65,
              fontSize: { xs: "1rem", md: "1.125rem" },
            }}
          >
            {t("aboutUsHero1")}{" "}
            <Box component="strong" sx={{ fontWeight: 700 }}>
              ServEaso
            </Box>{" "}
            {t("aboutUsHero2")}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -3, md: -4.5 }, position: "relative", zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 24px 48px -24px rgba(15, 23, 42, 0.18)",
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "-0.02em",
              mb: 3,
              fontSize: { xs: "1.5rem", md: "1.75rem" },
            }}
          >
            {t("ourStory")}
          </Typography>
          <Stack spacing={2.5}>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85, fontSize: "1.05rem" }}>
              {t("ourStory1")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85, fontSize: "1.05rem" }}>
              {t("ourStory2")}
            </Typography>
          </Stack>
        </Paper>
      </Container>

      <Box
        sx={{
          mt: { xs: 5, md: 6 },
          py: { xs: 4, md: 6 },
          bgcolor: "grey.100",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "-0.02em",
              mb: 4,
              fontSize: { xs: "1.5rem", md: "1.75rem" },
            }}
          >
            {t("challengesWeSolve")}
          </Typography>

          <Grid container spacing={2.5}>
            {challenges.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.75,
                    height: "100%",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderLeftWidth: 4,
                    borderLeftColor: "primary.main",
                    bgcolor: "background.paper",
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 12px 28px -12px rgba(14, 165, 233, 0.25)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUs;
