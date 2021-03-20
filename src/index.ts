import dotenv from 'dotenv';
import signale from 'signale';
dotenv.config();

import db from './db';
import { apiClient } from './instagram';
import { logIn, getStalkees, getInstagramIds, getStories, saveStory } from './instagram/utils';

(async () => {
  // Connect to db
  await db.connect();

  // Log in to instagram
  await logIn();
  signale.debug(await apiClient.account.currentUser());

  // Get stalkees
  const stalkees = await getStalkees();
  const stalkeesWithIds = await getInstagramIds(stalkees);

  let stories = await getStories(stalkeesWithIds.map(obj => obj.userId));

  if (!stories) {
    return;
  }

  stories = stories.map((story) => ({
    ...story,
    igUsername: stalkeesWithIds.find(stalkee => stalkee.userId === story.igUserPk)?.username
  }));

  signale.debug('stories', stories);

  for (const story of stories) {
    await saveStory(story);
  }

  await db.disconnect();
  signale.success('Hooray');
})();
