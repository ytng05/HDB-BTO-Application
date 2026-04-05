# HDB Flat Portal - Demo Scenarios (Actual MockPass Personas)

**Created:** 2026-04-05
**Source:** `v3.json` MockPass Test Data
**Status:** Using Real Test Personas - Ready for Demo

These scenarios use **actual personas from MockPass v3.json** test data, not fictional profiles.

---

## Scenario 1: Single Applicant - 2-Room Flexi (PASS)

### 👤 Profile Summary

| Field | Value |
|-------|-------|
| **NRIC** | S9912364H |
| **Name** | VENKATA NARASIMHA RAJUVARIPET |
| **Date of Birth** | 1960-05-17 |
| **Age** | 65 years old |
| **Gender** | Male |
| **Citizenship** | Singapore Citizen |
| **Marital Status** | Single |
| **Occupation** | (Not specified) |
| **Monthly Income** | $3,056.50 SGD |
| **Annual Income** | $36,678 SGD |

### ✅ Eligibility Analysis

**2-Room Flexi Income Ceiling:** $3,500/month

- Monthly Income: $3,056.50 ✅ **PASS** (Below $3,500)
- Citizenship: Singapore Citizen ✅ **PASS**
- Marital Status: Single ✅ **PASS**
- Age: 65 ⚠️ (Eligible but older applicant)

**Overall:** ✅ **ELIGIBLE - WILL PASS VALIDATION**

### 📄 Full MyInfo v3 JSON Profile

```json
{
  "uinfin": {
    "value": "S9912364H"
  },
  "name": {
    "value": "VENKATA NARASIMHA RAJUVARIPET"
  },
  "sex": {
    "code": "M",
    "desc": "MALE"
  },
  "dob": {
    "value": "1960-05-17"
  },
  "marital": {
    "code": "1",
    "desc": "SINGLE"
  },
  "residentialstatus": {
    "code": "C",
    "desc": "CITIZEN"
  },
  "nationality": {
    "code": "SG",
    "desc": "SINGAPORE"
  },
  "noa": {
    "amount": {
      "value": 36678
    },
    "employment": {
      "value": 36678
    },
    "trade": {
      "value": 0
    },
    "interest": {
      "value": 0
    },
    "rent": {
      "value": 0
    },
    "yearofassessment": {
      "value": "2019"
    }
  },
  "monthlyincome": {
    "value": 3056.50
  }
}
```

### 📑 Required Documents

1. **Income Certificate (PDF)**
   - Show annual income: $36,678 or monthly: $3,056.50
   - Latest income tax return or payslip
   - Filename: `income_S9912364H.pdf`

2. **HFE Letter (PDF)**
   - Housing Finance Enhancement certificate
   - Show approved loan amount for 2-room
   - Filename: `hfe_letter_S9912364H.pdf`

### 🎬 Demo Walkthrough

```
1. Click "Login"
   → Select S9912364H from MockPass dropdown
   → Or enter manually

2. Auth Callback
   → Name shows as "S9912364H"
   → Background enrichment fetches full profile
   → Name updates to "VENKATA NARASIMHA RAJUVARIPET"

3. Application Details
   → Click "Retrieve MyInfo"
   → All fields auto-fill with annual income $36,678
   → Monthly income calculated: $3,056.50
   → Status: ✅ Within 2-Room limit ($3,500)

4. Upload Documents
   → Income PDF (showing $36,678 annual)
   → HFE Letter PDF

5. Submit Application
   → Application submits successfully
   → Status: "PROCESSING"

6. Ballot Results
   → Status: "SUCCESSFUL"
   → Queue Number: Q99123 (derived from NRIC)
   → Ready for flat selection
```

---

## Scenario 2: Couple Application - 5-Room (PASS)

### 👥 Couple Profile

#### Main Applicant
| Field | Value |
|-------|-------|
| **NRIC** | S9812381D |
| **Name** | TAN HENG HUAT |
| **Date of Birth** | 1998-06-06 |
| **Age** | 27 years old |
| **Gender** | Female |
| **Citizenship** | Singapore Citizen |
| **Marital Status** | Married |
| **Occupation** | APPLICATIONS/SYSTEMS PROGRAMMER |
| **Monthly Income** | $5,366.67 SGD |
| **Annual Income** | $64,400 SGD |

#### Co-Applicant (Spouse)
| Field | Value |
|-------|-------|
| **NRIC** | G1612350T |
| **Name** | JENNY LIM WAI FOOK |
| **Date of Birth** | 1992-02-01 |
| **Age** | 34 years old |
| **Gender** | Female |
| **Citizenship** | PR (Permanent Resident) |
| **Marital Status** | Married |
| **Occupation** | (Not specified) |
| **Monthly Income** | $4,500.00 SGD |
| **Annual Income** | $54,000 SGD |

#### Joint Application
| Field | Value |
|-------|-------|
| **Combined Monthly Income** | $9,866.67 SGD |
| **Combined Annual Income** | $118,400 SGD |
| **Flat Type** | 5-Room |
| **Preferred Town** | Punggol |
| **Relationship** | Spouse |

### ✅ Eligibility Analysis

**5-Room Income Ceiling:** $10,000/month

- Combined Income: $9,866.67 ✅ **PASS** (Below $10,000)
- Main Applicant Citizenship: Citizen ✅ **PASS**
- Co-Applicant Status: PR ✅ **PASS**
- Both Married: Yes ✅ **PASS**
- Ages: 27 & 34 ✅ **PASS** (Prime working age)

**Overall:** ✅ **ELIGIBLE - WILL PASS VALIDATION**

### 📄 Main Applicant - MyInfo v3 JSON

```json
{
  "uinfin": {
    "value": "S9812381D"
  },
  "name": {
    "value": "TAN HENG HUAT"
  },
  "sex": {
    "code": "F",
    "desc": "FEMALE"
  },
  "dob": {
    "value": "1998-06-06"
  },
  "marital": {
    "code": "2",
    "desc": "MARRIED"
  },
  "residentialstatus": {
    "code": "C",
    "desc": "CITIZEN"
  },
  "nationality": {
    "code": "SG",
    "desc": "SINGAPORE"
  },
  "occupation": {
    "code": "23241",
    "desc": "APPLICATIONS/SYSTEMS PROGRAMMER"
  },
  "noa": {
    "amount": {
      "value": 64400
    },
    "employment": {
      "value": 64400
    },
    "trade": {
      "value": 0
    },
    "interest": {
      "value": 0
    },
    "rent": {
      "value": 0
    },
    "yearofassessment": {
      "value": "2019"
    }
  },
  "monthlyincome": {
    "value": 5366.67
  }
}
```

### 📄 Co-Applicant - MyInfo v3 JSON

```json
{
  "uinfin": {
    "value": "G1612350T"
  },
  "name": {
    "value": "JENNY LIM WAI FOOK"
  },
  "sex": {
    "code": "F",
    "desc": "FEMALE"
  },
  "dob": {
    "value": "1992-02-01"
  },
  "marital": {
    "code": "2",
    "desc": "MARRIED"
  },
  "residentialstatus": {
    "code": "PR",
    "desc": "PERMANENT RESIDENT"
  },
  "nationality": {
    "code": "SG",
    "desc": "SINGAPORE"
  },
  "noa": {
    "amount": {
      "value": 54000
    },
    "employment": {
      "value": 54000
    },
    "trade": {
      "value": 0
    },
    "interest": {
      "value": 0
    },
    "rent": {
      "value": 0
    },
    "yearofassessment": {
      "value": "2019"
    }
  },
  "monthlyincome": {
    "value": 4500.00
  }
}
```

### 📑 Required Documents

1. **Income Certificate (PDF)** - Main Applicant (S9812381D)
   - Show annual: $64,400 or monthly: $5,366.67
   - Latest income tax return
   - Filename: `income_S9812381D.pdf`

2. **Income Certificate (PDF)** - Co-Applicant (G1612350T)
   - Show annual: $54,000 or monthly: $4,500
   - Latest income tax return
   - Filename: `income_G1612350T.pdf`

3. **HFE Letter (PDF)** - Joint Application
   - Joint housing finance enhancement
   - Show approved loan amount for 5-room (~$500,000-600,000)
   - Filename: `hfe_letter_couple.pdf`

4. **Marriage Certificate** (for validation)
   - Proof of marital relationship
   - (Not required in form submission but in actual HDB process)

### 🎬 Demo Walkthrough

```
1. Main Applicant Logs In
   → Click "Login"
   → Select S9812381D from MockPass
   → Background enrichment: Name becomes "TAN HENG HUAT"

2. Add Co-Applicant
   → Click "Add Co-Applicant"
   → Enter NRIC: G1612350T
   → Select Relationship: Spouse
   → Click "Retrieve MyInfo for Co-Applicant"
   → Profile auto-fills: "JENNY LIM WAI FOOK", $4,500/month

3. Application Summary
   → Main Applicant: $5,366.67/month
   → Co-Applicant: $4,500.00/month
   → Combined Income: $9,866.67/month ✅ Within limit
   → Flat Type: 5-Room
   → Status: "Both applicants ready"

4. Upload Documents
   → Main applicant income PDF
   → Co-applicant income PDF
   → Joint HFE letter

5. Submit Application
   → Both applicants confirmed
   → Application submits successfully
   → Status: "PROCESSING"

6. Ballot Results
   → Status: "SUCCESSFUL"
   → Queue Number: Q98123 (main applicant NRIC)
   → Both applicants shown as eligible
   → Ready for joint flat selection
```

### 📊 Expected Results
- **Main Applicant Queue:** Q98123
- **Status:** SUCCESSFUL
- **Income Check:** ✅ PASS ($9,866.67 < $10,000 ceiling)
- **Citizenship Check:** ✅ PASS (Citizen + PR eligible)
- **Next Step:** Can proceed to flat selection together

---

## Scenario 3: Couple Application - 3-Room (FAIL)

### 👥 Couple Profile

#### Main Applicant
| Field | Value |
|-------|-------|
| **NRIC** | S9912374E |
| **Name** | TIMOTHY TAN CHENG GUAN |
| **Date of Birth** | 1990-04-19 |
| **Age** | 35 years old |
| **Gender** | Male |
| **Citizenship** | PR (Permanent Resident) |
| **Marital Status** | Married |
| **Occupation** | HEALTHCARE ASSISTANT |
| **Monthly Income** | $6,425.00 SGD |
| **Annual Income** | $77,100 SGD |

#### Co-Applicant (Spouse)
| Field | Value |
|-------|-------|
| **NRIC** | G1612350T |
| **Name** | JENNY LIM WAI FOOK |
| **Date of Birth** | 1992-02-01 |
| **Age** | 34 years old |
| **Gender** | Female |
| **Citizenship** | PR (Permanent Resident) |
| **Marital Status** | Married |
| **Occupation** | (Not specified) |
| **Monthly Income** | $4,500.00 SGD |
| **Annual Income** | $54,000 SGD |

#### Joint Application
| Field | Value |
|-------|-------|
| **Combined Monthly Income** | $10,925.00 SGD |
| **Combined Annual Income** | $131,100 SGD |
| **Flat Type** | 3-Room |
| **Preferred Town** | Kallang/Whampoa |
| **Relationship** | Spouse |

### ❌ Eligibility Analysis (WHY IT FAILS)

**3-Room Income Ceiling:** $6,000/month

- Combined Income: $10,925.00 ❌ **EXCEEDS** by $4,925
- **Overage:** 182% of allowed ceiling
- Main Applicant Citizenship: PR ✅ (Acceptable)
- Co-Applicant Status: PR ✅ (Acceptable)
- Both Married: Yes ✅ **PASS**
- Ages: 35 & 34 ✅ **PASS**

**Primary Failure Reason:** 🚫 **Income Ceiling Exceeded**

**Overall:** ❌ **NOT ELIGIBLE - WILL FAIL VALIDATION**

### 📄 Main Applicant - MyInfo v3 JSON

```json
{
  "uinfin": {
    "value": "S9912374E"
  },
  "name": {
    "value": "TIMOTHY TAN CHENG GUAN"
  },
  "sex": {
    "code": "M",
    "desc": "MALE"
  },
  "dob": {
    "value": "1990-04-19"
  },
  "marital": {
    "code": "2",
    "desc": "MARRIED"
  },
  "residentialstatus": {
    "code": "PR",
    "desc": "PERMANENT RESIDENT"
  },
  "nationality": {
    "code": "SG",
    "desc": "SINGAPORE"
  },
  "occupation": {
    "code": "53201",
    "desc": "HEALTHCARE ASSISTANT"
  },
  "noa": {
    "amount": {
      "value": 77100
    },
    "employment": {
      "value": 77100
    },
    "trade": {
      "value": 0
    },
    "interest": {
      "value": 0
    },
    "rent": {
      "value": 0
    },
    "yearofassessment": {
      "value": "2019"
    }
  },
  "monthlyincome": {
    "value": 6425.00
  }
}
```

### 📄 Co-Applicant - MyInfo v3 JSON

```json
{
  "uinfin": {
    "value": "G1612350T"
  },
  "name": {
    "value": "JENNY LIM WAI FOOK"
  },
  "sex": {
    "code": "F",
    "desc": "FEMALE"
  },
  "dob": {
    "value": "1992-02-01"
  },
  "marital": {
    "code": "2",
    "desc": "MARRIED"
  },
  "residentialstatus": {
    "code": "PR",
    "desc": "PERMANENT RESIDENT"
  },
  "nationality": {
    "code": "SG",
    "desc": "SINGAPORE"
  },
  "noa": {
    "amount": {
      "value": 54000
    },
    "employment": {
      "value": 54000
    },
    "trade": {
      "value": 0
    },
    "interest": {
      "value": 0
    },
    "rent": {
      "value": 0
    },
    "yearofassessment": {
      "value": "2019"
    }
  },
  "monthlyincome": {
    "value": 4500.00
  }
}
```

### 📑 Required Documents

1. **Income Certificate (PDF)** - Main Applicant (S9912374E)
   - Show annual: $77,100 or monthly: $6,425
   - Latest income tax return showing high income
   - Filename: `income_S9912374E.pdf`

2. **Income Certificate (PDF)** - Co-Applicant (G1612350T)
   - Show annual: $54,000 or monthly: $4,500
   - Latest income tax return
   - Filename: `income_G1612350T.pdf`

3. **HFE Letter (PDF)**
   - Joint housing finance enhancement
   - Filename: `hfe_letter_couple_fail.pdf`

### 🎬 Demo Walkthrough

```
1. Main Applicant Logs In
   → Click "Login"
   → Select S9912374E from MockPass
   → Name enriches to "TIMOTHY TAN CHENG GUAN"

2. Add Co-Applicant
   → Click "Add Co-Applicant"
   → Enter NRIC: G1612350T
   → Click "Retrieve MyInfo for Co-Applicant"
   → Profile auto-fills: "JENNY LIM WAI FOOK", $4,500/month

3. Application Summary - ⚠️ WARNING
   → Main Applicant: $6,425/month
   → Co-Applicant: $4,500/month
   → Combined Income: $10,925/month
   → Flat Type: 3-Room (ceiling: $6,000)
   → ⚠️ WARNING: Income exceeds limit by $4,925

4. Upload Documents
   → Main applicant income PDF (showing $6,425)
   → Co-applicant income PDF (showing $4,500)
   → Joint HFE letter

5. Submit Application ANYWAY
   → "Warning: Income exceeds ceiling for 3-Room"
   → User acknowledges and submits
   → Status: "PROCESSING"

6. Ballot Validation Run
   → Application goes to validation engine
   → Income check: $10,925 vs $6,000 ceiling
   → Result: FAIL - Income exceeds limit
   → Status updated to: "UNSUCCESSFUL"
   → Rejection Reason: "Combined income exceeds ceiling for 3-Room flat"

7. Dashboard Shows Failure
   → Application listed as "UNSUCCESSFUL"
   → Reason: "Income $10,925/month exceeds 3-Room ceiling of $6,000"
   → User can:
     - Apply for 5-Room instead (ceiling: $10,000) ✅ Would PASS
     - Update application with lower income
     - Contact support
```

### 📊 Expected Results
- **Main Applicant Queue:** Would be Q99123 if processed
- **Status:** UNSUCCESSFUL (after ballot validation)
- **Income Check:** ❌ FAIL
- **Failure Reason:** "Income exceeds ceiling for flat type"
- **Details:** "$10,925 > $6,000 limit"

### 💡 Testing Value

This scenario tests:
1. ✅ Application accepts high-income submission
2. ✅ Validation catches income violation
3. ✅ User sees clear rejection reason
4. ✅ Application saved locally but marked "FAILED"
5. ✅ Admin ballot view shows ineligible applicants
6. ✅ User can retry with different flat type

---

## How to Use These Scenarios

### MockPass Test NRIC Codes

```
Scenario 1 - Single Applicant:
  S9912364H  ← Single, 2-room eligible

Scenario 2 - Couple (PASS):
  S9812381D  ← Main applicant, 5-room eligible
  G1612350T  ← Co-applicant spouse

Scenario 3 - Couple (FAIL):
  S9912374E  ← Main applicant, income too high
  G1612350T  ← Co-applicant spouse (reused)
```

### MockPass Login Methods

**Method 1: Select from Dropdown**
```
1. Click "Login"
2. MockPass shows login page
3. Select NRIC from dropdown
4. Click "Submit"
```

**Method 2: Direct Login with Header (advanced)**
```
http://localhost:5156/singpass/v2/auth?X-Custom-NRIC=S9912364H
```

### Creating Income PDFs

Use any PDF tool to create simple documents:

**Scenario 1 - income_S9912364H.pdf:**
```
INCOME TAX RETURN - YEAR 2019
Name: VENKATA NARASIMHA RAJUVARIPET
NRIC: S9912364H
Annual Income: $36,678
Monthly Income: $3,056.50
Issued: April 2020
```

**Scenario 2 - income_S9812381D.pdf:**
```
INCOME TAX RETURN - YEAR 2019
Name: TAN HENG HUAT
NRIC: S9812381D
Annual Income: $64,400
Monthly Income: $5,366.67
Issued: April 2020
```

**Scenario 2 - income_G1612350T.pdf:**
```
INCOME TAX RETURN - YEAR 2019
Name: JENNY LIM WAI FOOK
NRIC: G1612350T
Annual Income: $54,000
Monthly Income: $4,500.00
Issued: April 2020
```

**Scenario 2 - hfe_letter_couple.pdf:**
```
HOUSING FINANCE ENHANCEMENT LETTER
Applicants: TAN HENG HUAT & JENNY LIM WAI FOOK
NRICs: S9812381D & G1612350T
Approved Loan Amount: $550,000
Date: April 2020
```

**Scenario 3 - income_S9912374E.pdf:**
```
INCOME TAX RETURN - YEAR 2019
Name: TIMOTHY TAN CHENG GUAN
NRIC: S9912374E
Annual Income: $77,100
Monthly Income: $6,425.00
Issued: April 2020
```

**Scenario 3 - hfe_letter_couple_fail.pdf:**
```
HOUSING FINANCE ENHANCEMENT LETTER
Applicants: TIMOTHY TAN CHENG GUAN & JENNY LIM WAI FOOK
NRICs: S9912374E & G1612350T
Approved Loan Amount: $550,000
Date: April 2020
```

---

## Income Ceiling Reference

| Flat Type | Ceiling | Scenario | Income | Status |
|-----------|---------|----------|--------|--------|
| 2-Room Flexi | $3,500 | #1 | $3,056.50 | ✅ PASS |
| 3-Room | $6,000 | #3 | $10,925.00 | ❌ FAIL |
| 4-Room | $8,000 | - | - | - |
| 5-Room | $10,000 | #2 | $9,866.67 | ✅ PASS |
| Executive | $12,000 | - | - | - |

---

## All Personas Used

| NRIC | Name | Gender | Age | Marital | Income/month | Citizenship | Status |
|------|------|--------|-----|---------|--------------|-------------|--------|
| S9912364H | VENKATA NARASIMHA RAJUVARIPET | M | 65 | Single | $3,056.50 | Citizen | Scenario 1 |
| S9812381D | TAN HENG HUAT | F | 27 | Married | $5,366.67 | Citizen | Scenario 2 |
| G1612350T | JENNY LIM WAI FOOK | F | 34 | Married | $4,500.00 | PR | Scenario 2 & 3 |
| S9912374E | TIMOTHY TAN CHENG GUAN | M | 35 | Married | $6,425.00 | PR | Scenario 3 |

---

**Status:** ✅ Ready for Demo
**Source:** MockPass v3.json (31 total personas)
**Date:** 2026-04-05
