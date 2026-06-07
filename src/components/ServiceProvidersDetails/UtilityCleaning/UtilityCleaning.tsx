/* eslint-disable react-hooks/exhaustive-deps */
import { Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { PricingData } from '../../../types/PricingData';

interface UtilityCleaningProps {
  onPriceChange: (data: { price: number, entry: PricingData | null }) => void; // Updated callback function signature
}

const UtilityCleaning: React.FC<UtilityCleaningProps> = ({ onPriceChange }) => {
  const [serviceType] = useState<string>('Regular');
  const [peopleSelected, setPeopleSelected] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [price, setPrice] = useState<number>(0);

  // Buttons for selecting people range and frequency
  const peopleButtonsSelector = [
    { key: 1, value: '1-2' },
    { key: 2, value: '3-4' },
    { key: 3, value: '5-6' },
    { key: 4, value: '7-9' },
  ];

  const frequencyButtonsSelector = [
    { key: 1, value: '1 day / week' },
    { key: 2, value: '2 day / week' },
  ];

  // Pricing data
  const pricingData: PricingData[] = [
    { serviceCategory:"Utility Cleaning" , type:"Maid", serviceType: 'Regular', subCategory: 'people', peopleRange: '1-2', frequency: 1, pricePerMonth: 1000 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Regular', subCategory: 'people', peopleRange: '1-2', frequency: 2, pricePerMonth: 1500 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Regular', subCategory: 'people', peopleRange: '3-4', frequency: 1, pricePerMonth: 1200 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Regular', subCategory: 'people', peopleRange: '3-4', frequency: 2, pricePerMonth: 1800 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Regular', subCategory: 'people', peopleRange: '5-6', frequency: 1, pricePerMonth: 1400 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Regular', subCategory: 'people', peopleRange: '5-6', frequency: 2, pricePerMonth: 2000 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Regular', subCategory: 'people', peopleRange: '7-9', frequency: 1, pricePerMonth: 1500 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Regular', subCategory: 'people', peopleRange: '7-9', frequency: 2, pricePerMonth: 2100 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Premium', subCategory: 'people', peopleRange: '1-2', frequency: 1, pricePerMonth: 1200 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Premium', subCategory: 'people', peopleRange: '1-2', frequency: 2, pricePerMonth: 1800 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Premium', subCategory: 'people', peopleRange: '3-4', frequency: 1, pricePerMonth: 1440 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Premium', subCategory: 'people', peopleRange: '3-4', frequency: 2, pricePerMonth: 2160 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Premium', subCategory: 'people', peopleRange: '5-6', frequency: 1, pricePerMonth: 1680 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Premium', subCategory: 'people', peopleRange: '5-6', frequency: 2, pricePerMonth: 2400 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Premium', subCategory: 'people', peopleRange: '7-9', frequency: 1, pricePerMonth: 1800 },
    { serviceCategory:"Utility Cleaning" , type:"Maid",serviceType: 'Premium', subCategory: 'people', peopleRange: '7-9', frequency: 2, pricePerMonth: 2520 },
  ];

  // Handle selection of buttons (people or frequency)
  const handleButtonClick = (value: string | number, id: string) => {
    if (id === 'pax') {
      setPeopleSelected(value as string);
    } else {
      setFrequency(value as number);
    }
  };

  // Function to calculate the price and entry based on selections
  const calculatePriceAndEntry = () => {
    if (!serviceType || !peopleSelected || !frequency) return { price: 0, entry: null };

    const entry = pricingData.find(
      (item) =>
        item.serviceType === serviceType &&
        item.subCategory === 'people' &&
        item.peopleRange === peopleSelected &&
        item.frequency === frequency
    );

    // If entry is found, return the price and entry; otherwise, return 0 and null
    return entry ? { price: entry.pricePerMonth, entry } : { price: 0, entry: null };
  };

  // UseEffect to calculate the price and entry whenever dependencies change
  useEffect(() => {
    const { price, entry } = calculatePriceAndEntry(); // Get both price and entry
    setPrice(price); // Update price based on current state
    onPriceChange({ price, entry }); // Send both price and entry to parent
  }, [serviceType, peopleSelected, frequency, calculatePriceAndEntry, onPriceChange]); // Recalculate when any of these change

  return (
    <>
      {/* <Typography gutterBottom>
        <FormControl>
          <FormLabel id="demo-row-radio-buttons-group-label">Service Type</FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            onChange={serviceTypeHandler}
          >
            <FormControlLabel value="Regular" control={<Radio />} label="Regular" />
            <FormControlLabel value="Premium" control={<Radio />} label="Premium" />
            <FormControlLabel value="On Demand" control={<Radio />} label="On Demand" />
          </RadioGroup>
        </FormControl>
      </Typography> */}

      <Typography gutterBottom>
        Head Count:
        {peopleButtonsSelector.map((button) => (
          <button
            key={button.key}
            onClick={() => handleButtonClick(button.value, 'pax')}
            style={{
              border: peopleSelected === button.value ? '3px solid blue' : '1px solid gray',
              backgroundColor: peopleSelected === button.value ? '#e0f7fa' : 'transparent',
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
        Frequency:
        {frequencyButtonsSelector.map((button) => (
          <button
            key={button.key}
            onClick={() => handleButtonClick(button.key, 'frequency')}
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

      <Typography gutterBottom>Price: ₹{price}/month</Typography>
    </>
  );
};

export default UtilityCleaning;
