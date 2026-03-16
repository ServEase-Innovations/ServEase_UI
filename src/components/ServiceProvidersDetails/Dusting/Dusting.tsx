/* eslint-disable react-hooks/exhaustive-deps */
import { Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { PricingData } from "../../../types/PricingData";
import { useLanguage } from "src/context/LanguageContext";

interface UtilityCleaningProps {
  onPriceChange: (data: { price: number, entry: PricingData | null }) => void; // Callback now expects an object containing both price and entry
}

const Dusting: React.FC<UtilityCleaningProps> = ({ onPriceChange }) => {
  const { t } = useLanguage(); // Use the language context
  
  const [dustingType, setDustingType] = useState<string>("");
  const [roomType, setRoomType] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [jobDescription, setJobDescription] = useState<string>("");

  const pricingData: PricingData[] = [
    {
      serviceCategory: "Dusting",
      type: "Maid",
      serviceType: "Normal Dusting",
      subCategory: "Size",
      size: "2 BHK",
      frequency: 1,
      pricePerMonth: 500,
      jobDescription: t("normalDustingDescription"),
    },
    {
      serviceCategory: "Dusting",
      type: "Maid",
      serviceType: "Normal Dusting",
      subCategory: "Size",
      size: "2.5 - 3 BHK",
      frequency: 1,
      pricePerMonth: 700,
      jobDescription: t("normalDustingDescription"),
    },
    {
      serviceCategory: "Dusting",
      type: "Maid",
      serviceType: "Deep Dusting",
      subCategory: "Size",
      size: "2 BHK",
      frequency: 1,
      pricePerMonth: 1000,
      jobDescription: t("deepDustingDescription"),
    },
    {
      serviceCategory: "Dusting",
      type: "Maid",
      serviceType: "Deep Dusting",
      subCategory: "Size",
      size: "2.5 - 3 BHK",
      frequency: 1,
      pricePerMonth: 1200,
      jobDescription: t("deepDustingDescription"),
    },
  ];

  const dustingButtonsSelector = [
    { key: 1, value: t("normal") },
    { key: 2, value: t("deep") },
  ];

  const roomsizeButtonsSelector = [
    { key: 1, value: t("twoBHK") },
    { key: 2, value: t("twoHalfBHK") },
  ];

  const handleButtonClick = (value: string, type: string) => {
    if (type === "dusting") {
      setDustingType(value);
    } else {
      setRoomType(value);
    }
  };

  // Function to calculate price and job description based on selected options
  const calculatePriceAndDescription = () => {
    console.log("Calculating price and description...");
    console.log("Dusting Type: ", dustingType);
    console.log("Room Type: ", roomType);

    if (dustingType && roomType) {
      // Map display values back to API values
      const dustingTypeMap: Record<string, string> = {
        [t("normal")]: "Normal",
        [t("deep")]: "Deep",
      };

      const roomTypeMap: Record<string, string> = {
        [t("twoBHK")]: "2 BHK",
        [t("twoHalfBHK")]: "2.5 - 3 BHK",
      };

      const apiDustingType = dustingTypeMap[dustingType] || dustingType;
      const apiRoomType = roomTypeMap[roomType] || roomType;

      // Searching for matching pricing data entry based on dustingType and roomType
      const entry = pricingData.find(
        (item) =>
          item.serviceType === `${apiDustingType} Dusting` && // Ensure we add "Dusting" to the search term
          item.size === apiRoomType // Matching room type
      );

      console.log("Found entry: ", entry);

      if (entry) {
        setPrice(entry.pricePerMonth);
        setJobDescription(entry.jobDescription ?? t("noDescriptionAvailable"));
        onPriceChange({ price: entry.pricePerMonth, entry }); // Send both price and entry to the parent
      } else {
        setPrice(0); // Reset price if no match found
        setJobDescription(t("noDescriptionAvailable"));
        onPriceChange({ price: 0, entry: null }); // Send 0 price and null entry if no match
      }
    } else {
      setPrice(0); // Reset price if not all selections are made
      setJobDescription(t("noDescriptionAvailable"));
      onPriceChange({ price: 0, entry: null }); // Send 0 price and null entry if no selections are made
    }
  };

  useEffect(() => {
    calculatePriceAndDescription();
  }, [dustingType, roomType, t]); // Added t to dependencies

  return (
    <>
      <Typography gutterBottom>
        {t("dustingType")}
        {dustingButtonsSelector.map((button) => (
          <button
            key={button.key}
            onClick={() => handleButtonClick(button.value, "dusting")}
            style={{
              border: dustingType === button.value ? "3px solid blue" : "1px solid gray",
              backgroundColor: dustingType === button.value ? "#e0f7fa" : "transparent",
              padding: "10px",
              margin: "5px",
              cursor: "pointer",
              outline: "none",
              borderRadius: "8px",
            }}
          >
            {button.value}
          </button>
        ))}
      </Typography>

      <Typography gutterBottom>
        {t("roomType")}
        {roomsizeButtonsSelector.map((button) => (
          <button
            key={button.key}
            onClick={() => handleButtonClick(button.value, "room")}
            style={{
              border: roomType === button.value ? "3px solid blue" : "1px solid gray",
              backgroundColor: roomType === button.value ? "#e0f7fa" : "transparent",
              padding: "10px",
              margin: "5px",
              cursor: "pointer",
              outline: "none",
              borderRadius: "8px",
            }}
          >
            {button.value}
          </button>
        ))}
      </Typography>

      <Typography gutterBottom>
        {t("pricePerMonth").replace("{price}", price.toString())}
      </Typography>
      <Typography gutterBottom>
        {t("jobDescription").replace("{description}", jobDescription)}
      </Typography>
    </>
  );
};

export default Dusting;