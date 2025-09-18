import React from 'react';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, setEnabled }) => {
  return (
    <div className="flex items-center">
      <label htmlFor="toggle" className="text-base font-medium text-pr-bg mr-3">{label}</label>
      <button
        type="button"
        id="toggle"
        onClick={() => setEnabled(!enabled)}
        className={`${
          enabled ? 'bg-pr-lime' : 'bg-pr-text/20'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pr-lime focus:ring-offset-2 focus:ring-offset-pr-dark`}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;