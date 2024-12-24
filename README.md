# Twitter AI Agent

## Overview

Twitter AI Agent is a Next.js application that integrates with the Twitter API to perform various automated tasks such as posting tweets, reading timelines, and more. The application leverages environment variables to securely manage API keys and tokens.

## Features

- **Automated Tweet Posting**: Schedule and post tweets automatically.
- **Timeline Reading**: Fetch and display the latest tweets from a user's timeline.
- **Secure Configuration**: Use environment variables to manage sensitive information securely.

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later) or yarn (v1.x or later)
- Twitter Developer Account with API keys and tokens

## Installation

1. **Clone the repository**:

   ```sh
   git clone https://github.com/yourusername/twitter-ai-agent.git
   cd twitter-ai-agent
   ```

2. **Install dependencies**:

   Using npm:

   ```sh
   npm install
   ```

   Using yarn:

   ```sh
   yarn install
   ```

3. **Set up environment variables**:

   Create a `.env.local` file in the root directory of your project and add the following environment variables:

   ```sh
   NEXT_PUBLIC_GOOGLE_API_KEY="your-google-api-key"
   NEXT_PUBLIC_TWITTER_API_KEY="your-twitter-api-key"
   NEXT_PUBLIC_TWITTER_API_SECRET="your-twitter-api-secret"
   NEXT_PUBLIC_TWITTER_ACCESS_TOKEN="your-twitter-access-token"
   NEXT_PUBLIC_TWITTER_ACCESS_TOKEN_SECRET="your-twitter-access-token-secret"
   ```

   Replace the placeholder values with your actual API keys and tokens.

## Usage

1. **Start the development server**:

   Using npm:

   ```sh
   npm run dev
   ```

   Using yarn:

   ```sh
   yarn dev
   ```

   The application will be available at `http://localhost:3000`.

2. **Access environment variables**:

   In your Next.js components or API routes, you can access the environment variables using `process.env`. For example:

   ```javascript
   const twitterApiKey = process.env.NEXT_PUBLIC_TWITTER_API_KEY;
   ```

## Project Structure

```
CDPTOOLKit/
├── public/                 # Static assets
├── src/                    # Source files
│   ├── app/                # Next.js app directory
│   │   ├── api/            # API routes
│   │   └── ...             # Other app-specific files
│   ├── components/         # React components
│   ├── lib/                # Utility functions and libraries
│   └── ...                 # Other source files
├── .env.local              # Environment variables
├── .gitignore              # Git ignore file
├── next.config.js          # Next.js configuration
├── package.json            # Project metadata and dependencies
└── README.md               # Project documentation           # Project documentation
```

## API Integration

### Twitter API

The application uses the Twitter API to interact with Twitter's services. Ensure you have the following credentials from your Twitter Developer account:

- API Key
- API Secret Key
- Access Token
- Access Token Secret

### Google API

If your application requires integration with Google services, ensure you have the Google API Key.

## Security

- **Environment Variables**: Store sensitive information such as API keys and tokens in the `.env.local` file. This file should be added to [`.gitignore`]/Desktop/cdptoolkit/.gitignore" to prevent it from being committed to version control.
- **Rate Limiting**: Be mindful of Twitter API rate limits to avoid being blocked.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact

For any questions or feedback, please contact [emmytwinchimdiebere@gmail.com](mailto:@gmail.com).

---

Thank you for using Twitter AI Agent! We hope it helps you automate your Twitter interactions effectively.