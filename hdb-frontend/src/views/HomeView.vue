<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, FileText, Hash, MapPinned, UserRound } from 'lucide-vue-next'
import HeroCarousel from '@/components/HeroCarousel.vue'
import BtoProjectCard from '@/components/BtoProjectCard.vue'
import ApplicationStatusStepper from '@/components/ApplicationStatusStepper.vue'
import { heroSlides, upcomingProjects } from '@/data/projects'
import { useApplicationStore } from '@/stores/application'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const applicationStore = useApplicationStore()
const { applicantName, isLoggedIn } = useAuth()

const dashboardName = computed(
  () => (applicantName.value ?? applicationStore.form.fullName) || 'Prospective Applicant',
)
const queueLabel = computed(() => applicationStore.queueNumber ?? 'Pending ballot')
const dashboardTitle = computed(() => {
  if (applicationStore.status === 'selected' && applicationStore.selectedUnit) {
    return `Flat selected: Unit ${applicationStore.selectedUnit.unitNumber}`
  }

  if (applicationStore.status === 'balloted') {
    return 'Ballot results are ready'
  }

  if (applicationStore.status === 'processing') {
    return 'Your application is being processed'
  }

  return 'Begin your flat application'
})

const dashboardText = computed(() => {
  if (applicationStore.status === 'selected' && applicationStore.selectedUnit) {
    return `Unit ${applicationStore.selectedUnit.unitNumber} at ${applicationStore.selectedUnit.development} has been reserved under your name.`
  }

  if (applicationStore.status === 'balloted') {
    return `Your application has received queue number ${applicationStore.queueNumber}. You may proceed to unit selection.`
  }

  if (applicationStore.status === 'processing') {
    return 'Your submission has been received. The ballot result is still pending in this mocked portal flow.'
  }

  return 'Use the guided flow below to submit your flat application with personal details and supporting documents.'
})

function startApplicationFlow() {
  if (applicationStore.status === 'processing') {
    router.push('/apply/payment')
    return
  }

  router.push('/apply/details')
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
          <p class="hero-login-hint">Sign in with your NRIC to start your flat application.</p>
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
              Review your application, track ballot progress, and proceed to flat selection once your queue number is
              ready.
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
              <MapPinned :size="18" />
              <span>Preferred Town</span>
            </div>
            <p class="dashboard-card__value">{{ applicationStore.form.preferredTown || 'Not selected' }}</p>
          </div>

          <div class="surface detail-card dashboard-card">
            <div class="dashboard-card__label">
              <Building2 :size="18" />
              <span>Flat Type</span>
            </div>
            <p class="dashboard-card__value">{{ applicationStore.form.flatType || 'Not selected' }}</p>
          </div>

          <div class="surface detail-card dashboard-card">
            <div class="dashboard-card__label">
              <Hash :size="18" />
              <span>Queue Number</span>
            </div>
            <p class="dashboard-card__value">{{ queueLabel }}</p>
          </div>
        </div>

        <div class="surface dashboard-summary">
          <div class="dashboard-summary__header">
            <div>
              <p class="dashboard-summary__title">{{ dashboardTitle }}</p>
              <p class="dashboard-summary__text">{{ dashboardText }}</p>
            </div>
            <button
              v-if="applicationStore.status === 'balloted' || applicationStore.status === 'selected'"
              class="btn btn-primary dashboard-summary__button"
              type="button"
              @click="router.push('/select-flat')"
            >
              Proceed to Select Flat
            </button>
            <button
              v-else
              class="btn btn-primary dashboard-summary__button"
              type="button"
              @click="startApplicationFlow"
            >
              {{ applicationStore.hasSubmitted ? 'Review Application' : 'Start Application' }}
            </button>
          </div>

          <ApplicationStatusStepper v-if="applicationStore.hasSubmitted" :status="applicationStore.status" />

          <div v-if="applicationStore.status === 'processing'" class="dashboard-actions">
            <button class="btn btn-secondary" type="button" @click="revealMockBallot">Load Mock Ballot Result</button>
          </div>

          <div v-if="applicationStore.status === 'selected' && applicationStore.selectedUnit" class="dashboard-note">
            <FileText :size="18" />
            <span>
              Reserved unit: {{ applicationStore.selectedUnit.unitNumber }} at
              {{ applicationStore.selectedUnit.development }}
            </span>
          </div>
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

.dashboard-hint {
  margin-top: 16px;
  color: rgba(29, 29, 31, 0.6);
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
  .launch-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-summary__header {
    flex-direction: column;
  }
}
</style>
