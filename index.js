#!/usr/bin/env node

const inquirer = require("inquirer");
const { exec } = require("child_process");

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
  const branches = await execPromise("git branch --sort=-committerdate");
  return branches
    .split("\n")
    .filter(Boolean)
    .map(branch => branch.trim());
}

async function main() {
  try {
    const branches = await getBranches();

    const answers = await inquirer.prompt([
      {
        name: "branch",
        type: "list",
        message: "Pick a branch",
        choices: branches
      }
    ]);

    // current branch starts with "* ", no need to checkout
    if (!answers.branch.startsWith("* ")) {
      await setBranch(answers.branch);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
