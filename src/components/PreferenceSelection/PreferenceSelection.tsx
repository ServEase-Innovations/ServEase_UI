import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import "./PreferenceSelection.css";

const PreferenceSelection = () => {
  const pricing = useSelector((state: any) => state.pricing?.groupedServices);
  const bookingType = useSelector((state: any) => state.bookingType?.value);
  const [selecteditem , setSelectedItems] = useState<any>([])

  const cookServices =
    pricing?.cook?.filter((service: any) => service.Type === "Regular") || [];

    console.log("cookServices", cookServices);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [personCount, setPersonCount] = useState<number>();

  const getText = () => {
    if (bookingType?.service?.toLowerCase() === "cook") {
      return "Meal Type";
    } else {
      return "Meal Type";
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handlePersonCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPersonCount(isNaN(value) ? 0 : value);
  };

  useEffect(() => {
    console.log("Selected Categories Updated:", selectedCategories);
    console.log("Person Count Updated:", personCount);
    console.log("cook pricning", cookServices);
    calculatePriceAndEntry()
  }, [selectedCategories , personCount]);


  const calculatePriceAndEntry = () => {
    let totalPrice = 0;
    // console.log("mealType", mealType)
    selectedCategories.forEach((category) => {
      const categoryData = cookServices.find(item => item.Categories === category);
      console.log("categoryData", categoryData)
      if (categoryData) {
        console.log("categoryData found " , categoryData);
        totalPrice += getPeopleCount(categoryData);
        setSelectedItems((prevState : any) => 
          prevState.includes(categoryData) 
            ? prevState.filter(item => item === categoryData) // Uncheck item
            : [...prevState, categoryData] // Check item
        );
      }
    });
    // if(mealType.length === 1){
    //   setPrice(Number(totalPrice));
    // } else if(mealType.length === 2){
    //   totalPrice = (Number(totalPrice)) -  Number(totalPrice) * 10 / 100;
    //   setPrice(totalPrice);
    // }
    // else if(mealType.length === 3){
    //   totalPrice = (Number(totalPrice)) -  Number(totalPrice) * 20 / 100;
    //   setPrice(totalPrice);
    // }

    // if(bookingType?.morningSelection && bookingType?.eveningSelection){
    //   totalPrice = (Number(totalPrice)) * 2;
    //   setPrice((Number(totalPrice)));
    // } else {
    //   setPrice(totalPrice);
    // }

    // if(serviceType === 2){
    //   totalPrice = totalPrice = (Number(totalPrice)) +  Number(totalPrice) * 30 / 100;
    //   setPrice(totalPrice);
    // }


    console.log("Total Price:", selecteditem);
    console.log("total Price , ", totalPrice);
  }

  const getPeopleCount = (data) => {
    let field = "";
    if(bookingType.bookingPreference != "Date"){
      field = "Price /Month (INR)"
    } else {
      field = "Price /Day (INR)"
    }
    const paxToNumber = Number(personCount);

    console.log("paxToNumber", paxToNumber);
  
    if (paxToNumber <= 3) {
      return data[field];
    } else if (paxToNumber > 3 && paxToNumber <= 6) {
      const basePrice = data[field];
      const extraPeople = paxToNumber - 3;
      const increasedPrice = basePrice + basePrice * 0.2 * extraPeople;
      return increasedPrice;
    } else if (paxToNumber > 6 && paxToNumber <= 9) {
      const basePrice = data[field];
      // First, calculate the price for the first 6 people
      const extraPeopleTier1 = 3; // From 4 to 6 (3 people total)
      const priceForTier1 = basePrice + basePrice * 0.2 * extraPeopleTier1;
  
      // Now, calculate the price for additional people (7 to 9)
      const extraPeopleTier2 = paxToNumber - 6;
      const increasedPrice = priceForTier1 + priceForTier1 * 0.1 * extraPeopleTier2;
  
      return increasedPrice;
    } else if (paxToNumber > 9) {
      const basePrice = data[field];
      // First, calculate the price for the first 6 people
      const extraPeopleTier1 = 3; // From 4 to 6 (3 people total)
      const priceForTier1 = basePrice + basePrice * 0.2 * extraPeopleTier1;
  
      // Calculate the price for additional people (7 to 9)
      const extraPeopleTier2 = 3; // From 7 to 9 (3 people total)
      const priceForTier2 = priceForTier1 + priceForTier1 * 0.1 * extraPeopleTier2;
  
      // Calculate the price for additional people (10+)
      const extraPeopleTier3 = paxToNumber - 9;
      const increasedPrice = priceForTier2 + priceForTier2 * 0.05 * extraPeopleTier3;
  
      return increasedPrice;
    }
  };

  const handleCheckout = () => {
    console.log("Selected Categories:", selectedCategories);
    console.log("Person Count:", personCount);
    
    // Do your checkout logic here
  };

  return (
    <div className="fare-type-container">
      <span className="fare-label">{getText()}:</span>
      <div className="fare-options">
        {cookServices.map((service: any, index: number) => (
          <label key={index}>
            <input
              type="checkbox"
              value={service.Categories}
              checked={selectedCategories.includes(service.Categories)}
              onChange={() => handleCategoryChange(service.Categories)}
            />
            {service.Categories}
          </label>
        ))}

        <div className="person-count">
          <span className="fare-label">No. of Persons :</span>
          <input
            type="number"
            min="1"
            value={personCount}
            onChange={handlePersonCountChange}
            className="person-input"
          />
        </div>
      </div>
    </div>
  );
};

export default PreferenceSelection;
