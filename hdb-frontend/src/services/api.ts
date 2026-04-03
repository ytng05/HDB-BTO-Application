import axios from 'axios'

export const APPLY_BTO_URL = import.meta.env.VITE_APPLY_BTO_URL ?? 'http://localhost:5010'

type ApiMessage = string | string[]

export interface ApiEnvelope<T> {
  code: number
  data?: T
  message?: ApiMessage
  error?: string
  details?: string[]
}

export type ServiceApplicationStatus = 'SUBMITTED' | 'SUCCESSFUL' | 'UNSUCCESSFUL' | 'CANCELLED'

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
  contact_number: string | null
  email: string | null
  income_amount: number | null
  created_at: string | null
  updated_at: string | null
}

export interface ApplicationMemberRequest {
  member_role: 'MAIN_APPLICANT' | 'CO_APPLICANT' | 'OCCUPANT'
  nric_fin: string
  full_name: string
  relationship_to_main: string
  date_of_birth: string
  citizenship_status: string
  marital_status?: string | null
  contact_number: string
  email: string
  income_amount?: number | null
}

export interface ApplicationRecord {
  application_id: number
  exercise_id: number
  project_id: number
  flat_type: string
  main_applicant_nric: string
  income_document_id: number | null
  hfe_document_id: number | null
  application_status: ServiceApplicationStatus
  submitted_at: string | null
  created_at: string | null
  updated_at: string | null
  members: ApplicationMemberRecord[]
}

export interface ApplyBtoApplicationPayload {
  exercise_id: number
  project_id: number
  flat_type: string
  main_applicant_nric: string
  members: ApplicationMemberRequest[]
}

export interface ApplyBtoInitiateRequest {
  application: ApplyBtoApplicationPayload
  income_document: File
  hfe_document: File
  payment_amount?: number
}

export interface ApplyBtoPaymentRequestPayload {
  gateway_url: string
  payload: string
  hmac: string
  api_key_id: string
  merchant_txn_ref: string
}

export interface ApplyBtoCompletionResult {
  merchant_txn_ref: string
  stage: string
  payment_status: string
  application_status?: ServiceApplicationStatus
  eligible?: boolean
  summary?: string
  ineligibility_reasons?: string[]
  message?: string
}


const applyBtoApi = axios.create({
  baseURL: APPLY_BTO_URL,
  timeout: 30000,
})

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

export function getErrorMessage(error: unknown, fallback = 'Unable to complete your request.'): string {
  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    return normaliseErrorPayload(error.response?.data, fallback)
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export async function initiateApplyBtoSubmission(
  payload: ApplyBtoInitiateRequest,
): Promise<ApplyBtoCompletionResult & { payment: ApplyBtoPaymentRequestPayload }> {
  const formData = new FormData()
  formData.append('application', JSON.stringify(payload.application))
  formData.append('income_document', payload.income_document)
  formData.append('hfe_document', payload.hfe_document)

  if (typeof payload.payment_amount === 'number') {
    formData.append('payment_amount', String(payload.payment_amount))
  }

  const response = await applyBtoApi.post<ApplyBtoCompletionResult & { payment: ApplyBtoPaymentRequestPayload }>(
    '/apply-bto/initiate',
    formData,
  )

  return response.data
}

export async function completeApplyBtoSubmission(
  merchantTxnRef: string,
): Promise<{ status: number; data: ApplyBtoCompletionResult }> {
  const response = await applyBtoApi.post<ApplyBtoCompletionResult>(
    `/apply-bto/complete/${encodeURIComponent(merchantTxnRef)}`,
    undefined,
    {
      validateStatus: () => true,
    },
  )

  return {
    status: response.status,
    data: response.data,
  }
}
