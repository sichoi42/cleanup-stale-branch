import {CleanStaleBranchOptions, WebhookOptions} from '../config';
import {BranchInfo} from '../github/type';
import {getWebhookHandler} from './WebhookHandlerFactory';

export async function sendMessage(
  cleanStaleBranchOptions: CleanStaleBranchOptions,
  webhookOptions: WebhookOptions,
  staleBranches: BranchInfo[],
  deleteBranches: BranchInfo[]
): Promise<void> {
  const webhookType = webhookOptions.webhookType;
  const webHookHandler = getWebhookHandler(
    webhookType,
    webhookOptions,
    cleanStaleBranchOptions
  );
  webHookHandler.sendMessages(staleBranches, deleteBranches);
}
