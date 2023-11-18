export enum ExecutionScenarioObj {
    HAPPY_PATH = "HAPPY_PATH",
    HUMAN_IN_LOOP = "HUMAN_IN_LOOP",
    API_DOWNTIME = "API_DOWNTIME",
    BUG_IN_WORKFLOW = "BUG_IN_WORKFLOW",
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
}

export interface WorkflowParameterObj {
    amountCents: number;
    scenario: ExecutionScenarioObj;
}

export interface ResultObj {
    stripeChargeResponse: StripeChargeResponse;
}

export interface StateObj {
    progressPercentage: number;
    transferState: string;
    workflowStatus?: string;
}

export type StripeChargeResponse = {
    chargeId: string;
}  