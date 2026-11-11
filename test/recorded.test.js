// Replays real API responses recorded by `npm run record-fixtures`.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { App, appTester, useMockedNetwork } from './helpers.js';
import { mockSearch, mockUser } from './mocks.js';
import { assertUser, assertVideo } from './asserts.js';
import { KNOWN_USER_ID, STABLE_QUERY } from './known-data.js';
import videoSearch from './fixtures/video-search.json' with { type: 'json' };
import user from './fixtures/user.json' with { type: 'json' };

describe('recorded responses', () => {
  useMockedNetwork();

  it('triggers.video handles a real search response', async () => {
    mockSearch().query(true).reply(200, videoSearch);

    const results = await appTester(App.triggers.video.operation.perform, { inputData: STABLE_QUERY });

    assert.equal(results.length, videoSearch.data.length);
    results.forEach(assertVideo);
  });

  it('hydrators.userHydrator handles a real user response', async () => {
    mockUser(KNOWN_USER_ID).reply(200, user);

    const result = await appTester(App.hydrators.userHydrator, { inputData: { user_id: KNOWN_USER_ID } });

    assertUser(result, KNOWN_USER_ID);
    assert.equal(result.follower_count, user.data.user.followerCount);
  });
});
