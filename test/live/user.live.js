// Calls the real Niconico API. Run with `npm run test:live`.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { App, appTester } from '../helpers.js';
import { assertUser } from '../asserts.js';
import { KNOWN_USER_ID } from '../known-data.js';
import { pauseBetweenTests } from './pause.js';

const search = (user_id) =>
  appTester(App.searches.user.operation.perform, { inputData: { user_id } });

describe('searches.user (live)', { timeout: 10000 }, () => {
  pauseBetweenTests();

  it('finds a known user', async () => {
    const results = await search(KNOWN_USER_ID);

    assert.equal(results.length, 1);
    assertUser(results[0], KNOWN_USER_ID);
    assert.equal(typeof results[0].follower_count, 'number');
    assert.equal('channel' in results[0], false);
  });

  // Relies on this user keeping their channel. If it fails, check the user
  // before suspecting the app.
  it('includes the channel of a user who has one', async () => {
    const [user] = await search(14930070);

    assertUser(user, 14930070);
    assert.equal(user.channel.id, 'ch2604107');
    assert.equal(user.channel.url, 'https://ch.nicovideo.jp/ch2604107');
    assert.equal(typeof user.channel.name, 'string');
  });

  it('returns nothing for an unknown user', async () => {
    assert.deepEqual(await search(999999999999), []);
  });
});

describe('hydrators.userHydrator (live)', { timeout: 10000 }, () => {
  pauseBetweenTests();

  it('returns a known user as a single object', async () => {
    const user = await appTester(App.hydrators.userHydrator, { inputData: { user_id: KNOWN_USER_ID } });

    assert.equal(Array.isArray(user), false);
    assertUser(user, KNOWN_USER_ID);
  });

  it('keeps the Zap running for an unknown user', async () => {
    const user = await appTester(App.hydrators.userHydrator, { inputData: { user_id: 999999999999 } });

    assert.equal(user.id, '999999999999');
    assert.equal(user.nickname, null);
  });
});
