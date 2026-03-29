import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ApplyLayout from '@/views/ApplyLayout.vue'
import FlatSelectionView from '@/views/FlatSelectionView.vue'
import ApplyDetailsView from '@/views/apply/ApplyDetailsView.vue'
import ApplyDocumentsView from '@/views/apply/ApplyDocumentsView.vue'
import ApplyPaymentView from '@/views/apply/ApplyPaymentView.vue'
import ApplyReviewView from '@/views/apply/ApplyReviewView.vue'
import PaymentResultView from '@/views/PaymentResultView.vue'
import { useAuth } from '@/stores/auth'
import { useApplicationStore } from '@/stores/application'
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
      path: '/login',
      redirect: '/',
    },
    {
      path: '/apply',
      component: ApplyLayout,
      children: [
        {
          path: '',
          redirect: '/apply/details',
        },
        {
          path: 'login',
          redirect: '/',
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
          path: 'documents',
          name: 'apply-documents',
          component: ApplyDocumentsView,
          meta: {
            applyStepIndex: 1,
            requiresAuth: true,
          },
        },
        {
          path: 'payment',
          name: 'apply-payment',
          component: ApplyPaymentView,
          meta: {
            applyStepIndex: 2,
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
      path: '/flat-selection',
      redirect: '/select-flat',
    },
  ],
})

router.beforeEach((to) => {
  const { isLoggedIn, restoreSession } = useAuth()
  const applicationStore = useApplicationStore(pinia)
  restoreSession()

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { path: '/' }
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
