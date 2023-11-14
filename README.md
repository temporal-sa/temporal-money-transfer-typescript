## Temporal API and UI example
https://transfer.tmprl-demo.cloud/

### Run Temporal Server ([Guide](https://docs.temporal.io/kb/all-the-ways-to-run-a-cluster#temporal-cli))
- `brew install temporal`
- `temporal server start-dev` (Temporal Server web UI: localhost:8233)

### Install
- `cd server/`
- `npm install`

- `cd ui/`
- `npm install`

### Run Developer environment

#### Run workers
- Run a workflow and activity worker in separate terminals:
  - `cd server`
  - `npm run worker.workflow`
  - `npm run worker.activity`

#### Run API and Web UI (localhost:3000)
(from root directory)
- `nodemon /server/index.ts`

#### (Advanced) Debug/replay Workflow histories with the [Temporal VSCode Extension](https://marketplace.visualstudio.com/items?itemName=temporal-technologies.temporalio)
- Open /server as a VSCode project
- Run the replayer on a downloaded workflow JSON file

### Simulate a workflow error and recovery
- In `./server/temporal/workflows.ts`, uncomment the line `// throw new Error('Something went wrong');`
- Save the file, the workers will automatically restart with this change
- Start a new transfer using the Money Transfer Web UI
- View the workflow in the Temporal Server UI. You will see a "Workflow Task Failed" error
- (note: If you run this in VSCode, the Money Transfer Web UI will not update from here on)
- Re-comment the `throw new error` code
- The workers will automatically restart and the workflow will proceed where it left off (view it as `Completed` in the Temporal Server UI)

### Configuration (optional if using local Temporal dev server)
- `server/` contains `.env_example`. Copy it to `.env.development` and change settings to match your temporal installation.
- `STRIPE_SECRET_KEY` is optional (use if you want to run simulated charges against the Stripe API)
- `ui/` contains `.env_example`. Copy it to `.env.development` and change settings to point to your API (server) location (default is / which should be fine)
- The server respects .env.production if NODE_ENV is "production" (and the Svelte app is built using npm run build such as in the Dockerfile)

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
