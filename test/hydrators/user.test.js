import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { App, appTester, useMockedNetwork } from '../helpers.js';
import {
  mockUser, notFoundResponse, sampleChannel, userResponse, userResponseWith
} from '../mocks.js';

const hydrate = App.hydrators.userHydrator;
const hydrateWith = async (response) => {
  mockUser().reply(200, response);
  return appTester(hydrate, { inputData: { user_id: 383484 } });
};

describe('hydrators.userHydrator', () => {
  useMockedNetwork();

  it('returns the user, keeping the output keys used before nvapi', async () => {
    const user = await hydrateWith(userResponse);

    assert.deepEqual(user, {
      id: '383484',
      nickname: '週刊ファミ通編集部',
      thumbnail_url: 'https://example.com/large.jpg',
      url: 'https://www.nicovideo.jp/user/383484',
      follower_count: 50
    });
  });

  it('adds the channel of a user who has one', async () => {
    const user = await hydrateWith(userResponseWith({ userChannel: sampleChannel }));

    assert.deepEqual(user.channel, {
      id: 'ch2604107',
      name: 'Channel name',
      url: 'https://ch.nicovideo.jp/ch2604107',
      thumbnail_url: 'https://example.com/channel.jpg'
    });
  });

  describe('when optional fields are missing or changed', () => {
    for (const [name, changes] of [
      ['followerCount removed', { followerCount: undefined }],
      ['followerCount not a number', { followerCount: '50' }],
      ['userChannel removed', { userChannel: undefined }],
      ['userChannel without an id', { userChannel: { name: 'x' } }],
      ['userChannel not an object', { userChannel: 'ch1' }]
    ]) {
      it(`leaves them out: ${name}`, async () => {
        const user = await hydrateWith(userResponseWith(changes));

        assert.equal(user.id, '383484');
        if ('followerCount' in changes) assert.equal('follower_count' in user, false);
        if ('userChannel' in changes) assert.equal('channel' in user, false);
      });
    }

    it('uses null for a missing icon', async () => {
      const user = await hydrateWith(userResponseWith({ icons: undefined }));

      assert.equal(user.thumbnail_url, null);
    });

    it('uses null for missing channel details', async () => {
      const user = await hydrateWith(userResponseWith({ userChannel: { id: 'ch1' } }));

      assert.deepEqual(user.channel, {
        id: 'ch1',
        name: null,
        url: 'https://ch.nicovideo.jp/ch1',
        thumbnail_url: null
      });
    });
  });

  it('returns what is known for a user that no longer exists', async () => {
    mockUser(1).reply(404, notFoundResponse);

    const user = await appTester(hydrate, { inputData: { user_id: 1 } });

    assert.deepEqual(user, {
      id: '1',
      nickname: null,
      thumbnail_url: null,
      url: 'https://www.nicovideo.jp/user/1'
    });
  });

  it('rejects on other error statuses', async () => {
    mockUser().reply(400, { meta: { status: 400, errorCode: 'INVALID_PARAMETER' } });

    await assert.rejects(
      appTester(hydrate, { inputData: { user_id: 383484 } }),
      /400/
    );
  });
});
