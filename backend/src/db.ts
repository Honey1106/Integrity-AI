import { MongoClient, type Db, type Collection, type ClientSession } from 'mongodb'
import type {
  Assessment,
  Candidate,
  Session,
  Signal,
  Investigation,
  ReviewDecision,
  InstitutionalOutcome,
  AuditEntry,
} from './types.js'
import {
  SEED_ASSESSMENTS,
  SEED_CANDIDATES,
  SEED_SESSIONS,
  SEED_SIGNALS,
  SEED_INVESTIGATIONS,
  SEED_DECISIONS,
  SEED_AUDIT,
} from './seed.js'

let client: MongoClient | null = null
let db: Db | null = null
let inMemoryFallback = false

// In-memory backing stores if MongoDB daemon is unreachable locally
const memStore = {
  assessments: structuredClone(SEED_ASSESSMENTS) as Assessment[],
  candidates: structuredClone(SEED_CANDIDATES) as Candidate[],
  sessions: structuredClone(SEED_SESSIONS) as Session[],
  signals: structuredClone(SEED_SIGNALS) as Signal[],
  investigations: structuredClone(SEED_INVESTIGATIONS) as Investigation[],
  decisions: structuredClone(SEED_DECISIONS) as ReviewDecision[],
  outcomes: [] as InstitutionalOutcome[],
  audit: structuredClone(SEED_AUDIT) as AuditEntry[],
}

export async function connectDB(uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/integrityai'): Promise<void> {
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 })
    await client.connect()
    db = client.db()
    inMemoryFallback = false
    await seedInitialDataIfEmpty()
  } catch {
    // Graceful fallback for local evaluation without active mongod service
    inMemoryFallback = true
  }
}

export function isUsingMemoryFallback(): boolean {
  return inMemoryFallback
}

export function getDb(): Db | null {
  return db
}

export function getMongoClient(): MongoClient | null {
  return client
}

export function getMemStore() {
  return memStore
}

async function seedInitialDataIfEmpty() {
  if (!db) return
  const collections = await db.listCollections().toArray()
  const names = new Set(collections.map((c) => c.name))

  if (!names.has('assessments') || (await db.collection('assessments').countDocuments()) === 0) {
    await db.collection('assessments').insertMany(SEED_ASSESSMENTS)
  }
  if (!names.has('candidates') || (await db.collection('candidates').countDocuments()) === 0) {
    await db.collection('candidates').insertMany(SEED_CANDIDATES)
  }
  if (!names.has('sessions') || (await db.collection('sessions').countDocuments()) === 0) {
    await db.collection('sessions').insertMany(SEED_SESSIONS)
  }
  if (!names.has('signals') || (await db.collection('signals').countDocuments()) === 0) {
    await db.collection('signals').insertMany(SEED_SIGNALS)
  }
  if (!names.has('investigations') || (await db.collection('investigations').countDocuments()) === 0) {
    await db.collection('investigations').insertMany(SEED_INVESTIGATIONS)
  }
  if (!names.has('decisions') || (await db.collection('decisions').countDocuments()) === 0) {
    await db.collection('decisions').insertMany(SEED_DECISIONS)
  }
  if (!names.has('audit') || (await db.collection('audit').countDocuments()) === 0) {
    await db.collection('audit').insertMany(SEED_AUDIT)
  }
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
