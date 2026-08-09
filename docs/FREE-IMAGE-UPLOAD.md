# Direct Image Upload Without Paid Firebase Storage

Cloud Storage for Firebase requires the Blaze plan as of February 3, 2026.

To keep this project on the no-cost Firestore setup, Courseraj V4 uses:
1. Computer image selection in Admin
2. Browser resize
3. WebP compression
4. Firestore save as a data URL

This works well for a small/medium course catalog, but it is not the ideal architecture for a very high-traffic media-heavy site.

If the site grows substantially later, move images to a dedicated object-storage/CDN service.
