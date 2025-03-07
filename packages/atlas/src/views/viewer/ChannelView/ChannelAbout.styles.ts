import styled from '@emotion/styled'
import React from 'react'

import { Avatar } from '@/components/Avatar'
import { LayoutGrid } from '@/components/LayoutGrid/LayoutGrid'
import { Text } from '@/components/Text'
import { Button } from '@/components/_buttons/Button'
import { oldColors, sizes } from '@/styles'

export const TextContainer = styled.div`
  display: grid;
  grid-gap: ${sizes(4)};
  padding-bottom: ${sizes(8)};
  margin-bottom: ${sizes(8)};
`

export const LinksContainer = styled.div`
  display: grid;
  grid-gap: ${sizes(6)};
`

export const Links = styled.div`
  display: flex;
  flex-wrap: wrap;

  > a {
    margin-right: ${sizes(12)};
    margin-bottom: ${sizes(6)};
  }
`

export const Details = styled.div`
  display: grid;
  gap: ${sizes(2)};
  padding-bottom: ${sizes(4)};
  border-bottom: 1px solid ${oldColors.gray[600]};
  margin-bottom: ${sizes(4)};
`

export const DetailsMember = styled(Details)`
  display: flex;
  align-items: center;
`

export const DetailsText = styled(Text)`
  margin-bottom: ${sizes(4)};
`

export const MemberContainer = styled.div`
  display: grid;
  grid-auto-flow: row;
  gap: ${sizes(2)};
`

export const StyledAvatar = styled(Avatar)`
  margin-right: ${sizes(2)};
`

export const StyledLayoutGrid = styled(LayoutGrid)`
  margin-bottom: 50px;
`

export const Anchor = styled(Text)<React.HTMLProps<HTMLAnchorElement>>`
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export const MemberLink = styled(Button)`
  justify-content: start;

  &,
  * {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
