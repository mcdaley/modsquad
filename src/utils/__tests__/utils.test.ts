//-----------------------------------------------------------------------------
// src/utils/__tests__/utils.test.ts
//-----------------------------------------------------------------------------
import { sum } from '../utils';

describe(`utils`, () => {
  it('returns 0 by default', () => {
    expect(sum()).toBe(0);
  });
  
  it('returns the sum', () => {
    expect(sum(1, 2)).toBe(3);
  });
})