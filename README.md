# How to run

Requires Node.js 20.9 or later and a Gemini API key.

## 1. Clone and install

```sh
git clone https://github.com/codyowl/safe-parenting.git
cd safe-parenting
npm ci
```

## 2. Configure the Gemini API key

### Get an API key

1. Open [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account and complete any first-time setup.
3. click **Create API key** and
   follow the prompts to select or create a Google Cloud project.

For additional help, see Google's
[API key setup guide](https://aistudio.google.com/docs/api-key).

### Configure the project

1. copy the .env.example file and rename it to ".env.local"
2. Add the Gemini API key we retrieved from "Get an API key" step, add the value to "GEMINI_API_KEY=" in the .env.local file.

### Verify the connection

After installing dependencies, run:

```sh
npm run check:gemini
```

A successful result reports that the connection test passed.

## 3. Start the app

```sh
npm run dev
```

Open http://127.0.0.1:3000 in your browser.
