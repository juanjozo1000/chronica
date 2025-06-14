import { NextApiRequest, NextApiResponse } from 'next'
import { NMKRClient } from 'nmkr-studio-api'
import { nmkrConfig, validateNmkrConfig } from '../../../lib/nmkr-config'
import { generateNftFingerprint } from '@/utils/nft-fingerprint-generator'

export interface PayoutWallet {
  walletAddress?: string | null
  created?: string
  state?: string
  comment?: string | null
}

export interface GetPayoutWalletsResponse {
  success: boolean
  data?: PayoutWallet[]
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetPayoutWalletsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
    })
  }

  try {
    // Validate NMKR configuration
    validateNmkrConfig()
    console.log("generateNftFingerprint", generateNftFingerprint("cnc_2025-06-14130903942"))

    // Initialize NMKR client
    const nmkrClient = new NMKRClient({
      BASE: nmkrConfig.baseUrl,
      TOKEN: nmkrConfig.apiKey,
    })

    console.log('Fetching payout wallets from NMKR Studio API...')

    // Call NMKR Studio API
    const result = await nmkrClient.customer.getV2GetPayoutWallets()

    console.log('NMKR Studio API response:', result)

    // Transform the result to match our interface
    const payoutWallets: PayoutWallet[] = result.map(wallet => ({
      walletAddress: wallet.walletAddress,
      created: wallet.created,
      state: wallet.state?.toString() || 'unknown',
      comment: wallet.comment,
    }))

    // Return success response
    res.status(200).json({
      success: true,
      data: payoutWallets,
    })

  } catch (error) {
    console.error('Error fetching payout wallets:', error)
    
    // Handle specific NMKR API errors
    if (error && typeof error === 'object' && 'body' in error) {
      return res.status(400).json({
        success: false,
        error: `NMKR API Error: ${JSON.stringify(error.body)}`,
      })
    }

    // Handle general errors
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
} 