import { defineSearch } from 'zapier-platform-core';
import { fetchUser } from '../niconico/api.js';

// Searches return an array; an empty one means "not found".
// A mapped user ID can be empty at run time; there is nothing to find then.
const searchUser = async (z, bundle) => {
  const userId = String(bundle.inputData.user_id ?? '').trim();
  if (!userId) {
    return [];
  }
  const user = await fetchUser(z, userId);
  return user ? [user] : [];
};

export default defineSearch({
  key: 'user',
  noun: 'User',

  display: {
    label: 'Find a User',
    description: 'Finds a user.'
  },

  operation: {
    inputFields: [
      { key: 'user_id', label: 'User ID', required: true, helpText: 'Find the User with this Id.' }
    ],
    perform: searchUser,

    sample: {
      id: '383484',
      nickname: '週刊ファミ通編集部',
      thumbnail_url: 'https://img.nicoprofile.nimg.jp/usericon/38/383484.jpg?1399546681',
      follower_count: 50,
      url: 'https://www.nicovideo.jp/user/383484'
    },

    outputFields: []
  }
});
