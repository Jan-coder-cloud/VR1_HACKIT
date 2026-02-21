'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const totalSteps = 5;

  // Form Data State
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      mobileNumber: '',
      emailAddress: '',
      aadhaarNumber: '',
      panNumber: '',
      gender: '',
      maritalStatus: '',
    },
    geographicInfo: {
      state: '',
      district: '',
      talukBlock: '',
      areaType: '',
      rationCardType: '',
      residentialStatus: '',
    },
    familyInfo: {
      numberOfDependents: '',
      numberOfChildren: '',
      spouseWorking: '',
      seniorCitizenInFamily: '',
      differentlyAbledMember: '',
      primaryEarningMember: '',
    },
    livelihoodInfo: {
      category: '',
      // Dynamic fields added based on category
    },
    financialInfo: {
      annualHouseholdIncome: '',
      existingInsurance: '',
      existingLoans: '',
      bankAccountLinkedWithAadhaar: '',
      savingsRange: '',
    },
  });

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    // Generate application ID
    const applicationId = 'AULA' + new Date().getFullYear() + 
      String(new Date().getMonth() + 1).padStart(2, '0') + 
      String(new Date().getDate()).padStart(2, '0') + 
      String(Math.floor(Math.random() * 100000)).padStart(5, '0');

    // Save to localStorage
    const registrationData = {
      ...formData,
      registrationDate: new Date().toISOString().split('T')[0],
      applicationId: applicationId,
    };

    localStorage.setItem('aulaUserData', JSON.stringify(registrationData));
    
    // Redirect to profile page
    alert(`Registration Successful! Your Application ID is: ${applicationId}`);
    router.push('/pages/profile');
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <main className="min-h-screen bg-[#F4F6F9]">

      {/* ================= HEADER ================= */}
      <header className="bg-[#0B3D91] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <div>
            <h1 className="text-lg font-semibold">AULA</h1>
            <p className="text-sm opacity-80">
              Personalized Financial & Insurance Scheme Portal
            </p>
          </div>
          <div className="text-right text-xs">
            <p>Secure Registration</p>
            <p>🔒 SSL Encrypted</p>
          </div>
        </div>
      </header>

      {/* ================= STEP NAVIGATION ================= */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between text-sm">
          {['Personal','Geographic','Family','Livelihood','Financial & Docs']
            .map((label, index) => (
              <div
                key={index}
                onClick={() => setStep(index + 1)}
                className={`flex-1 text-center cursor-pointer transition-colors
                  ${step === index + 1
                    ? 'text-[#0B3D91] font-semibold border-b-2 border-[#0B3D91] pb-2'
                    : 'text-gray-500 hover:text-[#0B3D91]'
                  }`}
              >
                {label}
              </div>
          ))}
        </div>
      </div>

      {/* ================= FORM ================= */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-8">

          <h2 className="text-xl font-semibold text-[#0B3D91] mb-6">
            Step {step}
          </h2>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Full Name" required value={formData.personalInfo.fullName} 
                onChange={(e: any) => updateFormData('personalInfo', 'fullName', e.target.value)} />
              <Input label="Date of Birth" type="date" required value={formData.personalInfo.dateOfBirth}
                onChange={(e: any) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)} />
              <Input label="Mobile Number" required value={formData.personalInfo.mobileNumber}
                onChange={(e: any) => updateFormData('personalInfo', 'mobileNumber', e.target.value)} />
              <Input label="Email Address" type="email" value={formData.personalInfo.emailAddress}
                onChange={(e: any) => updateFormData('personalInfo', 'emailAddress', e.target.value)} />
              <Input label="Aadhaar Number" required value={formData.personalInfo.aadhaarNumber}
                onChange={(e: any) => updateFormData('personalInfo', 'aadhaarNumber', e.target.value)} />
              <Input label="PAN Number" value={formData.personalInfo.panNumber}
                onChange={(e: any) => updateFormData('personalInfo', 'panNumber', e.target.value)} />
              <Select label="Gender" options={['Male','Female','Other']} value={formData.personalInfo.gender}
                onChange={(e: any) => updateFormData('personalInfo', 'gender', e.target.value)} />
              <Select label="Marital Status" options={['Single','Married']} value={formData.personalInfo.maritalStatus}
                onChange={(e: any) => updateFormData('personalInfo', 'maritalStatus', e.target.value)} />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="State" required value={formData.geographicInfo.state}
                onChange={(e: any) => updateFormData('geographicInfo', 'state', e.target.value)} />
              <Input label="District" required value={formData.geographicInfo.district}
                onChange={(e: any) => updateFormData('geographicInfo', 'district', e.target.value)} />
              <Input label="Taluk / Block" value={formData.geographicInfo.talukBlock}
                onChange={(e: any) => updateFormData('geographicInfo', 'talukBlock', e.target.value)} />
              <Select label="Area Type" options={['Urban','Rural','Semi-Urban']} value={formData.geographicInfo.areaType}
                onChange={(e: any) => updateFormData('geographicInfo', 'areaType', e.target.value)} />
              <Select label="Ration Card Type" options={['APL','BPL','Antyodaya','None']} value={formData.geographicInfo.rationCardType}
                onChange={(e: any) => updateFormData('geographicInfo', 'rationCardType', e.target.value)} />
              <Select label="Residential Status" options={['Own House','Rented','Temporary Shelter']} value={formData.geographicInfo.residentialStatus}
                onChange={(e: any) => updateFormData('geographicInfo', 'residentialStatus', e.target.value)} />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Number of Dependents" type="number" required value={formData.familyInfo.numberOfDependents}
                onChange={(e: any) => updateFormData('familyInfo', 'numberOfDependents', e.target.value)} />
              <Input label="Number of Children" type="number" value={formData.familyInfo.numberOfChildren}
                onChange={(e: any) => updateFormData('familyInfo', 'numberOfChildren', e.target.value)} />
              <Select label="Spouse Working?" options={['Yes','No']} value={formData.familyInfo.spouseWorking}
                onChange={(e: any) => updateFormData('familyInfo', 'spouseWorking', e.target.value)} />
              <Select label="Senior Citizen in Family?" options={['Yes','No']} value={formData.familyInfo.seniorCitizenInFamily}
                onChange={(e: any) => updateFormData('familyInfo', 'seniorCitizenInFamily', e.target.value)} />
              <Select label="Differently Abled Member?" options={['Yes','No']} value={formData.familyInfo.differentlyAbledMember}
                onChange={(e: any) => updateFormData('familyInfo', 'differentlyAbledMember', e.target.value)} />
              <Select label="Primary Earning Member" options={['Self','Spouse','Parent','Other']} value={formData.familyInfo.primaryEarningMember}
                onChange={(e: any) => updateFormData('familyInfo', 'primaryEarningMember', e.target.value)} />
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && <LivelihoodSection formData={formData} updateFormData={updateFormData} />}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-6">

              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Annual Household Income (₹)" type="number" required value={formData.financialInfo.annualHouseholdIncome}
                  onChange={(e: any) => updateFormData('financialInfo', 'annualHouseholdIncome', e.target.value)} />
                <Select label="Existing Insurance?" options={['Yes','No']} value={formData.financialInfo.existingInsurance}
                  onChange={(e: any) => updateFormData('financialInfo', 'existingInsurance', e.target.value)} />
                <Select label="Existing Loans?" options={['Yes','No']} value={formData.financialInfo.existingLoans}
                  onChange={(e: any) => updateFormData('financialInfo', 'existingLoans', e.target.value)} />
                <Select label="Bank Account Linked with Aadhaar?" options={['Yes','No']} value={formData.financialInfo.bankAccountLinkedWithAadhaar}
                  onChange={(e: any) => updateFormData('financialInfo', 'bankAccountLinkedWithAadhaar', e.target.value)} />
                <Select label="Savings Range" options={[
                  'Below ₹50,000',
                  '₹50,000 - ₹2,00,000',
                  '₹2,00,000 - ₹5,00,000',
                  'Above ₹5,00,000'
                ]} value={formData.financialInfo.savingsRange}
                  onChange={(e: any) => updateFormData('financialInfo', 'savingsRange', e.target.value)} />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-[#0B3D91] mb-4">
                  Document Upload Section
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <FileUpload label="Income Certificate" />
                  <FileUpload label="Aadhaar Card Copy" />
                  <FileUpload label="Ration Card" />
                  <FileUpload label="Caste Certificate (If Applicable)" />
                  <FileUpload label="Disability Certificate (If Applicable)" />
                  <FileUpload label="Bank Passbook First Page" />
                </div>
              </div>

              <div className="border-t pt-6">
                <label className="flex items-start gap-3 text-sm text-black">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={() => setAgreed(!agreed)}
                    className="mt-1"
                  />
                  I hereby declare that the information provided is true and correct
                  and I consent to verification under government regulations.
                </label>
              </div>

            </div>
          )}

          {/* BUTTONS */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-5 py-2 border border-gray-400 rounded-md hover:bg-gray-100"
              >
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-[#0B3D91] text-white rounded-md hover:bg-[#092f6b]"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!agreed}
                className={`ml-auto px-6 py-2 rounded-md text-white
                  ${agreed
                    ? 'bg-green-700 hover:bg-green-800'
                    : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                Submit Application
              </button>
            )}
          </div>

        </div>

        <p className="text-xs text-center mt-6 text-gray-600">
          © 2026 Government of India. All rights reserved.
        </p>

      </section>
    </main>
  );
}

/* ================= LIVELIHOOD ================= */

function LivelihoodSection({ formData, updateFormData }: any) {
  const category = formData.livelihoodInfo.category || "";
  
  const updateLivelihoodField = (field: string, value: any) => {
    updateFormData('livelihoodInfo', field, value);
  };

  const setCategory = (value: string) => {
    // Reset livelihood info when category changes
    updateFormData('livelihoodInfo', 'category', value);
  };

  return (
    <div className="space-y-6">
      <Select
        label="Select Livelihood Category"
        options={[
          "Student",
          "Working Professional",
          "Self-Employed",
          "Farmer",
          "Unemployed",
          "Senior Citizen",
          "Homemaker",
        ]}
        value={category}
        onChange={(e: any) => setCategory(e.target.value)}
      />

      {category === "Student" && (
        <div className="grid md:grid-cols-2 gap-5 border p-5 rounded-md bg-gray-50">
          <Input label="Education Level" required value={formData.livelihoodInfo.educationLevel}
            onChange={(e: any) => updateLivelihoodField('educationLevel', e.target.value)} />
          <Input label="Institution Name" required value={formData.livelihoodInfo.institutionName}
            onChange={(e: any) => updateLivelihoodField('institutionName', e.target.value)} />
          <Select label="Course Type" options={["School","Undergraduate","Postgraduate","Diploma"]} 
            value={formData.livelihoodInfo.courseType}
            onChange={(e: any) => updateLivelihoodField('courseType', e.target.value)} />
          <Select label="Scholarship Receiving?" options={["Yes","No"]} 
            value={formData.livelihoodInfo.scholarshipReceiving}
            onChange={(e: any) => updateLivelihoodField('scholarshipReceiving', e.target.value)} />
          <Input label="Annual Family Income (₹)" type="number" 
            value={formData.livelihoodInfo.annualFamilyIncome}
            onChange={(e: any) => updateLivelihoodField('annualFamilyIncome', e.target.value)} />
        </div>
      )}

      {category === "Working Professional" && (
        <div className="grid md:grid-cols-2 gap-5 border p-5 rounded-md bg-gray-50">
          <Input label="Company/Organization Name" required 
            value={formData.livelihoodInfo.companyName}
            onChange={(e: any) => updateLivelihoodField('companyName', e.target.value)} />
          <Input label="Designation" required 
            value={formData.livelihoodInfo.designation}
            onChange={(e: any) => updateLivelihoodField('designation', e.target.value)} />
          <Select label="Employment Type" options={["Permanent","Contract","Part-time","Temporary"]} 
            value={formData.livelihoodInfo.employmentType}
            onChange={(e: any) => updateLivelihoodField('employmentType', e.target.value)} />
          <Input label="Years of Experience" type="number" 
            value={formData.livelihoodInfo.yearsOfExperience}
            onChange={(e: any) => updateLivelihoodField('yearsOfExperience', e.target.value)} />
          <Input label="Monthly Salary (₹)" type="number" required 
            value={formData.livelihoodInfo.monthlySalary}
            onChange={(e: any) => updateLivelihoodField('monthlySalary', e.target.value)} />
          <Select label="Industry Sector" options={["IT","Healthcare","Education","Manufacturing","Finance","Government","Other"]} 
            value={formData.livelihoodInfo.industrySector}
            onChange={(e: any) => updateLivelihoodField('industrySector', e.target.value)} />
        </div>
      )}

      {category === "Self-Employed" && (
        <div className="grid md:grid-cols-2 gap-5 border p-5 rounded-md bg-gray-50">
          <Input label="Business/Trade Name" required 
            value={formData.livelihoodInfo.businessName}
            onChange={(e: any) => updateLivelihoodField('businessName', e.target.value)} />
          <Input label="Type of Business" required 
            value={formData.livelihoodInfo.typeOfBusiness}
            onChange={(e: any) => updateLivelihoodField('typeOfBusiness', e.target.value)} />
          <Input label="Years in Business" type="number" 
            value={formData.livelihoodInfo.yearsInBusiness}
            onChange={(e: any) => updateLivelihoodField('yearsInBusiness', e.target.value)} />
          <Input label="Monthly Average Income (₹)" type="number" required 
            value={formData.livelihoodInfo.monthlyAverageIncome}
            onChange={(e: any) => updateLivelihoodField('monthlyAverageIncome', e.target.value)} />
          <Select label="Business Registration Status" options={["Registered","Unregistered"]} 
            value={formData.livelihoodInfo.businessRegistrationStatus}
            onChange={(e: any) => updateLivelihoodField('businessRegistrationStatus', e.target.value)} />
          <Input label="Number of Employees" type="number" 
            value={formData.livelihoodInfo.numberOfEmployees}
            onChange={(e: any) => updateLivelihoodField('numberOfEmployees', e.target.value)} />
        </div>
      )}

      {category === "Farmer" && (
        <div className="grid md:grid-cols-2 gap-5 border p-5 rounded-md bg-gray-50">
          <Input label="Land Size (Acres)" type="number" required 
            value={formData.livelihoodInfo.landSize}
            onChange={(e: any) => updateLivelihoodField('landSize', e.target.value)} />
          <Input label="Crop Type" required 
            value={formData.livelihoodInfo.cropType}
            onChange={(e: any) => updateLivelihoodField('cropType', e.target.value)} />
          <Select label="Irrigation Type" options={["Rain-fed","Borewell","Canal","Mixed"]} 
            value={formData.livelihoodInfo.irrigationType}
            onChange={(e: any) => updateLivelihoodField('irrigationType', e.target.value)} />
          <Input label="Annual Agricultural Income (₹)" type="number" 
            value={formData.livelihoodInfo.annualAgriculturalIncome}
            onChange={(e: any) => updateLivelihoodField('annualAgriculturalIncome', e.target.value)} />
          <Select label="Land Ownership" options={["Owned","Leased","Sharecropping"]} 
            value={formData.livelihoodInfo.landOwnership}
            onChange={(e: any) => updateLivelihoodField('landOwnership', e.target.value)} />
          <Input label="Livestock (If Any)" 
            value={formData.livelihoodInfo.livestock}
            onChange={(e: any) => updateLivelihoodField('livestock', e.target.value)} />
        </div>
      )}

      {category === "Unemployed" && (
        <div className="grid md:grid-cols-2 gap-5 border p-5 rounded-md bg-gray-50">
          <Input label="Last Employment (If Any)" 
            value={formData.livelihoodInfo.lastEmployment}
            onChange={(e: any) => updateLivelihoodField('lastEmployment', e.target.value)} />
          <Input label="Duration of Unemployment (Months)" type="number" 
            value={formData.livelihoodInfo.durationOfUnemployment}
            onChange={(e: any) => updateLivelihoodField('durationOfUnemployment', e.target.value)} />
          <Select label="Registered with Employment Exchange?" options={["Yes","No"]} 
            value={formData.livelihoodInfo.employmentExchangeRegistered}
            onChange={(e: any) => updateLivelihoodField('employmentExchangeRegistered', e.target.value)} />
          <Select label="Actively Seeking Employment?" options={["Yes","No"]} 
            value={formData.livelihoodInfo.activelySeeking}
            onChange={(e: any) => updateLivelihoodField('activelySeeking', e.target.value)} />
          <Input label="Highest Qualification" required 
            value={formData.livelihoodInfo.highestQualification}
            onChange={(e: any) => updateLivelihoodField('highestQualification', e.target.value)} />
          <Select label="Receiving Any Govt. Support?" options={["Yes","No"]} 
            value={formData.livelihoodInfo.receivingGovtSupport}
            onChange={(e: any) => updateLivelihoodField('receivingGovtSupport', e.target.value)} />
        </div>
      )}

      {category === "Senior Citizen" && (
        <div className="grid md:grid-cols-2 gap-5 border p-5 rounded-md bg-gray-50">
          <Input label="Age" type="number" required 
            value={formData.livelihoodInfo.age}
            onChange={(e: any) => updateLivelihoodField('age', e.target.value)} />
          <Select label="Receiving Pension?" options={["Yes","No"]} 
            value={formData.livelihoodInfo.receivingPension}
            onChange={(e: any) => updateLivelihoodField('receivingPension', e.target.value)} />
          <Input label="Pension Amount (₹)" type="number" 
            value={formData.livelihoodInfo.pensionAmount}
            onChange={(e: any) => updateLivelihoodField('pensionAmount', e.target.value)} />
          <Select label="Health Condition" options={["Good","Fair","Poor","Requires Assistance"]} 
            value={formData.livelihoodInfo.healthCondition}
            onChange={(e: any) => updateLivelihoodField('healthCondition', e.target.value)} />
          <Select label="Living Status" options={["With Family","Alone","Old Age Home"]} 
            value={formData.livelihoodInfo.livingStatus}
            onChange={(e: any) => updateLivelihoodField('livingStatus', e.target.value)} />
          <Select label="Source of Income" options={["Pension","Savings","Family Support","None"]} 
            value={formData.livelihoodInfo.sourceOfIncome}
            onChange={(e: any) => updateLivelihoodField('sourceOfIncome', e.target.value)} />
        </div>
      )}

      {category === "Homemaker" && (
        <div className="grid md:grid-cols-2 gap-5 border p-5 rounded-md bg-gray-50">
          <Select label="Spouse Employment Status" options={["Employed","Unemployed","Self-Employed"]} 
            value={formData.livelihoodInfo.spouseEmploymentStatus}
            onChange={(e: any) => updateLivelihoodField('spouseEmploymentStatus', e.target.value)} />
          <Input label="Spouse Monthly Income (₹)" type="number" 
            value={formData.livelihoodInfo.spouseMonthlyIncome}
            onChange={(e: any) => updateLivelihoodField('spouseMonthlyIncome', e.target.value)} />
          <Input label="Number of Dependents" type="number" 
            value={formData.livelihoodInfo.numberOfDependents}
            onChange={(e: any) => updateLivelihoodField('numberOfDependents', e.target.value)} />
          <Select label="Any Additional Income Source?" options={["Yes","No"]} 
            value={formData.livelihoodInfo.additionalIncomeSource}
            onChange={(e: any) => updateLivelihoodField('additionalIncomeSource', e.target.value)} />
          <Input label="Additional Income (If Any) (₹)" type="number" 
            value={formData.livelihoodInfo.additionalIncome}
            onChange={(e: any) => updateLivelihoodField('additionalIncome', e.target.value)} />
          <Select label="Interested in Skill Training?" options={["Yes","No"]} 
            value={formData.livelihoodInfo.interestedInSkillTraining}
            onChange={(e: any) => updateLivelihoodField('interestedInSkillTraining', e.target.value)} />
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Input({ label, type = "text", required = false, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        className="mt-2 w-full bg-white text-black border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
      />
    </div>
  );
}

function Select({ label, options, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="mt-2 w-full bg-white text-black border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
      >
        <option value="">Select</option>
        {options.map((opt: string, index: number) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileUpload({ label }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800">{label}</label>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="mt-2 w-full bg-white text-black border border-dashed border-gray-400 rounded-md p-3 text-sm file:bg-[#0B3D91] file:text-white file:px-4 file:py-1 file:rounded file:border-0"
      />
      <p className="text-xs text-gray-500 mt-1">
        Accepted formats: PDF, JPG, PNG (Max 5MB)
      </p>
    </div>
  );
}
