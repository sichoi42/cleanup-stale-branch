import {EmbedBuilder} from 'discord.js';
import {BranchInfo} from '../../github/type';

const DEFAULT_STALE_BRANCH_COLOR = 0xffff00; // Yellow color for stale branches
const DEFAULT_STAALE_BRANCH_TITLE = 'Stale Branches Report';

const DEFAULT_DELETE_BRANCH_COLOR = 0xff0000; // Red color for delete branches
const DEFAULT_DELETE_BRANCH_TITLE = 'Delete Branches Report';

export function createStaleBranchesEmbed(
  staleBranches: BranchInfo[],
  staleBranchMessage: string
) {
  const embed = new EmbedBuilder()
    .setColor(DEFAULT_STALE_BRANCH_COLOR)
    .setTitle(DEFAULT_STAALE_BRANCH_TITLE)
    .setDescription(staleBranchMessage)
    .setTimestamp();

  if (staleBranches.length > 0) {
    staleBranches.forEach(branch => {
      embed.addFields({
        name: `Stale Branch - ${branch.branchName}`,
        value: `Committer: ${branch.committer.name}\nLast Committed Date: ${branch.committer.date}\n[View Branch](${branch.branchUrl})`,
        inline: false
      });
    });
  } else {
    embed.addFields({
      name: 'No stale branches',
      value: '\u200B',
      inline: false
    });
  }

  return embed;
}

export function createDeleteBranchesEmbed(
  deleteBranches: BranchInfo[],
  deleteBranchMessage: string
) {
  const embed = new EmbedBuilder()
    .setColor(DEFAULT_DELETE_BRANCH_COLOR)
    .setTitle(DEFAULT_DELETE_BRANCH_TITLE)
    .setDescription(deleteBranchMessage)
    .setTimestamp();

  if (deleteBranches.length > 0) {
    deleteBranches.forEach(branch => {
      embed.addFields({
        name: `Delete Branch - ${branch.branchName}`,
        value: `Committer: ${branch.committer.name}\nLast Committed Date: ${branch.committer.date}\n[View Branch](${branch.branchUrl})`,
        inline: false
      });
    });
  } else {
    embed.addFields({
      name: 'No branches to delete',
      value: '\u200B',
      inline: false
    });
  }

  return embed;
}
