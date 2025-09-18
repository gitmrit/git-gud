import React, { useState, useMemo, useEffect } from 'react';
import './index.css';
import ScenarioPanel from './components/ScenarioPanel';
import VisualizationPanel from './components/VisualizationPanel';
import Terminal from './components/Terminal';
import GeminiHelperPanel from './components/GeminiHelperPanel';
import { GitSimulator, CommandResult } from './services/gitSimulator';
import { RepositoryState } from './types';
import ToggleSwitch from './components/ToggleSwitch';
import { GithubIcon, BookOpenIcon } from './components/Icons';
import FileExplorerPanel from './components/FileExplorerPanel';
import LifecycleVisualizerPanel from './components/LifecycleVisualizerPanel';


const App: React.FC = () => {
  const [osMode, setOsMode] = useState<'unix' | 'windows'>('unix');
  const [gitSimulator, setGitSimulator] = useState(() => new GitSimulator(osMode));
  const [repoState, setRepoState] = useState<RepositoryState>(gitSimulator.getState());

  useEffect(() => {
    const newSimulator = new GitSimulator(osMode);
    setGitSimulator(newSimulator);
    setRepoState(newSimulator.getState());
  }, [osMode]);

  const handleCommand = (command: string): CommandResult => {
    const result = gitSimulator.execute(command);
    setRepoState(result.repoState);
    return result;
  };
  
  return (
    <div className="bg-pr-bg text-pr-text min-h-screen font-sans">
      <header className="bg-pr-dark border-b-2 border-pr-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-pr-lime" />
            <h1 className="text-2xl font-bold text-pr-bg">Interactive Git Simulator</h1>
        </div>
        <div className="flex items-center gap-6">
            <ToggleSwitch 
              label="Windows OS" 
              enabled={osMode === 'windows'} 
              setEnabled={(enabled) => setOsMode(enabled ? 'windows' : 'unix')} 
            />
            <a href="https://github.com/google/generative-ai-docs" target="_blank" rel="noopener noreferrer" className="text-pr-bg hover:text-pr-lime transition-colors">
                <GithubIcon className="w-7 h-7" />
            </a>
        </div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 mx-auto">
        <div className="lg:col-span-2">
          <ScenarioPanel repoState={repoState} osMode={osMode}/>
          <FileExplorerPanel repoState={repoState} />
        </div>
        <div className='lg:col-span-8'>
           <div className="flex flex-col gap-4 h-full">
                <div className="space-y-4">
                    <LifecycleVisualizerPanel repoState={repoState} />
                    <VisualizationPanel repoState={repoState} />
                </div>
                <div className="flex-grow min-h-0">
                    <Terminal onCommand={handleCommand} osMode={osMode} />
                </div>
           </div>
        </div>
        <div className="lg:col-span-2">
            <GeminiHelperPanel />
        </div>
      </main>
    </div>
  );
};

export default App;