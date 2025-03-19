/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { keys } from '../../env/env';
import { Autocomplete, Button, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const GeolocationComponent = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(`http://3.108.250.8:5000/maps/api/geocode/json`, {
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

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {location ? <p>Location: {location}</p> : <p>Loading location...</p>}


      <Autocomplete
  disablePortal
  options={[]}
  sx={{ width: 300 }}
  renderInput={(params) => <TextField {...params} label={location} />}
/>

<Button variant="outlined" startIcon={<DeleteIcon />}>
  {location}
</Button>
    </div>
  );
};

export default GeolocationComponent;
