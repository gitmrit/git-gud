import { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'init',
    title: 'Initialize a Repository',
    description: 'Every Git project starts with a repository. Let\'s create one.',
    steps: {
      unix: [{ command: 'git init', description: 'Creates an empty Git repository in the current directory.' }],
      windows: [{ command: 'git init', description: 'Creates an empty Git repository in the current directory.' }]
    },
    goal: (repo) => Object.keys(repo.commits).length > 0 && repo.branches.hasOwnProperty('main'),
  },
  {
    id: 'first-commit',
    title: 'Your First Commit',
    description: 'Create a file, add it to the staging area, and commit it to the repository.',
    steps: {
      unix: [
        { command: 'touch README.md', description: 'Creates a new file named README.md.' },
        { command: 'git add README.md', description: 'Adds the new file to the staging area, preparing it for the next commit.' },
        { command: 'git commit -m "Initial commit"', description: 'Saves the staged changes to the repository with a message.' },
      ],
      windows: [
        { command: 'echo. > README.md', description: 'Creates a new file named README.md.' },
        { command: 'git add README.md', description: 'Adds the new file to the staging area, preparing it for the next commit.' },
        { command: 'git commit -m "Initial commit"', description: 'Saves the staged changes to the repository with a message.' },
      ]
    },
    goal: (repo) => !!repo.branches['main'] && repo.commits[repo.branches['main']]?.message === 'Initial commit',
  },
  {
    id: 'branching',
    title: 'Creating a New Branch',
    description: 'Branches allow you to work on different features without affecting the main codebase.',
    steps: {
      unix: [
        { command: 'git branch feature/new-login', description: 'Creates a new branch called "feature/new-login".' },
        { command: 'git checkout feature/new-login', description: 'Switches your current working context to the new branch.' },
        { command: 'touch login.js', description: 'Create a new file for our feature.' },
        { command: 'git add login.js', description: 'Stage the new file.' },
        { command: 'git commit -m "Add login feature skeleton"', description: 'Commit the changes to the new branch.' },
      ],
      windows: [
        { command: 'git branch feature/new-login', description: 'Creates a new branch called "feature/new-login".' },
        { command: 'git checkout feature/new-login', description: 'Switches your current working context to the new branch.' },
        { command: 'echo. > login.js', description: 'Create a new file for our feature.' },
        { command: 'git add login.js', description: 'Stage the new file.' },
        { command: 'git commit -m "Add login feature skeleton"', description: 'Commit the changes to the new branch.' },
      ]
    },
    goal: (repo) => repo.branches.hasOwnProperty('feature/new-login') && repo.HEAD === 'feature/new-login',
  },
];
