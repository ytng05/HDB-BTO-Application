import { reactive, computed } from 'vue';
import { demoApplications, gardenVistaFlats } from '../data/home';
export const store = reactive({
    currentUser: null,
    applications: demoApplications.map((a) => ({ ...a })),
    flats: gardenVistaFlats.map((f) => ({ ...f })),
    showLoginModal: false,
    ballotRun: true, // pre-run for demo — users already have queue numbers
});
export const isLoggedIn = computed(() => store.currentUser !== null);
export const isAdmin = computed(() => store.currentUser?.role === 'admin');
export function openLoginModal() {
    store.showLoginModal = true;
}
export function closeLoginModal() {
    store.showLoginModal = false;
}
export function login(user) {
    store.currentUser = user;
    closeLoginModal();
}
export function logout() {
    store.currentUser = null;
}
export function getMyApplication() {
    if (!store.currentUser)
        return undefined;
    return store.applications.find((a) => a.nric === store.currentUser.nric);
}
export function runBallot() {
    // Shuffle queue numbers deterministically each call
    const n = store.applications.length;
    const nums = Array.from({ length: n }, (_, i) => i + 1);
    // Fisher-Yates shuffle with time-based seed
    const seed = Date.now();
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(((seed * (i + 1)) % 1000) / 1000 * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    store.applications.forEach((app, idx) => {
        app.queueNumber = nums[idx];
        app.status = 'balloted';
    });
    store.ballotRun = true;
}
export function selectFlat(unitId) {
    const app = getMyApplication();
    if (!app)
        return;
    // Mark flat as reserved
    const flat = store.flats.find((f) => f.id === unitId);
    if (flat)
        flat.status = 'reserved';
    // Update application
    app.selectedUnitId = unitId;
    app.status = 'selected';
}
export function formatPrice(price) {
    return '$' + price.toLocaleString('en-SG');
}
