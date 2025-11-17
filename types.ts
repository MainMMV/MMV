/**
 * Enum representing the possible statuses of a goal.
 */
export enum GoalStatus {
  IN_PROGRESS = 'In progress',
  COMPLETED = 'Completed',
  NOT_STARTED = 'Not started',
  NOT_COMPLETED = 'Not Completed',
}

/**
 * Interface representing a single goal.
 */
export interface Goal {
  id: string; // Unique identifier for the goal
  name: string; // Name or description of the goal
  progress: number; // Current progress value
  endValue: number; // The target value for completion
  status: GoalStatus; // The current status of the goal
}

/**
 * Interface representing all the data for a specific month.
 */
export interface MonthData {
  id: string; // Unique identifier for the month's data
  name: string; // Display name for the month (e.g., "November 2025")
  date: string; // ISO 8601 date string
  goals: Goal[]; // An array of goals for this month
}

/**
 * Enum representing the different categories of income.
 */
export enum IncomeCategory {
  DEFAULT = 'Default',
  REJECTED = 'Rejected',
  SELLER = 'Seller',
  BANK_CARD = 'Bank Card',
  IN_CASH = 'In Cash',
  COMBINED = 'Combined',
  SOLIFY = 'Solify',
  FINE = 'Fine',
  OVERALL = 'Overall',
}

/**
 * Interface representing a single item in the income breakdown.
 */
export interface IncomeItem {
  id: string; // Unique identifier for the income item
  type: string; // Description of the income source or type
  income: number; // Income value per unit
  quantity: number; // The number of units
  category: IncomeCategory; // The category this income item belongs to
}

/**
 * Interface representing a single store plan.
 */
export interface StorePlan {
  id: string; // Unique identifier for the store plan
  name: string; // Name of the plan (e.g., "План магазина")
  plan100: number; // The 100% plan value
  actualSum: number; // The actual sum achieved
}
