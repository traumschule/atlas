import React from 'react'

import { useAllCategoriesFeaturedVideos, useCategories, useVideoCount } from '@/api/hooks'
import { GridItem, LayoutGrid } from '@/components/LayoutGrid'
import { Text } from '@/components/Text'
import { ViewErrorFallback } from '@/components/ViewErrorFallback'
import { FeaturedVideoCategoryCard, VideoCategoryCard } from '@/components/_video/VideoCategoryCard'
import { useCategoriesMatch } from '@/hooks/useCategoriesMatch'
import { useHeadTags } from '@/hooks/useHeadTags'
import { useMediaMatch } from '@/hooks/useMediaMatch'
import { createLookup } from '@/utils/data'
import { SentryLogger } from '@/utils/logs'

import {
  FeaturedCategoriesContainer,
  StyledGridHeadingContainer,
  StyledLimitedWidthContainer,
} from './DiscoverView.styles'

export const DiscoverView: React.FC = () => {
  const { categories } = useCategories()
  const mappedVideoCategories = useCategoriesMatch()

  const { allCategoriesFeaturedVideos } = useAllCategoriesFeaturedVideos()

  const categoriesFeaturedVideos = allCategoriesFeaturedVideos
    ? createLookup(allCategoriesFeaturedVideos.map((category) => ({ id: category.categoryId, ...category })))
    : null

  const featuredVideoCategoryCardsData = React.useMemo(() => {
    const _featuredVideoCategoryCardsData =
      categories
        ?.map((category) => {
          const video = categoriesFeaturedVideos?.[category.id]?.categoryFeaturedVideos.find(
            (video) => !!video.videoCutUrl
          )

          if (!video) return null

          return {
            videoTitle: video?.video.title ?? '',
            videoUrl: video?.videoCutUrl ?? '',
            ...mappedVideoCategories?.find((cat) => cat.id === category.id),
          }
        })
        .filter((cat) => !!cat)
        .slice(0, 3) ?? []

    if (_featuredVideoCategoryCardsData.length > 0) {
      return _featuredVideoCategoryCardsData
    }

    if (!categories) {
      return [null, null, null]
    }

    return null
  }, [categories, mappedVideoCategories, categoriesFeaturedVideos])

  const { videoCount, error } = useVideoCount(
    {},
    {
      onError: (error) => SentryLogger.error('Failed to fetch videos count', 'DiscoverView', error),
    }
  )
  const isMdBreakpoint = useMediaMatch('md')

  const headTags = useHeadTags('Discover')

  if (error) {
    return <ViewErrorFallback />
  }

  return (
    <StyledLimitedWidthContainer big>
      {headTags}
      <Text variant="h700">Discover</Text>
      {featuredVideoCategoryCardsData && (
        <FeaturedCategoriesContainer>
          {featuredVideoCategoryCardsData.map((category, i) => (
            <GridItem key={category?.id ?? `placeholder-${i}`} colSpan={{ base: 12, sm: i === 0 ? 12 : 6, xl: 4 }}>
              <FeaturedVideoCategoryCard
                variant={isMdBreakpoint ? 'default' : 'compact'}
                title={category?.name ?? ''}
                videoTitle={category?.videoTitle ?? ''}
                videoUrl={category?.videoUrl ?? ''}
                color={category?.color ?? 'white'}
                icon={category?.icon}
                id={category?.id}
              />
            </GridItem>
          ))}
        </FeaturedCategoriesContainer>
      )}
      <StyledGridHeadingContainer>
        <Text variant="h500">All categories</Text>
      </StyledGridHeadingContainer>
      <LayoutGrid>
        {(mappedVideoCategories ?? new Array(15).fill(null))?.map((category, i) => (
          <GridItem key={i} colSpan={{ base: 6, lg: 4, xl: 3 }}>
            <VideoCategoryCard
              isLoading={category === null}
              title={category?.name ?? ''}
              coverImg={category?.coverImg ?? ''}
              categoryId={category?.id}
              color={category?.color ?? 'white'}
              icon={category?.icon}
              videosTotalCount={videoCount}
              variant={isMdBreakpoint ? 'default' : 'compact'}
              id={category?.id}
            />
          </GridItem>
        ))}
      </LayoutGrid>
    </StyledLimitedWidthContainer>
  )
}
