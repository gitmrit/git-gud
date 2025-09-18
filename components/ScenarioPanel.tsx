import React, { useState, useEffect } from 'react';
import { SCENARIOS } from '../constants';
import { RepositoryState } from '../types';
import { CheckCircleIcon, RocketLaunchIcon, TrophyIcon, BookOpenIcon, LockClosedIcon } from './Icons';

interface ScenarioPanelProps {
  repoState: RepositoryState;
  osMode: 'unix' | 'windows';
}

const ScenarioPanel: React.FC<ScenarioPanelProps> = ({ repoState, osMode }) => {
  const [unlockedScenarios, setUnlockedScenarios] = useState<Set<string>>(new Set(['init']));

  useEffect(() => {
    const checkGoals = (currentRepoState: RepositoryState) => {
      const newlyUnlocked = new Set(unlockedScenarios);
      let goalMet = false;
      
      const completedScenarios = SCENARIOS.filter(s => s.goal(currentRepoState));
      
      if (completedScenarios.length > 0) {
        const lastCompleted = completedScenarios[completedScenarios.length - 1];
        const lastCompletedIndex = SCENARIOS.findIndex(s => s.id === lastCompleted.id);
        
        if (lastCompletedIndex < SCENARIOS.length - 1) {
          const nextScenario = SCENARIOS[lastCompletedIndex + 1];
          if (!newlyUnlocked.has(nextScenario.id)) {
            newlyUnlocked.add(nextScenario.id);
            goalMet = true;
          }
        }
      }
      
      if(goalMet) {
        setUnlockedScenarios(newlyUnlocked);
      }
    };

    checkGoals(repoState);
  }, [repoState, unlockedScenarios]);
  
  useEffect(() => {
    // Reset progress if the first scenario is no longer completed (e.g., on OS switch)
    if (!SCENARIOS[0].goal(repoState)) {
      setUnlockedScenarios(new Set(['init']));
    }
  }, [repoState]);

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
        <BookOpenIcon className="w-8 h-8"/> 
        <span>Git Scenarios</span>
      </h3>
      <div className="space-y-4">
        {SCENARIOS.map((scenario) => {
          const isUnlocked = unlockedScenarios.has(scenario.id);
          const isCompleted = scenario.goal(repoState);
          
          const description = typeof scenario.description === 'string'
            ? scenario.description
            : scenario.description[osMode];
          
          const steps = scenario.steps[osMode];

          return (
            <div key={scenario.id} className={`p-4 rounded-lg border-2 ${isUnlocked ? 'border-pr-border' : 'border-pr-border/30 bg-pr-bg/50'}`}>
              <h4 className="font-bold text-lg flex items-center gap-2">
                {isUnlocked ? (
                  isCompleted ? <CheckCircleIcon className="w-6 h-6 text-pr-lime" /> : <RocketLaunchIcon className="w-6 h-6 text-yellow-500" />
                ) : (
                  <LockClosedIcon className="w-6 h-6 text-pr-text/40"/>
                )}
                <span className={`${isUnlocked ? 'text-pr-text' : 'text-pr-text/40'}`}>{scenario.title}</span>
              </h4>
              {isUnlocked && (
                <>
                  <p className="text-pr-text/70 mt-1">{description}</p>
                  <div className="mt-3 space-y-2">
                    {steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="bg-pr-dark/50 p-2 rounded">
                        <code className="font-fira text-pr-lime">{step.command}</code>
                        <p className="text-sm text-pr-text/60 ml-1">- {step.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
         <div className="p-4 rounded-lg border-2 border-pr-border/30 bg-pr-bg/50 text-center">
            <TrophyIcon className="w-8 h-8 mx-auto text-pr-text/40 mb-2"/>
            <h4 className="font-bold text-lg text-pr-text/40">More scenarios coming soon!</h4>
         </div>
      </div>
    </div>
  );
};

export default ScenarioPanel;
