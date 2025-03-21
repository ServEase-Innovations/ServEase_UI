import React, { useState } from 'react';
import './FlightSearch.css';

const FlightSearch = () => {
  const [tripType, setTripType] = useState('One Way');
  const [from, setFrom] = useState('New Delhi, India');
  const [to, setTo] = useState('Mumbai, India');
  const [departDate, setDepartDate] = useState('Fri, Mar 21, 2025');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1 Adult, Economy/Premium');
  const [fareType, setFareType] = useState('Regular');
  const [startTime, setStartTime] = useState('');

  return (
    <div className="full-width-background">
      <div className="horizontal-center-container">
        <div className="flight-search-container">
          <div className="fields">
            <div className="field">
              <div className="input-with-label">
                <span className="inline-label">Service Type</span>
                <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
                  <option>Regular</option>
                  <option>Premium</option>
                </select>
              </div>
            </div>

            <div className="field">
              <div className="input-with-label">
                <span className="inline-label">Time Slot</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="time-input"
                />
              </div>
            </div>

            <div className="field">
              <div className="input-with-label">
                <span className="inline-label">Date</span>
                <input
                  type="text"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="custom-input"
                />
              </div>
            </div>

            <button className="search-button">SEARCH</button>
          </div>

          <div className="fare-type-container">
            <span className="fare-label">Meal Type:</span>
            <span className="fare-label"></span>
            <span className="fare-label"></span>
            <span className="fare-label"></span>
            <span className="fare-label"></span>
            <span className="fare-label"></span>
            <span className="fare-label"></span>
             <span className="fare-label"></span>
             <span className="fare-label"></span>
             <span className="fare-label"></span>
             <span className="fare-label"></span> <span className="fare-label"></span>
             <span className="fare-label"></span>
             
              <span className="fare-label"></span> <span className="fare-label"></span> <span className="fare-label"></span> <span className="fare-label"></span>
            <span className="fare-label"></span>
            <label className="label"><b>Select Number of Persons:</b></label>
            <div className="fare-options">
              <label>
                <input
                  type="radio"
                  value="Regular"
                  checked={fareType === 'Regular'}
                  onChange={() => setFareType('Regular')}
                />
                Breakfast
              </label>

              <label>
                <input
                  type="radio"
                  value="Student"
                  checked={fareType === 'Student'}
                  onChange={() => setFareType('Student')}
                />
                Lunch
              </label>

              <label>
                <input
                  type="radio"
                  value="Senior Citizen"
                  checked={fareType === 'Senior Citizen'}
                  onChange={() => setFareType('Senior Citizen')}
                />
                Dinner
              </label>
              
              <input
                type="number"
                min="1"
                placeholder="1"
                className="person-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;