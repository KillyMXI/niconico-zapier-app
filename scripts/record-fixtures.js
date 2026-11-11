// Records raw Niconico API responses for the offline tests.
// Run with `npm run record-fixtures`, then review the diff before committing.
//
// Only public data for a stable query and a corporate account is recorded,
// to keep other users' profile data out of the repository.
import { writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { userRequest, videoSearchRequest } from '../niconico/api.js';
import { KNOWN_USER_ID, STABLE_QUERY } from '../test/known-data.js';

const fixturesDir = new URL('../test/fixtures/', import.meta.url);

// Sends a request built for z.request through fetch instead.
const fetchJson = async ({ url, headers, params = {} }) => {
  const target = new URL(url);
  target.search = new URLSearchParams(params).toString();
  const response = await fetch(target, { headers });
  if (!response.ok) {
    throw new Error(`${response.status} for ${target}`);
  }
  return response.json();
};

const save = async (name, data) => {
  await writeFile(new URL(name, fixturesDir), JSON.stringify(data, null, 2) + '\n');
  console.log(`saved test/fixtures/${name}`);
};

const search = await fetchJson(videoSearchRequest(STABLE_QUERY, {
  // A new upload matching the query would change which videos are recorded.
  // Counters and deleted videos still change between recordings.
  'filters[startTime][lt]': '2021-01-01T00:00:00+09:00'
}));
// meta.id is a per-request id; drop it so re-recording gives a clean diff.
delete search.meta.id;
await save('video-search.json', search);

await delay(1000);

await save('user.json', await fetchJson(userRequest(KNOWN_USER_ID)));
