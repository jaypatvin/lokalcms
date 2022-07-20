# Lokal Content Mangement System

BE uses node 18.4.0
CMS uses node v14.15.4

## Connect to Firebase

Install the firebase tools, run:

### `npm install -g firebase-tools`

To start using firebase tools, you need to login first, run:

### `firebase login`

This will return an URL that will login in you to firebase tools

## Create Firebase configuration File for React

Copy the settings to create a file in the repo as `/src/services/firebase-config.json` following the format below:

```
{
    "config":{
        "apiKey": "...",
        "authDomain": "...",
        "databaseURL": "...",
        "projectId": "...",
        "storageBucket": "...",
        "messagingSenderId": "...",
        "appId": "...",
        "measurementId": "..."
    }
}
```

For security reasons these values will not be saved in the git repository.

## CMS Local Development Setup:

In the project directory, run:

### `npm install`

then run:

### `npm start`

This will initially compile/build and automatically load http://localhost:3000 to your browser, if not just open your browser and load http://localhost:3000

This will also watch changes to the development files and will automatically reload compile and reload your browser.
## Backend Local Development Setup:

In the project directory, run:

### `cd functions`

run:
### `npm install`

then run:

### `npm run dev`

For seeding the local firestore emulator, you can run:
### `npm run seed`
This might take a while (~3-5mins). It will populate your local firestore with dummy data enough for local development.

## Deploy

In the project directory, run:

### `npm build`

This will make a clean and optimized build for production.

Then run:

### `firebase deploy`

