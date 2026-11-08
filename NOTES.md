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
- Saves on this computer only for now.

## Maybe Later

- Add categories and filters for a scrollable idea library.
- Add an export button for the competition entry.
- Add a real database after testing the first version with students.

## What’s next

- Try the main flow with a few safe interests and improve the wording based on feedback.

OpenAI model with “luna” in its name: `gpt-5.6-luna`
