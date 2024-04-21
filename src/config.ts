import {WebhookType} from './webhook/WebhookType';

export interface ActionOptions {
  repoToken: string;
  cleanStaleBranchOptions: CleanStaleBranchOptions;
  webhookOptions?: WebhookOptions;
  dryRun: boolean;
}

export interface CleanStaleBranchOptions {
  daysBeforeStale: number; // Could not ne NaN
  daysBeforeDelete: number; // Could not be NaN
  ignoringBranches: string[]; // Can be empty
  ignoringBranchPattern: string; // Can be empty String
  staleBranchMessage: string; // Can be empty String
  deleteBranchMessage: string; // Can be empty String
  useWebhook: boolean;
}

export interface WebhookOptions {
  webhookUrl: string;
  webhookType: WebhookType;
}
