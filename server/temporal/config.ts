import { ExecutionScenarioObj, WorkflowParameterObj } from './interfaces'

export interface ConfigObj {
    certPath: string,
    keyPath: string,
    certContent: string,
    keyContent: string,
    address: string,
    namespace: string,
    stripeSecretKey: string,
    prometheusAddress: string
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
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        prometheusAddress: process.env.PROMETHEUS_ADDRESS || '',
    }
}

// function to print ConfigObj
export function printConfig(config: ConfigObj): void {
    console.log(`ConfigObj: {
        certPath: ${config.certPath},
        keyPath: ${config.keyPath},
        certContent: ${config.certContent},
        keyContent: ${config.keyContent},
        address: ${config.address},
        namespace: ${config.namespace},
        stripeSecretKey: ${config.stripeSecretKey},
        prometheusAddress: ${config.prometheusAddress},
    }`);
}

export function initWorkflowParameterObj(): WorkflowParameterObj {
    return {
        amountCents: 0,
        scenario: ExecutionScenarioObj.HAPPY_PATH // Default value, can be changed
    }
}

export const TASK_QUEUE_WORKFLOW = 'moneytransfer-23-11'
export const TASK_QUEUE_ACTIVITY = 'moneytransfer-23-11'