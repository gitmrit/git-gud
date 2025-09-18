import { Experiment } from './types';

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'exp1',
    title: 'Experiment 1: The Basics',
    description: 'Learn the foundational commands to initialize a repository, track files, and save your work.',
    exercises: [
      {
        id: 'init',
        title: 'Initialize a Repository',
        description: 'As the books explain, every Git project lives in a repository. This creates a hidden `.git` directory where Git stores all its tracking information.',
        steps: {
          unix: [{ command: 'git init', description: 'Creates an empty Git repository in the current directory.' }],
          windows: [{ command: 'git init', description: 'Creates an empty Git repository in the current directory.' }]
        },
        goal: (repo) => Object.keys(repo.commits).length > 0 && repo.branches.hasOwnProperty('main'),
      },
      {
        id: 'first-commit',
        title: 'Your First Commit',
        description: 'The basic Git workflow is to modify files, add them to the "staging area", and then commit them to your repository history.',
        steps: {
          unix: [
            { command: 'echo "Hello Git" > README.md', description: 'Create a new file with some content.' },
            { command: 'git status', description: 'Check the status. Git sees the new file but lists it as "untracked".' },
            { command: 'git add README.md', description: 'Add the file to the staging area to be tracked.' },
            { command: 'git status', description: 'Check the status again. The file is now staged and ready to be committed.' },
            { command: 'git commit -m "Initial commit"', description: 'Save the staged snapshot to your project history.' },
            { command: 'git log', description: 'View the history. You should see your new commit.' },
          ],
          windows: [
            { command: 'echo Hello Git > README.md', description: 'Create a new file with some content.' },
            { command: 'git status', description: 'Check the status. Git sees the new file but lists it as "untracked".' },
            { command: 'git add README.md', description: 'Add the file to the staging area to be tracked.' },
            { command: 'git status', description: 'Check the status again. The file is now staged and ready to be committed.' },
            { command: 'git commit -m "Initial commit"', description: 'Saves the staged changes to the repository with a message.' },
            { command: 'git log', description: 'View the history. You should see your new commit.' },
          ]
        },
        goal: (repo) => !!repo.branches['main'] && repo.commits[repo.branches['main']]?.message === 'Initial commit' && repo.commits[repo.branches['main']]?.files.hasOwnProperty('README.md'),
      },
    ]
  },
  {
    id: 'exp2',
    title: 'Experiment 2: Branching',
    description: 'Branches allow you to work on different features in parallel without affecting the main codebase.',
    exercises: [
      {
        id: 'branching',
        title: 'Create and Switch Branches',
        description: 'Create a new branch for a feature, and then switch to it to begin your work. This creates a separate line of development.',
        steps: {
          unix: [
            { command: 'git branch feature/new-login', description: 'Creates a new branch called "feature/new-login".' },
            { command: 'git branch', description: 'List all branches. The asterisk (*) marks the active branch (main).' },
            { command: 'git checkout feature/new-login', description: 'Switches your current working context to the new branch.' },
            { command: 'git branch', description: 'List the branches again. Notice the active branch has changed.' },
          ],
          windows: [
            { command: 'git branch feature/new-login', description: 'Creates a new branch called "feature/new-login".' },
            { command: 'git branch', description: 'List all branches. The asterisk (*) marks the active branch (main).' },
            { command: 'git checkout feature/new-login', description: 'Switches your current working context to the new branch.' },
            { command: 'git branch', description: 'List the branches again. Notice the active branch has changed.' },
          ]
        },
        goal: (repo) => repo.branches.hasOwnProperty('feature/new-login') && repo.HEAD === 'feature/new-login',
      },
      {
        id: 'commit-on-branch',
        title: 'Commit on a Branch',
        description: 'Changes made on a branch are independent of other branches until you merge them.',
        steps: {
            unix: [
                { command: 'echo "// Login form" > login.js', description: 'Create a new file for our feature.' },
                { command: 'git add login.js', description: 'Stage the new file.' },
                { command: 'git commit -m "Add login feature skeleton"', description: 'Commit the changes to the new branch.' },
                { command: 'git checkout main', description: 'Switch back to the main branch.' },
                { command: 'ls', description: 'List files. Notice that `login.js` is not here, keeping `main` clean.' },
            ],
            windows: [
                { command: 'echo // Login form > login.js', description: 'Create a new file for our feature.' },
                { command: 'git add login.js', description: 'Stage the new file.' },
                { command: 'git commit -m "Add login feature skeleton"', description: 'Commit the changes to the new branch.' },
                { command: 'git checkout main', description: 'Switch back to the main branch.' },
                { command: 'dir', description: 'List files. Notice that `login.js` is not here, keeping `main` clean.' },
            ]
        },
        goal: (repo) => {
            const featureCommitId = repo.branches['feature/new-login'];
            const mainCommit = repo.commits[repo.branches['main']];
            return repo.HEAD === 'main' && 
                   !!featureCommitId &&
                   repo.commits[featureCommitId]?.message === 'Add login feature skeleton' &&
                   !mainCommit.files.hasOwnProperty('login.js');
        }
      }
    ]
  },
  {
    id: 'exp3',
    title: 'Experiment 3: Merging',
    description: 'Combine the work from different branches into one.',
    exercises: [
        {
            id: 'merge',
            title: 'Merge a Feature Branch',
            description: 'After completing work on a feature branch, integrate its changes back into your main branch.',
            steps: {
                unix: [
                    { command: 'git checkout main', description: 'First, ensure you are on the branch you want to merge INTO.' },
                    { command: 'git merge feature/new-login', description: 'Merge the feature branch into main.' },
                    { command: 'ls', description: 'List the files. `login.js` is now on the main branch.' },
                    { command: 'git log --graph --oneline', description: 'See the commit history. Note the new "merge commit".' },
                ],
                windows: [
                    { command: 'git checkout main', description: 'First, ensure you are on the branch you want to merge INTO.' },
                    { command: 'git merge feature/new-login', description: 'Merge the feature branch into main.' },
                    { command: 'dir', description: 'List the files. `login.js` is now on the main branch.' },
                    { command: 'git log --graph --oneline', description: 'See the commit history. Note the new "merge commit".' },
                ]
            },
            goal: (repo) => {
                const headCommitId = repo.branches['main'];
                const headCommit = repo.commits[headCommitId];
                return repo.HEAD === 'main' &&
                       headCommit?.parents.length > 1 &&
                       headCommit?.files.hasOwnProperty('login.js');
            }
        }
    ]
  },
  {
    id: 'exp4',
    title: 'Experiment 4: Stashing Changes',
    description: 'Temporarily save changes that are not ready to be committed.',
    exercises: [
        {
            id: 'stash',
            title: 'Stash Your Work',
            description: 'You have unfinished work in your directory but need to switch branches. Stash the changes to save them for later.',
            steps: {
                unix: [
                    { command: 'echo "console.log(\'hello\')" >> login.js', description: 'Make a change to a tracked file.' },
                    { command: 'git status', description: 'See that `login.js` is modified but not staged.' },
                    { command: 'git stash', description: 'Stash the changes. Your working directory is now clean.' },
                    { command: 'git status', description: 'The working directory is clean again, ready to switch branches.' },
                ],
                windows: [
                    { command: 'echo console.log(\'hello\') >> login.js', description: 'Make a change to a tracked file.' },
                    { command: 'git status', description: 'See that `login.js` is modified but not staged.' },
                    { command: 'git stash', description: 'Stash the changes. Your working directory is now clean.' },
                    { command: 'git status', description: 'The working directory is clean again, ready to switch branches.' },
                ]
            },
            goal: (repo) => repo.stash.length > 0 && repo.workingDirectory['login.js']?.content.trim().length > 0 && !repo.workingDirectory['login.js']?.content.includes('hello'),
        },
        {
            id: 'stash-pop',
            title: 'Re-apply Stashed Changes',
            description: 'Apply the stashed changes to continue your work. `stash pop` applies the changes and removes them from the stash list.',
            steps: {
                unix: [
                    { command: 'git stash list', description: 'See what is currently in your stash.'},
                    { command: 'git stash pop', description: 'Apply the most recent stash and remove it from the stash list.' },
                    { command: 'cat login.js', description: 'Verify the stashed changes have been restored.' },
                ],
                windows: [
                    { command: 'git stash list', description: 'See what is currently in your stash.'},
                    { command: 'git stash pop', description: 'Apply the most recent stash and remove it from the stash list.' },
                    { command: 'type login.js', description: 'Verify the stashed changes have been restored.' },
                ]
            },
            goal: (repo) => repo.stash.length === 0 && repo.workingDirectory['login.js']?.content.includes('hello'),
        }
    ]
  },
  {
    id: 'exp5',
    title: 'Experiment 5: Undoing Things',
    description: 'Learn how to revert and reset changes safely.',
    exercises: [
        {
            id: 'revert-setup',
            title: 'Make a Mistake',
            description: "Let's make a commit that we'll later want to undo.",
            steps: {
              unix: [
                  { command: 'echo "This is a mistake" > mistake.txt', description: 'Create a file with content we want to undo.' },
                  { command: 'git add mistake.txt', description: 'Stage the file.' },
                  { command: 'git commit -m "feat: Add a file with a mistake"', description: 'Commit the mistake.' },
                  { command: 'git log -n 1', description: 'Note the commit hash of your mistake.' },
              ],
              windows: [
                  { command: 'echo "This is a mistake" > mistake.txt', description: 'Create a file with content we want to undo.' },
                  { command: 'git add mistake.txt', description: 'Stage the file.' },
                  { command: 'git commit -m "feat: Add a file with a mistake"', description: 'Commit the mistake.' },
                  { command: 'git log -n 1', description: 'Note the commit hash of your mistake.' },
              ]
            },
            goal: (repo) => repo.commits[repo.branches[repo.HEAD]]?.files.hasOwnProperty('mistake.txt'),
        },
        {
            id: 'revert',
            title: 'Reverting a Commit',
            description: 'Create a new commit that undoes the changes from a previous commit. This is a safe way to undo as it doesn\'t change the project history.',
            steps: {
                unix: [
                    { command: 'git revert HEAD', description: 'Create a new commit that is the inverse of the last commit.'},
                    { command: 'ls', description: 'The file `mistake.txt` is gone from the working directory.'},
                    { command: 'git log -n 2', description: 'Notice there is a new "Revert" commit in the history, and the old commit is still there.'},
                ],
                windows: [
                    { command: 'git revert HEAD', description: 'Create a new commit that is the inverse of the last commit.'},
                    { command: 'dir', description: 'The file `mistake.txt` is gone from the working directory.'},
                    { command: 'git log -n 2', description: 'Notice there is a new "Revert" commit in the history, and the old commit is still there.'},
                ]
            },
            goal: (repo) => {
                const headCommit = repo.commits[repo.branches[repo.HEAD]];
                return !!headCommit && headCommit.message.startsWith('Revert') && !headCommit.files.hasOwnProperty('mistake.txt');
            }
        }
    ]
  },
  {
    id: 'exp6',
    title: 'Experiment 6: Amending Commits',
    description: 'Modify the most recent commit.',
    exercises: [
        {
            id: 'amend',
            title: 'Amend the Last Commit',
            description: 'You forgot to add a file to your last commit. Instead of a new commit, you can amend the previous one.',
            steps: {
                unix: [
                     { command: 'echo "forgotten file" > new-file.txt', description: 'Create the file you forgot.' },
                     { command: 'git add new-file.txt', description: 'Stage the new file.' },
                     { command: 'git commit --amend --no-edit', description: 'Add the file to the previous commit without changing the message.' },
                     { command: 'git log -1 --stat', description: 'Look at the last commit. It now includes `new-file.txt` and has a new commit hash.'}
                ],
                windows: [
                     { command: 'echo "forgotten file" > new-file.txt', description: 'Create the file you forgot.' },
                     { command: 'git add new-file.txt', description: 'Stage the new file.' },
                     { command: 'git commit --amend --no-edit', description: 'Add the file to the previous commit without changing the message.' },
                     { command: 'git log -1 --stat', description: 'Look at the last commit. It now includes `new-file.txt` and has a new commit hash.'}
                ]
            },
            goal: (repo) => {
                 const headCommit = repo.commits[repo.branches[repo.HEAD]];
                 return !!headCommit && headCommit.files.hasOwnProperty('new-file.txt');
            }
        }
    ]
  },
  {
    id: 'exp7',
    title: 'Experiment 7: Tagging a Release',
    description: 'Mark specific points in history as important, such as version releases.',
    exercises: [
        {
            id: 'tag',
            title: 'Create a Lightweight Tag',
            description: 'Create a lightweight tag to mark the current commit as a version release. It\'s like a bookmark for a specific commit.',
            steps: {
                unix: [
                    { command: 'git tag v1.0', description: 'Create a tag named v1.0 on the current commit.' },
                    { command: 'git tag', description: 'List all tags in the repository.' },
                    { command: 'git log -1', description: 'The log for the latest commit now shows the tag.' },
                ],
                windows: [
                    { command: 'git tag v1.0', description: 'Create a tag named v1.0 on the current commit.' },
                    { command: 'git tag', description: 'List all tags in the repository.' },
                    { command: 'git log -1', description: 'The log for the latest commit now shows the tag.' },
                ]
            },
            goal: (repo) => repo.tags['v1.0'] === repo.branches[repo.HEAD],
        }
    ]
  },
   {
      id: 'exp8',
      title: 'Experiment 8: Cleaning the Workspace',
      description: 'Remove untracked files from your working directory.',
      exercises: [
          {
              id: 'clean',
              title: 'Clean the Directory',
              description: "Sometimes your workspace gets cluttered with temporary files (e.g., build artifacts). Use `git clean` to remove them.",
              steps: {
                  unix: [
                      { command: 'touch temp.log', description: 'Create a temporary, untracked file.' },
                      { command: 'git status', description: 'Notice `temp.log` is untracked.' },
                      { command: 'git clean -n', description: 'Do a "dry run" to see what would be removed.'},
                      { command: 'git clean -f', description: 'Forcibly remove untracked files.' },
                      { command: 'git status', description: 'The directory is clean again.' },
                  ],
                  windows: [
                      { command: 'echo. > temp.log', description: 'Create a temporary, untracked file.' },
                      { command: 'git status', description: 'Notice `temp.log` is untracked.' },
                      { command: 'git clean -n', description: 'Do a "dry run" to see what would be removed.'},
                      { command: 'git clean -f', description: 'Forcibly remove untracked files.' },
                      { command: 'git status', description: 'The directory is clean again.' },
                  ]
              },
              goal: (repo) => !repo.workingDirectory.hasOwnProperty('temp.log'),
          }
      ]
  },
  {
      id: 'exp9',
      title: 'Experiment 9: Rebasing',
      description: 'Re-apply commits on top of another base tip to create a linear history.',
      exercises: [
          {
              id: 'setup-rebase',
              title: 'Create a Divergent History',
              description: "Let's create a situation where a rebase is useful: a feature branch that has diverged from main.",
              steps: {
                  unix: [
                      { command: 'git checkout -b feature/rebase-me main', description: 'Create and switch to a feature branch.' },
                      { command: 'echo "feature" > feature.txt', description: 'Add a feature file.' },
                      { command: 'git add . && git commit -m "feat: start rebase feature"', description: 'Commit the feature.' },
                      { command: 'git checkout main', description: 'Switch back to main.' },
                      { command: 'echo "update" >> README.md', description: 'Update the README on main.' },
                      { command: 'git add . && git commit -m "docs: update readme on main"', description: 'Commit on main, causing a divergence.' },
                      { command: 'git log --graph --oneline --all', description: 'Observe the divergent histories.'}
                  ],
                  windows: [
                      { command: 'git checkout -b feature/rebase-me main', description: 'Create and switch to a feature branch.' },
                      { command: 'echo "feature" > feature.txt', description: 'Add a feature file.' },
                      { command: 'git add . && git commit -m "feat: start rebase feature"', description: 'Commit the feature.' },
                      { command: 'git checkout main', description: 'Switch back to main.' },
                      { command: 'echo update >> README.md', description: 'Update the README on main.' },
                      { command: 'git add . && git commit -m "docs: update readme on main"', description: 'Commit on main, causing a divergence.' },
                      { command: 'git log --graph --oneline --all', description: 'Observe the divergent histories.'}
                  ]
              },
              goal: (repo) => repo.branches.hasOwnProperty('feature/rebase-me') && repo.commits[repo.branches['main']].parents[0] !== repo.commits[repo.branches['feature/rebase-me']].parents[0],
          },
          {
              id: 'rebase',
              title: 'Perform the Rebase',
              description: 'Rebase the feature branch onto main to create a clean, linear history. This rewrites the feature branch\'s history.',
              steps: {
                  unix: [
                      { command: 'git checkout feature/rebase-me', description: 'Switch to the feature branch.' },
                      { command: 'git rebase main', description: 'Re-apply the commits from this branch on top of main.' },
                      { command: 'git log --graph --oneline --all', description: 'Observe the new linear history. The feature branch is now ahead of main.'}
                  ],
                  windows: [
                      { command: 'git checkout feature/rebase-me', description: 'Switch to the feature branch.' },
                      { command: 'git rebase main', description: 'Re-apply the commits from this branch on top of main.' },
                      { command: 'git log --graph --oneline --all', description: 'Observe the new linear history. The feature branch is now ahead of main.'}
                  ]
              },
              goal: (repo) => {
                  const featureCommit = repo.commits[repo.branches['feature/rebase-me']];
                  const mainCommitId = repo.branches['main'];
                  return featureCommit?.parents[0] === mainCommitId; 
              },
          }
      ]
  },
  {
      id: 'exp10',
      title: 'Experiment 10: Cherry Picking',
      description: 'Apply a specific commit from one branch onto another.',
      exercises: [
          {
              id: 'cherry-pick-setup',
              title: 'Isolate a Commit',
              description: 'Let\'s create a commit on a separate branch that contains a critical change we need on `main` immediately.',
              steps: {
                  unix: [
                      { command: 'git checkout -b feature/hotfix', description: 'Create a new branch for the hotfix.' },
                      { command: 'echo "critical fix" > hotfix.js', description: 'Create a critical hotfix file.' },
                      { command: 'git add . && git commit -m "fix: critical hotfix"', description: 'Commit the hotfix.' },
                      { command: 'git checkout main', description: 'Switch back to main, which does not have the fix.' },
                  ],
                  windows: [
                      { command: 'git checkout -b feature/hotfix', description: 'Create a new branch for the hotfix.' },
                      { command: 'echo "critical fix" > hotfix.js', description: 'Create a critical hotfix file.' },
                      { command: 'git add . && git commit -m "fix: critical hotfix"', description: 'Commit the hotfix.' },
                      { command: 'git checkout main', description: 'Switch back to main, which does not have the fix.' },
                  ]
              },
              goal: (repo) => repo.HEAD === 'main' && repo.branches.hasOwnProperty('feature/hotfix'),
          },
          {
              id: 'cherry-pick',
              title: 'Perform the Cherry-Pick',
              description: "You need the hotfix on main *now* without merging the whole feature branch. Use `git log` to find the commit's hash, then `cherry-pick` it.",
              steps: {
                  unix: [
                      { command: 'git log feature/hotfix', description: 'Find the commit hash for "fix: critical hotfix".' },
                      { command: 'git cherry-pick <hash>', description: 'Replace <hash> with the commit hash you found.' },
                      { command: 'ls', description: 'The `hotfix.js` file is now on main.' },
                  ],
                  windows: [
                      { command: 'git log feature/hotfix', description: 'Find the commit hash for "fix: critical hotfix".' },
                      { command: 'git cherry-pick <hash>', description: 'Replace <hash> with the commit hash you found.' },
                      { command: 'dir', description: 'The `hotfix.js` file is now on main.' },
                  ]
              },
              goal: (repo) => {
                  const mainCommit = repo.commits[repo.branches['main']];
                  return mainCommit?.message === 'fix: critical hotfix';
              }
          }
      ]
  },
  {
      id: 'exp11',
      title: 'Experiment 11: Merge Conflicts',
      description: 'Learn how to handle the inevitable merge conflict when changes overlap.',
      exercises: [
          {
              id: 'conflict-setup',
              title: 'Creating a Conflict',
              description: 'Let\'s create a merge conflict by editing the same line of the same file on two different branches.',
              steps: {
                  unix: [
                      { command: 'git checkout -b feature/conflicting-change', description: 'Create a feature branch.' },
                      { command: 'echo "Feature change for README" > README.md', description: 'Change the README on the feature branch.' },
                      { command: 'git add . && git commit -m "feat: change readme"', description: 'Commit the change.' },
                      { command: 'git checkout main', description: 'Switch back to main.' },
                      { command: 'echo "Important update on main" > README.md', description: 'Make a different change to the same file on main.' },
                      { command: 'git add . && git commit -m "docs: change readme on main"', description: 'Commit the conflicting change.' },
                  ],
                  windows: [
                      { command: 'git checkout -b feature/conflicting-change', description: 'Create a feature branch.' },
                      { command: 'echo "Feature change for README" > README.md', description: 'Change the README on the feature branch.' },
                      { command: 'git add . && git commit -m "feat: change readme"', description: 'Commit the change.' },
                      { command: 'git checkout main', description: 'Switch back to main.' },
                      { command: 'echo "Important update on main" > README.md', description: 'Make a different change to the same file on main.' },
                      { command: 'git add . && git commit -m "docs: change readme on main"', description: 'Commit the conflicting change.' },
                  ]
              },
              goal: (repo) => repo.branches.hasOwnProperty('feature/conflicting-change') && repo.workingDirectory['README.md']?.content.includes('Important update'),
          },
          {
              id: 'conflict-resolve',
              title: 'Resolving a Conflict',
              description: 'Attempt the merge, examine the conflict markers Git adds to the file, fix it, and complete the merge.',
              steps: {
                  unix: [
                      { command: 'git merge feature/conflicting-change', description: 'Attempt the merge, which will fail with a conflict.' },
                      { command: 'git status', description: 'Git tells you there are "unmerged paths".' },
                      { command: 'cat README.md', description: 'Examine the file to see the conflict markers (<<<<<<<, =======, >>>>>>>).' },
                      { command: 'echo "Resolved: Important update and feature change" > README.md', description: 'Manually edit the file to resolve the conflict.' },
                      { command: 'git add README.md', description: 'Stage the resolved file.' },
                      { command: 'git commit --no-edit', description: 'Commit the merge. The `--no-edit` flag accepts the auto-generated message.' },
                  ],
                  windows: [
                      { command: 'git merge feature/conflicting-change', description: 'Attempt the merge, which will fail with a conflict.' },
                      { command: 'git status', description: 'Git tells you there are "unmerged paths".' },
                      { command: 'type README.md', description: 'Examine the file to see the conflict markers (<<<<<<<, =======, >>>>>>>).' },
                      { command: 'echo "Resolved: Important update and feature change" > README.md', description: 'Manually edit the file to resolve the conflict.' },
                      { command: 'git add README.md', description: 'Stage the resolved file.' },
                      { command: 'git commit --no-edit', description: 'Commit the merge. The `--no-edit` flag accepts the auto-generated message.' },
                  ]
              },
              goal: (repo) => {
                  const headCommit = repo.commits[repo.branches['main']];
                  return !repo.mergeInProgress && headCommit?.parents.length > 1 && repo.workingDirectory['README.md']?.content.startsWith('Resolved');
              }
          }
      ]
  },
   {
    id: 'exp12',
    title: 'Experiment 12: You\'ve Git Gud!',
    description: 'Congratulations on completing the interactive tutorial!',
    exercises: [
      {
        id: 'final-challenge',
        title: 'Next Steps',
        description: 'You have learned the core concepts of Git and are ready to use it in your own projects. Keep practicing!',
        steps: {
          unix: [
              { command: 'echo "I am a Git expert!"', description: 'Celebrate your new skills!' },
          ],
          windows: [
              { command: 'echo "I am a Git expert!"', description: 'Celebrate your new skills!' },
          ]
        },
        goal: (repo) => {
            return Object.keys(repo.commits).length > 15; // A simple check to see if they've done a lot of work
        }
      },
    ]
  },
];