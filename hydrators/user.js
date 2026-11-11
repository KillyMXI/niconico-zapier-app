import { fetchUser } from '../niconico/api.js';
import { userUrl } from '../niconico/urls.js';

// Hydrators must return one object. For a user that no longer exists,
// return what is known, so the Zap keeps running.
const hydrateUser = async (z, bundle) => {
  const userId = bundle.inputData.user_id;
  return (await fetchUser(z, userId)) ?? {
    id: String(userId),
    nickname: null,
    thumbnail_url: null,
    url: userUrl(userId)
  };
};

export default hydrateUser;
