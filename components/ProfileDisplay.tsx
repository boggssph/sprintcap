"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials } from '@/lib/avatar-utils'

interface ProfileDisplayProps {
  /**
   * Additional CSS classes to apply to the component container
   */
  className?: string
  /**
   * Whether to display the user's name alongside the avatar
   * @default true
   */
  showName?: boolean
  /**
   * Size variant for the avatar and text
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Layout orientation of the avatar and name
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
}

/**
 * ProfileDisplay component that shows user avatar and name
 *
 * Avatar Rendering Logic:
 * - If user has a Google profile image: Shows AvatarImage with the Google picture
 * - If no Google image or image fails to load: Shows AvatarFallback with user initials
 * - Never displays both image and initials simultaneously (fixes Firefox display issue)
 *
 * Loading State:
 * - Shows skeleton placeholders while authentication is loading
 *
 * Error Handling:
 * - Automatically falls back to initials if avatar image fails to load
 * - Uses getInitials utility to generate consistent initials from name/email
 *
 * @param props - Component props
 * @returns React component or null if no authenticated user
 */
export default function ProfileDisplay({
  className = '',
  showName = true,
  size = 'md',
  orientation = 'horizontal'
}: ProfileDisplayProps) {
  const { data: session, status } = useSession()
  const [imageError, setImageError] = useState(false)

  if (status === 'loading') {
    return (
      <div className={`flex items-center gap-2 ${orientation === 'vertical' ? 'flex-col' : ''} ${className}`} data-testid="profile-display">
        <Skeleton className={`rounded-full ${size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'}`} />
        {showName && <Skeleton className="h-4 w-20" />}
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const displayName = (session.user as { displayName?: string })?.displayName ||
                     (session.user as { name?: string })?.name ||
                     session.user.email?.split('@')[0] ||
                     'User'

  const userImage = (session.user as { image?: string })?.image
  const userInitials = getInitials(displayName, session.user.email)

  const avatarSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'

  return (
    <div className={`flex items-center gap-2 ${orientation === 'vertical' ? 'flex-col' : ''} ${className}`} data-testid="profile-display">
      <Avatar className={avatarSize} data-testid="avatar">
        {userImage && !imageError ? (
          <AvatarImage
            src={userImage}
            alt={`${displayName}'s profile picture`}
            onError={() => setImageError(true)}
          />
        ) : null}
        {(!userImage || imageError) && (
          <AvatarFallback className="bg-primary/10 text-primary font-medium" data-testid="avatar-fallback">
            {userInitials}
          </AvatarFallback>
        )}
      </Avatar>
      {showName && (
        <span className={`font-medium text-gray-900 truncate ${textSize}`} data-testid="display-name">
          {displayName}
        </span>
      )}
    </div>
  )
}