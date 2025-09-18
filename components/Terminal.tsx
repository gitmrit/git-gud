import React, { useState, useRef, useEffect } from 'react';
import { CommandResult } from '../services/gitSimulator';

interface TerminalProps {
  onCommand: (command: string) => CommandResult;
  osMode: 'unix' | 'windows';
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, osMode }) => {
  const [history, setHistory] = useState<{ command: string; output: string }[]>([]);
  const [input, setInput] = useState('');
  const endOfTerminalRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<null | HTMLInputElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const { output, action } = onCommand(input.trim());

    if (action === 'clear') {
      setHistory([]);
    } else {
      setHistory(prev => [...prev, { command: input, output }]);
    }
    
    setInput('');
  };
  
  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);
  
  useEffect(() => {
    // Clear history on OS change
    setHistory([]);
  }, [osMode]);

  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  const prompt = osMode === 'unix' ? '$' : '>';

  return (
    <div className="bg-[#011627] font-fira rounded-lg h-full text-lg flex flex-col" onClick={focusInput}>
      <div className="bg-pr-dark/80 p-2 rounded-t-lg text-pr-text/60 text-sm text-pr-bg">
        C:\Users\Student\git-gud
      </div>
      <div className="p-4 overflow-y-auto flex-grow text-white">
        {history.map((line, index) => (
          <div key={index}>
            <div className="flex items-center">
              <span className="text-pr-lime mr-2 font-bold">{prompt}</span>
              <p>{line.command}</p>
            </div>
            {line.output && <pre className="whitespace-pre-wrap text-pr-bg/90">{line.output}</pre>}
          </div>
        ))}
        <form onSubmit={handleCommand} className="flex items-center">
          <span className="text-pr-lime mr-2 font-bold">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent border-none focus:ring-0 w-full text-pr-bg p-0"
            autoFocus
            spellCheck="false"
          />
        </form>
        <div ref={endOfTerminalRef} />
      </div>
    </div>
  );
};

export default Terminal;