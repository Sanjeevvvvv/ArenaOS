import { describe, it, expect } from 'vitest';
import { getTranslation } from '../lib/translations';

describe('Multilingual Translation Utility', () => {
  it('should return english translation by default', () => {
    const text = getTranslation('en', 'enterPortal');
    expect(text).toBe('Enter Portal');
  });

  it('should return spanish translation when es is selected', () => {
    const text = getTranslation('es', 'enterPortal');
    expect(text).toBe('Ingresar al Portal');
  });

  it('should return french translation when fr is selected', () => {
    const text = getTranslation('fr', 'enterPortal');
    expect(text).toBe('Entrer dans le Portail');
  });

  it('should return german translation when de is selected', () => {
    const text = getTranslation('de', 'enterPortal');
    expect(text).toBe('Portal Betreten');
  });

  it('should return portuguese translation when pt is selected', () => {
    const text = getTranslation('pt', 'enterPortal');
    expect(text).toBe('Entrar no Portal');
  });

  it('should fallback to english if translation key does not exist in target language', () => {
    // Pass a valid key with a non-existent language
    const text = getTranslation('it' as 'en', 'enterPortal');
    expect(text).toBe('Enter Portal');
  });

  it('should return the key itself if the key is not defined in english', () => {
    const text = getTranslation('en', 'nonExistentKey' as 'enterPortal');
    expect(text).toBe('nonExistentKey');
  });
});
