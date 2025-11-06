/**
 * Date Utilities
 * Safe conversion functions for handling dates from various sources
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Safely converts a value to a JavaScript Date object
 * Handles Firebase Timestamps, ISO strings, JavaScript Dates, and plain objects
 */
export function toDate(value: any): Date {
  // If already a Date object
  if (value instanceof Date) {
    return value;
  }

  // If Firebase Timestamp with toDate method
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  // If Timestamp-like object (has seconds and nanoseconds)
  if (value && typeof value === 'object' && 'seconds' in value) {
    return new Timestamp(value.seconds, value.nanoseconds || 0).toDate();
  }

  // If ISO string or parseable date string
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // If number (milliseconds timestamp)
  if (typeof value === 'number') {
    return new Date(value);
  }

  // Fallback to current date
  console.warn('Unable to parse date value:', value);
  return new Date();
}

/**
 * Safely formats a date value
 * Returns empty string if value cannot be converted
 */
export function formatDate(value: any, formatFn: (date: Date) => string): string {
  try {
    const date = toDate(value);
    return formatFn(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}
