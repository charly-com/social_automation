Faceless AI-Powered Content Automation App
This is a Node.js application built with NestJS that automates the creation and posting of short social media videos (30–60 seconds) focused on budgeting tips for Nigerian youth. It generates scripts, voiceovers, thumbnails, and videos, then schedules auto-posting to YouTube and Facebook, with manual posting support for Instagram and TikTok via a dashboard endpoint. The app is designed to be cost-free, using free-tier services (Render/Railway, MongoDB Atlas, ElevenLabs, OpenRouter) and local storage, with cleanup to manage disk usage.
Features
Script Generation: Creates 30–60 second scripts using OpenRouter’s GPT-3.5-turbo (free tier).

Voiceover Generation: Converts scripts to audio using ElevenLabs Free Tier.

Thumbnail Generation: Generates thumbnails (mocked with Craiyon; placeholder API).

Video Compilation: Combines voiceovers and thumbnails into 720p MP4 videos using ffmpeg.

Scheduling & Posting:
Auto-posts to YouTube and Facebook using their APIs (YouTube Data API v3, Facebook Graph API).

Creates manual post entries for Instagram and TikTok, accessible via a dashboard endpoint (GET /scheduler/posts).

Daily Automation: Runs a pipeline (script → video → posting) daily via Agenda.js.

Cleanup: Deletes assets older than 30 days to stay within ~1 GB disk limit.

Cost-Free: Uses free-tier services and local storage (Uploads folder).

Solo Use: Optimized for low volume (~1 video/day, ~150–300 MB storage).

Tech Stack
Backend: NestJS, TypeScript

Database: MongoDB Atlas Free Tier (Mongoose)

APIs:
OpenRouter (script generation)

ElevenLabs (voiceovers)

YouTube Data API v3 (auto-posting)

Facebook Graph API (auto-posting)

Media Processing: ffmpeg (video compilation)

Scheduling: Agenda.js

Deployment: Render or Railway Free Tier

Storage: Local (Uploads folder for voiceovers, thumbnails, videos)

Prerequisites
Node.js: v16 or higher

MongoDB Atlas: Free-tier account

API Keys:
OpenRouter (free tier)

ElevenLabs (free tier)

YouTube Data API v3 (Google Cloud)

Facebook Graph API (Facebook Developers)

Git: For cloning and version control

Render/Railway: Free-tier account for deployment

Installation
Clone the Repository:
bash

git clone https://github.com/your-username/faceless-ai-content-app.git
cd faceless-ai-content-app

Install Dependencies:
bash

npm install

Set Up Environment Variables:
Create a .env file in the root directory and add:
env

ELEVENLABS_API_KEY=your_elevenlabs_api_key
MONGODB_URI=your_mongodb_atlas_uri
BASE_URL=http://localhost:3000
XAI_API_KEY=your_xai_api_key
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/scheduler/oauth2callback
YOUTUBE_REFRESH_TOKEN=your_refresh_token
FACEBOOK_ACCESS_TOKEN=your_access_token
OPENROUTER_API_KEY=your_openrouter_api_key

Obtain keys from respective platforms.

Generate YOUTUBE_REFRESH_TOKEN (see YouTube OAuth Setup (#youtube-oauth-setup)).

Start the App Locally:
bash

npm run start:dev

Configuration
YouTube OAuth Setup
Create a Google Cloud project at console.cloud.google.com.

Enable YouTube Data API v3.

Create OAuth 2.0 credentials (Web Application):
Set redirect URI: http://localhost:3000/scheduler/oauth2callback.

Access http://localhost:3000/scheduler/auth-url, authorize, and copy YOUTUBE_REFRESH_TOKEN from logs to .env.

Facebook Setup
Create a Business app at developers.facebook.com.

Add a Facebook Page and generate a Page Access Token with publish_video permission.

Add FACEBOOK_ACCESS_TOKEN to .env.

OpenRouter Setup
Sign up at openrouter.ai and get a free-tier API key.

Add OPENROUTER_API_KEY to .env.

MongoDB Atlas
Create a free-tier cluster at MongoDB Atlas.

Copy the connection string and add to MONGODB_URI in .env.

Usage
Trigger Daily Content Pipeline
Run the pipeline to generate a script, voiceover, thumbnail, video, and schedule posts:
bash

curl -X POST http://localhost:3000/scheduler/trigger-content

Output:
Script, voiceover, thumbnail, and video stored in MongoDB and Uploads folder.

YouTube/Facebook posts scheduled (pending, auto-posted after 1 hour).

Instagram/TikTok posts created (manual).

Access Manual Posts (Dashboard)
Retrieve posts for manual posting to Instagram/TikTok:
bash

curl http://localhost:3000/scheduler/posts

Response (example):
json

[
{
"_id": "...",
"videoId": "<videoId>",
"platform": "instagram",
"scheduledAt": "2025-06-02T10:00:00Z",
"status": "manual",
"videoUrl": "/Uploads/videos/<videoId>.mp4",
"caption": "Budgeting Tips for Nigerian Youth"
},
{
"_id": "...",
"videoId": "<videoId>",
"platform": "tiktok",
"scheduledAt": "2025-06-02T10:00:00Z",
"status": "manual",
"videoUrl": "/Uploads/videos/<videoId>.mp4",
"caption": "Budgeting Tips for Nigerian Youth"
}
]

Access videos at http://localhost:3000/Uploads/videos/<videoId>.mp4 and post manually to Instagram/TikTok.

Cleanup Old Assets
Trigger cleanup for assets older than 30 days:
bash

curl -X POST http://localhost:3000/scripts/trigger-cleanup
curl -X POST http://localhost:3000/voiceovers/trigger-cleanup
curl -X POST http://localhost:3000/thumbnails/trigger-cleanup
curl -X POST http://localhost:3000/videos/trigger-cleanup

Deployment
Render
Sign up at render.com.

Create a Web Service and connect your GitHub repository.

Set environment variables in the Render dashboard (same as .env).

Configure:
Runtime: Node.js

Build Command: npm install && npm run build

Start Command: npm run start:prod

Update .env for production:
env

BASE_URL=https://your-service.onrender.com
YOUTUBE_REDIRECT_URI=https://your-service.onrender.com/scheduler/oauth2callback

Deploy and test endpoints.

Railway
Sign up at railway.app.

Create a new project and link your GitHub repository.

Add environment variables via the Railway dashboard.

Deploy and update .env as above.

Production Testing
Trigger pipeline:
bash

curl -X POST https://your-service.onrender.com/scheduler/trigger-content

Check manual posts:
bash

curl https://your-service.onrender.com/scheduler/posts

Verify YouTube/Facebook posts and MongoDB records.

Project Structure

src/
├── app.module.ts
├── main.ts
├── script-generation/
│ ├── script.schema.ts
│ ├── script-generation.module.ts
│ ├── script-generation.service.ts
├── tts/
│ ├── tts.module.ts
│ ├── tts.service.ts
│ ├── tts.controller.ts
│ ├── voiceover.schema.ts
├── thumbnail/
│ ├── thumbnail.module.ts
│ ├── thumbnail.service.ts
│ ├── thumbnail.controller.ts
│ ├── thumbnail.schema.ts
├── video/
│ ├── video.module.ts
│ ├── video.service.ts
│ ├── video.controller.ts
│ ├── video.schema.ts
├── scheduler/
│ ├── scheduler.module.ts
│ ├── scheduler.service.ts
│ ├── scheduler.controller.ts
│ ├── schedule.schema.ts
├── agenda/
│ ├── agenda.module.ts
Uploads/
│ ├── voiceovers/
│ ├── thumbnails/
│ ├── videos/

Limitations
Thumbnail Generation: Uses a mock Craiyon API (Step 4 incomplete). Consider integrating Replicate Free Tier.

Instagram/TikTok: Manual posting due to API restrictions (Instagram Business Profile, TikTok Video Kit approval).

Storage: Limited to ~1 GB on Render/Railway; cleanup ensures ~150–300 MB usage.

OpenRouter: Free-tier limits may apply; monitor usage.

Future Improvements
Step 4 Completion: Integrate real Craiyon or Replicate API for thumbnails.

Step 7 Deployment: Finalize CI/CD with GitHub Actions.

Analytics: Add endpoints for tracking post performance (views, likes).

A/B Testing: Implement logic for testing video hooks/captions.

User Roles: Add Admin/Creator roles with JWT authentication.

Troubleshooting
API Errors: Check .env keys and API quotas (YouTube: ~10,000 units/day, ElevenLabs: ~10,000 characters/month).

MongoDB Connection: Verify MONGODB_URI and network access in MongoDB Atlas.

File Not Found: Ensure Uploads folder exists (mkdir -p Uploads/{voiceovers,thumbnails,videos}).

OAuth Issues: Regenerate YOUTUBE_REFRESH_TOKEN if expired.

Contributing
This is a solo project, but feedback is welcome! Open an issue or submit a pull request on GitHub.
License
MIT License. See LICENSE for details.
Contact
For support, contact [uchecharles223@gmail.com (mailto:uchecharles223@gmail.com)] or open an issue on GitHub.
