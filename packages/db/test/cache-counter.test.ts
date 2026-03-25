import { describe, expect, it } from "vitest"
import {
  getCachedState,
  getCacheStats,
  invalidateCachedState,
  recordHit,
  recordMiss,
  runWithCacheCounter,
  setCachedState,
} from "../src/cache-counter"

describe("cache counter", () => {
  it("returns null outside a request scope", () => {
    expect(getCacheStats()).toBeNull()
  })

  it("tracks hits and misses within a scope", async () => {
    await runWithCacheCounter(async () => {
      recordMiss()
      recordHit()
      recordHit()

      const stats = getCacheStats()
      expect(stats).toEqual({ hits: 2, misses: 1 })
    })
  })

  it("isolates counters between scopes", async () => {
    await runWithCacheCounter(async () => {
      recordMiss()
      expect(getCacheStats()).toEqual({ hits: 0, misses: 1 })
    })

    await runWithCacheCounter(async () => {
      recordMiss()
      recordHit()
      expect(getCacheStats()).toEqual({ hits: 1, misses: 1 })
    })
  })

  it("caches and retrieves state within a scope", async () => {
    await runWithCacheCounter(async () => {
      expect(getCachedState()).toBeNull()

      const fakeState = { users: [] } as never
      setCachedState(fakeState)
      expect(getCachedState()).toBe(fakeState)
    })
  })

  it("invalidates cached state within a scope", async () => {
    await runWithCacheCounter(async () => {
      const fakeState = { users: [] } as never
      setCachedState(fakeState)
      expect(getCachedState()).toBe(fakeState)

      invalidateCachedState()
      expect(getCachedState()).toBeNull()
    })
  })
})
