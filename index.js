#!/usr/bin/env node

const inquirer = require('inquirer');
const inquirerAutocompletePrompt = require('inquirer-autocomplete-prompt');
const { exec } = require('child_process');
const readline = require('readline');

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

function exitOnEscapeListener() {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (_, key) => {
    if ((key || {}).name === 'escape') {
      process.exit(0);
    }
  });
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        reject(error.message);
      } else {
        resolve(stdout);
      }
    });
  });
}

function setBranch(branchName) {
  return execPromise(`git checkout ${branchName}`);
}

async function getBranches() {
  const branches = await execPromise('git branch --sort=-committerdate');

  return branches
    .split('\n')
    .map((branch) => branch.trim())
    .filter(Boolean);
}

async function search(branches, input) {
  if (!input) {
    return branches;
  } else {
    try {
      const regex = new RegExp(input);
      return branches.filter((branch) => regex.test(branch.replace('* ', '')));
    } catch (error) {
      return branches.filter((branch) => branch.includes(input));
    }
  }
}

async function main(lastArg) {
  try {
    const branches = await getBranches();

    if (branches.includes(lastArg)) {
      await setBranch(lastArg);
      process.exit(0);
    }

    const answers = await inquirer.prompt([
      {
        name: 'branch',
        type: 'autocomplete',
        message: 'Pick a branch',
        source: (_, input) => search(branches, input),
      },
    ]);

    // current branch starts with "* ", no need to checkout
    if (!answers.branch.startsWith('* ')) {
      await setBranch(answers.branch);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function hasArgs(...args) {
  for (const arg of process.argv) {
    if (args.includes(arg)) {
      return true;
    }
  }
  return false;
}

const helpText = `
  Run pickbranch in any git repository.
  Use arrow keys to pick a branch or search for branch name.
  Esc key to exit.

  Options:

    -h, --help      output this help
    -v, --version   output the version number
`;

async function run() {
  if (hasArgs('--version', '-v')) {
    console.log(require('./package.json').version);
  } else if (hasArgs('--help', '-h')) {
    console.log(helpText);
  } else {
    exitOnEscapeListener();
    const lastArg = process.argv[process.argv.length - 1];
    await main(lastArg);
  }
}

run();
