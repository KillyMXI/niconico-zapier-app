# Niconico video trigger for Zapier platform

It can be used to trigger when a new video appeared on Niconico that matches a specific search string.

Search results come from a snapshot that Niconico updates once a day (as of 05:00 JST), so new videos show up with a delay of up to a day.

I cannot make the app public on the <https://zapier.com/> platform since I have no affiliation with Niconico service itself. I may only invite few people for testing purposes. Or you may use your own version of the app.

## Niconico API

* <https://site.nicovideo.jp/search-api-docs/snapshot.html> - documentation for the video search endpoint (`snapshot.search.nicovideo.jp`) and TOS (in Japanese). Live streams are not covered by it.

* User details (nickname and icon) come from `nvapi.nicovideo.jp/v1/users/{id}`, the undocumented API used by the Niconico website. It may change without notice. Turning off the trigger's "Include user details" option skips it, leaving only the user ID and profile URL.

Note: the search API moved from `api.search.nicovideo.jp` to `snapshot.search.nicovideo.jp` (announced 2024/03/01). The `api.ce.nicovideo.jp` user info endpoint used before is gone. [Another version](https://site.nicovideo.jp/search-api-docs/search.html) of the search API was [discontinued](https://blog.nicovideo.jp/niconews/143630.html) at March 31st, 2021.

## Development

Requires Node.js 22 or later.

* `npm test` - offline tests, with the API mocked by `nock`;
* `npm run test:live` - tests against the real Niconico API;
* `npm run validate` - local structural validation with `zapier-platform` CLI.
