import zapier, { defineApp } from 'zapier-platform-core';
import packageJson from './package.json' with { type: 'json' };
import VideoTrigger from './triggers/video.js';
import UserSearch from './searches/user.js';
import hydrateUser from './hydrators/user.js';

export default defineApp({
  version: packageJson.version,
  platformVersion: zapier.version,

  // Pass empty input values through as they are; the operations handle them.
  flags: {
    cleanInputData: false
  },

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
    userHydrator: hydrateUser
  },
});
