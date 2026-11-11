import assert from 'node:assert/strict';

const isIsoTime = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

// Checks one trigger result. Shared by live tests and recorded-fixture tests.
export const assertVideo = (video) => {
  const label = video.contentId;

  assert.match(video.contentId, /^[a-z]{2}\d+$/, `${label}: contentId`);
  assert.equal(video.id, video.contentId, `${label}: id`);
  assert.equal(video.url, `https://nico.ms/${video.contentId}`, `${label}: url`);
  assert.equal(typeof video.title, 'string', `${label}: title`);
  assert.equal(typeof video.tags, 'string', `${label}: tags`);
  assert.ok(isIsoTime(video.startTime), `${label}: startTime`);
  assert.ok(video.lastCommentTime == null || isIsoTime(video.lastCommentTime), `${label}: lastCommentTime`);
  for (const counter of ['viewCounter', 'commentCounter', 'mylistCounter', 'likeCounter']) {
    assert.ok(Number.isInteger(video[counter]) && video[counter] >= 0, `${label}: ${counter}`);
  }
  assert.equal(typeof video.contentType, 'string', `${label}: contentType`);
  assert.match(video.thumbnailUrl, /^https:\/\//, `${label}: thumbnailUrl`);

  assert.equal(typeof video.descriptionMarkdown, 'string', `${label}: descriptionMarkdown`);
  assert.doesNotMatch(video.descriptionMarkdown, /<br|<\/?(span|strong|font|a)\b/i, `${label}: HTML left in descriptionMarkdown`);
  if (video.lengthSeconds) {
    assert.match(video.duration, /^\d{2}:\d{2}(:\d{2})?$/, `${label}: duration`);
  }

  // Exactly one of user or channel.
  assert.ok((video.userId == null) !== (video.channelId == null), `${label}: userId xor channelId`);
  if (video.userId != null) {
    assert.equal(video.userUrl, `https://www.nicovideo.jp/user/${video.userId}`, `${label}: userUrl`);
    assert.match(video.user, /^hydrate\|\|\|.*hydrators\.userHydrator.*\|\|\|hydrate$/, `${label}: user`);
    assert.equal('channelUrl' in video, false, `${label}: channelUrl`);
  } else {
    assert.equal(video.channelUrl, `https://ch.nicovideo.jp/ch${video.channelId}`, `${label}: channelUrl`);
    assert.equal('userUrl' in video, false, `${label}: userUrl`);
  }
};

// Checks one user, as returned by the hydrator or "Find a User".
export const assertUser = (user, id) => {
  assert.equal(user.id, String(id));
  assert.equal(typeof user.nickname, 'string');
  assert.ok(user.nickname.length > 0);
  assert.match(user.thumbnail_url, /^https:\/\//);
  assert.equal(user.url, `https://www.nicovideo.jp/user/${id}`);
  if ('follower_count' in user) {
    assert.ok(Number.isInteger(user.follower_count) && user.follower_count >= 0);
  }
};
