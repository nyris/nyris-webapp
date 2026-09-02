import { NyrisAPISettings } from '@nyris/nyris-api';
import { create } from 'zustand';

const AUTH_API_KEY_CLAIM = 'https://nyris.io/authApiKey';

interface AuthApiKeyUiState {
  /** Bumped whenever the effective Auth0 key changes so React can re-render. */
  version: number;
  /** Authenticated via Auth0 but claim missing / empty. */
  isMissingClaim: boolean;
  bump: () => void;
  setMissingClaim: (isMissingClaim: boolean) => void;
}

export const useAuthApiKeyStore = create<AuthApiKeyUiState>(set => ({
  version: 0,
  isMissingClaim: false,
  bump: () => set(state => ({ version: state.version + 1 })),
  setMissingClaim: isMissingClaim => set({ isMissingClaim }),
}));

let didBootstrapAuth0Guard = false;

/**
 * Clears the static settings.js apiKey when Auth0 is enabled so no request
 * can race and use it before Auth0 provides https://nyris.io/authApiKey.
 */
export function bootstrapAuth0ApiKeyGuard(): void {
  if (didBootstrapAuth0Guard) {
    return;
  }
  didBootstrapAuth0Guard = true;

  if (window.settings?.auth0?.enabled) {
    window.settings.apiKey = '';
  }
}

export function isAuth0Enabled(): boolean {
  return Boolean(window.settings?.auth0?.enabled);
}

export function isNyrisApiKeyReady(): boolean {
  if (!isAuth0Enabled()) {
    return Boolean(window.settings?.apiKey);
  }
  return Boolean(window.settings?.apiKey);
}

export function readAuthApiKeyFromUser(
  user: Record<string, unknown> | undefined | null,
): string | undefined {
  if (!user) {
    return undefined;
  }

  const claim = user[AUTH_API_KEY_CLAIM];
  if (typeof claim === 'string' && claim.trim()) {
    return claim.trim();
  }

  return undefined;
}

export function applyAuthApiKey(authApiKey: string | undefined): void {
  if (!isAuth0Enabled()) {
    return;
  }

  window.settings.apiKey = authApiKey ?? '';
  useAuthApiKeyStore.getState().setMissingClaim(!authApiKey);
  useAuthApiKeyStore.getState().bump();
}

export function clearAuthApiKey(): void {
  if (!isAuth0Enabled()) {
    return;
  }

  window.settings.apiKey = '';
  useAuthApiKeyStore.getState().setMissingClaim(false);
  useAuthApiKeyStore.getState().bump();
}

/**
 * Effective Nyris API key.
 * Auth0 off  → settings.js apiKey
 * Auth0 on   → only the Auth0-synced value on window.settings.apiKey (no fallback)
 */
export function getEffectiveApiKey(): string {
  if (!isAuth0Enabled()) {
    const key = window.settings?.apiKey;
    if (!key) {
      throw new Error('The api-key is not set.');
    }
    return key;
  }

  const key = window.settings?.apiKey;
  if (!key) {
    throw new Error(
      'Auth0 https://nyris.io/authApiKey claim is not available. Nyris API calls are blocked.',
    );
  }
  return key;
}

export function getNyrisSettings(
  settings: NyrisAPISettings = window.settings,
): NyrisAPISettings {
  return {
    ...settings,
    apiKey: getEffectiveApiKey(),
  };
}
