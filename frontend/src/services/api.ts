// The base URL for the FastAPI backend.
// Uses environment variable with fallback based on environment
const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : 'https://your-render-app.onrender.com');

/**
 * Custom error class for API errors with more context
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * A generic async function to handle POST requests to the backend.
 * It simplifies making API calls by handling headers, body stringification,
 * and comprehensive error handling.
 * @param endpoint The API endpoint to call (e.g., "/arithmetic/evaluate").
 * @param body The request payload.
 * @returns The JSON response from the API.
 * @throws APIError if the API response is not ok or network fails.
 */
async function post<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // FastAPI validation errors are often in `detail[0].msg`, others are in `detail`.
      const errorMessage = 
        errorData.detail?.[0]?.msg || 
        errorData.detail || 
        `Request failed with status ${response.status}`;
      
      throw new APIError(errorMessage, response.status, errorData);
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Network error. Please check your connection and try again.');
    }
    
    // Handle timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new APIError('Request timeout. Please try again.');
    }
    
    // Generic error
    throw new APIError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
}

/**
 * GET request handler for fetching data
 */
async function get<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new APIError(`Request failed with status ${response.status}`, response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
}

// --- API Function Definitions and Types ---

// Arithmetic
export interface ArithmeticRequest { expression: string; }
export interface ArithmeticResponse { result: number; expression: string; }
export const evaluateArithmetic = (body: ArithmeticRequest) => post<ArithmeticResponse>("/arithmetic/evaluate", body);

// Trigonometry
export type TrigonometricFunction = "sin" | "cos" | "tan" | "asin" | "acos" | "atan" | "sinh" | "cosh" | "tanh" | "asinh" | "acosh" | "atanh";
export type AngleUnit = "radians" | "degrees";
export interface TrigonometryRequest { function: TrigonometricFunction; value: number; unit: AngleUnit; }
export interface TrigonometryResponse { result: number; }
export const evaluateTrigonometry = (body: TrigonometryRequest) => post<TrigonometryResponse>("/trigonometry/evaluate", body);

// Logarithms
export type LogarithmicFunction = "ln" | "log10" | "log";
export interface LogarithmRequest { function: LogarithmicFunction; value: number; base?: number; }
export interface LogarithmResponse { result: number; }
export const evaluateLogarithm = (body: LogarithmRequest) => post<LogarithmResponse>("/logarithms/evaluate", body);

// Algebra
export interface PolynomialSolverRequest { coefficients: number[]; }
export interface PolynomialSolverResponse { roots: string[]; polynomial: string; }
export const solvePolynomial = (body: PolynomialSolverRequest) => post<PolynomialSolverResponse>("/algebra/poly-solve", body);

// Complex Numbers
export type ComplexOperation = "add" | "subtract" | "multiply" | "divide";
export interface ComplexArithmeticRequest { num1: string; num2: string; operation: ComplexOperation; }
export interface ComplexArithmeticResponse { result: string; calculation: string; }
export const evaluateComplexArithmetic = (body: ComplexArithmeticRequest) => post<ComplexArithmeticResponse>("/complex/evaluate", body);

// Calculus
export type CalculusOperation = "differentiate" | "integrate";
export interface CalculusRequest { expression: string; operation: CalculusOperation; integration_bounds?: [number, number]; }
export interface CalculusResponse { result: string; is_definite_integral: boolean; }
export const evaluateCalculus = (body: CalculusRequest) => post<CalculusResponse>("/calculus/evaluate", body);

// Matrices
export type MatrixOperation = "multiply" | "determinant" | "inverse";
export interface MatrixRequest { operation: MatrixOperation; matrix1: number[][]; matrix2?: number[][]; }
export interface MatrixResponse { result: number[][] | number; }
export const evaluateMatrix = (body: MatrixRequest) => post<MatrixResponse>("/matrices/evaluate", body);

// Statistics
export type StatisticsOperation = "mean" | "median" | "std_dev" | "variance";
export interface StatisticsRequest { operation: StatisticsOperation; data: number[]; }
export interface StatisticsResponse { result: number; }
export const evaluateStatistics = (body: StatisticsRequest) => post<StatisticsResponse>("/statistics/evaluate", body);

// Number Systems
export type NumberSystem = 2 | 8 | 10 | 16;
export interface ConversionRequest { value: string; from_base: NumberSystem; to_base: NumberSystem; }
export interface ConversionResponse { result: string; }
export const convertNumberSystem = (body: ConversionRequest) => post<ConversionResponse>("/numbers/convert", body);

// Health check
export interface HealthResponse { status: string; version: string; service: string; }
export const checkHealth = () => get<HealthResponse>("/health");