import { type ReactNode } from 'react'
import { ServiceContext } from './serviceContextDef'
import { HttpIntegrityService } from './HttpIntegrityService'

const defaultService = new HttpIntegrityService('/api')

export function ServiceProvider({ children }: { children: ReactNode }) {
  return <ServiceContext.Provider value={defaultService}>{children}</ServiceContext.Provider>
}
