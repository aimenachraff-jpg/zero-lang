/**
 * Utility Functions
 * 
 * Pure, testable utilities with no external dependencies.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

type SpeechRecognitionResultList = {
  length: number
  item(index: number): ZLSpeechRecognitionResult
  [index: number]: ZLSpeechRecognitionResult
}

type ZLSpeechRecognitionResult = {
  length: number
  item(index: number): ZLSpeechRecognitionAlternative
  [index: number]: ZLSpeechRecognitionAlternative
  isFinal: boolean
}

type ZLSpeechRecognitionAlternative = {
  transcript: string
  confidence: number
}

// SpeechRecognition constructor type
type SpeechRecognitionConstructor = new () => SpeechRecognition

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  start(): void
  stop(): void
}

// ============================================
// Class Name Utilities
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Date & Time Utilities
// ============================================

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${diffYears}y ago`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

// ============================================
// CEFR Utilities
// ============================================

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type CEFRLevel = (typeof CEFR_LEVELS)[number]

export function cefrToNumber(level: CEFRLevel): number {
  return CEFR_LEVELS.indexOf(level)
}

export function numberToCefr(num: number): CEFRLevel {
  const clamped = Math.max(0, Math.min(5, Math.floor(num)))
  return CEFR_LEVELS[clamped]
}

export function compareCefr(a: CEFRLevel, b: CEFRLevel): number {
  return cefrToNumber(a) - cefrToNumber(b)
}

export function getCefrColor(level: CEFRLevel): string {
  const colors: Record<CEFRLevel, string> = {
    A1: 'bg-green-100 text-green-800',
    A2: 'bg-green-200 text-green-900',
    B1: 'bg-yellow-100 text-yellow-800',
    B2: 'bg-orange-100 text-orange-800',
    C1: 'bg-red-100 text-red-800',
    C2: 'bg-purple-100 text-purple-800',
  }
  return colors[level] || 'bg-neutral-100 text-neutral-800'
}

export function getCefrLabel(level: CEFRLevel): string {
  const labels: Record<CEFRLevel, string> = {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficiency',
  }
  return labels[level]
}

// ============================================
// String Utilities
// ============================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, maxLength: number, suffix = '…'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function titleCase(text: string): string {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`
}

// ============================================
// Array Utilities
// ============================================

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function uniqueBy<T, K>(array: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>()
  return array.filter(item => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export function groupBy<T, K>(array: T[], key: (item: T) => K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const k = String(key(item))
    ;(groups[k] = groups[k] || []).push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// ============================================
// Number Utilities
// ============================================

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil(p / 100 * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

// ============================================
// Validation Utilities
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
}

// ============================================
// Storage Utilities (IndexedDB via idb)
// ============================================

const DB_NAME = 'zero-lang'
const DB_VERSION = 1

interface OfflineStorage {
  units: UnitCache[]
  progress: ProgressCache[]
  vocabulary: VocabularyCache[]
  srsItems: SRSItemCache[]
}

interface UnitCache {
  id: string
  data: any
  cachedAt: number
  expiresAt: number
}

interface ProgressCache {
  userId: string
  unitId: string
  data: any
  synced: boolean
  updatedAt: number
}

interface VocabularyCache {
  unitId: string
  data: any[]
  cachedAt: number
}

interface SRSItemCache {
  userId: string
  data: any[]
  synced: boolean
  updatedAt: number
}


// Note: Actual idb implementation would go here
// For now, using localStorage as fallback

export const offlineStorage = {
  async getUnits(): Promise<UnitCache[]> {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem('zl_units')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  async setUnits(units: UnitCache[]): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('zl_units', JSON.stringify(units))
    } catch (e) {
      console.warn('Failed to cache units:', e)
    }
  },

  async getProgress(userId: string): Promise<ProgressCache[]> {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(`zl_progress_${userId}`)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  async setProgress(userId: string, progress: ProgressCache[]): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`zl_progress_${userId}`, JSON.stringify(progress))
    } catch (e) {
      console.warn('Failed to cache progress:', e)
    }
  },

  async getSRSItems(userId: string): Promise<SRSItemCache[]> {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(`zl_srs_${userId}`)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  async setSRSItems(userId: string, items: SRSItemCache[]): Promise<void> {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`zl_srs_${userId}`, JSON.stringify(items))
    } catch (e) {
      console.warn('Failed to cache SRS items:', e)
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zl_')) localStorage.removeItem(key)
    })
  },
}

// ============================================
// Speech Utilities (Web Speech API)
// ============================================

export interface SpeechSynthesisOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function createSpeechRecognition(
  onResult: (result: ZLSpeechRecognitionAlternative & { isFinal: boolean }) => void,
  onError: (error: Error) => void,
  lang = 'en-US'
): SpeechRecognition | null {
  if (!isSpeechRecognitionSupported()) return null

  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognitionCtor()
  
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = lang
  
  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1]
    const alternative = result[0]
    onResult({
      transcript: alternative.transcript,
      confidence: alternative.confidence,
      isFinal: result.isFinal,
    })
  }
  
  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    onError(new Error(`Speech recognition error: ${event.error}`))
  }
  
  return recognition
}

export function speak(text: string, options: SpeechSynthesisOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      reject(new Error('Speech synthesis not supported'))
      return
    }
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options.lang || 'en-US'
    utterance.rate = options.rate ?? 1
    utterance.pitch = options.pitch ?? 1
    utterance.volume = options.volume ?? 1
    
    if (options.voice) {
      utterance.voice = options.voice
    }
    
    utterance.onend = () => resolve()
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))
    
    window.speechSynthesis.speak(utterance)
  })
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return []
  return window.speechSynthesis.getVoices()
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return getAvailableVoices().filter(voice => voice.lang.startsWith('en'))
}

// ============================================
// Encryption Utilities (for API keys)
// ============================================

const ENCRYPTION_KEY_LENGTH = 32
const IV_LENGTH = 12

async function getEncryptionKey(): Promise<CryptoKey> {
  const keyString = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'zero-lang-default-key-change-in-production'
  const keyData = new TextEncoder().encode(keyString.padEnd(ENCRYPTION_KEY_LENGTH).slice(0, ENCRYPTION_KEY_LENGTH))
  return crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encrypt(text: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    const encoded = new TextEncoder().encode(text)
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    )
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    return btoa(String.fromCharCode(...Array.from(combined)))
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const combined = new Uint8Array(
      atob(encryptedText).split('').map(c => c.charCodeAt(0))
    )
    const iv = combined.slice(0, IV_LENGTH)
    const encrypted = combined.slice(IV_LENGTH)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )
    return new TextDecoder().decode(decrypted)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
}

// ============================================
// SRS Algorithm (FSRS-inspired)
// ============================================

export interface FSRSParameters {
  requestRetention: number
  maximumInterval: number
  w: number[] // 19 parameters
}

export const DEFAULT_FSRS_PARAMS: FSRSParameters = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  w: [
    0.4, 0.6, 2.4, 5.8, 4.9, 0.9, 0.8, 0.0, 1.6, 0.1,
    1.0, 1.1, 1.2, 0.1, 0.2, 1.0, 0.1, 0.2, 2.0,
  ],
}

export interface SRSState {
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: 'new' | 'learning' | 'review' | 'relearning' | 'mastered'
}

export function initFSRS(difficulty = 0): SRSState {
  return {
    stability: 0,
    difficulty: clamp(difficulty, 0, 10),
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 'new',
  }
}

export function calculateInterval(stability: number, requestRetention: number): number {
  return Math.max(1, Math.round(stability * Math.log(requestRetention) / Math.log(0.9)))
}

export function nextInterval(state: SRSState, rating: 'again' | 'hard' | 'good' | 'easy', params = DEFAULT_FSRS_PARAMS): SRSState {
  const { stability, difficulty, reps, lapses } = state
  const newState = { ...state }
  
  // Simplified FSRS-like update
  switch (rating) {
    case 'again':
      newState.lapses += 1
      newState.stability = Math.max(0.1, stability * 0.5)
      newState.difficulty = Math.min(10, difficulty + 1)
      newState.scheduledDays = 1
      newState.state = lapses > 0 ? 'relearning' : 'learning'
      break
    case 'hard':
      newState.stability = stability * 1.2
      newState.difficulty = Math.min(10, difficulty + 0.5)
      newState.scheduledDays = calculateInterval(newState.stability, params.requestRetention)
      newState.state = reps === 0 ? 'learning' : 'review'
      break
    case 'good':
      newState.stability = stability * (reps === 0 ? 2.5 : 1.5)
      newState.difficulty = Math.max(0, difficulty - 0.2)
      newState.scheduledDays = calculateInterval(newState.stability, params.requestRetention)
      newState.state = reps === 0 ? 'learning' : 'review'
      break
    case 'easy':
      newState.stability = stability * (reps === 0 ? 4 : 2)
      newState.difficulty = Math.max(0, difficulty - 0.5)
      newState.scheduledDays = calculateInterval(newState.stability, params.requestRetention)
      newState.state = 'review'
      break
  }
  
  newState.reps += 1
  newState.elapsedDays = 0
  
  if (newState.stability >= 365) {
    newState.state = 'mastered'
  }
  
  return newState
}

// ============================================
// Export all utilities
// ============================================

export * from './utils'