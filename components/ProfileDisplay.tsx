"use client"

import React from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

interface ProfileDisplayProps {
  className?: string
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
}

export default function ProfileDisplay({
  className = '',
  showName = true,
  size = 'md',
  orientation = 'horizontal'
}: ProfileDisplayProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className={`flex items-center gap-2 ${orientation === 'vertical' ? 'flex-col' : ''} ${className}`}>
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

  const avatarSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'

  return (
    <div className={`flex items-center gap-2 ${orientation === 'vertical' ? 'flex-col' : ''} ${className}`} data-testid="profile-display">
      <Avatar className={avatarSize}>
        <AvatarImage
          src={(session.user as { image?: string })?.image || undefined}
          alt={`${displayName}'s profile picture`}
        />
        <AvatarFallback className="bg-primary/10 text-primary font-medium" data-testid="avatar-fallback">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className={`font-medium text-gray-900 truncate ${textSize}`} data-testid="display-name">
          {displayName}
        </span>
      )}
    </div>
  )
}