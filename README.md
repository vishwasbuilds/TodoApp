# To-Do App

A task-management mobile app built with React Native and TypeScript, backed by an Express API and MongoDB. Users can create an account, sign in, and manage their own tasks.

## Features

- Register and log in with an email and password.
- Keep the signed-in session on the device between app launches.
- Create, edit, complete, and delete tasks.
- Add a description, category, scheduled time, deadline, and priority to a task.
- Filter tasks by status and sort by deadline, priority, or newest.
- View task completion progress on the dashboard.

## Project structure

Run the mobile app and backend from their separate folders:

```text
Assignment-Project/
├── backend/
│   └── src/
│       ├── middleware/   Authentication middleware
│       ├── models/       MongoDB user and task models
│       ├── routes/       Authentication and task API routes
│       └── server.js     Express server and MongoDB connection
└── TodoApp/
    ├── App.tsx           App state and API actions
    └── src/
        ├── components/   Shared fields and task cards
        ├── screens/      Sign-in and task screens
        ├── services/     API client
        ├── theme.ts      Shared styles and colors
        └── types.ts      TypeScript app types
```

## Requirements

- Node.js 22.11.0 or newer
- MongoDB, available locally or through a MongoDB service
- Android Studio with the Android SDK and an Android emulator (or an Android device)

## Run locally

The following commands assume you are in the `Assignment-Project` folder, which contains both `backend` and `TodoApp`.

### 1. Configure and start the backend

Install the backend dependencies:

```sh
cd backend
npm install
```

In `backend/.env`, configure your MongoDB connection and a private JWT signing secret:

Make sure MongoDB is running and the connection string is correct, then start the API from the `backend` folder:

```sh
npm run dev
```

The API listens on port `5000` by default. Its health endpoint is `http://localhost:5000/api/health`.

### 2. Start the mobile app

In a second terminal, install the app dependencies and start Metro:

```sh
cd TodoApp
npm install
npm install axios @react-native-async-storage/async-storage
```

**Start the Android emulator**

1. Open Android Studio and go to Device Manager.
2. Start an Android Virtual Device.
3. Wait until Android has fully booted.

**Run the React Native app**

In a terminal inside TodoApp, start Metro:

```sh
npx react-native start
```


## API overview

  -`GET      /api/health`               Check API status
  -`POST     /api/auth/register`        Register an account
  -`POST     /api/auth/login`           Log in
  -`GET      /api/tasks`                Get the signed-in user's tasks
  -`POST     /api/tasks`                Create a task
  -`PUT      /api/tasks/:id`            Update a task
  -`PATCH    /api/tasks/:id/complete`   Toggle completion
  -`DELETE   /api/tasks/:id`            Delete a task

Task routes require the bearer token returned by registration or login. Task data is scoped to the signed-in user.
