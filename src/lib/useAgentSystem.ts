"use client";
import { useEffect, useState } from "react";
import { api } from "./api";

/**
 * Whether the agent / referral system is enabled platform-wide.
 *
 * The flag comes from the public `/api/config` endpoint (admin-controlled via
 * the `referral_system_enabled` platform setting). While loading we assume it's
 * ON so the UI doesn't flicker items out and back in; `loading` lets callers
 * defer rendering if they prefer. The result is cached in-module so repeated
 * mounts don't re-fetch within a session.
 */
let cached: boolean | null = null;

export function useAgentSystem(): { enabled: boolean; loading: boolean } {
  const [enabled, setEnabled] = useState<boolean>(cached ?? true);
  const [loading, setLoading] = useState<boolean>(cached === null);

  useEffect(() => {
    if (cached !== null) {
      setEnabled(cached);
      setLoading(false);
      return;
    }
    let active = true;
    api.getPublicConfig()
      .then((cfg) => {
        cached = cfg.referralSystemEnabled;
        if (active) { setEnabled(cfg.referralSystemEnabled); }
      })
      .catch(() => { if (active) setEnabled(true); }) // fail open: keep visible
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { enabled, loading };
}
