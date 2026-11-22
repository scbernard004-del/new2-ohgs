OHGS v45 — LOGO DISPLAY FIX

WHAT CHANGED
The header, footer and product-card logos are now vector graphics inside the page itself. Displaying the logo no longer requires a request for media/ohgs-header-pro-badge.svg, so a missing or failed separate image request cannot leave a broken logo.

The logo stays sharp on phones and desktops, has a white backing in both themes, and keeps the existing scroll-size animation. The OHGS wordmark continues to use the selected theme's readable text colour. All previous flyers, products, videos and Tanzania weekday artwork are preserved.

SMALL FIX FOR AN EXISTING v44 WEBSITE
1. Extract OHGS_V45_LOGO_FIX.zip.
2. Open the GitHub repository linked to the Vercel project showing the problem. Copy/upload ALL extracted patch files to the repository root and replace the existing files. Keep the current media and api folders. Commit and Push.
3. Let Vercel deploy the new commit. If using Redeploy, turn OFF Use existing Build Cache.
4. Open /version-check.txt on that project's actual website address. It must show v45-inline-logo.
5. Refresh Home, Products and Contact. Check the logo in light and dark modes, and after scrolling down. The logo itself requires no image download and works before JavaScript.

The patch is for the existing v44 installation; it does not contain the full photos/video collection. For a NEW empty repository use the COMPLETE OHGS_GITHUB_UPLOAD_READY.zip instead.

If v45-inline-logo is not shown, the old deployment or a different Vercel project is still serving that address. Open that project's Settings > Git to confirm its connected repository and production branch.
