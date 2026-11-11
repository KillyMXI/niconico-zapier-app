import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { App, appTester, useMockedNetwork } from '../helpers.js';
import { mockSearch } from '../mocks.js';

const { perform, inputFields } = App.triggers.video.operation;

const inputData = {
  q: 'query',
  targets: 'title,tags',
  _sort: 'startTime',
  _limit: 5,
  _context: 'test context'
};
const bundle = { inputData };

const runWithVideo = async (video, extraInput = {}) => {
  mockSearch().query(true).reply(200, {
    meta: { status: 200 },
    data: [{ contentId: 'sm1', userId: 5, description: '', ...video }]
  });
  const [result] = await appTester(perform, { inputData: { ...inputData, ...extraInput } });
  return result;
};

const HYDRATION = /^hydrate\|\|\|.*hydrators\.userHydrator.*"user_id":5.*\|\|\|hydrate$/;

describe('triggers.video', () => {
  useMockedNetwork();

  it('sends the input values to the API, sorted newest first', async () => {
    let query = {};
    mockSearch()
      .query((actual) => {
        query = actual;
        return true;
      })
      .reply(200, { meta: { status: 200 }, data: [] });

    await appTester(perform, bundle);

    assert.equal(query.q, 'query');
    assert.equal(query.targets, 'title,tags');
    assert.equal(query._sort, '-startTime');
    assert.equal(query._limit, '5');
    assert.equal(query._context, 'test context');
    const fields = String(query.fields).split(',');
    for (const field of ['contentId', 'userId', 'channelId', 'likeCounter', 'contentType']) {
      assert.ok(fields.includes(field), `missing field ${field}`);
    }
  });

  it('adds id and url to each video', async () => {
    const video = await runWithVideo({ contentId: 'sm9' });

    assert.equal(video.id, 'sm9');
    assert.equal(video.url, 'https://nico.ms/sm9');
  });

  describe('user', () => {
    it('adds the profile URL and a user hydration by default', async () => {
      const video = await runWithVideo({ userId: 5 });

      assert.equal(video.userUrl, 'https://www.nicovideo.jp/user/5');
      assert.match(video.user, HYDRATION);
    });

    for (const value of [true, 'true', 'yes']) {
      it(`adds the hydration when include_user is ${JSON.stringify(value)}`, async () => {
        const video = await runWithVideo({ userId: 5 }, { include_user: value });

        assert.match(video.user, HYDRATION);
      });
    }

    for (const value of [false, 'false', 'no', 'False']) {
      it(`keeps only the ID and URL when include_user is ${JSON.stringify(value)}`, async () => {
        const video = await runWithVideo({ userId: 5 }, { include_user: value });

        assert.equal(video.userId, 5);
        assert.equal(video.userUrl, 'https://www.nicovideo.jp/user/5');
        assert.equal('user' in video, false);
      });
    }

    it('is omitted for channel videos, which have no user', async () => {
      const video = await runWithVideo({ userId: null, channelId: 7777 });

      assert.equal(video.channelId, 7777);
      assert.equal('userUrl' in video, false);
      assert.equal('user' in video, false);
    });
  });

  describe('channel', () => {
    it('adds the channel URL for channel videos', async () => {
      const video = await runWithVideo({ userId: null, channelId: 7777 });

      assert.equal(video.channelUrl, 'https://ch.nicovideo.jp/ch7777');
    });

    it('is omitted for user videos', async () => {
      const video = await runWithVideo({ userId: 5, channelId: null });

      assert.equal('channelUrl' in video, false);
    });
  });

  it('keeps API fields in the output', async () => {
    const video = await runWithVideo({ title: 'A title', viewCounter: 3 });

    assert.equal(video.title, 'A title');
    assert.equal(video.viewCounter, 3);
  });

  describe('duration', () => {
    for (const [lengthSeconds, duration] of [
      [5, '00:05'],
      [61, '01:01'],
      [3661, '01:01:01']
    ]) {
      it(`formats ${lengthSeconds} seconds as ${duration}`, async () => {
        const video = await runWithVideo({ lengthSeconds });

        assert.equal(video.duration, duration);
      });
    }

    it('is omitted when the length is unknown', async () => {
      const video = await runWithVideo({ lengthSeconds: null });

      assert.equal('duration' in video, false);
    });
  });

  // The conversion itself is covered in test/niconico/description.test.js.
  describe('descriptionMarkdown', () => {
    const markdownFor = async (description) =>
      (await runWithVideo({ description })).descriptionMarkdown;

    it('is the description converted to markdown', async () => {
      assert.equal(await markdownFor('<strong>see</strong> sm12345'), 'see [sm12345](https://nico.ms/sm12345)');
    });

    it('encodes line breaks as a literal \\n and escapes quotes', async () => {
      assert.equal(await markdownFor('say "hi"<br>again'), String.raw`say \"hi\"\nagain`);
    });

    it('is empty for a missing description', async () => {
      assert.equal(await markdownFor(null), '');
    });
  });

  it('rejects when the API returns an error status', async () => {
    mockSearch().query(true).reply(403, '<html>Forbidden</html>');

    await assert.rejects(appTester(perform, bundle), /403/);
  });

  it('keeps its input field keys, so existing Zaps stay valid', () => {
    assert.deepEqual(
      inputFields.map((field) => field.key),
      ['q', 'targets', '_sort', '_limit', '_context', 'include_user']
    );
  });

  it('adds include_user as optional and on by default, which is not a breaking change', () => {
    const field = inputFields.find((f) => f.key === 'include_user');

    assert.equal(field.required, false);
    assert.equal(field.type, 'boolean');
    assert.equal(field.default, 'true');
  });
});
