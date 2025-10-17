/**
 * Dashboard Configuration
 *
 * Configuration-driven approach following Open/Closed Principle.
 * To add/remove/reorder metrics, simply modify this configuration.
 * No need to touch the main component code.
 */

export const dashboardConfig = {
  layout: {
    container:
      "min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50",
    content: "px-8 pb-8",
  },

  sections: [
    {
      id: "header",
      type: "header",
      enabled: true,
      order: 1,
    },
    {
      id: "kpi-cards",
      type: "kpi-cards",
      enabled: true,
      order: 2,
      containerClass: "",
    },
    {
      id: "performance-metrics",
      type: "performance-metrics",
      enabled: true,
      order: 3,
      containerClass: "",
    },
    {
      id: "fleet-cards",
      type: "grid",
      enabled: true,
      order: 4,
      containerClass: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8",
      children: [
        {
          id: "active-vehicles",
          type: "active-vehicles",
          enabled: true,
        },
        {
          id: "fleet-summary",
          type: "fleet-summary",
          enabled: true,
        },
      ],
    },
    {
      id: "zone-performance",
      type: "zone-performance",
      enabled: true,
      order: 5,
      containerClass: "",
    },
    {
      id: "recent-requests",
      type: "recent-requests",
      enabled: true,
      order: 6,
      containerClass: "",
    },
    {
      id: "environmental-impact",
      type: "environmental-impact",
      enabled: true,
      order: 7,
      containerClass: "mb-8",
    },
  ],
};

/**
 * Get enabled sections sorted by order
 * @param {Object} config - Dashboard configuration
 * @returns {Array} Sorted enabled sections
 */
export const getEnabledSections = (config = dashboardConfig) => {
  return config.sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
};

/**
 * Get section by ID
 * @param {string} sectionId - Section identifier
 * @param {Object} config - Dashboard configuration
 * @returns {Object|null} Section config or null
 */
export const getSectionById = (sectionId, config = dashboardConfig) => {
  return config.sections.find((section) => section.id === sectionId) || null;
};
