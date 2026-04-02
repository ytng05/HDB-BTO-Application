import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { mapMaritalStatus } from '@/services/myinfo'
import {
  checkEligibility,
  createApplicationDraft,
  getDocument,
  getApplicationsByNric,
  getErrorMessage,
  updateApplicationDraft,
  updateApplicationStatus,
  uploadDocument,
  type EligibilityCheckRequest,
  type ApplicationDraftRequest,
  type ApplicationRecord,
  type EligibilityCheckResult,
  type UploadedDocumentRecord,
} from '@/services/api'
import type { MyInfoPersona } from '@/data/myinfoPersonas'

const STORAGE_KEY = 'hdb-flat-portal-application'
const DEFAULT_EXERCISE_ID = 202601

export type ApplicationStatus = 'draft' | 'processing' | 'balloted' | 'selected'

export interface ApplicationForm {
  fullName: string
  nric: string
  dateOfBirth: string
  contactNumber: string
  email: string
  maritalStatus: string
  preferredTown: string
  flatType: string
}

export interface ApplicationDocuments {
  incomePdfName: string
  hfeLetterPdfName: string
}

interface ApplicationDocumentFiles {
  incomePdfFile: File | null
  hfeLetterPdfFile: File | null
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

export interface DraftPayload {
  form: ApplicationForm
  documents: ApplicationDocuments
  saved_at?: string
  saved_step?: string
}

interface PersistedApplicationState {
  form: ApplicationForm
  documents: ApplicationDocuments
  status: ApplicationStatus
  hasSubmitted: boolean
  queueNumber: string | null
  selectedUnit: AvailableUnit | null
  lastSubmittedAt: string | null
  linkedApplications: ApplicationRecord[]
  linkedNric: string | null
  currentDraftId: number | null
}

const REQUIRED_SUBMISSION_FIELDS: Array<keyof ApplicationForm> = [
  'fullName',
  'nric',
  'dateOfBirth',
  'contactNumber',
  'email',
  'maritalStatus',
  'preferredTown',
  'flatType',
]

const fieldLabels: Record<keyof ApplicationForm, string> = {
  fullName: 'Full name',
  nric: 'NRIC',
  dateOfBirth: 'Date of birth',
  contactNumber: 'Contact number',
  email: 'Email',
  maritalStatus: 'Marital status',
  preferredTown: 'Preferred town',
  flatType: 'Flat type',
}

const townOptions = ['Tengah', 'Kallang/Whampoa', 'Queenstown', 'Punggol'] as const

const developmentByTown: Record<string, string> = {
  Tengah: 'Tengah GreenVille',
  'Kallang/Whampoa': 'Kallang Horizon',
  Queenstown: 'Queenstown Ridges',
  Punggol: 'Punggol Waterway Terraces',
}

const projectIdByTown: Record<string, number> = {
  Tengah: 1,
  'Kallang/Whampoa': 52,
  Queenstown: 51,
  Punggol: 21,
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

function createDefaultDocumentFiles(): ApplicationDocumentFiles {
  return {
    incomePdfFile: null,
    hfeLetterPdfFile: null,
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

function toTimestamp(value: string | null): number {
  if (!value) {
    return 0
  }

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function sortApplications(applications: ApplicationRecord[]): ApplicationRecord[] {
  return [...applications].sort((left, right) => {
    const rightTime =
      toTimestamp(right.updated_at) || toTimestamp(right.submitted_at) || toTimestamp(right.created_at)
    const leftTime =
      toTimestamp(left.updated_at) || toTimestamp(left.submitted_at) || toTimestamp(left.created_at)

    if (rightTime !== leftTime) {
      return rightTime - leftTime
    }

    return right.application_id - left.application_id
  })
}

function isDraftPayload(payload: unknown): payload is DraftPayload {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  return 'form' in payload || 'documents' in payload
}

function hasText(value: string): boolean {
  return value.trim().length > 0
}

export const useApplicationStore = defineStore('application', () => {
  const persistedState = readPersistedState()

  const form = ref<ApplicationForm>(persistedState?.form ?? createDefaultForm())
  const documents = ref<ApplicationDocuments>(persistedState?.documents ?? createDefaultDocuments())
  const documentFiles = ref<ApplicationDocumentFiles>(createDefaultDocumentFiles())
  const status = ref<ApplicationStatus>(persistedState?.status ?? 'draft')
  const hasSubmitted = ref<boolean>(persistedState?.hasSubmitted ?? false)
  const queueNumber = ref<string | null>(persistedState?.queueNumber ?? null)
  const selectedUnit = ref<AvailableUnit | null>(persistedState?.selectedUnit ?? null)
  const lastSubmittedAt = ref<string | null>(persistedState?.lastSubmittedAt ?? null)
  const linkedApplications = ref<ApplicationRecord[]>(
    sortApplications(persistedState?.linkedApplications ?? []),
  )
  const linkedNric = ref<string | null>(persistedState?.linkedNric ?? null)
  const currentDraftId = ref<number | null>(persistedState?.currentDraftId ?? null)
  const isLoadingLinkedApplications = ref(false)
  const linkedApplicationsError = ref('')
  const isSavingDraft = ref(false)
  const isPreparingSubmission = ref(false)
  const draftSaveError = ref('')
  const draftSaveMessage = ref('')
  const lastEligibilityResult = ref<EligibilityCheckResult | null>(null)

  const availableUnits = computed(() => buildAvailableUnits(form.value.preferredTown))
  const developmentName = computed(() => developmentByTown[form.value.preferredTown] ?? 'HDB Development')
  const hasBallotAccess = computed(() => ['balloted', 'selected'].includes(status.value))
  const hasRequiredDocuments = computed(
    () => hasText(documents.value.incomePdfName) && hasText(documents.value.hfeLetterPdfName),
  )
  const draftApplications = computed(() =>
    linkedApplications.value.filter((application) => application.application_status === 'DRAFT'),
  )
  const submittedApplications = computed(() =>
    linkedApplications.value.filter((application) => application.application_status === 'SUBMITTED'),
  )
  const pastApplications = computed(() =>
    linkedApplications.value.filter((application) => application.application_status !== 'DRAFT'),
  )
  const latestApplication = computed(() => linkedApplications.value[0] ?? null)
  const hasExistingApplications = computed(() => linkedApplications.value.length > 0)
  const currentApplication = computed(
    () => linkedApplications.value.find((application) => application.application_id === currentDraftId.value) ?? null,
  )
  const currentDraft = computed(() =>
    currentApplication.value?.application_status === 'DRAFT' ? currentApplication.value : null,
  )
  const firstDraft = computed(() => draftApplications.value[0] ?? null)
  const firstSubmitted = computed(() => submittedApplications.value[0] ?? null)
  const hasAnyDraft = computed(() => draftApplications.value.length > 0)
  const hasSubmittedApplication = computed(() => submittedApplications.value.length > 0)
  const isCurrentDraft = computed(() => currentApplication.value?.application_status === 'DRAFT')
  const isCurrentSubmitted = computed(() => currentApplication.value?.application_status === 'SUBMITTED')

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
      linkedApplications: linkedApplications.value,
      linkedNric: linkedNric.value,
      currentDraftId: currentDraftId.value,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  watch(
    [
      form,
      documents,
      status,
      hasSubmitted,
      queueNumber,
      selectedUnit,
      lastSubmittedAt,
      linkedApplications,
      linkedNric,
      currentDraftId,
    ],
    persistState,
    { deep: true },
  )

  function upsertApplication(application: ApplicationRecord) {
    linkedApplications.value = sortApplications([
      ...linkedApplications.value.filter((existing) => existing.application_id !== application.application_id),
      application,
    ])
  }

  function setLinkedApplications(nric: string, applications: ApplicationRecord[]) {
    linkedNric.value = nric.trim().toUpperCase()
    linkedApplications.value = sortApplications(applications)
    linkedApplicationsError.value = ''

    if (
      currentDraftId.value !== null &&
      !linkedApplications.value.some((application) => application.application_id === currentDraftId.value)
    ) {
      currentDraftId.value = null
    }
  }

  function clearLinkedApplications() {
    linkedApplications.value = []
    linkedNric.value = null
    linkedApplicationsError.value = ''
    currentDraftId.value = null
  }

  async function loadLinkedApplications(nric: string) {
    const formattedNric = nric.trim().toUpperCase()
    if (!formattedNric) {
      clearLinkedApplications()
      return []
    }

    isLoadingLinkedApplications.value = true

    try {
      const payload = await getApplicationsByNric(formattedNric)
      setLinkedApplications(formattedNric, payload.applications)
      return payload.applications
    } catch (error) {
      linkedApplicationsError.value = getErrorMessage(
        error,
        'We could not load your application history right now.',
      )
      linkedApplications.value = []
      linkedNric.value = formattedNric
      return []
    } finally {
      isLoadingLinkedApplications.value = false
    }
  }

  function startApplicationLogin(nric: string, name = '') {
    form.value = {
      ...createDefaultForm(),
      nric: nric.trim().toUpperCase(),
      fullName: name || form.value.fullName,
    }
    documents.value = createDefaultDocuments()
    documentFiles.value = createDefaultDocumentFiles()
    status.value = 'draft'
    hasSubmitted.value = false
    queueNumber.value = null
    selectedUnit.value = null
    lastSubmittedAt.value = null
    currentDraftId.value = null
    lastEligibilityResult.value = null
    draftSaveError.value = ''
    draftSaveMessage.value = ''
  }

  function fillFromMyInfo(persona: MyInfoPersona) {
    form.value.fullName = persona.name?.value ?? form.value.fullName
    form.value.dateOfBirth = persona.dob?.value ?? ''
    form.value.contactNumber = persona.mobileno?.nbr?.value ?? ''
    form.value.email = persona.email?.value ?? ''
    form.value.maritalStatus = mapMaritalStatus(persona.marital?.code)
  }

  function buildEligibilityPayload(
    application: ApplicationRecord,
    incomeDocument: UploadedDocumentRecord,
  ): EligibilityCheckRequest {
    return {
      application: {
        application_id: application.application_id,
        exercise_id: application.exercise_id,
        project_id: application.project_id,
        main_applicant_nric: form.value.nric.trim().toUpperCase(),
        full_name: form.value.fullName,
        date_of_birth: form.value.dateOfBirth,
        contact_number: form.value.contactNumber,
        email: form.value.email,
        marital_status: form.value.maritalStatus,
        preferred_town: form.value.preferredTown,
        flat_type: form.value.flatType,
      },
      income_document: {
        document_id: incomeDocument.document_id,
        document_type: incomeDocument.document_type,
        fields: incomeDocument.fields ?? {},
      },
    }
  }

  function buildDraftRequest(
    savedStep = 'details',
    overrides: {
      income_document_id?: number | null
      hfe_document_id?: number | null
    } = {},
  ): ApplicationDraftRequest {
    return {
      main_applicant_nric: form.value.nric.trim().toUpperCase(),
      exercise_id: DEFAULT_EXERCISE_ID,
      project_id: projectIdByTown[form.value.preferredTown] ?? 0,
      flat_type: form.value.flatType || 'Draft',
      income_document_id:
        overrides.income_document_id !== undefined
          ? overrides.income_document_id
          : currentApplication.value?.income_document_id ?? null,
      hfe_document_id:
        overrides.hfe_document_id !== undefined
          ? overrides.hfe_document_id
          : currentApplication.value?.hfe_document_id ?? null,
      draft_payload: {
        form: { ...form.value, nric: form.value.nric.trim().toUpperCase() },
        documents: { ...documents.value },
        saved_at: new Date().toISOString(),
        saved_step: savedStep,
      },
    }
  }

  function openDraft(application: ApplicationRecord) {
    currentDraftId.value = application.application_id
    status.value = application.application_status === 'DRAFT' ? 'draft' : 'processing'
    hasSubmitted.value = application.application_status !== 'DRAFT'
    queueNumber.value = null
    selectedUnit.value = null
    lastSubmittedAt.value = application.submitted_at

    const payload = isDraftPayload(application.draft_payload) ? application.draft_payload : null
    if (payload?.form) {
      form.value = {
        ...createDefaultForm(),
        ...payload.form,
        nric: payload.form.nric?.trim().toUpperCase() || application.main_applicant_nric,
      }
    } else {
      form.value = {
        ...createDefaultForm(),
        nric: application.main_applicant_nric,
        flatType: application.flat_type === 'Draft' ? '' : application.flat_type,
      }
    }

    documents.value = payload?.documents
      ? {
          ...createDefaultDocuments(),
          ...payload.documents,
        }
      : createDefaultDocuments()

    documentFiles.value = createDefaultDocumentFiles()
    draftSaveError.value = ''
    draftSaveMessage.value = ''
  }

  function getSubmissionValidationErrors(): string[] {
    const errors: string[] = []

    for (const fieldName of REQUIRED_SUBMISSION_FIELDS) {
      if (!hasText(form.value[fieldName])) {
        errors.push(`${fieldLabels[fieldName]} is required before submission.`)
      }
    }

    if (!hasRequiredDocuments.value) {
      errors.push('Both the income PDF and HFE letter PDF must be selected before submission.')
    }

    const hasStoredIncomeDocument =
      typeof currentApplication.value?.income_document_id === 'number' && currentApplication.value.income_document_id > 0
    const hasStoredHfeDocument =
      typeof currentApplication.value?.hfe_document_id === 'number' && currentApplication.value.hfe_document_id > 0

    if (!hasStoredIncomeDocument && !documentFiles.value.incomePdfFile) {
      errors.push('Please attach your income PDF before submission.')
    }

    if (!hasStoredHfeDocument && !documentFiles.value.hfeLetterPdfFile) {
      errors.push('Please attach your HFE letter PDF before submission.')
    }

    return errors
  }

  async function saveDraft(savedStep = 'details') {
    draftSaveError.value = ''
    draftSaveMessage.value = ''

    if (currentDraftId.value === null) {
      draftSaveMessage.value = 'Draft saved on this device.'
      return null
    }

    isSavingDraft.value = true

    try {
      const application = await updateApplicationDraft(currentDraftId.value, buildDraftRequest(savedStep))
      upsertApplication(application)
      draftSaveMessage.value = application.application_status === 'SUBMITTED' ? 'Application updated.' : 'Draft saved.'
      return application
    } catch (error) {
      draftSaveError.value = getErrorMessage(error, 'Unable to save your draft right now.')
      return null
    } finally {
      isSavingDraft.value = false
    }
  }

  async function ensureBackendDraft() {
    const payload = buildDraftRequest('payment')
    const application =
      currentDraftId.value !== null
        ? await updateApplicationDraft(currentDraftId.value, payload)
        : await createApplicationDraft(payload)

    currentDraftId.value = application.application_id
    upsertApplication(application)
    return application
  }

  async function uploadSubmissionDocuments(applicationId: number) {
    let incomeDocumentId = currentApplication.value?.income_document_id ?? null
    let hfeDocumentId = currentApplication.value?.hfe_document_id ?? null
    let incomeDocumentRecord: UploadedDocumentRecord | null = null

    if (documentFiles.value.incomePdfFile) {
      const incomeDocument = await uploadDocument(documentFiles.value.incomePdfFile, applicationId)
      if (incomeDocument.document_type !== 'income') {
        throw new Error('The uploaded income PDF was not recognised as an income document.')
      }
      incomeDocumentId = incomeDocument.document_id
      incomeDocumentRecord = incomeDocument
    } else if (incomeDocumentId !== null) {
      incomeDocumentRecord = await getDocument(incomeDocumentId)
    }

    if (documentFiles.value.hfeLetterPdfFile) {
      const hfeDocument = await uploadDocument(documentFiles.value.hfeLetterPdfFile, applicationId)
      if (hfeDocument.document_type !== 'hfe') {
        throw new Error('The uploaded HFE letter PDF was not recognised as an HFE document.')
      }
      hfeDocumentId = hfeDocument.document_id
    }

    if (incomeDocumentId === null || hfeDocumentId === null || incomeDocumentRecord === null) {
      throw new Error('Application details and OCR results must be available before eligibility can be checked.')
    }

    return {
      incomeDocumentId,
      hfeDocumentId,
      incomeDocumentRecord,
    }
  }

  async function prepareSubmission() {
    draftSaveError.value = ''
    draftSaveMessage.value = ''
    lastEligibilityResult.value = null

    if (isCurrentSubmitted.value) {
      draftSaveError.value = 'This application has already been submitted.'
      return null
    }

    if (firstSubmitted.value && currentDraftId.value !== firstSubmitted.value.application_id) {
      draftSaveError.value = 'You already have a submitted application. Please update that one instead.'
      return null
    }

    const validationErrors = getSubmissionValidationErrors()
    if (validationErrors.length > 0) {
      draftSaveError.value = validationErrors[0] ?? 'Please complete all required fields before submission.'
      return null
    }

    isPreparingSubmission.value = true

    try {
      const draftApplication = await ensureBackendDraft()
      const { incomeDocumentId, hfeDocumentId, incomeDocumentRecord } = await uploadSubmissionDocuments(
        draftApplication.application_id,
      )
      const updatedApplication = await updateApplicationDraft(
        draftApplication.application_id,
        buildDraftRequest('payment', {
          income_document_id: incomeDocumentId,
          hfe_document_id: hfeDocumentId,
        }),
      )

      currentDraftId.value = updatedApplication.application_id
      upsertApplication(updatedApplication)
      documentFiles.value = createDefaultDocumentFiles()

      const eligibility = await checkEligibility(buildEligibilityPayload(updatedApplication, incomeDocumentRecord))
      lastEligibilityResult.value = eligibility
      draftSaveMessage.value = 'Application prepared for payment.'

      return {
        application: updatedApplication,
        eligibility,
      }
    } catch (error) {
      draftSaveError.value = getErrorMessage(error, 'Unable to prepare your application for submission.')
      return null
    } finally {
      isPreparingSubmission.value = false
    }
  }

  function resetDraftData() {
    const preservedNric = form.value.nric.trim().toUpperCase()
    form.value = {
      ...createDefaultForm(),
      nric: preservedNric,
    }
    documents.value = createDefaultDocuments()
    documentFiles.value = createDefaultDocumentFiles()
    status.value = 'draft'
    hasSubmitted.value = false
    queueNumber.value = null
    selectedUnit.value = null
    lastSubmittedAt.value = null
    lastEligibilityResult.value = null
    draftSaveError.value = ''
    draftSaveMessage.value = ''
  }

  async function submitApplication() {
    if (isCurrentSubmitted.value) {
      draftSaveError.value = 'You already have a submitted application open.'
      return null
    }

    if (firstSubmitted.value && currentDraftId.value !== firstSubmitted.value.application_id) {
      draftSaveError.value = 'You already have a submitted application. Please update that one instead.'
      return null
    }

    if (currentDraftId.value === null) {
      draftSaveError.value = 'No application is ready for submission yet.'
      return null
    }

    try {
      const application = await updateApplicationStatus(currentDraftId.value, 'SUBMITTED')
      hasSubmitted.value = true
      status.value = 'processing'
      queueNumber.value = null
      selectedUnit.value = null
      lastSubmittedAt.value = application.submitted_at ?? new Date().toISOString()
      upsertApplication(application)
      return application
    } catch (error) {
      draftSaveError.value = getErrorMessage(
        error,
        'Your payment succeeded, but we could not update the application status.',
      )
      return null
    }
  }

  function markBalloted() {
    status.value = 'balloted'
    queueNumber.value = buildQueueNumber(form.value.nric)
  }

  function reserveUnit(unit: AvailableUnit) {
    selectedUnit.value = unit
    status.value = 'selected'
  }

  function setDocument(documentKey: 'incomePdfName' | 'hfeLetterPdfName', file: File | null) {
    const fileName = file?.name ?? ''
    documents.value = {
      ...documents.value,
      [documentKey]: fileName,
    }

    documentFiles.value = {
      ...documentFiles.value,
      ...(documentKey === 'incomePdfName'
        ? { incomePdfFile: file }
        : { hfeLetterPdfFile: file }),
    }
  }

  function resetApplication() {
    form.value = createDefaultForm()
    documents.value = createDefaultDocuments()
    documentFiles.value = createDefaultDocumentFiles()
    status.value = 'draft'
    hasSubmitted.value = false
    queueNumber.value = null
    selectedUnit.value = null
    lastSubmittedAt.value = null
    lastEligibilityResult.value = null
    draftSaveError.value = ''
    draftSaveMessage.value = ''
    clearLinkedApplications()

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
    linkedApplications,
    linkedNric,
    currentDraftId,
    currentDraft,
    currentApplication,
    firstDraft,
    firstSubmitted,
    isLoadingLinkedApplications,
    linkedApplicationsError,
    isSavingDraft,
    isPreparingSubmission,
    draftSaveError,
    draftSaveMessage,
    draftApplications,
    pastApplications,
    latestApplication,
    hasExistingApplications,
    hasAnyDraft,
    hasSubmittedApplication,
    isCurrentDraft,
    isCurrentSubmitted,
    submittedApplications,
    availableUnits,
    developmentName,
    hasBallotAccess,
    hasRequiredDocuments,
    lastEligibilityResult,
    loadLinkedApplications,
    setLinkedApplications,
    clearLinkedApplications,
    startApplicationLogin,
    fillFromMyInfo,
    openDraft,
    saveDraft,
    prepareSubmission,
    resetDraftData,
    submitApplication,
    markBalloted,
    reserveUnit,
    setDocument,
    resetApplication,
  }
})
