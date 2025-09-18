
import { RepositoryState, Commit, FileState } from '../types';

// A simple hash function for commit IDs
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return ('0000000' + (hash >>> 0).toString(16)).slice(-7);
};

export interface CommandResult {
  output: string;
  repoState: RepositoryState;
  action?: 'clear';
}

const getParentPath = (path: string): string => {
  if (!path.includes('/')) return '';
  return path.substring(0, path.lastIndexOf('/'));
};

const getBaseName = (path: string): string => {
  if (!path.includes('/')) return path;
  return path.substring(path.lastIndexOf('/') + 1);
};


export class GitSimulator {
  private repoState: RepositoryState;
  private osMode: 'unix' | 'windows';

  constructor(osMode: 'unix' | 'windows' = 'unix') {
    this.repoState = this.getInitialState();
    this.osMode = osMode;
  }

  private getInitialState(): RepositoryState {
    return {
      commits: {},
      branches: {},
      HEAD: '',
      stagingArea: {},
      workingDirectory: {},
      directories: [],
    };
  }
  
  getState(): RepositoryState {
    // Deep copy to prevent mutation of internal state
    return JSON.parse(JSON.stringify(this.repoState));
  }

  private pathExists(path: string): boolean {
      return this.repoState.workingDirectory.hasOwnProperty(path) || this.repoState.directories.includes(path);
  }

  private isDirectory(path: string): boolean {
      return this.repoState.directories.includes(path);
  }

  private isFile(path: string): boolean {
      return this.repoState.workingDirectory.hasOwnProperty(path);
  }
  
  private writeFile(path: string, content: string, append = false): void {
      const existingFile = this.repoState.workingDirectory[path];
      const newContent = append && existingFile ? existingFile.content + content : content;
      this.repoState.workingDirectory[path] = { content: newContent, timestamp: Date.now() };
  }

  execute(command: string): CommandResult {
    const parts = command.trim().split(/\s+/);
    const [cmd, ...args] = parts;

    if (cmd === '') return { output: '', repoState: this.getState() };
    
    if (cmd !== 'git') {
      return this.osMode === 'unix' ? this.handleUnixShell(cmd, args) : this.handleWindowsShell(cmd, args);
    }

    // Git commands (universal)
    const gitCmd = args[0];
    const gitArgs = args.slice(1);

    switch (gitCmd) {
      case 'init':
        return this.init();
      case 'add':
        return this.add(gitArgs);
      case 'commit':
        return this.commit(gitArgs);
      case 'branch':
        return this.branch(gitArgs);
      case 'checkout':
        return this.checkout(gitArgs);
      case 'log':
        return this.log();
      default:
        return { output: `git: '${gitCmd}' is not a git command. See 'git --help'.`, repoState: this.getState() };
    }
  }

  private handleUnixShell(cmd: string, args: string[]): CommandResult {
      switch (cmd) {
          case 'ls': return this.ls(args);
          case 'touch': return this.touch(args);
          case 'echo': return this.echo(args);
          case 'cat': return this.cat(args);
          case 'mkdir': return this.mkdir(args);
          case 'rm': return this.rm(args);
          case 'cp': return this.cp(args);
          case 'mv': return this.mv(args);
          case 'pwd': return { output: '/home/student/git-gud', repoState: this.getState() };
          case 'clear': return { output: '', repoState: this.getState(), action: 'clear' };
          default: return { output: `bash: command not found: ${cmd}`, repoState: this.getState() };
      }
  }

  private handleWindowsShell(cmd: string, args: string[]): CommandResult {
      const lowerCmd = cmd.toLowerCase();
      switch(lowerCmd) {
          case 'dir': return this.dir(args);
          case 'echo':
          case 'echo.':
            return this.echo(args, lowerCmd === 'echo.');
          case 'type': return this.type(args);
          case 'md':
          case 'mkdir': return this.mkdir(args, true);
          case 'del':
          case 'erase': return this.del(args);
          case 'rd':
          case 'rmdir': return this.rmdir(args);
          case 'copy': return this.copy(args);
          case 'xcopy': return this.xcopy(args);
          case 'move': return this.move(args);
          case 'ren':
          case 'rename': return this.rename(args);
          case 'cls': return { output: '', repoState: this.getState(), action: 'clear' };
          default: return { output: `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`, repoState: this.getState() };
      }
  }

  // Shared command logic
  private echo(args: string[], isEchoDotWin: boolean = false): CommandResult {
      const redirectIndex = args.findIndex(arg => arg === '>' || arg === '>>');
      
      if (redirectIndex > -1) {
          const contentParts = args.slice(0, redirectIndex);
          const targetFile = args[redirectIndex + 1];
          const isAppend = args[redirectIndex] === '>>';

          if (!targetFile) {
              return { output: this.osMode === 'unix' ? 'bash: syntax error near unexpected token `newline`' : 'The syntax of the command is incorrect.', repoState: this.getState() };
          }
          let content = isEchoDotWin ? '' : contentParts.join(' ').replace(/"/g, '');
          if(this.osMode === 'unix' && !isEchoDotWin) content += '\n';

          this.writeFile(targetFile, content, isAppend);

          return { output: '', repoState: this.getState() };
      }
      
      if (isEchoDotWin) return { output: 'ECHO is on.', repoState: this.getState() };
      return { output: args.join(' '), repoState: this.getState() };
  }

  private touch(args: string[]): CommandResult {
      if (!args[0]) return { output: 'touch: missing file operand', repoState: this.getState() };
      args.forEach(path => {
          const existing = this.repoState.workingDirectory[path];
          this.repoState.workingDirectory[path] = {
              content: existing?.content || '',
              timestamp: Date.now()
          };
      });
      return { output: '', repoState: this.getState() };
  }
  
  private cat(args: string[]): CommandResult {
      if (!args[0]) return { output: 'cat: missing file operand', repoState: this.getState() };
      const file = this.repoState.workingDirectory[args[0]];
      if (!file) {
          return { output: `cat: ${args[0]}: No such file or directory`, repoState: this.getState() };
      }
      return { output: file.content, repoState: this.getState() };
  }

  private mkdir(args: string[], isWindows = false): CommandResult {
      const path = args[0];
      if (!path) return { output: isWindows ? 'The syntax of the command is incorrect.' : 'mkdir: missing operand', repoState: this.getState() };

      if (this.pathExists(path)) {
          return { output: isWindows ? `A subdirectory or file ${path} already exists.` : `mkdir: cannot create directory ‘${path}’: File exists`, repoState: this.getState() };
      }
      
      const parent = getParentPath(path);
      if (parent && !this.isDirectory(parent)) {
           return { output: isWindows ? `The system cannot find the path specified.` : `mkdir: cannot create directory ‘${path}’: No such file or directory`, repoState: this.getState() };
      }
      
      this.repoState.directories.push(path);
      this.repoState.directories.sort();
      return { output: '', repoState: this.getState() };
  }

  private rm(args: string[]): CommandResult {
      const recursive = args.includes('-r') || args.includes('-R');
      const paths = args.filter(arg => !arg.startsWith('-'));

      if (paths.length === 0) return { output: 'rm: missing operand', repoState: this.getState() };
      
      for (const path of paths) {
          if (!this.pathExists(path)) {
              return { output: `rm: cannot remove '${path}': No such file or directory`, repoState: this.getState() };
          }
          if (this.isDirectory(path)) {
              if (!recursive) {
                  return { output: `rm: cannot remove '${path}': Is a directory`, repoState: this.getState() };
              }
              // Delete directory and all contents
              const filesToDelete = Object.keys(this.repoState.workingDirectory).filter(f => f.startsWith(path + '/') || f === path);
              filesToDelete.forEach(f => delete this.repoState.workingDirectory[f]);
              const dirsToDelete = this.repoState.directories.filter(d => d.startsWith(path + '/') || d === path);
              this.repoState.directories = this.repoState.directories.filter(d => !dirsToDelete.includes(d));
          } else {
              delete this.repoState.workingDirectory[path];
          }
          delete this.repoState.stagingArea[path];
      }
      return { output: '', repoState: this.getState() };
  }

  private cp(args: string[]): CommandResult {
      const recursive = args.includes('-r') || args.includes('-R');
      const paths = args.filter(arg => !arg.startsWith('-'));
      if (paths.length !== 2) return { output: 'cp: missing destination file operand', repoState: this.getState() };
      
      const [source, dest] = paths;

      if (!this.pathExists(source)) return { output: `cp: cannot stat '${source}': No such file or directory`, repoState: this.getState() };
      
      if (this.isFile(source)) {
          let destPath = dest;
          if (this.isDirectory(dest)) {
              destPath = `${dest}/${getBaseName(source)}`;
          }
          this.repoState.workingDirectory[destPath] = JSON.parse(JSON.stringify(this.repoState.workingDirectory[source]));
          this.repoState.workingDirectory[destPath].timestamp = Date.now();
      } else { // Is directory
          if (!recursive) return { output: `cp: -r not specified; omitting directory '${source}'`, repoState: this.getState() };
          
          if (this.isFile(dest)) return { output: `cp: cannot overwrite non-directory '${dest}' with directory '${source}'`, repoState: this.getState() };
          
          if (!this.isDirectory(dest)) {
              this.repoState.directories.push(dest);
              this.repoState.directories.sort();
          }

          const itemsToCopy = Object.keys(this.repoState.workingDirectory).filter(f => f.startsWith(source + '/'));
          itemsToCopy.forEach(item => {
              const newPath = item.replace(source, dest);
              this.repoState.workingDirectory[newPath] = JSON.parse(JSON.stringify(this.repoState.workingDirectory[item]));
              this.repoState.workingDirectory[newPath].timestamp = Date.now();
          });
          const dirsToCopy = this.repoState.directories.filter(d => d.startsWith(source + '/'));
          dirsToCopy.forEach(dir => {
              const newDirPath = dir.replace(source, dest);
              if(!this.isDirectory(newDirPath)) this.repoState.directories.push(newDirPath);
          });
          this.repoState.directories.sort();
      }
      
      return { output: '', repoState: this.getState() };
  }

  private mv(args: string[]): CommandResult {
      if (args.length !== 2) return { output: 'mv: missing destination file operand', repoState: this.getState() };
      
      const [source, dest] = args;

      if (!this.pathExists(source)) return { output: `mv: cannot stat '${source}': No such file or directory`, repoState: this.getState() };

      // Effectively a copy then a remove
      const cpResult = this.cp(['-r', source, dest]);
      if (cpResult.output) return cpResult; // Propagate cp errors

      const rmResult = this.rm(['-r', source]);
      // The state is already updated by cp and rm, just need to combine them.
      return { output: '', repoState: this.getState() };
  }

  private ls(args: string[]): CommandResult {
    // This is a simplified ls. We assume it's always running from the root.
    const showHidden = args.includes('-a');
    const longFormat = args.includes('-l');
    const sortByTime = args.includes('-t');
    
    let files = Object.keys(this.repoState.workingDirectory);
    let dirs = [...this.repoState.directories];

    if (!showHidden) {
        files = files.filter(f => !getBaseName(f).startsWith('.'));
        dirs = dirs.filter(d => !getBaseName(d).startsWith('.'));
    }

    const allItems = [
        ...files.map(f => ({ path: f, type: 'file', timestamp: this.repoState.workingDirectory[f].timestamp })),
        ...dirs.map(d => ({ path: d, type: 'dir', timestamp: 0 })) // Dirs don't have timestamps yet
    ];
    
    if (sortByTime) {
        allItems.sort((a, b) => b.timestamp - a.timestamp);
    } else {
        allItems.sort((a,b) => a.path.localeCompare(b.path));
    }

    if (longFormat) {
        const output = allItems.map(item => {
            const perms = item.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
            const size = item.type === 'file' ? this.repoState.workingDirectory[item.path].content.length : 4096;
            const date = new Date(item.timestamp || Date.now()).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
            return `${perms} 1 student student ${String(size).padStart(5)} ${date} ${getBaseName(item.path)}`;
        }).join('\n');
        return { output, repoState: this.getState() };
    }

    return { output: allItems.map(i => getBaseName(i.path)).join('\t'), repoState: this.getState() };
  }

  // Windows command implementations
  private dir(args: string[]): CommandResult {
    const files = Object.keys(this.repoState.workingDirectory);
    const dirs = this.repoState.directories;
    
    const header = ` Volume in drive C has no label.\n Volume Serial Number is BEEF-CAFE\n\n Directory of C:\\Users\\Student\\git-gud\n\n`;
    if (files.length === 0 && dirs.length === 0) {
      return { output: header + 'File Not Found', repoState: this.getState() };
    }
    const dirList = dirs.map(d => `${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}    <DIR>          ${d}`).join('\n');
    const fileList = files.map(f => `${new Date(this.repoState.workingDirectory[f].timestamp).toLocaleDateString()}  ${new Date(this.repoState.workingDirectory[f].timestamp).toLocaleTimeString()}    ${this.repoState.workingDirectory[f].content.length.toString().padStart(14)} ${f}`).join('\n');
    return { output: header + (dirList ? dirList + '\n' : '') + fileList, repoState: this.getState() };
  }
  
  private type(args: string[]): CommandResult {
     if (args[0]?.toUpperCase() === 'NUL' && args[1] === '>' && args[2]) {
        this.writeFile(args[2], '', false);
        return { output: '', repoState: this.getState() };
     }
     if (!args[0]) return { output: `The syntax of the command is incorrect.`, repoState: this.getState() };
     const file = this.repoState.workingDirectory[args[0]];
     if (!file) {
        return { output: `The system cannot find the file specified.`, repoState: this.getState() };
     }
     return { output: file.content, repoState: this.getState() };
  }

  private del(args: string[]): CommandResult {
     if (!args[0]) return { output: `The syntax of the command is incorrect.`, repoState: this.getState() };
     const path = args[0];
     if (!this.isFile(path)) {
         return { output: `Could Not Find C:\\Users\\Student\\git-gud\\${path}`, repoState: this.getState() };
     }
     delete this.repoState.workingDirectory[path];
     delete this.repoState.stagingArea[path];
     return { output: '', repoState: this.getState() };
  }

  private rmdir(args: string[]): CommandResult {
      const recursive = args.includes('/s') || args.includes('/S');
      const paths = args.filter(arg => !arg.startsWith('/'));
      const path = paths[0];

      if (!path) return { output: 'The syntax of the command is incorrect.', repoState: this.getState() };
      if (!this.isDirectory(path)) return { output: 'The system cannot find the file specified.', repoState: this.getState() };
      
      const contents = Object.keys(this.repoState.workingDirectory).filter(f => f.startsWith(path + '/'));
      if (contents.length > 0 && !recursive) {
          return { output: 'The directory is not empty.', repoState: this.getState() };
      }
      
      this.rm(['-r', path]); // Reuse rm logic
      return { output: '', repoState: this.getState() };
  }
  
  private copy(args: string[]): CommandResult {
      if (args.length !== 2) return { output: 'The syntax of the command is incorrect.', repoState: this.getState() };
      this.cp(args); // Reuse cp logic, output is different but behavior is same
      return { output: '        1 file(s) copied.', repoState: this.getState() };
  }

  private xcopy(args: string[]): CommandResult {
      const recursive = args.includes('/s') || args.includes('/S');
      if (!recursive) {
           // Simplified: assume xcopy is always used for directories
           return { output: '0 File(s) copied', repoState: this.getState() };
      }
      const paths = args.filter(arg => !arg.startsWith('/'));
      const cpResult = this.cp(['-r', ...paths]);
      if(cpResult.output) return { output: 'Invalid path', repoState: this.getState() };
      return { output: 'File(s) copied', repoState: this.getState() };
  }

  private move(args: string[]): CommandResult {
       if (args.length !== 2) return { output: 'The syntax of the command is incorrect.', repoState: this.getState() };
       const mvResult = this.mv(args);
       if(mvResult.output) return { output: 'The system cannot find the file specified.', repoState: this.getState() };
       return { output: '        1 dir(s) moved.', repoState: this.getState() };
  }
  
  private rename(args: string[]): CommandResult {
      if (args.length !== 2) return { output: 'The syntax of the command is incorrect.', repoState: this.getState() };
      const mvResult = this.mv(args);
      if(mvResult.output) return { output: 'The system cannot find the file specified.', repoState: this.getState() };
      return { output: '', repoState: this.getState() };
  }


  // --- Git Commands ---
  private init(): CommandResult {
    this.repoState = this.getInitialState();
    const rootCommit: Commit = {
      id: 'root',
      message: 'Initial empty commit',
      parents: [],
      files: {},
      timestamp: Date.now(),
    };
    this.repoState.commits['root'] = rootCommit;
    this.repoState.branches['main'] = 'root';
    this.repoState.HEAD = 'main';
    this.repoState.directories.push('.git'); // Simulate .git directory
    return { output: 'Initialized empty Git repository in /home/student/git-gud/.git/', repoState: this.getState() };
  }
  
  private add(args: string[]): CommandResult {
    if (Object.keys(this.repoState.commits).length === 0) {
      return { output: 'fatal: not a git repository', repoState: this.getState() };
    }
    const pathSpec = args[0];
    if (!pathSpec) {
      return { output: 'Nothing specified, nothing added.', repoState: this.getState() };
    }

    let filesToAdd: string[] = [];
    if (this.isFile(pathSpec)) {
        filesToAdd.push(pathSpec);
    } else if (this.isDirectory(pathSpec)) {
        filesToAdd = Object.keys(this.repoState.workingDirectory).filter(f => f.startsWith(pathSpec + '/'));
    } else if (pathSpec === '.') {
        filesToAdd = Object.keys(this.repoState.workingDirectory);
    }

    if (filesToAdd.length === 0 && !this.isFile(pathSpec)) {
         return { output: `fatal: pathspec '${pathSpec}' did not match any files`, repoState: this.getState() };
    }

    filesToAdd.forEach(file => {
        this.repoState.stagingArea[file] = { ...this.repoState.workingDirectory[file] };
    });
    
    return { output: '', repoState: this.getState() };
  }
  
  private commit(args: string[]): CommandResult {
    if (Object.keys(this.repoState.stagingArea).length === 0) {
      return { output: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean', repoState: this.getState() };
    }
    
    const mIndex = args.indexOf('-m');
    let message = 'Unnamed commit';
    if (mIndex !== -1 && args[mIndex + 1]) {
        // Handle message in quotes
        const messageParts = [];
        for (let i = mIndex + 1; i < args.length; i++) {
            messageParts.push(args[i]);
        }
        message = messageParts.join(' ').replace(/"/g, '');
    }

    const parentId = this.repoState.branches[this.repoState.HEAD];
    const parentCommit = this.repoState.commits[parentId];

    const newFiles = { ...parentCommit.files };
    // Apply staged changes
    for (const path in this.repoState.stagingArea) {
        const stageEntry = this.repoState.stagingArea[path];
        if ('status' in stageEntry && stageEntry.status === 'deleted') {
            delete newFiles[path];
        } else {
            newFiles[path] = stageEntry as FileState;
        }
    }

    const commitContent = `${message}${parentId}${JSON.stringify(newFiles)}${Date.now()}`;
    const newCommitId = simpleHash(commitContent);

    const newCommit: Commit = {
      id: newCommitId,
      message,
      parents: [parentId],
      files: newFiles,
      timestamp: Date.now()
    };

    this.repoState.commits[newCommitId] = newCommit;
    this.repoState.branches[this.repoState.HEAD] = newCommitId;
    this.repoState.stagingArea = {};

    return { output: `[${this.repoState.HEAD} ${newCommitId}] ${message}`, repoState: this.getState() };
  }

  private branch(args: string[]): CommandResult {
    const branchName = args[0];
    if (!branchName) {
      return { output: Object.keys(this.repoState.branches).map(b => `${b === this.repoState.HEAD ? '* ' : '  '}${b}`).join('\n'), repoState: this.getState() };
    }
    if (this.repoState.branches[branchName]) {
      return { output: `fatal: A branch named '${branchName}' already exists.`, repoState: this.getState() };
    }
    this.repoState.branches[branchName] = this.repoState.branches[this.repoState.HEAD];
    return { output: ``, repoState: this.getState() };
  }

  private checkout(args: string[]): CommandResult {
     const branchName = args[0];
    if (!branchName) {
        return { output: 'fatal: missing branch name', repoState: this.getState() };
    }
    if (!this.repoState.branches[branchName]) {
        return { output: `error: pathspec '${branchName}' did not match any file(s) known to git`, repoState: this.getState() };
    }
    this.repoState.HEAD = branchName;
    const headCommitId = this.repoState.branches[branchName];
    // This replaces working directory with files from the commit
    this.repoState.workingDirectory = JSON.parse(JSON.stringify(this.repoState.commits[headCommitId].files));
    this.repoState.stagingArea = {};
    
    // Regenerate directory structure from file paths
    const newDirs = new Set<string>();
    newDirs.add('.git'); // Always have .git dir
    for(const path in this.repoState.workingDirectory) {
        let parent = getParentPath(path);
        while(parent) {
            newDirs.add(parent);
            parent = getParentPath(parent);
        }
    }
    this.repoState.directories = Array.from(newDirs).sort();

    return { output: `Switched to branch '${branchName}'`, repoState: this.getState() };
  }
  
  private log(): CommandResult {
      let output = '';
      let currentId = this.repoState.branches[this.repoState.HEAD];
      while(currentId && currentId !== 'root') {
          const commit = this.repoState.commits[currentId];
          if(!commit) break;
          output += `commit ${commit.id}\n`;
          output += `Author: Git Gud <git.gud@example.com>\n`;
          output += `Date:   ${new Date(commit.timestamp).toString()}\n\n`;
          output += `    ${commit.message}\n\n`;
          currentId = commit.parents[0];
      }
      return { output: output.trim(), repoState: this.getState() };
  }
}
