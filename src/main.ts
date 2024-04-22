import * as core from '@actions/core';
import {context, getOctokit} from '@actions/github';
import {ActionOptions} from './config';
import {WebhookType} from './webhook/WebhookType';
import {sendMessage} from './webhook/send-message';

async function _run(): Promise<void> {
  try {
    const args = _getAndValidateArgs();

    //   curl -L \
    // -H "Accept: application/vnd.github+json" \
    // -H "Authorization: Bearer <YOUR-TOKEN>" \
    // -H "X-GitHub-Api-Version: 2022-11-28" \
    // https://api.github.com/repos/OWNER/REPO/branches

    const octokit = getOctokit(args.repoToken);
    const client = octokit.rest;

    const listBranches = await client.repos.listBranches({
      ...context.repo
    });

    const ignoringBranchPatternRegex = new RegExp(
      args.cleanStaleBranchOptions.ignoringBranchPattern
    );

    const filteredBranches = listBranches.data.filter(branch => {
      if (
        args.cleanStaleBranchOptions.ignoringBranches.includes(branch.name) ||
        (args.cleanStaleBranchOptions.ignoringBranchPattern &&
          ignoringBranchPatternRegex.test(branch.name)) ||
        branch.protected
      ) {
        core.info(
          `Branch "${branch.name}" is protected or matches the delete pattern. Skipping...`
        );
        return false;
      }
      return true;
    });

    const staleBranches: string[] = [];
    const deleteBranches: string[] = [];

    const currentDate = new Date();
    const staleDate = new Date(currentDate);
    staleDate.setDate(
      staleDate.getDate() - args.cleanStaleBranchOptions.daysBeforeStale
    );

    const deleteDate = new Date(currentDate);
    deleteDate.setDate(
      deleteDate.getDate() - args.cleanStaleBranchOptions.daysBeforeDelete
    );

    for (const branch of filteredBranches) {
      const branchInfo = await client.repos.getBranch({
        ...context.repo,
        branch: branch.name
      });

      const commitDateStr = branchInfo.data.commit.commit.committer?.date;
      if (commitDateStr !== undefined) {
        const branchDate = new Date(commitDateStr);
        if (branchDate < staleDate) {
          staleBranches.push(branch.name);
        }
        if (branchDate < deleteDate) {
          deleteBranches.push(branch.name);
        }
      }
    }

    core.info(`Staled branches: ${staleBranches.join(', ')}`);
    core.info(`Will be deleted branches: ${deleteBranches.join(', ')}`);

    if (!args.dryRun) {
      for (const branch of deleteBranches) {
        await client.git.deleteRef({
          ...context.repo,
          ref: `heads/${branch}`
        });
        core.info(`Branch ${branch} deleted.`);
      }
    } else {
      core.info('Dry run enabled. Branches will not actually be deleted.');
    }

    core.setOutput('staled-branches', staleBranches.join(', '));
    core.setOutput('deleted-branches', deleteBranches.join(', '));

    if (args.cleanStaleBranchOptions.useWebhook) {
      if (staleBranches.length > 0 || deleteBranches.length > 0) {
        const webhookOptions = args.webhookOptions;
        if (webhookOptions) {
          await sendMessage(
            args.cleanStaleBranchOptions,
            webhookOptions,
            staleBranches,
            deleteBranches
          );
          core.info('Webhook message sent.');
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

function _getAndValidateArgs(): ActionOptions {
  const args: ActionOptions = {
    repoToken: core.getInput('repo-token'),
    cleanStaleBranchOptions: {
      daysBeforeStale: parseFloat(
        core.getInput('days-before-stale', {required: true})
      ),
      daysBeforeDelete: parseFloat(
        core.getInput('days-before-delete', {required: true})
      ),
      ignoringBranches: core
        .getInput('ignoring-branches')
        .split(',')
        .map(branch => branch.trim()),
      ignoringBranchPattern: core.getInput('ignore-branches-pattern'),
      staleBranchMessage: core.getInput('stale-branch-message'),
      deleteBranchMessage: core.getInput('delete-branch-message'),
      useWebhook: core.getInput('use-webhook') === 'true'
    },
    dryRun: core.getInput('dry-run') === 'true'
  };

  for (const numberInput of ['days-before-stale']) {
    if (isNaN(parseFloat(core.getInput(numberInput)))) {
      const errorMessage = `Option "${numberInput}" did not parse to a valid float`;
      core.setFailed(errorMessage);
      throw new Error(errorMessage);
    }
  }

  for (const numberInput of ['days-before-delete']) {
    if (isNaN(parseFloat(core.getInput(numberInput)))) {
      const errorMessage = `Option "${numberInput}" did not parse to a valid float`;
      core.setFailed(errorMessage);
      throw new Error(errorMessage);
    }
  }

  if (args.cleanStaleBranchOptions.useWebhook) {
    args.webhookOptions = {
      webhookUrl: core.getInput('webhook-url'),
      webhookType: core.getInput('webhook-type') as WebhookType
    };
  }

  return args;
}

void _run();
