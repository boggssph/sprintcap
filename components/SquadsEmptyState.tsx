"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SquadsEmptyStateProps {
  onCreateSquad: () => void
}

export default function SquadsEmptyState({ onCreateSquad }: SquadsEmptyStateProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No squads yet
          </h3>
          <p className="text-sm text-gray-500">
            Create your first squad to start managing sprints and tracking team capacity.
          </p>
        </div>
        <Button onClick={onCreateSquad} size="lg">
          Create New Squad
        </Button>
      </CardContent>
    </Card>
  )
}