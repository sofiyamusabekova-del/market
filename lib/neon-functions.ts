/**
 * Neon Serverless Function caller
 */
export async function invokeNeonHelloFunction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const functionBaseUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL;
  if (!functionBaseUrl) {
    return { success: false, error: 'NEON_FUNCTION_HELLO_BASE_URL is not set' };
  }

  try {
    const res = await fetch(functionBaseUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return { success: res.ok, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
