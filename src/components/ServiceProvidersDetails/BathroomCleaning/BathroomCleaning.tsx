/* eslint-disable react-hooks/exhaustive-deps */
import { Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { PricingData } from '../../../types/PricingData';
import { useLanguage } from 'src/context/LanguageContext';

interface BathroomCleaningProps {
    onPriceChange: (data: { price: number, entry: PricingData | null }) => void; // Callback function passed as a prop
}

const BathroomCleaning: React.FC<BathroomCleaningProps> = ({ onPriceChange }) => {
    const { t } = useLanguage(); // Use the language context
    
    const [washRoomCount, setWashRoomCount] = useState<number>(0);
    const [frequency, setFrequency] = useState<number | string | null>(null);
    const [price, setPrice] = useState<number>(0);
    const [jobDescription, setJobDescription] = useState<string>(''); // Job description to display
    const [washRoomType, setWashRoomType] = useState<string>(''); // Type of cleaning (Normal or Deep)

    // Button selectors for washroom count, frequency, and type
    const bathCountButtonsSelector = [
        { key: 1, value: 1 },
        { key: 2, value: 2 },
    ];

    const bathTypeButtonsSelector = [
        { key: "bathroom", value: t("normalCleaning") },
        { key: "bathroom_deep_cleaning", value: t("deepCleaning") },
    ];

    const frequencyButtonsSelector = [
        { key: 1, value: t("dayWeek").replace("{days}", "1") },
        { key: 2, value: t("dayWeek").replace("{days}", "2") },
    ];

    const deepCleanFrequency = [{ key: '1', value: t("daily") }];

    // Pricing data with job descriptions - using translation keys
    const pricingData: PricingData[] = [
        { serviceCategory: 'bathroom', type:"maid", serviceType: 'Regular', subCategory: 'number', size: 1, frequency: t("dayWeek").replace("{days}", "1"), pricePerMonth: 400, jobDescription: t("weeklyCleaningBathroom") },
        { serviceCategory: 'bathroom', type:"maid", serviceType: 'Regular', subCategory: 'number', size: 1, frequency: t("dayWeek").replace("{days}", "2"), pricePerMonth: 600, jobDescription: t("twoDaysWeekCleaningBathroom") },
        { serviceCategory: 'bathroom', type:"maid", serviceType: 'Regular', subCategory: 'number', size: 2, frequency: t("dayWeek").replace("{days}", "1"), pricePerMonth: 600, jobDescription: t("twoBathroomsWeeklyCleaning") },
        { serviceCategory: 'bathroom', type:"maid", serviceType: 'Regular', subCategory: 'number', size: 2, frequency: t("dayWeek").replace("{days}", "2"), pricePerMonth: 1000, jobDescription: t("twoBathroomsWeeklyCleaning") },
        { serviceCategory: 'bathroom', type:"maid", serviceType: 'Premium', subCategory: 'number', size: 1, frequency: t("dayWeek").replace("{days}", "1"), pricePerMonth: 600, jobDescription: t("premiumCleaningBathroomWeekly") },
        { serviceCategory: 'bathroom', type:"maid", serviceType: 'Premium', subCategory: 'number', size: 1, frequency: t("dayWeek").replace("{days}", "2"), pricePerMonth: 800, jobDescription: t("premiumCleaningBathroomTwoDays") },
        { serviceCategory: 'bathroom', type:"maid", serviceType: 'Premium', subCategory: 'number', size: 2, frequency: t("dayWeek").replace("{days}", "1"), pricePerMonth: 800, jobDescription: t("twoBathroomsPremiumWeekly") },
        { serviceCategory: 'bathroom', type:"maid", serviceType: 'Premium', subCategory: 'number', size: 2, frequency: t("dayWeek").replace("{days}", "1"), pricePerMonth: 800, jobDescription: t("twoBathroomsPremiumWeekly") },
        { serviceCategory: 'bathroom_deep_cleaning', serviceType: 'Regular', subCategory: 'number', size: 0, frequency: t("daily"), pricePerMonth: 600, jobDescription: t("deepCleaningDescription") },
    ];

    // Handle button clicks for washroom count, frequency, and type
    const handleButtonClick = (value: number | string, category: string) => {
        if (category === 'washRoom') {
            setWashRoomCount(value as number);
        } else if (category === 'frequency') {
            setFrequency(value as number | string);
        } else if (category === 'type') {
            setWashRoomType(value as string);
            setFrequency(""); // Reset frequency when changing type
            setWashRoomCount(1); // Reset to default washroom count
            setPrice(0); // Reset price
        }
    };

    // Calculate price and update job description based on selected values
    const calculatePrice = () => {
        let filteredPricingData: PricingData[] = [];

        if (washRoomType === t("normalCleaning")) {
            filteredPricingData = pricingData.filter(
                (item) =>
                    item.size === washRoomCount && item.frequency === frequency && item.serviceCategory === 'bathroom'
            );
        } else if (washRoomType === t("deepCleaning")) {
            filteredPricingData = pricingData.filter(
                (item) =>
                    item.size === 0 &&
                    item.serviceCategory === 'bathroom_deep_cleaning' &&
                    item.frequency === t("daily")
            );
        }

        const matchedEntry = filteredPricingData[0];
        if (matchedEntry) {
            setJobDescription(matchedEntry.jobDescription || '');
            return matchedEntry.pricePerMonth;
        }

        setJobDescription('');
        return 0;
    };

    // Whenever washRoomCount, frequency, or washRoomType changes, update the price and pass data to the parent
    useEffect(() => {
        if (washRoomType && washRoomCount > 0 && frequency) {
            const calculatedPrice = calculatePrice();
            setPrice(calculatedPrice);
            const entry = pricingData.find(
                (item) =>
                    (washRoomType === t("normalCleaning")
                        ? item.size === washRoomCount &&
                          item.serviceCategory === 'bathroom'
                        : item.serviceCategory === 'bathroom_deep_cleaning') &&
                    item.frequency === frequency
            );
            onPriceChange({ price: calculatedPrice, entry: entry || null });
        } else {
            onPriceChange({ price: 0, entry: null });
        }
    }, [washRoomCount, frequency, washRoomType, pricingData, t, onPriceChange, calculatePrice]);
    
    // Helper to render buttons with selected styles
    const renderButton = (buttons: any[], selectedValue: any, category: string) => {
        return buttons.map((button) => (
            <button
                key={button.key}
                onClick={() => handleButtonClick(button.value, category)}
                style={{
                    border: selectedValue === button.value ? '3px solid blue' : '1px solid gray',
                    backgroundColor: selectedValue === button.value ? '#e0f7fa' : 'transparent',
                    padding: '10px',
                    margin: '5px',
                    cursor: 'pointer',
                    outline: 'none',
                    borderRadius: '8px',
                }}
            >
                {button.value}
            </button>
        ));
    };

    return (
        <>
            <Typography gutterBottom>
                {t("type")}
                {renderButton(bathTypeButtonsSelector, washRoomType, 'type')}
            </Typography>

            {washRoomType === t("normalCleaning") && (
                <>
                    <Typography gutterBottom>
                        {t("noOfWashrooms")}
                        {renderButton(bathCountButtonsSelector, washRoomCount, 'washRoom')}
                    </Typography>

                    <Typography gutterBottom>
                        {t("frequency")}
                        {renderButton(frequencyButtonsSelector, frequency, 'frequency')}
                    </Typography>
                </>
            )}

            {washRoomType === t("deepCleaning") && (
                <>
                    <Typography gutterBottom>
                        {t("frequency")}
                        {renderButton(deepCleanFrequency, frequency, 'frequency')}
                    </Typography>
                </>
            )}

            <Typography gutterBottom>
                {t("pricePerMonth").replace("{price}", price.toString())}
            </Typography>
            <Typography gutterBottom>
                {t("jobDescription").replace("{description}", jobDescription)}
            </Typography>
        </>
    );
};

export default BathroomCleaning;