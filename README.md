# Faceless AI-Powered Content Automation App

This is a Node.js application built with NestJS that automates the creation and posting of short social media videos (30–60 seconds) focused on budgeting tips for Nigerian youth. It generates scripts, voiceovers, thumbnails, and videos, then schedules auto-posting to YouTube and Facebook, with manual posting support for Instagram and TikTok via a dashboard endpoint.

> **Note**: The app is optimized for solo use with low volume (~1 video/day) using free-tier services and local storage.

---

## ✨ Features

- **Script Generation** using OpenRouter (GPT-3.5-turbo).
- **Voiceover Creation** using ElevenLabs Free Tier.
- **Thumbnail Generation** (mocked with Craiyon for now).
- **Video Compilation** with `ffmpeg`.
- **Auto-posting** to YouTube and Facebook.
- **Manual posting** support for Instagram and TikTok.
- **Daily Automation** with Agenda.js.
- **Asset Cleanup** for media >30 days.
- **Free-tier Compatibility** with Render/Railway, MongoDB Atlas, and local storage.

---

## ⚙ Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** MongoDB Atlas (Mongoose)
- **AI APIs:** OpenRouter, ElevenLabs
- **Media:** `ffmpeg`, Craiyon
- **Scheduling:** Agenda.js
- **Deployment:** Render
- **Storage:** Local (`Uploads/` folder)

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- MongoDB Atlas account
- API Keys:
  - OpenRouter
  - ElevenLabs
  - YouTube Data API v3
  - Facebook Graph API
- Render/Railway free-tier account

### Installation

```bash
git clone https://github.com/your-username/faceless-ai-content-app.git
cd faceless-ai-content-app
npm install
```

### Environment Variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_atlas_uri
OPENROUTER_API_KEY=your_openrouter_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/scheduler/oauth2callback
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
BASE_URL=http://localhost:3000
```

### Start the Server

```bash
npm run start:dev
```

### 🔁 Usage

#### Generate AI Content

```bash
curl -X POST http://localhost:3000/content/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "budgeting for NYSC"}'
```

#### View All Generated Content

```bash
curl http://localhost:3000/content
```

### 🧠 YouTube OAuth Setup

* Go to [Google Cloud Console](https://console.cloud.google.com)
* Enable **YouTube Data API v3**
* Create OAuth 2.0 credentials (Web App)

  * Redirect URI: `http://localhost:3000/scheduler/oauth2callback`
* Visit `/scheduler/auth-url` to get auth URL, complete OAuth, and log the refresh token

### 📘 Facebook Setup

* Create an App on [Facebook Developers](https://developers.facebook.com)
* Add a Facebook Page
* Generate a Page Access Token with `publish_video` permissions
* Add to `.env` as `FACEBOOK_ACCESS_TOKEN`

### 🧪 API Reference

#### Manual Posts (Dashboard)

```bash
curl http://localhost:3000/scheduler/posts
```

**Response:**

```json
[
  {
    "_id": "...",
    "videoId": "abc123",
    "platform": "instagram",
    "status": "manual",
    "videoUrl": "/Uploads/videos/abc123.mp4",
    "caption": "Budgeting Tips for Nigerian Youth"
  }
]
```

#### Cleanup Assets Older Than 30 Days

```bash
curl -X POST http://localhost:3000/scripts/trigger-cleanup
curl -X POST http://localhost:3000/voiceovers/trigger-cleanup
curl -X POST http://localhost:3000/thumbnails/trigger-cleanup
curl -X POST http://localhost:3000/videos/trigger-cleanup
```

### 🧾 Project Structure

```text
src/
├── app.module.ts
├── main.ts
├── content/
│   ├── content.module.ts
│   ├── content.service.ts
│   ├── content.controller.ts
│   └── schemas/content.schema.ts
Uploads/
├── voiceovers/
├── thumbnails/
├── videos/
.env.example
```

### ⚠️ Limitations

* Craiyon used as a mock thumbnail generator (consider switching to Replicate)
* Instagram/TikTok manual posting (due to API restrictions)
* Storage limited (\~1 GB free-tier)
* OpenRouter: Monitor usage limits (free-tier)

### 🔮 Future Improvements

* Real thumbnail AI with Replicate
* CI/CD with GitHub Actions
* Admin/creator roles (JWT Auth)
* Analytics & A/B testing support
* Video generation pipeline step 4 (ffmpeg integration)

### 🛠 Troubleshooting

* **API Errors**: Check `.env` keys and usage quotas
* **Mongo Errors**: Verify connection string and IP whitelist
* **Missing Folders**: Run `mkdir -p Uploads/{voiceovers,thumbnails,videos}`
* **OAuth Issues**: Regenerate refresh token

### 📬 Contact

* Email: [uchecharles223@gmail.com](mailto:uchecharles223@gmail.com)
* GitHub: [https://github.com/charly-com](https://github.com/charly-com)

### 🦪 License

MIT License — See `LICENSE` file for details.
