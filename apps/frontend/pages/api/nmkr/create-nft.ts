import { NextApiRequest, NextApiResponse } from 'next'
import { NMKRClient } from 'nmkr-studio-api'
import { nmkrConfig, validateNmkrConfig } from '../../../lib/nmkr-config'

import { CreateMetadataParams } from '../../../types/nft-metadata'
import { createCip25Metadata } from '../../../utils/metadata-builder'

export interface CreateNftRequest {
  title: string
  description?: string | null
  fileBase64?: string | null
  fileUrl?: string | null
  ipfsHash?: string | null
  mimetype?: string | null
  eventTimestamp?: string
  geoLocation?: string
  tags?: string[]
  culture?: string
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
      title,
      description,
      fileBase64,
      fileUrl,
      ipfsHash,
      mimetype,
      eventTimestamp,
      geoLocation,
      tags,
      culture,
    }: CreateNftRequest = req.body

   
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

    // Create CIP-25 compliant metadata if provided
    let metadataOverride = null
    
    
      // Determine the media IPFS hash from the file inputs
    let mediaIpfsHash = ''
    if (ipfsHash) {
        mediaIpfsHash = ipfsHash
    }
    else if (fileUrl && fileUrl.includes('ipfs://')) {
        mediaIpfsHash = fileUrl
    } else {
    // For now, we'll use a placeholder - in real implementation,
    // you'd upload to IPFS first and get the hash
        mediaIpfsHash = 'ipfs://QmPlaceholderHash'
    }

    const cip25Metadata = createCip25Metadata({
        title: title,
        description: description,
        fileBase64: fileBase64,
        fileUrl: fileUrl,
        ipfsHash: ipfsHash,
        mimetype: mimetype,
        eventTimestamp: eventTimestamp,
        geoLocation: geoLocation,
        tags: tags,
        culture: culture
    })
    
    metadataOverride = cip25Metadata


    // Prepare the upload request (convert undefined to null for NMKR API)
    const uploadRequest = {
      projectuid: nmkrConfig.projectUid,
      tokenname: title,
      displayname: title || null,
      description: description || null,
      previewImageNft: previewImageNft,
      metadataOverride: metadataOverride ? JSON.stringify(metadataOverride) : null,
      isBlocked: false,
    }

    console.log('Creating NFT with NMKR Studio API:', {
      projectUid: nmkrConfig.projectUid,
      title: title,
      hasFileBase64: !!fileBase64,
      hasFileUrl: !!fileUrl,
      hasIpfsHash: !!ipfsHash,
      hasMetadata: !!metadataOverride,
      metadataPreview: metadataOverride ? JSON.stringify(metadataOverride, null, 2) : null,
    })

    // Call NMKR Studio API
    const result = await nmkrClient.nft.postV2UploadNft({
      projectuid: nmkrConfig.projectUid as string,
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