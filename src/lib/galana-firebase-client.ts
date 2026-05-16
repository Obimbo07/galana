"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

function requirePublicConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!apiKey || !authDomain || !projectId) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_* env vars. See .env.example."
    );
  }
  return {
    apiKey,
    authDomain,
    projectId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  };
}

export function getGalanaFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();
  const c = requirePublicConfig();
  return initializeApp({
    apiKey: c.apiKey,
    authDomain: c.authDomain,
    projectId: c.projectId,
    ...(c.appId ? { appId: c.appId } : {}),
    ...(c.messagingSenderId
      ? { messagingSenderId: c.messagingSenderId }
      : {}),
    ...(c.storageBucket ? { storageBucket: c.storageBucket } : {}),
  });
}

export function getGalanaFirebaseAuth(): Auth {
  return getAuth(getGalanaFirebaseApp());
}

export function isGalanaFirebaseClientConfigured(): boolean {
  try {
    requirePublicConfig();
    return true;
  } catch {
    return false;
  }
}
