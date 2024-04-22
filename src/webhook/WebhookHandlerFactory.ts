import {CleanStaleBranchOptions, WebhookOptions} from '../config';
import {BaseWebhookHandler} from './BaseWebhookHandler';
import {DiscordWebhookHandler} from './discord/DiscordWebhookHandler';
// import {SlackWebhookHandler} from './slack/SlackWebhookHandler';
import {WebhookType} from './WebhookType';

export function getWebhookHandler(
  webhookType: WebhookType,
  webhookOptions: WebhookOptions,
  cleanStaleBranchOptions: CleanStaleBranchOptions
): BaseWebhookHandler {
  switch (webhookType) {
    case WebhookType.DISCORD:
      return new DiscordWebhookHandler(webhookOptions, cleanStaleBranchOptions);
    // TODO: Support Slack
    // case WebhookType.SLACK:
    //   return new SlackWebhookHandler(webhookOptions, cleanStaleBranchOptions);
    default:
      throw new Error('Unsupported webhook type');
  }
}
