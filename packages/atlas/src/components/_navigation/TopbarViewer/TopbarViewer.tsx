import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { Searchbar } from '@/components/Searchbar'
import { Button } from '@/components/_buttons/Button'
import { SvgActionAddVideo, SvgActionMember } from '@/components/_icons'
import { SvgJoystreamLogoFull } from '@/components/_illustrations'
import { SkeletonLoader } from '@/components/_loaders/SkeletonLoader'
import { MemberDropdown } from '@/components/_overlays/MemberDropdown'
import { QUERY_PARAMS, absoluteRoutes } from '@/config/routes'
import { useMediaMatch } from '@/hooks/useMediaMatch'
import { useOverlayManager } from '@/providers/overlayManager'
import { useSearchStore } from '@/providers/search'
import { useUser } from '@/providers/user'
import { cVar, transitions } from '@/styles'

import {
  ButtonWrapper,
  Overlay,
  SearchbarContainer,
  SignedButtonsWrapper,
  StyledAvatar,
  StyledButtonSkeletonLoader,
  StyledIconButton,
  StyledTopbarBase,
} from './TopbarViewer.styles'

export const TopbarViewer: React.FC = () => {
  const { activeAccountId, extensionConnected, activeMemberId, activeMembership, signIn, activeMembershipLoading } =
    useUser()
  const [isMemberDropdownActive, setIsMemberDropdownActive] = useState(false)

  const isLoggedIn = activeAccountId && !!activeMemberId && !!extensionConnected

  const { pathname, search } = useLocation()
  const mdMatch = useMediaMatch('md')
  const { incrementOverlaysOpenCount, decrementOverlaysOpenCount } = useOverlayManager()
  const {
    searchOpen,
    searchQuery,
    actions: { setSearchOpen, setSearchQuery },
  } = useSearchStore()

  useEffect(() => {
    if (searchOpen) {
      incrementOverlaysOpenCount()
    } else {
      decrementOverlaysOpenCount()
    }
  }, [searchOpen, incrementOverlaysOpenCount, decrementOverlaysOpenCount])

  // set input search query on results page
  useEffect(() => {
    if (pathname.includes(absoluteRoutes.viewer.search())) {
      if (search) {
        const params = new URLSearchParams(search)
        const query = params.get(QUERY_PARAMS.SEARCH)
        setSearchQuery(query || '')
      }
    }
  }, [pathname, search, setSearchQuery])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchOpen(true)
    setSearchQuery(event.currentTarget.value)
  }

  const onClose = useCallback(() => {
    setSearchOpen(false)
  }, [setSearchOpen])

  const handleFocus = () => {
    setSearchOpen(true)
  }

  const handleCancel = () => {
    setSearchQuery('')
  }

  const handleDrawerToggle = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setIsMemberDropdownActive(!isMemberDropdownActive)
  }

  const topbarButtonLoaded = extensionConnected !== null

  return (
    <>
      <StyledTopbarBase
        hasFocus={searchOpen}
        noLogo={!mdMatch && !!searchQuery}
        fullLogoNode={<SvgJoystreamLogoFull />}
        logoLinkUrl={absoluteRoutes.viewer.index()}
      >
        <SearchbarContainer>
          <CSSTransition classNames="searchbar" in={searchOpen} timeout={0}>
            <Searchbar
              placeholder="Search..."
              onChange={handleChange}
              onFocus={handleFocus}
              onCancel={handleCancel}
              showCancelButton={!!searchQuery}
              onClose={onClose}
              controlled
              onClick={handleFocus}
            />
          </CSSTransition>
          {!mdMatch && isLoggedIn && !searchOpen && topbarButtonLoaded && (
            <StyledAvatar size="small" assetUrl={activeMembership?.avatarUri} onClick={handleDrawerToggle} />
          )}
        </SearchbarContainer>
        <SwitchTransition>
          <CSSTransition
            key={String(topbarButtonLoaded)}
            mountOnEnter
            classNames={transitions.names.fade}
            timeout={parseInt(cVar('animationTimingFast', true))}
          >
            <ButtonWrapper>
              {mdMatch &&
                (topbarButtonLoaded ? (
                  isLoggedIn ? (
                    <SignedButtonsWrapper>
                      <Button
                        icon={<SvgActionAddVideo />}
                        iconPlacement="left"
                        size="medium"
                        to={absoluteRoutes.studio.index()}
                        variant="secondary"
                      >
                        Go to Studio
                      </Button>
                      <StyledAvatar
                        size="small"
                        assetUrl={activeMembership?.avatarUri}
                        onClick={handleDrawerToggle}
                        loading={activeMembershipLoading}
                      />
                    </SignedButtonsWrapper>
                  ) : (
                    <Button icon={<SvgActionMember />} iconPlacement="left" size="medium" onClick={signIn}>
                      Sign In
                    </Button>
                  )
                ) : (
                  <SignedButtonsWrapper>
                    <StyledButtonSkeletonLoader width={140} height={40} />
                    <SkeletonLoader rounded width={40} height={40} />
                  </SignedButtonsWrapper>
                ))}
              {!searchQuery && !mdMatch && !isLoggedIn && topbarButtonLoaded && (
                <StyledIconButton onClick={signIn}>Sign In</StyledIconButton>
              )}
            </ButtonWrapper>
          </CSSTransition>
        </SwitchTransition>
        <CSSTransition classNames="searchbar-overlay" in={searchOpen} timeout={0} unmountOnExit mountOnEnter>
          <Overlay onClick={onClose} />
        </CSSTransition>
      </StyledTopbarBase>
      <MemberDropdown isActive={isMemberDropdownActive} closeDropdown={() => setIsMemberDropdownActive(false)} />
    </>
  )
}
