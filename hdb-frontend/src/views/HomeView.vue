<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, FileText, MapPinned, UserRound } from 'lucide-vue-next'
import HeroCarousel from '@/components/HeroCarousel.vue'
import BtoProjectCard from '@/components/BtoProjectCard.vue'
import ApplicationStatusStepper from '@/components/ApplicationStatusStepper.vue'
import { getProjectName, getProjectTown, heroSlides, upcomingProjects, type UpcomingProject } from '@/data/projects'
import { useApplicationStore } from '@/stores/application'
import { useAuth } from '@/stores/auth'
import {
  fetchApplications,
  fetchProjects,
  fetchFlatSelections,
  type ApplicationMemberRecord,
  type ApplicationRecord,
  type FlatSelectionRecord,
  type ProjectRecord,
} from '@/services/api'
import type { ApplicationStatus } from '@/stores/application'

const router = useRouter()
const applicationStore = useApplicationStore()
const { applicantName, applicantNric, isLoggedIn } = useAuth()

const currentNric = computed(() => applicantNric.value ?? applicationStore.form.nric)
const dashboardName = computed(
  () => (applicantName.value ?? applicationStore.form.fullName) || 'Prospective Applicant',
)
const applications = computed(() => applicationStore.linkedApplications)
const activeApplications = computed(() =>
  applications.value.filter(
    (application) =>
      application.application_status === 'SUBMITTED' || application.application_status === 'SUCCESSFUL',
  ),
)
const latestApplication = computed(() => applicationStore.latestApplication)
const latestProjectName = computed(() =>
  latestApplication.value ? getProjectName(latestApplication.value.project_id) : 'No applications yet',
)

const launchProjects = ref<UpcomingProject[]>([])
const launchesError = ref('')
const flatSelectionByApplicationId = ref<Record<number, FlatSelectionRecord>>({})
const showLocalWorkflow = computed(
  () => !applicationStore.hasExistingApplications && applicationStore.status !== 'editing',
)
const activeApplication = computed(
  () =>
    applications.value.find(
      (application) =>
        application.application_status === 'SUCCESSFUL' || application.application_status === 'SUBMITTED',
    ) ?? null,
)
const activeFlatSelection = computed(() => {
  if (!activeApplication.value) {
    return null
  }

  return flatSelectionByApplicationId.value[activeApplication.value.application_id] ?? null
})

function hasQueueAndNoFlat(selection: FlatSelectionRecord | null) {
  if (!selection) {
    return false
  }

  const queueReadyStatuses: FlatSelectionRecord['status'][] = [
    'balloted',
    'selecting',
    'not_called',
    'no_flat_selected',
  ]

  return selection.flat_id === null && selection.queue_number > 0 && queueReadyStatuses.includes(selection.status)
}
const primaryActionLabel = computed(() => {
  if (applicationStore.hasBallotAccess) {
    return 'Choose Flat'
  }

  if (activeApplication.value) {
    return 'View Active Application'
  }

  if (showLocalWorkflow.value) {
    return 'Review Application'
  }

  return 'Start Application'
})

const dashboardTitle = computed(() => {
  if (hasQueueAndNoFlat(activeFlatSelection.value)) {
    return 'Ballot results are ready'
  }

  if (activeApplication.value?.application_status === 'SUCCESSFUL') {
    return 'Application successful'
  }

  if (activeApplication.value?.application_status === 'SUBMITTED') {
    return 'Your application is being processed'
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

    if (applicationStore.status === 'successful') {
      return 'Application successful'
    }

    if (applicationStore.status === 'processing') {
      return 'Your application is being processed'
    }
  }

  return 'No saved application history found for this NRIC'
})

const dashboardText = computed(() => {
  const queueSelection = activeFlatSelection.value
  if (queueSelection && hasQueueAndNoFlat(queueSelection)) {
    return `Your application has received queue number Q${queueSelection.queue_number}. You may proceed to choose flat.`
  }

  if (activeApplication.value?.application_status === 'SUCCESSFUL') {
    return 'Your application passed eligibility checks. Ballot results are pending release.'
  }

  if (activeApplication.value?.application_status === 'SUBMITTED') {
    return 'Your submission has been received. The eligibility and ballot outcome is still pending.'
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

    if (applicationStore.status === 'successful') {
      return 'Your application passed eligibility checks. Ballot results are pending release.'
    }

    if (applicationStore.status === 'processing') {
      return 'Your submission has been received. The ballot result is still pending.'
    }
  }

  return 'You can still start a fresh application flow from the portal when you are ready.'
})

const dashboardQueueNumber = computed(() => {
  const queueSelection = activeFlatSelection.value
  if (queueSelection && hasQueueAndNoFlat(queueSelection)) {
    return `Q${queueSelection.queue_number}`
  }

  return null
})

const dashboardStepperStatus = computed<ApplicationStatus | null>(() => {
  if (applicationStore.hasBallotAccess || hasQueueAndNoFlat(activeFlatSelection.value)) {
    return 'balloted'
  }

  if (activeFlatSelection.value) {
    const status = activeFlatSelection.value.status
    if (activeFlatSelection.value.flat_id !== null || status === 'reserved' || status === 'paid') {
      return 'selected'
    }
  }

  if (activeApplication.value?.application_status === 'SUCCESSFUL') {
    return 'successful'
  }

  if (activeApplication.value?.application_status === 'SUBMITTED') {
    return 'processing'
  }

  if (showLocalWorkflow.value) {
    return applicationStore.status
  }

  return null
})

function formatStatus(status: ApplicationRecord['application_status']) {
  return status
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function isSelectionNewer(left: FlatSelectionRecord, right: FlatSelectionRecord) {
  const leftTime = Date.parse(left.updated_at ?? left.created_at ?? '')
  const rightTime = Date.parse(right.updated_at ?? right.created_at ?? '')

  if (!Number.isNaN(leftTime) || !Number.isNaN(rightTime)) {
    if (Number.isNaN(leftTime)) {
      return false
    }
    if (Number.isNaN(rightTime)) {
      return true
    }
    if (leftTime !== rightTime) {
      return leftTime > rightTime
    }
  }

  return left.selection_id > right.selection_id
}

async function refreshFlatSelections() {
  const nric = currentNric.value?.trim().toUpperCase()
  if (!nric) {
    flatSelectionByApplicationId.value = {}
    return
  }

  const { status, data } = await fetchFlatSelections({ applicant_nric: nric })
  if (status !== 200 || !Array.isArray(data.data)) {
    flatSelectionByApplicationId.value = {}
    return
  }

  const latestByApplication: Record<number, FlatSelectionRecord> = {}
  for (const record of data.data) {
    const existing = latestByApplication[record.application_id]
    if (!existing || isSelectionNewer(record, existing)) {
      latestByApplication[record.application_id] = record
    }
  }

  flatSelectionByApplicationId.value = latestByApplication
  syncWorkflowFromBallotResults()
}

async function refreshLinkedApplications() {
  const nric = currentNric.value?.trim().toUpperCase()
  if (!nric) {
    applicationStore.clearLinkedApplications()
    return
  }

  const { status, data } = await fetchApplications({ main_applicant_nric: nric })
  if (status === 200 && Array.isArray(data.applications)) {
    applicationStore.replaceLinkedApplicationsForNric(nric, data.applications)
    return
  }

  applicationStore.replaceLinkedApplicationsForNric(nric, [])
}

function syncWorkflowFromBallotResults() {
  const active = activeApplication.value
  if (!active) {
    return
  }

  const latestSelection = flatSelectionByApplicationId.value[active.application_id]
  if (!latestSelection) {
    if (active.application_status === 'SUCCESSFUL') {
      applicationStore.status = 'successful'
      applicationStore.queueNumber = null
    } else if (active.application_status === 'SUBMITTED') {
      applicationStore.status = 'processing'
      applicationStore.queueNumber = null
    }
    return
  }

  if (hasQueueAndNoFlat(latestSelection)) {
    applicationStore.status = 'balloted'
    applicationStore.queueNumber = `Q${latestSelection.queue_number}`
    return
  }

  if (latestSelection.flat_id !== null || latestSelection.status === 'reserved' || latestSelection.status === 'paid') {
    applicationStore.status = 'selected'
    applicationStore.queueNumber = null
    return
  }

  if (active.application_status === 'SUCCESSFUL') {
    applicationStore.status = 'successful'
    applicationStore.queueNumber = null
  }
}

function formatFlatSelectionStatus(status: FlatSelectionRecord['status']) {
  return status
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function getDisplayStatus(application: ApplicationRecord) {
  const flatSelection = flatSelectionByApplicationId.value[application.application_id]
  if (flatSelection) {
    return formatFlatSelectionStatus(flatSelection.status)
  }

  return formatStatus(application.application_status)
}

function getQueueBadge(application: ApplicationRecord) {
  const flatSelection = flatSelectionByApplicationId.value[application.application_id]
  if (flatSelection && hasQueueAndNoFlat(flatSelection)) {
    return `Q${flatSelection.queue_number}`
  }

  return null
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
  if (applicationStore.hasBallotAccess) {
    void router.push('/select-flat')
    return
  }

  if (activeApplication.value) {
    applicationStore.openApplication(activeApplication.value)
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

function toCard(project: ProjectRecord) {
  const openLabel = project.status === 'open' ? 'Open now' : 'Closed'
  return {
    title: project.project_name,
    town: project.town_name,
    flatTypes: project.flat_types,
    openDate: openLabel,
    closeDate: `Exercise ${project.exercise_id}`,
    image: `https://picsum.photos/seed/project-${project.project_id}/1200/700`,
  }
}

onMounted(async () => {
  launchesError.value = ''
  launchProjects.value = []

  try {
    const currentResponse = await fetchProjects({ status: 'open' })

    if (
      currentResponse.status === 200
      && Array.isArray(currentResponse.data.data)
      && currentResponse.data.data.length > 0
    ) {
      launchProjects.value = currentResponse.data.data.map(toCard)
    } else {
      launchProjects.value = []
    }

  } catch {
    launchesError.value = 'Unable to load launch data right now. Showing local fallback list.'
    launchProjects.value = [...upcomingProjects]
  }

  try {
    await refreshLinkedApplications()
  } catch {
    applicationStore.syncSessionApplications(currentNric.value ?? '')
  }

  try {
    await refreshFlatSelections()
  } catch {
    flatSelectionByApplicationId.value = {}
  }
})

watch(currentNric, async () => {
  try {
    await refreshLinkedApplications()
  } catch {
    applicationStore.syncSessionApplications(currentNric.value ?? '')
  }

  try {
    await refreshFlatSelections()
  } catch {
    flatSelectionByApplicationId.value = {}
  }
})

watch(activeApplication, () => {
  syncWorkflowFromBallotResults()
})
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

        <div v-if="dashboardStepperStatus" class="surface dashboard-timeline">
          <p class="dashboard-timeline__label">Application Timeline</p>
          <ApplicationStatusStepper :status="dashboardStepperStatus" />
        </div>

        <div class="surface dashboard-summary">
          <div class="dashboard-summary__header">
            <div>
              <p class="dashboard-summary__title">{{ dashboardTitle }}</p>
              <p class="dashboard-summary__text">{{ dashboardText }}</p>
            </div>
            <button class="btn btn-primary dashboard-summary__button" type="button" @click="startApplicationFlow">
              {{ primaryActionLabel }}
            </button>
          </div>

          <div v-if="dashboardQueueNumber" class="dashboard-queue-callout">
            <p class="dashboard-queue-callout__label">Your Queue Number</p>
            <p class="dashboard-queue-callout__value">{{ dashboardQueueNumber }}</p>
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
                <div class="application-card__status-stack">
                  <span class="status-chip">{{ getDisplayStatus(application) }}</span>
                  <span v-if="getQueueBadge(application)" class="queue-chip">{{ getQueueBadge(application) }}</span>
                </div>
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
                  {{
                    application.application_status === 'SUBMITTED' || application.application_status === 'SUCCESSFUL'
                      ? 'View Active Application'
                      : 'View Application'
                  }}
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
        <h2 class="section-heading">Current BTO Launches</h2>
        <p class="section-subtitle">
          These projects are currently open for application in the active exercise.
        </p>

        <p v-if="launchesError" class="dashboard-error">
          {{ launchesError }}
        </p>

        <div class="launch-grid">
          <BtoProjectCard v-for="project in launchProjects" :key="project.title" :project="project" />
        </div>

        <p v-if="launchProjects.length === 0" class="muted-text empty-launches">
          No current launches are available for application right now.
        </p>

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

.dashboard-timeline {
  padding: 20px;
  margin-bottom: 18px;
}

.dashboard-timeline__label {
  margin: 0 0 12px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.56);
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

.dashboard-queue-callout {
  margin-bottom: 18px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(22, 82, 157, 0.22);
  background: rgba(22, 82, 157, 0.08);
}

.dashboard-queue-callout__label {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(22, 82, 157, 0.88);
  font-weight: 700;
}

.dashboard-queue-callout__value {
  margin: 4px 0 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #16529d;
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

.application-card__status-stack {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.queue-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(22, 82, 157, 0.12);
  color: #16529d;
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

.past-launches {
  margin-top: 36px;
}

.past-launches h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
}

.past-launches p {
  margin: 0;
  color: rgba(29, 29, 31, 0.66);
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
