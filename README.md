# Konfam

Konfam is a responsive prediction-markets web app for exploring markets, trading and tracking positions. Live account and market data are provided by a separately configured API.

## Features

- Browse markets and open individual market pages.
- Sign in and access portfolio, cash, watchlist, activity, and settings pages.
- Trade market and track portfolio.
- View wallet balances, notifications, and account actions.
- Use light or dark theme.
- Receive live market updates through an optional Socket.IO connection.
- Run with explicit demo placeholders for local UI exploration.

## Requirements

- Node.js and npm (use a current Node.js LTS release).
- Access to a compatible Konfam API for real data and authenticated features.
- Optional: a Google OAuth client ID if Google sign-in is enabled for your environment.
- Optional: a Socket.IO endpoint for live market updates.

## Getting started

```bash
git clone <repository-url>
cd konfam
npm ci
```

Start your backend in its own terminal using that project's setup instructions. Note the URL and port it listens on. Then create `.env.local` in this frontend's project root:

```dotenv
REACT_APP_API_URL=http://localhost:BACKEND_PORT
REACT_APP_SOCKET_URL=
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_DEMO=false
```

Replace `BACKEND_PORT` with the port reported by your backend, and include any API prefix it requires (for example, `/api`). Set the socket URL if your backend exposes Socket.IO. Leave the Google client ID empty if Google sign-in is not configured. `.env.local` is ignored by Git.

Start or restart the frontend after setting environment variables:

```bash
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

### Connecting to your backend

The frontend and backend run as separate applications. The frontend sends its HTTP requests to `REACT_APP_API_URL`; it does not start or proxy the backend for you.

1. Start the backend and confirm it is reachable at its local or deployed URL.
2. Set `REACT_APP_API_URL` in `.env.local` to the backend's base API URL. For example, if the backend listens on port `5000`, use `http://localhost:5000` (or `http://localhost:5000/api` if its routes are mounted under `/api`).
3. If the backend provides live updates, set `REACT_APP_SOCKET_URL` to its Socket.IO URL.
4. Configure the backend's CORS policy to allow the frontend origin, such as `http://localhost:3000`, and the request headers used by the app, including `Authorization` and `Content-Type`.
5. Restart `npm start` after changing `.env.local`; Create React App reads these values when it starts.

The backend must implement the API routes and response shapes used by this frontend, including authentication, markets, wallet, portfolio, and notifications. If a request fails, check the browser's Network tab and backend logs to confirm the request URL, response, and CORS configuration. For Google sign-in, configure the same frontend origin in the Google OAuth client and set `REACT_APP_GOOGLE_CLIENT_ID`.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `REACT_APP_API_URL` | For real API data | Backend base URL used for HTTP API requests, including any API path prefix. |
| `REACT_APP_SOCKET_URL` | No | Socket.IO server URL for live market updates. |
| `REACT_APP_GOOGLE_CLIENT_ID` | Only for Google sign-in | Google OAuth client ID configured for the app's origin. |
| `REACT_APP_DEMO` | No | Set to `true` to enable placeholder data and the demo price ticker. Defaults to `false`. |

`REACT_APP_*` values are compiled into the browser bundle and are visible to users. Do not put private keys, passwords, or other secrets in these variables. Configure any server-side secrets on the API server, not in this frontend.

Demo mode is intended for UI exploration, not as a substitute for the API: the app still attempts its normal HTTP requests, and authenticated features require a compatible backend.

