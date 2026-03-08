/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import { CNavGroup, CNavItem } from '@coreui/react'
import { FaRegAddressCard } from 'react-icons/fa'
import { MdOutlineDashboard } from 'react-icons/md'
const useNav = () => {
  const navItems = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {
      component: CNavItem,
      name: 'Users',
      to: '/users',
      icon: <MdOutlineDashboard className="me-3" />,
    },
    {  
      component: CNavItem,
      name: 'Collect Payment',
      to: '/collect-payment',
      icon: <MdOutlineDashboard className="me-3" />,
    },
  ]

  return navItems
}

export default useNav
