"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function RequestSubmittedPage() {
  return (
    <div className="flex-1 bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Access Request Submitted
          </h1>
          <p className="text-gray-600">
            Your request has been submitted successfully. An administrator will review it shortly.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You will receive an email notification once your request is approved.
          </p>

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}