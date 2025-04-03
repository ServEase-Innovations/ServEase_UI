import { useState } from "react";
import "./HeaderSearch.css";

const BookingForm = ({ onSearch }: { onSearch: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    serviceType: "Regular",
    startTime: "",
    endTime: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    onSearch(formData); // Send data to parent
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
  // const pricing = useSelector((state: any) => state.pricing?.groupedServices);
  // const bookingType = useSelector((state: any) => state.bookingType?.value);

  // console.log("pricing => ", pricing);
  // console.log("bookingType => ", bookingType);

  return (
    <div className="header-search">
      <BookingForm onSearch={onSearch} />
    </div>
  );
};

export default HeaderSearch;
