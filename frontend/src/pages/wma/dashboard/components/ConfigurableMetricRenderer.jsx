import React from "react";
import { metricStrategyRegistry } from "../strategies";

/**
 * ConfigurableMetricRenderer
 *
 * Renders metrics based on configuration and strategy pattern.
 * Implements Open/Closed Principle - extensible without modification.
 *
 * @param {Object} props
 * @param {Object} props.section - Section configuration
 * @param {Object} props.data - Dashboard data
 * @param {Object} props.additionalProps - Additional props to pass to strategy
 */
export const ConfigurableMetricRenderer = ({
  section,
  data,
  additionalProps = {},
}) => {
  if (!section || !section.enabled) {
    return null;
  }

  // Handle grid/container sections with children
  if (section.type === "grid" && section.children) {
    return (
      <div className={section.containerClass || ""} key={section.id}>
        {section.children
          .filter((child) => child.enabled)
          .map((child) => (
            <ConfigurableMetricRenderer
              key={child.id}
              section={child}
              data={data}
              additionalProps={additionalProps}
            />
          ))}
      </div>
    );
  }

  // Get strategy for section type
  const strategy = metricStrategyRegistry.getStrategy(section.type);

  if (!strategy) {
    console.error(`No strategy found for section type: ${section.type}`);
    return null;
  }

  // Render using strategy
  const content = strategy.render(data, {
    ...additionalProps,
    sectionId: section.id,
  });

  // Wrap in container if containerClass is specified
  if (section.containerClass) {
    return (
      <div className={section.containerClass} key={section.id}>
        {content}
      </div>
    );
  }

  return <React.Fragment key={section.id}>{content}</React.Fragment>;
};
