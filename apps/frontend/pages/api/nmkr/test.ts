import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // For now, just return a test response
    // Later we'll integrate the actual nmkr-studio-api
    const response = {
      status: 'success',
      message: 'NMKR API endpoint is working!',
      timestamp: new Date().toISOString(),
      environment: 'development',
      nextSteps: [
        'Add NMKR Studio API key to environment variables',
        'Configure NMKR Studio API client',
        'Implement actual NMKR Studio API calls'
      ]
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('NMKR API Test Error:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 