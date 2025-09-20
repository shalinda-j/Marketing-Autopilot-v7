# How to Create a GitHub Release with the Windows Installer

## Prerequisites
- You need to have write access to the repository
- You should be logged into your GitHub account

## Steps to Create a Release

1. **Navigate to the GitHub repository**
   - Go to: https://github.com/shalinda-j/Marketing-Autopilot-v7

2. **Go to Releases section**
   - Click on the "Releases" tab on the right side of the repository page
   - Or go directly to: https://github.com/shalinda-j/Marketing-Autopilot-v7/releases

3. **Create a new release**
   - Click the "Draft a new release" button

4. **Fill in release information**
   - **Tag version**: v7.0.0
   - **Release title**: Marketing Autopilot v7.0.0
   - **Description**: Copy and paste the content from RELEASE-NOTES.md

5. **Attach the binary file**
   - Click "Attach binaries by dropping them here or selecting them"
   - Select the file: `dist_electron/Marketing-Autopilot-v7-Windows-Setup.exe`

6. **Publish the release**
   - Click "Publish release"

## Alternative: Using GitHub CLI (if installed later)

If you install the GitHub CLI in the future, you can create a release with this command:

```bash
gh release create v7.0.0 dist_electron/Marketing-Autopilot-v7-Windows-Setup.exe -t "Marketing Autopilot v7.0.0" -n "$(cat RELEASE-NOTES.md)"
```

## Release Assets

The release should include:
1. The Windows installer (.exe file)
2. Release notes
3. Checksums for verification

## Post-Release

After creating the release:
1. Verify that the release appears on the releases page
2. Test downloading the installer from the release page
3. Verify the checksums match