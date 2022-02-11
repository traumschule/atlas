import React from 'react'
import ReactDOM from 'react-dom'

import { GlobalStyles } from '@/styles'
import { AssetLogger, SentryLogger } from '@/utils/logs'

import { Maintenance } from './Maintenance'
import { BUILD_ENV } from './config/envs'
import { ASSET_LOGS_URL, SENTRY_DSN } from './config/urls'

const initApp = async () => {
  if (BUILD_ENV === 'production') {
    SentryLogger.initialize(SENTRY_DSN)
    AssetLogger.initialize(ASSET_LOGS_URL)
  }

  ReactDOM.render(
    <>
      <Maintenance />
      <GlobalStyles />
    </>,
    document.getElementById('root')
  )
}

initApp()
