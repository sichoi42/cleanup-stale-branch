# Cleaning up Stale Branches

## Overview
**Cleaning up Stale Branches** is a GitHub Action designed by Siwon Choi to automatically identify and clean up stale branches in your repository. This action ensures your repository remains tidy by removing outdated branches that are no longer needed.

## How It Works
The action runs on a Node.js environment and executes according to the configurations defined in the `action.yml` file.

## Options

| Option                  | Required | Default                      | Description |
|-------------------------|----------|------------------------------|-------------|
| `repo-token`            | No       | `${{ github.token }}`        | Token for the repository. Use `${{ secrets.GITHUB_TOKEN }}` to pass this securely. |
| `days-before-stale`     | No       | `30`                         | The number of days a branch must be inactive before it is considered stale. |
| `days-before-delete`    | No       | `7`                          | The number of days a stale branch will remain before it is considered for deletion. |
| `ignoring-branches`     | No       | `["main", "master"]`         | A comma-separated list of branches that should be ignored. |
| `ignore-branches-pattern` | No    | `""`                        | A pattern for branches that should be ignored. |
| `stale-branch-message`  | No       | "This branch is considered stale and will be deleted soon." | The message posted on the webhook when a branch is considered stale. |
| `delete-branch-message` | No       | "This branch was deleted because it was stale." | The message posted on the webhook when a branch is deleted. |
| `dry-run`               | No       | `false`                      | If true, the action will only log the branches that would be deleted, without actually deleting them. |
| `use-webhook`           | No       | `false`                      | If true, sends a message to a webhook when branches are considered for deletion or actually deleted. |
| `webhook-url`           | No       | `""`                         | The webhook URL to send messages about branch deletions. Use `${{ secrets.WEBHOOK_URL }}` for security. |
| `webhook-type`          | No       | "discord"                    | The type of webhook to use, e.g., `discord` or `slack`. |

## Outputs

- **staled-branches:** Lists branches that were marked as stale.
- **deleted-branches:** Lists branches that were deleted.

## Branding

- **Icon:** trash
- **Color:** red

This action uses a Node.js environment and expects the main logic to be in `dist/index.js`. It is recommended to review the provided configuration options to tailor the action according to your needs.

For more information on GitHub Actions and usage of secrets, please refer to the GitHub documentation.
