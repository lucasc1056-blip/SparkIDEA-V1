## How to run

1. Put your OpenAI key in `.env`.
2. Run `npm install` once.
3. Run `npm start`.
4. Open http://localhost:3000 in a browser.

## What’s done

- Version 1 has one clear flow: enter an interest, press Generate Idea, and see one AI-generated project idea.
- The page shows the safety warning, disables the button while it says “Thinking…”, and gives a friendly key/internet error.
- The server reads the key only from `.env`; the browser never receives it.
- The app sends the full `BRIEF.md` as the AI’s instructions with each request and uses model `gpt-5.6-luna`.
- A few made-up sample prompts are available, and saved ideas use browser `localStorage`.
- The form now lets students choose Computer project or Physical project, and sends that choice to the AI.
- The form now lets students list materials they have, alone or alongside an interest, and the AI uses them in the project idea.
- Generated ideas now show a clear building-blocks list and 4-6 numbered steps.
- AI instructions now keep responses on project ideation and refuse unsafe requests with safe alternatives.
- Saves on this computer only for now.
- Vercel support is ready: the static page stays in `public/`, and `/api/generate` is a Vercel serverless function.
- Online deployments read `OPENAI_API_KEY` from Vercel’s environment variables; the browser never receives it.
- MVP verified locally: entering a subject such as `space` and choosing a project type returns an AI-generated project idea.

## Maybe Later

- Add categories and filters for a scrollable idea library.
- Add an export button for the competition entry.
- Add a real database after testing the first version with students.

## What’s next

- Try the main flow with a few safe interests and improve the wording based on feedback.

## Put it online with Vercel

1. Import the GitHub repository `lucasc1056-blip/SparkIDEA-V1` into Vercel.
2. Leave the project settings at their defaults. Vercel serves the app from `public/` and runs `api/generate.js` at `/api/generate`.
3. In Vercel Project Settings → Environment Variables, add `OPENAI_API_KEY` with the OpenAI API key as its value. Add it for Production (and Preview if desired). Do not upload `.env`.
4. Deploy or redeploy. The frontend continues to save ideas in the browser’s `localStorage`; there is no database yet.

For local development, keep using `.env` and `npm start`. The local server still serves the page and uses the same `src/openai.js` helper.

OpenAI model with “luna” in its name: `gpt-5.6-luna`
