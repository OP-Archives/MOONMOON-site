/**
 * Get the resume position for a VOD
 * @param {string} vodId - The VOD ID
 * @returns {number|null} The saved timestamp or null if none exists
 */
export const getResumePosition = (vodId) => {
  try {
    const savedPositions = localStorage.getItem("lastPlayed");
    if (savedPositions) {
      const positions = JSON.parse(savedPositions);
      if (positions[vodId] !== undefined) {
        return parseFloat(positions[vodId]);
      }
    }

    return null;
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
    const savedPositions = localStorage.getItem("lastPlayed");
    const positions = savedPositions ? JSON.parse(savedPositions) : {};
    positions[vodId] = timestamp;
    localStorage.setItem("lastPlayed", JSON.stringify(positions));
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
    const savedPositions = localStorage.getItem("lastPlayed");
    if (!savedPositions) return;

    const positions = JSON.parse(savedPositions);
    delete positions[vodId];
    localStorage.setItem("lastPlayed", JSON.stringify(positions));
  } catch (error) {
    console.error("Error clearing resume position:", error);
  }
};
