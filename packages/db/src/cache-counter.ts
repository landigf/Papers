import { AsyncLocalStorage } from "node:async_hooks"
import type { DemoState } from "./demo-store"

export type CacheStats = {
  hits: number
  misses: number
}

type CacheStore = {
  hits: number
  misses: number
  state: DemoState | null
}

const storage = new AsyncLocalStorage<CacheStore>()

export function runWithCacheCounter<T>(fn: () => T): T {
  return storage.run({ hits: 0, misses: 0, state: null }, fn)
}

export function getCacheStats(): CacheStats | null {
  const store = storage.getStore()
  if (!store) return null
  return { hits: store.hits, misses: store.misses }
}

export function getCachedState(): DemoState | null {
  return storage.getStore()?.state ?? null
}

export function setCachedState(state: DemoState): void {
  const store = storage.getStore()
  if (store) store.state = state
}

export function recordHit(): void {
  const store = storage.getStore()
  if (store) store.hits++
}

export function recordMiss(): void {
  const store = storage.getStore()
  if (store) store.misses++
}

export function invalidateCachedState(): void {
  const store = storage.getStore()
  if (store) store.state = null
}
