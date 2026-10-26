import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToNeonStorage, listNeonStorageFiles, isStorageConfigured } from '@/lib/neon-storage';
import { invokeNeonHelloFunction } from '@/lib/neon-functions';
import { fetchNeonAuthJwks, neonAuthConfig } from '@/lib/neon-auth';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    services: {},
  };

  // 1. Test Neon Postgres Database
  try {
    if (!prisma) {
      results.services.postgres = { status: 'failed', error: 'Prisma client is null' };
    } else {
      const startTime = Date.now();
      const productCount = await prisma.product.count();
      const dbNow = await prisma.$queryRaw`SELECT NOW() as current_time, version() as version`;
      results.services.postgres = {
        status: 'ok',
        latencyMs: Date.now() - startTime,
        productCount,
        dbInfo: dbNow,
      };
    }
  } catch (err: any) {
    results.services.postgres = { status: 'failed', error: err.message };
  }

  // 2. Test Neon Object Storage (S3 Assets Bucket)
  try {
    if (!isStorageConfigured) {
      results.services.objectStorage = { status: 'failed', error: 'Storage credentials not configured' };
    } else {
      const testKey = `health-check-${Date.now()}.txt`;
      await uploadToNeonStorage(testKey, `Health check ping at ${new Date().toISOString()}`, 'text/plain');
      const files = await listNeonStorageFiles();
      results.services.objectStorage = {
        status: 'ok',
        testUploadedKey: testKey,
        totalObjectsCount: files.length,
      };
    }
  } catch (err: any) {
    results.services.objectStorage = { status: 'failed', error: err.message };
  }

  // 3. Test Neon Serverless Functions
  try {
    const fnResult = await invokeNeonHelloFunction();
    results.services.functions = {
      status: fnResult.success ? 'ok' : 'failed',
      endpoint: process.env.NEON_FUNCTION_HELLO_BASE_URL,
      response: fnResult.data || fnResult.error,
    };
  } catch (err: any) {
    results.services.functions = { status: 'failed', error: err.message };
  }

  // 4. Test Neon Auth
  try {
    if (!neonAuthConfig.isConfigured) {
      results.services.neonAuth = { status: 'failed', error: 'Neon Auth URL not configured' };
    } else {
      const jwks = await fetchNeonAuthJwks();
      results.services.neonAuth = {
        status: jwks.success ? 'ok' : 'failed',
        baseUrl: neonAuthConfig.baseUrl,
        jwksUrl: neonAuthConfig.jwksUrl,
        keysLoaded: jwks.keys?.length ?? 0,
      };
    }
  } catch (err: any) {
    results.services.neonAuth = { status: 'failed', error: err.message };
  }

  const allPassed = Object.values(results.services).every((s: any) => s.status === 'ok');
  return NextResponse.json(results, { status: allPassed ? 200 : 207 });
}
