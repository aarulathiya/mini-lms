# 📚 Mini LMS App

A production-ready Mini Learning Management System built with **React Native Expo**, featuring native features, WebView integration, bidirectional communication, and secure state management.

---

## 📱 App Screenshots

| Login | Courses | Course Detail | WebView | Profile |
|-------|---------|---------------|---------|---------|
| Gradient auth UI | Browse & search | Enroll & bookmark | In-app viewer | Stats & avatar |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native Expo SDK 51 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router v3 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS) |
| UI Effects | expo-linear-gradient, @react-native-masked-view |
| State Management | Zustand |
| Forms | React Hook Form + Zod validation |
| Secure Storage | Expo SecureStore (tokens, user data) |
| App Storage | AsyncStorage (bookmarks, preferences) |
| API Client | Axios (interceptors + retry logic) |
| Notifications | Expo Notifications |
| WebView | react-native-webview |
| Image Picker | Expo Image Picker |
| Network Monitor | Expo Network |
| Gestures | react-native-gesture-handler |

---

## 📂 Project Structure

```
mini-lms-app/
├── app/
│   ├── _layout.tsx              # Root layout — auth init, splash, notifications
│   ├── index.tsx                # Entry redirect (tabs or login)
│   ├── auth/
│   │   ├── _layout.tsx
│   │   ├── login.tsx            # Login screen (gradient UI, form validation)
│   │   └── register.tsx         # Register screen
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar config (dark purple theme)
│   │   ├── index.tsx            # Course catalog (search, infinite scroll)
│   │   ├── bookmarks.tsx        # Saved courses
│   │   └── profile.tsx          # User profile, stats, notifications
│   └── course/
│       ├── _layout.tsx
│       ├── [id].tsx             # Course detail (enroll, bookmark)
│       └── webview.tsx          # Embedded WebView (native ↔ web bridge)
├── components/
│   ├── CourseCard.tsx           # Memoized course list item
│   ├── OfflineBanner.tsx        # Animated offline indicator
│   └── ErrorView.tsx            # Error state with retry
├── store/
│   ├── authStore.ts             # Zustand — auth state
│   └── courseStore.ts           # Zustand — courses, bookmarks, enroll
├── lib/
│   ├── api.ts                   # Axios client (token attach, 401 refresh, retry)
│   ├── storage.ts               # SecureStore + AsyncStorage helpers
│   └── notifications.ts         # Expo Notifications setup
├── hooks/
│   └── useNetwork.ts            # Network connectivity hook
├── constants/
│   └── index.ts                 # API URLs, storage keys, colors
├── types/
│   └── index.ts                 # TypeScript interfaces
├── assets/
│   ├── icon.png                 # App icon (1024x1024)
│   ├── adaptive-icon.png        # Android adaptive icon
│   ├── splash.png               # Splash screen
│   ├── favicon.png              # Web favicon
│   └── notification-icon.png    # Android notification icon (RGBA transparent)
├── global.css                   # NativeWind base CSS
├── app.json                     # Expo config
├── eas.json                     # EAS Build config
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Setup Instructions

### ✅ Prerequisites

Make sure you have the following installed:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 18 | https://nodejs.org |
| npm | >= 9 | Comes with Node |
| Expo CLI | Latest | `npm install -g expo-cli` |
| EAS CLI | Latest | `npm install -g eas-cli` |
| Xcode | >= 15 | Mac App Store (iOS only) |
| Android Studio | Latest | https://developer.android.com/studio |
| CocoaPods | Latest | `sudo gem install cocoapods` |

---

### 📥 Step 1 — Clone & Install

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/mini-lms-app.git
cd mini-lms-app

# 2. Install JS dependencies
npm install
```

---

## 🧪 Demo Credentials

```
Username : johnd
Password : m38rmF$
```

> These credentials work with the public `https://api.freeapi.app` API.

---

## ✅ Features Implemented

### Part 1 — Authentication
- [x] Login with username + password
- [x] Register new account
- [x] Tokens stored securely in Expo SecureStore
- [x] Auto-login on app restart (token validation via `/current-user`)
- [x] Token refresh on 401 response
- [x] Logout with full token cleanup
- [x] Password show/hide toggle
- [x] Form validation with Zod schemas

### Part 2 — Course Catalog
- [x] Courses from `/api/v1/public/randomproducts`
- [x] Instructors from `/api/v1/public/randomusers`
- [x] Course cards: thumbnail, title, description, instructor, rating, price
- [x] Bookmark toggle (AsyncStorage persistence)
- [x] Pull-to-refresh
- [x] Debounced search/filter (300ms)
- [x] Infinite scroll pagination
- [x] Enroll button with visual feedback + enrolled badge

### Part 3 — WebView Integration
- [x] Local HTML template with full course details
- [x] Native → WebView: course data injection via `injectJavaScript`
- [x] WebView → Native: progress updates via `postMessage`
- [x] Back navigation handling (WebView history + native back)
- [x] WebView error state with retry button

### Part 4 — Native Features
- [x] Notification permission request on startup
- [x] Immediate notification when 5+ courses bookmarked (milestone)
- [x] 24-hour reminder if app not opened (scheduled notification)
- [x] Manual test notification from Profile screen
- [x] Avatar update via camera or gallery (ImagePicker)
- [x] Camera permission handling

### Part 5 — State Management & Performance
- [x] Zustand global store (auth + courses)
- [x] SecureStore for sensitive data (tokens, user)
- [x] AsyncStorage for app data (bookmarks, enrolled, preferences)
- [x] `React.memo` on CourseCard (prevents unnecessary re-renders)
- [x] `useCallback` on all handlers
- [x] `useMemo` on filtered course list
- [x] Debounced search input

### Part 6 — Error Handling
- [x] Axios retry (up to 3 attempts, exponential backoff)
- [x] 15 second request timeout
- [x] Animated offline banner (expo-network polling)
- [x] WebView error state + reload
- [x] User-friendly error messages with retry button
- [x] Auth errors handled gracefully (token expiry → logout)

---

## 🏗 Key Architectural Decisions

### 1. Expo Router (File-based Navigation)
Declarative, type-safe routing with nested layouts. Each folder maps to a navigation group — `(tabs)` for tab bar, `auth` for login flow, `course` for detail screens.

### 2. Zustand over Redux
Lightweight (~1KB), no boilerplate, works perfectly with async operations. State slices are clean and easy to test. Chosen deliberately over Redux for this project scale.

### 3. SecureStore + AsyncStorage Split
| Data | Storage | Reason |
|------|---------|--------|
| Access token | SecureStore | Encrypted, sensitive |
| Refresh token | SecureStore | Encrypted, sensitive |
| User profile | SecureStore | PII data |
| Bookmarks | AsyncStorage | Non-sensitive, fast reads |
| Enrolled courses | AsyncStorage | Non-sensitive |
| App preferences | AsyncStorage | Non-sensitive |

### 4. Axios Interceptors
- **Request interceptor**: Automatically attaches `Bearer` token to every request
- **Response interceptor**: On 401 → attempts token refresh → retries original request → clears tokens if refresh fails
- **Retry logic**: Up to 3 retries with exponential backoff for network/server errors

### 5. WebView Bridge Architecture
Rather than loading a remote URL (which requires internet + CORS handling), the WebView renders a locally constructed HTML template. Course data is injected from native after load using `injectJavaScript`. Progress updates flow back to native via `ReactNativeWebView.postMessage`. This works fully offline.

### 6. NativeWind + Inline Styles
NativeWind handles most layout/color classes. Complex styles that need runtime values (gradients, dynamic colors) use `StyleSheet` inline styles directly. This keeps components clean while supporting the dark purple design system.

---

## ⚠️ Known Issues / Limitations

| Issue | Details |
|-------|---------|
| API data | `randomproducts` returns e-commerce data; categories reflect products, not courses |
| Avatar | Requires real device (camera roll unavailable in simulators) |
| Notifications | Only work on real devices (limited in Expo Go simulator) |
| Android reminder | 24h notification accuracy may vary due to Android Doze mode |
| Token refresh | Public API refresh endpoint may not always be available |

---

## 📹 Demo Video

[Upload to GitHub Releases — link here]

The demo covers:
1. App launch + auto-login flow
2. Register new account
3. Browse and search courses
4. Bookmark courses (5+ = milestone notification)
5. Course detail + Enroll flow
6. WebView with native ↔ web communication
7. Profile screen with avatar update
8. Offline mode demonstration
9. Notification test

---

## 📬 Submission Checklist

- [x] Source code on GitHub with clean commit history
- [x] README with full setup instructions
- [x] Environment variables documented
- [x] Key architectural decisions explained
- [x] Known issues/limitations listed
- [ ] Demo video (3-5 min) — upload to GitHub Releases
- [ ] APK file — attach to GitHub Release

---

## 👨‍💻 Author

**Your Name**
- GitHub: https://github.com/aarulathiya/mini-lms.git