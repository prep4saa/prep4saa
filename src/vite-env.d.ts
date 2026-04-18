/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_ADMIN_EMAILS?: string;
  readonly VITE_TEST_PAID_EMAILS?: string;
  readonly VITE_ADMIN_UID?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_LEMON_SQUEEZY_STORE_ID?: string;
  readonly VITE_LEMON_SQUEEZY_PRODUCT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
