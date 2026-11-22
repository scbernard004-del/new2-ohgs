OHGS v46 — RESTORE THE VIDEOS ON YOUR CURRENT VERCEL PROJECT
22 November 2026

WHAT WAS FOUND
The live Home page was v45-inline-logo. Opening its showroom MP4 link returned Vercel 404 NOT_FOUND:
https://new-ohgs.vercel.app/media/ohgs-nov26-arusha-showroom.mp4
Changing autoplay settings alone cannot play a file that is absent from the deployment.

WHAT IS INCLUDED
This repair includes all 22 video files and 11 poster images used by the website. The player starts visible videos muted, inline and repeating, and automatically tries the other video size if a source fails. It keeps only one automatic preview playing, loads media near the viewing area and preserves buffered playback when scrolling away and returning.

The build now checks for missing media, invalid headers and Git LFS pointers before publishing. The unindexed /deploy-test page can verify every deployed video and poster and name missing files.

SIMPLE UPLOAD STEPS
1. In Vercel open the project that owns new-ohgs.vercel.app. Go to Settings > Git and open the connected GitHub repository. Use that repository's production branch, normally main.
2. Download and extract OHGS_V46_VIDEO_REPAIR.zip. Open the extracted folder so index.html, package.json and media are visible.
3. In the repository root choose Add file > Upload files. Drag ALL extracted root files AND the media folder into the upload area. Keep the media folder structure. Do not upload the ZIP itself or place the files inside a new v46 folder.
4. Wait for all uploads. Confirm the list includes media/ohgs-nov26-arusha-showroom.mp4 and media/ohgs-nov26-arusha-showroom-mobile.mp4. Check the root build-static.mjs, verify-video-media.mjs and package.json are included too.
5. Keep "Commit directly to the main branch" if main is your production branch. Use this commit message: Restore OHGS video files and autoplay. Press Commit changes.
6. Wait for Vercel to deploy the new commit. Settings should be Framework Other, Root ./, Build Command npm run build, Output dist. If manually redeploying this update, disable Use existing Build Cache.
7. Open the website's /version-check.txt. Expect v46-video-recovery. Then open /deploy-test and press Check deployed files. Expect Videos and posters: 33 / 33 available; New flyer files: 10 / 10 available; all release values: v46-video-recovery.
8. Open Home. The main video should automatically play silently. Tap Sound on for audio. Test a video on Gallery as well.

IMPORTANT UPLOAD DETAILS
- Merge the repair media folder into the existing media folder. Keep your existing pictures, flyers, captions and other media.
- The repair ZIP is an update for the current OHGS site, not a complete new repository. For an empty repository use OHGS_GITHUB_UPLOAD_READY.zip instead.
- If dragging a folder through GitHub's website does not preserve its paths, use GitHub Desktop: clone the connected repository, copy the extracted files into that local repository, merge folders, Commit, then Push origin.
- If the build lists missing files, upload the real MP4s or WebP images with those exact names. A Git LFS text pointer or an HTML error page saved as .mp4 is not a video.
- Test the new production deployment, not an old deployment URL. Clearing the browser alone cannot fix a missing file.
- You do not need a new Vercel project or domain move for this repair.

Autoplay is muted. Device Data Saver, reduced motion and browser restrictions can require a tap to play; the visible Play button remains available.

The repair has been tested locally. It changes the live website only after you commit and deploy it. See VIDEO_RECOVERY_QA.txt for the exact verification scope.
