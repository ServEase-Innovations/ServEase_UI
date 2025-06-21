// Define the shape of formData using an interface
interface FormData {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    emailId: string;
    password: string;
    confirmPassword: string;
    mobileNo: string;
    AlternateNumber: string;
    address: string;
    buildingName: string;
    locality:String;
    street: string;
    currentLocation: string;
    nearbyLocation: string;
    pincode: string;
    AADHAR: string;
    pan: string;
    agreeToTerms: boolean;
    panImage: File | null; // New field for PAN image upload
    housekeepingRole: string; // Dropdown for Service Type
    description: string; // Text area for business description
    experience: string; // Experience in years
    kyc: string;
    documentImage: File | null;
    otherDetails:string,
    profileImage: File | null; // New field for Profile Image
    cookingSpeciality: string;
    age:'';
    diet:string;
    dob:'';
    profilePic:string;
    timeslot: string,
    referralCode:'',
  }

  export default FormData;