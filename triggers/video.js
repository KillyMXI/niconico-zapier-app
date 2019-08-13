
const UserSearch = require('../searches/user');
const htmlToText = require('html-to-text');
const version = require('../package.json').version;

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

const triggerVideo = (z, bundle) => {
  return z.request({
    url: 'https://api.search.nicovideo.jp/api/v2/{{bundle.inputData.service}}/contents/search',
    headers: {
      'User-Agent': `Zapier.com Niconico custom app ${version}`
    },
    params: {
      q:        bundle.inputData.q,
      targets:  bundle.inputData.targets,
      _sort:   (bundle.inputData.sort_desc ? '-' : '') + bundle.inputData._sort,
      _limit:   bundle.inputData._limit,
      _context: bundle.inputData._context,
      fields:   'contentId,userId,title,description,tags,categoryTags,thumbnailUrl,startTime,viewCounter,commentCounter' + (
                  (bundle.inputData.service === 'video')
                    ? ',mylistCounter,lengthSeconds,threadId,lastCommentTime,genre'
                    : ',communityId,providerType,openTime,liveEndTime,communityText,communityIcon,memberOnly,liveStatus'
                )
    }
  })
    .then(response => z.JSON.parse(response.content))
    .then(json => json.data)
    .then(videos => videos.map(video => {
      video.id = video.contentId;
      video.url = 'https://nico.ms/' + video.contentId;
      video.user = z.dehydrate(UserSearch.operation.perform, { user_id: video.userId });
      video.descriptionMarkdown =
        htmlToText.fromString(video.description, { hideLinkHrefIfSameAsText: true, wordwrap: false, preserveNewlines: true })
          .split('"').join('\\"')
          .split('\n').join('\\n')
          .replace(/\bseries\/\d{3,}\b/ig, '[$&](https://www.nicovideo.jp/$&)')
          .replace(/\bmylist\/\d{3,}\b/ig, '[$&](https://www.nicovideo.jp/$&)')
          .replace(/\bsm\d{3,}\b/ig, '[$&](https://nico.ms/$&)');
      if (video.lengthSeconds) {
        video.duration = printableTime(video.lengthSeconds);
      }
      return video;
    }));
};

module.exports = {
  key: 'video',
  noun: 'Video',

  display: {
    label: 'New Video or Live',
    description: 'Triggers on a new video or live stream.'
  },

  operation: {
    inputFields: [
      {
        key: 'service',
        required: true,
        label: 'Service',
        choices: { video: 'Video', live: 'Live' },
        default: 'video',
        altersDynamicFields: true
      },
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
      function(z, bundle) {
        let sortField = {
          key: '_sort',
          required: true,
          label: 'Sort by',
          choices: {
            viewCounter: 'Views counter',
            commentCounter: 'Comments counter',
            //startTime: 'Video post time or live start time'
          },
          default: 'startTime'
        };
        if (bundle.inputData.service === 'video') {
          Object.assign(sortField.choices, {
            startTime: 'Video post time',
            mylistCounter: 'My Lists counter',
            lengthSeconds : 'Video duration',
            lastCommentTime: 'Time of last comment'
          });
        } else /* live */ {
          Object.assign(sortField.choices, {
            startTime: 'Live start time',
            openTime: 'Live open time',
            liveEndTime: 'Live end time'
          });
        }
        return [sortField];
      },
      {
        key: 'sort_desc',
        type: 'boolean',
        label: 'Sort in descending order',
        required: true,
        default: 'yes'
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

    ],
    perform: triggerVideo,

    sample: {
      communityId: null,
      openTime: '2017-07-27T14:05:12+09:00',
      startTime: '2017-07-27T14:06:28+09:00',
      description: '■番組内容<br />\r\n<font color="#0000ff" size="4">ファミ通編集部のヘイ昇平の機材テストを兼ねた雑談枠<br />\r\n<br />\r\n\r\n<br />\r\n</font><br />\r\n<br />\r\n<br />\r\n■出演者<br />\r\n<b>ヘイ昇平（ファミ通）　https://twitter.com/heyshohei0411</b><br />\r\n<br />\r\n<br />\r\n<br />\r\n<br />\r\n■週刊ファミ通の読み放題サービス<br />\r\n月額864円で、ファミ通チャンネルに会員登録をすると、週刊ファミ通最新号の電子版読み放題サービスが楽しめます。１号あたり、なんと233円（※月4冊の場合）！　さらに会員限定のオマケ配信やブロマガ、プレゼントなどもあり。ぜひご登録ください！<br />\r\n<br />\r\n<br />\r\nファミ通チャンネル→http://ch.nicovideo.jp/famitsu<br />\r\n週刊ファミ通Twitter→https://twitter.com/weeklyfamitsu<br />\r\n</font><br />',
      communityIcon: 'https://secure-dcdn.cdn.nimg.jp/comch/channel-icon/128x128/ch2596352.jpg?1563170102',
      tags: 'ゲーム 週刊ファミ通 ファミ通 テスト枠',
      liveEndTime: '2017-07-27T15:04:14+09:00',
      categoryTags: 'ゲーム',
      viewCounter: 1285,
      providerType: 'channel',
      contentId: 'lv303615389',
      userId: 383484,
      title: '【ロボゲー】ヘイ昇平のstrike vector EX【昼のSteam部】',
      memberOnly: false,
      commentCounter: 416,
      communityText: 'ファミ通チャンネル',
      thumbnailUrl: 'https://nicolive.cdn.nimg.jp/live/simg/img/a412/1234931.b707fa.jpg',
      liveStatus: 'past',
      id: 'lv303615389',
      url: 'https://nico.ms/lv303615389',
      user: 'hydrate|||{"type":"method","method":"hydrators.userHydrator","bundle":{"userId":383484}}|||hydrate',
      descriptionMarkdown: '■番組内容\\nファミ通編集部のヘイ昇平の機材テストを兼ねた雑談枠\\n\\n\\n\\n\\n\\n■出演者\\nヘイ昇平（ファミ通）　https://twitter.com/heyshohei0411\\n\\n\\n\\n\\n■週刊ファミ通の読み放題サービス\\n月額864円で、ファミ通チャンネルに会員登録をすると、週刊ファミ通最新号の電子版読み放題サービスが楽しめます。１号あたり、なんと233円（※月4冊の場合）！　さらに会員限定のオマケ配信やブロマガ、プレゼントなどもあり。ぜひご登録ください！\\n\\n\\nファミ通チャンネル→http://ch.nicovideo.jp/famitsu\\n週刊ファミ通Twitter→https://twitter.com/weeklyfamitsu'
    },

    outputFields: []
  }
};
