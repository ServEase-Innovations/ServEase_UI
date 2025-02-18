export const getPriceByvalue = ( data , pax ) =>{
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
        console.log("base price => ", basePrice)
        console.log("extraPeople => ", extraPeople)
        console.log("increased price => ", increasedPrice)
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