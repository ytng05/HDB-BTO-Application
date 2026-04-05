<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()

const isSubmitted = computed(() => applicationStore.isCurrentSubmitted)
const heading = computed(() => (isSubmitted.value ? 'Application Details' : 'Review Your Details'))
const description = computed(() =>
  isSubmitted.value
    ? 'This page shows the details currently saved in the portal for your submitted application.'
    : 'Review the information below before continuing your application.',
)

const documentSummary = computed(() => ({
  income: applicationStore.documents.incomePdfName || 'Not available',
  hfe: applicationStore.documents.hfeLetterPdfName || 'Not available',
}))
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>{{ heading }}</h2>
      <p>{{ description }}</p>
    </div>

    <div v-if="isSubmitted" class="review-note">
      These details are now loaded directly from the submitted application record, including household member contact
      information.
    </div>

    <section class="review-section">
      <h3>Application Summary</h3>
      <div class="review-grid">
        <div class="surface review-card">
          <p class="detail-label">Status</p>
          <p class="detail-value">{{ applicationStore.currentApplication?.application_status || 'Not submitted yet' }}</p>
        </div>
        <div class="surface review-card">
          <p class="detail-label">Submitted At</p>
          <p class="detail-value">{{ applicationStore.lastSubmittedAt || 'Not submitted yet' }}</p>
        </div>
        <div class="surface review-card">
          <p class="detail-label">Preferred Town Area</p>
          <p class="detail-value">{{ applicationStore.form.preferredTown || 'Not available' }}</p>
        </div>
        <div class="surface review-card">
          <p class="detail-label">Flat Type</p>
          <p class="detail-value">{{ applicationStore.form.flatType || 'Not selected' }}</p>
        </div>
      </div>
    </section>

    <section class="review-section">
      <h3>Main Applicant</h3>
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
          <p class="detail-label">Monthly Income (SGD)</p>
          <p class="detail-value">{{ applicationStore.form.monthlyIncome || 'Not provided' }}</p>
        </div>
        <div class="surface review-card">
          <p class="detail-label">Citizenship / Residency Status</p>
          <p class="detail-value">{{ applicationStore.form.citizenshipStatus || 'Not provided' }}</p>
        </div>
        <div class="surface review-card">
          <p class="detail-label">Marital Status</p>
          <p class="detail-value">{{ applicationStore.form.maritalStatus || 'Not provided' }}</p>
        </div>
        <div class="surface review-card">
          <p class="detail-label">Contact Number</p>
          <p class="detail-value">{{ applicationStore.form.contactNumber || 'Not available' }}</p>
        </div>
        <div class="surface review-card">
          <p class="detail-label">Email</p>
          <p class="detail-value">{{ applicationStore.form.email || 'Not available' }}</p>
        </div>
      </div>
    </section>

    <section class="review-section">
      <h3>Co-applicants</h3>
      <div v-if="applicationStore.coApplicants.length === 0" class="empty-review">
        <p>No co-applicants listed.</p>
      </div>
      <div v-else class="member-review-stack">
        <article
          v-for="(member, index) in applicationStore.coApplicants"
          :key="member.id"
          class="surface member-review-card"
        >
          <p class="member-review-card__title">Co-applicant {{ index + 1 }}</p>
          <div class="member-review-grid">
            <p><strong>Name:</strong> {{ member.fullName || 'Not provided' }}</p>
            <p><strong>NRIC / FIN:</strong> {{ member.nric || 'Not provided' }}</p>
            <p><strong>Date of Birth:</strong> {{ member.dateOfBirth || 'Not provided' }}</p>
            <p><strong>Monthly Income (SGD):</strong> {{ member.monthlyIncome || 'Not provided' }}</p>
            <p><strong>Relationship:</strong> {{ member.relationshipToMain || 'Not provided' }}</p>
            <p><strong>Status:</strong> {{ member.citizenshipStatus || 'Not provided' }}</p>
            <p><strong>Marital Status:</strong> {{ member.maritalStatus || 'Not provided' }}</p>
            <p><strong>Contact Number:</strong> {{ member.contactNumber || 'Not provided' }}</p>
            <p><strong>Email:</strong> {{ member.email || 'Not provided' }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="review-section">
      <h3>Occupiers</h3>
      <div v-if="applicationStore.occupiers.length === 0" class="empty-review">
        <p>No occupiers listed.</p>
      </div>
      <div v-else class="member-review-stack">
        <article
          v-for="(member, index) in applicationStore.occupiers"
          :key="member.id"
          class="surface member-review-card"
        >
          <p class="member-review-card__title">Occupier {{ index + 1 }}</p>
          <div class="member-review-grid">
            <p><strong>Name:</strong> {{ member.fullName || 'Not provided' }}</p>
            <p><strong>NRIC / FIN:</strong> {{ member.nric || 'Not provided' }}</p>
            <p><strong>Date of Birth:</strong> {{ member.dateOfBirth || 'Not provided' }}</p>
            <p><strong>Monthly Income (SGD):</strong> {{ member.monthlyIncome || 'Not provided' }}</p>
            <p><strong>Relationship:</strong> {{ member.relationshipToMain || 'Not provided' }}</p>
            <p><strong>Status:</strong> {{ member.citizenshipStatus || 'Not provided' }}</p>
            <p><strong>Marital Status:</strong> {{ member.maritalStatus || 'Not provided' }}</p>
            <p><strong>Contact Number:</strong> {{ member.contactNumber || 'Not provided' }}</p>
            <p><strong>Email:</strong> {{ member.email || 'Not provided' }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="review-section">
      <h3>Supporting Documents</h3>
      <div class="review-grid">
        <div class="surface review-card">
          <p class="detail-label">Income PDF</p>
          <p class="detail-value">{{ documentSummary.income }}</p>
        </div>
        <div class="surface review-card">
          <p class="detail-label">HFE Letter PDF</p>
          <p class="detail-value">{{ documentSummary.hfe }}</p>
        </div>
      </div>
    </section>

    <div class="step-actions">
      <button class="btn btn-secondary" type="button" @click="router.push('/')">
        Return Home
      </button>
      <button v-if="!isSubmitted" class="btn btn-primary" type="button" @click="router.push('/apply/details')">
        Continue Application
      </button>
    </div>

    <p v-if="applicationStore.applicationError" class="review-feedback review-feedback--error">
      {{ applicationStore.applicationError }}
    </p>
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

.review-note {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(29, 29, 31, 0.04);
  color: rgba(29, 29, 31, 0.68);
  font-size: 0.92rem;
  line-height: 1.5;
}

.review-section + .review-section {
  margin-top: 28px;
}

.review-section h3 {
  margin: 0 0 14px;
  font-size: 1.12rem;
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

.empty-review {
  padding: 18px 20px;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  color: rgba(29, 29, 31, 0.58);
  background: rgba(29, 29, 31, 0.02);
}

.empty-review p {
  margin: 0;
}

.member-review-stack {
  display: grid;
  gap: 14px;
}

.member-review-card {
  padding: 18px;
}

.member-review-card__title {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
}

.member-review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;
}

.member-review-grid p {
  margin: 0;
  color: rgba(29, 29, 31, 0.72);
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
}

.review-feedback {
  margin: 14px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.review-feedback--error {
  color: #c8102e;
}

@media (max-width: 720px) {
  .review-grid,
  .member-review-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column-reverse;
  }
}
</style>
