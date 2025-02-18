export const getPriceByvalue = ( data : any | undefined , pax : any | undefined ) =>{
    const paxToNumber = Number(pax);
    const rate = Number(data["Price /Month (INR)"])
    let increasedPrice = 0;
    if(pax){
 
    if (paxToNumber <= 3) 
        {
        return rate;
      } else if (paxToNumber > 3 && paxToNumber <= 6) {
        const basePrice = rate;
        const extraPeople = paxToNumber - 3;
        increasedPrice = Number(basePrice) + ( basePrice * 0.2 * extraPeople);
        return increasedPrice;
      } 
      else if (paxToNumber > 6 && paxToNumber <= 9) {
        const basePrice = rate;
        // First, calculate the price for the first 6 people
        const extraPeopleTier1 = 3; // From 4 to 6 (3 people total)
        const priceForTier1 = basePrice + basePrice * 0.2 * extraPeopleTier1;
    
        // Now, calculate the price for additional people (7 to 9)
        const extraPeopleTier2 = paxToNumber - 6;
        increasedPrice = priceForTier1 + priceForTier1 * 0.1 * extraPeopleTier2;
    
        return increasedPrice;
      } else if (paxToNumber > 9) {
        const basePrice = rate;
        // First, calculate the price for the first 6 people
        const extraPeopleTier1 = 3; // From 4 to 6 (3 people total)
        const priceForTier1 = basePrice + basePrice * 0.2 * extraPeopleTier1;
    
        // Calculate the price for additional people (7 to 9)
        const extraPeopleTier2 = 3; // From 7 to 9 (3 people total)
        const priceForTier2 = priceForTier1 + priceForTier1 * 0.1 * extraPeopleTier2;
    
        // Calculate the price for additional people (10+)
        const extraPeopleTier3 = paxToNumber - 9;
        increasedPrice = priceForTier2 + priceForTier2 * 0.05 * extraPeopleTier3;
    
        return increasedPrice;
      
}
    } 
    else {
        return increasedPrice;
    }

}

export const getPriceByNumber = (data , pax) =>{
    const paxToNumber = Number(pax);
    const rate = Number(data["Price /Month (INR)"])
    let increasedPrice = 0;
    if(pax){
 
    if (paxToNumber <= 1) 
        {
        return rate;
      } else {
        const basePrice = rate;
        const extraPeople = paxToNumber - 1;
        increasedPrice = Number(basePrice) + ( basePrice * 0.5 * extraPeople);
        console.log("base price => ", basePrice)
        console.log("extraPeople => ", extraPeople)
        console.log("increased price => ", increasedPrice)
        return increasedPrice;
      } 
    } 
    else {
        return increasedPrice;
    }
}

export const getNannyPrices = (data , time , bookingPreference ) =>{

  let basePrice = 0;
  let updatedPrice = 0;
  basePrice = data['Price /Month (INR)'];
  if(time <= 8){
    if(time === 4){
      updatedPrice = (basePrice * 65) / 100; 
    }
    else if(time >= 5 && time < 8){
      const diff =  time - 4;
      updatedPrice = (basePrice * 65) / 100 + diff * (basePrice * 10) / 100;
    } else {
      updatedPrice = basePrice;
    }    
  } else if (time > 8 && time <= 16){
    console.log("I am here ....")
      const diff =  time - 8  ;
      console.log("diff ", diff)
      console.log("base price => ", basePrice)
      updatedPrice = basePrice + diff * (basePrice * 5) / 100;
      console.log("updated price ", updatedPrice)
  } else {
    updatedPrice = 22400
  }

  if(bookingPreference === "Monthly"){
    updatedPrice = updatedPrice + (26 * 100); 
  }

return updatedPrice;

}