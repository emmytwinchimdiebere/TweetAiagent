import * as cron from 'node-cron';
import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { postTool, replyTool, mentionTool, accountDetailsTools , trendingTopicsTool, searchTweetsTool, likeTweet } from './twitterApi';
interface props{
 
    id_str:string,
    user:{
      screen_name:string,
    }
  
}
interface tweetlikeprops{
  id_str:string,
  text:string,
  user:{
    screen_name:string,
    id_str:string
  }
}
// Initialize tools and LLM agent
const tools = [postTool, replyTool, mentionTool, accountDetailsTools,trendingTopicsTool, searchTweetsTool, likeTweet];
const chat = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-flash',
  apiKey: process.env.GOOGLE_GEN_AI_API_KEY,  // Use env variable for API key
  maxOutputTokens: 100,
});
const agent = createReactAgent({
  llm: chat,
  tools,
});
// Topics for tweeting
const prioritizedTopics = ['DAO', 'AI agents'];
const otherTopics = ['AI', 'Machine Learning', 'Blockchain', 'Crypto'];
// Function to generate and post tweets about a topic
export async function generateTweet(topic: string) {
  try {
    const response = await agent.invoke({
      messages: new HumanMessage(`Post a creative tweet about ${topic}`),
    });
    return response?.content;
  } catch (error) {
    console.error('Error generating tweet:', error);
    throw error;
  }
}
// Function to post the tweet using postTool
export async function postTweet(content: string) {
  try {
    await agent.invoke({
      messages: new HumanMessage(`Post a creative tweet about ${content}`),
    });
    console.log(`Successfully posted tweet: ${content}`);
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw error;
  }
}
// Function to schedule regular tweets (7 times a day)
cron.schedule('0 */3 * * *', async () => {  // Run every 3 hours
  let topic;
  // Prioritize DAO and AI agents
  const randomNumber = Math.random();
  if (randomNumber < 0.5) {
    topic = prioritizedTopics[Math.floor(Math.random() * prioritizedTopics.length)];
  } else {
    topic = otherTopics[Math.floor(Math.random() * otherTopics.length)];
  }
  const tweet = await generateTweet(topic);
  if (tweet) {
    await postTweet(tweet);
  }
});
// Function to analyze sentiment of a mention
export async function analyzeSentiment(text: string) {
  try {
    const sentiment = await agent.invoke({
      messages: [new HumanMessage(`Classify the sentiment of the following tweet as positive, negative, or neutral: "${text}"`)],
    });
    return sentiment?.content;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}
// Function to get recent mentions and reply
export async function getRecentMentions() {
  try {
    const mentions = await agent.invoke({
      messages: new HumanMessage('Please get all Mentions'),
    });
    return mentions?.content;
  } catch (error) {
    console.error('Error fetching mentions:', error);
    throw error;
  }
}
// Function to reply to mentions with sentiment analysis
export async function replyToMention(mention: props, sentiment: string) {
  try {
    const username = mention.user.screen_name;
    const tweetId = mention.id_str;
    const replyMessage = `Thanks for mentioning me, @${username}!`;
    if (sentiment === 'positive') {
      await agent.invoke({
        messages: new HumanMessage(`Please reply using ${tweetId} to ${replyMessage}`),
      });
      console.log(`Replied to mention from @${username}`);
    }
  } catch (error) {
    console.error('Error replying to mention:', error);
    throw error;
  }
}
// Function to reply to mentions if needed (runs every 10 minutes)
let lastMentionReplyTime: Date | null = null;
cron.schedule('*/10 * * * *', async () => {
  const now = new Date();
  const X_MINUTES = 10;
  if (lastMentionReplyTime && (now.getTime() - lastMentionReplyTime.getTime()) < X_MINUTES * 60000) {
    console.log(`Skipping mentions, last processed less than ${X_MINUTES} minutes ago.`);
    return;
  }
  const mentions = await getRecentMentions();
  if (mentions) {
    for (const mention of mentions) {
      const sentiment = await analyzeSentiment(mention.text);
      await replyToMention(mention, sentiment);
    }
  }
  lastMentionReplyTime = new Date();
});
// Function to monitor trends and post about them
export async function fetchTrendingTopics() {
  try {
    const trendsResponse = await agent.invoke({
      messages: [new HumanMessage('Get trending hashtags relevant to technology, AI, DAO, Blockchain, and Crypto')],
      tools:[trendingTopicsTool]
    });
    return trendsResponse?.content;
  } catch (error: unknown) {
    console.error('Error fetching trending topics:', error);
    throw error;
  }
}
export async function postTweetUsingTrend(trend: string, topic: string) {
  try {
    const tweet = await agent.invoke({
      messages: [new HumanMessage(`Post a tweet using the trending hashtag '${trend}' about the topic '${topic}'`)],
    });
    if (tweet?.content) {
      await postTweet(tweet.content);
      console.log(`Posted tweet using trend '${trend}' about topic '${topic}'`);
    }
  } catch (error) {
    console.error(`Error posting tweet using trend '${trend}' about topic '${topic}':`, error);
  }
}
// Function to monitor trends and post about bot-relevant topics
export async function monitorAndPostRelevantTrends() {
  try {
    // Fetch trending topics
    const trendingTopics = await fetchTrendingTopics();
    if (!trendingTopics || trendingTopics.length === 0) {
      console.log('No relevant trends found.');
      return;
    }
    // Define the bot's focus topics
    const botTopics = ['DAO', 'AI agents', 'Blockchain', 'Crypto', 'Machine Learning'];
    // Filter trending topics based on relevance to the bot's focus
    const relevantTrends = trendingTopics.filter((trend: string) => 
      botTopics.some(topic => trend.toLowerCase().includes(topic.toLowerCase()))
    );
    // Post tweets about the relevant trends
    for (const trend of relevantTrends) {
      const relevantTopic = botTopics.find(topic => trend.toLowerCase().includes(topic.toLowerCase()));
      if (relevantTopic) {
        await postTweetUsingTrend(trend, relevantTopic);  // Post tweet using the relevant trend and topic
      }
    }
  } catch (error) {
    console.error('Error monitoring and posting relevant trends:', error);
  }
}
// Schedule the bot to monitor trends and post tweets using relevant trends every 4 hours
cron.schedule('0 */4 * * *', monitorAndPostRelevantTrends);  // Run every 4 hours
// Analyze followers growth and engagement periodically
export async function analyzeFollowers() {
  try {
    const followerStats = await agent.invoke({
      messages: [new HumanMessage('Analyze my follower growth and engagement')],
    });
    console.log("Follower Growth Analysis:", followerStats?.content);
  } catch (error) {
    console.error('Error analyzing followers:', error);
  }
}
// Run daily analysis of followers
cron.schedule('0 12 * * *', analyzeFollowers);  // Run at noon daily
// Post polls at a scheduled time
let lastPollDate: Date | null = null;
export async function postPollIfNeeded() {
  const now = new Date();
  if (lastPollDate && lastPollDate.toDateString() === now.toDateString()) {
    console.log('Poll already posted today, skipping...');
    return;
  }
  const pollQuestion = 'What technology do you think will shape the future?';
  const pollOptions = ['AI', 'DAO', 'Blockchain', 'Crypto'];
  await postPoll(pollQuestion, pollOptions);
  lastPollDate = new Date();
}
export async function postPoll(question: string, options: string[]) {
  try {
    const response = await agent.invoke({
      messages: [new HumanMessage(`Post a poll with question '${question}' and options ${options.join(', ')}`)],
    });
    console.log(`Posted poll: ${question}`, response);
  } catch (error) {
    console.error('Error posting poll:', error);
  }
}
cron.schedule('0 9 * * *', postPollIfNeeded);  // Run every day at 9 AM
// Function to search for tweets based on a keyword
export async function searchTweetsByKeyword(keyword: string) {
  try {
    const tweets = await agent.invoke({
      messages: [new HumanMessage(`Search for tweets about "${keyword}"`)],
      tools: [searchTweetsTool],  // Use the search tool
    });
    return tweets?.content;  // Returns the searched tweets content
  } catch (error) {
    console.error(`Error searching tweets for keyword '${keyword}':`, error);
    throw error;
  }
}
// Call the function to search tweets for relevant trends
cron.schedule('0 */6 * * *', searchTweetsUsingTrends);  // Search every 6 hours
export async function likeATweet(tweetId: string, userId:string) {
  try {
    await agent.invoke({
      messages: [new HumanMessage(`Like the tweet with id '${tweetId}' and user "${userId}"`)],
    });
    console.log(`Liked tweet with id: ${tweetId}`);
  } catch (error) {
    console.error('Error liking tweet:', error);
    throw error;
  }
}
export async function replyToTweet(tweetId: string, username: string, sentiment: string) {
  try {
    await agent.invoke({
      messages: [new HumanMessage(`Reply to tweet with id '${tweetId}' using  the "${sentiment}"`)],
    });
    console.log(`Replied to tweet from @${username} with sentiment: ${sentiment}`);
  } catch (error) {
    console.error('Error replying to tweet:', error);
    throw error;
  }
}
// Function to process tweets, analyze sentiment, like and reply
export async function processTweets(tweets: tweetlikeprops[]) {
  for (const tweet of tweets) {
    const tweetId = tweet.id_str;
    const username = tweet.user.screen_name;
    const  userId =  tweet.user.id_str;
    const text = tweet.text;
    // Analyze the sentiment of the tweet
    const sentiment = await analyzeSentiment(text);
    if (sentiment === 'positive') {
      // Like the tweet if positive sentiment
      await likeATweet(tweetId,  userId);
    }
    // Reply to the tweet based on sentiment
    await replyToTweet(tweetId, username, sentiment);
  }
}
// Modify the function to search tweets by trends and process them
export async function searchTweetsUsingTrends() {
  const trendingTopics = await fetchTrendingTopics();  // Fetch trending topics
  
  if (trendingTopics) {
    for (const trend of trendingTopics) {
      const foundTweets = await searchTweetsByKeyword(trend);
      if (foundTweets && foundTweets.length > 0) {
        // Process the found tweets (like and reply based on sentiment)
        await processTweets(foundTweets);
      }
    }
  }
}
// Schedule the function to run every 6 hours
cron.schedule('0 */6 * * *', searchTweetsUsingTrends);
(async function startBot() {
  console.log('Starting Twitter Bot...');
  try {
    const details = await agent.invoke({
      messages: [new HumanMessage('Please get my account details and  return  my  email or  username')],
    });
    console.log('Account Details:', details?.content);
    console.log('Twitter Bot is running!');
  } catch (error) {
    console.error('Error starting bot:', error);
  }
})();