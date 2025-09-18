
import React, { useState, useEffect } from 'react';
import './index.css';
import ScenarioPanel from './components/ScenarioPanel';
import VisualizationPanel from './components/VisualizationPanel';
import Terminal from './components/Terminal';
import GeminiHelperPanel from './components/GeminiHelperPanel';
import { GitSimulator } from './services/gitSimulator';
import { RepositoryState } from './types';
import ToggleSwitch from './components/ToggleSwitch';
import { GithubIcon, BookOpenIcon } from './components/Icons';
import FileExplorerPanel from './components/FileExplorerPanel';
import LifecycleVisualizerPanel from './components/LifecycleVisualizerPanel';

const SESSION_STORAGE_KEY = 'git-gud-session';

interface SavedSession {
  repoState: RepositoryState;
  osMode: 'unix' | 'windows';
  history: { command: string; output: string }[];
}

const App: React.FC = () => {
  const [osMode, setOsMode] = useState<'unix' | 'windows'>('unix');
  const [history, setHistory] = useState<{ command: string; output: string }[]>([]);
  const [gitSimulator, setGitSimulator] = useState(() => new GitSimulator('unix'));
  const [repoState, setRepoState] = useState<RepositoryState>(gitSimulator.getState());
  const [topicToExplain, setTopicToExplain] = useState<string | null>(null);

  // Effect for loading state ONCE on mount
  useEffect(() => {
    const savedJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedJSON) {
      try {
        const saved: SavedSession = JSON.parse(savedJSON);
        const newSimulator = new GitSimulator(saved.osMode);
        newSimulator.setState(saved.repoState);
        
        setOsMode(saved.osMode);
        setHistory(saved.history);
        setGitSimulator(newSimulator);
        setRepoState(newSimulator.getState());
      } catch (e) {
        console.error("Failed to load session:", e);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, []); // Empty dependency array means it runs only on mount.
  
  // Effect for SAVING state whenever it changes
  useEffect(() => {
    // Avoid saving the initial empty state before hydration from session storage
    if (history.length === 0 && Object.keys(repoState.workingDirectory).length === 0 && repoState.HEAD === '') {
        const savedJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if(!savedJSON) return;
    }
    const stateToSave: SavedSession = { osMode, repoState, history };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [osMode, repoState, history]);
  
  const handleOsChange = (enabled: boolean) => {
    const newOsMode = enabled ? 'windows' : 'unix';
    if (newOsMode === osMode) return;
    
    // Reset everything for the new OS
    const newSimulator = new GitSimulator(newOsMode);
    setOsMode(newOsMode);
    setHistory([]);
    setGitSimulator(newSimulator);
    setRepoState(newSimulator.getState());
  };

  const handleCommand = (command: string): void => {
    const result = gitSimulator.execute(command);
    // The simulator's internal state has changed, so we need a fresh copy for React.
    setRepoState(gitSimulator.getState());
    
    if (result.action === 'clear') {
      setHistory([]);
    } else {
      setHistory(prev => [...prev, { command: command, output: result.output }]);
    }
  };
  
  const handleHintClick = (topic: string) => {
    let cleanedTopic = topic;
    // For specific commands, create a more general query for the AI.
    if (topic.startsWith('git commit -m')) {
        cleanedTopic = 'git commit -m';
    } else if (topic.startsWith('git add')) {
        cleanedTopic = 'git add';
    } else if (topic.startsWith('touch') || topic.startsWith('echo')) {
        cleanedTopic = `the ${topic.split(' ')[0]} command`;
    }
    setTopicToExplain(cleanedTopic);
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
              setEnabled={handleOsChange} 
            />
            <a href="https://github.com/google/generative-ai-docs" target="_blank" rel="noopener noreferrer" className="text-pr-bg hover:text-pr-lime transition-colors">
                <GithubIcon className="w-7 h-7" />
            </a>
        </div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 mx-auto">
        <div className="lg:col-span-2">
          <FileExplorerPanel repoState={repoState} />
          <ScenarioPanel repoState={repoState} osMode={osMode} onHintClick={handleHintClick} />
        </div>
        <div className='lg:col-span-8'>
           <div className="flex flex-col gap-4 h-full">
                <div className="space-y-4">
                    <LifecycleVisualizerPanel repoState={repoState} />
                    <VisualizationPanel repoState={repoState} />
                </div>
                <div className="flex-grow min-h-0">
                    <Terminal onCommand={handleCommand} osMode={osMode} history={history} />
                </div>
           </div>
        </div>
        <div className="lg:col-span-2">
            <GeminiHelperPanel 
              topicToExplain={topicToExplain}
              onExplanationDone={() => setTopicToExplain(null)}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
