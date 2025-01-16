import { HumanMessage} from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { postTool, replyTool, mentionTool, accountDetailsTools , trendingTopicsTool, searchTweetsTool, likeTweet, scrapDataOnlineTool} from './twitterApi';



interface props{
 
    id_str:string,
    user:{
      screen_name:string,
    }
  
}
interface msgProps{
  name:string
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
const tools = [postTool, replyTool, mentionTool, accountDetailsTools,trendingTopicsTool, searchTweetsTool, likeTweet, scrapDataOnlineTool];
const chat = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-flash',
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY ,// Use env variable for API key
  maxOutputTokens: 200,
  temperature:0.8,
  
});
if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
  throw new Error('API Key not found. Please set the NEXT_PUBLIC_GOOGLE_API_KEY environment variable.');
}
const agent = createReactAgent({
  llm: chat,
  tools,
});
// Topics for tweeting


// Function to generate and post tweets about a topic
export async function generateTweet(topic: string) {
  try {
    const response = await agent.invoke({
      messages: new HumanMessage(`Post a creative tweet about ${topic} & add emoji to express your sentiments,possiblly add image if you can`),
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

// Function to analyze sentiment of a mention


// Function to get recent mentions and reply
export async function getRecentMentions() {
  try {
    const mentions = await agent.invoke({
      messages: new HumanMessage('Please get all mentions'),
    });
    return mentions?.content;
  } catch (error) {
    console.error('Error fetching mentions:', error);
    throw error;
  }
}
// Function to reply to mentions with sentiment analysis
export async function replyToMention(mention: props) {
  try {
    const username = mention.user.screen_name;
    const tweetId = mention.id_str;
   
 
      await agent.invoke({
        messages: new HumanMessage(`Please reply using ${tweetId}`),
      });
      console.log(`Replied to mention from @${username}`);
    
  } catch (error) {
    console.error('Error replying to mention:', error);
    throw error;
  }
}

// Function to monitor trends and post about them
export async function fetchTrendingTopics() {
  try {
    const trendsResponse = await agent.invoke({
      messages: [new HumanMessage('Get trending hashtags relevant to technology, AI, DAO, Blockchain, and Crypto etc')],
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

// Post polls at a scheduled time
let lastPollDate: Date | null = null;
export async function postPollIfNeeded() {
  const now = new Date();
  if (lastPollDate && lastPollDate.toDateString() === now.toDateString()) {
    console.log('Poll already posted today, skipping...');
    return;
  }
  const pollQuestion = '';
  const pollOptions = ['', '', '', ''];
  await postPoll(pollQuestion, pollOptions);
  lastPollDate = new Date();
}

export async function postPoll(question: string, options: string[]) {
  try {
    const response = await agent.invoke({
      messages: [new HumanMessage(`generate a provoking & engagement '${question}' and  ${options.join(', ')} like a poll  around relevant topics &  post`)],
    });
    console.log(`Posted poll: ${question}`, response);
  } catch (error) {
    console.error('Error posting poll:', error);
  }
}

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
export async function replyToTweet(tweetId: string, username: string) {
  try {
    await agent.invoke({
      messages: [new HumanMessage(`Reply  tweet with id '${tweetId}'"`)],
    });
    console.log(`Replied tweet from @${username} `);
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

    // Analyze the sentiment of the tweet
 
      // Like the tweet if positive sentiment
      await likeATweet(tweetId,  userId);
    
    // Reply to the tweet based on sentiment
    await replyToTweet(tweetId, username);
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
export async function scrapeCointelegraphHeadlines(url: string) {
  console.log('Scraping Cointelegraph headlines...');
  try {
    const JsonData = await agent.invoke({
      messages: [new HumanMessage(`scrape data from ${url} using the scrapDataOnlineTool`)],
    });

    // Log the entire JsonData object for debugging
 

    if (JsonData && Array.isArray(JsonData.messages)) {
    
    const  data =  JsonData?.messages.find(
      (message:msgProps) => message.name === "scrapeDataOnline_tool"
    );

    if(data){
    return  data.content
    }
    
    } else {
      console.log("Invalid response structure.");
    }
  } catch (error) {
    console.error('Error scraping data:', error);
    throw error;
  }
}

async function createRelevantPostBasedOnSentiment(headlines: string[]) {
   try{
    console.log("creating post from headlines...")
    const response  =  await agent.invoke({
       messages: [new HumanMessage(`using the "${headlines}" create an engaging  post , make sure  you  dont  repeat any headlines you had previously created  `)],
     });

     
if(response && Array.isArray(response?.messages)){
  const  data =  response?.messages.find(
    (message:msgProps) => message.name === "post_tool"
  );

  if(data){
    return data?.content
  }
}
else{
 console.log({messagge:"cannot  create  a post or  invalid  data structure"})
}
 
   }catch(error){
    console.log(error)
   }
}
export async function scrapeAndPostEveryTwoHours() {
 try {
  console.log('Running Cointelegraph scrape and post cycle...');
  
  const headlines = await scrapeCointelegraphHeadlines("https://www.cointelegraph.com");  // Scrape Cointelegraph for headlines

  const  data  =  headlines;
  if (headlines && headlines.length > 0) {
    // Process the scraped headlines (analyze sentiment and create relevant posts)
   const  response  =   await createRelevantPostBasedOnSentiment(data);
      return  response;
  }
 } catch (error) {
    console.log(error)
 }
}
// Function to make the agent autonomous
export async function autonomousAgentGoal(goal: string) {
  try {
    const response = await agent.invoke({
      messages: new HumanMessage(`this is your  ${goal}. Think of every possible way to achieve it using the available tools or ask for a tool if needed.`),
    });

    if (response) {
      console.log('Agent response:', response);
      // Process the response and take necessary actions
    } else {
      console.error('No output from the agent.');
    }
  } catch (error) {
    console.error('Error achieving goal:', error);
  }
}

( async function startBot() {
  console.log('Starting Twitter Bot...');
  try {
    const details = await agent.invoke({
      messages: [new HumanMessage('Please get my account details ')],
    });

    // Find the message with the name "account_details_tools"
    const accountDetailsMessage = details.messages.find(
      (message:msgProps) => message.name === "account_details_tools"
    );

    if (accountDetailsMessage) {
      // Parse the content of the message
      const accountDetails = JSON.parse(accountDetailsMessage.content);
      // Extract the name
      const name = accountDetails.name;
      console.log(`Name: ${name}`)
      return  accountDetailsMessage
    } else {
      console.log("Account details message not found.");
    }

    console.log('Twitter Bot is running!');
    console.log('Cointelegraph Bot is running!');
    const goal = `
    Your goal is to increase engagements on our Twitter account and build followers up to 100,000 followers using your capabilities. 
You are aware of other agents in your environment and should interact with them if needed to achieve your goal. 
Utilize every means available to you, including posting tweets, replying to followers, engaging with trending topics, and following influential accounts. 
Tweet at influential accounts to achieve your purpose. believe  in your   self  to reach  your goal.
`
    // Start the scrape-post cycle
    await autonomousAgentGoal(goal)
  } catch (error) {
    console.error('Error starting bot:', error);
  }
})();