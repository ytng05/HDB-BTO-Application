<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AlertTriangle, CheckCircle2, Play, RefreshCcw } from 'lucide-vue-next'
import {
  fetchApplications,
  createBallotAudit,
  fetchBallotAudits,
  fetchProjects,
  fetchFlatSelections,
  runProcessBallot,
  type BallotAuditRecord,
  type FlatSelectionRecord,
} from '@/services/api'
import { getProjectTown } from '@/data/projects'

type QueueTownFilter = 'all' | string

interface EnrichedQueueRecord extends FlatSelectionRecord {
  town: string
  flat_type: string
}

const audits = ref<BallotAuditRecord[]>([])
const exerciseIds = ref<number[]>([])
const manualExerciseId = ref<number | null>(null)
const scheduledExerciseId = ref<number | null>(null)
const scheduledRunAtLocal = ref('')

const currentProjectIds = ref<Set<number>>(new Set())
const queueTownFilter = ref<QueueTownFilter>('all')
const queueRecords = ref<FlatSelectionRecord[]>([])
const queueRefreshedAt = ref<string | null>(null)
const applicationFlatTypeById = ref<Record<number, string>>({})

const isRunning = ref(false)
const isLoadingAudits = ref(false)
const isLoadingExercises = ref(false)
const isLoadingQueue = ref(false)

const message = ref('')
const errorMessage = ref('')

const completedExerciseIds = computed(() => {
  const completed = audits.value
    .filter((audit) => audit.status === 'completed')
    .map((audit) => audit.exercise_id)

  return new Set(completed)
})

const runnableExerciseIds = computed(() =>
  exerciseIds.value.filter((exerciseId) => !completedExerciseIds.value.has(exerciseId)),
)

const hasRunnableExercises = computed(() => runnableExerciseIds.value.length > 0)
const selectedExerciseIsCompleted = computed(
  () => manualExerciseId.value !== null && completedExerciseIds.value.has(manualExerciseId.value),
)
const selectedScheduledExerciseIsCompleted = computed(
  () => scheduledExerciseId.value !== null && completedExerciseIds.value.has(scheduledExerciseId.value),
)

const enrichedQueueRecords = computed<EnrichedQueueRecord[]>(() =>
  queueRecords.value
    .filter((record) => currentProjectIds.value.has(record.project_id))
    .map((record) => ({
      ...record,
      town: getProjectTown(record.project_id),
      flat_type: applicationFlatTypeById.value[record.application_id] ?? '',
    })),
)

const queueTownOptions = computed(() => {
  const towns = [...new Set(enrichedQueueRecords.value.map((record) => record.town))]
  return towns.sort((left, right) => left.localeCompare(right))
})

const filteredQueueRecords = computed(() => {
  return enrichedQueueRecords.value
    .filter((record) => record.flat_type.trim().length > 0)
    .filter((record) => queueTownFilter.value === 'all' || record.town === queueTownFilter.value)
    .sort((left, right) => {
      if (left.town !== right.town) {
        return left.town.localeCompare(right.town)
      }

      if (left.flat_type !== right.flat_type) {
        return left.flat_type.localeCompare(right.flat_type)
      }

      if (left.project_id !== right.project_id) {
        return left.project_id - right.project_id
      }

      return left.queue_number - right.queue_number
    })
})

const hasQueueRecords = computed(() => filteredQueueRecords.value.length > 0)

const roomTypeCards = computed(() => {
  const grouped = new Map<string, { flatType: string; applicants: Array<{ applicationId: number; queueNumber: number }> }>()

  for (const record of filteredQueueRecords.value) {
    if (!grouped.has(record.flat_type)) {
      grouped.set(record.flat_type, { flatType: record.flat_type, applicants: [] })
    }

    grouped.get(record.flat_type)?.applicants.push({
      applicationId: record.application_id,
      queueNumber: record.queue_number,
    })
  }

  return Array.from(grouped.values())
    .map((card) => ({
      ...card,
      applicants: [...card.applicants].sort((left, right) => left.queueNumber - right.queueNumber),
    }))
    .sort((left, right) => left.flatType.localeCompare(right.flatType))
})

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'N/A'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(parsed)
}

function statusChipClass(status: string) {
  if (status === 'completed' || status === 'paid' || status === 'reserved') return 'status-chip status-chip--success'
  if (status === 'error' || status === 'forfeited' || status === 'cancelled') return 'status-chip status-chip--danger'
  if (status === 'balloted' || status === 'selecting') return 'status-chip status-chip--info'
  return 'status-chip'
}

function clearQueueFilters() {
  queueTownFilter.value = 'all'
}

function toLocalInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function toCronExpression(localDateTime: string) {
  const parsed = new Date(localDateTime)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  const minute = parsed.getMinutes()
  const hour = parsed.getHours()
  const day = parsed.getDate()
  const month = parsed.getMonth() + 1
  return `${minute} ${hour} ${day} ${month} *`
}

async function loadCurrentProjectScope() {
  const { status, data } = await fetchProjects({ status: 'open' })
  if (status === 200 && Array.isArray(data.data)) {
    currentProjectIds.value = new Set(data.data.map((project) => project.project_id))
    return
  }

  currentProjectIds.value = new Set()
}

async function loadApplicationFlatTypeMap() {
  const { status, data } = await fetchApplications()
  if (status !== 200 || !Array.isArray(data.applications)) {
    applicationFlatTypeById.value = {}
    return
  }

  const nextMap: Record<number, string> = {}
  for (const application of data.applications) {
    nextMap[application.application_id] = application.flat_type
  }

  applicationFlatTypeById.value = nextMap
}

async function loadExercises() {
  isLoadingExercises.value = true
  try {
    const { status, data } = await fetchProjects()
    if (status === 200 && Array.isArray(data.data)) {
      const ids = [...new Set(data.data.map((project) => project.exercise_id))]
      exerciseIds.value = ids.sort((a, b) => a - b)
    } else {
      exerciseIds.value = []
    }

    if (manualExerciseId.value === null && runnableExerciseIds.value.length > 0) {
      manualExerciseId.value = runnableExerciseIds.value[runnableExerciseIds.value.length - 1] ?? null
    }

    if (scheduledExerciseId.value === null && runnableExerciseIds.value.length > 0) {
      scheduledExerciseId.value = runnableExerciseIds.value[runnableExerciseIds.value.length - 1] ?? null
    }

    if (
      manualExerciseId.value !== null
      && completedExerciseIds.value.has(manualExerciseId.value)
    ) {
      manualExerciseId.value = runnableExerciseIds.value[runnableExerciseIds.value.length - 1] ?? null
    }

    if (
      scheduledExerciseId.value !== null
      && completedExerciseIds.value.has(scheduledExerciseId.value)
    ) {
      scheduledExerciseId.value = runnableExerciseIds.value[runnableExerciseIds.value.length - 1] ?? null
    }

    if (!scheduledRunAtLocal.value) {
      const nextHour = new Date()
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
      scheduledRunAtLocal.value = toLocalInputValue(nextHour)
    }
  } finally {
    isLoadingExercises.value = false
  }
}

async function loadAudits() {
  isLoadingAudits.value = true
  try {
    const { status, data } = await fetchBallotAudits()
    if (status === 200 && Array.isArray(data.data)) {
      audits.value = [...data.data].sort((left, right) => right.audit_id - left.audit_id)
      if (
        manualExerciseId.value !== null
        && completedExerciseIds.value.has(manualExerciseId.value)
      ) {
        manualExerciseId.value = runnableExerciseIds.value[runnableExerciseIds.value.length - 1] ?? null
      }

      if (
        scheduledExerciseId.value !== null
        && completedExerciseIds.value.has(scheduledExerciseId.value)
      ) {
        scheduledExerciseId.value = runnableExerciseIds.value[runnableExerciseIds.value.length - 1] ?? null
      }
      return
    }
    audits.value = []
  } finally {
    isLoadingAudits.value = false
  }
}

async function loadQueueRecords() {
  isLoadingQueue.value = true
  try {
    const { status, data } = await fetchFlatSelections()
    if (status === 200 && Array.isArray(data.data)) {
      queueRecords.value = [...data.data].sort((left, right) => {
        if (left.project_id !== right.project_id) {
          return left.project_id - right.project_id
        }
        return left.queue_number - right.queue_number
      })
      await loadApplicationFlatTypeMap()
      queueRefreshedAt.value = new Date().toISOString()
      return
    }

    queueRecords.value = []
    queueRefreshedAt.value = new Date().toISOString()
    if (status !== 404) {
      const fallback = typeof data.message === 'string' ? data.message : 'Unable to load flat selection records.'
      errorMessage.value = fallback
    }
  } catch (error) {
    queueRecords.value = []
    queueRefreshedAt.value = new Date().toISOString()
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load flat selection records.'
  } finally {
    isLoadingQueue.value = false
  }
}

async function executeBallot(exerciseId: number, auditId: number, triggerSource: string) {
  errorMessage.value = ''
  message.value = ''

  isRunning.value = true
  try {
    const { status, data } = await runProcessBallot({
      exercise_id: exerciseId,
      audit_id: auditId,
      trigger_source: triggerSource,
    })

    if (status === 200 && data.data) {
      message.value = `Ballot run completed. Run ID: ${data.data.run_id}`
      return
    }

    const details = Array.isArray(data.details) ? data.details.join(' ') : ''
    const errors = Array.isArray(data.errors) ? data.errors.join(' ') : ''
    const fallback = typeof data.message === 'string' ? data.message : 'Unable to execute ballot run.'
    errorMessage.value = [fallback, errors, details].filter(Boolean).join(' ')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to execute ballot run.'
  } finally {
    await Promise.all([loadAudits(), loadQueueRecords()])
    isRunning.value = false
  }
}

async function runManualBallot() {
  if (!hasRunnableExercises.value) {
    errorMessage.value = 'All exercises are already completed. No new run can be scheduled.'
    return
  }

  if (!manualExerciseId.value || manualExerciseId.value <= 0) {
    errorMessage.value = 'Please select a valid exercise for manual run.'
    return
  }

  if (completedExerciseIds.value.has(manualExerciseId.value)) {
    errorMessage.value = `Exercise ${manualExerciseId.value} is already completed and cannot be run or scheduled again.`
    return
  }

  isRunning.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    const { status, data } = await createBallotAudit({
      exercise_id: manualExerciseId.value,
      run_at: new Date().toISOString(),
      status: 'in progress',
      executed_at: null,
      error_reason: null,
      cron_expression: null,
    })

    if (status !== 201 || !data.data?.audit_id) {
      const fallback = typeof data.message === 'string' ? data.message : 'Unable to create manual audit record.'
      errorMessage.value = fallback
      return
    }

    await executeBallot(manualExerciseId.value, data.data.audit_id, `manual:${data.data.audit_id}`)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to execute ballot run.'
  } finally {
    isRunning.value = false
  }
}

async function scheduleBallotRun() {
  if (!hasRunnableExercises.value) {
    errorMessage.value = 'All exercises are already completed. No new run can be scheduled.'
    return
  }

  if (!scheduledExerciseId.value || scheduledExerciseId.value <= 0) {
    errorMessage.value = 'Please select a valid exercise to schedule.'
    return
  }

  if (completedExerciseIds.value.has(scheduledExerciseId.value)) {
    errorMessage.value = `Exercise ${scheduledExerciseId.value} is already completed and cannot be scheduled again.`
    return
  }

  if (!scheduledRunAtLocal.value) {
    errorMessage.value = 'Please select date and time for the scheduled run.'
    return
  }

  const selectedTime = new Date(scheduledRunAtLocal.value)
  if (Number.isNaN(selectedTime.getTime())) {
    errorMessage.value = 'Please pick a valid date and time.'
    return
  }

  if (selectedTime.getTime() <= Date.now()) {
    errorMessage.value = 'Scheduled time must be in the future.'
    return
  }

  const cronExpression = toCronExpression(scheduledRunAtLocal.value)
  if (!cronExpression) {
    errorMessage.value = 'Unable to convert selected date/time to schedule expression.'
    return
  }

  isRunning.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    const runAtIso = selectedTime.toISOString()
    const { status, data } = await createBallotAudit({
      exercise_id: scheduledExerciseId.value,
      run_at: runAtIso,
      status: 'scheduled',
      cron_expression: cronExpression,
      executed_at: null,
      error_reason: null,
    })

    if (status === 201 && data.data?.audit_id) {
      message.value = `Scheduled exercise ${scheduledExerciseId.value} for ${formatDateTime(runAtIso)}.`
      await loadAudits()
      return
    }

    errorMessage.value = typeof data.message === 'string' ? data.message : 'Unable to schedule ballot run.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to schedule ballot run.'
  } finally {
    isRunning.value = false
  }
}

async function rerunErroredAudit(audit: BallotAuditRecord) {
  await executeBallot(audit.exercise_id, audit.audit_id, `manual-rerun-error:${audit.audit_id}`)
}

async function refreshDashboard() {
  await Promise.all([loadAudits(), loadCurrentProjectScope()])
  await loadQueueRecords()
}

onMounted(async () => {
  await Promise.all([loadExercises(), loadAudits(), loadCurrentProjectScope()])
  await loadQueueRecords()
})
</script>

<template>
  <section class="section">
    <div class="container">
      <header class="page-header admin-header">
        <div>
          <p class="eyebrow">Admin Console</p>
          <h1 class="page-title">Ballot Control Center</h1>
          <p class="page-subtitle">
            Run ballots and review queue outcomes in one place.
          </p>
        </div>
        <div class="header-badges">
          <span class="status-chip">
            <CheckCircle2 :size="14" />
            Audits {{ audits.length }}
          </span>
        </div>
      </header>

      <div class="control-grid">
        <article class="surface panel">
          <h2>Manual Ballot Run</h2>
          <p class="muted-text">Start a run immediately for the selected exercise.</p>

          <label class="field-label" for="manual-exercise">Exercise</label>
          <select id="manual-exercise" v-model.number="manualExerciseId" class="field" :disabled="isRunning || isLoadingExercises">
            <option v-if="!hasRunnableExercises" :value="null">No runnable exercises</option>
            <option v-for="exerciseId in runnableExerciseIds" :key="exerciseId" :value="exerciseId">
              Exercise {{ exerciseId }}
            </option>
          </select>

          <p v-if="!hasRunnableExercises" class="muted-text">All known exercises already have a completed ballot run.</p>
          <p v-else-if="selectedExerciseIsCompleted" class="message message--error">
            Selected exercise is completed and cannot be run.
          </p>

          <div class="panel-actions">
            <button
              class="btn btn-primary"
              type="button"
              :disabled="isRunning || manualExerciseId === null || selectedExerciseIsCompleted || !hasRunnableExercises"
              @click="runManualBallot"
            >
              <Play :size="16" />
              <span>{{ isRunning ? 'Running...' : 'Execute Ballot' }}</span>
            </button>
            <button class="btn btn-secondary" type="button" :disabled="isLoadingAudits || isLoadingQueue" @click="refreshDashboard">
              <RefreshCcw :size="16" />
              <span>{{ isLoadingAudits || isLoadingQueue ? 'Refreshing...' : 'Refresh Dashboard' }}</span>
            </button>
          </div>
        </article>

        <article class="surface panel">
          <h2>Schedule Ballot Run</h2>
          <p class="muted-text">Pick a date and time. The system handles cron conversion automatically.</p>

          <label class="field-label" for="scheduled-exercise">Exercise</label>
          <select
            id="scheduled-exercise"
            v-model.number="scheduledExerciseId"
            class="field"
            :disabled="isRunning || isLoadingExercises"
          >
            <option v-if="!hasRunnableExercises" :value="null">No runnable exercises</option>
            <option v-for="exerciseId in runnableExerciseIds" :key="`scheduled-${exerciseId}`" :value="exerciseId">
              Exercise {{ exerciseId }}
            </option>
          </select>

          <label class="field-label" for="scheduled-run-at">Run At</label>
          <input
            id="scheduled-run-at"
            v-model="scheduledRunAtLocal"
            class="field"
            type="datetime-local"
            :disabled="isRunning || isLoadingExercises || !hasRunnableExercises"
          />

          <p v-if="selectedScheduledExerciseIsCompleted" class="message message--error">
            Selected exercise is completed and cannot be scheduled.
          </p>

          <div class="panel-actions">
            <button
              class="btn btn-primary"
              type="button"
              :disabled="isRunning || !hasRunnableExercises || scheduledExerciseId === null || selectedScheduledExerciseIsCompleted"
              @click="scheduleBallotRun"
            >
              <span>{{ isRunning ? 'Scheduling...' : 'Schedule Run' }}</span>
            </button>
          </div>
        </article>
      </div>

      <p v-if="message" class="message message--success">{{ message }}</p>
      <p v-if="errorMessage" class="message message--error">
        <AlertTriangle :size="16" />
        <span>{{ errorMessage }}</span>
      </p>

      <div class="surface panel">
        <div class="panel-headline">
          <h2>Queue Explorer</h2>
          <p class="muted-text">
            Current projects only. Filter by town area, then review queue order by room type.
            <template v-if="queueRefreshedAt">Last refreshed: {{ formatDateTime(queueRefreshedAt) }}</template>
          </p>
        </div>

        <div class="queue-filters">
          <label class="runner-field">
            <span>Town Area</span>
            <select v-model="queueTownFilter" class="field">
              <option value="all">All towns</option>
              <option v-for="town in queueTownOptions" :key="town" :value="town">
                {{ town }}
              </option>
            </select>
          </label>

          <div class="filter-actions">
            <button class="btn btn-ghost" type="button" :disabled="isLoadingQueue" @click="clearQueueFilters">
              Clear Filters
            </button>
            <button class="btn btn-secondary" type="button" :disabled="isLoadingQueue" @click="loadQueueRecords">
              <RefreshCcw :size="16" />
              <span>{{ isLoadingQueue ? 'Refreshing...' : 'Refresh Results' }}</span>
            </button>
          </div>
        </div>

        <div v-if="!hasQueueRecords" class="empty-state">
          No flat selection records found for this filter.
        </div>

        <template v-else>
          <div class="room-type-grid">
            <article v-for="card in roomTypeCards" :key="card.flatType" class="room-type-card">
              <p class="room-type-card__title">{{ card.flatType }}</p>
              <p class="room-type-card__subtitle">{{ card.applicants.length }} applicants</p>

              <div class="room-type-card__list">
                <p v-for="entry in card.applicants" :key="`${card.flatType}-${entry.applicationId}`" class="room-type-card__item">
                  <span>Application {{ entry.applicationId }}</span>
                  <strong class="queue-badge">Q{{ entry.queueNumber }}</strong>
                </p>
              </div>
            </article>
          </div>
        </template>
      </div>

      <div class="surface panel">
        <div class="panel-headline">
          <h2>Ballot Audit History</h2>
          <p class="muted-text">Rerun entries with error status directly from here.</p>
        </div>

        <div v-if="audits.length === 0" class="empty-state">
          No ballot audit records found yet.
        </div>

        <div v-else class="table-wrap">
          <table class="result-table">
            <thead>
              <tr>
                <th>Audit</th>
                <th>Exercise</th>
                <th>Executed At</th>
                <th>Status</th>
                <th>Error Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="audit in audits" :key="audit.audit_id">
                <td>#{{ audit.audit_id }}</td>
                <td>{{ audit.exercise_id }}</td>
                <td>{{ formatDateTime(audit.executed_at) }}</td>
                <td>
                  <span :class="statusChipClass(audit.status)">{{ audit.status }}</span>
                </td>
                <td>{{ audit.error_reason || 'N/A' }}</td>
                <td>
                  <button v-if="audit.status === 'error'" class="btn btn-ghost" type="button" @click="rerunErroredAudit(audit)">
                    Rerun
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
}

.header-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel {
  margin-top: 20px;
  padding: 20px;
  border-radius: 12px;
}

.panel h2 {
  margin: 0 0 6px;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.panel-headline {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.queue-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
  margin-bottom: 14px;
}

.runner-field {
  display: grid;
  gap: 8px;
}

.runner-field span {
  font-size: 0.9rem;
  font-weight: 600;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.room-type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.room-type-card {
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: rgba(29, 29, 31, 0.02);
}

.room-type-card__title {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
}

.room-type-card__subtitle {
  margin: 4px 0 10px;
  color: rgba(29, 29, 31, 0.72);
}

.room-type-card__list {
  display: grid;
  gap: 8px;
}

.room-type-card__item {
  margin: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(200, 16, 46, 0.06);
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.queue-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(200, 16, 46, 0.14);
  color: var(--color-red);
  font-size: 0.95rem;
  letter-spacing: 0.03em;
}

.message {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 0;
  font-weight: 600;
}

.message--success {
  color: var(--color-green);
}

.message--error {
  color: var(--color-red);
}

.table-wrap {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 780px;
}

.result-table th,
.result-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

.result-table th {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(29, 29, 31, 0.6);
}

.monospace {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
}

.status-chip--info {
  color: #16529d;
  background: rgba(22, 82, 157, 0.12);
}

@media (max-width: 1020px) {
  .queue-filters,
  .room-type-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: stretch;
  }
}
</style>
