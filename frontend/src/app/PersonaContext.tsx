import { createContext, useContext } from 'react'
import type { ActorRole } from '@/domain/types'

export interface PersonaContextValue {
  activeRole: ActorRole
  setRole: (role: ActorRole) => void
  actorLabel: string
}

export const PersonaContext = createContext<PersonaContextValue>({
  activeRole: 'reviewer',
  setRole: () => {},
  actorLabel: 'Reviewer Dr. Sarah Chen',
})

export function usePersona() {
  return useContext(PersonaContext)
}
