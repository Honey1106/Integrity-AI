import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ServiceProvider } from '@/services/ServiceContext'

import { AppShell } from './AppShell'
import { HomePage } from '@/features/home/HomePage'
import { PrivacyPage } from '@/features/home/PrivacyPage'

import { PreflightPage } from '@/features/candidate/PreflightPage'
import { SessionPage } from '@/features/candidate/SessionPage'
import { SubmittedPage } from '@/features/candidate/SubmittedPage'

import { OperatorDashboard } from '@/features/operations/OperatorDashboard'
import { SessionsPage } from '@/features/operations/SessionsPage'
import { SessionDetailPage } from '@/features/operations/SessionDetailPage'
import { SignalsPage } from '@/features/operations/SignalsPage'
import { InvestigationPage } from '@/features/operations/InvestigationPage'

import { NotFound } from '@/components/NotFound'

export function AppRouter() {
  return (
    <ServiceProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / candidate routes */}
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/demo/candidate/preflight" element={<PreflightPage />} />
            <Route path="/demo/candidate/session" element={<SessionPage />} />
            <Route path="/demo/candidate/submitted" element={<SubmittedPage />} />

            {/* Operator routes */}
            <Route path="/app" element={<OperatorDashboard />} />
            <Route path="/app/sessions" element={<SessionsPage />} />
            <Route path="/app/sessions/:sessionId" element={<SessionDetailPage />} />
            <Route path="/app/signals" element={<SignalsPage />} />
            <Route path="/app/investigations/:investigationId" element={<InvestigationPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ServiceProvider>
  )
}
