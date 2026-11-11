// Requests to the Niconico APIs and the shape of what the app makes of them.
//
// The request builders return plain { url, headers, params } objects, so the
// same request can go through z.request in the app or through fetch in
// scripts/record-fixtures.js.
import packageJson from '../package.json' with { type: 'json' };
import { channelUrl, userUrl } from './urls.js';

// The search API asks clients to identify themselves in the User-Agent.
export const USER_AGENT = `Zapier.com Niconico custom app ${packageJson.version}`;

// --- Snapshot search API (documented, video only) ---

const SEARCH_URL = 'https://snapshot.search.nicovideo.jp/api/v2/snapshot/video/contents/search';

const VIDEO_FIELDS = 'userId,channelId,contentId,title,description,tags,categoryTags,thumbnailUrl,startTime,viewCounter,commentCounter,mylistCounter,likeCounter,lengthSeconds,lastCommentTime,genre,contentType';

// The query keys are the API's own parameter names. Results are always
// sorted newest first. extraParams can add filters, e.g. 'filters[startTime][lt]'.
export const videoSearchRequest = ({ q, targets, _sort, _limit, _context }, extraParams = {}) => ({
  url: SEARCH_URL,
  headers: { 'User-Agent': USER_AGENT },
  params: { q, targets, _sort: '-' + _sort, _limit, _context, fields: VIDEO_FIELDS, ...extraParams }
});

export const searchVideos = async (z, query) => {
  const response = await z.request(videoSearchRequest(query));
  return response.data.data;
};

// --- nvapi (undocumented, behind the Niconico website) ---

// nvapi rejects requests without an X-Frontend-Id header.
export const userRequest = (userId) => ({
  url: `https://nvapi.nicovideo.jp/v1/users/${encodeURIComponent(userId)}`,
  headers: { 'User-Agent': USER_AGENT, 'X-Frontend-Id': '6' }
});

// nvapi is undocumented, so optional fields are only copied when they are
// present and have the expected type.
const optionalUserFields = (user) => {
  const fields = {};
  if (typeof user.followerCount === 'number') {
    fields.follower_count = user.followerCount;
  }
  const channel = user.userChannel;
  if (channel && typeof channel.id === 'string') {
    fields.channel = {
      id: channel.id,
      name: channel.name ?? null,
      url: channelUrl(channel.id),
      thumbnail_url: channel.thumbnailUrl ?? null
    };
  }
  return fields;
};

// Fetches a user, or returns null if no such user exists.
export const fetchUser = async (z, userId) => {
  const response = await z.request({ ...userRequest(userId), skipThrowForStatus: true });
  if (response.status === 404) {
    return null;
  }
  response.throwForStatus();
  const { user } = response.data.data;
  return {
    id: String(user.id),
    nickname: user.nickname,
    thumbnail_url: user.icons?.large ?? null,
    url: userUrl(user.id),
    ...optionalUserFields(user)
  };
};
