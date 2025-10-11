/**
 * Ceremony calculation utilities for sprint capacity planning
 * Handles time calculations for Scrum ceremonies based on squad defaults
 */

export interface CeremonyDefaults {
  dailyScrumMinutes: number;
  refinementHours: number;
  reviewDemoMinutes: number;
  planningHours: number;
  retrospectiveMinutes: number;
}

export interface CeremonyCalculationResult {
  dailyScrumTotal: number; // Total minutes for daily scrums in sprint
  refinementTotal: number; // Total hours for refinement sessions
  reviewDemoTotal: number; // Total minutes for review/demo
  planningTotal: number; // Total hours for sprint planning
  retrospectiveTotal: number; // Total minutes for retrospective
  totalCeremonyHours: number; // Sum of all ceremony time in hours
}

/**
 * Calculate ceremony time allocation for a sprint based on squad defaults
 * @param defaults - Squad ceremony time defaults
 * @param sprintStartDate - Start date of the sprint
 * @param sprintEndDate - End date of the sprint (inclusive)
 * @returns CeremonyCalculationResult with time allocations
 */
export function calculateCeremonyTime(
  defaults: CeremonyDefaults,
  sprintStartDate: Date,
  sprintEndDate: Date
): CeremonyCalculationResult {
  // Calculate working days (excluding weekends)
  const workingDays = calculateWorkingDays(sprintStartDate, sprintEndDate);

  // Calculate ceremony times
  const dailyScrumTotal = defaults.dailyScrumMinutes * workingDays;
  const refinementTotal = defaults.refinementHours;
  const reviewDemoTotal = defaults.reviewDemoMinutes;
  const planningTotal = defaults.planningHours;
  const retrospectiveTotal = defaults.retrospectiveMinutes;

  // Convert everything to hours for total
  const totalCeremonyHours =
    (dailyScrumTotal / 60) + // Convert minutes to hours
    refinementTotal +
    (reviewDemoTotal / 60) + // Convert minutes to hours
    planningTotal +
    (retrospectiveTotal / 60); // Convert minutes to hours

  return {
    dailyScrumTotal,
    refinementTotal,
    reviewDemoTotal,
    planningTotal,
    retrospectiveTotal,
    totalCeremonyHours: Math.round(totalCeremonyHours * 100) / 100 // Round to 2 decimal places
  };
}

/**
 * Calculate the number of working days between two dates (excluding weekends)
 * @param startDate - Start date
 * @param endDate - End date (inclusive)
 * @returns Number of working days
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Format ceremony time for display
 * @param minutes - Time in minutes
 * @param unit - Unit to display ('minutes' or 'hours')
 * @returns Formatted string
 */
export function formatCeremonyTime(minutes: number, unit: 'minutes' | 'hours' = 'minutes'): string {
  if (unit === 'hours') {
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
  }
  return `${minutes}min`;
}

/**
 * Get default ceremony values for new squads
 */
export const DEFAULT_CEREMONY_VALUES: CeremonyDefaults = {
  dailyScrumMinutes: 15,
  refinementHours: 1,
  reviewDemoMinutes: 30,
  planningHours: 2,
  retrospectiveMinutes: 30
};