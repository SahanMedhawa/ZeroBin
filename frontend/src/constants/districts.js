/**
 * Sri Lankan Administrative Districts
 * 
 * All 25 districts of Sri Lanka, alphabetically sorted.
 * This constant ensures data consistency across the application.
 * 
 * @constant {string[]} SRI_LANKAN_DISTRICTS
 */
export const SRI_LANKAN_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
].sort();

/**
 * Get district by partial name match
 * @param {string} query - Search query
 * @returns {string[]} Matching districts
 */
export const searchDistricts = (query) => {
  if (!query) return SRI_LANKAN_DISTRICTS;
  const lowerQuery = query.toLowerCase();
  return SRI_LANKAN_DISTRICTS.filter((district) =>
    district.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Validate if a district name is valid
 * @param {string} district - District name to validate
 * @returns {boolean} True if valid district
 */
export const isValidDistrict = (district) => {
  return SRI_LANKAN_DISTRICTS.includes(district);
};

/**
 * Get district count
 * @returns {number} Total number of districts
 */
export const getDistrictCount = () => SRI_LANKAN_DISTRICTS.length;
