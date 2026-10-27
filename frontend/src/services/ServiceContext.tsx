/**
 * React context that provides the IntegrityService to the component tree.
 * Swap MockIntegrityService for HttpIntegrityService here when the backend is ready.
 */

import { type ReactNode } from 'react'
import { ServiceContext } from './serviceContextDef'
import { MockIntegrityService } from './MockIntegrityService'

const defaultService = new MockIntegrityService()

export function ServiceProvider({ children }: { children: ReactNode }) {
  return <ServiceContext.Provider value={defaultService}>{children}</ServiceContext.Provider>
}
