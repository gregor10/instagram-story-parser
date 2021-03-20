import signale from 'signale';

import { apiClient } from './index';
import { decrypt } from '../helpers/crt';
import { downloadImage, uploadFile } from 'helpers/s3';

import Stalker from '../db/models/Stalker';
import Stalkee from 'db/models/Stalkee';
import Story, { IStory } from 'db/models/Story';

enum IgMediaType {image = 1, video = 2};

export const logIn = async () => {
  const stalker = await Stalker.findOne({ email: process.env.DEFAULT_STALKER_EMAIL });

  if (!stalker) {
    signale.fatal('No stalker!');
    return;
  }

  const { username, hash } = stalker.credentials;
  const password = decrypt(hash);

  apiClient.state.generateDevice(username);
  try {
    await apiClient.account.login(username, password);
  } catch (err) {
    signale.fatal(err);
  }
};

export const getStalkees = async () => {
  const stalkees = await Stalkee.find({}).select({ _id: 0, igUsername: 1 });

  if (!stalkees) {
    return [];
  }

  return stalkees.map(stalkee => stalkee.igUsername);
};

export const getInstagramIds = async (stalkees: string[]) => {
  const usersWithId: {username: string, userId: number}[] = [];

  for (const username of stalkees) {
    let userId: number;
    try {
      userId = await apiClient.user.getIdByUsername(username);
      usersWithId.push({ username, userId });
    } catch (e) {
      signale.fatal('Cannot get id for username', username);
    }
  }

  return usersWithId;
};

export const getStories = async (userIds: number[]) => {
  const reelsFeed = apiClient.feed.reelsMedia({ userIds });
  const storyItems = await reelsFeed.items();

  if (storyItems.length === 0) {
    signale.warn('Stories are empty');
    return;
  }

  const stories: Partial<IStory>[] = [];

  for (const item of storyItems) {
    const story = {
      igId: item.id,
      igUserPk: item.user.pk,
      igMediaType: item.media_type,
      takenAt: item.taken_at,
      igUrl: ''
    };

    if (item.media_type === IgMediaType.image) {
      // Images
      const bestQualityImage = item.image_versions2.candidates.reduce(
        (maxItem, currItem) => currItem.height > maxItem.height ? currItem : maxItem
      );

      story.igUrl = bestQualityImage.url;
    } else if (item.media_type === IgMediaType.video) {
      // Videos
      const videos = item.video_versions;
      if (videos && videos.length) {
        const bestQualityVideo = videos.reduce(
          (maxItem, currItem) => currItem.height > maxItem.height ? currItem : maxItem
        );

        story.igUrl = bestQualityVideo.url;
      }
    }

    stories.push(story);
  }

  return stories;
};

export const saveStory = async (story: Partial<IStory>) => {
  if (!story.igUrl || !story.igUsername || !story.igId) {
    return;
  }

  const storyExists = await Story.exists({ igId: story.igId });
  if (storyExists) {
    signale.warn(`Story with id ${story.igId} already exists`);
    return;
  }

  const pathFrom = await downloadImage(story.igUrl);

  let url = '';
  try {
    url = await uploadFile(pathFrom as string, story.igUsername, story.igId) as string;
  } catch (err) {
    signale.fatal('Cannot upload file', err);
  }

  await Story.create({ ...story, url });
};
