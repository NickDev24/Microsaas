import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '@/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    // No exponer errores de seguridad en logs de producción
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT Verification Error:', error);
    }
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    // No exponer errores de seguridad en logs de producción
    if (process.env.NODE_ENV === 'development') {
      console.error('Refresh Token Verification Error:', error);
    }
    return null;
  }
}

// Función auxiliar para el middleware (síncrona para compatibilidad)
export function verifyTokenEdge(token: string): JWTPayload | null {
  try {
    // Para Edge Runtime, necesitamos una implementación síncrona
    // Esto es un workaround temporal hasta que podamos hacer todo async
    const decoded = Buffer.from(token.split('.')[1], 'base64').toString();
    const payload = JSON.parse(decoded);
    
    // Verificación básica de expiración
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload as JWTPayload;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Edge JWT Verification Error:', error);
    }
    return null;
  }
}
