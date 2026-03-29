<script setup lang="ts">
import { computed, ref } from 'vue'
import { Building2, CheckCircle2, Hash, MapPinned, Ruler, SunMedium } from 'lucide-vue-next'
import SelectionModal from '@/components/SelectionModal.vue'
import { useApplicationStore, type AvailableUnit } from '@/stores/application'

const applicationStore = useApplicationStore()

const focusedUnit = ref<AvailableUnit | null>(applicationStore.selectedUnit)
const isModalOpen = ref(false)
const successMessage = ref('')

const canSelectUnit = computed(() => applicationStore.status === 'balloted')
const displayUnit = computed(() => applicationStore.selectedUnit ?? focusedUnit.value)

const floorRows = computed(() => {
  const groupedUnits = applicationStore.availableUnits.reduce<Record<number, AvailableUnit[]>>((accumulator, unit) => {
    const floorUnits = accumulator[unit.floor] ?? []
    floorUnits.push(unit)
    accumulator[unit.floor] = floorUnits
    return accumulator
  }, {})

  return Object.entries(groupedUnits)
    .map(([floor, units]) => ({
      floor: Number(floor),
      units: units.sort((firstUnit, secondUnit) => firstUnit.unitNumber.localeCompare(secondUnit.unitNumber)),
    }))
    .sort((firstRow, secondRow) => secondRow.floor - firstRow.floor)
})

const modalMessage = computed(() => {
  if (!focusedUnit.value) {
    return ''
  }

  return `Confirm selection of Unit #${focusedUnit.value.unitNumber} at ${focusedUnit.value.development}?`
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
  }).format(value)
}

function focusUnit(unit: AvailableUnit) {
  if (applicationStore.status === 'selected') {
    return
  }

  successMessage.value = ''
  focusedUnit.value = unit
}

function closeConfirmModal() {
  isModalOpen.value = false
}

function confirmUnitSelection() {
  if (!focusedUnit.value) {
    return
  }

  applicationStore.reserveUnit(focusedUnit.value)
  successMessage.value = `Flat Selected - Unit #${focusedUnit.value.unitNumber} reserved under your name`
  isModalOpen.value = false
}

function openConfirmModal() {
  if (!focusedUnit.value || !canSelectUnit.value) {
    return
  }

  isModalOpen.value = true
}
</script>

<template>
  <section class="section">
    <div class="container">
      <header class="page-header">
        <p class="eyebrow">Flat Selection</p>
        <h1 class="page-title">Select Flat &mdash; {{ applicationStore.developmentName }}</h1>
        <p class="page-subtitle">Queue Number: {{ applicationStore.queueNumber }}</p>
      </header>

      <div v-if="successMessage" class="success-banner">
        <CheckCircle2 :size="18" />
        <span>{{ successMessage }}</span>
      </div>

      <div v-if="applicationStore.selectedUnit" class="surface reserved-card">
        <p class="reserved-card__label">Reserved Unit</p>
        <h2>{{ applicationStore.selectedUnit.unitNumber }}</h2>
        <p>
          {{ applicationStore.selectedUnit.development }} is now reserved under your application. You may still review
          the selected unit details below.
        </p>
      </div>

      <div class="selection-layout">
        <div class="surface floor-picker">
          <div class="floor-picker__header">
            <div>
              <p class="floor-picker__label">Visual Unit Picker</p>
              <h2>Cinema-style unit selection</h2>
            </div>
            <div class="floor-picker__legend">
              <span><i class="legend-dot legend-dot--available" /> Available</span>
              <span><i class="legend-dot legend-dot--focused" /> Selected</span>
              <span><i class="legend-dot legend-dot--reserved" /> Reserved</span>
            </div>
          </div>

          <div class="floor-picker__screen">Lift Lobby / Common Corridor</div>

          <div class="floor-rows">
            <div v-for="row in floorRows" :key="row.floor" class="floor-row">
              <div class="floor-row__label">Floor {{ row.floor }}</div>

              <div class="floor-row__units">
                <button
                  v-for="unit in row.units"
                  :key="unit.id"
                  :class="[
                    'unit-seat',
                    {
                      'unit-seat--focused': displayUnit?.id === unit.id && applicationStore.status !== 'selected',
                      'unit-seat--reserved': applicationStore.selectedUnit?.id === unit.id,
                    },
                  ]"
                  type="button"
                  :disabled="applicationStore.status === 'selected' && applicationStore.selectedUnit?.id !== unit.id"
                  @click="focusUnit(unit)"
                >
                  <span class="unit-seat__number">{{ unit.unitNumber }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside class="surface unit-panel">
          <template v-if="displayUnit">
            <div class="unit-panel__header">
              <div>
                <p class="unit-panel__label">Selected Unit</p>
                <h2>{{ displayUnit.unitNumber }}</h2>
              </div>
              <span class="status-chip" :class="{ 'status-chip--success': applicationStore.selectedUnit?.id === displayUnit.id }">
                {{ applicationStore.selectedUnit?.id === displayUnit.id ? 'Reserved' : 'Available' }}
              </span>
            </div>

            <div class="unit-panel__meta">
              <p>
                <Building2 :size="16" />
                <span>Floor {{ displayUnit.floor }}</span>
              </p>
              <p>
                <SunMedium :size="16" />
                <span>{{ displayUnit.facing }} facing</span>
              </p>
              <p>
                <Ruler :size="16" />
                <span>{{ displayUnit.sqm }} sqm</span>
              </p>
              <p>
                <MapPinned :size="16" />
                <span>{{ displayUnit.development }}</span>
              </p>
              <p>
                <Hash :size="16" />
                <span>{{ formatCurrency(displayUnit.price) }}</span>
              </p>
            </div>

            <button
              class="btn btn-primary"
              type="button"
              :disabled="!canSelectUnit || applicationStore.status === 'selected'"
              @click="openConfirmModal"
            >
              {{ applicationStore.status === 'selected' ? 'Reserved Under Your Name' : 'Confirm This Unit' }}
            </button>
          </template>

          <template v-else>
            <p class="unit-panel__label">Selected Unit</p>
            <h2>Choose a box by floor</h2>
            <p class="unit-panel__empty">
              Click any unit box on the left to review its floor, facing, area, and price before confirming.
            </p>
          </template>
        </aside>
      </div>
    </div>

    <SelectionModal
      :open="isModalOpen"
      title="Confirm Unit Selection"
      :message="modalMessage"
      confirm-label="Confirm Selection"
      cancel-label="Cancel"
      @close="closeConfirmModal"
      @confirm="confirmUnitSelection"
    />
  </section>
</template>

<style scoped>
.success-banner {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid rgba(26, 127, 75, 0.2);
  border-radius: var(--radius-sm);
  color: var(--color-green);
  background: rgba(26, 127, 75, 0.08);
  font-weight: 600;
}

.reserved-card {
  margin-top: 20px;
  padding: 24px;
}

.reserved-card__label {
  margin: 0 0 8px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.56);
}

.reserved-card h2 {
  margin: 0 0 10px;
  font-size: 1.8rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.reserved-card p {
  margin: 0;
  color: rgba(29, 29, 31, 0.72);
}

.selection-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.9fr);
  gap: 22px;
  margin-top: 24px;
}

.floor-picker,
.unit-panel {
  padding: 24px;
}

.floor-picker__header,
.unit-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.floor-picker__label,
.unit-panel__label {
  margin: 0 0 8px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.56);
}

.floor-picker__header h2,
.unit-panel h2 {
  margin: 0;
  font-size: 1.7rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.floor-picker__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: rgba(29, 29, 31, 0.68);
  font-size: 0.9rem;
}

.floor-picker__legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 999px;
}

.legend-dot--available {
  background: var(--color-grey-bg);
  border: 1px solid var(--color-border);
}

.legend-dot--focused {
  background: var(--color-red-light);
  border: 1px solid var(--color-red);
}

.legend-dot--reserved {
  background: rgba(26, 127, 75, 0.08);
  border: 1px solid var(--color-green);
}

.floor-picker__screen {
  margin-top: 24px;
  padding: 12px 16px;
  border-radius: 999px;
  background: var(--color-grey-bg);
  text-align: center;
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(29, 29, 31, 0.72);
}

.floor-rows {
  display: grid;
  gap: 18px;
  margin-top: 22px;
}

.floor-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
}

.floor-row__label {
  font-size: 0.92rem;
  font-weight: 700;
  color: rgba(29, 29, 31, 0.68);
}

.floor-row__units {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.unit-seat {
  width: 92px;
  min-height: 70px;
  padding: 12px 8px;
  border: 1px solid var(--color-border);
  border-radius: 12px 12px 8px 8px;
  background: var(--color-grey-bg);
  color: var(--color-charcoal);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.unit-seat:hover:not(:disabled) {
  border-color: var(--color-red);
  transform: translateY(-1px);
}

.unit-seat--focused {
  border-color: var(--color-red);
  background: var(--color-red-light);
}

.unit-seat--reserved {
  border-color: var(--color-green);
  background: rgba(26, 127, 75, 0.08);
  color: var(--color-green);
}

.unit-seat:disabled {
  opacity: 0.7;
}

.unit-seat__number {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
}

.unit-panel__meta {
  display: grid;
  gap: 10px;
  margin: 22px 0 24px;
}

.unit-panel__meta p {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: rgba(29, 29, 31, 0.72);
}

.unit-panel__empty {
  margin: 12px 0 0;
  color: rgba(29, 29, 31, 0.72);
}

@media (max-width: 960px) {
  .selection-layout {
    grid-template-columns: 1fr;
  }

  .floor-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .floor-picker__header,
  .unit-panel__header {
    flex-direction: column;
  }
}
</style>
