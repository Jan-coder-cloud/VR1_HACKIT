// ================= REGISTRATION FORM TYPES =================

// Step 1: Personal Information
export interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  emailAddress?: string;
  aadhaarNumber: string;
  panNumber?: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married';
}

// Step 2: Geographic Information
export interface GeographicInfo {
  state: string;
  district: string;
  talukBlock?: string;
  areaType: 'Urban' | 'Rural' | 'Semi-Urban';
  rationCardType: 'APL' | 'BPL' | 'Antyodaya' | 'None';
  residentialStatus: 'Own House' | 'Rented' | 'Temporary Shelter';
}

// Step 3: Family Information
export interface FamilyInfo {
  numberOfDependents: number;
  numberOfChildren?: number;
  spouseWorking: 'Yes' | 'No';
  seniorCitizenInFamily: 'Yes' | 'No';
  differentlyAbledMember: 'Yes' | 'No';
  primaryEarningMember: 'Self' | 'Spouse' | 'Parent' | 'Other';
}

// Step 4: Livelihood Information (Union Type)
export type LivelihoodCategory = 
  | 'Student' 
  | 'Working Professional' 
  | 'Self-Employed' 
  | 'Farmer' 
  | 'Unemployed' 
  | 'Senior Citizen' 
  | 'Homemaker';

export interface StudentInfo {
  category: 'Student';
  educationLevel: string;
  institutionName: string;
  courseType: 'School' | 'Undergraduate' | 'Postgraduate' | 'Diploma';
  scholarshipReceiving: 'Yes' | 'No';
  annualFamilyIncome?: number;
}

export interface WorkingProfessionalInfo {
  category: 'Working Professional';
  companyName: string;
  designation: string;
  employmentType: 'Permanent' | 'Contract' | 'Part-time' | 'Temporary';
  yearsOfExperience?: number;
  monthlySalary: number;
  industrySector: 'IT' | 'Healthcare' | 'Education' | 'Manufacturing' | 'Finance' | 'Government' | 'Other';
}

export interface SelfEmployedInfo {
  category: 'Self-Employed';
  businessName: string;
  typeOfBusiness: string;
  yearsInBusiness?: number;
  monthlyAverageIncome: number;
  businessRegistrationStatus: 'Registered' | 'Unregistered';
  numberOfEmployees?: number;
}

export interface FarmerInfo {
  category: 'Farmer';
  landSize: number; // in acres
  cropType: string;
  irrigationType: 'Rain-fed' | 'Borewell' | 'Canal' | 'Mixed';
  annualAgriculturalIncome?: number;
  landOwnership: 'Owned' | 'Leased' | 'Sharecropping';
  livestock?: string;
}

export interface UnemployedInfo {
  category: 'Unemployed';
  lastEmployment?: string;
  durationOfUnemployment?: number; // in months
  employmentExchangeRegistered: 'Yes' | 'No';
  activelySeeking: 'Yes' | 'No';
  highestQualification: string;
  receivingGovtSupport: 'Yes' | 'No';
}

export interface SeniorCitizenInfo {
  category: 'Senior Citizen';
  age: number;
  receivingPension: 'Yes' | 'No';
  pensionAmount?: number;
  healthCondition: 'Good' | 'Fair' | 'Poor' | 'Requires Assistance';
  livingStatus: 'With Family' | 'Alone' | 'Old Age Home';
  sourceOfIncome: 'Pension' | 'Savings' | 'Family Support' | 'None';
}

export interface HomemakerInfo {
  category: 'Homemaker';
  spouseEmploymentStatus: 'Employed' | 'Unemployed' | 'Self-Employed';
  spouseMonthlyIncome?: number;
  numberOfDependents?: number;
  additionalIncomeSource: 'Yes' | 'No';
  additionalIncome?: number;
  interestedInSkillTraining: 'Yes' | 'No';
}

export type LivelihoodInfo = 
  | StudentInfo 
  | WorkingProfessionalInfo 
  | SelfEmployedInfo 
  | FarmerInfo 
  | UnemployedInfo 
  | SeniorCitizenInfo 
  | HomemakerInfo;

// Step 5: Financial & Documents
export interface FinancialInfo {
  annualHouseholdIncome: number;
  existingInsurance: 'Yes' | 'No';
  existingLoans: 'Yes' | 'No';
  bankAccountLinkedWithAadhaar: 'Yes' | 'No';
  savingsRange: 'Below ₹50,000' | '₹50,000 - ₹2,00,000' | '₹2,00,000 - ₹5,00,000' | 'Above ₹5,00,000';
  documents: DocumentUploads;
}

export interface DocumentUploads {
  incomeCertificate?: File;
  aadhaarCardCopy?: File;
  rationCard?: File;
  casteCertificate?: File;
  disabilityCertificate?: File;
  bankPassbook?: File;
}

// Complete Registration Form
export interface RegistrationFormData {
  personalInfo: PersonalInfo;
  geographicInfo: GeographicInfo;
  familyInfo: FamilyInfo;
  livelihoodInfo: LivelihoodInfo;
  financialInfo: FinancialInfo;
  agreed: boolean;
}

// Form Validation Schema
export interface FormValidation {
  step1Valid: boolean;
  step2Valid: boolean;
  step3Valid: boolean;
  step4Valid: boolean;
  step5Valid: boolean;
}

// API Response Type
export interface RegistrationResponse {
  success: boolean;
  message: string;
  applicationId?: string;
  errors?: string[];
}
