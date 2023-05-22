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

### Docker


#### Server

cd server

docker build -t temporal-moneytransfer-server .

docker run -p 3000:3000 -e CERT_CONTENT="$(cat /Users/steveandroulakis/Documents/Code/temporal-client-cert/androulakis.pem)" -e KEY_CONTENT="$(cat /Users/steveandroulakis/Documents/Code/temporal-client-cert/androulakis.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e PORT=3000 -d --platform linux/amd64 temporal-moneytransfer-server

#### Workers

cd server

docker build -f temporal/Dockerfile -t temporal-moneytransfer-worker .

docker run -e CERT_CONTENT="$(cat /Users/steveandroulakis/Documents/Code/temporal-client-cert/androulakis.pem)" -e KEY_CONTENT="$(cat /Users/steveandroulakis/Documents/Code/temporal-client-cert/androulakis.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e WORKER_TYPE=workflow -d --platform linux/amd64 temporal-moneytransfer-worker

docker run -e CERT_CONTENT="$(cat /Users/steveandroulakis/Documents/Code/temporal-client-cert/androulakis.pem)" -e KEY_CONTENT="$(cat /Users/steveandroulakis/Documents/Code/temporal-client-cert/androulakis.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e WORKER_TYPE=activity -d --platform linux/amd64 temporal-moneytransfer-worker


docker logs -f d65ae99260a3


#### UI

cd ui

docker build -t temporal-moneytransfer-ui .

docker run -p 3001:3001 -e VITE_API_URL="http://localhost:3000" -e PORT=3001 -d --platform linux/amd64 temporal-moneytransfer-ui