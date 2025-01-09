import { TwitterApi } from 'twitter-api-v2';
import { z } from 'zod';
import { tool } from "@langchain/core/tools";

const twitterApiKey = process.env.NEXT_PUBLIC_TWITTER_API_KEY;
const twitterApiSecret = process.env.NEXT_PUBLIC_TWITTER_API_SECRET;
const twitterAccessToken = process.env.NEXT_PUBLIC_TWITTER_ACCESS_TOKEN;
const twitterAccessTokenSecret = process.env.NEXT_PUBLIC_TWITTER_ACCESS_TOKEN_SECRET;


const TwitterApiReadWrite = new TwitterApi({
  appKey: twitterApiKey!,
  appSecret: twitterApiSecret!,
  accessToken: twitterAccessToken!,
  accessSecret: twitterAccessTokenSecret!,
});

const rw = TwitterApiReadWrite.readWrite;

export const postTool = tool(async (text) => {
  const post = await rw.v2.tweet(text);
  return post?.data;
}, {
  name: 'post_tool',
  description: 'Post a tweet on Twitter',
  schema: z.object({
    text: z.string().describe("the text to post"),
  })
});

export const replyTool = tool(async ({ reply, tweetId }) => {
  return await rw.v2.reply(reply, tweetId);
}, {
  name: 'reply_tool',
  description: 'create replies',
  schema: z.object({
    reply: z.string().describe("your replies"),
    tweetId: z.string().describe("id of the tweet you are replying to."),
  })
});

export const mentionTool = tool(async () => {
  return await rw.v1.mentionTimeline();
}, {
  name: "mention_tool",
  description: 'get all mentions',
  schema: z.void(),
});

export const accountDetailsTools = tool(async () => {
  const details = await rw.v2.me();
  return details?.data;
}, {
  name: "account_details_tools",
  description: 'get the details of my account',
  schema: z.void(),
});

export const trendingTopicsTool = tool(async () => {
  const trends = await rw.v1.trendsAvailable();
  return trends;
}, {
  name: "trendingTopics_tool",
  description: "fetch the current trendings",
  schema: z.void()
});

export const searchTweetsTool = tool(async ({ topic }: { topic: string }) => {
  const response = await rw.v2.search(topic, {
    max_results: 10,
  });
  return response;
}, {
  name: "search_tweets_tool",
  description: "Search for tweets on a specific topic",
  schema: z.object({
    topic: z.string().describe("The topic to search for on Twitter, e.g., 'DAO', 'AI agents', 'robotics' etc"),
  }),
});

export const likeTweet = tool(async ({ userId, tweetId }) => {
  const like = await rw.v2.like(userId, tweetId);
  return like.data;
}, {
  name: "like_tweet",
  description: "like a tweet",
  schema: z.object({
    tweetId: z.string().describe("tweet id to like"),
    userId: z.string().describe("user Id of the tweet")
  })
});
