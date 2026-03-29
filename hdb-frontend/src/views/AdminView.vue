<script setup lang="ts">
import { ref, computed } from 'vue'
import { store, runBallot } from '../store/index'

const balloting = ref(false)
const justRun   = ref(false)

const apps = computed(() =>
  [...store.applications].sort((a, b) => (a.queueNumber ?? 9999) - (b.queueNumber ?? 9999))
)

const stats = computed(() => {
  const total     = store.applications.length
  const balloted  = store.applications.filter(a => a.status === 'balloted' || a.status === 'selected').length
  const selected  = store.applications.filter(a => a.status === 'selected').length
  const available = store.flats.filter(f => f.status === 'available').length
  return { total, balloted, selected, available }
})

function handleRunBallot() {
  balloting.value = true
  justRun.value   = false
  setTimeout(() => {
    runBallot()
    balloting.value = false
    justRun.value   = true
    setTimeout(() => { justRun.value = false }, 4000)
  }, 1800)
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    pending:   'badge badge-amber',
    balloted:  'badge badge-green',
    selected:  'badge badge-green',
    completed: 'badge badge-gray',
  }
  return map[s] ?? 'badge badge-gray'
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending:   'Pending',
    balloted:  'Balloted',
    selected:  'Flat selected',
    completed: 'Completed',
  }
  return map[s] ?? s
}
</script>

<template>
  <div class="page">
    <!-- ── Page hero ── -->
    <div class="page-hero">
      <div class="page-hero__glow" aria-hidden="true"></div>
      <div class="page-hero__grid" aria-hidden="true"></div>
      <div class="wrap page-hero__inner">
        <div>
          <div class="hero-tag">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            Admin Panel
          </div>
          <h1 class="hero-title">Garden Vista</h1>
          <p class="hero-meta">Tengah · July 2026 · HDB Administrator</p>
        </div>
        <div class="hero-status">
          <span class="hero-status__label">Ballot status</span>
          <span :class="store.ballotRun ? 'badge badge-green' : 'badge badge-amber'">
            {{ store.ballotRun ? 'Ballot completed' : 'Pending ballot' }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="wrap page-body">

      <!-- Stat cards -->
      <div class="stats-row">
        <div class="stat-card card">
          <div class="stat-card__icon stat-card__icon--blue">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M6 9h6M6 6h6M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <span class="stat-card__label">Applications</span>
          <strong class="stat-card__val">{{ stats.total }}</strong>
        </div>
        <div class="stat-card card">
          <div class="stat-card__icon stat-card__icon--green">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l4 4 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span class="stat-card__label">Balloted</span>
          <strong class="stat-card__val stat-val--green">{{ stats.balloted }}</strong>
        </div>
        <div class="stat-card card">
          <div class="stat-card__icon stat-card__icon--red">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 8.5V16h5v-4h4v4h5V8.5L9 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </div>
          <span class="stat-card__label">Flat selected</span>
          <strong class="stat-card__val">{{ stats.selected }}</strong>
        </div>
        <div class="stat-card card">
          <div class="stat-card__icon stat-card__icon--amber">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M9 6v3.5l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <span class="stat-card__label">Available units</span>
          <strong class="stat-card__val">{{ stats.available }}</strong>
        </div>
      </div>

      <!-- Ballot control -->
      <div class="ballot-card card">
        <div class="ballot-card__info">
          <h2 class="ballot-card__title">
            {{ store.ballotRun ? 'Ballot has been run' : 'Run the ballot' }}
          </h2>
          <p class="ballot-card__desc">
            {{ store.ballotRun
              ? 'The ballot was last run on 20 Feb 2026. Queue numbers are assigned. You may re-run to simulate a new random draw.'
              : 'Click the button to run the ballot. Each applicant will be assigned a random queue number.'
            }}
          </p>

          <!-- Progress steps -->
          <div class="bsteps">
            <div class="bstep bstep--done">
              <div class="bstep__dot">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="bstep__text">
                <span>Applications collected</span>
                <strong>{{ stats.total }} applicants</strong>
              </div>
            </div>
            <div class="bstep__line"></div>
            <div class="bstep" :class="{ 'bstep--done': store.ballotRun }">
              <div class="bstep__dot">
                <svg v-if="store.ballotRun" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="bstep__text">
                <span>Random draw</span>
                <strong>{{ store.ballotRun ? 'Complete' : 'Pending' }}</strong>
              </div>
            </div>
            <div class="bstep__line"></div>
            <div class="bstep" :class="{ 'bstep--done': stats.selected > 0 }">
              <div class="bstep__dot">
                <svg v-if="stats.selected > 0" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2L8 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="bstep__text">
                <span>Flat selection</span>
                <strong>{{ stats.selected > 0 ? `${stats.selected} selected` : 'Not started' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="ballot-card__action">
          <Transition name="fade-msg" mode="out-in">
            <div v-if="justRun" key="done" class="ballot-done">
              <div class="ballot-done__check">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <strong>Ballot complete</strong>
              <p>Queue numbers have been randomised.</p>
            </div>
            <div v-else key="btn" class="ballot-btn-wrap">
              <button
                class="btn btn-primary ballot-btn"
                :disabled="balloting"
                @click="handleRunBallot"
              >
                <span v-if="balloting" class="spinner"></span>
                {{ balloting ? 'Running ballot…' : store.ballotRun ? 'Re-run ballot' : 'Run ballot' }}
              </button>
              <p class="ballot-note">
                {{ store.ballotRun ? 'This will reassign all queue numbers.' : 'This action cannot be undone in a live system.' }}
              </p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Applications table -->
      <div class="table-card card">
        <div class="table-card__header">
          <h3>All Applications</h3>
          <span class="table-count">{{ apps.length }} records</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Queue No.</th>
                <th>Name</th>
                <th>NRIC</th>
                <th>Flat type</th>
                <th>Applied</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in apps" :key="app.id">
                <td>
                  <span v-if="app.queueNumber" class="q-num">#{{ app.queueNumber }}</span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <div class="name-cell">
                    <div class="name-av">{{ app.name[0] }}</div>
                    {{ app.name }}
                  </div>
                </td>
                <td class="mono text-muted">{{ app.nric }}</td>
                <td>{{ app.flatType }}</td>
                <td class="text-muted">{{ app.appliedDate }}</td>
                <td><span :class="statusBadge(app.status)">{{ statusLabel(app.status) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-2);
  padding-top: var(--nav-h);
}

/* Hero */
.page-hero {
  background: linear-gradient(160deg, #06101e 0%, #0d2040 50%, #06101e 100%);
  padding: 52px 0 44px;
  position: relative;
  overflow: hidden;
}

.page-hero__glow {
  position: absolute;
  top: -40%;
  right: -5%;
  width: 600px;
  height: 500px;
  background: radial-gradient(ellipse at center,
    rgba(20,100,220,0.3) 0%, transparent 65%);
  pointer-events: none;
}

.page-hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.page-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.hero-title {
  font-size: clamp(2.2rem, 4.5vw, 3.6rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  color: white;
  margin-bottom: 10px;
}

.hero-meta {
  font-size: 15px;
  color: rgba(255,255,255,0.4);
}

.hero-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.hero-status__label {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Body */
.page-body {
  padding-top: 32px;
  padding-bottom: 72px;
  display: grid;
  gap: 24px;
}

/* Stat cards */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-card__icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}
.stat-card__icon--blue  { background: rgba(0,112,243,0.1);  color: #0070f3; }
.stat-card__icon--green { background: var(--green-soft);    color: var(--green-text); }
.stat-card__icon--red   { background: var(--red-soft);      color: var(--red); }
.stat-card__icon--amber { background: var(--amber-soft);    color: var(--amber-text); }

.stat-card__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-3);
}

.stat-card__val {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.045em;
  color: var(--text);
  line-height: 1;
}
.stat-val--green { color: var(--green-text); }

/* Ballot card */
.ballot-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
  padding: 36px;
  align-items: center;
}

.ballot-card__title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin-bottom: 10px;
}

.ballot-card__desc {
  font-size: 15px;
  color: var(--text-2);
  line-height: 1.65;
  margin-bottom: 32px;
  max-width: 520px;
}

/* Ballot steps */
.bsteps {
  display: flex;
  align-items: center;
  gap: 0;
}

.bstep {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 110px;
}

.bstep__dot {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--bg-3);
  border: 2px solid var(--border-md);
  display: grid;
  place-items: center;
  transition: all 300ms;
}
.bstep--done .bstep__dot {
  background: var(--green);
  border-color: var(--green);
}

.bstep__text { text-align: center; }
.bstep__text span  { display: block; font-size: 11px; color: var(--text-3); }
.bstep__text strong { display: block; font-size: 12px; font-weight: 600; color: var(--text); margin-top: 2px; }

.bstep__line {
  height: 2px;
  flex: 1;
  min-width: 32px;
  background: var(--border-md);
  margin-bottom: 32px;
}

/* Ballot action */
.ballot-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 190px;
}

.ballot-btn-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ballot-btn {
  width: 180px;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ballot-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.ballot-note {
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
  max-width: 160px;
  line-height: 1.5;
}

.ballot-done {
  text-align: center;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.ballot-done__check {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: var(--green-soft);
  color: var(--green-text);
  display: grid;
  place-items: center;
}
.ballot-done strong { font-size: 15px; }
.ballot-done p      { font-size: 13px; color: var(--text-2); }

/* Table */
.table-card { overflow: hidden; }

.table-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.table-card__header h3 { font-size: 16px; font-weight: 600; }
.table-count { font-size: 13px; color: var(--text-3); }

.table-wrap { overflow-x: auto; }

.q-num {
  font-weight: 700;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-av {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--red-soft);
  color: var(--red);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.mono      { font-family: ui-monospace, 'SF Mono', Consolas, monospace; font-size: 13px; }
.text-muted { color: var(--text-2); }

/* Spinner */
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.fade-msg-enter-active, .fade-msg-leave-active { transition: opacity 200ms, transform 200ms; }
.fade-msg-enter-from, .fade-msg-leave-to { opacity: 0; transform: translateY(6px); }

@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .ballot-card { grid-template-columns: 1fr; }
  .ballot-card__action { justify-content: flex-start; }
  .page-hero__inner { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 600px) {
  .stats-row { grid-template-columns: 1fr; }
}
</style>
