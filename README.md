# Authentiqua - Mobile App

A React Native mobile application for document authentication and verification. Users can scan, upload, and verify important documents like identity cards, diplomas, transcripts, and passports with real-time status tracking.

## Features

- **User Authentication** - Sign up and login with email/password
- **Document Scanning** - Capture documents via camera or upload from gallery
- **Document Management** - Upload, organize, and track verification status
- **Activity Logging** - Complete history of all document uploads and status changes
- **User Profile** - Manage profile information and account settings
- **Settings** - Configure notifications, appearance, and security preferences
- **Real-time Sync** - Live updates across devices using Firestore

## Tech Stack

- **Framework**: React Native with Expo SDK 54.0.0
- **Navigation**: React Navigation
- **Backend**: Firebase (Auth + Firestore Database)
- **Camera**: Expo Camera & Image Picker
- **Local Storage**: AsyncStorage

## Project Structure

```
authentiqua-mobile/
├── src/
│   ├── components/           # Reusable UI components
│   ├── config/               # API & app configuration
│   ├── constants/            # Colors and app constants
│   ├── context/              # React Context (Auth state)
│   ├── navigation/           # Navigation setup
│   │   ├── RootNavigator.js      # Main entry point
│   │   ├── AuthNavigator.js      # Login/signup flows
│   │   └── MainNavigator.js      # App screens
│   └── screens/
│       ├── auth/             # Authentication screens
│       ├── main/             # App screens
│       └── SplashScreen.js   # Startup screen
│
├── backend/
│   └── firestore/
│       ├── config.js         # Firebase initialization & validation
│       ├── index.js          # Service exports
│       ├── models/           # Data structure definitions
│       ├── services/         # Firebase service functions
│       │   ├── authService.js       # User login/signup
│       │   ├── userService.js       # Profile management
│       │   ├── documentService.js   # Document operations
│       │   ├── activityService.js   # Activity logging
│       │   ├── settingsService.js   # User preferences
│       │   └── initService.js       # Collection initialization
│       └── rules/            # Firestore security rules
│
├── FIREBASE_SETUP.md        # Step-by-step Firebase setup
├── TROUBLESHOOTING.md       # Common issues and solutions
├── App.js                   # App entry point
├── package.json
└── .env                     # Firebase credentials (git ignored)
```

## Getting Started

### Requirements

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- Firebase project at [firebase.google.com](https://firebase.google.com)

### Installation

1. **Clone and install**
```bash
git clone <repo-url>
cd authentiqua-mobile
npm install
```

2. **Configure Firebase** (CRITICAL STEP)
   - Open [FIREBASE_SETUP.md](FIREBASE_SETUP.md) and follow all steps carefully
   - You'll create a `.env` file with 5 Firebase credentials
   - This step is required - app won't work without it

3. **Run the app**
```bash
npm start
```

Press `a` for Android, `i` for iOS, or `w` for web

### Expected Output

When the app starts, you should see:
```
✅ Firebase Connected Successfully
   Project: your_project_name
```

If you see an error instead, check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Firebase Configuration

### What You Need

1. **Firebase Project** - Created and configured
2. **Authentication** - Email/Password provider enabled
3. **Firestore Database** - Created (free tier works)
4. **Security Rules** - Published (from `backend/firestore/rules/firestore.rules`)
5. **Environment Variables** - 5 values in `.env` file

### Collections (Auto-Created)

The app automatically creates these Firestore collections on first signup:

- **users** - User profiles and account data
- **documents** - Uploaded documents and their metadata
- **activity** - Audit trail of all user actions
- **settings** - User preferences and app configuration

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for collection schemas

## Database Architecture

### User Authentication Flow
1. User signs up with email/password → Firebase Auth
2. User profile auto-created in Firestore
3. Default settings initialized
4. Auth state saved to local device via AsyncStorage

### Document Workflow
1. User captures/selects document
2. Metadata stored in Firestore (fileName, type, status)
3. Activity logged automatically
4. Real-time updates sync across devices

### Security
- Firestore rules ensure users only access their own data
- All writes must be from authenticated user
- Admin operations handled server-side (via Cloud Functions in future)

## Screens

| Screen | Purpose |
|--------|---------|
| SplashScreen | App initialization & auth check |
| LoginScreen | User login with email/password |
| SignupScreen | New account registration |
| HomeScreen | Dashboard showing user info |
| DocumentsScreen | View and upload documents |
| AllActivityScreen | Complete activity history |
| ProfileScreen | Edit profile information |
| SettingsScreen | App preferences |
| SecurityScreen | 2FA and biometric setup |
| HelpScreen | FAQ and support info |

## Running the App

### Development
```bash
npm start                    # Start Expo dev server
# Then press: a (Android), i (iOS), or w (web)
```

### Database Testing
1. Sign up in the app
2. Check Firebase Console → Firestore → Data
3. Verify new user appears in `users` collection
4. Check `settings` and `activity` collections

### On Different Devices
```bash
npm run android             # Development build for Android
npm run ios                 # Development build for iOS
npm run web                 # Web version
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "api-key-not-valid" error | Check `.env` file has correct Firebase credentials |
| "Permission denied" warning | Publish Firestore rules (not draft mode) |
| App loads but Firebase fails | Verify all 5 environment variables are set |
| Collections not appearing | Sign up creates them - wait a few seconds & refresh Firebase Console |
| Login doesn't work | Make sure user was registered in Firebase Auth |

For more detailed help, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Firebase Services Used

### Authentication (`authService.js`)
- Register new users
- Login with email/password
- Logout
- Auth state monitoring
- Password reset
- Profile updates

### User Management (`userService.js`)
- Create user profiles
- Update profile information
- Fetch user data
- Real-time profile updates

### Document Management (`documentService.js`)
- Upload document metadata
- Retrieve user documents
- Update document status
- Delete documents
- Filter by status

### Activity Logging (`activityService.js`)
- Log all user actions
- View activity history
- Filter by type/status
- Get verification summary

### Settings (`settingsService.js`)
- Initialize default settings
- Update notification preferences
- Change app appearance
- Configure security options

See `backend/firestore/services/` for full API documentation

## Environment Variables

Create `.env` in project root with these values from Firebase Console:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important:**
- Replace `your_*` with actual values from Firebase
- No quotes needed around values
- File is git-ignored automatically (.env never committed)
- Copy exact values - no typos or extra spaces

## Development

### Code Organization
- `src/` - All React Native/UI code
- `backend/firestore/` - Firebase integration layer
- Services can be imported anywhere: `import { loginUser } from 'backend/firestore'`

### Adding Features
1. Create service function in `backend/firestore/services/`
2. Export it in `backend/firestore/index.js`
3. Call from screens via Context or direct import
4. Log activity for audit trail

### Building for Production
```bash
expo build:android          # APK/AAB for Android
expo build:ios             # IPA for iOS
```

Requires Expo account (free tier works)

## Performance Tips

- Auth state cached locally (AsyncStorage)
- Firestore queries indexed for speed
- Activity history limited to 100 items per query (change in rules if needed)
- Documents filtered by status for efficient fetching

## Cost

This app uses Firebase free tier:
- ✅ **Firestore**: 1GB free storage, 50K reads/day
- ✅ **Authentication**: Unlimited free users
- ❌ **Cloud Storage**: Requires paid plan (not included)

Perfect for MVP/testing. Add Cloud Storage later if needed.

## License

This project is private.

---

## Next Steps

1. **Setup Firebase** - Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
2. **Test Connection** - Run app and sign up
3. **Check Console** - Verify data in Firestore
4. **Troubleshoot** - If issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Happy building! 🚀
