## Temporal API and UI example
https://transfer.tmprl-demo.cloud/

### Run Temporal Server ([Guide](https://docs.temporal.io/kb/all-the-ways-to-run-a-cluster#temporal-cli))
- `brew install temporal`
- `temporal server start-dev` (localhost:8233)

### Install
- `cd server/`
- `npm install`

- `cd ui/`
- `npm install`

### Run Developer environment

Run workers
- Run a workflow and activity worker in separate terminals:
  - `cd server`
  - `npm run worker.workflow`
  - `npm run worker.activity`

Run API and Web UI (localhost:3000)
- Requires nodemon and ts-node installed
- Open VSCode: `Run -> Start Debugging`

### Configuration (optional if using local Temporal dev server)
- `server/` contains `.env_example`. Copy it to `.env.development` and change settings to match your temporal installation.
- `ui/` contains `.env_example`. Copy it to `.env.development` and change settings to point to your API (server) location (default is / which should be fine)
- The server respects .env.production if NODE_ENV is "production" (and the Svelte app is built using npm run build such as in the Dockerfile)

## Production Deployment

### Docker


#### Server and UI

`cd server`

`docker build -t temporal-moneytransfer-server .`


`docker run -p 3000:3000 -e CERT_CONTENT="$(cat /path/to/cert.pem)" -e KEY_CONTENT="$(cat /path/to/cert.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e PORT=3000 -d -e VITE_API_URL="" --platform linux/amd64 temporal-moneytransfer-server`

#### Workers

`cd server`

docker build -f temporal/Dockerfile -t temporal-moneytransfer-worker .

`docker run -e CERT_CONTENT="$(cat /path/to/cert.pem)" -e KEY_CONTENT="$(cat /path/to/cert.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e WORKER_TYPE=workflow -d --platform linux/amd64 temporal-moneytransfer-worker`

`docker run -e CERT_CONTENT="$(cat /path/to/cert.pem)" -e KEY_CONTENT="$(cat /path/to/cert.key)" -e ADDRESS="steveandroulakis-test-1.sdvdw.tmprl.cloud:7233" -e NAMESPACE="steveandroulakis-test-1.sdvdw" -e WORKER_TYPE=activity -d --platform linux/amd64 temporal-moneytransfer-worker`


docker logs -f d65ae99260a3


# Kubernetes

Create the secrets first from your keys
```
kubectl create secret generic temporal-EXAMPLE-tls \
    --from-file=tls.crt=/path/to/your/tls.crt \
    --from-file=tls.key=/path/to/your/tls.key
```

For stripe API key

```
kubectl create secret generic stripe-secret-key \
--from-literal=ADDRESS=sk_test_51NBOLuK...ToFliz
```

- Edit the yaml files to ensure your environment variables are correct (e.g. namespace and address).

```
cd yaml/
kubectl apply -f deployments/server-deployment.yaml
kubectl apply -f services/server-service.yaml
kubectl apply -f certificates/certificate.yaml
kubectl apply -f ingress/server-ingress.yaml
```

If you want workers
```
kubectl apply -f deployments/worker-deployment.yaml
```



### (rough notes to self on things to improve)

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
- Fix ugly code, write tests
```
