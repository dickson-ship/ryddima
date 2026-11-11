# Rydimma Educational Complex — School Management App

Expo Router + React Native + Firebase Authentication + Cloud Firestore.

## Included workflows

- Parent account registration and role-checked parent sign-in.
- Administrator and teacher sign-in with Firestore role verification.
- Authenticated route guards for the admin, teacher, and parent portals.
- Admin student list, search, class filter, student creation, and student editing.
- Parent account search and linking from the selected student in the Students list.
- Parent dashboard showing only children linked to the signed-in parent's Firebase UID.
- Parent unlinking/replacement with confirmation.
- Teacher attendance and academic result services/screens already present in the project.
- Admin fee-balance overview using each student's `stats.feeBalance` or `feeBalance` field.
- Password reset email workflow.
- Firestore rules and a collection-group attendance index definition.

## 1. Install dependencies

```bash
npm ci
```

If `npm ci` fails due to a network or cache issue, use `npm install`.

## 2. Configure Firebase

1. Create or open the Firebase project used by the school.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a Firestore database.
4. Copy `.env.example` to `.env` and fill in the Firebase web app configuration values from **Project settings → General → Your apps**.
5. Restart Expo after changing environment variables.

Required variables:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Do not commit the real `.env` file.

## 3. Create the first administrator and teacher accounts

The public registration screen deliberately creates **parent** accounts only. Create the initial administrator and teacher accounts through Firebase Authentication, then create matching documents in Firestore `users/{AUTH_UID}`. The document ID must be the exact Firebase Authentication UID.

Example administrator profile:

```json
{
  "name": "School Administrator",
  "email": "admin@example.com",
  "emailLowercase": "admin@example.com",
  "role": "admin"
}
```

Example teacher profile:

```json
{
  "name": "Teacher Name",
  "email": "teacher@example.com",
  "role": "teacher",
  "className": "Primary 4"
}
```

Parent profiles are created by the registration screen in `users/{AUTH_UID}` with `role: "parent"`. If older parent accounts exist, make sure each has a matching `users` profile document and a `role` field set to `parent`.

## 4. Deploy Firestore rules and indexes

Review `firestore.rules` against any additional collections or custom fields your school uses before deploying. The provided rules cover the collections and paths currently used in the project and intentionally deny unspecified paths. If you add a new Firestore feature, update the rules first.

After selecting the correct Firebase project in the Firebase CLI:

```bash
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes
```

The admin needs permission to read parent profiles and to create/update student-to-parent links. Parents can read their own user profile and linked student records. Teachers can read students in their assigned `className`, write attendance and results for those students, and update only the attendance statistic on a student record.

## 5. Start the app

```bash
npx expo start
```

Use `a` for Android emulator, `i` for iOS simulator (macOS), or `w` for web where supported.

## Parent linking flow

1. A parent registers using the Parent → Register screen.
2. The profile is saved in `users/{parentAuthUid}` with `role: "parent"`.
3. Admin opens **Students**, selects the student's **Link Parent** action, and searches by the parent's name or email (or loads all parents).
4. Admin selects the account and confirms the link.
5. The app writes `parentUid` on the student and a matching `parentStudentLinks/{parentUid}__{studentId}` document.
6. Parent signs in; the dashboard queries children using the authenticated `user.uid` and shows the linked student records.

The Edit Student screen only edits student/contact information; it does not link accounts. This keeps account linking in one place.

## Important limitations to review before production

- The fee screen reports stored balances; it does not process online payments or automatically calculate school fees.
- Parent registration is self-service, but parent-child access is granted only after an administrator links the account.
- Review the Firestore rules and test them in Firebase Emulator Suite before production deployment.
- Add any school-specific fees, terms, payment processing, announcements, and reporting workflows that are not represented in the current source code.


## Verification performed for this handoff

- JavaScript/JSX/TypeScript syntax transpilation check passed for all source files.
- Relative and `@/` import-path check passed.
- Full Expo bundling and live Firebase integration still need to be run in your environment after `.env` is configured; this workspace did not have a complete installed dependency tree or your Firebase credentials.

## Parent portal screens

The parent portal includes a dashboard plus dedicated student profile, attendance, academic results, school fees, and account profile screens under `app/(parent)/`. Parent data is loaded for the authenticated Firebase UID and student records must be linked by an administrator. Attendance is read from `attendance/{studentId}/records`; results are read from `results/{studentId}/subjects`. The fees screen is a read-only overview of fee fields already stored on the student document; it does not process payments. Parent profile edits update the parent's own `users/{uid}` document only.
