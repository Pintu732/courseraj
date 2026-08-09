# Security

Firebase Authentication protects admin login.
Firestore Rules protect database writes.

The browser-side admin email check is only user-interface control.
The important enforcement is `firestore.rules`.

Never publish rules such as:
allow read, write: if true;

Never put your Firebase password in repository files.
The Firebase web configuration is client configuration; database permissions must be enforced with Firestore Rules.
