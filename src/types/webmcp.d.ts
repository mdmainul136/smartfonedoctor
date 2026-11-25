import type * as React from "react";

export interface WebMcpToolSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
  items?: Record<string, unknown>;
}

export interface WebMcpInputSchema {
  type: "object";
  properties: Record<string, WebMcpToolSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: WebMcpInputSchema;
  outputSchema?: WebMcpInputSchema;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

export interface ModelContextApi {
  registerTool: (tool: WebMcpToolDefinition) => void | Promise<void>;
  unregisterTool?: (name: string) => void | Promise<void>;
}

declare global {
  interface Navigator {
    readonly modelContext?: ModelContextApi;
  }

  interface Document {
    readonly modelContext?: ModelContextApi;
  }
}

declare module "react" {
  interface FormHTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
  }

  interface InputHTMLAttributes<T> {
    toolparamtitle?: string;
    toolparamdescription?: string;
  }

  interface TextareaHTMLAttributes<T> {
    toolparamtitle?: string;
    toolparamdescription?: string;
  }

  interface SelectHTMLAttributes<T> {
    toolparamtitle?: string;
    toolparamdescription?: string;
  }
}
