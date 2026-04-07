import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ApplyLayout from '@/views/ApplyLayout.vue'
import FlatSelectionView from '@/views/FlatSelectionView.vue'
import AdminBallotView from '@/views/AdminBallotView.vue'
import ApplyDetailsView from '@/views/apply/ApplyDetailsView.vue'
import ApplyPaymentView from '@/views/apply/ApplyPaymentView.vue'
import ApplyReviewView from '@/views/apply/ApplyReviewView.vue'
import PaymentResultView from '@/views/PaymentResultView.vue'
import AuthCallbackView from '@/views/AuthCallbackView.vue'
import { useAuth } from '@/stores/auth'
import { useApplicationStore } from '@/stores/application'
import { validateSession } from '@/services/myinfo'
import { pinia } from '@/stores/pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }

    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallbackView,
      alias: ['/auth/callback/'],
    },
    {
      path: '/auth/:pathMatch(.*)*',
      component: HomeView,
      beforeEnter: (to) => {
        const raw = to.params.pathMatch
        const value = Array.isArray(raw) ? raw.join('/') : String(raw ?? '')
        const normalized = value.replace(/^\/+|\/+$/g, '').toLowerCase()

        // Accept common callback URL variants/typos and normalize them.
        if (normalized.startsWith('callback')) {
          return {
            path: '/auth/callback',
            query: to.query,
            replace: true,
          }
        }

        return { path: '/' }
      },
    },
    {
      path: '/apply',
      component: ApplyLayout,
      children: [
        {
          path: '',
          redirect: 'details',
        },
        {
          path: 'details',
          name: 'apply-details',
          component: ApplyDetailsView,
          meta: {
            applyStepIndex: 0,
            requiresAuth: true,
          },
        },
        {
          path: 'payment',
          name: 'apply-payment',
          component: ApplyPaymentView,
          meta: {
            applyStepIndex: 1,
            requiresAuth: true,
          },
        },
        {
          path: 'review',
          name: 'apply-review',
          component: ApplyReviewView,
          meta: {
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: '/payment-result',
      name: 'payment-result',
      component: PaymentResultView,
    },
    {
      path: '/select-flat',
      name: 'select-flat',
      component: FlatSelectionView,
      meta: {
        requiresAuth: true,
        requiresBallot: true,
      },
    },
    {
      path: '/admin/ballot',
      name: 'admin-ballot',
      component: AdminBallotView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const { isLoggedIn, restoreSession, logout } = useAuth()
  const applicationStore = useApplicationStore(pinia)
  restoreSession()

  if (to.meta.requiresAuth) {
    if (!isLoggedIn.value) {
      return { path: '/' }
    }

    const sessionValid = await validateSession()
    if (!sessionValid) {
      applicationStore.resetApplication()
      logout()
      return { path: '/' }
    }
  }

  if (to.meta.requiresBallot && !applicationStore.hasBallotAccess) {
    return {
      path: '/',
      hash: '#dashboard',
    }
  }

  return true
})

export default router
