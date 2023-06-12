import { WorkflowParameterObj } from './interfaces'

export interface ConfigObj {
    certPath: string,
    keyPath: string,
    certContent: string,
    keyContent: string,
    address: string,
    namespace: string,
    stripeSecretKey: string
}

// function that returns a ConfigObj with input environment variables
export function getConfig(): ConfigObj {
    return {
        certPath: process.env.CERT_PATH || '',
        keyPath: process.env.KEY_PATH || '',
        certContent: process.env.CERT_CONTENT || '',
        keyContent: process.env.KEY_CONTENT || '',
        address: process.env.ADDRESS || 'localhost:7233',
        namespace: process.env.NAMESPACE || 'default',
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || ''
    }
}



export function initWorkflowParameterObj(): WorkflowParameterObj {
    return {
      amountCents: 0
    }
}

export const TASK_QUEUE_WORKFLOW = 'moneytransfer-codec'
export const TASK_QUEUE_ACTIVITY = 'moneytransfer-activity-codec'