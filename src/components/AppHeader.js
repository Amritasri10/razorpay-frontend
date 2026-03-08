import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CContainer, CHeader, CHeaderNav, CHeaderToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'

import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CHeader position="sticky" className=" p-0" ref={headerRef}>
      <CContainer style={{ backgroundColor: '#F3F4F6',color:"white" }} className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} style={{color:"#75a724"}} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="d-none d-md-flex"></CHeaderNav>

        <CHeaderNav>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
