# pickbranch 

[![npm](https://img.shields.io/npm/v/pickbranch)](https://www.npmjs.com/package/pickbranch) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

Pick a git branch


## Install

`npm install -g pickbranch`

## Usage

In any git repo use `pickbranch` to pick a branch from a list of branches sorted on latest commit date.

You can then:

- type to filter
- use arrow keys to traverse list of branches
- hit _Enter_ to go to selected branch

### Tips

- Search for `^start` to find branches beginning with `start`. It's also possible to use other regular expressions.

- Add a git alias in `~/.gitconfig`. Then use `git pick` to pick a branch in your git repo.
  ```
  [alias]
      pick = "!f() { pickbranch; }; f"
  ```
