import { useEffect } from 'react';

// Define the structure of a button config object, which we'll also use in the page component
export interface ButtonConfig {
  label: string;
  type: string;
  variant?: "default" | "secondary" | "primary" | "destructive" | "ghost" | "link";
  className?: string;
}

// Map keyboard keys to the `label` of the button in our config
const keyMap: { [key: string]: string } = {
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  '.': '.',
  '+': '+',
  '-': '-',
  '*': '×', // Map the keyboard '*' to the display '×'
  '/': '÷', // Map the keyboard '/' to the display '÷'
  'Enter': '=',
  '=': '=',
  'Escape': 'AC',
  '%': '%',
  'n': '±', // Add a key for negation
};

/**
 * A custom hook to handle keyboard input for the calculator.
 * @param buttonLayout The array of button configurations.
 * @param onButtonClick The callback function to execute when a mapped key is pressed.
 */
export const useKeyboardInput = (buttonLayout: ButtonConfig[], onButtonClick: (btn: ButtonConfig) => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const buttonLabel = keyMap[event.key];
      if (buttonLabel) {
        // Prevent default browser actions for keys like '/' (quick find)
        event.preventDefault();
        
        // Find the full button configuration object from our layout
        const button = buttonLayout.find((btn) => btn.label === buttonLabel);
        
        if (button) {
          onButtonClick(button);
        }
      }
    };

    // Add the event listener to the window
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onButtonClick, buttonLayout]); // Re-run the effect if the handlers change
};
