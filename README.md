# VideoTube - YouTube Clone Backend

A production-ready REST API backend inspired by YouTube, built with Node.js, Express, and MongoDB. This project covers all core features of a video-sharing platform including authentication, video management, subscriptions, playlists, comments, likes, and tweets.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (Access Token + Refresh Token)
- **File Storage:** Cloudinary (videos, images)
- **File Upload:** Multer
- **Password Hashing:** bcryptjs

---

## Features

- JWT-based authentication with access & refresh token rotation
- User registration with avatar and cover image upload to Cloudinary
- Full video lifecycle - upload, update, delete, publish/unpublish toggle
- Subscription system (subscribe/unsubscribe channels)
- Nested comment system with likes
- Playlist management (create, add/remove videos, delete)
- Tweet/community post feature
- Like/unlike on videos, comments, and tweets
- Channel profile with subscriber count and subscription status
- Watch history tracking
- Channel dashboard with stats (views, likes, subscribers)
- Pagination on videos and comments using MongoDB aggregation
- Global error handling middleware

---

## Project Structure

```
src/
├── controllers/       # Business logic for each feature
├── models/            # Mongoose schemas
├── routes/            # Express route definitions
├── middlewares/       # Auth, error handling, file upload
├── utils/             # ApiError, ApiResponse, asyncHandler, Cloudinary
├── db/                # MongoDB connection
├── app.js             # Express app setup
└── index.js           # Server entry point
```

---

## API Endpoints

### Auth / Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register with avatar + cover image |
| POST | `/api/v1/users/login` | Login |
| POST | `/api/v1/users/logout` | Logout (auth required) |
| POST | `/api/v1/users/refresh-token` | Refresh access token |
| POST | `/api/v1/users/change-password` | Change password (auth required) |
| GET | `/api/v1/users/current-user` | Get logged-in user (auth required) |
| PATCH | `/api/v1/users/update-account` | Update name/email (auth required) |
| PATCH | `/api/v1/users/avatar` | Update avatar (auth required) |
| PATCH | `/api/v1/users/cover-image` | Update cover image (auth required) |
| GET | `/api/v1/users/c/:username` | Get channel profile (auth required) |
| GET | `/api/v1/users/history` | Get watch history (auth required) |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/videos` | Get all videos (with search, sort, pagination) |
| POST | `/api/v1/videos` | Upload a video |
| GET | `/api/v1/videos/:videoId` | Get video by ID |
| PATCH | `/api/v1/videos/:videoId` | Update video details |
| DELETE | `/api/v1/videos/:videoId` | Delete video |
| PATCH | `/api/v1/videos/toggle/publish/:videoId` | Toggle publish status |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/subscriptions/c/:channelId` | Subscribe/Unsubscribe |
| GET | `/api/v1/subscriptions/c/:channelId` | Get channel subscribers |
| GET | `/api/v1/subscriptions/u/:subscriberId` | Get subscribed channels |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/comments/:videoId` | Get video comments |
| POST | `/api/v1/comments/:videoId` | Add comment |
| PATCH | `/api/v1/comments/c/:commentId` | Update comment |
| DELETE | `/api/v1/comments/c/:commentId` | Delete comment |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/likes/toggle/v/:videoId` | Like/Unlike video |
| POST | `/api/v1/likes/toggle/c/:commentId` | Like/Unlike comment |
| POST | `/api/v1/likes/toggle/t/:tweetId` | Like/Unlike tweet |
| GET | `/api/v1/likes/videos` | Get all liked videos |

### Playlists
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/playlists` | Create playlist |
| GET | `/api/v1/playlists/user/:userId` | Get user playlists |
| GET | `/api/v1/playlists/:playlistId` | Get playlist by ID |
| PATCH | `/api/v1/playlists/:playlistId` | Update playlist |
| DELETE | `/api/v1/playlists/:playlistId` | Delete playlist |
| PATCH | `/api/v1/playlists/add/:videoId/:playlistId` | Add video to playlist |
| PATCH | `/api/v1/playlists/remove/:videoId/:playlistId` | Remove video from playlist |

### Tweets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tweets` | Create tweet |
| GET | `/api/v1/tweets/user/:userId` | Get user tweets |
| PATCH | `/api/v1/tweets/:tweetId` | Update tweet |
| DELETE | `/api/v1/tweets/:tweetId` | Delete tweet |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Get channel stats |
| GET | `/api/v1/dashboard/videos` | Get channel videos |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd VideoTube

# Install dependencies
npm install

# Setup environment variables
cp ".env sample" .env
# Fill in your values in .env

# Start development server
npm run dev
```

### Environment Variables

Copy `.env sample` to `.env` and fill in:

```
MONGODB_URI          - Your MongoDB connection string
ACCESS_TOKEN_SECRET  - Random secret string for JWT
REFRESH_TOKEN_SECRET - Random secret string for refresh JWT
CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET - From Cloudinary dashboard
```

---

## Data Models

- **User** - username, email, password (hashed), avatar, coverImage, watchHistory, refreshToken
- **Video** - videoFile, thumbnail, title, description, duration, views, isPublished, owner
- **Subscription** - subscriber (User), channel (User)
- **Comment** - content, video, owner
- **Like** - likedBy, video/comment/tweet (one of these)
- **Playlist** - name, description, videos[], owner
- **Tweet** - content, owner

---

## Author

**Tushar Sahu**

Built as a backend portfolio project demonstrating real-world REST API design with Node.js, MongoDB aggregation pipelines, JWT auth, and cloud file storage.
