# QuestDo App 👋

QuestDo is a task management mobile application built with **React Native, Expo, Firebase, and Gemini AI**.

The app allows users to:

* Create, edit, and delete tasks
* Categorise and sort tasks
* Set repeating tasks (Daily / Weekly / Monthly)
* Receive notifications and reminders
* View dashboard progress and reward points
* Securely authenticate with Firebase
* Use AI task breakdown for large goals

---

# Installation & Setup

## 1. Install dependencies

```bash
npm install
```

## 2. Create `.env`

Create a `.env` file in the project root.

Copy the following template:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### Firebase Setup

Find these values in:

```text
Firebase Console
→ Project Settings
→ Your Apps
→ Web App
```

### Gemini Setup

Get a free Gemini API key:

https://aistudio.google.com/app/apikey

---

## 3. Start the application

```bash
npx expo start
```

---

# Test Login Account

For testing Firebase authentication:

```text
Username: [ADD TEAM TEST EMAIL HERE]
Password: [ADD TEAM TEST PASSWORD HERE]
```

Do NOT commit personal credentials.

---

# Features

### Task Management

* Create tasks
* Edit tasks
* Delete tasks
* Categorise tasks
* Priority system
* Sorting & filtering

### Repeating Tasks

Supports:

* Daily
* Weekly
* Monthly

Completing a repeating task automatically generates the next task instance.

### Firebase Authentication

* Login
* Sign Up
* Password Reset
* Protected routes

### AI Task Breakdown

Break large goals into smaller subtasks using Gemini AI.

### Dashboard & Rewards

* Daily streak tracking
* Point system
* Bonus rewards

---

# Team Contributions

### Leo Kim

* Task editing functionality
* Task categorisation system
* Firebase authentication integration
* AI breakdown integration
* Repeating task implementation

### Georgia Rouse

* Calendar view
* Delete task functionality
* Points system contribution

### Ben Samountry

* Task creation & completion
* Multi-device task tracking

### Johnny Tsang

* Notification feature
* Application integration

### Tanvir Singh

* Dashboard
* Task sorting

---

# Tech Stack

* React Native
* Expo
* Firebase Authentication
* Firebase Firestore
* Gemini AI API

---

# Notes

Do not commit:

```text
.env
node_modules
```

Only commit:

```text
.env.example
```
