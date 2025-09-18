
import React from 'react';
import { RepositoryState } from '../types';
import { FolderIcon, FileCodeIcon } from './Icons';

interface FileExplorerPanelProps {
  repoState: RepositoryState;
}

const FileExplorerPanel: React.FC<FileExplorerPanelProps> = ({ repoState }) => {
  const files = Object.keys(repoState.workingDirectory);

  return (
    <div className="p-4">
      <h3 className="text-sm font-bold tracking-widest uppercase text-pr-text/60 mb-3">Explorer</h3>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-5 h-5 text-pr-text/80" />
          <span className="font-semibold">git-learner</span>
        </div>
        <div className="pl-4 border-l-2 border-pr-border/20 ml-2.5">
          {files.length > 0 ? (
            files.map(file => (
              <div key={file} className="flex items-center gap-2 py-0.5">
                <FileCodeIcon className="w-5 h-5 text-pr-text/60" />
                <span>{file}</span>
              </div>
            ))
          ) : (
            <p className="text-pr-text/50 italic pl-2">No files yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileExplorerPanel;
