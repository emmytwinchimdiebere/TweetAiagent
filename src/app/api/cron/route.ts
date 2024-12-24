import { generateTweet, postTweet } from '@/lib/TwitterBot';
import { getRecentMentions, replyToMention, analyzeSentiment } from '@/lib/TwitterBot';
import { monitorAndPostRelevantTrends, analyzeFollowers, postPollIfNeeded, searchTweetsUsingTrends } from '@/lib/TwitterBot'; // Import your custom functions
import { NextRequest, NextResponse } from 'next/server';

// Define the POST handler for all cron jobs
export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({msg:"action  not  supported"})
  }

  try {
    const job  =  await  req.json() 

    switch (job) {
      case 'tweetEvery3Hours':
        await runTweetJob();
        break;

      case 'replyToMentionsEvery10Minutes':
        await runReplyToMentionsJob();
        break;

      case 'monitorTrendsEvery4Hours':
        await runMonitorTrendsJob();
        break;

      case 'dailyFollowerAnalysis':
        await runDailyFollowerAnalysis();
        break;

      case 'postPollAt9AM':
        await runPostPollJob();
        break;

      case 'searchTweetsUsingTrendsEvery6Hours':
        await runSearchTweetsJob();
        break;

      default:
        return NextResponse.json({ message: 'Invalid cron job specified' });
    }

    // If successful, return success
    return NextResponse.json({ message: `${job} executed successfully` });
  } catch (error) {
 
    return NextResponse.json({ message: 'Cron job execution failed', error: error});
  }
}

// Job to tweet every 3 hours
async function runTweetJob() {

  const prioritizedTopics = ['DAO', 'AI agents'];
  const otherTopics = ['AI', 'Machine Learning', 'Blockchain', 'Crypto'];
  const randomNumber = Math.random();
  
  const topic = randomNumber < 0.5  ? prioritizedTopics[Math.floor(Math.random() * prioritizedTopics.length)]: otherTopics[Math.floor(Math.random() * otherTopics.length)];

  const tweet = await generateTweet(topic);
  if (tweet) {
    await postTweet(tweet);
  }
}

// Job to reply to mentions every 10 minutes
let lastMentionReplyTime: Date | null = null;
async function runReplyToMentionsJob() {
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
}

// Job to monitor trends every 4 hours
async function runMonitorTrendsJob() {
  await monitorAndPostRelevantTrends();
}

// Job for daily analysis of followers
async function runDailyFollowerAnalysis() {
  await analyzeFollowers();
}

// Job to post poll at 9 AM daily
async function runPostPollJob() {
  await postPollIfNeeded();
}

// Job to search tweets using trends every 6 hours
async function runSearchTweetsJob() {
  await searchTweetsUsingTrends();
}
