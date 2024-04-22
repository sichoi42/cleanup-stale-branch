import {BranchInfo} from '../../github/type';
import {BaseWebhookHandler} from '../BaseWebhookHandler';
import {createStaleBranchesEmbed, createDeleteBranchesEmbed} from './message';
import {WebhookClient} from 'discord.js';

export class DiscordWebhookHandler extends BaseWebhookHandler {
  async sendMessages(
    staleBranches: BranchInfo[],
    deleteBranches: BranchInfo[]
  ): Promise<void> {
    const webhookClient = new WebhookClient({
      url: this.webhookOptions.webhookUrl
    });
    const staleMessage = createStaleBranchesEmbed(
      staleBranches,
      this.cleanStaleBranchOptions.staleBranchMessage
    );
    const deleteMessage = createDeleteBranchesEmbed(
      deleteBranches,
      this.cleanStaleBranchOptions.deleteBranchMessage
    );

    await webhookClient.send({
      embeds: [staleMessage, deleteMessage]
    });
  }
}
