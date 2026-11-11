# Changelog

## 1.4.0

- Fix trigger/video: video search uses Niconico's new search API host, so the trigger works again.
- Fix search/user: user lookup uses Niconico's current user API, so finding a user works again. A user that doesn't exist, or an empty user ID, gives no result instead of an error.
- Fix trigger/video: videos from channels no longer include a user reference that couldn't be looked up. They have a `channelUrl` instead.
- Update trigger/video: new "Include user details" option, on by default as before. Turn it off to get only `userId` and `userUrl`, without looking up the user.
- Update trigger/video: renamed from "New Video or Live" to "New Video". Niconico's search API no longer covers live broadcasts.
- Update search/user: results include `follower_count` and `channel` (ID, name, URL and thumbnail), when Niconico provides them.
- Improve trigger/video: `descriptionMarkdown` links more references: short series IDs, `nm` videos, `user/` profiles, `im` illustrations and `nico.ms/` short links. IDs inside URLs are no longer linked a second time, and a URL followed by full-width punctuation such as `）` or `、` is separated from it, so the link stays correct when possible.
- Runs on Zapier Platform 19 (Node.js 22).
