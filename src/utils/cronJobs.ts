// cronJobs.js
import * as cron from 'node-cron';
import { generateTweet, postTweet, getRecentMentions, analyzeSentiment, replyToMention, fetchTrendingTopics, monitorAndPostRelevantTrends, analyzeFollowers, postPollIfNeeded, searchTweetsUsingTrends } from '../lib/TwitterBot';


// Schedule regular tweets (7 times a day)
cron.schedule('0 */3 * * *', async () => {  // Run every 3 hours
  let topic;
  const prioritizedTopics = ['DAO', 'AI agents'];
  const otherTopics = ['AI', 'Machine Learning', 'Blockchain', 'Crypto'];
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

// Reply to mentions if needed (runs every 10 minutes)
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

// Monitor trends and post tweets using relevant trends every 4 hours
cron.schedule('0 */4 * * *', monitorAndPostRelevantTrends);  // Run every 4 hours

// Run daily analysis of followers
cron.schedule('0 12 * * *', analyzeFollowers);  // Run at noon daily

// Post polls at a scheduled time
cron.schedule('0 9 * * *', postPollIfNeeded);  // Run every day at 9 AM

// Search tweets for relevant trends every 6 hours
cron.schedule('0 */6 * * *', searchTweetsUsingTrends);