import { reactive, computed } from 'vue'
import type { DemoUser, Application, FlatUnit } from '../data/home'
import { demoApplications, gardenVistaFlats } from '../data/home'

interface Store {
  currentUser: DemoUser | null
  applications: Application[]
  flats: FlatUnit[]
  showLoginModal: boolean
  ballotRun: boolean
}

export const store = reactive<Store>({
  currentUser: null,
  applications: demoApplications.map((a) => ({ ...a })),
  flats: gardenVistaFlats.map((f) => ({ ...f })),
  showLoginModal: false,
  ballotRun: true, // pre-run for demo — users already have queue numbers
})

export const isLoggedIn = computed(() => store.currentUser !== null)
export const isAdmin = computed(() => store.currentUser?.role === 'admin')

export function openLoginModal() {
  store.showLoginModal = true
}

export function closeLoginModal() {
  store.showLoginModal = false
}

export function login(user: DemoUser) {
  store.currentUser = user
  closeLoginModal()
}

export function logout() {
  store.currentUser = null
}

export function getMyApplication(): Application | undefined {
  if (!store.currentUser) return undefined
  return store.applications.find((a) => a.nric === store.currentUser!.nric)
}

export function runBallot() {
  // Fisher-Yates shuffle using Math.random for simplicity in demo
  const n = store.applications.length
  const nums: number[] = Array.from({ length: n }, (_, i) => i + 1)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = nums[i]
    const swp = nums[j]
    if (tmp !== undefined && swp !== undefined) {
      nums[i] = swp
      nums[j] = tmp
    }
  }
  store.applications.forEach((app, idx) => {
    app.queueNumber = nums[idx] ?? idx + 1
    app.status = 'balloted'
  })
  store.ballotRun = true
}

export function selectFlat(unitId: string) {
  const app = getMyApplication()
  if (!app) return

  // Mark flat as reserved
  const flat = store.flats.find((f) => f.id === unitId)
  if (flat) flat.status = 'reserved'

  // Update application
  app.selectedUnitId = unitId
  app.status = 'selected'
}

export function formatPrice(price: number): string {
  return '$' + price.toLocaleString('en-SG')
}
