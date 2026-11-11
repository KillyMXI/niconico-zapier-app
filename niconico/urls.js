// Links to pages on the Niconico website.

const SITE = 'https://www.nicovideo.jp';

// Short link, used for the video's own URL.
export const videoUrl = (contentId) => `https://nico.ms/${contentId}`;

export const watchUrl = (contentId) => `${SITE}/watch/${contentId}`;

export const userUrl = (userId) => `${SITE}/user/${userId}`;

export const mylistUrl = (mylistId) => `${SITE}/mylist/${mylistId}`;

export const seriesUrl = (seriesId) => `${SITE}/series/${seriesId}`;

// Niconico Seiga, the illustration site. Ids look like 'im1234567'.
export const illustrationUrl = (illustrationId) => `https://seiga.nicovideo.jp/seiga/${illustrationId}`;

// Accepts both forms: videos have a numeric channelId (7777),
// while users have a prefixed channel id ('ch7777').
export const channelUrl = (channelId) => {
  const id = String(channelId);
  return `https://ch.nicovideo.jp/${id.startsWith('ch') ? id : 'ch' + id}`;
};
