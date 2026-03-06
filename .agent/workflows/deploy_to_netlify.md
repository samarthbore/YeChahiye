---
description: How to deploy the YeChahiye Next.js application to Netlify
---

# Deploying YeChahiye to Netlify

This guide outlines the steps to deploy your Next.js application to Netlify.

## Prerequisites
- Push your latest code to a GitHub repository.
- Ensure you have your Firebase configuration keys ready (from `.env.local`).

## Step-by-Step Guide

1. **Log in to Netlify**
   - Go to [Netlify.com](https://www.netlify.com/) and log in (preferably with GitHub).

2. **Add New Site**
   - Click **"Add new site"** > **"Import an existing project"**.
   - Select **GitHub**.
   - Authorize Netlify and select your `yechahiye-app` repository.

3. **Configure Build Settings**
   Netlify should automatically detect the Next.js settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (or leave default/empty)
   - **Base directory**: Leave empty (unless your app is in a subfolder, then specify that).

   > [!TIP]
   > Netlify usually installs the "Essential Next.js" plugin automatically. If prompted, allow it.

4. **Add Environment Variables (CRITICAL)**
   Before clicking deploy, look for the **"Environment variables"** button or go to "Site configuration" > "Environment variables" after creation.
   
   You MUST add the following keys from your `.env.local` file:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   
   *Without these, the login and database features will fail on the live site.*

5. **Deploy**
   - Click **"Deploy site"**.
   - Netlify will run the build (takes 1-2 minutes).
   - Once finished, you will get a live URL (e.g., `https://random-name.netlify.app`).

## Troubleshooting
- **Build Failures**: Check the "Deploy log". If it says "Missing dependency", ensure `package.json` is in the root or base dir is set correctly.
- **Runtime Errors**: If login fails, double-check your Environment Variables in Netlify to ensure no typos.

---

## Option 2: Manual Deployment (CLI) - No GitHub Required

If you prefer **not** to push your code to GitHub, you can deploy directly from your terminal using the Netlify CLI.

> [!NOTE]
> You cannot use "Drag and Drop" for this project because it is a Next.js App with dynamic features (server-side rendering). You MUST use the CLI.

### Steps

1.  **Install Netlify CLI** (or use npx)
    ```bash
    npm install -g netlify-cli
    # OR you can just use 'npx netlify' in commands below
    ```

2.  **Login to Netlify**
    ```bash
    netlify login
    ```
    This will open your browser to authenticate.

3.  **Initialize the Project**
    Run this in your project root (`c:\YeChahiye\yechahiye-app`):
    ```bash
    netlify init
    ```
    - Choose: "Create & configure a new site"
    - Team: Select your team
    - Site name: Give it a name or leave blank
    - **Build command**: `npm run build`
    - **Directory to deploy**: `.next`

4.  **Configure Environment Variables**
    Since you are not using GitHub, Netlify doesn't know your secrets. You can import them from your local file:
    ```bash
    netlify env:import .env.local
    ```
    *Alternatively, go to the Netlify Dashboard > Site Settings > Environment Variables and paste them manually.*

5.  **Build and Deploy**
    
    **Step A: Build locally**
    ```bash
    npm run build
    ```

    **Step B: Deploy to Draft (Preview)**
    ```bash
    netlify deploy
    ```
    - Publish directory: `.next` (or whatever it suggests, usually `.next`)
    
    **Step C: Deploy to Production**
    If the draft URL works, go live:
    ```bash
    netlify deploy --prod
    ```

### Summary of Commands
```bash
netlify login
netlify init
netlify env:import .env.local
npm run build
netlify deploy --prod
```
