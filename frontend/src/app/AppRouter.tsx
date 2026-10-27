import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ServiceProvider } from '@/services/ServiceContext'

import { HomePage } from '@/features/home/HomePage'
import { AppShell } from './AppShell'
import { OperatorDashboard } from '@/features/operations/OperatorDashboard'
import { SessionsPage } from '@/features/operations/SessionsPage'
import { SessionDetailPage } from '@/features/operations/SessionDetailPage'
import { SignalsPage } from '@/features/operations/SignalsPage'
import { InvestigationPage } from '@/features/operations/InvestigationPage'
import { AuditPage } from '@/features/operations/AuditPage'

import { CandidateShell } from '@/features/candidate/CandidateShell'
import { CandidateWelcomePage } from '@/features/candidate/CandidateWelcomePage'
import { PreflightPage } from '@/features/candidate/PreflightPage'
import { SessionPage } from '@/features/candidate/SessionPage'
import { SubmittedPage } from '@/features/candidate/SubmittedPage'

import { NotFound } from '@/components/NotFound'

export function AppRouter() {
  return (
    <ServiceProvider>
      <BrowserRouter>
        <Routes>
          {/* Public-facing product marketing website at root (/) */}
          <Route path="/" element={<HomePage />} />

          {/* Institutional Operator & Reviewer Workspace at /app */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<OperatorDashboard />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
            <Route path="signals" element={<SignalsPage />} />
            <Route path="investigations/:investigationId" element={<InvestigationPage />} />
            <Route path="audit" element={<AuditPage />} />
          </Route>

          {/* Candidate Assessment Experience at /candidate */}
          <Route path="/candidate" element={<CandidateShell />}>
            <Route index element={<CandidateWelcomePage />} />
            <Route path="welcome" element={<CandidateWelcomePage />} />
            <Route path="preflight" element={<PreflightPage />} />
            <Route path="session" element={<SessionPage />} />
            <Route path="submitted" element={<SubmittedPage />} />
          </Route>

          {/* Legacy Demo candidate routes redirected to /candidate */}
          <Route path="/demo/candidate/preflight" element={<Navigate to="/candidate/preflight" replace />} />
          <Route path="/demo/candidate/session" element={<Navigate to="/candidate/session" replace />} />
          <Route path="/demo/candidate/submitted" element={<Navigate to="/candidate/submitted" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ServiceProvider>
  )
}
