import { NextResponse } from 'next/server'
import { VersionService } from '@/lib/services/versionService'

export async function GET() {
  try {
    const versionService = new VersionService()
    const versionInfo = await versionService.getVersion()

    return NextResponse.json(versionInfo)
  } catch (error) {
    console.error('Version API error:', error)

    // Return a fallback version info if the API fails
    return NextResponse.json({
      version: 'v1.0.0',
      commitSha: null,
      deploymentUrl: 'https://www.sprintcap.info',
      deployedAt: new Date(),
      buildStatus: 'READY' as const
    })
  }
}