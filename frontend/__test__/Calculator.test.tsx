import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import { evaluateArithmetic } from '@/services/api';

// Mock the API
jest.mock('@/services/api', () => ({
  evaluateArithmetic: jest.fn(),
  APIError: class APIError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'APIError';
    }
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Calculator - Complete Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial Rendering', () => {
    it('renders calculator with initial value of 0', () => {
      render(<HomePage />);
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    });

    it('renders in basic mode by default', () => {
      render(<HomePage />);
      const modeToggle = screen.getByTestId('mode-toggle-button');
      expect(modeToggle).toHaveTextContent('Scientific');
    });

    it('renders all basic calculator buttons', () => {
      render(<HomePage />);
      
      // Numbers - use testid to avoid display ambiguity
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByTestId(`button-${i}`)).toBeInTheDocument();
      }
      
      // Operators
      expect(screen.getByText('+')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('×')).toBeInTheDocument();
      expect(screen.getByText('÷')).toBeInTheDocument();
      
      // Special buttons
      expect(screen.getByText('AC')).toBeInTheDocument();
      expect(screen.getByText('±')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
      expect(screen.getByText('.')).toBeInTheDocument();
      expect(screen.getByText('=')).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('switches to scientific mode when button is clicked', () => {
      render(<HomePage />);
      
      const switchButton = screen.getByTestId('mode-toggle-button');
      fireEvent.click(switchButton);
      
      expect(switchButton).toHaveTextContent('Basic');
    });

    it('renders scientific function buttons in scientific mode', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('mode-toggle-button'));
      
      expect(screen.getByText('sin')).toBeInTheDocument();
      expect(screen.getByText('cos')).toBeInTheDocument();
      expect(screen.getByText('tan')).toBeInTheDocument();
      expect(screen.getByText('√')).toBeInTheDocument();
    });

    it('switches back to basic mode', () => {
      render(<HomePage />);
      
      const modeToggle = screen.getByTestId('mode-toggle-button');
      fireEvent.click(modeToggle);
      expect(modeToggle).toHaveTextContent('Basic');
      
      fireEvent.click(modeToggle);
      expect(modeToggle).toHaveTextContent('Scientific');
    });

    it('preserves current value when switching modes', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('button-5'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
      
      fireEvent.click(screen.getByTestId('mode-toggle-button'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
      
      fireEvent.click(screen.getByTestId('mode-toggle-button'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
    });
  });

  describe('Basic Number Entry', () => {
    it('displays single digit numbers when clicked', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('button-7'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('7');
    });

    it('displays multi-digit numbers when clicked', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('button-1'));
      fireEvent.click(screen.getByTestId('button-2'));
      fireEvent.click(screen.getByTestId('button-3'));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('123');
    });

    it('replaces 0 with first digit entered', () => {
      render(<HomePage />);
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
      fireEvent.click(screen.getByTestId('button-5'));
      expect(screen.getByTestId('calculator-display')).not.toHaveTextContent('0');
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
    });
  });

  describe('Basic Arithmetic Operations', () => {
    it('performs addition correctly', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 5,
        expression: '2 + 3'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
      });

      expect(evaluateArithmetic).toHaveBeenCalledWith({
        expression: '2 + 3'
      });
    });

    it('performs subtraction correctly', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 7,
        expression: '10 - 3'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('0'));
      fireEvent.click(screen.getByText('-'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('7');
      });
    });

    it('performs multiplication correctly', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 15,
        expression: '3 * 5'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('×'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('15');
      });

      expect(evaluateArithmetic).toHaveBeenCalledWith({
        expression: '3 * 5'
      });
    });

    it('performs division correctly', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 4,
        expression: '12 / 3'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('÷'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('4');
      });

      expect(evaluateArithmetic).toHaveBeenCalledWith({
        expression: '12 / 3'
      });
    });
  });

  describe('Complex Arithmetic Operations', () => {
    it('handles order of operations correctly', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 14,
        expression: '2 + 3 * 4'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('×'));
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('14');
      });
    });

    it('performs multi-step calculations', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 20,
        expression: '5 + 5 + 5 + 5'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('20');
      });
    });
  });

  describe('Decimal Operations', () => {
    it('handles decimal points correctly', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('.'));
      fireEvent.click(screen.getByText('5'));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('1.5');
    });

    it('prevents multiple decimal points', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('.'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('.'));
      fireEvent.click(screen.getByText('2'));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('1.52');
    });

    it('performs decimal arithmetic', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 3.7,
        expression: '1.2 + 2.5'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('.'));
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('.'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('3.7');
      });
    });
  });

  describe('Special Operations', () => {
    it('clears display when AC is clicked', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('6'));
      fireEvent.click(screen.getByText('7'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('567');
      
      fireEvent.click(screen.getByText('AC'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    });

    it('negates positive numbers', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('±'));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('-5');
    });

    it('negates negative numbers back to positive', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('±'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('-5');
      
      fireEvent.click(screen.getByText('±'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
    });

    it('calculates percentage correctly', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('0'));
      fireEvent.click(screen.getByText('%'));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0.5');
    });

    it('calculates percentage of decimal numbers', () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('.'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('%'));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0.025');
    });
  });

  describe('Scientific Functions', () => {
    it('shows coming soon message for sin function', async () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('mode-toggle-button'));
      fireEvent.click(screen.getByText('sin'));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('Scientific functions coming soon!');
      });
    });

    it('shows coming soon message for cos function', async () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('mode-toggle-button'));
      fireEvent.click(screen.getByText('cos'));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('Scientific functions coming soon!');
      });
    });

    it('shows coming soon message for tan function', async () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('mode-toggle-button'));
      fireEvent.click(screen.getByText('tan'));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('Scientific functions coming soon!');
      });
    });

    it('shows coming soon message for square root function', async () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('mode-toggle-button'));
      fireEvent.click(screen.getByText('√'));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('Scientific functions coming soon!');
      });
    });

    it('clears scientific function message on number input', async () => {
      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('mode-toggle-button'));
      fireEvent.click(screen.getByText('sin'));
      
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('Scientific functions coming soon!');
      
      // Error should clear on new input
      fireEvent.click(screen.getByText('5'));
      
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
    });
  });

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      (evaluateArithmetic as jest.Mock).mockRejectedValue(
        new Error('Division by zero')
      );

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('÷'));
      fireEvent.click(screen.getByTestId('button-0'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        const display = screen.getByTestId('calculator-display');
        expect(display.textContent).toMatch(/error|failed/i);
      });
    });

    it('clears error on new number input', async () => {
      (evaluateArithmetic as jest.Mock).mockRejectedValue(
        new Error('Invalid expression')
      );

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        const display = screen.getByTestId('calculator-display');
        expect(display.textContent).toMatch(/error|failed/i);
      });

      fireEvent.click(screen.getByText('1'));
      const display = screen.getByTestId('calculator-display');
      expect(display.textContent).not.toMatch(/error|failed/i);
    });

    it('clears error when AC is pressed', async () => {
      (evaluateArithmetic as jest.Mock).mockRejectedValue(
        new Error('Invalid')
      );

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        const display = screen.getByTestId('calculator-display');
        expect(display.textContent).toMatch(/error|failed/i);
      });

      fireEvent.click(screen.getByText('AC'));
      const display = screen.getByTestId('calculator-display');
      expect(display.textContent).not.toMatch(/error|failed/i);
      expect(display).toHaveTextContent('0');
    });
  });

  describe('History Functionality', () => {
    it('adds calculations to history', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 8,
        expression: '5 + 3'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        const historyExpression = screen.getByTestId('history-expression-0');
        const historyResult = screen.getByTestId('history-result-0');
        expect(historyExpression).toHaveTextContent('5 + 3 =');
        expect(historyResult).toHaveTextContent('8');
      });
    });

    it('stores multiple calculations in history', async () => {
      (evaluateArithmetic as jest.Mock)
        .mockResolvedValueOnce({ result: 5, expression: '2 + 3' })
        .mockResolvedValueOnce({ result: 10, expression: '6 + 4' });

      render(<HomePage />);
      
      // First calculation
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('history-result-0')).toHaveTextContent('5');
      });

      fireEvent.click(screen.getByText('AC'));

      // Second calculation
      fireEvent.click(screen.getByText('6'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('history-result-0')).toHaveTextContent('10');
      });

      expect(screen.getByTestId('history-result-1')).toHaveTextContent('5');
    });

    it('clears history when clear button is clicked', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 8,
        expression: '5 + 3'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('history-result-0')).toHaveTextContent('8');
      });

      const clearButton = screen.getByTestId('clear-history-button');
      fireEvent.click(clearButton);
      
      expect(screen.queryByTestId('history-item-0')).not.toBeInTheDocument();
      expect(screen.getByTestId('history-empty')).toBeInTheDocument();
    });

    it('allows selecting history items to reuse results', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 42,
        expression: '40 + 2'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByText('0'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('42');
      });

      fireEvent.click(screen.getByText('AC'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');

      // Click on history item
      const historyItem = screen.getByTestId('history-item-0');
      fireEvent.click(historyItem);

      expect(screen.getByTestId('calculator-display')).toHaveTextContent('42');
    });

    it('persists history to localStorage', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 10,
        expression: '5 + 5'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('history-result-0')).toHaveTextContent('10');
      });

      const savedHistory = localStorage.getItem('calculator-history');
      expect(savedHistory).toBeTruthy();
      expect(JSON.parse(savedHistory!)).toContain('5 + 5 = 10');
    });
  });

  describe('Operation Chaining', () => {
    it('allows chaining operations after equals', async () => {
      (evaluateArithmetic as jest.Mock)
        .mockResolvedValueOnce({ result: 5, expression: '2 + 3' })
        .mockResolvedValueOnce({ result: 10, expression: '5 * 2' });

      render(<HomePage />);
      
      // First calculation
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
      });

      // Chain another operation
      fireEvent.click(screen.getByText('×'));
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('10');
      });
    });

    it('starts new calculation when number is pressed after equals', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 7,
        expression: '3 + 4'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('7');
      });

      // Start new calculation
      fireEvent.click(screen.getByTestId('button-9'));
      expect(screen.getByTestId('calculator-display')).toHaveTextContent('9');
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator during calculation', async () => {
      (evaluateArithmetic as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ result: 5, expression: '2 + 3' }), 100))
      );

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      expect(screen.getByTestId('loading-text')).toHaveTextContent('Calculating...');
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
      });
      
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very large numbers', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 1000000,
        expression: '999999 + 1'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByTestId('button-9'));
      fireEvent.click(screen.getByTestId('button-9'));
      fireEvent.click(screen.getByTestId('button-9'));
      fireEvent.click(screen.getByTestId('button-9'));
      fireEvent.click(screen.getByTestId('button-9'));
      fireEvent.click(screen.getByTestId('button-9'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('1000000');
      });
    });

    it('prevents duplicate equals presses', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: 5,
        expression: '2 + 3'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('3'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
      });

      // Press equals again
      fireEvent.click(screen.getByText('='));
      
      // Should only be called once
      expect(evaluateArithmetic).toHaveBeenCalledTimes(1);
    });

    it('handles negative result formatting', async () => {
      (evaluateArithmetic as jest.Mock).mockResolvedValue({
        result: -5,
        expression: '2 - 7'
      });

      render(<HomePage />);
      
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('-'));
      fireEvent.click(screen.getByText('7'));
      fireEvent.click(screen.getByText('='));
      
      await waitFor(() => {
        expect(screen.getByTestId('calculator-display')).toHaveTextContent('-5');
      });
    });
  });
});