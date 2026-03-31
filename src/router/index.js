import { createRouter, createWebHistory } from 'vue-router'

// Auth
const LoginView          = () => import('@/views/LoginView.vue')
const ForgotPasswordView = () => import('@/views/ForgotPasswordView.vue')
const ResetPasswordView  = () => import('@/views/ResetPasswordView.vue')
const FirstLoginView     = () => import('@/views/FirstLoginView.vue')

// Webmail
const WebmailLayout      = () => import('@/views/webmail/WebmailLayout.vue')
const InboxView          = () => import('@/views/webmail/InboxView.vue')
const SentView           = () => import('@/views/webmail/SentView.vue')
const DraftsView         = () => import('@/views/webmail/DraftsView.vue')
const TrashView          = () => import('@/views/webmail/TrashView.vue')
const StarredView        = () => import('@/views/webmail/StarredView.vue')
const FilesReceivedView  = () => import('@/views/webmail/FilesReceivedView.vue')   // ← NEW
const MessageView        = () => import('@/views/webmail/MessageView.vue')
const SettingsView       = () => import('@/views/webmail/SettingsView.vue')

// Admin
const AdminLayout        = () => import('@/views/admin/AdminLayout.vue')
const DashboardView      = () => import('@/views/admin/DashboardView.vue')
const UsersView          = () => import('@/views/admin/UsersView.vue')
const MailboxesView      = () => import('@/views/admin/MailboxesView.vue')
const ArchivesView       = () => import('@/views/admin/ArchivesView.vue')
const BroadcastView      = () => import('@/views/admin/BroadcastView.vue')         // ← NEW
const AuditLogView       = () => import('@/views/admin/AuditLogView.vue')
const ExternalInboxView = () => import('@/views/webmail/ExternalInboxView.vue')          // ← NEW

const routes = [
  { path: '/', redirect: '/login' },

  // Auth publiques
  { path: '/login',                  name: 'Login',          component: LoginView,          meta: { public: true } },
  { path: '/forgot-password',        name: 'ForgotPassword', component: ForgotPasswordView, meta: { public: true } },
  { path: '/reset-password/:token',  name: 'ResetPassword',  component: ResetPasswordView,  meta: { public: true } },

  // Première connexion
  { path: '/first-login', name: 'FirstLogin', component: FirstLoginView, meta: { requiresAuth: true, firstLoginOnly: true } },

  // Webmail
  {
    path:      '/webmail',
    component: WebmailLayout,
    meta:      { requiresAuth: true },
    children: [
      { path: '',            redirect: 'inbox'   },
      { path: 'inbox',       name: 'Inbox',       component: InboxView         },
      { path: 'sent',        name: 'Sent',        component: SentView          },
      { path: 'drafts',      name: 'Drafts',      component: DraftsView        },
      { path: 'trash',       name: 'Trash',       component: TrashView         },
      { path: 'starred',     name: 'Starred',     component: StarredView       },
      { path: 'files',       name: 'Files',       component: FilesReceivedView }, // ← NEW
      { path: 'message/:id', name: 'Message',     component: MessageView       },
      { path: 'settings',    name: 'Settings',    component: SettingsView      },
      { path: 'external', name: 'ExternalInbox', component: ExternalInboxView },
    ],
  },

  // Admin
  {
    path:      '/admin',
    component: AdminLayout,
    meta:      { requiresAuth: true, requiresSuperAdmin: true },
    children: [
      { path: '',            redirect: 'dashboard'   },
      { path: 'dashboard',   name: 'Dashboard',      component: DashboardView  },
      { path: 'users',       name: 'AdminUsers',     component: UsersView      },
      { path: 'mailboxes',   name: 'AdminMailboxes', component: MailboxesView  },
      { path: 'archives',    name: 'AdminArchives',  component: ArchivesView   },
      { path: 'broadcast',   name: 'Broadcast',      component: BroadcastView  }, // ← NEW
      { path: 'audit-log',   name: 'AuditLog',       component: AuditLogView   }, // ← NEW
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Guards identiques à v1
router.beforeEach((to, from, next) => {
  const token        = localStorage.getItem('rwa_token')
  const user         = JSON.parse(localStorage.getItem('rwa_user') || 'null')
  const isAuth       = !!token
  const isFirstLogin = user?.isFirstLogin === true
  const isSuperAdmin = user?.role === 'SUPERADMIN'

  if (to.meta.public) {
    if (isAuth) {
      if (isFirstLogin) return next('/first-login')
      if (isSuperAdmin) return next('/admin/dashboard')
      return next('/webmail/inbox')
    }
    return next()
  }

  if (to.meta.requiresAuth && !isAuth)               return next('/login')
  if (isAuth && isFirstLogin && to.name !== 'FirstLogin') return next('/first-login')
  if (isAuth && !isFirstLogin && to.name === 'FirstLogin') return next('/webmail/inbox')
  if (to.meta.requiresSuperAdmin && !isSuperAdmin)   return next('/webmail/inbox')

  next()
})

export default router
