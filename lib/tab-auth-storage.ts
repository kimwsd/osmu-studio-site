type AuthStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };

/** Keep credentials in this tab only. A fresh navigation cannot reuse a copied/restored session. */
export function tabAuthStorage(storageKey: string, legacyKeys: string[] = []): AuthStorage {
  const memory = new Map<string, string>();
  let storage: Storage | undefined;
  const keys = [storageKey, ...legacyKeys].flatMap(key => [key, key + "-user", key + "-code-verifier"]);
  const clear = () => {
    memory.clear();
    for (const key of keys) try { window.sessionStorage.removeItem(key); } catch {}
  };
  if (typeof window !== "undefined") {
    // Remove previously saved admin credentials without touching consent, drafts or other site data.
    for (const key of keys) try { window.localStorage.removeItem(key); } catch {}
    try { storage = window.sessionStorage; } catch {}
    const navigation = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type !== "reload") clear();
    window.addEventListener("pageshow", event => {
      if (event.persisted) { clear(); window.location.reload(); }
    });
  }
  return {
    getItem(key) { try { return storage ? storage.getItem(key) : memory.get(key) ?? null; } catch { return memory.get(key) ?? null; } },
    setItem(key, value) { memory.set(key, value); try { storage?.setItem(key, value); } catch { storage = undefined; } },
    removeItem(key) { memory.delete(key); try { storage?.removeItem(key); } catch { storage = undefined; } }
  };
}

