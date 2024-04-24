// i18n.ts
import 'i18next';

// declare custom type options so the return is always a string.

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}
