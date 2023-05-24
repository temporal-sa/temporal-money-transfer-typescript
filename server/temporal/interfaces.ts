export interface WorkflowParameterObj {
    amountCents: number;
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