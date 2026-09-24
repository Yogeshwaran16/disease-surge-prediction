// Convert Probability to %

export const formatProbability = (
  value
) => {
  return `${Math.round(
    value * 100
  )}%`;
};

// Number Formatter

export const formatNumber = (
  value
) => {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
};

// Date Formatter

export const formatDate = (
  date
) => {
  return new Date(
    date
  ).toLocaleDateString(
    "en-IN"
  );
};

// Time Formatter

export const formatTime = (
  date
) => {
  return new Date(
    date
  ).toLocaleTimeString(
    "en-IN"
  );
};

// Capitalize Text

export const capitalize = (
  text
) => {
  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
};

// Risk Label

export const formatRiskLevel = (
  risk
) => {
  return risk
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
};
