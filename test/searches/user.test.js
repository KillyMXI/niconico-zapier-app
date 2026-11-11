import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { App, appTester, useMockedNetwork } from '../helpers.js';
import { mockUser, notFoundResponse, userResponse } from '../mocks.js';

const search = (user_id) =>
  appTester(App.searches.user.operation.perform, { inputData: { user_id } });

describe('searches.user', () => {
  useMockedNetwork();

  it('returns the user wrapped in an array, as Zapier requires', async () => {
    mockUser().reply(200, userResponse);

    const results = await search(383484);

    assert.equal(results.length, 1);
    assert.equal(results[0].id, '383484');
    assert.equal(results[0].nickname, '週刊ファミ通編集部');
  });

  it('returns an empty array when the user does not exist', async () => {
    mockUser(1).reply(404, notFoundResponse);

    assert.deepEqual(await search(1), []);
  });

  // useMockedNetwork fails the test if any request is made.
  for (const userId of ['', '  ', null, undefined]) {
    it(`returns an empty array without a request for user ID ${JSON.stringify(userId) ?? 'undefined'}`, async () => {
      assert.deepEqual(await search(userId), []);
    });
  }
});

describe('app flags', () => {
  it('pass empty input values through, so operations handle them', () => {
    assert.equal(App.flags.cleanInputData, false);
  });
});
