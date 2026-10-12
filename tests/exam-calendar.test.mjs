import test from 'node:test';
import assert from 'node:assert/strict';
import { examStatus } from '../lib/exam-calendar.mjs';

test('countdown uses Paris daylight saving time, independent of visitor time zone', () => {
  const value = examStatus('DSCG', Date.parse('2026-10-19T07:30:00Z'));
  assert.equal(value.days, 1);
  assert.equal(value.hours, 0);
  assert.equal(value.minutes, 0);
  assert.equal(examStatus('DSCG', Date.parse('2026-10-20T07:29:30Z')).minutes, 1);
});
test('past dates never produce a negative or invented annual countdown', () => {
  assert.equal(examStatus('DSCG', Date.parse('2026-10-20T07:30:00Z')).phase, 'ongoing');
  assert.equal(examStatus('DSCG', Date.parse('2026-10-23T00:00:00Z')).phase, 'finished');
  assert.equal(examStatus('DCG').phase, 'pending');
  assert.equal(examStatus('DCG').startsAt, null);
});
