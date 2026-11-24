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
  scripts/createAdmin.js
  uploads/             Uploaded resumes and certificates (not committed)
frontend/
  html/                The pages
  css/                 One stylesheet per page, plus common.css
  js/                  One script per page, plus api.js (shared helpers)
```

## Running it

You need [Node.js](https://nodejs.org) 18 or newer and [MongoDB](https://www.mongodb.com/try/download/community) running on your computer.

```bash
cd backend
npm install
npm start
```

Then open http://localhost:8080 in your browser.

### Creating an admin

Sign-up only offers job seeker and company accounts. To make an admin, run this from the `backend` folder:

```bash
npm run create-admin -- admin@example.com yourPassword
```

### Settings

You can set these as environment variables:

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `8080` | Port the server listens on |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/job_portal` | MongoDB database to use |
| `TOKEN_SECRET` | random on each start | Signs login tokens. Set it, or everyone is logged out when the server restarts |

## API overview

Every route is under `/api`. Apart from register and login, a route needs the `Authorization: Bearer <token>` header returned by login.

| Route | Who |
|---|---|
| `POST /register`, `POST /login`, `GET /me` | Anyone |
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
