/* eslint-disable */
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../Button/button";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { X } from "lucide-react";
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
}

const ServiceDetailsDialog: React.FC<ServiceDetailsDialogProps> = ({
  open,
  onClose,
  serviceType,
}) => {
  const { t } = useLanguage(); // Add this line to use translations

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
      fullWidth={false}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          maxHeight: "80vh",
          width: "450px",
        }
      }}
    >
      <DialogHeader style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 1000,
        padding: '16px 24px',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          {title}
        </div>
        <IconButton
          aria-label={t('close')}
          onClick={onClose}
          className="!absolute right-4 !text-white"
        >
          <X className="w-6 h-6" />
        </IconButton>
      </DialogHeader>

      <DialogContent dividers sx={{ padding: "24px", overflowY: "auto" }}>
        <Typography variant="body1" paragraph sx={{ marginBottom: "16px" }}>
          {description}
        </Typography>

        {features.map((feature, index) => (
          <Box key={index} sx={{ marginBottom: "24px" }}>
            {feature.title && (
              <Typography variant="h6" sx={{ 
                fontWeight: "bold", 
                marginBottom: "12px",
                color: "#1d4ed8"
              }}>
                {feature.title}
              </Typography>
            )}
            <List dense disablePadding>
              {feature.items.map((item, itemIndex) => (
                <ListItem key={itemIndex} sx={{ paddingLeft: 0 }}>
                  <ListItemIcon sx={{ minWidth: "32px" }}>
                    <CheckIcon sx={{ color: "#1d4ed8" }} fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item} 
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              ))}
            </List>
            {index < features.length - 1 && (
              <Divider sx={{ marginY: "16px", borderColor: "rgba(0, 0, 0, 0.08)" }} />
            )}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailsDialog;