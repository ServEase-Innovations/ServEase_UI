import { Autocomplete, Button, TextField } from "@mui/material";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
// import MyLocationIcon from '@mui/icons-material/MyLocation';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { keys } from '../../env/env';
import './Header.css'
import { Dropdown, DropdownButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ChildComponentProps {
  sendDataToParent: (data: string) => void; // Adjust the type if needed
}

export const Header : React.FC<ChildComponentProps> = ({
  sendDataToParent,
}) => {

  const handleClick = (e: any) => {
    sendDataToParent(e);
  };

  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
              params: {
                latlng: `${latitude},${longitude}`,
                key: keys.api_key // Replace with your API key
              }
            });
            const address = response.data.results[0]?.formatted_address;
            console.log(response.data)
            setLocation(address);
          } catch (error) {
            console.log("Failed to fetch location")
          }
        },
        (error) => {
          console.log(error.message);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  useEffect(() => {
    if (inputValue && inputValue?.trim() === '') {
      setSuggestions([]);
      setError(null);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(CORS_PROXY + PLACES_API_URL, {
          params: {
            input: inputValue,
            key: keys.api_key,
            types: 'geocode',
          },
        });

        if (response.data.status === 'OK') {
          //setSuggestions(response.data.predictions);
          const sub = response.data.predictions.map(res => res.description)
          setSuggestions(sub)
          
        } else {
          setError(response.data.error_message || 'An error occurred');
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching places:', error);
        console.log('Failed to fetch suggestions');
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [inputValue]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedPlace(suggestion);
    setInputValue(suggestion.description);
    setSuggestions([]);
  };

  const handleChange = (event, newValue) => {
    if (newValue) {
      console.log('Selected Option:', newValue);
      setLocation('Your Selected Locaion')
      // Perform any additional actions with the selected option here
    }
  };

  return (
    <>
 <Navbar className="header" expand="lg">
  <div className="header-alignment">
    <img src="../logo.png" className="logo-style" alt="logo" />
    <div className="dropdowns-container">
      <DropdownButton
        id="dropdown-button"
        title="Location"
        variant="dark"
        className="dropdown-left"
      >
        <Dropdown.Item>
          <div className="autocomplete">
            <Autocomplete
              onInputChange={handleInputChange}
              onChange={handleChange}
              options={suggestions}
              sx={{ width: 300 }}
              clearIcon
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={location ? location : "Your selected location"}
                />
              )}
            />
          </div>
        </Dropdown.Item>
      </DropdownButton>

      <DropdownButton
        id="dropdown-button-dark"
        title="My Account"
        variant="dark"
        className="dropdown-left"
      >
        <Dropdown.Item onClick={(e) => handleClick("login")}>Login / Register</Dropdown.Item>
        <Dropdown.Item>Privacy Policy</Dropdown.Item>
        <Dropdown.Item>Notification</Dropdown.Item>
        <Dropdown.Item onClick={(e) => handleClick("sign_out")}>Sign Out</Dropdown.Item>
        <Dropdown.Item onClick={(e) => handleClick("admin")}>Admin - For Demo purpose Only</Dropdown.Item>
      </DropdownButton>
    </div>
  </div>
</Navbar>

    </>
  );
};
