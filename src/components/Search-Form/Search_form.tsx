import React, { useEffect, useState } from "react";
import "./SearchFormtwo.css";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import { FormLabel, Slider } from "@mui/material";
import axiosInstance from "../../services/axiosInstance";

interface SearchFormProps {
  open: boolean;
  selectedValue: string;
  onClose: () => void;
  onSearch: (data: any[]) => void;
}

export const Search_form: React.FC<SearchFormProps> = ({
  open,
  selectedValue,
 onClose,
  onSearch,
}) => {
  const [sliderValueAge, setSliderValueAge] = useState([18, 25]);
  const [morningTime, setMorningTime] = useState(6);
  const [eveningTime, setEveningTime] = useState(14);
  const [isMorningChecked, setIsMorningChecked] = useState(false);
  const [isEveningChecked, setIsEveningChecked] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | undefined>(undefined); // Gender selection
  const [language, setLanguage] = useState('');  // Language input
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    console.log("Selected Value on Component Render: ", selectedValue);
  }, [selectedValue]); // This will log when selectedValue changes or when the component is mounted
  
  // Format function for displaying age range
  const formatDisplayAge = (value: number) => {
    return `${value} yrs`;
  };

  // Handle slider value changes
  const handleAgeChange = (event: any, newValue: number | number[]) => {
    setSliderValueAge(newValue as number[]);
  };

  // Handle slider value changes (morning and evening)
  const handleMorningTimeChange = (event: Event, value: number | number[], activeThumb: number) => {
    setMorningTime(value as number); // Update to use 'value' instead of 'newValue'
  };

  const handleEveningTimeChange = (event: Event, value: number | number[], activeThumb: number) => {
    setEveningTime(value as number); // Update to use 'value' instead of 'newValue'
  };

  const handleMorningCheckboxChange = (event: any) => {
    setIsMorningChecked(event.target.checked);
  };

  const handleEveningCheckboxChange = (event: any) => {
    setIsEveningChecked(event.target.checked);
  };

  const handleGenderChange = (event: any) => {
    setSelectedGender(event.target.value); // Setting selected gender
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value.toUpperCase()); // Ensure the language is always in uppercase
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const selectedRole = selectedValue ? selectedValue.toUpperCase() : undefined;
    // Construct payload regardless of gender
    const minAge = sliderValueAge[0];
    const maxAge = sliderValueAge[1];

    if (minAge >= maxAge) {
      alert("Please ensure the min age is less than the max age");
      return;
    }

    const payload: any = {
      gender: selectedGender,
      minAge,
      maxAge,
      morningShift: isMorningChecked ? morningTime : undefined,
      eveningShift: isEveningChecked ? eveningTime : undefined,
      language: language,  // Include the language in the payload
      housekeepingRole: selectedRole, 
    };

    try {
      setLoading(true);
      // Call your API with the prepared payload
      const response = await axiosInstance.get(
        "/api/serviceproviders/get-by-filters",
        { params: payload }
      );

      // Handle the search results
      onSearch(response.data); // Pass the response to the onSearch function

    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="search-form">
      <h1>Search Your Preferences</h1>
      {loading ? ( // Toggle with `loading` state
        <LoadingIndicator />
      ) : (
        <form onSubmit={handleSubmit}>
          {/* First Row: Gender, Age, Languages */}
          <div className="form-row">
 
            {/* Gender Section */}
            <div className="form-group">
              <div className="gender">
                <label>Gender: </label>
                <input
                  type="radio"
                  value="MALE"
                  checked={selectedGender === "MALE"}
                  onChange={handleGenderChange}
                  
                />{" "}
                Male
                <input
                  type="radio"
                  value="FEMALE"
                  checked={selectedGender === "FEMALE"}
                  onChange={handleGenderChange}
                  className="second-radio" 
                />{" "}
                Female
              </div>
            </div>

            {/* Age Section */}
            <div className="form-group" style={{ display: "flex", alignItems: "center" }}>
              <FormLabel style={{ marginRight: "170px" , fontWeight: "bold"}}>Age:</FormLabel>
              <Slider
                value={sliderValueAge}
                onChange={handleAgeChange}
                valueLabelDisplay="on"
                valueLabelFormat={formatDisplayAge}
                min={18}
                max={50}
                step={5}
                marks={[
                  { value: 18, label: "18 yrs" },
                  { value: 25, label: "25 yrs" },
                  { value: 35, label: "35 yrs" },
                  { value: 50, label: "50 yrs" },
                ]}
                style={{ width: "200px" }}
              />
            </div>
          </div>

          {/* Languages Section */}
          <div className="form-group">
            <label htmlFor="languages">Languages:</label>
            <input
              type="text"
              id="languages"
              value={language}
              onChange={handleLanguageChange}
              placeholder="Enter languages"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>

      {/* Second Row: Shift Time, Availability */}
<div className="form-row">
  {/* Shift Time Section */}
  <div className="form-group">
    <div className="flex-container1">
      <label style={{ display: "block", marginBottom: "10px" }}>Shift Time:</label>

     {/* Morning Shift Section */}
  <div className="shift-group" style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
    <label htmlFor="morning" style={{ marginRight: "15px", display: "inline-flex", alignItems: "center" }}>
      Morning (6 AM - 12 PM)
    </label>
    <input
      type="checkbox"
      id="morning"
      checked={isMorningChecked}
      onChange={handleMorningCheckboxChange}
      style={{ transform: "scale(1.2)", marginRight: "15px" }}  // Adjust checkbox size and spacing
    />
    <Slider
      value={morningTime}
      onChange={handleMorningTimeChange}
      valueLabelDisplay="on"
      min={6}
      max={12}
      step={1}
      marks={[
        { value: 6, label: "6 AM" },
        { value: 8, label: "8 AM" },
        { value: 10, label: "10 AM" },
        { value: 12, label: "12 PM" },
      ]}
      style={{ width: "300px", flex: 2 }}
      disabled={!isMorningChecked}  // Disable slider if checkbox is not checked
    />
  </div>

      {/* Evening Shift Section */}
      <div className="shift-group" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label htmlFor="evening" style={{ marginRight: "15px", flex: 1 }}>
          Evening (2 PM - 8 PM)
        </label>
        <input
          type="checkbox"
          id="evening"
          checked={isEveningChecked}
          onChange={handleEveningCheckboxChange}
          style={{ transform: "scale(1.2)" }} // Make checkbox bigger
        />
        <Slider
          value={eveningTime}
          onChange={handleEveningTimeChange}
          valueLabelDisplay="on"
          min={14}
          max={20}
          step={1}
          marks={[
            { value: 14, label: "2 PM" },
            { value: 16, label: "4 PM" },
            { value: 18, label: "6 PM" },
            { value: 20, label: "8 PM" },
          ]}
          style={{ width: "300px", flex: 2 }}
          disabled={!isEveningChecked}  // Disable slider if checkbox is not checked
        />
      </div>
    </div>
  </div>
</div>

          {/* Buttons Row */}
          <div className="button-row">
            <button type="submit" className="search-button">
              Search
            </button>
            <button
              type="reset"
              className="reset-button"
              onClick={() => {
                setSelectedGender(undefined);
                setSliderValueAge([18, 25]);
                setIsMorningChecked(false);
                setIsEveningChecked(false);
                setMorningTime(6);
                setEveningTime(14);
                setLanguage('');
              }}
            >
              Reset
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Search_form;
