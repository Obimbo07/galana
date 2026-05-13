export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatApiMessage {
  role: ChatMessageRole;
  content: string;
}

export interface ChatRequestBody {
  messages: ChatApiMessage[];
  /** Optional opaque id echoed in responses */
  sessionId?: string;
  /** Product IDs the user tapped in the widget; merged into prompt */
  selectedProductIds?: string[];
  /** Prefer streaming NDJSON (`application/x-ndjson`) vs JSON body */
  stream?: boolean;
}

export interface ChatErrorBody {
  ok: false;
  message: string;
}

export interface ChatDoneBody {
  message: string;
  sessionId?: string;
}

/** Optional structured hint for the on-page calculator (client applies if valid) */
export type SuggestedCalculatorType = "paving" | "pipes" | "roofing";

export interface SuggestedCalculatorPayload {
  type: SuggestedCalculatorType;
  /** Paving: length in metres */
  pavingLength?: string;
  pavingWidth?: string;
  /** Match `calculator.paving.blocksPerM2Options[].blocksPerM2` */
  pavingBlocksPerM2?: number;
  pavingWastagePercent?: number;
  /** Pipes: run length in metres */
  pipeLength?: string;
  /** Match `calculator.pipes.pipeTypes[].sectionM` */
  pipeSectionM?: number;
  pipeExtraPercent?: number;
  /** Roofing: plan area m² */
  roofArea?: string;
  /** Match `calculator.roofing.tileTypes[].tilesPerM2` */
  roofTilesPerM2?: number;
  roofWastagePercent?: number;
}

export interface SuggestedCalculatorEnvelope {
  suggestedCalculator?: SuggestedCalculatorPayload;
}
