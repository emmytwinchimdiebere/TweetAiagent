import { TwitterApi } from 'twitter-api-v2';
import { z } from 'zod';
import { tool } from "@langchain/core/tools";
import chromium from 'chrome-aws-lambda';
// Remove the local declaration of 'puppeteer'

const isProduction = process.env.NODE_ENV === 'production';

const puppeteer:any = isProduction ? chromium : await import('puppeteer-core');

const twitterApiKey = process.env.NEXT_PUBLIC_TWITTER_API_KEY;
const twitterApiSecret = process.env.NEXT_PUBLIC_TWITTER_API_SECRET;
const twitterAccessToken = process.env.NEXT_PUBLIC_TWITTER_ACCESS_TOKEN;
const twitterAccessTokenSecret = process.env.NEXT_PUBLIC_TWITTER_ACCESS_TOKEN_SECRET;

console.log(isProduction);

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

export const scrapDataOnlineTool = tool(async ({ url }) => {
  try {
    const browser = await puppeteer.launch({
      args: isProduction ? chromium.args : [],
      executablePath: isProduction ? await chromium.executablePath : "/usr/bin/google-chrome",
      headless: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const headlines = await page.evaluate(() => {
      const titles: (string | undefined)[] = [];
      const elements = document.querySelectorAll('h2,.post-card__title, .article-card__title');
      elements.forEach((el) => titles.push(el.textContent?.trim()));
      return titles;
    });

    await browser.close();
    return headlines;
  } catch (error) {
    console.log(error);
    return { message: "something went wrong", error: error };
  }
}, {
  name: "scrapeDataOnline_tool",
  description: "scraping tool for scraping data online",
  schema: z.object({
    url: z.string().describe("the url of website to scrape data from."),
  })
});