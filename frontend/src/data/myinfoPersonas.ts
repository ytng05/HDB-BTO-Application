interface ValueField<T = string> {
  value?: T
}

interface DescribedField {
  code?: string
  desc?: string
  value?: string
}

interface PhoneField {
  areacode?: ValueField<string>
  prefix?: ValueField<string>
  nbr?: ValueField<string>
}

interface HouseholdIncomeField {
  low?: ValueField<number | string>
  high?: ValueField<number | string>
}

interface NoaField {
  amount?: ValueField<number | string>
  employment?: ValueField<number | string>
}

export interface MyInfoPersona {
  name?: ValueField<string>
  dob?: ValueField<string>
  uinfin?: ValueField<string>
  mobileno?: PhoneField
  email?: ValueField<string>
  marital?: DescribedField
  nationality?: DescribedField
  residentialstatus?: DescribedField
  employment?: ValueField<string>
  occupation?: DescribedField
  monthlyincome?: ValueField<number | string>
  average_monthly_income?: ValueField<number | string>
  householdincome?: HouseholdIncomeField
  noa?: NoaField
}
