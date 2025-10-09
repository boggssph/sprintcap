/**
 * Utility functions for avatar display and user profile handling
 */

/**
 * Generates user initials from display name or email
 * @param name - User's display name (optional)
 * @param email - User's email address (optional)
 * @returns User initials (1-2 characters)
 */
export function getInitials(name?: string | null, email?: string | null): string {
  // If we have a name, extract initials from it
  if (name && name.trim()) {
    // Clean the name by removing special characters that might interfere with splitting
    const cleanName = name.trim().replace(/['`]/g, '') // Remove apostrophes and backticks
    // Split on whitespace and hyphens to handle names like "Jean-Pierre"
    const nameParts = cleanName.split(/[\s-]+/)

    if (nameParts.length >= 2) {
      // Full name: first letter of first name + first letter of last name
      const firstInitial = nameParts[0].charAt(0).toUpperCase()
      const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      return firstInitial + lastInitial
    } else {
      // Single name: first two letters
      const singleName = nameParts[0]
      if (singleName.length >= 2) {
        return singleName.substring(0, 2).toUpperCase()
      } else {
        return singleName.charAt(0).toUpperCase()
      }
    }
  }

  // Fallback to email if no name provided
  if (email && email.trim()) {
    const emailUsername = email.split('@')[0]
    if (emailUsername.length >= 2) {
      return emailUsername.substring(0, 2).toUpperCase()
    } else {
      return emailUsername.charAt(0).toUpperCase()
    }
  }

  // Final fallback
  return 'U'
}