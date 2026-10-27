import { useContext } from 'react'
import type { IntegrityService } from './IntegrityService'
import { ServiceContext } from './serviceContextDef'

export function useService(): IntegrityService {
  const service = useContext(ServiceContext)
  if (!service) throw new Error('useService must be used within a ServiceProvider')
  return service
}
