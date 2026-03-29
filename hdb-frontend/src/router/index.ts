import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ApplyLayout from '@/views/ApplyLayout.vue'
import FlatSelectionView from '@/views/FlatSelectionView.vue'
import PaymentConfirmationView from '@/views/PaymentConfirmationView.vue'
import ApplyLoginView from '@/views/apply/ApplyLoginView.vue'
import ApplyDetailsView from '@/views/apply/ApplyDetailsView.vue'
import ApplyDocumentsView from '@/views/apply/ApplyDocumentsView.vue'
import ApplyReviewView from '@/views/apply/ApplyReviewView.vue'
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
      redirect: '/apply/login',
    },
    {
      path: '/apply',
      component: ApplyLayout,
      children: [
        {
          path: '',
          redirect: '/apply/login',
        },
        {
          path: 'login',
          name: 'apply-login',
          component: ApplyLoginView,
          meta: {
            applyStepIndex: 0,
          },
        },
        {
          path: 'details',
          name: 'apply-details',
          component: ApplyDetailsView,
          meta: {
            applyStepIndex: 1,
          },
        },
        {
          path: 'documents',
          name: 'apply-documents',
          component: ApplyDocumentsView,
          meta: {
            applyStepIndex: 2,
          },
        },
        {
          path: 'review',
          name: 'apply-review',
          component: ApplyReviewView,
          meta: {
            applyStepIndex: 3,
          },
        },
      ],
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
    {
      path: '/payment-confirmation',
      name: 'payment-confirmation',
      component: PaymentConfirmationView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach((to) => {
  const { isLoggedIn, restoreSession } = useAuth()
  const applicationStore = useApplicationStore(pinia)
  restoreSession()

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return {
      path: '/apply/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.name === 'apply-details' && !applicationStore.form.nric) {
    return {
      name: 'apply-login',
    }
  }

  if (to.name === 'apply-documents' && !applicationStore.form.nric) {
    return {
      name: 'apply-login',
    }
  }

  if (to.name === 'apply-review' && !applicationStore.form.nric) {
    return {
      name: 'apply-login',
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
