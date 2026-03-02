import { safeLocalStorage } from './safeLocalStorage';

/**
 * Get the resume position for a VOD
 * @param {string} vodId - The VOD ID
 * @returns {number|null} The saved timestamp or null if none exists
 */
export const getResumePosition = (vodId) => {
  const savedPositions = safeLocalStorage.getItem('lastPlayed');
  if (savedPositions) {
    try {
      const positions = JSON.parse(savedPositions);
      if (positions[vodId] !== undefined) {
        return parseFloat(positions[vodId]);
      }
    } catch (error) {
      console.error('Error parsing resume positions:', error);
      return null;
    }
  }

  return null;
};

const MAX_POSITIONS = 100;

/**
 * Save the resume position for a VOD
 * @param {string} vodId - The VOD ID
 * @param {number} timestamp - The timestamp to save
 */
export const saveResumePosition = (vodId, timestamp) => {
  let positions;
  try {
    positions = JSON.parse(safeLocalStorage.getItem('lastPlayed') || '{}');
  } catch (error) {
    console.error('Error parsing saved positions:', error);
    positions = {};
  }

  positions[vodId] = timestamp;

  if (Object.keys(positions).length > MAX_POSITIONS) {
    const sortedEntries = Object.entries(positions)
      .sort((a, b) => a[1] - b[1])
      .slice(0, Object.keys(positions).length - MAX_POSITIONS);

    sortedEntries.forEach(([key]) => delete positions[key]);
  }

  safeLocalStorage.setItem('lastPlayed', JSON.stringify(positions));
};

/**
 * Clear the resume position for a VOD
 * @param {string} vodId - The VOD ID
 */
export const clearResumePosition = (vodId) => {
  const savedPositions = safeLocalStorage.getItem('lastPlayed');
  if (!savedPositions) return;

  try {
    const positions = JSON.parse(savedPositions);
    delete positions[vodId];
    safeLocalStorage.setItem('lastPlayed', JSON.stringify(positions));
  } catch (error) {
    console.error('Error clearing resume position:', error);
  }
};
