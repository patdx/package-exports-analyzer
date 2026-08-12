import { describe, expect, it } from 'vitest';
import { listEntryPoints } from './list-entry-points';

describe('listEntryPoints', () => {
  it('always resolves the default condition', () => {
    const result = listEntryPoints(
      { exports: { '.': { browser: './browser.js', default: './index.js' } } },
      new Set(),
    );

    expect(result.exports).toEqual({ '.': './index.js' });
  });

  it('respects condition key order before default', () => {
    const result = listEntryPoints(
      { exports: { '.': { browser: './browser.js', default: './index.js' } } },
      new Set(['browser']),
    );

    expect(result.exports).toEqual({ '.': './browser.js' });
  });

  it('preserves null targets that explicitly block a subpath', () => {
    const result = listEntryPoints({ exports: { './internal/*': null } });

    expect(result.exports).toEqual({ './internal/*': null });
  });

  it('continues through array alternatives that do not match', () => {
    const result = listEntryPoints({
      exports: [{ browser: './browser.js' }, { default: './index.js' }],
    });

    expect(result.exports).toEqual({ '.': './index.js' });
  });

  it('uses the first matching array alternative', () => {
    const result = listEntryPoints(
      {
        exports: [{ browser: './browser.js' }, { default: './index.js' }],
      },
      new Set(['browser']),
    );

    expect(result.exports).toEqual({ '.': './browser.js' });
  });
});
