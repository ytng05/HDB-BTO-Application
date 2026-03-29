import axios from 'axios'

export const APPLICANT_URL = 'http://localhost:5001'
export const FLAT_SELECTION_URL = 'http://localhost:5002'
export const NETS_PAYMENT_URL = import.meta.env.VITE_NETS_URL ?? 'http://localhost:5003'
export const FLAT_ALLOCATION_URL = 'http://localhost:5005'
export const FLAT_AVAILABILITY_URL = 'http://localhost:5006'

type ApiMessage = string | string[]

export interface ApiEnvelope<T> {
  code: number
  data?: T
  message?: ApiMessage
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

export function getStatusCode(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export function getErrorMessage(error: unknown, fallback = 'Unable to complete your request.'): string {
  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    return normaliseMessage(error.response?.data?.message, fallback)
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
