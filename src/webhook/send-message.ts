import {CleanStaleBranchOptions, WebhookOptions} from '../config';
import {WebhookType} from './WebhookType';

export async function sendMessage(
  cleanStaleBranchOptions: CleanStaleBranchOptions,
  webhookOptions: WebhookOptions,
  staleBranches: string[],
  deleteBranches: string[]
): Promise<void> {
  const webhookUrl = webhookOptions.webhookUrl;
  const webhookType = webhookOptions.webhookType;
  const staleBranchMessage = cleanStaleBranchOptions.staleBranchMessage;
  const deleteBranchMessage = cleanStaleBranchOptions.deleteBranchMessage;

  const message = _createMessage(
    staleBranches,
    deleteBranches,
    staleBranchMessage,
    deleteBranchMessage
  );

  if (webhookType === WebhookType.DISCORD) {
    await _sendDiscordMessage(webhookUrl, message);
  } else if (webhookType === WebhookType.SLACK) {
    await _sendSlackMessage(webhookUrl, message);
  }
}

function _createMessage(
  staleBranches: string[],
  deleteBranches: string[],
  staleBranchMessage: string,
  deleteBranchMessage: string
): string {
  let message = 'Branch Status Report:\n\n';

  if (staleBranches.length > 0) {
    message += `${staleBranchMessage}\n`;
    staleBranches.forEach(branch => {
      message += ` - ${branch}\n`;
    });
    message += '\n';
  } else {
    message += 'No stale branches.\n\n';
  }

  if (deleteBranches.length > 0) {
    message += `${deleteBranchMessage}\n`;
    deleteBranches.forEach(branch => {
      message += ` - ${branch}\n`;
    });
    message += '\n';
  } else {
    message += 'No deleted branches.\n\n';
  }

  return message;
}

async function _sendDiscordMessage(
  webhookUrl: string,
  message: string
): Promise<void> {
  const payload = {
    content: message
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

async function _sendSlackMessage(
  webhookUrl: string,
  message: string
): Promise<void> {
  const payload = {
    text: message
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}
