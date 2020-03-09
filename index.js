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
    .filter(Boolean);
}

async function search(branches, input) {
  if (!input) {
    return branches;
  } else {
    return branches.filter(branch => branch.indexOf(input) > -1);
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
        source: (_, input) => search(branches, input)
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

main();
