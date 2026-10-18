import { argon2Verify } from 'hash-wasm';
import type { User, AuthResponse } from '../types/auth';

const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/rakou-fr/Licences/refs/heads/main/IT%20services.json';

/**
 * Vérification native d'un hash PBKDF2-SHA256 via l'API Web Crypto du navigateur.
 */
async function verifyPbkdf2(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;

    const [header, saltB64, keyB64] = parts;
    const iterations = parseInt(header.split(':')[2], 10);

    const encoder = new TextEncoder();
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));

    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      baseKey,
      256
    );

    const derivedB64 = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
    return derivedB64 === keyB64;
  } catch {
    return false;
  }
}

export async function loginUser(usernameInput: string, passwordInput: string): Promise<AuthResponse> {
  try {
    const response = await fetch(GITHUB_JSON_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Erreur réseau (${response.status}) : Impossible d'accéder au fichier.`);
    }

    const data: { users: User[] } = await response.json();

    if (!data || !Array.isArray(data.users)) {
      throw new Error("Format du fichier d'authentification invalide.");
    }

    const user = data.users.find(
      u => u.username.toLowerCase() === usernameInput.trim().toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
    }

    if (!user.active) {
      return { success: false, error: 'Ce compte est désactivé.' };
    }

    let isPasswordValid = false;

    if (user.password_hash.startsWith('pbkdf2:sha256:')) {
      isPasswordValid = await verifyPbkdf2(passwordInput, user.password_hash);
    } else if (user.password_hash.startsWith('$argon2')) {
      isPasswordValid = await argon2Verify({ password: passwordInput, hash: user.password_hash });
    } else {
      isPasswordValid = user.password_hash === passwordInput;
    }

    if (!isPasswordValid) {
      return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
    }

    const userSession = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    localStorage.setItem('auth_user', JSON.stringify(userSession));
    localStorage.setItem('auth_token', `session_${user.id}_${Date.now()}`);

    return { success: true, user: userSession };

  } catch (error: any) {
    console.error('Erreur authentification:', error);
    return {
      success: false,
      error: error.message || 'Impossible de contacter le serveur d\'authentification.'
    };
  }
}

export function logoutUser(): void {
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token');
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}