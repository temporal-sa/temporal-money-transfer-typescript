## Temporal API and UI example
http://server3000-9237260.us-east-2.elb.amazonaws.com/
(AWS ECS)

- TODO, coherent instructions!

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

`cd server`

`docker build -t temporal-moneytransfer-server .`

`docker run -p 3000:3000 -e CERT_CONTENT="$(cat /path/to/cert.pem)" -e KEY_CONTENT="$(cat /path/to/cert.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e PORT=3000 -d --platform linux/amd64 temporal-moneytransfer-server`

#### Workers

`cd server`

docker build -f temporal/Dockerfile -t temporal-moneytransfer-worker .

`docker run -e CERT_CONTENT="$(cat /path/to/cert.pem)" -e KEY_CONTENT="$(cat /path/to/cert.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e WORKER_TYPE=workflow -d --platform linux/amd64 temporal-moneytransfer-worker`

`docker run -e CERT_CONTENT="$(cat /path/to/cert.pem)" -e KEY_CONTENT="$(cat /path/to/cert.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e WORKER_TYPE=activity -d --platform linux/amd64 temporal-moneytransfer-worker`


docker logs -f d65ae99260a3


#### UI

`cd ui`

`docker build -t temporal-moneytransfer-ui .`

`docker run -p 3001:3001 -e VITE_API_URL="http://localhost:3000" -e PORT=3001 -d --platform linux/amd64 temporal-moneytransfer-ui`



### rough notes to self on things to improve

```
DONE:
- Svelte UI
- Express API
- Simple money transfer workflow
- The UI updates based on workflow state (via API->queries)
- Uses Temporal Cloud
- Separation of concerns: Docker images for Express API, Svelte UI, Temporal Worker
- Currently hosted on AWS ECS, load balanced
- Dev environment easily launchable using VSCode

TODO:
- Make workflow and use case more sophisticated
	- Expose settings to simulate the unreliability of APIs
	- Ways to simulate failures
- Common API schema (protobuf or similar)
- CICD pipelines and IaC (Terraform?) for easy redeployability
- Make more portable by improving setup config
- Kubernetes instead of ECS?
- Fix ugly code, write tests
```
