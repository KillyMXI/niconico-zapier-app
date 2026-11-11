// Calls the real Niconico API. Run with `npm run test:live`.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { App, appTester } from '../helpers.js';
import { assertVideo } from '../asserts.js';
import { STABLE_QUERY } from '../known-data.js';
import { pauseBetweenTests } from './pause.js';
import { USER_AGENT } from '../../niconico/api.js';

const perform = App.triggers.video.operation.perform;
const search = (inputData) =>
  appTester(perform, { inputData: { _context: STABLE_QUERY._context, ...inputData } });

describe('triggers.video (live)', { timeout: 20000 }, () => {
  pauseBetweenTests();

  it('returns matching videos in full, newest first', async () => {
    const results = await search(STABLE_QUERY);

    assert.equal(results.length, 10);
    results.forEach(assertVideo);
    for (const video of results) {
      assert.match(`${video.title} ${video.description} ${video.tags}`, /strike ?vector/i);
    }
    const times = results.map((video) => Date.parse(video.startTime));
    assert.deepEqual(times, times.toSorted((a, b) => b - a));
  });

  it('includes videos from the latest snapshot', async () => {
    const response = await fetch('https://snapshot.search.nicovideo.jp/api/v2/snapshot/version', {
      headers: { 'User-Agent': USER_AGENT }
    });
    const snapshotTime = Date.parse((await response.json()).last_modified);

    const [newest] = await search({ q: 'ゲーム', targets: 'tags', _sort: 'startTime', _limit: 1 });

    // Busy tags get new videos every few minutes, so the newest one should
    // be from shortly before the snapshot was taken.
    const ageHours = (snapshotTime - Date.parse(newest.startTime)) / 3600000;
    assert.ok(ageHours >= 0 && ageHours < 24, `newest video is ${ageHours.toFixed(1)}h older than the snapshot`);
  });

  it('handles channel videos, which have a channel instead of a user', async () => {
    const results = await search({ q: 'アニメ', targets: 'tags', _sort: 'startTime', _limit: 100 });

    results.forEach(assertVideo);
    const channelVideos = results.filter((video) => video.channelId != null);
    assert.ok(channelVideos.length > 0, 'expected at least one channel video among 100 anime videos');
    for (const video of channelVideos) {
      assert.equal(video.userId, null);
      assert.equal('user' in video, false);
    }
  });

  it('sorts by time of last comment', async () => {
    const results = await search({ ...STABLE_QUERY, _sort: 'lastCommentTime' });

    const times = results.map((video) => Date.parse(video.lastCommentTime));
    assert.deepEqual(times, times.toSorted((a, b) => b - a));
  });
});
