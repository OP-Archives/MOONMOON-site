/**
 * Get the resume position for a VOD
 * @param {string} vodId - The VOD ID
 * @returns {number|null} The saved timestamp or null if none exists
 */
export const getResumePosition = (vodId) => {
  try {
    const savedPositions = localStorage.getItem('lastPlayed');
    if (savedPositions) {
      const positions = JSON.parse(savedPositions);
      if (positions[vodId] !== undefined) {
        return parseFloat(positions[vodId]);
      }
    }

    return null;
  } catch (error) {
    console.error('Error reading resume position:', error);
    return null;
  }
};

const MAX_POSITIONS = 100;

/**
 * Save the resume position for a VOD
 * @param {string} vodId - The VOD ID
 * @param {number} timestamp - The timestamp to save
 */
export const saveResumePosition = (vodId, timestamp) => {
  try {
    let positions = JSON.parse(localStorage.getItem('lastPlayed') || '{}');
    
    positions[vodId] = timestamp;
    
    if (Object.keys(positions).length > MAX_POSITIONS) {
      const sortedEntries = Object.entries(positions)
        .sort((a, b) => a[1] - b[1])
        .slice(0, Object.keys(positions).length - MAX_POSITIONS);
      
      sortedEntries.forEach(([key]) => delete positions[key]);
    }
    
    localStorage.setItem('lastPlayed', JSON.stringify(positions));
  } catch (error) {
    console.error('Error saving resume position:', error);
  }
};

/**
 * Clear the resume position for a VOD
 * @param {string} vodId - The VOD ID
 */
export const clearResumePosition = (vodId) => {
  try {
    const savedPositions = localStorage.getItem('lastPlayed');
    if (!savedPositions) return;

    const positions = JSON.parse(savedPositions);
    delete positions[vodId];
    localStorage.setItem('lastPlayed', JSON.stringify(positions));
  } catch (error) {
    console.error('Error clearing resume position:', error);
  }
};
