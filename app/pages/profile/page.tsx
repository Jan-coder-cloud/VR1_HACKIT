'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('aulaUserData');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setUserData(parsed);
      setEditData(parsed);
    }
    setLoading(false);
  }, []);

  const updateEditData = (section: string, field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('aulaUserData', JSON.stringify(editData));
    setUserData(editData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    // Reset edit data to original
    setEditData(userData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Mock data as fallback if no data in localStorage
  const mockUserData = {
    personalInfo: {
      fullName: 'No Data',
      dateOfBirth: '2000-01-01',
      mobileNumber: 'Not Registered',
      emailAddress: 'Not Registered',
      aadhaarNumber: 'Not Registered',
      panNumber: 'Not Registered',
      gender: 'Not Specified',
      maritalStatus: 'Not Specified',
    },
    geographicInfo: {
      state: 'Not Provided',
      district: 'Not Provided',
      talukBlock: 'Not Provided',
      areaType: 'Not Provided',
      rationCardType: 'Not Provided',
      residentialStatus: 'Not Provided',
    },
    familyInfo: {
      numberOfDependents: 0,
      numberOfChildren: 0,
      spouseWorking: 'Not Provided',
      seniorCitizenInFamily: 'Not Provided',
      differentlyAbledMember: 'Not Provided',
      primaryEarningMember: 'Not Provided',
    },
    livelihoodInfo: {
      category: 'Not Specified',
    },
    financialInfo: {
      annualHouseholdIncome: 0,
      existingInsurance: 'Not Provided',
      existingLoans: 'Not Provided',
      bankAccountLinkedWithAadhaar: 'Not Provided',
      savingsRange: 'Not Provided',
    },
    registrationDate: new Date().toISOString().split('T')[0],
    applicationId: 'Not Registered',
  };

  // Use user data from localStorage or fallback to mock data
  const displayData = (isEditing ? editData : userData) || mockUserData;

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-600/10 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50/40 py-20">

      {/* PROFILE HEADER */}
      <section className="bg-white border-b border-blue-700/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {displayData.personalInfo.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {displayData.personalInfo.fullName}
              </h2>
              <p className="text-slate-600">
                {displayData.personalInfo.emailAddress}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Registered on {new Date(displayData.registrationDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <section className="bg-white/95 border-b border-blue-700/20 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 text-sm">
            {[
              { id: 'personal', label: 'Personal Info' },
              { id: 'geographic', label: 'Geographic' },
              { id: 'family', label: 'Family' },
              { id: 'livelihood', label: 'Livelihood' },
              { id: 'financial', label: 'Financial' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`py-3 px-2 border-b-2 transition-colors ${
                  activeSection === tab.id
                    ? 'border-blue-700 text-blue-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-blue-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT SECTIONS */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-blue-700/20 p-8">
          {/* PERSONAL INFO */}
          {activeSection === 'personal' && (
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InfoField label="Full Name" value={displayData.personalInfo.fullName} 
                  isEditing={isEditing} onChange={(val) => updateEditData('personalInfo', 'fullName', val)} />
                <InfoField label="Date of Birth" value={displayData.personalInfo.dateOfBirth} type="date"
                  isEditing={isEditing} onChange={(val) => updateEditData('personalInfo', 'dateOfBirth', val)} />
                <InfoField label="Mobile Number" value={displayData.personalInfo.mobileNumber} 
                  isEditing={isEditing} onChange={(val) => updateEditData('personalInfo', 'mobileNumber', val)} />
                <InfoField label="Email Address" value={displayData.personalInfo.emailAddress} type="email"
                  isEditing={isEditing} onChange={(val) => updateEditData('personalInfo', 'emailAddress', val)} />
                <InfoField label="Aadhaar Number" value={displayData.personalInfo.aadhaarNumber} 
                  isEditing={isEditing} onChange={(val) => updateEditData('personalInfo', 'aadhaarNumber', val)} />
                <InfoField label="PAN Number" value={displayData.personalInfo.panNumber} 
                  isEditing={isEditing} onChange={(val) => updateEditData('personalInfo', 'panNumber', val)} />
                <InfoField label="Gender" value={displayData.personalInfo.gender} 
                  isEditing={isEditing} onChange={(val) => updateEditData('personalInfo', 'gender', val)} />
                <InfoField label="Marital Status" value={displayData.personalInfo.maritalStatus} 
                  isEditing={isEditing} onChange={(val) => updateEditData('personalInfo', 'maritalStatus', val)} />
              </div>
            </div>
          )}

          {/* GEOGRAPHIC INFO */}
          {activeSection === 'geographic' && (
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
                 Geographic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InfoField label="State" value={displayData.geographicInfo.state} 
                  isEditing={isEditing} onChange={(val) => updateEditData('geographicInfo', 'state', val)} />
                <InfoField label="District" value={displayData.geographicInfo.district} 
                  isEditing={isEditing} onChange={(val) => updateEditData('geographicInfo', 'district', val)} />
                <InfoField label="Taluk / Block" value={displayData.geographicInfo.talukBlock} 
                  isEditing={isEditing} onChange={(val) => updateEditData('geographicInfo', 'talukBlock', val)} />
                <InfoField label="Area Type" value={displayData.geographicInfo.areaType} 
                  isEditing={isEditing} onChange={(val) => updateEditData('geographicInfo', 'areaType', val)} />
                <InfoField label="Ration Card Type" value={displayData.geographicInfo.rationCardType} 
                  isEditing={isEditing} onChange={(val) => updateEditData('geographicInfo', 'rationCardType', val)} />
                <InfoField label="Residential Status" value={displayData.geographicInfo.residentialStatus} 
                  isEditing={isEditing} onChange={(val) => updateEditData('geographicInfo', 'residentialStatus', val)} />
              </div>
            </div>
          )}

          {/* FAMILY INFO */}
          {activeSection === 'family' && (
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
                Family Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InfoField label="Number of Dependents" value={displayData.familyInfo.numberOfDependents?.toString() || ''} type="number"
                  isEditing={isEditing} onChange={(val) => updateEditData('familyInfo', 'numberOfDependents', val)} />
                <InfoField label="Number of Children" value={displayData.familyInfo.numberOfChildren?.toString() || ''} type="number"
                  isEditing={isEditing} onChange={(val) => updateEditData('familyInfo', 'numberOfChildren', val)} />
                <InfoField label="Spouse Working?" value={displayData.familyInfo.spouseWorking} 
                  isEditing={isEditing} onChange={(val) => updateEditData('familyInfo', 'spouseWorking', val)} />
                <InfoField label="Senior Citizen in Family?" value={displayData.familyInfo.seniorCitizenInFamily} 
                  isEditing={isEditing} onChange={(val) => updateEditData('familyInfo', 'seniorCitizenInFamily', val)} />
                <InfoField label="Differently Abled Member?" value={displayData.familyInfo.differentlyAbledMember} 
                  isEditing={isEditing} onChange={(val) => updateEditData('familyInfo', 'differentlyAbledMember', val)} />
                <InfoField label="Primary Earning Member" value={displayData.familyInfo.primaryEarningMember} 
                  isEditing={isEditing} onChange={(val) => updateEditData('familyInfo', 'primaryEarningMember', val)} />
              </div>
            </div>
          )}

          {/* LIVELIHOOD INFO */}
          {activeSection === 'livelihood' && (
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
                Livelihood Information
              </h3>
              <div className="mb-4">
                <span className="inline-block bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {displayData.livelihoodInfo.category || 'Not Specified'}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {displayData.livelihoodInfo.category === 'Student' && (
                  <>
                    <InfoField label="Education Level" value={displayData.livelihoodInfo.educationLevel} />
                    <InfoField label="Institution Name" value={displayData.livelihoodInfo.institutionName} />
                    <InfoField label="Course Type" value={displayData.livelihoodInfo.courseType} />
                    <InfoField label="Scholarship Receiving?" value={displayData.livelihoodInfo.scholarshipReceiving} />
                    <InfoField label="Annual Family Income" value={displayData.livelihoodInfo.annualFamilyIncome ? `₹${displayData.livelihoodInfo.annualFamilyIncome.toLocaleString('en-IN')}` : 'N/A'} />
                  </>
                )}
                {displayData.livelihoodInfo.category === 'Working Professional' && (
                  <>
                    <InfoField label="Company/Organization Name" value={displayData.livelihoodInfo.companyName} />
                    <InfoField label="Designation" value={displayData.livelihoodInfo.designation} />
                    <InfoField label="Employment Type" value={displayData.livelihoodInfo.employmentType} />
                    <InfoField label="Years of Experience" value={displayData.livelihoodInfo.yearsOfExperience?.toString() || 'N/A'} />
                    <InfoField label="Monthly Salary" value={displayData.livelihoodInfo.monthlySalary ? `₹${displayData.livelihoodInfo.monthlySalary.toLocaleString('en-IN')}` : 'N/A'} />
                    <InfoField label="Industry Sector" value={displayData.livelihoodInfo.industrySector} />
                  </>
                )}
                {displayData.livelihoodInfo.category === 'Self-Employed' && (
                  <>
                    <InfoField label="Business/Trade Name" value={displayData.livelihoodInfo.businessName} />
                    <InfoField label="Type of Business" value={displayData.livelihoodInfo.typeOfBusiness} />
                    <InfoField label="Years in Business" value={displayData.livelihoodInfo.yearsInBusiness?.toString() || 'N/A'} />
                    <InfoField label="Monthly Average Income" value={displayData.livelihoodInfo.monthlyAverageIncome ? `₹${displayData.livelihoodInfo.monthlyAverageIncome.toLocaleString('en-IN')}` : 'N/A'} />
                    <InfoField label="Business Registration Status" value={displayData.livelihoodInfo.businessRegistrationStatus} />
                    <InfoField label="Number of Employees" value={displayData.livelihoodInfo.numberOfEmployees?.toString() || 'N/A'} />
                  </>
                )}
                {displayData.livelihoodInfo.category === 'Farmer' && (
                  <>
                    <InfoField label="Land Size (Acres)" value={displayData.livelihoodInfo.landSize?.toString() || 'N/A'} />
                    <InfoField label="Crop Type" value={displayData.livelihoodInfo.cropType} />
                    <InfoField label="Irrigation Type" value={displayData.livelihoodInfo.irrigationType} />
                    <InfoField label="Annual Agricultural Income" value={displayData.livelihoodInfo.annualAgriculturalIncome ? `₹${displayData.livelihoodInfo.annualAgriculturalIncome.toLocaleString('en-IN')}` : 'N/A'} />
                    <InfoField label="Land Ownership" value={displayData.livelihoodInfo.landOwnership} />
                    <InfoField label="Livestock" value={displayData.livelihoodInfo.livestock || 'N/A'} />
                  </>
                )}
                {displayData.livelihoodInfo.category === 'Unemployed' && (
                  <>
                    <InfoField label="Last Employment" value={displayData.livelihoodInfo.lastEmployment || 'N/A'} />
                    <InfoField label="Duration of Unemployment (Months)" value={displayData.livelihoodInfo.durationOfUnemployment?.toString() || 'N/A'} />
                    <InfoField label="Registered with Employment Exchange?" value={displayData.livelihoodInfo.employmentExchangeRegistered} />
                    <InfoField label="Actively Seeking Employment?" value={displayData.livelihoodInfo.activelySeeking} />
                    <InfoField label="Highest Qualification" value={displayData.livelihoodInfo.highestQualification} />
                    <InfoField label="Receiving Any Govt. Support?" value={displayData.livelihoodInfo.receivingGovtSupport} />
                  </>
                )}
                {displayData.livelihoodInfo.category === 'Senior Citizen' && (
                  <>
                    <InfoField label="Age" value={displayData.livelihoodInfo.age?.toString() || 'N/A'} />
                    <InfoField label="Receiving Pension?" value={displayData.livelihoodInfo.receivingPension} />
                    <InfoField label="Pension Amount" value={displayData.livelihoodInfo.pensionAmount ? `₹${displayData.livelihoodInfo.pensionAmount.toLocaleString('en-IN')}` : 'N/A'} />
                    <InfoField label="Health Condition" value={displayData.livelihoodInfo.healthCondition} />
                    <InfoField label="Living Status" value={displayData.livelihoodInfo.livingStatus} />
                    <InfoField label="Source of Income" value={displayData.livelihoodInfo.sourceOfIncome} />
                  </>
                )}
                {displayData.livelihoodInfo.category === 'Homemaker' && (
                  <>
                    <InfoField label="Spouse Employment Status" value={displayData.livelihoodInfo.spouseEmploymentStatus} />
                    <InfoField label="Spouse Monthly Income" value={displayData.livelihoodInfo.spouseMonthlyIncome ? `₹${displayData.livelihoodInfo.spouseMonthlyIncome.toLocaleString('en-IN')}` : 'N/A'} />
                    <InfoField label="Number of Dependents" value={displayData.livelihoodInfo.numberOfDependents?.toString() || 'N/A'} />
                    <InfoField label="Additional Income Source?" value={displayData.livelihoodInfo.additionalIncomeSource} />
                    <InfoField label="Additional Income" value={displayData.livelihoodInfo.additionalIncome ? `₹${displayData.livelihoodInfo.additionalIncome.toLocaleString('en-IN')}` : 'N/A'} />
                    <InfoField label="Interested in Skill Training?" value={displayData.livelihoodInfo.interestedInSkillTraining} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* FINANCIAL INFO */}
          {activeSection === 'financial' && (
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
                 Financial Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <InfoField 
                  label="Annual Household Income" 
                  value={displayData.financialInfo.annualHouseholdIncome?.toString() || '0'} 
                  type="number"
                  isEditing={isEditing} 
                  onChange={(val) => updateEditData('financialInfo', 'annualHouseholdIncome', val)} 
                />
                <InfoField label="Existing Insurance" value={displayData.financialInfo.existingInsurance} 
                  isEditing={isEditing} onChange={(val) => updateEditData('financialInfo', 'existingInsurance', val)} />
                <InfoField label="Existing Loans" value={displayData.financialInfo.existingLoans} 
                  isEditing={isEditing} onChange={(val) => updateEditData('financialInfo', 'existingLoans', val)} />
                <InfoField label="Bank Account Linked with Aadhaar" value={displayData.financialInfo.bankAccountLinkedWithAadhaar} 
                  isEditing={isEditing} onChange={(val) => updateEditData('financialInfo', 'bankAccountLinkedWithAadhaar', val)} />
                <InfoField label="Savings Range" value={displayData.financialInfo.savingsRange} 
                  isEditing={isEditing} onChange={(val) => updateEditData('financialInfo', 'savingsRange', val)} />
              </div>

              <div className="mt-8 pt-6 border-t border-blue-700/20">
                <h4 className="font-semibold text-slate-900 mb-4">Uploaded Documents</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <DocumentStatus label="Income Certificate" status="uploaded" />
                  <DocumentStatus label="Aadhaar Card Copy" status="uploaded" />
                  <DocumentStatus label="Ration Card" status="uploaded" />
                  <DocumentStatus label="Caste Certificate" status="not-uploaded" />
                  <DocumentStatus label="Disability Certificate" status="not-uploaded" />
                  <DocumentStatus label="Bank Passbook First Page" status="uploaded" />
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="mt-8 pt-6 border-t border-blue-700/20 flex gap-4">
            {!isEditing ? (
              <button 
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleCancel}
                  className="px-6 py-2 border border-blue-700/30 text-blue-700 rounded-md hover:bg-blue-600/10 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function InfoField({ label, value, isEditing, onChange, type = "text" }: { 
  label: string; 
  value: string; 
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: string;
}) {
  const getDisplayValue = () => {
    if (label.includes('Income') && !isEditing && value && value !== 'Not provided') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `₹${numValue.toLocaleString('en-IN')}`;
      }
    }
    if (label === 'Date of Birth' && !isEditing && value && value !== 'Not provided') {
      try {
        return new Date(value).toLocaleDateString('en-IN');
      } catch {
        return value;
      }
    }
    return value;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-500 mb-1">
        {label}
      </label>
      {isEditing && onChange ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-blue-700/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 text-slate-900 bg-white"
        />
      ) : (
        <p className="text-base text-slate-900 font-medium">
          {getDisplayValue() || 'Not provided'}
        </p>
      )}
    </div>
  );
}

function DocumentStatus({ label, status }: { label: string; status: 'uploaded' | 'not-uploaded' }) {
  return (
    <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-md border border-blue-700/20">
      <span className="text-sm text-slate-700">{label}</span>
      {status === 'uploaded' ? (
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
          ✓ Uploaded
        </span>
      ) : (
        <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-medium">
          Not uploaded
        </span>
      )}
    </div>
  );
}
