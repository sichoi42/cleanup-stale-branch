import {CleanStaleBranchOptions, WebhookOptions} from '../config';
import {BranchInfo} from '../github/type';

export abstract class BaseWebhookHandler {
  protected webhookOptions: WebhookOptions;
  protected cleanStaleBranchOptions: CleanStaleBranchOptions;

  constructor(
    webhookOptions: WebhookOptions,
    cleanStaleBranchOptions: CleanStaleBranchOptions
  ) {
    this.webhookOptions = webhookOptions;
    this.cleanStaleBranchOptions = cleanStaleBranchOptions;
  }

  abstract sendMessages(
    staleBranches: BranchInfo[],
    deleteBranches: BranchInfo[]
  ): Promise<void>;
}
