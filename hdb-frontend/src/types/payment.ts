export interface PaymentReceiptState {
  status: 'success' | 'failure'
  applicantName: string
  maskedNric: string
  flat: {
    flatId: number
    block: string
    level: number
    unit: string
    type: string
  }
  transactionId: string
  amountPaid: number
  timestamp: string
  explanation?: string
}
