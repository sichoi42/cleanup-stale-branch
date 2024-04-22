import {WebClient} from '@slack/web-api';
import {BaseWebhookHandler} from '../BaseWebhookHandler';
import {BranchInfo} from '../../github/type';

export class SlackWebhookHandler extends BaseWebhookHandler {
  async sendMessages(
    staleBranches: BranchInfo[],
    deleteBranches: BranchInfo[]
  ): Promise<void> {
    // TODO: replace webhookUrl as API token
    const slackClient = new WebClient(this.webhookOptions.webhookUrl);

    const staleText = this.formatBranches(
      staleBranches,
      'Stale',
      this.cleanStaleBranchOptions.staleBranchMessage
    );
    const deleteText = this.formatBranches(
      deleteBranches,
      'Deleted',
      this.cleanStaleBranchOptions.deleteBranchMessage
    );

    await slackClient.chat.postMessage({
      // TODO: replace channelId with Slack channel ID
      channel: this.webhookOptions.webhookUrl,
      text: `Branch Update Notification\n${staleText}\n${deleteText}`,
      mrkdwn: true
    });
  }

  private formatBranches(
    branches: BranchInfo[],
    statusType: string,
    message: string
  ): string {
    if (branches.length === 0) {
      return `*No ${statusType.toLowerCase()} branches.*`;
    }
    let formattedText = `*${message}*\n`;
    branches.forEach(branch => {
      formattedText +=
        `> *${statusType} Branch*: ${branch.branchName}\n` +
        `> *Committer*: ${branch.committer.name}\n` +
        `> *Last Committed Date*: ${branch.committer.date}\n` +
        `> *View Branch*: <${branch.branchUrl}|Link>\n`;
    });
    return formattedText;
  }
}
