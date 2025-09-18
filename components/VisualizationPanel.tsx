import React from 'react';
import { RepositoryState, Commit } from '../types';
import { GitBranchIcon, GitCommitIcon, FileIcon, AlertTriangleIcon } from './Icons';

interface VisualizationPanelProps {
  repoState: RepositoryState;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ repoState }) => {
  const { commits, branches, HEAD, stagingArea, workingDirectory } = repoState;

  const isInitialized = Object.keys(commits).length > 0 && commits.root;

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-pr-text/50">
        <AlertTriangleIcon className="w-16 h-16 mb-4"/>
        <h3 className="text-2xl font-semibold">Repository not initialized</h3>
        <p className="font-fira mt-2 text-lg">Run `git init` to begin</p>
      </div>
    );
  }

  const commitList: Commit[] = [];
  const visited = new Set<string>();

  function traverse(commitId: string) {
    if (!commitId || visited.has(commitId) || !commits[commitId] || commitId === 'root') return;
    visited.add(commitId);
    commitList.unshift(commits[commitId]); // Add to the beginning to reverse order
    if(commits[commitId].parents) {
      // Simple traversal for now, doesn't draw branches perfectly
      traverse(commits[commitId].parents[0]);
    }
  }

  traverse(branches[HEAD]);

  const branchTips: Record<string, string[]> = {};
  for (const branchName in branches) {
    const commitId = branches[branchName];
    if (!branchTips[commitId]) {
      branchTips[commitId] = [];
    }
    branchTips[commitId].push(branchName);
  }

  const stagedFiles = Object.keys(stagingArea);
  
  const headCommit = commits[branches[HEAD]];
  const modifiedFiles: string[] = [];
  const untrackedFiles: string[] = [];

  for(const file in workingDirectory) {
    if (!headCommit?.files[file] && !stagingArea[file]) {
        untrackedFiles.push(file);
    } else if (headCommit?.files[file] && !stagingArea[file]) {
        if(workingDirectory[file].content !== headCommit.files[file].content) {
          modifiedFiles.push(file);
        }
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-pr-border">Commit History</h3>
        <div className="relative pt-4">
          {commitList.length === 0 && <p className="text-pr-text/60">No commits yet. Make your first commit!</p>}
          {commitList.map((commit, index) => (
             <div key={commit.id} className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <GitCommitIcon className="w-6 h-6 text-pr-text/70 z-10 bg-pr-bg" />
                {index < commitList.length - 1 && <div className="w-0.5 h-20 bg-pr-border/30"></div>}
              </div>
              <div className="pb-8">
                <p className="font-fira text-pr-text font-semibold text-lg">{commit.message}</p>
                <p className="text-base text-pr-text/60 font-fira">{commit.id}</p>
                 <div className="flex items-center flex-wrap gap-2 mt-2">
                    {branchTips[commit.id]?.map(b => (
                      <span key={b} className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-md ${ b === HEAD ? 'bg-pr-lime text-pr-dark border-2 border-pr-border' : 'bg-pr-text/10 text-pr-text border border-pr-border/30'}`}>
                        <GitBranchIcon className="w-4 h-4" />
                        {b} {b === HEAD && '(HEAD)'}
                      </span>
                    ))}
                  </div>
              </div>
             </div>
          ))}
        </div>
      </div>
      <div className="border-2 border-pr-border p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-pr-border">File Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-lg text-pr-text mb-2">Staging Area</h4>
            <div className="p-3 rounded-md bg-green-500/10 min-h-[6rem]">
            {stagedFiles.length > 0 ? (
              <ul className="space-y-1">
                {stagedFiles.map(file => <li key={file} className="flex items-center gap-2 font-fira text-base"><FileIcon className="w-5 h-5 text-green-700"/> {file}</li>)}
              </ul>
            ) : <p className="text-pr-text/60 text-base">No changes staged</p>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-pr-text mb-2">Working Directory</h4>
             <div className="p-3 rounded-md bg-yellow-500/10 min-h-[6rem]">
            {modifiedFiles.length === 0 && untrackedFiles.length === 0 ? <p className="text-pr-text/60 text-base">Working directory clean</p> : (
              <ul className="space-y-1">
                {modifiedFiles.map(file => <li key={file} className="flex items-center gap-2 font-fira text-base text-yellow-800"><FileIcon className="w-5 h-5"/> M {file}</li>)}
                {untrackedFiles.map(file => <li key={file} className="flex items-center gap-2 font-fira text-base text-red-700"><FileIcon className="w-5 h-5"/> ?? {file}</li>)}
              </ul>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;