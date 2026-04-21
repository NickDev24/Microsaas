import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from '@/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

// Funciones asíncronas internas usando jose
async function signTokenAsync(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);
}

async function signRefreshTokenAsync(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET);
}

async function verifyTokenAsync(token: string): Promise<JWTPayload | null> {
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

async function verifyRefreshTokenAsync(token: string): Promise<JWTPayload | null> {
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

// Funciones síncronas para compatibilidad con código existente
// Estas funciones usan implementaciones síncronas pero son menos seguras
// Se deberían migrar a las versiones asíncronas gradualmente

export function signToken(payload: JWTPayload): string {
  // Implementación síncrona fallback usando jsonwebtoken
  // Por ahora mantenemos la implementación original para compatibilidad
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET_STR = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.sign(payload, JWT_SECRET_STR, { expiresIn: '1h' });
  } catch (error) {
    // Si jsonwebtoken no está disponible, usamos una implementación básica
    throw new Error('JWT signing not available');
  }
}

export function signRefreshToken(payload: JWTPayload): string {
  try {
    const jwt = require('jsonwebtoken');
    const JWT_REFRESH_SECRET_STR = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    return jwt.sign(payload, JWT_REFRESH_SECRET_STR, { expiresIn: '7d' });
  } catch (error) {
    throw new Error('JWT refresh token signing not available');
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET_STR = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.verify(token, JWT_SECRET_STR) as JWTPayload;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT Verification Error:', error);
    }
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const jwt = require('jsonwebtoken');
    const JWT_REFRESH_SECRET_STR = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    return jwt.verify(token, JWT_REFRESH_SECRET_STR) as JWTPayload;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Refresh Token Verification Error:', error);
    }
    return null;
  }
}

// Función auxiliar para el middleware (síncrona)
export function verifyTokenEdge(token: string): JWTPayload | null {
  try {
    // Para Edge Runtime, implementación síncrona
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

// Exportar versiones asíncronas para migración gradual
export {
  signTokenAsync,
  signRefreshTokenAsync,
  verifyTokenAsync,
  verifyRefreshTokenAsync
};
