import nock from 'nock';

const USER_AGENT = /^Zapier\.com Niconico custom app \d/;

export const mockSearch = () => nock('https://snapshot.search.nicovideo.jp')
  .get('/api/v2/snapshot/video/contents/search')
  .matchHeader('User-Agent', USER_AGENT);

export const mockUser = (userId = 383484) => nock('https://nvapi.nicovideo.jp')
  .get(`/v1/users/${userId}`)
  .matchHeader('X-Frontend-Id', '6')
  .matchHeader('User-Agent', USER_AGENT);

export const userResponse = {
  meta: { status: 200 },
  data: {
    user: {
      id: 383484,
      nickname: '週刊ファミ通編集部',
      icons: { small: 'https://example.com/small.jpg', large: 'https://example.com/large.jpg' },
      description: 'not exposed',
      followerCount: 50,
      userChannel: null
    }
  }
};

// Builds a user response with some fields replaced or removed (undefined).
export const userResponseWith = (changes) => {
  const user = { ...userResponse.data.user, ...changes };
  for (const key of Object.keys(changes)) {
    if (changes[key] === undefined) delete user[key];
  }
  return { ...userResponse, data: { user } };
};

export const sampleChannel = {
  id: 'ch2604107',
  name: 'Channel name',
  description: 'not exposed',
  thumbnailUrl: 'https://example.com/channel.jpg',
  thumbnailSmallUrl: 'https://example.com/channel-small.jpg'
};

export const notFoundResponse = { meta: { status: 404, errorCode: 'NOT_FOUND' } };
