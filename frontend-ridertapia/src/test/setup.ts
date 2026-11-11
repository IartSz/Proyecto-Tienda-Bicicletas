import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Desmonta lo renderizado despues de cada test
afterEach(() => {
  cleanup();
});
