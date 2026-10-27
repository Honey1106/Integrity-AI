import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ServiceProvider } from '@/services/ServiceContext'

import { AppShell } from './AppShell'
import { OperatorDashboard } from '@/features/operations/OperatorDashboard'
import { SessionsPage } from '@/features/operations/SessionsPage'
import { SessionDetailPage } from '@/features/operations/SessionDetailPage'
import { SignalsPage } from '@/features/operations/SignalsPage'
import { InvestigationPage } from '@/features/operations/InvestigationPage'
import { AuditPage } from '@/features/operations/AuditPage'

import { PreflightPage } from '@/features/candidate/PreflightPage'
import { SessionPage } from '@/features/candidate/SessionPage'
import { SubmittedPage } from '@/features/candidate/SubmittedPage'

import { NotFound } from '@/components/NotFound'

export function AppRouter() {
  return (
    <ServiceProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            {/* The application opens directly into the institutional operations workspace */}
            <Route path="/" element={<Navigate to="/app" replace />} />

            {/* Operational workspace routes */}
            <Route path="/app" element={<OperatorDashboard />} />
            <Route path="/app/sessions" element={<SessionsPage />} />
            <Route path="/app/sessions/:sessionId" element={<SessionDetailPage />} />
            <Route path="/app/signals" element={<SignalsPage />} />
            <Route path="/app/investigations/:investigationId" element={<InvestigationPage />} />
            <Route path="/app/audit" element={<AuditPage />} />

            {/* Candidate assessment gateway */}
            <Route path="/demo/candidate/preflight" element={<PreflightPage />} />
            <Route path="/demo/candidate/session" element={<SessionPage />} />
            <Route path="/demo/candidate/submitted" element={<SubmittedPage />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ServiceProvider>
  )
}
