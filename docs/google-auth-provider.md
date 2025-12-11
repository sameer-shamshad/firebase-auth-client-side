/*
===========================================================

Firebase Auth - GoogleAuthProvider (Enabling Options Overview)

===========================================================

When enabling Google Sign-In inside Firebase Authentication,
you configure how Google OAuth works for your project.

This file explains each option in a simple, developer-friendly way.

-----------------------------------------------------------

1) Web SDK Configuration

-----------------------------------------------------------

Firebase generates a Google OAuth 2.0 Web Client ID for your project.

This ID is used internally by Firebase when using GoogleAuthProvider.

Usage:

- NO need to manually paste this ID when using:
    signInWithPopup()
    signInWithRedirect()
    GoogleAuthProvider()
- Firebase automatically injects it into the OAuth flow.

Purpose:

- Identifies your Firebase project to Google
- Ensures secure login
- Makes sure tokens received from Google match your project

-----------------------------------------------------------

2) Whitelist Client IDs from External Projects (Optional)

-----------------------------------------------------------

This is ONLY needed if other web apps OR other Google Cloud projects
need to authenticate users using YOUR Firebase Google login.

Examples when needed:

- Multiple frontend apps using one Firebase backend
- Dev / staging / production apps with different OAuth Client IDs
- Integrating Google One Tap across multiple domains
- Allowing OAuth from another Google Cloud project

Examples when NOT needed:

- You have only one frontend app
- You only use signInWithPopup() normally
- You do not have extra OAuth client IDs

What to add here:

- Add ANY additional Web OAuth Client IDs you want to ALLOW
to use your Firebase Google login.

-----------------------------------------------------------

3) Project Public Name

-----------------------------------------------------------

This is the name that appears on the Google OAuth consent screen.

Example display:
“<Your App Name> wants to access your Google account.”

Notes:

- This is visible to users during login.
- Should be clear and friendly.
- Does not affect functionality.

-----------------------------------------------------------

4) Support Email

-----------------------------------------------------------

This shows on the Google OAuth consent screen as the contact email.

Purpose:

- Google requires a visible support email for trust.
- Used for alerts or verification messages.

-----------------------------------------------------------

5) Authorized Domains

-----------------------------------------------------------

These are domains allowed to initiate Google login.

Firebase automatically adds:

- localhost (for local development)
- your Firebase hosting domain

You must manually add:

- Custom domain (yourapp.com)
- Vercel / Netlify deployment domains
- Staging environments
- Any additional origins using Google login

Without adding correct domains:
→ Google Sign-In will fail due to “origin not allowed” errors.

-----------------------------------------------------------

6) GoogleAuthProvider Optional Customizations

-----------------------------------------------------------

You may customize scopes and behavior of GoogleAuthProvider.

Examples:

Adding scopes:
provider.addScope("profile");
provider.addScope("email");
provider.addScope("<https://www.googleapis.com/auth/calendar.readonly>");

Forcing account selector popup:
provider.setCustomParameters({
  prompt: "select_account"
});

These are optional and used for advanced integration.

-----------------------------------------------------------

7) Session Persistence (Auto Login After Refresh)

-----------------------------------------------------------

Firebase automatically stores login session in the browser.

On page refresh:

- Firebase restores user session
- onAuthStateChanged() fires
- The user object is returned again, without re-login

No configuration required to enable this.

-----------------------------------------------------------

Summary
-----------------------------------------------------------

Enabling GoogleAuthProvider gives you:

- Web SDK Configuration
  Automatically used OAuth client for secure sign-in

- Whitelist External Client IDs (optional)
  Allows additional OAuth clients to use your Firebase login

- Project Public Name
  Displayed on Google consent screen

- Support Email
  Required by Google for trust/communication

- Authorized Domains
  MUST include all domains performing Google login

- Custom Scopes & Parameters (optional)
  Fine-tune GoogleAuthProvider behavior

- Auto Session Restore
  Firebase keeps users logged in across refreshes

===========================================================
End of GoogleAuthProvider Setup Documentation
===========================================================

*/
