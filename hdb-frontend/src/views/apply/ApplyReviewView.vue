<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

const isSubmitted = computed(() => applicationStore.hasSubmitted)
const heading = computed(() => (isSubmitted.value ? 'Application Review' : 'Review Your Details'))
const description = computed(() =>
  isSubmitted.value
    ? 'This is the information currently stored for your application.'
    : 'Review the information below before proceeding to payment.',
)
const primaryLabel = computed(() => (isSubmitted.value ? 'Back to Dashboard' : 'Proceed to Payment'))

function handlePrimaryAction() {
  if (isSubmitted.value) {
    router.push({
      path: '/',
      hash: '#dashboard',
    })
    return
  }

  router.push('/apply/payment')
}
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>{{ heading }}</h2>
      <p>{{ description }}</p>
    </div>

    <div class="review-grid">
      <div class="surface review-card">
        <p class="detail-label">Full Name</p>
        <p class="detail-value">{{ applicationStore.form.fullName || 'Not provided' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">NRIC</p>
        <p class="detail-value">{{ applicationStore.form.nric || 'Not provided' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Date of Birth</p>
        <p class="detail-value">{{ applicationStore.form.dateOfBirth || 'Not provided' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Contact Number</p>
        <p class="detail-value">{{ applicationStore.form.contactNumber || 'Not provided' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Email</p>
        <p class="detail-value">{{ applicationStore.form.email || 'Not provided' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Marital Status</p>
        <p class="detail-value">{{ applicationStore.form.maritalStatus || 'Not provided' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Monthly Household Income</p>
        <p class="detail-value">
          {{ applicationStore.form.monthlyHouseholdIncome ? `$${applicationStore.form.monthlyHouseholdIncome}` : 'Not provided' }}
        </p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Preferred Town Area</p>
        <p class="detail-value">{{ applicationStore.form.preferredTown || 'Not selected' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Flat Type</p>
        <p class="detail-value">{{ applicationStore.form.flatType || 'Not selected' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Income PDF</p>
        <p class="detail-value">{{ applicationStore.documents.incomePdfName || 'Not uploaded' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">HFE Letter PDF</p>
        <p class="detail-value">{{ applicationStore.documents.hfeLetterPdfName || 'Not uploaded' }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Submitted At</p>
        <p class="detail-value">{{ applicationStore.lastSubmittedAt || 'Not submitted yet' }}</p>
      </div>
    </div>

    <div class="step-actions">
      <button
        class="btn btn-secondary"
        type="button"
        @click="router.push(isSubmitted ? '/' : '/apply/documents')"
      >
        {{ isSubmitted ? 'Return Home' : 'Back' }}
      </button>
      <button class="btn btn-primary" type="button" @click="handlePrimaryAction">
        {{ primaryLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-card {
  padding: 32px;
}

.step-card__copy h2 {
  margin: 0 0 10px;
  font-size: 1.7rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.step-card__copy p {
  margin: 0 0 24px;
  color: rgba(29, 29, 31, 0.72);
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.review-card {
  padding: 18px;
}

.detail-label {
  margin: 0 0 8px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.56);
}

.detail-value {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-charcoal);
  word-break: break-word;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
}

@media (max-width: 720px) {
  .review-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column-reverse;
  }
}
</style>
