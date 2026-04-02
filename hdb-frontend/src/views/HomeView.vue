<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Clock3, FileText, FolderClock, MapPinned, UserRound } from 'lucide-vue-next'
import HeroCarousel from '@/components/HeroCarousel.vue'
import BtoProjectCard from '@/components/BtoProjectCard.vue'
import ApplicationStatusStepper from '@/components/ApplicationStatusStepper.vue'
import { getProjectName, getProjectTown, heroSlides, upcomingProjects } from '@/data/projects'
import { useApplicationStore } from '@/stores/application'
import { useAuth } from '@/stores/auth'
import type { ApplicationRecord, ApplicationMemberRecord } from '@/services/api'

const router = useRouter()
const applicationStore = useApplicationStore()
const { applicantName, applicantNric, isLoggedIn } = useAuth()

const currentNric = computed(() => applicantNric.value ?? applicationStore.form.nric)
const dashboardName = computed(
  () => (applicantName.value ?? applicationStore.form.fullName) || 'Prospective Applicant',
)
const draftApplications = computed(() => applicationStore.draftApplications)
const pastApplications = computed(() => applicationStore.pastApplications)
const latestApplication = computed(() => applicationStore.latestApplication)
const firstDraft = computed(() => applicationStore.firstDraft)
const firstSubmitted = computed(() => applicationStore.firstSubmitted)
const latestProjectName = computed(() =>
  latestApplication.value ? getProjectName(latestApplication.value.project_id) : 'No applications yet',
)
const showLocalWorkflow = computed(
  () => !applicationStore.hasExistingApplications && applicationStore.hasSubmitted,
)

const dashboardTitle = computed(() => {
  if (applicationStore.isLoadingLinkedApplications) {
    return 'Loading your linked applications'
  }

  if (draftApplications.value.length > 0) {
    return draftApplications.value.length === 1
      ? 'You have 1 draft application on file'
      : `You have ${draftApplications.value.length} draft applications on file`
  }

  if (firstSubmitted.value) {
    return 'You already have a submitted application on file'
  }

  if (pastApplications.value.length > 0) {
    return 'Your previous applications are available below'
  }

  if (showLocalWorkflow.value) {
    if (applicationStore.status === 'selected' && applicationStore.selectedUnit) {
      return `Flat selected: Unit ${applicationStore.selectedUnit.unitNumber}`
    }

    if (applicationStore.status === 'balloted') {
      return 'Ballot results are ready'
    }

    if (applicationStore.status === 'processing') {
      return 'Your application is being processed'
    }
  }

  return 'No application history found for this NRIC'
})

const dashboardText = computed(() => {
  if (applicationStore.isLoadingLinkedApplications) {
    return 'We are checking the applications linked to your NRIC now.'
  }

  if (draftApplications.value.length > 0) {
    return 'Draft applications are shown first so you can quickly see anything still in progress.'
  }

  if (firstSubmitted.value) {
    return 'Open your submitted application to review or update it. A second submission is not allowed while it is still active.'
  }

  if (pastApplications.value.length > 0) {
    return 'Every linked application appears here whether you joined as the main applicant or a co-applicant.'
  }

  if (showLocalWorkflow.value) {
    if (applicationStore.status === 'selected' && applicationStore.selectedUnit) {
      return `Unit ${applicationStore.selectedUnit.unitNumber} at ${applicationStore.selectedUnit.development} has been reserved under your name.`
    }

    if (applicationStore.status === 'balloted') {
      return `Your application has received queue number ${applicationStore.queueNumber}. You may proceed to unit selection.`
    }

    if (applicationStore.status === 'processing') {
      return 'Your submission has been received. The ballot result is still pending in this mocked portal flow.'
    }
  }

  return 'You can still start a fresh application flow from the portal when you are ready.'
})

function formatStatus(status: ApplicationRecord['application_status']) {
  return status
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function getProjectLabel(application: ApplicationRecord) {
  if (application.project_id > 0) {
    return getProjectName(application.project_id)
  }

  const payload = application.draft_payload
  if (payload && typeof payload === 'object') {
    const form = payload.form as Record<string, unknown> | undefined
    const preferredTown = typeof form?.preferredTown === 'string' ? form.preferredTown : ''
    if (preferredTown) {
      return `${preferredTown} Draft`
    }
  }

  return `Draft #${application.application_id}`
}

function getProjectTownLabel(application: ApplicationRecord) {
  if (application.project_id > 0) {
    return getProjectTown(application.project_id)
  }

  const payload = application.draft_payload
  if (payload && typeof payload === 'object') {
    const form = payload.form as Record<string, unknown> | undefined
    const preferredTown = typeof form?.preferredTown === 'string' ? form.preferredTown : ''
    if (preferredTown) {
      return preferredTown
    }
  }

  return 'Town not selected'
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not available'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

function getLinkedRoles(application: ApplicationRecord) {
  const nric = currentNric.value
  if (!nric) {
    return ''
  }

  const roles = new Set<string>()
  if (application.main_applicant_nric === nric) {
    roles.add('Main applicant')
  }

  application.members
    .filter((member) => member.nric_fin === nric)
    .forEach((member) => roles.add(formatMemberRole(member)))

  return [...roles].join(' / ') || 'Linked member'
}

function formatMemberRole(member: ApplicationMemberRecord) {
  if (member.member_role === 'MAIN_APPLICANT') {
    return 'Main applicant'
  }

  if (member.member_role === 'CO_APPLICANT') {
    return 'Co-applicant'
  }

  return 'Occupant'
}

function startApplicationFlow() {
  if (firstDraft.value) {
    applicationStore.openDraft(firstDraft.value)
    router.push('/apply/details')
    return
  }

  if (firstSubmitted.value) {
    applicationStore.openDraft(firstSubmitted.value)
    router.push('/apply/review')
    return
  }

  if (applicationStore.hasSubmitted && !applicationStore.hasExistingApplications) {
    router.push('/apply/review')
    return
  }

  router.push('/apply/details')
}

function openDraft(application: ApplicationRecord) {
  applicationStore.openDraft(application)
  router.push('/apply/details')
}

function openApplication(application: ApplicationRecord) {
  applicationStore.openDraft(application)
  router.push(application.application_status === 'DRAFT' ? '/apply/details' : '/apply/review')
}

function revealMockBallot() {
  applicationStore.markBalloted()
}
</script>

<template>
  <div>
    <section v-if="!isLoggedIn" class="section home-hero">
      <div class="container">
        <HeroCarousel :slides="heroSlides" />

        <div class="hero-actions">
          <p class="hero-login-hint">Sign in with your NRIC to see any draft or past applications linked to you.</p>
        </div>
      </div>
    </section>

    <section v-if="isLoggedIn" id="dashboard" class="section dashboard-section">
      <div class="container">
        <div class="dashboard-header">
          <div>
            <p class="eyebrow">Applicant Dashboard</p>
            <h2 class="section-heading">Application status and next steps</h2>
            <p class="section-subtitle">
              Your dashboard now pulls applications directly from the application service using your NRIC.
            </p>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="surface detail-card dashboard-card">
            <div class="dashboard-card__label">
              <UserRound :size="18" />
              <span>Applicant</span>
            </div>
            <p class="dashboard-card__value">{{ dashboardName }}</p>
          </div>

          <div class="surface detail-card dashboard-card">
            <div class="dashboard-card__label">
              <FolderClock :size="18" />
              <span>Drafts</span>
            </div>
            <p class="dashboard-card__value">{{ draftApplications.length }}</p>
          </div>

          <div class="surface detail-card dashboard-card">
            <div class="dashboard-card__label">
              <Clock3 :size="18" />
              <span>Past Applications</span>
            </div>
            <p class="dashboard-card__value">{{ pastApplications.length }}</p>
          </div>

          <div class="surface detail-card dashboard-card">
            <div class="dashboard-card__label">
              <Building2 :size="18" />
              <span>Latest Project</span>
            </div>
            <p class="dashboard-card__value">{{ latestProjectName }}</p>
          </div>
        </div>

        <div class="surface dashboard-summary">
          <div class="dashboard-summary__header">
            <div>
              <p class="dashboard-summary__title">{{ dashboardTitle }}</p>
              <p class="dashboard-summary__text">{{ dashboardText }}</p>
            </div>
            <button class="btn btn-primary dashboard-summary__button" type="button" @click="startApplicationFlow">
              {{
                firstDraft
                  ? 'Continue Draft'
                  : firstSubmitted
                    ? 'View Submitted Application'
                    : applicationStore.hasSubmitted
                      ? 'Review Application'
                      : 'Start Application'
              }}
            </button>
          </div>

          <p v-if="applicationStore.linkedApplicationsError" class="dashboard-error">
            {{ applicationStore.linkedApplicationsError }}
          </p>

          <ApplicationStatusStepper
            v-if="showLocalWorkflow"
            :status="applicationStore.status"
          />

          <div v-if="showLocalWorkflow && applicationStore.status === 'processing'" class="dashboard-actions">
            <button class="btn btn-secondary" type="button" @click="revealMockBallot">Load Mock Ballot Result</button>
          </div>

          <div
            v-if="showLocalWorkflow && applicationStore.status === 'selected' && applicationStore.selectedUnit"
            class="dashboard-note"
          >
            <FileText :size="18" />
            <span>
              Reserved unit: {{ applicationStore.selectedUnit.unitNumber }} at
              {{ applicationStore.selectedUnit.development }}
            </span>
          </div>
        </div>

        <div v-if="draftApplications.length > 0" class="dashboard-list">
          <div class="dashboard-list__header">
            <h3>Draft Applications</h3>
            <p>Applications still in progress.</p>
          </div>

          <div class="application-grid">
            <article
              v-for="application in draftApplications"
              :key="application.application_id"
              class="surface application-card application-card--draft"
            >
              <div class="application-card__header">
                <div>
                  <p class="application-card__eyebrow">Application #{{ application.application_id }}</p>
                  <h4>{{ getProjectLabel(application) }}</h4>
                </div>
                <span class="status-chip status-chip--draft">{{ formatStatus(application.application_status) }}</span>
              </div>

              <div class="application-card__meta">
                <p>
                  <MapPinned :size="16" />
                  <span>{{ getProjectTownLabel(application) }}</span>
                </p>
                <p>
                  <Building2 :size="16" />
                  <span>{{ application.flat_type }}</span>
                </p>
                <p>
                  <UserRound :size="16" />
                  <span>{{ getLinkedRoles(application) }}</span>
                </p>
              </div>

              <p class="application-card__date">
                Last updated {{ formatDate(application.updated_at) }}
              </p>

              <div class="application-card__actions">
                <button class="btn btn-primary" type="button" @click="openDraft(application)">Open Draft</button>
              </div>
            </article>
          </div>
        </div>

        <div v-if="pastApplications.length > 0" class="dashboard-list">
          <div class="dashboard-list__header">
            <h3>Past Applications</h3>
            <p>Submitted, cancelled, or decided applications linked to your NRIC.</p>
          </div>

          <div class="application-grid">
            <article
              v-for="application in pastApplications"
              :key="application.application_id"
              class="surface application-card"
            >
              <div class="application-card__header">
                <div>
                  <p class="application-card__eyebrow">Application #{{ application.application_id }}</p>
                  <h4>{{ getProjectName(application.project_id) }}</h4>
                </div>
                <span class="status-chip">{{ formatStatus(application.application_status) }}</span>
              </div>

              <div class="application-card__meta">
                <p>
                  <MapPinned :size="16" />
                  <span>{{ getProjectTown(application.project_id) }}</span>
                </p>
                <p>
                  <Building2 :size="16" />
                  <span>{{ application.flat_type }}</span>
                </p>
                <p>
                  <UserRound :size="16" />
                  <span>{{ getLinkedRoles(application) }}</span>
                </p>
              </div>

              <p class="application-card__date">
                Submitted {{ formatDate(application.submitted_at) }}
              </p>

              <div class="application-card__actions">
                <button class="btn btn-secondary" type="button" @click="openApplication(application)">
                  {{ application.application_status === 'SUBMITTED' ? 'View / Update' : 'View Application' }}
                </button>
              </div>
            </article>
          </div>
        </div>

        <div
          v-if="
            !applicationStore.isLoadingLinkedApplications &&
            !applicationStore.hasExistingApplications &&
            !showLocalWorkflow
          "
          class="surface empty-state"
        >
          <h3>No linked applications yet</h3>
          <p>
            We did not find any draft or past applications for this NRIC. You can start a fresh application from here.
          </p>
        </div>
      </div>
    </section>

    <section id="launches" class="section section--muted">
      <div class="container">
        <p class="eyebrow">BTO Exercise</p>
        <h2 class="section-heading">Upcoming BTO Launches</h2>

        <div class="launch-grid">
          <BtoProjectCard v-for="project in upcomingProjects" :key="project.title" :project="project" />
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="container">
        <p>&copy; 2025 Housing &amp; Development Board</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-hero {
  padding-top: 28px;
  padding-bottom: 48px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.hero-login-hint {
  margin: 0;
  font-size: 0.96rem;
  color: rgba(29, 29, 31, 0.6);
  text-align: center;
}

.dashboard-header {
  margin-bottom: 28px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.dashboard-card {
  min-height: 150px;
}

.dashboard-card__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.56);
}

.dashboard-card__value {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 700;
}

.dashboard-summary {
  margin-top: 18px;
  padding: 24px;
}

.dashboard-summary__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.dashboard-summary__title {
  margin: 0 0 10px;
  font-size: 1.08rem;
  font-weight: 700;
}

.dashboard-summary__text {
  margin: 0;
  color: rgba(29, 29, 31, 0.74);
}

.dashboard-summary__button {
  min-width: 220px;
}

.dashboard-error {
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(163, 18, 25, 0.06);
  color: var(--color-red);
  font-weight: 600;
}

.dashboard-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dashboard-note {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  color: var(--color-green);
  font-weight: 600;
}

.dashboard-list {
  margin-top: 28px;
}

.dashboard-list__header {
  margin-bottom: 16px;
}

.dashboard-list__header h3 {
  margin: 0 0 6px;
  font-size: 1.2rem;
}

.dashboard-list__header p {
  margin: 0;
  color: rgba(29, 29, 31, 0.64);
}

.application-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.application-card {
  padding: 22px;
}

.application-card--draft {
  border: 1px solid rgba(200, 16, 46, 0.16);
  background: linear-gradient(180deg, rgba(200, 16, 46, 0.03), rgba(255, 255, 255, 0.98));
}

.application-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.application-card__eyebrow {
  margin: 0 0 8px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.5);
}

.application-card h4 {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.2;
}

.application-card__meta {
  display: grid;
  gap: 10px;
}

.application-card__meta p {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: rgba(29, 29, 31, 0.72);
}

.application-card__date {
  margin: 18px 0 0;
  color: rgba(29, 29, 31, 0.55);
  font-size: 0.9rem;
  font-weight: 600;
}

.application-card__actions {
  margin-top: 18px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(29, 29, 31, 0.06);
  color: rgba(29, 29, 31, 0.72);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-chip--draft {
  background: rgba(200, 16, 46, 0.1);
  color: var(--color-red);
}

.empty-state {
  margin-top: 28px;
  padding: 28px;
  text-align: center;
}

.empty-state h3 {
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0;
  color: rgba(29, 29, 31, 0.66);
}

.launch-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: 28px;
}

.site-footer {
  padding: 24px 0;
  color: var(--color-white);
  background: var(--color-charcoal);
}

.site-footer p {
  margin: 0;
}

@media (max-width: 960px) {
  .dashboard-grid,
  .application-grid,
  .launch-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-summary__header,
  .application-card__header {
    flex-direction: column;
  }
}
</style>
