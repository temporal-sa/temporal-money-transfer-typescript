import { startDebugReplayer } from "@temporalio/worker"

startDebugReplayer({
  workflowsPath: require.resolve("./temporal/workflows"),
})