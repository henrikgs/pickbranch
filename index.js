#!/usr/bin/env node

const inquirer = require('inquirer');
const inquirerAutocompletePrompt = require('inquirer-autocomplete-prompt');
const { exec } = require('child_process');

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

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
    .map(branch => branch.trim())
    .filter(Boolean)
    .map((branch, index) => ({ name: branch, index }));
}

async function search(branches, input) {
  if (!input) {
    return branches;
  } else {
    try {
      const regex = new RegExp(input);
      return branches.filter(({ name }) => regex.test(name.replace('* ', '')));
    } catch (error) {
      return branches.filter(({ name }) => name.includes(input));
    }
  }
}

async function main() {
  try {
    const branches = await getBranches();

    const answers = await inquirer.prompt([
      {
        name: 'branch',
        type: 'autocomplete',
        message: 'Pick a branch',
        source: async (_, input) => {
          const result = await search(branches, input);
          return result.map(({ index, name }) => `${index} ${name}`);
        }
      }
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
    await main();
  }
}

run();
