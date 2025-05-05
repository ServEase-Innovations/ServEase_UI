import { useState } from "react";
import "./HeaderSearch.css";
import { useDispatch } from "react-redux";
import { update } from "../../features/bookingType/bookingTypeSlice"; // Adjust path as needed

const BookingForm = ({ onSearch }: { onSearch: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    serviceType: "Regular",
    startTime: "",
    endTime: "",
  });

  const dispatch = useDispatch();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Dispatch to Redux store
    dispatch(update({
      serviceType: formData.serviceType,
      startTime: formData.startTime,
      endTime: formData.endTime,
      timeRange: `${formData.startTime} - ${formData.endTime}`,
      duration: calculateDuration(formData.startTime, formData.endTime)
    }));

    console.log("Form Submitted:", formData);
    onSearch(formData); // Send data to parent
  };

  // Helper function to calculate duration in hours
  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return (endTotalMinutes - startTotalMinutes) / 60;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="fields">
        <div className="field">
          <div className="input-with-label">
            <span className="inline-label">Service Type</span>
            <select
              value={formData.serviceType}
              onChange={(e) => handleChange("serviceType", e.target.value)}
            >
              <option value="Regular">Regular</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
        </div>

        <div className="field">
          <div className="input-with-label">
            <span className="inline-label">Start Time</span>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="time-input"
              required
            />
          </div>
        </div>

        <div className="field">
          <div className="input-with-label">
            <span className="inline-label">End Time</span>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              className="time-input"
              required
            />
          </div>
        </div>

        <button type="submit" className="search-button">
          SEARCH
        </button>
      </div>
    </form>
  );
};

const HeaderSearch = ({ onSearch }: { onSearch: (data: any) => void }) => {
  return (
    <div className="header-search">
      <BookingForm onSearch={onSearch} />
    </div>
  );
};

export default HeaderSearch;