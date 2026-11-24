# Job Portal

A job portal with three kinds of accounts:

- **Job seekers** build a profile, search and apply for jobs, track their applications, review companies, practise interview questions, and send feedback or help requests.
- **Companies** keep a company profile, post and edit jobs, and accept or reject applicants.
- **Admins** manage all job posts and users, and read feedback and help requests.

## Folder structure

```
backend/
  server.js            Starts the app (API + frontend pages)
  config/              Settings and the MongoDB connection
  models/              Mongoose models (User, JobPost, Application, ...)
  routes/              API routes, one file per feature
  middleware/          Login checks, file uploads, error handling
  utils/               Small shared helpers
  scripts/             createAdmin.js (command line) and ensureAdmin.js (on startup)
  uploads/             Uploaded resumes and certificates (not committed)
  .env                 Every setting, with safe example values; private values go in .env.local
frontend/
  html/                The pages
  css/                 One stylesheet per page, plus common.css
  js/                  One script per page, plus api.js (shared helpers)
render.yaml            One-click hosting setup for Render
Dockerfile             For hosts that run Docker
package.json           Lets hosts build and start the app from the top folder
```

## Running it on your computer

You need [Node.js](https://nodejs.org) 18 or newer and [MongoDB](https://www.mongodb.com/try/download/community) running on your computer.

```bash
cd backend
npm install
npm start
```

Open http://localhost:8080. The settings in `backend/.env` already work locally, with no changes, and an example admin account is created: **admin@example.com / admin123** (local only).

## Settings: `.env` and `.env.local`

`backend/.env` lists every setting the app uses. It is on GitHub, so it only holds safe example values that work on your own computer.

| File | On GitHub? | What goes in it |
|---|---|---|
| `backend/.env` | Yes | Every setting, with example values |
| `backend/.env.local` | **No, it stays on your computer** | Your real values (database password, secret, admin password). Same format; anything here replaces the value in `.env` |

A value set on the hosting site replaces both files.

### The settings

| Variable | What it does |
|---|---|
| `MONGO_URI` | Which MongoDB database to use. Default: MongoDB on your own computer |
| `TOKEN_SECRET` | Long random text that signs logins (this app's "JWT secret"). Keep it private; changing it logs everyone out |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created on startup if it does not exist yet |
| `NODE_ENV` | `production` on a hosted site (Render and the Dockerfile set it for you) |
| `PORT` | Port to listen on (default 8080; hosting sites set it for you) |
| `TOKEN_LIFETIME_HOURS`, `MAX_UPLOAD_MB`, `UPLOAD_DIR`, `CORS_ORIGINS` | Optional, explained in `backend/.env` |

### Same database on your computer and online

The code is identical everywhere; only `MONGO_URI` decides which database is used. To have your computer and the hosted site share one database (same users, jobs and applications):

1. Create a MongoDB Atlas database (see "Hosting it online" below).
2. Put its address in `backend/.env.local`, together with your own secret and admin password:
   ```
   MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/job_portal?retryWrites=true&w=majority
   TOKEN_SECRET=paste-a-long-random-value-here
   ADMIN_EMAIL=you@example.com
   ADMIN_PASSWORD=a-strong-password
   ```
3. Use the same `MONGO_URI` in the hosting site's settings.

Make a random `TOKEN_SECRET` with:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Changes you make while running locally then show up on the live site too, so be careful when testing.

The example `TOKEN_SECRET` and `admin123` password in `.env` are public. So the server ignores the example secret on a hosted site, and only creates the `admin123` admin when the database is on your own computer. That way nobody can use them to get into your shared database or hosted site.

You can also create an admin from the command line: `npm run create-admin -- you@example.com yourPassword`

## Hosting it online (free)

The backend also serves the pages, so you host just one web service plus a database.

### 1. Create a free database on MongoDB Atlas

1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. Under **Database Access**, add a database user with a password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere), because free hosts do not have a fixed address.
4. Click **Connect > Drivers** and copy the connection string. Put your password in it and add the database name `job_portal` before the `?`, like this:
   `mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/job_portal?retryWrites=true&w=majority`

### 2. Deploy on Render

1. Sign up at https://render.com with your GitHub account.
2. Choose **New > Blueprint**, pick this repository, and Render reads `render.yaml`.
3. When asked, fill in `MONGO_URI` (your Atlas string from step 1), `ADMIN_EMAIL` and `ADMIN_PASSWORD` (your own, not `admin123`). A random `TOKEN_SECRET` and `NODE_ENV=production` are set for you.
4. Click **Apply**. After the build, your site is live at an address like `https://job-portal-xxxx.onrender.com`. Share that link.

Things to know about Render's free plan:

- The site goes to sleep after about 15 minutes without visitors; the next visit takes up to a minute to wake it.
- Uploaded resumes and certificates are lost when the service restarts or redeploys. Everything in the database stays. To keep uploads, add a paid persistent disk and set `UPLOAD_DIR` to its path.

### Other hosts

- **Railway or any Node host:** build command `npm run build`, start command `npm start`, and set `NODE_ENV=production`, `MONGO_URI`, `TOKEN_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in its settings.
- **Docker:** a `Dockerfile` is included: `docker build -t job-portal .` then `docker run -p 8080:8080 --env-file backend/.env.local job-portal`.

Check that a deployment works by opening `/api/health`: it shows `"database": "connected"`.

## API overview

Every route is under `/api`. Apart from register and login, a route needs the `Authorization: Bearer <token>` header returned by login.

| Route | Who |
|---|---|
| `GET /health` | Anyone (used by the host to check the app) |
| `POST /register`, `POST /login`, `GET /me` | Anyone (login and register are limited to 10 tries per IP address) |
| `GET/POST /profile` | Job seeker |
| `GET /job-posts` | Any logged-in user |
| `GET /job-posts/mine`, `POST /job-posts` | Company |
| `PUT/DELETE /job-posts/:id` | Owning company or admin |
| `POST /applications`, `GET /applications/mine` | Job seeker |
| `GET /applications/company`, `PUT /applications/:id/status` | Company |
| `GET/PUT /company/profile` | Company |
| `GET /reviews`, `POST /reviews` | Any logged-in user / job seeker |
| `POST /feedback`, `POST /help` | Any logged-in user |
| `GET /feedback`, `DELETE /feedback/:id`, `GET /help`, `PATCH /help/:id/resolve`, `DELETE /help/:id` | Admin |
| `GET/PUT/DELETE /users/...` | Admin |
