## Temporal API and UI example

### Install
- `cd server/`
- `npm install`

- `cd ui/`
- `npm install`

### Developer environment
- Requires nodemon and ts-node installed
- Open VSCode and hit 'start debugging' on the 'Launch' configuration
- For Temporal workers `npm run worker.workflow` and `npm run worker.activity`

### Configuration
- `server/` contains `.env_example`. Copy it to `.env` and change settings to match your temporal installation.
- `ui/` contains `.env_example`. Copy it to `.env` and change settings to point to your API (server) location