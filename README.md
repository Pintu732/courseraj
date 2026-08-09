# Courseraj V4 Ultimate — No-Code Admin Edition

This version is designed so that after deployment you do not need to edit code for normal website management.

Public visitors can browse only.
All website management is done from `admin.html` after Firebase login.

## Editable from Admin
- Add / edit / delete courses
- Selling and original price
- Creator
- Category
- Description
- Tags
- Ratings / badges
- Featured / Trending / Published
- Course order
- Course thumbnail: DIRECT COMPUTER UPLOAD
- Main Telegram link
- Per-course Telegram link
- Brand name
- Logo: DIRECT COMPUTER UPLOAD
- Hero background: DIRECT COMPUTER UPLOAD
- Favicon: DIRECT COMPUTER UPLOAD
- Accent color
- Hero text
- Announcement text
- Section headings
- Footer
- SEO title / description

## Why images work without Firebase Storage
Images are resized/compressed in the browser and stored as Firestore data strings.

This avoids Cloud Storage for Firebase, which currently requires the Blaze billing plan.

## Practical image limits
Course thumbnail target: about 180 KB compressed WebP.
Hero target: about 280 KB.
Logo target: about 110 KB.
Favicon target: about 55 KB.

Firestore documents have a 1 MiB maximum size, so the app compresses before saving.
