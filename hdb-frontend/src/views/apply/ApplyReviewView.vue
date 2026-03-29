<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

function handleSubmit() {
  applicationStore.submitApplication()
  router.push({
    path: '/',
    hash: '#dashboard',
  })
}
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>Step 4 &mdash; Review &amp; Submit</h2>
      <p>Confirm the information below before submitting your flat application.</p>
    </div>

    <div class="review-grid">
      <div class="surface review-card">
        <p class="detail-label">Full Name</p>
        <p class="detail-value">{{ applicationStore.form.fullName }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">NRIC</p>
        <p class="detail-value">{{ applicationStore.form.nric }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Date of Birth</p>
        <p class="detail-value">{{ applicationStore.form.dateOfBirth }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Contact Number</p>
        <p class="detail-value">{{ applicationStore.form.contactNumber }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Email</p>
        <p class="detail-value">{{ applicationStore.form.email }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Marital Status</p>
        <p class="detail-value">{{ applicationStore.form.maritalStatus }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Monthly Household Income</p>
        <p class="detail-value">${{ applicationStore.form.monthlyHouseholdIncome }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Preferred Town Area</p>
        <p class="detail-value">{{ applicationStore.form.preferredTown }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Flat Type</p>
        <p class="detail-value">{{ applicationStore.form.flatType }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">Income PDF</p>
        <p class="detail-value">{{ applicationStore.documents.incomePdfName }}</p>
      </div>
      <div class="surface review-card">
        <p class="detail-label">HFE Letter PDF</p>
        <p class="detail-value">{{ applicationStore.documents.hfeLetterPdfName }}</p>
      </div>
    </div>

    <div class="step-actions">
      <button class="btn btn-secondary" type="button" @click="router.push('/apply/documents')">Back</button>
      <button class="btn btn-primary" type="button" @click="handleSubmit">Apply</button>
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
