import { WorkflowParameterObj } from './interfaces'

export interface ConfigObj {
    certPath: string,
    keyPath: string,
    certContent: string,
    keyContent: string,
    address: string,
    namespace: string
}

// function that returns a ConfigObj with input environment variables
export function getConfig(): ConfigObj {
    return {
        certPath: process.env.CERT_PATH || '',
        keyPath: process.env.KEY_PATH || '',
        certContent: process.env.CERT_CONTENT || '',
        keyContent: process.env.KEY_CONTENT || '',
        address: process.env.ADDRESS || 'localhost:7233',
        namespace: process.env.NAMESPACE || 'default'
    }
}



export function initWorkflowParameterObj(): WorkflowParameterObj {
    return {
      testarg: 'testarg'
    }
}

export const TASK_QUEUE_WORKFLOW = 'moneytransfer'
export const TASK_QUEUE_ACTIVITY = 'moneytransfer-activity'