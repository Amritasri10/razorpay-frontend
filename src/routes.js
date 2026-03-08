import React from 'react'
import Auth from './views/Users/Auth'
import CollectPay from './views/pages/CollectPay/CollectPay'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const routes = [
  { path: '/Dashboard', exact: true, name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: Auth },
  { path: '/collect-payment', name: 'CollectPayment', element: CollectPay },
]

export default routes
