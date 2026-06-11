/* eslint-disable */
import { IconButton } from "src/components/Button/icon-button";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Button } from "../Button/button";
import { ArrowRight, X } from "lucide-react";
import { useLanguage } from "src/context/LanguageContext";

type ServiceFeature = {
  title?: string;
  items: string[];
};

type ServiceDetails = {
  title: string;
  description: string;
  features: ServiceFeature[];
  icon?: string | React.ReactNode;
};

interface ServiceDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  serviceType: "cook" | "maid" | "babycare" | null;
  onBookNow?: () => void;
}

const ServiceDetailsDialog: React.FC<ServiceDetailsDialogProps> = ({
  open,
  onClose,
  serviceType,
  onBookNow,
}) => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const serviceData: Record<"cook" | "maid" | "babycare", ServiceDetails> = {
    maid: {
      title: t('maidServicesTitle'),
      description: t('maidServicesDescription'),
      icon: "🧹",
      features: [
        {
          title: t('cleaning'),
          items: [
            t('utensilsCleaning'),
            t('dusting'),
            t('vacuuming'),
            t('mopping'),
            t('sweeping'),
            t('cleaningBathroomsKitchens')
          ]
        },
        {
          title: t('laundry'),
          items: [
            t('washingClothes'),
            t('dryingClothes'),
            t('foldingClothes'),
            t('ironingClothes')
          ]
        },
        {
          title: t('errands'),
          items: [
            t('runningErrands'),
            t('pickingGroceries'),
            t('dryCleaningPickup')
          ]
        },
        {
          items: [
            t('respectfulProperty'),
            t('punctualReliable'),
            t('professionalCourteous'),
            t('discreetRespectful')
          ]
        }
      ]
    },
    cook: {
      title: t('cookServicesTitle'),
      description: t('cookServicesDescription'),
      icon: "👩‍🍳",
      features: [
        {
          title: t('hygiene'),
          items: [
            t('strictHygiene'),
            t('frequentHandwashing'),
            t('cleanUniforms'),
            t('spotlessEnvironment')
          ]
        },
        {
          title: t('temperatureControl'),
          items: [
            t('monitorTemperatures'),
            t('preventBacterialGrowth'),
            t('properCookingStorage')
          ]
        },
        {
          title: t('allergenAwareness'),
          items: [
            t('handleAllergens'),
            t('preventCrossContamination'),
            t('accurateAllergenInfo')
          ]
        },
        {
          title: t('safeFoodHandling'),
          items: [
            t('followProcedures'),
            t('minimizeContamination')
          ]
        },
        {
          title: t('freshness'),
          items: [
            t('freshIngredients'),
            t('selectBestProduce')
          ]
        },
        {
          title: t('properTechniques'),
          items: [
            t('employTechniques'),
            t('maximizeFlavor'),
            t('highestStandards')
          ]
        },
        {
          title: t('attentionToDetail'),
          items: [
            t('closeAttention'),
            t('choppingToPlating'),
            t('consistencyVisual')
          ]
        },
        {
          title: t('dietaryRestrictions'),
          items: [
            t('accommodateGlutenFree'),
            t('vegetarianVegan'),
            t('specificAllergies')
          ]
        },
        {
          title: t('customization'),
          items: [
            t('adjustSpice'),
            t('modifyIngredients'),
            t('customizePortions')
          ]
        }
      ]
    },
    babycare: {
      title: t('caregiverServicesTitle'),
      description: t('caregiverServicesDescription'),
      icon: (
        <img 
          src="/CareGiver.png"
          alt={t('caregiver')} 
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain"
          }}
        />
      ),
      features: [
        {
          title: t('nurtureEnvironment'),
          items: [
            t('lovingSupportive'),
            t('safeSecure'),
            t('comfortEncouragement'),
            t('emotionalConnection')
          ]
        },
        {
          title: t('physicalSafety'),
          items: [
            t('hazardFree'),
            t('superviseActivities'),
            t('emergencyPrepared')
          ]
        },
        {
          title: t('medicalSafety'),
          items: [
            t('trainedCPR'),
            t('firstAidCertified')
          ]
        },
        {
          title: t('cognitiveDevelopment'),
          items: [
            t('ageAppropriateActivities'),
            t('readingEducational'),
            t('exploreInterests'),
            t('homeworkHelp'),
            t('encourageLearning')
          ]
        },
        {
          title: t('socialEmotional'),
          items: [
            t('teachSharing'),
            t('conflictResolution'),
            t('selfConfidence'),
            t('emotionalIntelligence')
          ]
        },
        {
          title: t('physicalDevelopment'),
          items: [
            t('encourageActivity'),
            t('outdoorAdventures'),
            t('ageSports'),
            t('healthyMeals')
          ]
        },
        {
          title: t('communication'),
          items: [
            t('openCommunication'),
            t('dailyUpdates'),
            t('discussProgress'),
            t('listenAttentively'),
            t('respondEmpathy')
          ]
        },
        {
          title: t('collaboration'),
          items: [
            t('workPartnership'),
            t('consistencyCare'),
            t('respectValues'),
            t('followStyles')
          ]
        }
      ]
    }
  };

  if (!serviceType) return null;

  const { title, description, features, icon } = serviceData[serviceType];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "16px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
          maxHeight: isMobile ? "100%" : "85vh",
          overflow: "hidden",
        }
      }}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-slate-900 via-sky-900 to-sky-800 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5 text-white">
          {icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl backdrop-blur-sm">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold sm:text-lg">{title}</p>
            <p className="text-xs text-sky-100/90">{t("popularServices")}</p>
          </div>
        </div>
        <IconButton
          aria-label={t('close')}
          onClick={onClose}
          className="shrink-0 text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </IconButton>
      </div>

      <DialogContent
        dividers
        sx={{
          padding: { xs: "20px", sm: "24px" },
          overflowY: "auto",
          backgroundColor: "#f8fafc",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            marginBottom: "20px",
            color: "#334155",
            lineHeight: 1.65,
            fontSize: "0.9375rem",
          }}
        >
          {description}
        </Typography>

        {features.map((feature, index) => (
          <Box
            key={index}
            sx={{
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              backgroundColor: "white",
              padding: "16px",
            }}
          >
            {feature.title && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  marginBottom: "10px",
                  color: "#0c4a6e",
                  fontSize: "0.9375rem",
                }}
              >
                {feature.title}
              </Typography>
            )}
            <List dense disablePadding>
              {feature.items.map((item, itemIndex) => (
                <ListItem key={itemIndex} sx={{ paddingLeft: 0, paddingY: "4px" }}>
                  <ListItemIcon sx={{ minWidth: "28px" }}>
                    <CheckIcon sx={{ color: "#0284c7" }} fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { color: "#475569", lineHeight: 1.5 },
                    }}
                  />
                </ListItem>
              ))}
            </List>
            {index < features.length - 1 && (
              <Divider sx={{ marginTop: "16px", borderColor: "rgba(148, 163, 184, 0.2)" }} />
            )}
          </Box>
        ))}
      </DialogContent>

      <DialogActions
        sx={{
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
          padding: { xs: "16px", sm: "16px 20px" },
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
          backgroundColor: "white",
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full min-h-11 sm:w-auto sm:min-w-[7.5rem]"
        >
          {t("close")}
        </Button>
        {onBookNow && (
          <Button
            type="button"
            variant="cta"
            onClick={onBookNow}
            className="group w-full min-h-11 sm:w-auto sm:min-w-[10rem]"
          >
            {t("bookNow")}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ServiceDetailsDialog;
