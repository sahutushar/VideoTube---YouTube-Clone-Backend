# VideoTube — YouTube Clone Backend

> A production-ready REST API backend that replicates the core functionality of YouTube.  
> Built with Node.js, Express.js, and MongoDB as a backend portfolio project.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v5-blue)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)](https://mongoosejs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange)](https://jwt.io)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-blueviolet)](https://cloudinary.com)

---

## What is this project?

VideoTube is a **complete backend system** for a video-sharing platform — think YouTube, but the entire server-side logic built from scratch.

A user can:
- Register and log in securely
- Upload videos with thumbnails to the cloud
- Subscribe to other users' channels
- Like/dislike videos, comments, and tweets
- Create and manage playlists
- Comment on videos
- Post community tweets
- View their watch history
- See their channel's analytics dashboard

This project was built to demonstrate **real-world backend engineering skills** — not just CRUD, but proper authentication flows, cloud storage integration, MongoDB aggregation pipelines, and scalable REST API design.

---

## Why was this built?

Most beginner backend projects are simple todo apps or basic CRUD APIs. This project was intentionally built to be **complex and production-like** to showcase:

- How real authentication systems work (JWT + Refresh Token rotation)
- How files are handled in a backend (Multer + Cloudinary)
- How MongoDB aggregation pipelines work for complex data queries
- How to structure a large Node.js project properly
- How to handle errors globally in an Express app

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for the server |
| **Express.js v5** | Web framework for building REST APIs |
| **MongoDB** | NoSQL database to store all data |
| **Mongoose** | ODM to interact with MongoDB using schemas |
| **JWT (jsonwebtoken)** | Authentication via Access + Refresh tokens |
| **bcryptjs** | Hashing passwords before storing in DB |
| **Cloudinary** | Cloud storage for videos and images |
| **Multer** | Handles file uploads from the client |
| **dotenv** | Manages environment variables |
| **cookie-parser** | Reads cookies from incoming requests |
| **cors** | Handles cross-origin requests |

---

## System Architecture

```
Client (Postman / Frontend App)
            |
            | HTTP Request
            v
+---------------------------+
|       Express Server       |
|        (app.js)            |
+---------------------------+
            |
     +------+------+
     |             |
     v             v
 Middleware      Routes
 - CORS          /api/v1/users
 - Auth (JWT)    /api/v1/videos
 - Multer        /api/v1/comments
 - Error         /api/v1/likes
                 /api/v1/playlists
                 /api/v1/tweets
                 /api/v1/subscriptions
                 /api/v1/dashboard
     |
     v
Controllers (Business Logic)
     |
     +------------------+
     |                  |
     v                  v
  MongoDB           Cloudinary
(Data Storage)   (File Storage)
```

---

## Request Lifecycle — How a Request Flows

```
Incoming HTTP Request
        |
        v
[ CORS Middleware ]
  Checks if request origin is allowed
        |
        v
[ Body Parser / Cookie Parser ]
  Parses JSON body and cookies
        |
        v
[ Route Matching ]
  Express matches URL to correct router
        |
        v
[ Auth Middleware - verifyJWT ]        <-- Only for protected routes
  Reads token from cookie or header
  Verifies JWT signature
  Attaches user to req.user
        |
        v
[ Multer Middleware ]                  <-- Only for file upload routes
  Saves file temporarily to /uploads
        |
        v
[ Controller Function ]
  Main business logic runs here
  Validates input
  Queries MongoDB
  Uploads to Cloudinary if needed
  Sends ApiResponse back
        |
        v
[ Error Handler Middleware ]           <-- If any error is thrown
  Catches all errors
  Sends proper error response
        |
        v
HTTP Response sent to Client
```

---

## Authentication Flow

VideoTube uses a **dual-token authentication system** — same as how YouTube, Google, and most production apps work.

```
REGISTRATION FLOW
-----------------
User sends: name, email, password, avatar, coverImage
        |
        v
Validate all fields are present
        |
        v
Check if email/username already exists in DB
        |
        v
Upload avatar + coverImage to Cloudinary
        |
        v
Hash the password using bcrypt (10 salt rounds)
        |
        v
Save user to MongoDB
        |
        v
Return user data (without password)


LOGIN FLOW
----------
User sends: email + password
        |
        v
Find user by email in MongoDB
        |
        v
Compare password with bcrypt.compare()
        |
        v
Generate Access Token (short-lived: 1 day)
Generate Refresh Token (long-lived: 10 days)
        |
        v
Save Refresh Token in MongoDB (user document)
        |
        v
Send both tokens as HTTP-only cookies
Also send in response body (for mobile clients)


PROTECTED ROUTE ACCESS
----------------------
Client sends request with Access Token
(in cookie OR Authorization: Bearer <token> header)
        |
        v
verifyJWT middleware intercepts
        |
        v
jwt.verify() checks token signature + expiry
        |
        v
Find user from decoded token._id in MongoDB
        |
        v
Attach user to req.user
        |
        v
Controller runs with req.user available


TOKEN REFRESH FLOW
------------------
Access Token expires after 1 day
        |
        v
Client sends Refresh Token to /refresh-token
        |
        v
Verify Refresh Token signature
        |
        v
Check if Refresh Token matches what's stored in DB
(prevents reuse of old/stolen tokens)
        |
        v
Generate new Access Token + new Refresh Token
        |
        v
Update Refresh Token in DB
Send new tokens to client


LOGOUT FLOW
-----------
Client hits /logout (auth required)
        |
        v
Remove refreshToken from user document in MongoDB
        |
        v
Clear both cookies from browser
```

---

## Video Upload Flow

```
User sends: title, description, videoFile, thumbnail
        |
        v
Multer saves files temporarily to /src/uploads/
        |
        v
Validate title and description are present
        |
        v
Upload videoFile to Cloudinary (resource_type: auto)
Cloudinary returns: url, duration, public_id
        |
        v
Upload thumbnail to Cloudinary
Cloudinary returns: url, public_id
        |
        v
Create Video document in MongoDB:
{
  videoFile: cloudinary_url,
  thumbnail: cloudinary_url,
  title, description,
  duration: from_cloudinary,
  views: 0,
  isPublished: true,
  owner: req.user._id
}
        |
        v
Return created video in response
```

---

## Database Design

VideoTube uses **7 MongoDB collections**. Here is how they relate to each other:

```
+------------------+          +----------------------+
|      USER        |          |       VIDEO          |
|------------------|          |----------------------|
| _id              |<---------| owner (ref: User)    |
| username         |          | videoFile (url)      |
| email            |          | thumbnail (url)      |
| password (hash)  |          | title                |
| avatar (url)     |          | description          |
| coverImage (url) |          | duration             |
| watchHistory[]   |--------->| views                |
| refreshToken     |          | isPublished          |
+------------------+          +----------------------+
        |                              |
        |                              |
        v                              v
+------------------+          +----------------------+
|   SUBSCRIPTION   |          |       COMMENT        |
|------------------|          |----------------------|
| subscriber (User)|          | content              |
| channel (User)   |          | video (ref: Video)   |
+------------------+          | owner (ref: User)    |
                               +----------------------+
                                        |
        +-------------------------------+
        |               |               |
        v               v               v
+------------+  +------------+  +------------+
|    LIKE    |  |  PLAYLIST  |  |   TWEET    |
|------------|  |------------|  |------------|
| likedBy    |  | name       |  | content    |
| video      |  | description|  | owner      |
| comment    |  | videos[]   |  +------------+
| tweet      |  | owner      |
+------------+  +------------+
```

### Key Design Decisions

**Subscription Model** — Instead of storing subscribers array inside User (which would grow huge), a separate Subscription document is created for each subscriber-channel pair. This makes counting subscribers a simple `countDocuments()` query.

**Like Model** — One Like model handles likes for videos, comments, AND tweets. Only one of the three fields (video/comment/tweet) is filled per document. This avoids creating 3 separate like collections.

**Watch History** — Stored as an array of Video ObjectIds inside the User document. Uses `$addToSet` so the same video is not added twice.

---

## Project Folder Structure

```
VideoTube/
|
├── src/
|   |
|   ├── controllers/          # Business logic — one file per feature
|   |   ├── user.controllers.js
|   |   ├── video.controllers.js
|   |   ├── comment.controllers.js
|   |   ├── like.controllers.js
|   |   ├── subscription.controllers.js
|   |   ├── playlist.controllers.js
|   |   ├── tweet.controllers.js
|   |   └── dashboard.controllers.js
|   |
|   ├── models/               # Mongoose schemas — defines DB structure
|   |   ├── user.models.js
|   |   ├── video.models.js
|   |   ├── comment.models.js
|   |   ├── like.models.js
|   |   ├── subscription.models.js
|   |   ├── playlist.models.js
|   |   └── tweet.models.js
|   |
|   ├── routes/               # URL definitions — connects URL to controller
|   |   ├── user.routes.js
|   |   ├── video.routes.js
|   |   ├── comment.routes.js
|   |   ├── like.routes.js
|   |   ├── subscription.routes.js
|   |   ├── playlist.routes.js
|   |   ├── tweet.routes.js
|   |   └── dashboard.routes.js
|   |
|   ├── middlewares/          # Code that runs between request and controller
|   |   ├── auth.middleware.js      # JWT verification
|   |   ├── multer.middlewares.js   # File upload handling
|   |   └── error.middleware.js     # Global error handler
|   |
|   ├── utils/                # Reusable helper classes/functions
|   |   ├── ApiError.js       # Custom error class with statusCode
|   |   ├── ApiResponse.js    # Standard success response wrapper
|   |   ├── asyncHandler.js   # Wraps async controllers to catch errors
|   |   └── cloudinary.js     # Upload/delete files on Cloudinary
|   |
|   ├── db/
|   |   └── index.js          # MongoDB connection logic
|   |
|   ├── app.js                # Express app setup, middleware registration
|   └── index.js              # Entry point — starts the server
|
├── public/temp/              # Temporary folder (not used actively)
├── .env                      # Environment variables (not in git)
├── .env sample               # Template for environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## API Endpoints — Complete Reference

### Users & Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/users/register` | No | Register new user with avatar + cover image |
| POST | `/api/v1/users/login` | No | Login with email/username + password |
| POST | `/api/v1/users/logout` | Yes | Logout and clear tokens |
| POST | `/api/v1/users/refresh-token` | No | Get new access token using refresh token |
| POST | `/api/v1/users/change-password` | Yes | Change current password |
| GET | `/api/v1/users/current-user` | Yes | Get currently logged-in user details |
| PATCH | `/api/v1/users/update-account` | Yes | Update fullname or email |
| PATCH | `/api/v1/users/avatar` | Yes | Update profile picture |
| PATCH | `/api/v1/users/cover-image` | Yes | Update channel cover image |
| GET | `/api/v1/users/c/:username` | Yes | Get any channel's public profile |
| GET | `/api/v1/users/history` | Yes | Get personal watch history |

### Videos

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/videos` | Yes | Get all videos with search, sort, pagination |
| POST | `/api/v1/videos` | Yes | Upload a new video |
| GET | `/api/v1/videos/:videoId` | Yes | Get single video (also increments view count) |
| PATCH | `/api/v1/videos/:videoId` | Yes | Update video title, description, thumbnail |
| DELETE | `/api/v1/videos/:videoId` | Yes | Delete a video (owner only) |
| PATCH | `/api/v1/videos/toggle/publish/:videoId` | Yes | Toggle video between public/private |

### Subscriptions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/subscriptions/c/:channelId` | Yes | Subscribe or unsubscribe a channel |
| GET | `/api/v1/subscriptions/c/:channelId` | Yes | Get all subscribers of a channel |
| GET | `/api/v1/subscriptions/u/:subscriberId` | Yes | Get all channels a user has subscribed to |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/comments/:videoId` | Yes | Get all comments on a video (paginated) |
| POST | `/api/v1/comments/:videoId` | Yes | Add a comment on a video |
| PATCH | `/api/v1/comments/c/:commentId` | Yes | Edit a comment (owner only) |
| DELETE | `/api/v1/comments/c/:commentId` | Yes | Delete a comment (owner only) |

### Likes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/likes/toggle/v/:videoId` | Yes | Like or unlike a video |
| POST | `/api/v1/likes/toggle/c/:commentId` | Yes | Like or unlike a comment |
| POST | `/api/v1/likes/toggle/t/:tweetId` | Yes | Like or unlike a tweet |
| GET | `/api/v1/likes/videos` | Yes | Get all videos liked by current user |

### Playlists

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/playlists` | Yes | Create a new playlist |
| GET | `/api/v1/playlists/user/:userId` | Yes | Get all playlists of a user |
| GET | `/api/v1/playlists/:playlistId` | Yes | Get a playlist with all its videos |
| PATCH | `/api/v1/playlists/:playlistId` | Yes | Update playlist name/description |
| DELETE | `/api/v1/playlists/:playlistId` | Yes | Delete a playlist (owner only) |
| PATCH | `/api/v1/playlists/add/:videoId/:playlistId` | Yes | Add a video to a playlist |
| PATCH | `/api/v1/playlists/remove/:videoId/:playlistId` | Yes | Remove a video from a playlist |

### Tweets (Community Posts)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/tweets` | Yes | Create a new tweet/community post |
| GET | `/api/v1/tweets/user/:userId` | Yes | Get all tweets by a user |
| PATCH | `/api/v1/tweets/:tweetId` | Yes | Edit a tweet (owner only) |
| DELETE | `/api/v1/tweets/:tweetId` | Yes | Delete a tweet (owner only) |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/dashboard/stats` | Yes | Get channel stats: total views, subscribers, videos, likes |
| GET | `/api/v1/dashboard/videos` | Yes | Get all videos uploaded by the logged-in channel |

---

## Key Technical Concepts Used

### 1. JWT Dual Token System
Two tokens are issued on login:
- **Access Token** — expires in 1 day, used for every API request
- **Refresh Token** — expires in 10 days, stored in DB, used only to get a new access token

This means even if an access token is stolen, it becomes useless after 1 day. The refresh token is stored in the database so it can be invalidated on logout.

### 2. MongoDB Aggregation Pipelines
Complex queries like "get channel profile with subscriber count and whether current user is subscribed" are done using MongoDB's `$lookup`, `$addFields`, `$project` stages — not multiple separate queries. This is more efficient and closer to how production databases are queried.

### 3. Global Error Handling
All controllers are wrapped in `asyncHandler` — a utility that catches any thrown error and passes it to Express's error middleware. This means no try-catch is needed in every controller. The error middleware then sends a consistent JSON error response.

### 4. Cloudinary Cleanup
If a user registration fails after images are already uploaded to Cloudinary, the uploaded images are deleted immediately. This prevents orphaned files from accumulating in cloud storage.

### 5. Owner-Only Operations
Delete and update operations check `video.owner.toString() === req.user._id.toString()` before allowing the action. This ensures users can only modify their own content.

---

## Local Setup

### Prerequisites
- Node.js v18 or higher
- A MongoDB Atlas account (free tier works)
- A Cloudinary account (free tier works)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/sahutushar/VideoTube---YouTube-Clone-Backend.git
cd VideoTube---YouTube-Clone-Backend

# 2. Install all dependencies
npm install

# 3. Create your environment file
cp ".env sample" .env

# 4. Fill in the values in .env (see below)

# 5. Start the development server
npm run dev
```

### Environment Variables

```env
PORT=7001
CORS_ORIGIN=*

MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net

ACCESS_TOKEN_SECRET=<any_long_random_string>
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=<any_different_long_random_string>
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=<from_cloudinary_dashboard>
CLOUDINARY_API_KEY=<from_cloudinary_dashboard>
CLOUDINARY_API_SECRET=<from_cloudinary_dashboard>

NODE_ENV=development
```

### Testing the API

Once the server is running, you can test using Postman or any API client:

```
Health Check:  GET  http://localhost:7001/api/v1/healthcheck
Register:      POST http://localhost:7001/api/v1/users/register
Login:         POST http://localhost:7001/api/v1/users/login
```

For protected routes, after login copy the `accessToken` from the response and send it as:
- Cookie: `accessToken=<token>` (automatic if using browser/Postman with cookies enabled)
- OR Header: `Authorization: Bearer <token>`

---

## What I Learned Building This

- Designing a **scalable REST API** with proper separation of concerns (routes → controllers → models)
- Implementing **JWT authentication** with refresh token rotation from scratch
- Writing **MongoDB aggregation pipelines** for complex relational-style queries in a NoSQL database
- Handling **file uploads** end-to-end: client → Multer (temp storage) → Cloudinary (permanent storage)
- Building a **global error handling system** so the entire app has consistent error responses
- Managing **environment-based configuration** and keeping secrets out of the codebase

---

## Author

**Tushar Sahu**

- GitHub: [github.com/sahutushar](https://github.com/sahutushar)

---

> This is a backend-only project. There is no frontend. All APIs are designed to be consumed by any frontend framework (React, Vue, etc.) or mobile app.
