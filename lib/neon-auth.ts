/**
 * Neon Auth integration helper
 * Connects to Neon Auth endpoints (JWKS, Auth Base URL)
 */

export const neonAuthConfig = {
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  jwksUrl: process.env.NEON_AUTH_JWKS_URL,
  isConfigured: Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_JWKS_URL),
};

export async function fetchNeonAuthJwks(): Promise<{ success: boolean; keys?: any[]; error?: string }> {
  if (!neonAuthConfig.jwksUrl) {
    return { success: false, error: 'NEON_AUTH_JWKS_URL is not set' };
  }

  try {
    const res = await fetch(neonAuthConfig.jwksUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return { success: false, error: `Failed to fetch JWKS: ${res.statusText}` };
    }
    const data = await res.json();
    return { success: true, keys: data.keys || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
