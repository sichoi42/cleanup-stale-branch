import * as core from '@actions/core';
import {context, getOctokit} from '@actions/github';
import {ActionOptions} from './config';
import {WebhookType} from './webhook/WebhookType';
import {sendMessage} from './webhook/send-message';

async function _run(): Promise<void> {
  try {
    const args = _getAndValidateArgs();
    const octokit = getOctokit(args.repoToken);
    const client = octokit.rest;

    const listBranches = await client.repos.listBranches({
      ...context.repo
    });
    core.info(`Fetched ${listBranches.data.length} branches`);

    const ignoringBranchPatternRegex = new RegExp(
      args.cleanStaleBranchOptions.ignoringBranchPattern
    );
    const filteredBranches = listBranches.data.filter(branch => {
      const isIgnored =
        args.cleanStaleBranchOptions.ignoringBranches.includes(branch.name) ||
        (args.cleanStaleBranchOptions.ignoringBranchPattern &&
          ignoringBranchPatternRegex.test(branch.name)) ||
        branch.protected;

      if (isIgnored) {
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

      if (branchInfo.data.commit.commit.committer) {
        const commitDateStr = branchInfo.data.commit.commit.committer.date;
        if (commitDateStr) {
          const branchDate = new Date(commitDateStr);
          if (!branch.protected && branchDate < deleteDate) {
            deleteBranches.push(branch.name);
          }
          if (!deleteBranches.includes(branch.name) && branchDate < staleDate) {
            staleBranches.push(branch.name);
          }
        }
      } else {
        core.info(
          `No committer information available for branch ${branch.name}`
        );
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

    if (args.cleanStaleBranchOptions.useWebhook && args.webhookOptions) {
      core.info(`Webhook URL: ${args.webhookOptions.webhookUrl}`);
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
    core.error(`Error: ${error.message}`);
    core.error(`Stack Trace: ${error.stack}`);
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
      webhookUrl: core.getInput('webhook-url', {required: true}),
      webhookType: core.getInput('webhook-type', {
        required: true
      }) as WebhookType
    };
  }

  return args;
}

void _run();
