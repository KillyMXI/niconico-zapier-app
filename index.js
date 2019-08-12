const VideoTrigger = require('./triggers/video');
const UserSearch = require('./searches/user');

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  beforeRequest: [],

  afterResponse: [],

  resources: {},

  triggers: {
    [VideoTrigger.key]: VideoTrigger
  },

  searches: {
    [UserSearch.key]: UserSearch
  },

  creates: {},

  hydrators: {
    userHydrator: UserSearch.operation.perform
  },
};

module.exports = App;
