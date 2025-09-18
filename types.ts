
export interface FileState {
  content: string;
  timestamp: number;
}

export interface Commit {
  id: string;
  message: string;
  parents: string[];
  files: Record<string, FileState>;
  timestamp: number;
}

export interface RepositoryState {
  commits: Record<string, Commit>;
  branches: Record<string, string>; // branch name -> commit id
  HEAD: string; // current branch name
  stagingArea: Record<string, FileState | { status: 'deleted' }>; // filename -> file state or deleted status
  workingDirectory: Record<string, FileState>;
  directories: string[];
  stash: { message: string, files: Record<string, FileState> }[];
  tags: Record<string, string>; // tag name -> commit id
  mergeInProgress: {
      branchToMerge: string;
      conflictingFiles: string[];
  } | null;
}

export interface Command {
  command: string;
  description: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string | { unix: string; windows: string };
  steps: {
    unix: Command[];
    windows: Command[];
  };
  goal: (repoState: RepositoryState) => boolean;
}

export interface Experiment {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
}