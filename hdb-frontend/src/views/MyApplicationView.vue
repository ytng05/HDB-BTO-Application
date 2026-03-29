<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice, getMyApplication, isLoggedIn, openLoginModal, store } from '../store/index'

const router = useRouter()

const user = computed(() => store.currentUser)
const application = computed(() => getMyApplication())

if (!isLoggedIn.value) {
  openLoginModal()
}

const selectedFlat = computed(() => {
  const selectedUnitId = application.value?.selectedUnitId
  return selectedUnitId ? (store.flats.find((unit) => unit.id === selectedUnitId) ?? null) : null
})

const canSelectNow = computed(() => {
  const app = application.value
  return Boolean(
    app && app.status === 'balloted' && (app.queueNumber ?? Number.POSITIVE_INFINITY) <= 300,
  )
})

const statusConfig = computed(() => {
  const app = application.value

  if (!app)
    return {
      label: 'No application',
      badge: 'badge badge-amber',
      summary: 'No linked application.',
    }
  if (app.status === 'pending')
    return { label: 'Submitted', badge: 'badge badge-amber', summary: 'Queue number pending.' }
  if (app.status === 'balloted' && canSelectNow.value)
    return { label: 'Selection open', badge: 'badge badge-green', summary: 'Select a unit now.' }
  if (app.status === 'balloted')
    return { label: 'Queue issued', badge: 'badge badge-blue', summary: 'Wait for your turn.' }
  if (app.status === 'selected')
    return { label: 'Flat selected', badge: 'badge badge-green', summary: 'Unit reserved.' }

  return { label: 'Completed', badge: 'badge badge-gray', summary: 'Booking completed.' }
})

const applicationRows = computed(() => {
  const app = application.value
  if (!app) return []

  return [
    { label: 'Reference', value: formatReference(app.id) },
    { label: 'Project', value: app.projectName },
    { label: 'Flat type', value: app.flatType },
    { label: 'Queue', value: app.queueNumber ? `#${app.queueNumber}` : 'Pending' },
  ]
})

const applicantRows = computed(() => {
  if (!user.value) return []

  return [
    { label: 'Applicant', value: user.value.name },
    { label: 'NRIC', value: user.value.nric },
    { label: 'Household', value: user.value.household },
    { label: 'Preferred town', value: user.value.preferredTown },
  ]
})

const timeline = computed(() => {
  const app = application.value

  return [
    {
      label: 'Application submitted',
      detail: app ? formatDate(app.appliedDate) : 'Pending',
      state: app ? 'done' : 'upcoming',
    },
    {
      label: 'Ballot result',
      detail: app?.queueNumber ? `Queue #${app.queueNumber}` : 'Pending',
      state:
        app?.status === 'balloted' || app?.status === 'selected' || app?.status === 'completed'
          ? 'done'
          : 'upcoming',
    },
    {
      label: 'Flat selection',
      detail: canSelectNow.value
        ? 'Open now'
        : app?.status === 'selected' || app?.status === 'completed'
          ? 'Completed'
          : 'Waiting',
      state: canSelectNow.value
        ? 'current'
        : app?.status === 'selected' || app?.status === 'completed'
          ? 'done'
          : 'upcoming',
    },
    {
      label: 'Booking',
      detail: selectedFlat.value ? 'Pending appointment' : 'Not started',
      state: app?.status === 'completed' ? 'done' : 'upcoming',
    },
  ]
})

function formatDate(date?: string) {
  if (!date) return 'Not available'
  return new Intl.DateTimeFormat('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatReference(id?: string) {
  if (!id) return 'Not available'
  return `BTO-${id.replace('app-', '2026-')}`
}

function formatUnit(unitNumber: string) {
  return `#${unitNumber.slice(0, 2)}-${unitNumber.slice(2)}`
}
</script>

<template>
  <div class="application-page">
    <div v-if="!user" class="wrap page-shell">
      <section class="auth-wall card">
        <h1>Sign in to view your application</h1>
        <p>Use your NRIC and password to view your status.</p>
        <button class="btn btn-primary btn-lg" @click="openLoginModal">Sign in</button>
      </section>
    </div>

    <div v-else-if="application" class="wrap page-shell application-shell">
      <section class="application-header">
        <div>
          <p class="section-kicker">My Application</p>
          <h1>{{ application.projectName }}</h1>
          <p class="header-copy">{{ statusConfig.summary }}</p>
        </div>

        <div class="application-header__actions">
          <span :class="statusConfig.badge">{{ statusConfig.label }}</span>
          <button v-if="canSelectNow" class="btn btn-primary" @click="router.push('/select-flat')">
            Open selection
          </button>
        </div>
      </section>

      <section class="application-layout">
        <div class="card simple-panel">
          <div class="panel-head">
            <div>
              <p class="panel-kicker">Overview</p>
              <h2>Application details</h2>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-list">
              <div v-for="row in applicationRows" :key="row.label" class="info-row">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </div>
            </div>

            <div class="info-list">
              <div v-for="row in applicantRows" :key="row.label" class="info-row">
                <span>{{ row.label }}</span>
                <strong :class="row.label === 'NRIC' ? 'mono' : ''">{{ row.value }}</strong>
              </div>
            </div>
          </div>

          <div v-if="canSelectNow" class="action-strip">
            <strong>Selection is open for your queue number.</strong>
            <button class="btn btn-primary" @click="router.push('/select-flat')">
              Select unit
            </button>
          </div>

          <div v-else-if="selectedFlat" class="selected-strip">
            <div>
              <strong>{{ formatUnit(selectedFlat.unitNumber) }}</strong>
              <span>{{ selectedFlat.type }}</span>
            </div>
            <strong>{{ formatPrice(selectedFlat.price) }}</strong>
          </div>
        </div>

        <div class="card simple-panel">
          <div class="panel-head">
            <div>
              <p class="panel-kicker">Progress</p>
              <h2>Timeline</h2>
            </div>
          </div>

          <div class="timeline-list">
            <div
              v-for="step in timeline"
              :key="step.label"
              :class="['timeline-row', `timeline-row--${step.state}`]"
            >
              <span class="timeline-row__dot"></span>
              <div>
                <strong>{{ step.label }}</strong>
                <p>{{ step.detail }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="wrap page-shell">
      <section class="auth-wall card">
        <h1>No active application</h1>
        <p>No application is linked to this account yet.</p>
        <RouterLink to="/" class="btn btn-primary btn-lg">Back to overview</RouterLink>
      </section>
    </div>
  </div>
</template>

<style scoped>
.application-page {
  min-height: 100vh;
}

.application-shell {
  display: grid;
  gap: 24px;
}

.auth-wall {
  max-width: 500px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
  padding: 32px;
  text-align: center;
}

.auth-wall h1,
.application-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.05em;
  color: var(--heading);
}

.auth-wall p,
.header-copy,
.timeline-row p {
  margin: 0;
  color: var(--text-2);
  line-height: 1.65;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.application-header__actions {
  display: grid;
  gap: 10px;
  justify-items: end;
}

.application-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.simple-panel {
  padding: 24px;
}

.panel-head {
  margin-bottom: 18px;
}

.panel-kicker {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue-text);
}

.panel-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--heading);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.info-list {
  display: grid;
  gap: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}

.info-row:first-child {
  padding-top: 0;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row span {
  color: var(--text-2);
}

.info-row strong {
  text-align: right;
  color: var(--heading);
}

.action-strip,
.selected-strip {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.selected-strip div {
  display: grid;
  gap: 4px;
}

.selected-strip span {
  color: var(--text-2);
}

.timeline-list {
  display: grid;
  gap: 18px;
}

.timeline-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
}

.timeline-row__dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 999px;
  background: var(--bg-3);
}

.timeline-row--done .timeline-row__dot {
  background: var(--green);
}

.timeline-row--current .timeline-row__dot {
  background: var(--blue);
}

.timeline-row strong {
  display: block;
  margin-bottom: 4px;
  color: var(--heading);
}

@media (max-width: 980px) {
  .application-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .application-header,
  .application-header__actions,
  .action-strip,
  .selected-strip,
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .application-header__actions {
    justify-items: start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-row strong {
    text-align: left;
  }
}
</style>
