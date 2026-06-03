# QuestDo App 👋

QuestDo is a task management mobile application built using **React Native, Expo, Firebase, and Gemini AI integration**. The app helps users create, organise, track, and manage tasks with features such as categories, reminders, recurring tasks, rewards, AI task breakdown, and progress tracking.

## Features

* Create, edit, and delete tasks
* Task categories and priority levels
* Calendar and dashboard views
* Reminder notifications
* Recurring tasks (Daily / Weekly / Monthly)
* Bonus rewards / points system
* Firebase cloud database integration
* Multi-device task synchronisation
* AI task breakdown using Gemini API
* Task sorting and progress tracking
* User authentication
* Task search
* Streak counter
* Cosmetic unlock rewards
* Personal progress statistics
* Task duration estimation
* Task migration for incomplete tasks
* Task abuse prevention safeguards

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a `.env` file

Create a `.env` file in the project root and copy the following template.

```env
# Firebase Configuration

EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# Gemini AI API Key

EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### 3. Start the app

For local web testing:

```bash
npx expo start --clear
```

For Expo web mode:

```bash
npm run web -- --clear
```

For mobile testing with Expo Go:

```bash
npx expo start --tunnel --clear
```

If Expo asks to install `@expo/ngrok`, enter `y`.

## Running on Mobile with Expo Go

If the project is opened in **GitHub Codespaces**, the normal Expo QR code may show a **request timed out** error on mobile. This happens because the phone cannot always connect directly to the Codespaces development server through the normal LAN QR code.

Use tunnel mode instead:

```bash
npx expo start --tunnel --clear
```

Then scan the new QR code with Expo Go.

If it still times out:

```bash
npm install @expo/ngrok
npx expo start --tunnel --clear
```

Other things to try:

* Close Expo Go completely and reopen it.
* Stop the Expo server with `Ctrl + C`, then restart it.
* Scan the new tunnel QR code, not an old QR code.
* Turn off VPN if it is enabled.
* Try mobile data instead of school or public Wi-Fi.
* If the port is busy, try:

```bash
npx expo start --tunnel --clear --port 8082
```

## Updating to the Latest Release Branch

Before running the final version, make sure the local branch is updated.

```bash
git fetch origin
git checkout Release
git pull origin Release
npm install
npx expo start --tunnel --clear
```

If local files block the pull:

```bash
git stash push -u -m "temp before updating Release"
git pull origin Release
npm install
npx expo start --tunnel --clear
```

To confirm the latest Release branch is being used:

```bash
git log --oneline -1
```

## Team Contributions

### Project Roles

* **Leo Kim** - Scrum Master, sprint tracking, Trello management, GitHub review, merge conflict support, and team coordination.
* **Georgia Rouse** - Product Owner, backlog planning, testing support, and documentation coordination.

### Sprint 1 Contributions

#### Leo Kim

* Implemented task categorisation feature.
* Implemented task editing functionality.
* Managed sprint progress as Scrum Master.
* Supported testing and GitHub integration.

#### Georgia Rouse

* Implemented calendar view for tasks.
* Implemented delete task functionality.
* Supported UI improvements, backlog planning, and testing as Product Owner.

#### Ben Samountry

* Implemented task creation functionality.
* Implemented task completion/check-off functionality.
* Worked on multi-device task tracking support.

#### Johnny Tsang

* Implemented notification and reminder functionality.
* Supported application integration and testing.

#### Tanvir Singh

* Implemented task sorting by priority and due date.
* Implemented dashboard view for today's tasks.
* Supported testing for dashboard and sorting features.

### Sprint 2 Contributions

#### Leo Kim

* Configured Firebase database support for persistent task storage.
* Implemented saving and loading tasks using the database.
* Worked on bonus rewards and personal progress features.
* Continued Scrum Master responsibilities, Trello tracking, GitHub review, and merge support.

#### Georgia Rouse

* Product Owner responsibilities and sprint planning support.
* Implemented Firebase authentication support.
* Worked on user authentication functionality.
* Implemented task points reward feature.
* Implemented cosmetic unlock rewards.
* Supported testing and documentation for Sprint 2 features.

#### Ben Samountry

* Implemented task migration for incomplete tasks.
* Implemented task abuse prevention safeguards.
* Supported feature integration and testing.

#### Johnny Tsang

* Implemented task duration estimation.
* Implemented task search by keyword.
* Implemented recurring task functionality.
* Implemented login screen with email and password fields.
* Supported application integration and testing.

#### Tanvir Singh

* Implemented app navigation between screens.
* Implemented weekly, monthly, and semester task summary view.
* Implemented streak counter for daily task completion.
* Supported testing for navigation and progress-related features.

## Project Overview

QuestDo was developed as part of **COMP602 Software Development Practice** using **Agile Scrum methodology**.

The project focused on:

* Sprint planning and Agile development
* User stories and backlog management
* GitHub collaboration and pull requests
* Testing and integration across multiple features
* Database and authentication integration
* Team collaboration across multiple sprints
