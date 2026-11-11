// Real Niconico data that the live tests, the recorded tests and
// scripts/record-fixtures.js agree on.

// Inputs for a query with a small, stable set of old videos.
export const STABLE_QUERY = {
  q: 'StrikeVector OR "Strike Vector"',
  targets: 'title,description,tags',
  _sort: 'startTime',
  _limit: 10,
  _context: 'zapier.com integration test'
};

// A corporate account, so its public profile can be recorded.
export const KNOWN_USER_ID = 383484;
