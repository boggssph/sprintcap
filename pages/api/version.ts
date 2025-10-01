import { NextApiRequest, NextApiResponse } from 'next';
import { versionService } from '../../lib/services/versionService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const versionInfo = await versionService.getVersion();
    return res.status(200).json(versionInfo);
  } catch (error) {
    console.error('Version API error:', error);
    return res.status(500).json({ error: 'Failed to fetch version' });
  }
}