# MIT Dry Logs Mobile - iOS Tech App

This is the React Native iOS application for MIT technicians to manage mitigation dry logs workflows in the field.

## Overview

This app is a refactored version of the MIT Dry Logs web application, specifically designed for iOS devices and focused on the technician workflows:

- **Install Workflow**: Complete equipment installation process
- **Demo Workflow**: Demolition and material removal
- **Check Service Workflow**: Equipment monitoring and moisture readings
- **Pull Workflow**: Final equipment removal and job completion

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Firebase** for authentication and database
- **Zustand** for state management
- **React Navigation** for routing
- **date-fns** for date utilities

## Project Structure

```
MITDryLogsMobile/
├── App.tsx                          # Main app entry point
├── src/
│   ├── components/
│   │   ├── shared/                  # Reusable components (Button, Input, Card, etc.)
│   │   └── workflows/               # Workflow-specific components
│   ├── screens/
│   │   ├── TechDashboard.tsx        # Main tech dashboard
│   │   └── workflows/               # Workflow screens
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Navigation configuration
│   ├── stores/                      # Zustand state management
│   ├── services/                    # Firebase services
│   ├── hooks/                       # Custom React hooks
│   ├── config/                      # App configuration (Firebase, etc.)
│   ├── types/                       # TypeScript type definitions
│   └── utils/                       # Utility functions
├── assets/                          # Images and static assets
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or physical iOS device
- Firebase project credentials

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**

   Create a `.env` file in the root directory with your Firebase credentials:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **iOS-Specific Setup:**

   The app requires the following iOS permissions (configured in `app.json`):
   - Camera access (for photo capture)
   - Photo library access (for saving/uploading photos)
   - Location services (for job location verification)

### Running the App

**Start development server:**
```bash
npm start
```

**Run on iOS Simulator:**
```bash
npm run ios
```

**Run on iOS Device:**
1. Install the Expo Go app from the App Store
2. Scan the QR code from the terminal
3. Or press `i` in the terminal to open in iOS Simulator

### Building for Production

**Create production build:**
```bash
npx expo build:ios
```

Follow Expo's documentation for submitting to the App Store.

## Key Features

### Offline Support
- Jobs and data are cached locally using AsyncStorage
- Changes sync automatically when connection is restored
- Offline indicator shows current connectivity status

### Photo Capture
- Native camera integration via `expo-camera`
- Photo gallery management with `expo-image-picker`
- Automatic upload to Firebase Storage when online

### Location Services
- GPS verification for job site arrival
- Automatic address validation
- Distance tracking for mileage calculation

### Workflow Management
- Step-by-step guided workflows
- Progress tracking and completion validation
- Real-time updates to Firebase

## Development Notes

### State Management
The app uses Zustand for lightweight state management with the following stores:
- `authStore`: User authentication and profile
- `jobsStore`: Job data and filtering
- `workflowStore`: Workflow progress and state
- `syncStore`: Offline sync queue
- `notificationStore`: Toast notifications

### Navigation
React Navigation v7 with native stack navigator for optimal iOS performance.

### Styling
React Native StyleSheet with a design system matching the Entrusted brand:
- Primary color: `#FF6B35` (Entrusted Orange)
- Font family: System fonts (SF Pro on iOS)

## Testing

Currently, the app includes:
- Basic navigation structure
- TechDashboard with job filtering
- Placeholder workflow screens

**Next Steps for Development:**
1. Implement complete workflow step components
2. Add photo capture and gallery features
3. Implement offline sync with AsyncStorage
4. Add equipment scanning (QR/Barcode)
5. Complete moisture reading entry forms
6. Add PDF generation for reports
7. Implement push notifications

## Differences from Web App

This mobile app focuses exclusively on the **Tech workflows** and excludes:
- PSM (Project Success Manager) features
- Lead dashboard and management
- Admin functions
- Desktop-specific features

## Contributing

When adding new features:
1. Follow the existing component structure
2. Use TypeScript for all new files
3. Follow React Native best practices
4. Test on both iOS Simulator and device
5. Ensure offline functionality works

## Troubleshooting

**App won't start:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Expo cache: `npx expo start -c`

**Firebase errors:**
- Verify `.env` file exists and has correct values
- Check Firebase console for project configuration

**iOS build fails:**
- Update Xcode to latest version
- Run `npx expo-doctor` to check for issues
- Clear derived data in Xcode

## License

Proprietary - Entrusted Restoration Group

## Contact

For questions or support, contact the development team.
