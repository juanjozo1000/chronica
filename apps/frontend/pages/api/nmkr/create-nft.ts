import { NextApiRequest, NextApiResponse } from 'next'
import { NMKRClient } from 'nmkr-studio-api'
import { nmkrConfig, validateNmkrConfig } from '../../../lib/nmkr-config'

export interface CreateNftRequest {
  projectUid: string
  tokenName: string
  displayName?: string | null
  description?: string | null
  fileBase64?: string | null
  fileUrl?: string | null
  ipfsHash?: string | null
  mimetype?: string | null
  priceInLovelace?: number | null
  metadataOverride?: any
}

export interface CreateNftResponse {
  success: boolean
  data?: {
    nftId?: number
    nftUid?: string | null
    ipfsHashMainnft?: string | null
    assetId?: string | null
    metadata?: string | null
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateNftResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    })
  }

  try {
    // Validate NMKR configuration
    validateNmkrConfig()

    // Extract data from request body
    const {
      projectUid,
      tokenName,
      displayName,
      description,
      fileBase64,
      fileUrl,
      ipfsHash,
      mimetype,
      priceInLovelace,
      metadataOverride
    }: CreateNftRequest = req.body

    // Validate required fields
    if (!projectUid || !tokenName) {
      return res.status(400).json({
        success: false,
        error: 'projectUid and tokenName are required'
      })
    }

    // Validate that at least one file source is provided
    if (!fileBase64 && !fileUrl && !ipfsHash) {
      return res.status(400).json({
        success: false,
        error: 'At least one file source (fileBase64, fileUrl, or ipfsHash) is required'
      })
    }

    // Initialize NMKR client
    const nmkrClient = new NMKRClient({
      BASE: nmkrConfig.baseUrl,
      TOKEN: nmkrConfig.apiKey,
    })

    // Prepare the NFT file object (convert undefined to null for NMKR API)
    const previewImageNft = {
      mimetype: mimetype || 'image/png',
      fileFromBase64: fileBase64 || null,
      fileFromsUrl: fileUrl || null,
      fileFromIPFS: ipfsHash || null,
    }

    // Prepare the upload request (convert undefined to null for NMKR API)
    const uploadRequest = {
      tokenname: tokenName,
      displayname: displayName || null,
      description: description || null,
      previewImageNft: previewImageNft,
      priceInLovelace: priceInLovelace || null,
      metadataOverride: metadataOverride ? JSON.stringify(metadataOverride) : null,
      isBlocked: false,
    }

    console.log('Creating NFT with NMKR Studio API:', {
      projectUid,
      tokenName,
      displayName,
      hasFileBase64: !!fileBase64,
      hasFileUrl: !!fileUrl,
      hasIpfsHash: !!ipfsHash,
    })

    // Call NMKR Studio API
    const result = await nmkrClient.nft.postV2UploadNft({
      projectuid: projectUid,
      requestBody: uploadRequest,
    })

    console.log('NMKR Studio API response:', result)

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        nftId: result.nftId,
        nftUid: result.nftUid,
        ipfsHashMainnft: result.ipfsHashMainnft,
        assetId: result.assetId,
        metadata: result.metadata,
      },
    })

  } catch (error) {
    console.error('Error creating NFT:', error)
    
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