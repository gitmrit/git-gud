
import React from 'react';
import { RepositoryState } from '../types';
import { ArrowRightIcon, FileIcon } from './Icons';

interface LifecycleVisualizerPanelProps {
  repoState: RepositoryState;
}

const LifecycleVisualizerPanel: React.FC<LifecycleVisualizerPanelProps> = ({ repoState }) => {
  const { commits, branches, HEAD, stagingArea, workingDirectory } = repoState;

  const isInitialized = Object.keys(commits).length > 0 && commits.root;

  if (!isInitialized) {
    return null; // Don't show if not initialized
  }
  
  const headCommit = commits[branches[HEAD]];
  const committedFiles = headCommit?.files || {};

  const allFileNames = new Set([
      ...Object.keys(workingDirectory), 
      ...Object.keys(stagingArea), 
      ...Object.keys(committedFiles)
    ]);

  const wdDisplay: { name: string, status: 'untracked' | 'modified' }[] = [];
  const stagedDisplay: { name: string, status: 'staged' }[] = [];

  for (const file of allFileNames) {
    const inWd = file in workingDirectory;
    const inStaging = file in stagingArea;
    const inCommit = file in committedFiles;
    
    if (inStaging) {
      stagedDisplay.push({ name: file, status: 'staged' });
    }

    if (inWd) {
      if (!inCommit && !inStaging) {
        wdDisplay.push({ name: file, status: 'untracked' });
      } else if (inCommit && !inStaging) {
        if (workingDirectory[file].content !== committedFiles[file].content) {
          wdDisplay.push({ name: file, status: 'modified' });
        }
      }
    }
  }

  const committedDisplay = Object.keys(committedFiles).map(name => ({ name, status: 'committed' }));

  const FilePill: React.FC<{ file: { name: string, status: string } }> = ({ file }) => {
    const colors: Record<string, string> = {
      untracked: 'bg-red-500/10 text-red-700 border-red-500/30',
      modified: 'bg-yellow-500/10 text-yellow-800 border-yellow-500/30',
      staged: 'bg-green-500/10 text-green-700 border-green-500/30',
      committed: 'bg-pr-text/10 text-pr-text border-pr-border/30',
    };
    return (
      <div className={`flex items-center gap-2 p-2 rounded-md border ${colors[file.status]}`}>
        <FileIcon className="w-5 h-5" />
        <span className="font-fira text-sm">{file.name}</span>
      </div>
    );
  };

  return (
    <div className="border-2 border-pr-border p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-pr-border">File Lifecycle</h3>
      <div className="flex flex-col md:flex-row justify-between items-start gap-2">
        
        {/* Working Directory */}
        <div className="flex-1 p-3 rounded-md min-h-[8rem] bg-pr-bg/50 w-full">
          <h4 className="font-bold text-center text-lg mb-2">Working Directory</h4>
          <div className="space-y-2">
            {wdDisplay.length === 0 && <p className="text-center text-pr-text/50 italic py-2">Clean</p>}
            {wdDisplay.map(file => <FilePill key={file.name} file={file} />)}
          </div>
        </div>
        
        {/* Arrow for git add */}
        <div className="flex-shrink-0 text-center self-center px-2 py-4">
            <p className="font-fira font-bold text-sm">git add</p>
            <ArrowRightIcon className="w-10 h-10 mx-auto text-pr-text/50 transform md:rotate-0 rotate-90"/>
        </div>
        
        {/* Staging Area */}
        <div className="flex-1 p-3 rounded-md min-h-[8rem] bg-pr-bg/50 w-full">
          <h4 className="font-bold text-center text-lg mb-2">Staging Area</h4>
          <div className="space-y-2">
             {stagedDisplay.length === 0 && <p className="text-center text-pr-text/50 italic py-2">Empty</p>}
             {stagedDisplay.map(file => <FilePill key={file.name} file={file} />)}
          </div>
        </div>

        {/* Arrow for git commit */}
        <div className="flex-shrink-0 text-center self-center px-2 py-4">
            <p className="font-fira font-bold text-sm">git commit</p>
            <ArrowRightIcon className="w-10 h-10 mx-auto text-pr-text/50 transform md:rotate-0 rotate-90"/>
        </div>

        {/* Local Repo */}
        <div className="flex-1 p-3 rounded-md min-h-[8rem] bg-pr-bg/50 w-full">
            <h4 className="font-bold text-center text-lg mb-2">Local Repository</h4>
            <div className="space-y-2">
                {committedDisplay.length === 0 && <p className="text-center text-pr-text/50 italic py-2">No Commits</p>}
                {committedDisplay.map(file => <FilePill key={file.name} file={file} />)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LifecycleVisualizerPanel;
