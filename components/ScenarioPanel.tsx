
import React, { useState, useEffect, useRef } from 'react';
import { EXPERIMENTS } from '../constants';
import { RepositoryState, Experiment } from '../types';
import { CheckCircleIcon, RocketLaunchIcon, BookOpenIcon, LightbulbIcon, BeakerIcon, ChevronDownIcon } from './Icons';

interface ScenarioPanelProps {
  repoState: RepositoryState;
  osMode: 'unix' | 'windows';
  onHintClick: (topic: string) => void;
}

const ScenarioPanel: React.FC<ScenarioPanelProps> = ({ repoState, osMode, onHintClick }) => {
  const [selectedExperimentId, setSelectedExperimentId] = useState(EXPERIMENTS[0].id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const selectedExperiment = EXPERIMENTS.find(e => e.id === selectedExperimentId) || EXPERIMENTS[0];
  
  const areAllExercisesInExpComplete = (exp: Experiment) => {
      return exp.exercises.every(ex => ex.goal(repoState));
  }
  
  const getExperimentStatusIcon = (exp: Experiment) => {
      if (areAllExercisesInExpComplete(exp)) {
          return <CheckCircleIcon className="w-5 h-5 text-pr-lime" />;
      }
      return <RocketLaunchIcon className="w-5 h-5 text-yellow-500" />;
  }

  return (
    <div className="p-4 mt-4 border-t-2 border-pr-border/20">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
        <BookOpenIcon className="w-8 h-8"/>
        <span>Experiments</span>
      </h3>
      
      <div ref={dropdownRef} className="relative mb-4">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-pr-dark text-pr-bg p-3 rounded-lg flex justify-between items-center border-2 border-pr-border hover:border-pr-lime transition-colors"
        >
          <span className="font-bold">{selectedExperiment.title}</span>
          <ChevronDownIcon className={`w-6 h-6 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-pr-dark border-2 border-pr-border rounded-lg shadow-lg max-h-72 overflow-y-auto">
            <ul>
              {EXPERIMENTS.map((exp) => (
                <li key={exp.id}>
                  <button 
                    onClick={() => { setSelectedExperimentId(exp.id); setIsDropdownOpen(false); }}
                    className="w-full text-left p-3 text-pr-bg hover:bg-pr-lime/20 flex items-center gap-3"
                  >
                    <span className="flex-shrink-0 w-5">{getExperimentStatusIcon(exp)}</span>
                    <span className="flex-grow">{exp.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div key={selectedExperiment.id} className="p-4 rounded-lg border-2 border-pr-border">
          <h4 className="font-bold text-xl flex items-center gap-2 mb-2">
              <BeakerIcon className="w-7 h-7 text-pr-lime" />
              <span>{selectedExperiment.title}</span>
          </h4>
          <p className="text-pr-text/70 mb-4 ml-1">{selectedExperiment.description}</p>
          <div className="space-y-4">
            {selectedExperiment.exercises.map((exercise) => {
              const isCompleted = exercise.goal(repoState);
              const description = typeof exercise.description === 'string'
                ? exercise.description
                : exercise.description[osMode];
              const steps = exercise.steps[osMode];

              return (
                <div key={exercise.id} className="p-3 rounded-lg border-2 border-pr-border/50">
                  <h5 className="font-bold text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCompleted ? <CheckCircleIcon className="w-6 h-6 text-pr-lime" /> : <RocketLaunchIcon className="w-6 h-6 text-yellow-500" />}
                      <span>{exercise.title}</span>
                    </div>
                    <button onClick={() => onHintClick(exercise.title)} className="text-pr-text/50 hover:text-pr-lime transition-colors" aria-label={`Explain ${exercise.title}`}>
                      <LightbulbIcon className="w-6 h-6"/>
                    </button>
                  </h5>
                  <p className="text-pr-text/70 mt-1">{description}</p>
                  <div className="mt-3 space-y-2">
                    {steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="bg-pr-dark/50 p-2 rounded flex justify-between items-center">
                        <div>
                          <code className="font-fira text-pr-lime">{step.command}</code>
                          <p className="text-sm text-pr-text/60 ml-1">- {step.description}</p>
                        </div>
                        <button onClick={() => onHintClick(step.command)} className="text-pr-text/50 hover:text-pr-lime transition-colors flex-shrink-0 ml-2" aria-label={`Explain ${step.command}`}>
                          <LightbulbIcon className="w-5 h-5"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioPanel;
