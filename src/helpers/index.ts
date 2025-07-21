export * from "./classNames";
export * from "./string";
export * from "./env";
export * from "./appVersion";
export * from "./keys";
export * from "./constants";
export * from "./domHelpers";

/**
 * Safely converts nanoseconds timestamp to a valid Date object
 * @param sentAtNs - Timestamp in nanoseconds (bigint)
 * @returns Valid Date object or current date as fallback
 */
export const safeConvertTimestamp = (
  sentAtNs: bigint | number | null | undefined,
): Date | null => {
  try {
    // Handle null/undefined
    if (sentAtNs === null || sentAtNs === undefined) {
      return null;
    }

    // Convert to number if it's a bigint
    const timestampNumber =
      typeof sentAtNs === "bigint" ? Number(sentAtNs) : sentAtNs;

    // Check if the number is valid
    if (!Number.isFinite(timestampNumber) || timestampNumber <= 0) {
      console.warn(
        "safeConvertTimestamp: received invalid timestamp number:",
        timestampNumber,
      );
      return null;
    }

    // Convert from nanoseconds to milliseconds
    const milliseconds = timestampNumber / 1000000;

    // Check if the milliseconds value is reasonable (not too far in past/future)
    const now = Date.now();
    const maxDiff = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years in milliseconds

    if (Math.abs(milliseconds - now) > maxDiff) {
      console.warn(
        "safeConvertTimestamp: timestamp seems unreasonable:",
        milliseconds,
        "using current date",
      );
      return new Date();
    }

    // Create the date object
    const date = new Date(milliseconds);

    // Validate the created date
    if (isNaN(date.getTime())) {
      console.warn(
        "safeConvertTimestamp: created invalid date from:",
        milliseconds,
      );
      return null;
    }

    return date;
  } catch (error) {
    console.error("safeConvertTimestamp: error converting timestamp:", error);
    return null;
  }
};

/**
 * Safely formats a timestamp for display
 * @param sentAtNs - Timestamp in nanoseconds (bigint)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted time string
 */
export const safeFormatTimestamp = (
  sentAtNs: bigint | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  },
): string => {
  try {
    const date = safeConvertTimestamp(sentAtNs);
    if (!date) {
      return "";
    }
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch (error) {
    console.error("safeFormatTimestamp: error formatting timestamp:", error);
    return "Invalid time";
  }
};

/**
 * Safely formats a full date for display
 * @param sentAtNs - Timestamp in nanoseconds (bigint)
 * @returns Formatted date string
 */
export const safeFormatDate = (
  sentAtNs: bigint | number | null | undefined,
): string => {
  try {
    const date = safeConvertTimestamp(sentAtNs);
    if (!date) {
      return "";
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("safeFormatDate: error formatting date:", error);
    return "Invalid date";
  }
};
