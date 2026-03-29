<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { FlatRecord } from '@/services/api'

const props = withDefaults(
  defineProps<{
    flats: FlatRecord[]
    loading?: boolean
    disabled?: boolean
    busyFlatId?: number | null
  }>(),
  {
    loading: false,
    disabled: false,
    busyFlatId: null,
  },
)

const emit = defineEmits<{
  select: [flat: FlatRecord]
}>()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
  }).format(value)
}
</script>

<template>
  <div class="surface table-card">
    <div class="table-scroll">
      <table class="flat-table">
        <thead>
          <tr>
            <th>Flat ID</th>
            <th>Block</th>
            <th>Level</th>
            <th>Unit</th>
            <th>Type</th>
            <th>Price (SGD)</th>
            <th />
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr>
            <td class="table-feedback" colspan="7">
              <LoadingSpinner label="Loading available flats" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="flats.length === 0">
          <tr>
            <td class="table-feedback" colspan="7">No available flats are currently listed for this project.</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="flat in props.flats" :key="flat.flat_id">
            <td>{{ flat.flat_id }}</td>
            <td>{{ flat.block }}</td>
            <td>{{ flat.floor_number }}</td>
            <td>{{ flat.unit_number }}</td>
            <td>{{ flat.flat_type }}</td>
            <td>{{ formatCurrency(flat.price) }}</td>
            <td class="flat-table__action">
              <button
                class="btn btn-secondary"
                type="button"
                :disabled="disabled || busyFlatId !== null"
                @click="emit('select', flat)"
              >
                Select
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.flat-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.flat-table th,
.flat-table td {
  padding: 18px 16px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  font-size: 0.95rem;
}

.flat-table thead th {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(29, 29, 31, 0.6);
  background: var(--color-grey-bg);
}

.flat-table tbody tr:last-child td {
  border-bottom: 0;
}

.flat-table__action {
  width: 132px;
}

.table-feedback {
  padding: 32px 16px;
  text-align: center;
  color: rgba(29, 29, 31, 0.72);
}
</style>
