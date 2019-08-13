// find a particular user by id
const searchUser = (z, bundle) => {
  return z.request({
    url: 'http://api.ce.nicovideo.jp/api/v1/user.info',
    params: {
      user_id: bundle.inputData.user_id,
      __format: 'json'
    }
  })
    .then(response => z.JSON.parse(response.content))
    .then(json => json.nicovideo_user_response.user)
    .then(user => {
      user.nickname = decodeURIComponent(user.nickname);
      user.thumbnail_url = decodeURIComponent(user.thumbnail_url);
      user.url = 'https://www.nicovideo.jp/user/' + user.id;
      return user;
    });
};

module.exports = {
  key: 'user',
  noun: 'User',

  display: {
    label: 'Find a User',
    description: 'Finds a user.'
  },

  operation: {
    inputFields: [
      { key: 'user_id', required: true, helpText: 'Find the User with this user Id.' }
    ],
    perform: searchUser,

    sample: {
      id: '383484',
      nickname: '週刊ファミ通編集部',
      thumbnail_url: 'http://dcdn.cdn.nimg.jp/nicoaccount/usericon/38/383484.jpg?1399546681',
      url: 'https://www.nicovideo.jp/user/383484'
    },

    outputFields: []
  }
};
