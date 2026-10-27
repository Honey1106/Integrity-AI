import { createContext } from 'react'
import type { IntegrityService } from './IntegrityService'

export const ServiceContext = createContext<IntegrityService | null>(null)
