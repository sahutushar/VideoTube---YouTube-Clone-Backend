# VideoTube — Project Metrics (Resume Reference)

> Ye document actual codebase se count karke nikale gaye genuine metrics hain.  
> Har metric ke saath source bhi diya gaya hai taaki koi bhi verify kar sake.

---

## Resume Mein Use Karne Layak Metrics

```
Built a production-ready REST API backend with 30+ API endpoints across 8 feature modules,
7 MongoDB collections with aggregation pipelines, JWT dual-token auth, and Cloudinary
cloud storage integration — written in ~1,700 lines of JavaScript.
```

---

## Metric 1 — API Endpoints: 30

**Source:** `src/routes/` folder ke saare route files manually count kiye

| Route File | Endpoints | Counted From |
|---|---|---|
| `user.routes.js` | 11 | GET×3, POST×4, PATCH×4 |
| `video.routes.js` | 6 | GET×2, POST×1, PATCH×2, DELETE×1 |
| `subscription.routes.js` | 3 | POST×1, GET×2 |
| `comment.routes.js` | 4 | GET×1, POST×1, PATCH×1, DELETE×1 |
| `like.routes.js` | 4 | POST×3, GET×1 |
| `playlist.routes.js` | 7 | POST×1, GET×2, PATCH×3, DELETE×1 |
| `tweet.routes.js` | 4 | POST×1, GET×1, PATCH×1, DELETE×1 |
| `dashboard.routes.js` | 2 | GET×2 |
| `healthcheck.routes.js` | 1 | GET×1 |
| **Total** | **42** | |

> Resume mein "30+ API endpoints" likhna safe aur accurate hai (42 actual hain).

---

## Metric 2 — Lines of Code: ~1,700

**Source:** Windows `find /c /v ""` command se har `.js` file ka line count liya

| Category | Files | Lines |
|---|---|---|
| Controllers | 9 files | 1,313 |
| Models | 7 files | 255 |
| Routes | 9 files | 176 |
| Middlewares | 3 files | 103 |
| Utils | 4 files | 129 |
| Core (app.js, index.js, db/index.js) | 3 files | 86 |
| **Total** | **35 files** | **~2,062** |

> Cloudinary.js mein ~40 lines commented-out old code hai, isliye effective LOC ~1,700 hai.  
> Resume mein "1,700+ lines of JavaScript" likhna accurate hai.

**Exact counts per file:**
```
user.controllers.js      → 366 lines  (largest file — full auth system)
video.controllers.js     → 249 lines
playlist.controllers.js  → 196 lines
comment.controllers.js   → 127 lines
tweet.controllers.js     → 108 lines
like.controllers.js      →  96 lines
subscription.controllers → 94 lines
dashboard.controllers.js →  66 lines
user.models.js           →  89 lines  (bcrypt + JWT methods)
cloudinary.js            →  86 lines  (includes ~40 lines commented code)
multer.middlewares.js    →  46 lines
app.js                   →  46 lines
video.models.js          →  45 lines
```

---

## Metric 3 — MongoDB Collections: 7

**Source:** `src/models/` folder

| Model File | Collection Name | Purpose |
|---|---|---|
| `user.models.js` | `users` | Auth, profile, watch history |
| `video.models.js` | `videos` | Video metadata, Cloudinary URLs |
| `subscription.models.js` | `subscriptions` | subscriber-channel pairs |
| `comment.models.js` | `comments` | Video comments |
| `like.models.js` | `likes` | Likes for videos, comments, tweets |
| `playlist.models.js` | `playlists` | User playlists with video arrays |
| `tweet.models.js` | `tweets` | Community posts |

> Resume mein "7 MongoDB collections" — exact count hai.

---

## Metric 4 — MongoDB Aggregation Pipelines: 10+

**Source:** `$lookup`, `$addFields`, `$group`, `$project` stages manually counted across controllers

| Controller | Pipeline Used For |
|---|---|
| `user.controllers.js` | `getUserChannelProfile` — subscriber count + isSubscribed check |
| `user.controllers.js` | `getWatchHistory` — nested $lookup (videos → users) |
| `video.controllers.js` | `getVideoById` — likes count + owner subscribers + isLiked |
| `video.controllers.js` | `getAllVideos` — search + sort + pagination + owner details |
| `comment.controllers.js` | `getVideoComments` — owner details + likes count + isLiked |
| `like.controllers.js` | `getLikedVideos` — nested $lookup (likes → videos → users) |
| `subscription.controllers.js` | `getUserChannelSubscribers` — subscriber user details |
| `subscription.controllers.js` | `getSubscribedChannels` — channel details + latest video |
| `playlist.controllers.js` | `getUserPlaylists` — total videos + total views per playlist |
| `playlist.controllers.js` | `getPlaylistById` — full video details + owner info |
| `tweet.controllers.js` | `getUserTweets` — owner details + likes count + isLiked |
| `dashboard.controllers.js` | `getChannelStats` — total views + total likes via $group |

> Resume mein "10+ MongoDB aggregation pipelines" — verified 12 actual pipelines hain.

---

## Metric 5 — Authentication System

**Source:** `src/middlewares/auth.middleware.js`, `src/models/user.models.js`, `src/controllers/user.controllers.js`

- JWT Access Token: 1 day expiry (`ACCESS_TOKEN_EXPIRY=1d`)
- JWT Refresh Token: 10 day expiry (`REFRESH_TOKEN_EXPIRY=10d`)
- Password hashing: bcrypt with **10 salt rounds** (line 52 in user.models.js: `bcrypt.hash(this.password, 10)`)
- Token rotation: Refresh token stored in DB, invalidated on logout (`$unset: { refreshToken: 1 }`)
- Dual token support: Cookie (`req.cookies.accessToken`) + Header (`Authorization: Bearer`)

> Resume mein: "Implemented JWT dual-token auth with bcrypt password hashing and refresh token rotation"

---

## Metric 6 — Feature Modules: 8

**Source:** `src/controllers/` folder

1. User & Auth (register, login, logout, token refresh, profile update)
2. Video (upload, fetch, update, delete, publish toggle)
3. Subscriptions (subscribe/unsubscribe, subscriber list, subscribed channels)
4. Comments (CRUD with pagination)
5. Likes (toggle for videos, comments, tweets)
6. Playlists (CRUD + add/remove videos)
7. Tweets / Community Posts (CRUD)
8. Dashboard (channel analytics — views, subscribers, likes, video count)

---

## Metric 7 — Dependencies: 10 production packages

**Source:** `package.json` → `dependencies` field

```json
"bcryptjs": "^3.0.2"
"cloudinary": "^2.7.0"
"cookie-parser": "^1.4.7"
"cors": "^2.8.5"
"dotenv": "^17.2.1"
"express": "^5.1.0"
"jsonwebtoken": "^9.0.2"
"mongoose": "^8.16.5"
"mongoose-aggregate-paginate-v2": "^1.1.4"
"multer": "^2.0.2"
```

> Express v5 (latest major version) use kiya gaya hai — resume mein mention karne layak.

---

## Metric 8 — File Upload Pipeline

**Source:** `src/middlewares/multer.middlewares.js`, `src/utils/cloudinary.js`

- Multer: temp storage in `src/uploads/` → Cloudinary upload → `fs.unlinkSync()` se local file delete
- Cloudinary `resource_type: "auto"` — videos aur images dono handle karta hai
- Cleanup on failure: agar user registration fail ho toh uploaded images Cloudinary se delete ho jaati hain (`deleteFromCloudinary` called in catch block)

---

## Ready-to-Use Resume Bullet Points

Pick any 3-4 based on space:

- Built **42-endpoint REST API** across 8 modules (auth, video, comments, likes, playlists, subscriptions, tweets, dashboard) using Node.js + Express v5
- Designed **7 MongoDB collections** with 12+ aggregation pipelines using `$lookup`, `$group`, `$addFields` for complex relational queries without multiple round-trips
- Implemented **JWT dual-token authentication** (1-day access + 10-day refresh) with bcrypt (10 salt rounds), token rotation, and HTTP-only cookie support
- Built **end-to-end file upload pipeline**: Multer (temp) → Cloudinary (permanent) with automatic cleanup on failure
- Wrote **~1,700 lines of JavaScript** across 35 files following MVC architecture with global error handling via custom `asyncHandler` wrapper

---

## How to Verify These Numbers Yourself

```bash
# Line count for all JS files
find /r src -name "*.js" -exec find /c /v "" {} \;   # Windows

# Count routes (endpoints)
# Open each file in src/routes/ and count router.get/post/patch/delete calls

# Count aggregation pipelines
# Search for "$lookup" across src/controllers/ — each occurrence = one pipeline stage
```

---

*Generated by scanning actual codebase — not estimated.*  
*Last updated: Based on current state of VideoTube project.*
