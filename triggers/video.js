import { defineTrigger } from 'zapier-platform-core';
import { searchVideos } from '../niconico/api.js';
import { descriptionToMarkdown } from '../niconico/description.js';
import { channelUrl, userUrl, videoUrl } from '../niconico/urls.js';
import hydrateUser from '../hydrators/user.js';

// Zaps created before this option existed have no value, which means "on".
const isOff = (value) => ['false', 'no'].includes(String(value).toLowerCase());

function divMod(x, y) { const m = x % y; return [(x - m) / y, m]; }
function doubleDigit(n) { return String(n).padStart(2, '0'); }
function printableTime(s) {
  const [m, ss] = divMod(s, 60);
  if (m < 60) {
    return doubleDigit(m) + ':' + doubleDigit(ss);
  }
  const [h, mm] = divMod(m, 60);
  return doubleDigit(h) + ':' + doubleDigit(mm) + ':' + doubleDigit(ss);
}

const escapeQuotesAndNewlines = (text) => text
  .split('"').join('\\"')
  .split('\n').join('\\n');

// Everything from the search API as it is, followed by the fields this app adds.
const toVideoOutput = (z, video, { includeUser }) => ({
  ...video,
  id: video.contentId,
  url: videoUrl(video.contentId),
  // Channel videos have a channel instead of a user.
  ...(video.channelId != null && { channelUrl: channelUrl(video.channelId) }),
  ...(video.userId != null && { userUrl: userUrl(video.userId) }),
  ...(video.userId != null && includeUser && {
    user: z.dehydrate(hydrateUser, { user_id: video.userId })
  }),
  descriptionMarkdown: escapeQuotesAndNewlines(descriptionToMarkdown(video.description)),
  ...(video.lengthSeconds && { duration: printableTime(video.lengthSeconds) })
});

const triggerVideo = async (z, bundle) => {
  const videos = await searchVideos(z, bundle.inputData);
  const includeUser = !isOff(bundle.inputData.include_user);
  return videos.map((video) => toVideoOutput(z, video, { includeUser }));
};

export default defineTrigger({
  key: 'video',
  noun: 'Video',

  display: {
    label: 'New Video',
    description: 'Triggers when there is a new video.'
  },

  operation: {
    inputFields: [
      {
        key: 'q',
        type: 'string',
        required: true,
        label: 'Search Query',
        helpText: 'Add quotes for exact match. Use `OR` to search either of words. Use `-` to exclude a word.'
      },
      {
        key: 'targets',
        label: 'Targets',
        required: true,
        helpText: 'Fields to which the search query applies',
        choices: {
          title: 'Title',
          description: 'Description',
          tags: 'Tags',
          'title,description,tags': 'All'
        },
        default: 'title,description,tags'
      },
      {
        key: '_sort',
        required: true,
        label: 'Sort by',
        choices: {
          startTime: 'Video post time',
          lastCommentTime: 'Time of last comment'
        },
        default: 'startTime'
      },
      {
        key: '_limit',
        type: 'integer',
        label: 'Limit',
        required: true,
        helpText: 'Maximum number of items. Up to 100.',
        default: '10'
      },
      {
        key: '_context',
        label: 'Usage context',
        required: true,
        helpText: 'Tell Niconico what you use it for. As specific as you can fit into the maximum of 40 characters.'
      },
      {
        key: 'include_user',
        type: 'boolean',
        label: 'Include user details',
        required: false,
        default: 'true',
        helpText: 'Look up the nickname and icon of the user who posted the video. The user ID and profile URL are included either way. The lookup uses an unofficial Niconico API, so turn this off if it stops working.'
      }
    ],
    perform: triggerVideo,

    // The shape matches a real response; the values are made up,
    // except for the user, which is the one used in the live tests.
    sample: {
      contentId: 'sm12345678',
      title: 'Sample video title',
      description: 'First line<br>Previous part: sm12345677',
      tags: 'sample_tag another_tag',
      categoryTags: 'ゲーム',
      genre: 'ゲーム',
      contentType: 'long',
      userId: 383484,
      channelId: null,
      thumbnailUrl: 'https://nicovideo.cdn.nimg.jp/thumbnails/12345678/12345678',
      startTime: '2026-11-01T12:00:00+09:00',
      lastCommentTime: '2026-11-02T18:30:00+09:00',
      lengthSeconds: 312,
      viewCounter: 1285,
      commentCounter: 416,
      mylistCounter: 12,
      likeCounter: 34,
      id: 'sm12345678',
      url: 'https://nico.ms/sm12345678',
      userUrl: 'https://www.nicovideo.jp/user/383484',
      user: {
        id: '383484',
        nickname: '週刊ファミ通編集部',
        thumbnail_url: 'https://img.nicoprofile.nimg.jp/usericon/38/383484.jpg?1399546681',
        url: 'https://www.nicovideo.jp/user/383484',
        follower_count: 50
      },
      descriptionMarkdown: 'First line\\nPrevious part: [sm12345677](https://nico.ms/sm12345677)',
      duration: '05:12'
    },

    outputFields: []
  }
});
