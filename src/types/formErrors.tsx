// Define the shape of errors to hold string messages
interface FormErrors {
  firstName?: string;
  lastName?: string;
  gender?: string;
  emailId?: string;
  password?: string;
  confirmPassword?: string;
  mobileNo?: string;
  address?: string;
  buildingName?: string;
  locality?: string;
  street ?: string;
  currentLocation?: string;
  city?: string;
  state?: string;
  pincode?: string;
  AADHAR?: string;
  pan?: string;
  agreeToTerms?: string; 
  housekeepingRole?: string; 
  description?: string; 
  experience?: string; 
  kyc?: string;
  documentImage?: string;
  aadhaarNumber?:string;
  cookingSpeciality?: string;
  Speciality?: string;
  diet?:string;
}

export default FormErrors;