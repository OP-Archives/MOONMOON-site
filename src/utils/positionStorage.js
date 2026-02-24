/**
 * Get the resume position for a VOD
 * @param {string} vodId - The VOD ID
 * @returns {number|null} The saved timestamp or null if none exists
 */
export const getResumePosition = (vodId) => {
  try {
    const key = `lastPlayed_${vodId}`;
    const position = localStorage.getItem(key);
    return position ? parseFloat(position) : null;
  } catch (error) {
    console.error("Error reading resume position:", error);
    return null;
  }
};

/**
 * Save the resume position for a VOD
 * @param {string} vodId - The VOD ID
 * @param {number} timestamp - The timestamp to save
 */
export const saveResumePosition = (vodId, timestamp) => {
  try {
    const key = `lastPlayed_${vodId}`;
    localStorage.setItem(key, timestamp.toString());
  } catch (error) {
    console.error("Error saving resume position:", error);
  }
};

/**
 * Clear the resume position for a VOD
 * @param {string} vodId - The VOD ID
 */
export const clearResumePosition = (vodId) => {
  try {
    const key = `lastPlayed_${vodId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing resume position:", error);
  }
};