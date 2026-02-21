# AULA Registration Form Schema Documentation

## Overview
This document describes the complete data structure for the AULA (Personalized Financial & Insurance Scheme Portal) registration form.

## Files
- `types.ts` - TypeScript type definitions
- `schema.json` - JSON Schema for validation
- `README.md` - This documentation file

## Form Structure

The registration form consists of 5 steps:

### Step 1: Personal Information
```typescript
{
  fullName: string;              // Required
  dateOfBirth: string;           // Required (format: YYYY-MM-DD)
  mobileNumber: string;          // Required (10 digits)
  emailAddress?: string;         // Optional (valid email)
  aadhaarNumber: string;         // Required (12 digits)
  panNumber?: string;            // Optional (format: AAAAA9999A)
  gender: 'Male' | 'Female' | 'Other';     // Required
  maritalStatus: 'Single' | 'Married';     // Required
}
```

### Step 2: Geographic Information
```typescript
{
  state: string;                 // Required
  district: string;              // Required
  talukBlock?: string;           // Optional
  areaType: 'Urban' | 'Rural' | 'Semi-Urban';                    // Required
  rationCardType: 'APL' | 'BPL' | 'Antyodaya' | 'None';         // Required
  residentialStatus: 'Own House' | 'Rented' | 'Temporary Shelter'; // Required
}
```

### Step 3: Family Information
```typescript
{
  numberOfDependents: number;              // Required
  numberOfChildren?: number;               // Optional
  spouseWorking: 'Yes' | 'No';            // Required
  seniorCitizenInFamily: 'Yes' | 'No';    // Required
  differentlyAbledMember: 'Yes' | 'No';   // Required
  primaryEarningMember: 'Self' | 'Spouse' | 'Parent' | 'Other'; // Required
}
```

### Step 4: Livelihood Information
Dynamic based on category selection. Choose one:

#### 4a. Student
```typescript
{
  category: 'Student';
  educationLevel: string;                                               // Required
  institutionName: string;                                              // Required
  courseType: 'School' | 'Undergraduate' | 'Postgraduate' | 'Diploma'; // Required
  scholarshipReceiving: 'Yes' | 'No';                                  // Required
  annualFamilyIncome?: number;                                         // Optional
}
```

#### 4b. Working Professional
```typescript
{
  category: 'Working Professional';
  companyName: string;                  // Required
  designation: string;                  // Required
  employmentType: 'Permanent' | 'Contract' | 'Part-time' | 'Temporary'; // Required
  yearsOfExperience?: number;           // Optional
  monthlySalary: number;                // Required (in ₹)
  industrySector: 'IT' | 'Healthcare' | 'Education' | 'Manufacturing' | 
                  'Finance' | 'Government' | 'Other'; // Required
}
```

#### 4c. Self-Employed
```typescript
{
  category: 'Self-Employed';
  businessName: string;                 // Required
  typeOfBusiness: string;               // Required
  yearsInBusiness?: number;             // Optional
  monthlyAverageIncome: number;         // Required (in ₹)
  businessRegistrationStatus: 'Registered' | 'Unregistered'; // Required
  numberOfEmployees?: number;           // Optional
}
```

#### 4d. Farmer
```typescript
{
  category: 'Farmer';
  landSize: number;                     // Required (in acres)
  cropType: string;                     // Required
  irrigationType: 'Rain-fed' | 'Borewell' | 'Canal' | 'Mixed'; // Required
  annualAgriculturalIncome?: number;    // Optional (in ₹)
  landOwnership: 'Owned' | 'Leased' | 'Sharecropping'; // Required
  livestock?: string;                   // Optional
}
```

#### 4e. Unemployed
```typescript
{
  category: 'Unemployed';
  lastEmployment?: string;                       // Optional
  durationOfUnemployment?: number;               // Optional (in months)
  employmentExchangeRegistered: 'Yes' | 'No';   // Required
  activelySeeking: 'Yes' | 'No';                // Required
  highestQualification: string;                  // Required
  receivingGovtSupport: 'Yes' | 'No';           // Required
}
```

#### 4f. Senior Citizen
```typescript
{
  category: 'Senior Citizen';
  age: number;                          // Required (minimum 60)
  receivingPension: 'Yes' | 'No';      // Required
  pensionAmount?: number;               // Optional (in ₹)
  healthCondition: 'Good' | 'Fair' | 'Poor' | 'Requires Assistance'; // Required
  livingStatus: 'With Family' | 'Alone' | 'Old Age Home';            // Required
  sourceOfIncome: 'Pension' | 'Savings' | 'Family Support' | 'None'; // Required
}
```

#### 4g. Homemaker
```typescript
{
  category: 'Homemaker';
  spouseEmploymentStatus: 'Employed' | 'Unemployed' | 'Self-Employed'; // Required
  spouseMonthlyIncome?: number;                  // Optional (in ₹)
  numberOfDependents?: number;                   // Optional
  additionalIncomeSource: 'Yes' | 'No';         // Required
  additionalIncome?: number;                     // Optional (in ₹)
  interestedInSkillTraining: 'Yes' | 'No';      // Required
}
```

### Step 5: Financial & Documents
```typescript
{
  annualHouseholdIncome: number;        // Required (in ₹)
  existingInsurance: 'Yes' | 'No';     // Required
  existingLoans: 'Yes' | 'No';         // Required
  bankAccountLinkedWithAadhaar: 'Yes' | 'No'; // Required
  savingsRange: 'Below ₹50,000' | '₹50,000 - ₹2,00,000' | 
                '₹2,00,000 - ₹5,00,000' | 'Above ₹5,00,000'; // Required
  documents: {
    incomeCertificate?: File;          // Optional (PDF, JPG, PNG - Max 5MB)
    aadhaarCardCopy?: File;            // Optional (PDF, JPG, PNG - Max 5MB)
    rationCard?: File;                 // Optional (PDF, JPG, PNG - Max 5MB)
    casteCertificate?: File;           // Optional (PDF, JPG, PNG - Max 5MB)
    disabilityCertificate?: File;      // Optional (PDF, JPG, PNG - Max 5MB)
    bankPassbook?: File;               // Optional (PDF, JPG, PNG - Max 5MB)
  }
}
```

### Final Consent
```typescript
{
  agreed: boolean; // Required (must be true to submit)
}
```

## Complete Registration Payload
```typescript
interface RegistrationFormData {
  personalInfo: PersonalInfo;
  geographicInfo: GeographicInfo;
  familyInfo: FamilyInfo;
  livelihoodInfo: LivelihoodInfo;  // One of the 7 variants
  financialInfo: FinancialInfo;
  agreed: boolean;
}
```

## Usage in TypeScript

```typescript
import { 
  RegistrationFormData,
  PersonalInfo,
  LivelihoodInfo,
  StudentInfo,
  WorkingProfessionalInfo
} from './types';

// Example: Create a registration object
const registration: RegistrationFormData = {
  personalInfo: { /* ... */ },
  geographicInfo: { /* ... */ },
  familyInfo: { /* ... */ },
  livelihoodInfo: { 
    category: 'Student',
    educationLevel: 'Undergraduate',
    // ... other student fields
  } as StudentInfo,
  financialInfo: { /* ... */ },
  agreed: true
};
```

## API Response
```typescript
interface RegistrationResponse {
  success: boolean;
  message: string;
  applicationId?: string;    // Returned on success
  errors?: string[];         // Returned on validation failure
}
```

## Validation Rules

1. **Aadhaar**: Must be exactly 12 digits
2. **PAN**: Format AAAAA9999A (5 letters, 4 digits, 1 letter)
3. **Mobile**: Must be exactly 10 digits
4. **Email**: Must be valid email format
5. **Age (Senior Citizen)**: Minimum 60 years
6. **All monetary values**: Must be non-negative numbers
7. **Document uploads**: PDF, JPG, PNG only, max 5MB each
8. **Consent**: Must be true to submit the form

## Notes

- All currency values are in Indian Rupees (₹)
- Date format: YYYY-MM-DD
- File uploads should be converted to base64 or FormData before API submission
- The livelihood section is polymorphic - only one category's fields are active at a time
