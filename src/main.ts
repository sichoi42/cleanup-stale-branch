import * as core from '@actions/core';

import os from 'os';
import * as path from 'path';

async function _run(): Promise<void> {
  try {
    const args = _getAndValidateArgs();
  } catch (error) {
    core.setFailed(error.message);
  }
}

function _getAndValidateArgs(): string[] {
  const args = core.getInput('args');
  if (!args) {
    throw new Error('args input is required');
  }
  return args.split(' ');
}

void _run();
