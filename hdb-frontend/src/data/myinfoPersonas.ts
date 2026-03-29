/**
 * Mock MyInfo v3 persona data for simulating SingPass login in development.
 *
 * Source: https://github.com/opengovsg/mockpass/blob/main/static/myinfo/v3.json
 * License: MIT — © Open Government Products, GovTech Singapore
 *
 * Each key is an NRIC. The structure mirrors the real MyInfo v3 API response,
 * so this data flows to backend services (Eligibility, HFE, BTO) the same way
 * a real SingPass callback would.
 */
import raw from './v3.json'

export const myinfoPersonas = raw.personas as Record<string, MyInfoPersona>

// ─── MyInfo v3 field shapes ───────────────────────────────────────────────────

export interface MyInfoCodedField {
  lastupdated?: string
  source?: string
  classification?: string
  code: string
  desc: string
}

export interface MyInfoValueField<T = string> {
  lastupdated?: string
  source?: string
  classification?: string
  value: T
}

export interface MyInfoPhone {
  lastupdated?: string
  source?: string
  classification?: string
  areacode: MyInfoValueField
  prefix: MyInfoValueField
  nbr: MyInfoValueField
}

export interface MyInfoAddress {
  type: string
  lastupdated?: string
  source?: string
  classification?: string
  country: MyInfoCodedField
  unit: MyInfoValueField
  street: MyInfoValueField
  block: MyInfoValueField
  building: MyInfoValueField
  floor: MyInfoValueField
  postal: MyInfoValueField
}

export interface MyInfoNoa {
  lastupdated?: string
  source?: string
  classification?: string
  unavailable?: boolean
  yearofassessment?: MyInfoValueField
  amount?: MyInfoValueField<number>
  employment?: MyInfoValueField<number>
  trade?: MyInfoValueField<number>
  interest?: MyInfoValueField<number>
  rent?: MyInfoValueField<number>
  taxclearance?: MyInfoValueField
  category?: MyInfoValueField
}

export interface MyInfoNoaEntry {
  yearofassessment: MyInfoValueField
  amount: MyInfoValueField<number>
  employment?: MyInfoValueField<number>
  trade?: MyInfoValueField<number>
  interest?: MyInfoValueField<number>
  rent?: MyInfoValueField<number>
  taxclearance?: MyInfoValueField
  category?: MyInfoValueField
}

export interface MyInfoNoaHistory {
  lastupdated?: string
  source?: string
  classification?: string
  unavailable?: boolean
  noas?: MyInfoNoaEntry[]
}

export interface MyInfoCpfBalances {
  lastupdated?: string
  source?: string
  classification?: string
  unavailable?: boolean
  oa?: MyInfoValueField<number>
  sa?: MyInfoValueField<number>
  ma?: MyInfoValueField<number>
}

export interface MyInfoCpfContributionEntry {
  date: MyInfoValueField
  month: MyInfoValueField
  employer: MyInfoValueField
  amount: MyInfoValueField<number>
}

export interface MyInfoCpfContributions {
  lastupdated?: string
  source?: string
  classification?: string
  history: MyInfoCpfContributionEntry[]
}

export interface MyInfoCpfEmployerEntry {
  month: MyInfoValueField
  employer: MyInfoValueField
}

export interface MyInfoCpfEmployers {
  lastupdated?: string
  source?: string
  classification?: string
  history: MyInfoCpfEmployerEntry[]
}

export interface MyInfoHdbOwnershipEntry {
  lastupdated?: string
  source?: string
  classification?: string
  hdbtype: MyInfoCodedField
  dateofpurchase: MyInfoValueField
  leasecommencementdate: MyInfoValueField
  termoflease: MyInfoValueField<number>
  outstandingloanbalance: MyInfoValueField<number>
  monthlyloaninstalment: MyInfoValueField<number>
  loangranted: MyInfoValueField<number>
  originalloanrepayment: MyInfoValueField<number>
  noofowners: MyInfoValueField<number>
  address: MyInfoAddress
}

export interface MyInfoHouseholdIncome {
  lastupdated?: string
  source?: string
  classification?: string
  high: MyInfoValueField<number>
  low: MyInfoValueField<number>
}

export interface MyInfoChildRecord {
  birthcertno: MyInfoValueField
  name: MyInfoValueField
  dob: MyInfoValueField
  sex: MyInfoCodedField
  residentialstatus: MyInfoCodedField
  nationality: MyInfoCodedField
  lifestatus: MyInfoCodedField
}

// ─── Full persona ─────────────────────────────────────────────────────────────

export interface MyInfoPersona {
  // Identity
  uinfin: MyInfoValueField
  uuid: MyInfoValueField
  partialuinfin: MyInfoValueField
  name: MyInfoValueField
  aliasname: MyInfoValueField
  hanyupinyinname: MyInfoValueField
  hanyupinyinaliasname: MyInfoValueField
  marriedname: MyInfoValueField
  sex: MyInfoCodedField
  race: MyInfoCodedField
  secondaryrace: MyInfoCodedField
  nationality: MyInfoCodedField
  residentialstatus: MyInfoCodedField
  birthcountry: MyInfoCodedField
  dob: MyInfoValueField
  // Contact
  email: MyInfoValueField
  mobileno: MyInfoPhone
  homeno: MyInfoPhone
  regadd: MyInfoAddress
  mailadd: MyInfoAddress
  billadd: MyInfoAddress
  // Marital & family
  marital: MyInfoCodedField
  marriagedate: MyInfoValueField
  marriagecertno: MyInfoValueField
  divorcedate: MyInfoValueField
  countryofmarriage: MyInfoCodedField
  childrenbirthrecords: MyInfoChildRecord[]
  sponsoredchildrenrecords: unknown[]
  // Housing
  hdbownership: MyInfoHdbOwnershipEntry[]
  hdbtype: MyInfoCodedField
  housingtype: MyInfoCodedField
  ownerprivate: MyInfoValueField<boolean>
  // Income & CPF
  noa: MyInfoNoa
  'noa-basic': MyInfoNoa
  noahistory: MyInfoNoaHistory
  'noahistory-basic': MyInfoNoaHistory
  cpfbalances: MyInfoCpfBalances
  cpfcontributions: MyInfoCpfContributions
  cpfemployers: MyInfoCpfEmployers
  householdincome: MyInfoHouseholdIncome
  assessableincome?: MyInfoValueField<number>
  assessyear?: MyInfoValueField
  // Employment & education
  employment: MyInfoValueField
  employmentsector: MyInfoValueField
  occupation: MyInfoValueField | MyInfoCodedField
  edulevel: MyInfoCodedField
  schoolname: MyInfoCodedField
  gradyear: MyInfoValueField
  // Pass info
  passtype: MyInfoCodedField
  passstatus: MyInfoValueField
  passexpirydate: MyInfoValueField
  passportnumber: MyInfoValueField
  passportexpirydate: MyInfoValueField
  // Other
  vehicles: unknown[]
  drivinglicence: unknown
  gstvoucher: unknown
  silversupport: unknown
  merdekagen: unknown
}

export type MyInfoNric = keyof typeof myinfoPersonas
