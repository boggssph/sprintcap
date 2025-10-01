/**
 * Version utility functions for retrieving and displaying application version information
 */

export interface VersionInfo {
  version: string;
  isAvailable: boolean;
  fallbackMessage: string;
}

/**
 * Retrieves the application version from environment variables
 * Falls back to a default message if version is not available
 */
export function getVersionInfo(): VersionInfo {
  // For debugging: temporarily hardcode a version to test display
  const version = "DEBUG-v0.1.0-7-g99ade90";

  if (version && version.trim()) {
    return {
      version: version.trim(),
      isAvailable: true,
      fallbackMessage: "Version unavailable"
    };
  }

  return {
    version: "",
    isAvailable: false,
    fallbackMessage: "Version unavailable"
  };
}

/**
 * Gets the display text for the version number
 * Returns the version string if available, otherwise the fallback message
 */
export function getVersionDisplayText(): string {
  const versionInfo = getVersionInfo();
  return versionInfo.isAvailable ? versionInfo.version : versionInfo.fallbackMessage;
}