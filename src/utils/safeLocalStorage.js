export const safeLocalStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage read failed:', error);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage write failed:', error);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage remove failed:', error);
    }
  },
};
