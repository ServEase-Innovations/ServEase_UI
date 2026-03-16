/* eslint-disable react-hooks/exhaustive-deps */
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { PricingData } from "../../../types/PricingData";
import { useLanguage } from "src/context/LanguageContext";

interface UtilityCleaningProps {
    onPriceChange: (data: { price: number, entry: PricingData | null }) => void; // Callback function passed as a prop
}

const ClothDrying: React.FC<UtilityCleaningProps> = ({ onPriceChange }) => {
    const { t } = useLanguage(); // Use the language context
    
    const [frequency, setFrequency] = useState<string | null>(null); // Store as string to match pricingData
    const [price, setPrice] = useState<number>(0);
    const [jobDescription, setJobDescription] = useState<string>('');

    // Frequency options as strings - using translations
    const frequencyButtonsSelector = [
        { key: '3 day / week', value: t("threeDaysWeek") },
        { key: 'Daily', value: t("daily") },
    ];

    // Pricing data with frequency as string - using translations
    const pricingData: PricingData[] = [
        { serviceCategory:"Cloth Drying" , type:"Maid", serviceType: 'Regular', subCategory: 'people', frequency: '3 day / week', pricePerMonth: 500, jobDescription: t("clothDryingJobDescription") },
        { serviceCategory:"Cloth Drying" , type:"Maid", serviceType: 'Regular', subCategory: 'people', frequency: 'Daily', pricePerMonth: 1000, jobDescription: t("clothDryingJobDescription") },
    ];

    const handleButtonClick = (value: string) => {
        setFrequency(value); // Directly set the frequency as string
    };

    const calculatePrice = () => {
        const entry = pricingData.find(
            (item) => item.frequency === frequency // Compare with string frequency
        );

        if (entry) {
            // Safely update the job description, defaulting to an empty string if it's undefined
            setJobDescription(entry.jobDescription ?? t("noDescriptionAvailable"));
            return entry;
        }
        return null; // Return null if no matching entry is found
    };

    useEffect(() => {
        if (frequency) {
            const entry = calculatePrice(); // Get entry and price
            if (entry) {
                setPrice(entry.pricePerMonth);
                setJobDescription(entry.jobDescription ?? t("noDescriptionAvailable"));
                onPriceChange({ price: entry.pricePerMonth, entry }); // Send both price and entry to parent
            } else {
                setPrice(0);
                setJobDescription(t("noDescriptionAvailable"));
                onPriceChange({ price: 0, entry: null }); // Send null entry and 0 price if no match
            }
        }
    }, [frequency, onPriceChange, t]);

    return (
        <>
            <Typography gutterBottom>
                {t("frequency")}
                {frequencyButtonsSelector.map((button) => (
                    <button
                        key={button.key}
                        onClick={() => handleButtonClick(button.key)} // Set frequency to the string value
                        style={{
                            border: frequency === button.key ? '3px solid blue' : '1px solid gray',
                            backgroundColor: frequency === button.key ? '#e0f7fa' : 'transparent',
                            padding: '10px',
                            margin: '5px',
                            cursor: 'pointer',
                            outline: 'none',
                            borderRadius: '8px',
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

export default ClothDrying;