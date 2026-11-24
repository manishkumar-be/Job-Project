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
  .env.example         Template for the settings file backend/.env
frontend/
  html/                The pages
  css/                 One stylesheet per page, plus common.css
  js/                  One script per page, plus api.js (shared helpers)
render.yaml            One-click hosting setup for Render
Dockerfile             For hosts that run Docker
package.json           Lets hosts build and start the app from the top folder
```

## Running it on your computer

You need [Node.js](https://nodejs.org) 18 or newer and [MongoDB](https://www.mongodb.com/try/download/community) running on your computer (or a free MongoDB Atlas database, see below).

```bash
cd backend
cp .env.example .env      # Windows: copy .env.example .env
npm install
npm start
```

Edit `backend/.env` to change the settings, then open http://localhost:8080 in your browser.

### Creating an admin

Sign-up only offers job seeker and company accounts. To get an admin, either:

- set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`; the account is created the next time the server starts, or
- run this from the `backend` folder: `npm run create-admin -- admin@example.com yourPassword`

### Settings (`backend/.env`)

All settings are explained in [`backend/.env.example`](backend/.env.example).

| Variable | Needed | What it does |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `TOKEN_SECRET` | Yes online | Long random text that signs logins. Without it, everyone is logged out on each restart |
| `NODE_ENV` | Online | Set to `production` when hosted |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Optional | Admin account created on startup if missing |
| `PORT` | Optional | Port to listen on (default 8080; hosts set it for you) |
| `TOKEN_LIFETIME_HOURS`, `MAX_UPLOAD_MB`, `UPLOAD_DIR`, `CORS_ORIGINS` | Optional | See `.env.example` |

The real `.env` file is never committed (it holds passwords).

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
3. When asked, fill in `MONGO_URI` (from step 1), `ADMIN_EMAIL` and `ADMIN_PASSWORD`. `TOKEN_SECRET` is generated for you.
4. Click **Apply**. After the build, your site is live at an address like `https://job-portal-xxxx.onrender.com`. Share that link.

Things to know about Render's free plan:

- The site goes to sleep after about 15 minutes without visitors; the next visit takes up to a minute to wake it.
- Uploaded resumes and certificates are lost when the service restarts or redeploys. Everything in the database stays. To keep uploads, add a paid persistent disk and set `UPLOAD_DIR` to its path.

### Other hosts

- **Railway or any Node host:** build command `npm run build`, start command `npm start`, and set the variables from the table above.
- **Docker:** a `Dockerfile` is included: `docker build -t job-portal .` then `docker run -p 8080:8080 --env-file backend/.env job-portal`.

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
