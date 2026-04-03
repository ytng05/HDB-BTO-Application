<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Clock3, FileText, MapPinned, UserRound } from 'lucide-vue-next'
import HeroCarousel from '@/components/HeroCarousel.vue'
import BtoProjectCard from '@/components/BtoProjectCard.vue'
import ApplicationStatusStepper from '@/components/ApplicationStatusStepper.vue'
import { getProjectName, getProjectTown, heroSlides, upcomingProjects } from '@/data/projects'
import { useApplicationStore } from '@/stores/application'
import { useAuth } from '@/stores/auth'
import type { ApplicationMemberRecord, ApplicationRecord } from '@/services/api'

const router = useRouter()
const applicationStore = useApplicationStore()
const { applicantName, applicantNric, isLoggedIn } = useAuth()

const currentNric = computed(() => applicantNric.value ?? applicationStore.form.nric)
const dashboardName = computed(
  () => (applicantName.value ?? applicationStore.form.fullName) || 'Prospective Applicant',
)
const applications = computed(() => applicationStore.linkedApplications)
const submittedApplications = computed(() => applicationStore.submittedApplications)
const latestApplication = computed(() => applicationStore.latestApplication)
const firstSubmitted = computed(() => applicationStore.firstSubmitted)
const latestProjectName = computed(() =>
  latestApplication.value ? getProjectName(latestApplication.value.project_id) : 'No applications yet',
)
const showLocalWorkflow = computed(
  () => !applicationStore.hasExistingApplications && applicationStore.status !== 'editing',
)

const dashboardTitle = computed(() => {
  if (firstSubmitted.value) {
    return 'You already have an active application on file'
  }

  if (applications.value.length > 0) {
    return 'Your saved application history is available below'
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

  return 'No saved application history found for this NRIC'
})

const dashboardText = computed(() => {
  if (firstSubmitted.value) {
    return 'Open your saved submitted application to review the stored details. A second submission is not allowed while it is still active.'
  }

  if (applications.value.length > 0) {
    return 'Applications saved on this device for the signed-in NRIC appear here, including any household roles returned by Apply BTO.'
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
  if (firstSubmitted.value) {
    applicationStore.openApplication(firstSubmitted.value)
    void router.push('/apply/review')
    return
  }

  if (showLocalWorkflow.value) {
    void router.push('/apply/review')
    return
  }

  if (applicationStore.currentApplication) {
    applicationStore.beginNewApplication()
  }

  void router.push('/apply/details')
}

function openApplication(application: ApplicationRecord) {
  applicationStore.openApplication(application)
  void router.push('/apply/review')
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
          <p class="hero-login-hint">Sign in with your NRIC to continue or review the application saved on this device.</p>
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
              This dashboard shows the application state currently saved in the portal for the signed-in NRIC.
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
              <Clock3 :size="18" />
              <span>Active Applications</span>
            </div>
            <p class="dashboard-card__value">{{ submittedApplications.length }}</p>
          </div>

          <div class="surface detail-card dashboard-card">
            <div class="dashboard-card__label">
              <FileText :size="18" />
              <span>Saved Applications</span>
            </div>
            <p class="dashboard-card__value">{{ applications.length }}</p>
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
                firstSubmitted
                  ? 'View Active Application'
                  : showLocalWorkflow
                    ? 'Review Application'
                    : 'Start Application'
              }}
            </button>
          </div>

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

        <div v-if="applications.length > 0" class="dashboard-list">
          <div class="dashboard-list__header">
            <h3>Saved Applications</h3>
            <p>Applications saved in this browser for the signed-in NRIC appear here after Apply BTO completes.</p>
          </div>

          <div class="application-grid">
            <article
              v-for="application in applications"
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
                  {{ application.application_status === 'SUBMITTED' ? 'View Active Application' : 'View Application' }}
                </button>
              </div>
            </article>
          </div>
        </div>

        <div
          v-if="
            !applicationStore.hasExistingApplications &&
            !showLocalWorkflow
          "
          class="surface empty-state"
        >
          <h3>No saved applications yet</h3>
          <p>
            There are no applications saved locally for this NRIC yet. You can start a fresh application from here.
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
