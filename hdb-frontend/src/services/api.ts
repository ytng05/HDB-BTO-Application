import axios from 'axios'

export const APPLICANT_URL = 'http://localhost:5001'
export const APPLICATION_URL = import.meta.env.VITE_APPLICATION_URL ?? 'http://localhost:5004'
export const DOCUMENT_URL = import.meta.env.VITE_OCR_URL ?? 'http://localhost:5050'
export const CHECK_ELIGIBILITY_URL =
  import.meta.env.VITE_CHECK_ELIGIBILITY_URL ?? 'http://localhost:5008'
export const FLAT_SELECTION_URL = 'http://localhost:5002'
export const NETS_PAYMENT_URL = import.meta.env.VITE_NETS_URL ?? 'http://localhost:5003'
export const FLAT_ALLOCATION_URL = 'http://localhost:5005'
export const FLAT_AVAILABILITY_URL = 'http://localhost:5006'

type ApiMessage = string | string[]

export interface ApiEnvelope<T> {
  code: number
  data?: T
  message?: ApiMessage
  error?: string
  details?: string[]
}

export interface ApplicantLoginBody {
  nric: string
  password: string
}

export interface ApplicantLoginData {
  applicant_id: number
  name: string
  nric?: string
}

export type ApplicantLoginResponse = ApiEnvelope<ApplicantLoginData> | ApplicantLoginData

export type ServiceApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SUCCESSFUL'
  | 'UNSUCCESSFUL'
  | 'CANCELLED'

export interface ApplicationMemberRecord {
  member_id: number
  application_id: number
  member_role: 'MAIN_APPLICANT' | 'CO_APPLICANT' | 'OCCUPANT'
  nric_fin: string
  full_name: string
  relationship_to_main: string
  date_of_birth: string | null
  citizenship_status: string
  marital_status: string | null
  is_pregnant: boolean
  income_amount: number | null
  created_at: string | null
  updated_at: string | null
}

export interface ApplicationRecord {
  application_id: number
  exercise_id: number
  project_id: number
  flat_type: string
  main_applicant_nric: string
  income_document_id: number | null
  hfe_document_id: number | null
  draft_payload: Record<string, unknown> | null
  application_status: ServiceApplicationStatus
  submitted_at: string | null
  created_at: string | null
  updated_at: string | null
  members: ApplicationMemberRecord[]
}

export interface ApplicationsByNricResponse {
  nric: string
  applications: ApplicationRecord[]
}

export interface ApplicationDraftRequest {
  main_applicant_nric: string
  exercise_id?: number
  project_id?: number
  flat_type?: string
  income_document_id?: number | null
  hfe_document_id?: number | null
  draft_payload?: Record<string, unknown>
}

export interface UploadedDocumentRecord {
  document_id: number
  application_id: number
  document_type: 'income' | 'hfe' | 'unknown'
  status: string
  fields: Record<string, unknown> | null
}

export interface EligibilityApplicationPayload {
  application_id?: number
  exercise_id?: number
  project_id?: number
  main_applicant_nric: string
  full_name: string
  date_of_birth: string
  contact_number?: string
  email?: string
  marital_status: string
  preferred_town?: string
  flat_type: string
}

export interface EligibilityIncomeDocumentPayload {
  document_id?: number
  document_type: 'income' | 'hfe' | 'unknown'
  fields: Record<string, unknown>
}

export interface EligibilityCheckRequest {
  application: EligibilityApplicationPayload
  income_document: EligibilityIncomeDocumentPayload
}

export interface EligibilityCheckResult {
  application_id?: number | null
  eligible: boolean
  summary: string
  blocking_reasons: string[]
  field_checks: Array<Record<string, unknown>>
  logic_checks: Array<Record<string, unknown>>
  compared_values: Record<string, unknown>
}

export interface FlatSelectionRecord {
  selection_id: number
  applicant_id: number
  co_applicant_id: number | null
  project_id: number
  queue_number: number
  flat_id: number | null
  status: string
  reserved_at: string | null
  created_at: string | null
  updated_at: string | null
}

export type FlatSelectionResponse = ApiEnvelope<FlatSelectionRecord | FlatSelectionRecord[]>

export interface FlatRecord {
  flat_id: number
  project_id: number
  block: string
  street_name: string
  floor_number: number
  unit_number: string
  flat_type: string
  area_sqm: number
  price: number
  status: string
  reserved_by: string | null
  reserved_at: string | null
}

export type AvailableFlatsResponse = ApiEnvelope<FlatRecord[]>

export interface SelectFlatRequest {
  applicant_id: number
  selection_id: number
  flat_id: number
  payment_amount: number
}

export interface PaymentServicePayload {
  transaction_id?: string | number
  transactionId?: string | number
  amount?: number
  paid_at?: string
  timestamp?: string
  date_time?: string
  status?: string
}

export interface PaymentStatusData {
  applicant_id?: string | number
  amount?: number
  transaction_id?: string | number | null
  merchant_txn_ref: string
  status: string
  stage_resp_code?: string
  action_code?: string
  bank_auth_id?: string
  mask_pan?: string
  message?: string
  query_raw_status?: string
  verification_source?: string
  query_error?: string
}

export interface SelectFlatServicePayload {
  transaction_id?: string | number
  transactionId?: string | number
  payment_amount?: number
  timestamp?: string
  status?: string
  flat?: Partial<FlatRecord>
  payment?: PaymentServicePayload
  transaction?: PaymentServicePayload
}

export type SelectFlatResponse = ApiEnvelope<SelectFlatServicePayload> | SelectFlatServicePayload

const applicantApi = axios.create({
  baseURL: APPLICANT_URL,
  timeout: 10000,
})

const applicationApi = axios.create({
  baseURL: APPLICATION_URL,
  timeout: 10000,
})

const documentApi = axios.create({
  baseURL: DOCUMENT_URL,
  timeout: 30000,
})

const checkEligibilityApi = axios.create({
  baseURL: CHECK_ELIGIBILITY_URL,
  timeout: 20000,
})

const flatSelectionApi = axios.create({
  baseURL: FLAT_SELECTION_URL,
  timeout: 10000,
})

const flatAvailabilityApi = axios.create({
  baseURL: FLAT_AVAILABILITY_URL,
  timeout: 10000,
})

const flatAllocationApi = axios.create({
  baseURL: FLAT_ALLOCATION_URL,
  timeout: 15000,
})

const netsPaymentApi = axios.create({
  baseURL: NETS_PAYMENT_URL,
  timeout: 20000,
})

function isApiEnvelope<T>(payload: ApiEnvelope<T> | T): payload is ApiEnvelope<T> {
  return typeof payload === 'object' && payload !== null && 'code' in payload
}

function unwrapApiData<T>(payload: ApiEnvelope<T> | T): T {
  if (isApiEnvelope(payload)) {
    if (payload.data !== undefined) {
      return payload.data
    }

    throw new Error(normaliseMessage(payload.message, 'The service returned no data.'))
  }

  return payload
}

function normaliseMessage(message: ApiMessage | undefined, fallback: string): string {
  if (Array.isArray(message)) {
    return message.join(' ')
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message
  }

  return fallback
}

function normaliseErrorPayload(payload: Partial<ApiEnvelope<unknown>> | undefined, fallback: string): string {
  if (!payload) {
    return fallback
  }

  if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
    return payload.error
  }

  if (Array.isArray(payload.details) && payload.details.length > 0) {
    return payload.details.join(' ')
  }

  return normaliseMessage(payload.message, fallback)
}

export function getStatusCode(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export function getErrorMessage(error: unknown, fallback = 'Unable to complete your request.'): string {
  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    return normaliseErrorPayload(error.response?.data, fallback)
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export async function loginApplicant(payload: ApplicantLoginBody): Promise<ApplicantLoginData> {
  const response = await applicantApi.post<ApplicantLoginResponse>('/applicant/login', payload)
  return unwrapApiData(response.data)
}

export async function getApplicationsByNric(nric: string): Promise<ApplicationsByNricResponse> {
  const response = await applicationApi.get<ApplicationsByNricResponse>('/applications', {
    params: {
      nric,
    },
  })
  return response.data
}

export async function createApplicationDraft(payload: ApplicationDraftRequest): Promise<ApplicationRecord> {
  const response = await applicationApi.post<ApplicationRecord>('/applications/drafts', payload)
  return response.data
}

export async function updateApplicationDraft(
  applicationId: number,
  payload: ApplicationDraftRequest,
): Promise<ApplicationRecord> {
  const response = await applicationApi.put<ApplicationRecord>(`/applications/${applicationId}/draft`, payload)
  return response.data
}

export async function updateApplicationStatus(
  applicationId: number,
  status: string,
): Promise<ApplicationRecord> {
  const response = await applicationApi.put<ApplicationRecord>(`/applications/${applicationId}/status`, {
    status,
  })
  return response.data
}

export async function uploadDocument(file: File, applicationId: number): Promise<UploadedDocumentRecord> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('application_id', String(applicationId))

  const response = await documentApi.post<UploadedDocumentRecord>('/extract', formData)
  return response.data
}

export async function getDocument(documentId: number): Promise<UploadedDocumentRecord> {
  const response = await documentApi.get<UploadedDocumentRecord>(`/documents/${documentId}`)
  return response.data
}

export async function checkEligibility(payload: EligibilityCheckRequest): Promise<EligibilityCheckResult> {
  const response = await checkEligibilityApi.post<EligibilityCheckResult>('/check-eligibility', payload)

  return response.data
}

export async function getSelection(applicantId: number): Promise<FlatSelectionRecord> {
  const response = await flatSelectionApi.get<FlatSelectionResponse>('/flat-selection', {
    params: {
      applicant_id: applicantId,
    },
  })

  const payload = unwrapApiData(response.data)
  const records = Array.isArray(payload) ? payload : [payload]
  const matchingRecord = records.find((record) => record.applicant_id === applicantId)

  if (!matchingRecord) {
    throw new Error('No flat selection record found for this applicant.')
  }

  return matchingRecord
}

export async function getAvailableFlats(projectId: number): Promise<FlatRecord[]> {
  const response = await flatAvailabilityApi.get<AvailableFlatsResponse>('/flats', {
    params: {
      project_id: projectId,
      status: 'available',
    },
  })

  return unwrapApiData(response.data)
}

export async function selectFlat(payload: SelectFlatRequest): Promise<SelectFlatServicePayload> {
  const response = await flatAllocationApi.post<SelectFlatResponse>('/select-flat', payload)
  return unwrapApiData(response.data)
}

export async function getPaymentStatus(
  merchantTxnRef: string,
  refresh = false,
): Promise<PaymentStatusData> {
  const response = await netsPaymentApi.get<ApiEnvelope<PaymentStatusData>>(
    `/payment/status/${encodeURIComponent(merchantTxnRef)}`,
    {
      params: refresh ? { refresh: 'true' } : undefined,
    },
  )

  return unwrapApiData(response.data)
}

export async function abandonPayment(merchantTxnRef: string): Promise<PaymentStatusData> {
  const response = await netsPaymentApi.post<ApiEnvelope<PaymentStatusData>>(
    `/payment/abandon/${encodeURIComponent(merchantTxnRef)}`,
  )

  return unwrapApiData(response.data)
}
