import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { mapMaritalStatus } from '@/services/myinfo'
import type { MyInfoPersona } from '@/data/myinfoPersonas'

const STORAGE_KEY = 'hdb-flat-portal-application'

export type ApplicationStatus = 'draft' | 'processing' | 'balloted' | 'selected'

export interface ApplicationForm {
  fullName: string
  nric: string
  dateOfBirth: string
  contactNumber: string
  email: string
  maritalStatus: string
  monthlyHouseholdIncome: string
  preferredTown: string
  flatType: string
}

export interface ApplicationDocuments {
  incomePdfName: string
  hfeLetterPdfName: string
}

export interface AvailableUnit {
  id: number
  unitNumber: string
  floor: number
  facing: string
  sqm: number
  price: number
  development: string
}

interface PersistedApplicationState {
  form: ApplicationForm
  documents: ApplicationDocuments
  status: ApplicationStatus
  hasSubmitted: boolean
  queueNumber: string | null
  selectedUnit: AvailableUnit | null
  lastSubmittedAt: string | null
}

const townOptions = ['Tengah', 'Kallang/Whampoa', 'Queenstown', 'Punggol'] as const

const developmentByTown: Record<string, string> = {
  Tengah: 'Tengah GreenVille',
  'Kallang/Whampoa': 'Kallang Horizon',
  Queenstown: 'Queenstown Ridges',
  Punggol: 'Punggol Waterway Terraces',
}


const baseUnitTemplates = [
  { unitNumber: '27-181', floor: 27, facing: 'Open View', sqm: 112, price: 512000 },
  { unitNumber: '27-183', floor: 27, facing: 'Park', sqm: 112, price: 518000 },
  { unitNumber: '27-185', floor: 27, facing: 'City', sqm: 112, price: 523000 },
  { unitNumber: '24-171', floor: 24, facing: 'Garden', sqm: 101, price: 488000 },
  { unitNumber: '24-173', floor: 24, facing: 'Courtyard', sqm: 101, price: 492000 },
  { unitNumber: '24-175', floor: 24, facing: 'Open View', sqm: 101, price: 498000 },
  { unitNumber: '21-161', floor: 21, facing: 'Waterfront', sqm: 93, price: 458000 },
  { unitNumber: '21-163', floor: 21, facing: 'Park', sqm: 93, price: 463000 },
  { unitNumber: '21-165', floor: 21, facing: 'City', sqm: 93, price: 468000 },
  { unitNumber: '18-151', floor: 18, facing: 'Courtyard', sqm: 93, price: 438000 },
  { unitNumber: '18-153', floor: 18, facing: 'Garden', sqm: 93, price: 444000 },
  { unitNumber: '18-155', floor: 18, facing: 'Park', sqm: 93, price: 449000 },
]

function createDefaultForm(): ApplicationForm {
  return {
    fullName: '',
    nric: '',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    maritalStatus: 'Married',
    monthlyHouseholdIncome: '',
    preferredTown: '',
    flatType: '',
  }
}

function createDefaultDocuments(): ApplicationDocuments {
  return {
    incomePdfName: '',
    hfeLetterPdfName: '',
  }
}


function buildQueueNumber(nric: string): string {
  const digits = nric.replace(/\D/g, '').slice(0, 5) || '20481'
  return `Q${digits}`
}

function buildAvailableUnits(preferredTown: string): AvailableUnit[] {
  const development = developmentByTown[preferredTown] ?? `${preferredTown} Residences`

  return baseUnitTemplates.map((template, index) => ({
    id: index + 1,
    development,
    ...template,
  }))
}

function readPersistedState(): PersistedApplicationState | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawState = window.localStorage.getItem(STORAGE_KEY)
  if (!rawState) {
    return null
  }

  try {
    return JSON.parse(rawState) as PersistedApplicationState
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const useApplicationStore = defineStore('application', () => {
  const persistedState = readPersistedState()

  const form = ref<ApplicationForm>(persistedState?.form ?? createDefaultForm())
  const documents = ref<ApplicationDocuments>(persistedState?.documents ?? createDefaultDocuments())
  const status = ref<ApplicationStatus>(persistedState?.status ?? 'draft')
  const hasSubmitted = ref<boolean>(persistedState?.hasSubmitted ?? false)
  const queueNumber = ref<string | null>(persistedState?.queueNumber ?? null)
  const selectedUnit = ref<AvailableUnit | null>(persistedState?.selectedUnit ?? null)
  const lastSubmittedAt = ref<string | null>(persistedState?.lastSubmittedAt ?? null)

  const availableUnits = computed(() => buildAvailableUnits(form.value.preferredTown))
  const developmentName = computed(() => developmentByTown[form.value.preferredTown] ?? 'HDB Development')
  const hasBallotAccess = computed(() => ['balloted', 'selected'].includes(status.value))
  const hasRequiredDocuments = computed(
    () => documents.value.incomePdfName.length > 0 && documents.value.hfeLetterPdfName.length > 0,
  )

  function persistState() {
    if (typeof window === 'undefined') {
      return
    }

    const payload: PersistedApplicationState = {
      form: form.value,
      documents: documents.value,
      status: status.value,
      hasSubmitted: hasSubmitted.value,
      queueNumber: queueNumber.value,
      selectedUnit: selectedUnit.value,
      lastSubmittedAt: lastSubmittedAt.value,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  watch([form, documents, status, hasSubmitted, queueNumber, selectedUnit, lastSubmittedAt], persistState, {
    deep: true,
  })

  function startApplicationLogin(nric: string) {
    form.value = { ...createDefaultForm(), nric: nric.trim().toUpperCase() }
    documents.value = createDefaultDocuments()
    status.value = 'draft'
    hasSubmitted.value = false
    queueNumber.value = null
    selectedUnit.value = null
    lastSubmittedAt.value = null
  }

  function fillFromMyInfo(persona: MyInfoPersona) {
    form.value.fullName = persona.name?.value ?? form.value.fullName
    form.value.dateOfBirth = persona.dob?.value ?? ''
    form.value.contactNumber = persona.mobileno?.nbr?.value ?? ''
    form.value.email = persona.email?.value ?? ''
    form.value.maritalStatus = mapMaritalStatus(persona.marital?.code)
    const income = persona.householdincome?.high?.value
    form.value.monthlyHouseholdIncome = income != null ? String(income) : ''
  }

  function submitApplication() {
    hasSubmitted.value = true
    status.value = 'processing'
    queueNumber.value = null
    selectedUnit.value = null
    lastSubmittedAt.value = new Date().toISOString()
  }

  function markBalloted() {
    status.value = 'balloted'
    queueNumber.value = buildQueueNumber(form.value.nric)
  }

  function reserveUnit(unit: AvailableUnit) {
    selectedUnit.value = unit
    status.value = 'selected'
  }

  function setDocument(documentKey: 'incomePdfName' | 'hfeLetterPdfName', fileName: string) {
    documents.value = {
      ...documents.value,
      [documentKey]: fileName,
    }
  }

  function resetApplication() {
    form.value = createDefaultForm()
    documents.value = createDefaultDocuments()
    status.value = 'draft'
    hasSubmitted.value = false
    queueNumber.value = null
    selectedUnit.value = null
    lastSubmittedAt.value = null

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    townOptions,
    form,
    documents,
    status,
    hasSubmitted,
    queueNumber,
    selectedUnit,
    lastSubmittedAt,
    availableUnits,
    developmentName,
    hasBallotAccess,
    hasRequiredDocuments,
    startApplicationLogin,
    fillFromMyInfo,
    submitApplication,
    markBalloted,
    reserveUnit,
    setDocument,
    resetApplication,
  }
})
