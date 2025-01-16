import { generateTweet, postTweet, scrapeAndPostEveryTwoHours } from '@/lib/TwitterBot';
import { getRecentMentions, replyToMention } from '@/lib/TwitterBot';
import { monitorAndPostRelevantTrends, analyzeFollowers, postPollIfNeeded, searchTweetsUsingTrends } from '@/lib/TwitterBot'; // Import your custom functions
import { NextRequest, NextResponse } from 'next/server';
import { startOfDay, addDays, isAfter } from 'date-fns';
import { Redis } from '@upstash/redis'




const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})


// Define the POST handler for all cron jobs
export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({msg:"action  not  supported"})
  }

  try {
    const {job} =  await  req.json() 

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

       case "scrapeAndPostEveryTwoHours":
        await  scrapeAndPostEveryTwoHoursJob()
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


async function getTweetCountFromRedis() {
  const tweetCount = await redis.get('tweetCount');
  if (tweetCount) {
    return JSON.parse(tweetCount as string);
  } else {
    return { count: 0, lastReset: new Date() };
  }
}

async function incrementTweetCountInRedis() {
  const tweetCount = await getTweetCountFromRedis();
  tweetCount.count += 1;
  await redis.set('tweetCount', JSON.stringify(tweetCount));
}

async function resetTweetCountInRedis() {
  const newTweetCount = { count: 0, lastReset: new Date() };
  await redis.set('tweetCount', JSON.stringify(newTweetCount));
}

// Job to tweet every 3 hours
async function runTweetJob() {
  const MAX_TWEETS_PER_DAY = 10;
  let tweetCount = await getTweetCountFromRedis();
  
  // Reset the tweet count if it's a new day
  const now = new Date();
  const dayStart = startOfDay(now);
 
  if (tweetCount.lastReset && isAfter(now, addDays(new Date(tweetCount.lastReset), 1))) {
    await resetTweetCountInRedis();
    tweetCount = { count: 0, lastReset: dayStart };
  }
  // Check if the bot has already tweeted 7 times today
  if (tweetCount.count >= MAX_TWEETS_PER_DAY) {
    console.log(`Maximum tweets reached for today (${MAX_TWEETS_PER_DAY} tweets).`);
    return;
  }
  const prioritizedTopics = [
    'DAO', 'AI Agents', 'robotics', 'IoT', 'Edge Computing', 
    'Quantum Computing', 'Autonomous Vehicles', 'Smart Cities', 
      'AI Ethics','Natural Language Processing', 
  ];
  const otherTopics = [
    'AI', 'Machine Learning', 'Blockchain', 'Crypto', 'Data Science', 
    'Cybersecurity', 'Cloud Computing', 'DevOps', 'AR/VR', '5G', 
     'Computer Vision', 'Big Data', 
    'Augmented Reality', 'Virtual Reality', 'Fintech', 'Healthtech', 
    'Edtech', 'Agtech', 'Green Technology'
  ];
  const randomNumber = Math.random();
  
  const topic = randomNumber < 0.5 ? prioritizedTopics[Math.floor(Math.random() * prioritizedTopics.length)] : otherTopics[Math.floor(Math.random() * otherTopics.length)];
  const tweet = await generateTweet(topic);
  if (tweet) {
    await postTweet(tweet);
    await incrementTweetCountInRedis();
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
      await replyToMention(mention);
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

async function scrapeAndPostEveryTwoHoursJob(){
  await scrapeAndPostEveryTwoHours()
}