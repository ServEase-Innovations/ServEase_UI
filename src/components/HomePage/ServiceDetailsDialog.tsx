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
  const serviceData: Record<"cook" | "maid" | "babycare", ServiceDetails> = {
    maid: {
      title: "ServEaso Maid Services",
      description: "Professional cleaning and household services",
      icon: "🧹",
      features: [
        {
          title: "Cleaning",
          items: [
            "Utensils cleaning",
            "Dusting",
            "Vacuuming",
            "Mopping",
            "Sweeping",
            "Cleaning bathrooms and kitchens"
          ]
        },
        {
          title: "Laundry",
          items: [
            "Washing clothes",
            "Drying clothes",
            "Folding clothes",
            "Ironing clothes"
          ]
        },
        {
          title: "Errands",
          items: [
            "Running errands for customers",
            "Picking up groceries",
            "Dry cleaning pickup/dropoff"
          ]
        },
        {
          items: [
            "Respectful of customer's property",
            "Punctual and reliable",
            "Professional and courteous",
            "Discreet and respectful of privacy"
          ]
        }
      ]
    },
    cook: {
      title: "ServEaso Cook Services",
      description: "Professional cooking services with strict standards",
      icon: "👩‍🍳",
      features: [
        {
          title: "Hygiene",
          items: [
            "Adhere to strict hygiene standards",
            "Frequent handwashing",
            "Wear clean uniforms and hairnets",
            "Maintain spotless work environment"
          ]
        },
        {
          title: "Temperature Control",
          items: [
            "Meticulously monitor food temperatures",
            "Prevent bacterial growth",
            "Ensure proper cooking, storage, and reheating"
          ]
        },
        {
          title: "Allergen Awareness",
          items: [
            "Handle allergens carefully",
            "Prevent cross-contamination",
            "Provide accurate allergen information"
          ]
        },
        {
          title: "Safe Food Handling",
          items: [
            "Follow proper procedures for raw and cooked foods",
            "Minimize contamination risk"
          ]
        },
        {
          title: "Freshness",
          items: [
            "Use fresh, high-quality ingredients",
            "Select best produce, meats, and components"
          ]
        },
        {
          title: "Proper Techniques",
          items: [
            "Employ proper cooking techniques",
            "Maximize flavor, texture, and nutritional value",
            "Ensure highest preparation standards"
          ]
        },
        {
          title: "Attention to Detail",
          items: [
            "Pay close attention to every step",
            "From chopping vegetables to final plating",
            "Ensure consistency and visual appeal"
          ]
        },
        {
          title: "Dietary Restrictions",
          items: [
            "Accommodate gluten-free needs",
            "Prepare vegetarian and vegan meals",
            "Tailor to specific allergies/intolerances"
          ]
        },
        {
          title: "Customization",
          items: [
            "Adjust spice levels",
            "Modify ingredients",
            "Customize portion sizes"
          ]
        }
      ]
    },
    babycare: {
      title: "ServEaso Caregiver Services",
      description: "Professional child care services",
      icon: (
    <img 
      src="/CareGiver.png"
      alt="Caregiver" 
      style={{
        width: "40px",
        height: "40px",
        objectFit: "contain"
      }}
    />
  ),
      features: [
        {
          title: "Nurture and Safe Environment",
          items: [
            "Provide loving and supportive environment",
            "Children feel safe, secure, and understood",
            "Offer comfort and encouragement",
            "Build strong emotional connection"
          ]
        },
        {
          title: "Physical Safety",
          items: [
            "Ensure hazard-free environment",
            "Supervise all activities",
            "Prepare for emergencies"
          ]
        },
        {
          title: "Medical Safety",
          items: [
            "Trained in CPR",
            "First aid certified for medical emergencies"
          ]
        },
        {
          title: "Cognitive Development",
          items: [
            "Engage in age-appropriate activities",
            "Reading and educational games",
            "Explore children's interests",
            "Help with homework",
            "Encourage learning"
          ]
        },
        {
          title: "Social/Emotional Development",
          items: [
            "Teach sharing and empathy",
            "Conflict resolution skills",
            "Develop self-confidence",
            "Build emotional intelligence"
          ]
        },
        {
          title: "Physical Development",
          items: [
            "Encourage physical activity",
            "Outdoor adventures",
            "Age-appropriate sports",
            "Prepare healthy meals and snacks"
          ]
        },
        {
          title: "Communication",
          items: [
            "Maintain open communication with parents",
            "Share daily updates",
            "Discuss development progress",
            "Listen attentively to child",
            "Respond with empathy"
          ]
        },
        {
          title: "Collaboration",
          items: [
            "Work in partnership with parents",
            "Ensure consistency in care",
            "Respect parents' values",
            "Follow parenting styles"
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
  maxWidth="sm" // This makes it smaller than the default 'md' size
  fullWidth={false} // Important: prevents stretching to full width
  PaperProps={{
    sx: {
      borderRadius: "12px",
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      maxHeight: "80vh",
      width: "450px", // Set your desired fixed width
    }
  }}
    >
    <DialogTitle sx={{
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #e0e0e0",
        fontWeight: "bold",
        fontSize: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // Align items with space between
        color: "#1d4ed8",
        paddingRight: "40px" // Add padding to prevent overlap
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {icon && <span style={{ fontSize: "1.5em" }}>{icon}</span>}
          {title}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: '#1d4ed8',
            position: 'absolute',
            right: 16,
            top: 16,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>


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
                color: "#1d4ed8" // Changed color here
              }}>
                {feature.title}
              </Typography>
            )}
            <List dense disablePadding>
              {feature.items.map((item, itemIndex) => (
                <ListItem key={itemIndex} sx={{ paddingLeft: 0 }}>
                  <ListItemIcon sx={{ minWidth: "32px" }}>
                    <CheckIcon sx={{ color: "#1d4ed8" }} fontSize="small" /> {/* Changed color here */}
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