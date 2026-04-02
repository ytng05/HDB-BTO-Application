<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SelectionModal from '@/components/SelectionModal.vue'
import { useApplicationStore } from '@/stores/application'
import { getMyInfoProfile } from '@/services/myinfo'

const router = useRouter()
const applicationStore = useApplicationStore()

const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated']
const flatTypeOptions = ['2-Room Flexi', '3-Room', '4-Room', '5-Room']

const isRetrieving = ref(false)
const retrieveSuccess = ref(false)
const retrieveError = ref('')
const isSaving = ref(false)
const singpassLocked = ref(false)
const showResetModal = ref(false)
const isCurrentDraft = computed(() => applicationStore.isCurrentDraft)
const isCurrentSubmitted = computed(() => applicationStore.isCurrentSubmitted)
const saveLabel = computed(() => (isCurrentSubmitted.value ? 'Save Updates' : 'Save Draft'))

async function retrieveFromSingPass() {
  isRetrieving.value = true
  retrieveSuccess.value = false
  retrieveError.value = ''

  try {
    const persona = await getMyInfoProfile(applicationStore.form.nric)
    if (!persona) {
      retrieveError.value = 'No MyInfo data found for this NRIC. Please fill in the details manually.'
      return
    }

    applicationStore.fillFromMyInfo(persona)
    retrieveSuccess.value = true
    singpassLocked.value = true
  } finally {
    isRetrieving.value = false
  }
}

async function saveDraft() {
  isSaving.value = true
  await applicationStore.saveDraft('details')
  isSaving.value = false
}

async function goNext() {
  await saveDraft()
  if (applicationStore.draftSaveError) {
    return
  }

  router.push('/apply/documents')
}

async function resetApplication() {
  applicationStore.resetDraftData()
  retrieveSuccess.value = false
  retrieveError.value = ''
  singpassLocked.value = false
  await saveDraft()
  showResetModal.value = false
}
</script>

<template>
  <div class="surface step-card">
    <div class="step-card__copy">
      <h2>Step 1 - Personal Details</h2>
      <p>Retrieve your information from Singpass or fill in the details manually.</p>
    </div>

    <div class="singpass-retrieve">
      <button class="btn btn-singpass" type="button" :disabled="isRetrieving" @click="retrieveFromSingPass">
        <span v-if="isRetrieving">Retrieving...</span>
        <span v-else>Retrieve info from Singpass</span>
      </button>
      <p v-if="retrieveSuccess" class="retrieve-success">Info retrieved successfully. Please review and update if needed.</p>
      <p v-if="retrieveError" class="retrieve-error">{{ retrieveError }}</p>
    </div>

    <div class="form-grid">
      <div :class="{ 'field-group--locked': singpassLocked }">
        <label class="field-label" for="full-name">
          Full Name
          <span v-if="singpassLocked" class="lock-badge">Singpass</span>
        </label>
        <input id="full-name" v-model="applicationStore.form.fullName" class="field" type="text" :disabled="singpassLocked" />
      </div>

      <div :class="{ 'field-group--locked': singpassLocked }">
        <label class="field-label" for="nric">
          NRIC
          <span v-if="singpassLocked" class="lock-badge">Singpass</span>
        </label>
        <input id="nric" v-model="applicationStore.form.nric" class="field" type="text" :disabled="singpassLocked" />
      </div>

      <div :class="{ 'field-group--locked': singpassLocked }">
        <label class="field-label" for="dob">
          Date of Birth
          <span v-if="singpassLocked" class="lock-badge">Singpass</span>
        </label>
        <input id="dob" v-model="applicationStore.form.dateOfBirth" class="field" type="date" :disabled="singpassLocked" />
      </div>

      <div>
        <label class="field-label" for="contact-number">Contact Number</label>
        <input id="contact-number" v-model="applicationStore.form.contactNumber" class="field" type="tel" />
      </div>

      <div>
        <label class="field-label" for="email">Email</label>
        <input id="email" v-model="applicationStore.form.email" class="field" type="email" />
      </div>

      <div>
        <label class="field-label" for="marital-status">Marital Status</label>
        <select id="marital-status" v-model="applicationStore.form.maritalStatus" class="field">
          <option v-for="option in maritalStatusOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>

      <div>
        <label class="field-label" for="preferred-town">Preferred Town Area</label>
        <select id="preferred-town" v-model="applicationStore.form.preferredTown" class="field">
          <option disabled value="">Select a town</option>
          <option v-for="option in applicationStore.townOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>

      <div class="form-grid__full">
        <label class="field-label" for="flat-type">Flat Type</label>
        <select id="flat-type" v-model="applicationStore.form.flatType" class="field">
          <option disabled value="">Select a flat type</option>
          <option v-for="option in flatTypeOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
    </div>

    <div class="step-actions">
      <button class="btn btn-secondary" type="button" @click="router.push('/')">Back</button>
      <div class="step-actions__group">
        <button class="btn btn-secondary" type="button" :disabled="isSaving" @click="saveDraft">
          {{ isSaving ? 'Saving...' : saveLabel }}
        </button>
        <button
          v-if="isCurrentDraft"
          class="btn btn-secondary"
          type="button"
          :disabled="isSaving"
          @click="showResetModal = true"
        >
          Reset Application
        </button>
        <button class="btn btn-primary" type="button" :disabled="isSaving" @click="goNext">Next</button>
      </div>
    </div>

    <p v-if="applicationStore.draftSaveMessage" class="retrieve-success draft-feedback">
      {{ applicationStore.draftSaveMessage }}
    </p>
    <p v-if="applicationStore.draftSaveError" class="retrieve-error draft-feedback">
      {{ applicationStore.draftSaveError }}
    </p>

    <SelectionModal
      :open="showResetModal"
      eyebrow="Reset Draft"
      title="Reset this application?"
      message="This clears the saved form details and uploaded document names for the draft you currently have open."
      confirm-label="Reset Application"
      @close="showResetModal = false"
      @confirm="resetApplication"
    />
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-grid__full {
  grid-column: 1 / -1;
}

.singpass-retrieve {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 10px;
  background: #f5f5f7;
}

.btn-singpass {
  align-self: flex-start;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #c8102e;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-singpass:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.retrieve-success {
  margin: 0;
  font-size: 0.875rem;
  color: #1a7f37;
}

.retrieve-error {
  margin: 0;
  font-size: 0.875rem;
  color: #c8102e;
}

.field-group--locked .field {
  background: #f5f5f7;
  color: rgba(29, 29, 31, 0.5);
  cursor: not-allowed;
  border-color: transparent;
}

.lock-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 4px;
  background: #c8102e;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  vertical-align: middle;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
}

.step-actions__group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.draft-feedback {
  margin-top: 14px;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column-reverse;
  }

  .step-actions__group {
    flex-direction: column;
  }
}
</style>
