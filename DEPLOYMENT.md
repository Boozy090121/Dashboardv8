# Deploying to Netlify

This document provides step-by-step instructions for deploying the Novo Nordisk Manufacturing Dashboard to Netlify.

## Prerequisites

1. A Netlify account
2. Git repository with the dashboard code
3. The three Excel data files:
   - Internal RFT.xlsx
   - External RFT.xlsx
   - Commercial Process.xlsx

## Deployment Steps

### Option 1: Deploy via Netlify UI

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select the repository containing the dashboard code
5. Configure build settings:
   - Build command: `node debug-preprocess.js && node generate-dashboard-data.js && CI=false TSC_COMPILE_ON_ERROR=true DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false react-scripts build`
   - Publish directory: `build`
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login to Netlify: `netlify login`
3. Initialize the site: `netlify init`
4. Follow the prompts to connect your repository
5. Deploy the site: `netlify deploy --prod`

## Environment Variables

The following environment variables need to be set in Netlify:

- `NODE_VERSION`: 18.17.0
- `NPM_VERSION`: 9.6.7

## Data Files

Ensure the Excel data files are included in the root directory of your repository:

1. Internal RFT.xlsx
2. External RFT.xlsx
3. Commercial Process.xlsx

These files will be processed during the build phase to generate the data for the dashboard.

## Handling Updates

When you need to update the Excel files:

1. Replace the Excel files in the repository
2. Commit and push the changes
3. Netlify will automatically trigger a new build and deploy the updated dashboard

## Troubleshooting

If the dashboard is not showing data after deployment:

1. Check the Netlify build logs for errors
2. Verify that the Excel files are present in the repository
3. Check that the data files were generated correctly:
   - Look for messages about successful data generation in the build logs
   - Check that `public/data/complete-data.json` and `public/complete-data.json` were created
4. Test the data loading locally before deploying 