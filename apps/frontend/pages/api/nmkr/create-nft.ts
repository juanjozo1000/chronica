import { NextApiRequest, NextApiResponse } from 'next'
import { NMKRClient } from 'nmkr-studio-api'
import { nmkrConfig, validateNmkrConfig } from '../../../lib/nmkr-config'
import { createCip25Metadata } from '../../../utils/metadata-builder'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing for file uploads
  },
}

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
    ipfsHash?: string | null
  }
  error?: string
}

// Helper function to parse multipart/form-data
function parseFormData(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      keepExtensions: true,
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      } else {
        resolve({ fields, files })
      }
    })
  })
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

    // Parse multipart/form-data
    const { fields, files } = await parseFormData(req)

    // Extract form fields
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description
    const eventTimestamp = Array.isArray(fields.eventTimestamp) ? fields.eventTimestamp[0] : fields.eventTimestamp
    const geoLocation = Array.isArray(fields.geoLocation) ? fields.geoLocation[0] : fields.geoLocation
    const culture = Array.isArray(fields.culture) ? fields.culture[0] : fields.culture
    const tagsString = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags
    const tags = tagsString ? JSON.parse(tagsString) : []

    // Extract uploaded file
    const mediaFile = Array.isArray(files.media) ? files.media[0] : files.media

    if (!mediaFile) {
      return res.status(400).json({
        success: false,
        error: 'Media file is required'
      })
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      })
    }

    // Initialize NMKR client
    const nmkrClient = new NMKRClient({
      BASE: nmkrConfig.baseUrl,
      TOKEN: nmkrConfig.apiKey,
    })

    // Upload file to IPFS
    console.log('Uploading file to IPFS...', {
      originalFilename: mediaFile.originalFilename,
      mimetype: mediaFile.mimetype,
      size: mediaFile.size
    })

    // Read file content
    const fileBuffer = fs.readFileSync(mediaFile.filepath)
    const fileBase64 = fileBuffer.toString('base64')

    // Upload to IPFS using NMKR client
    // Note: We need to provide a customerid. For simplicity, we'll use 1 as default customer ID
    // In production, you might want to get this from your account or config
    const ipfsResult = await nmkrClient.ipfs.postV2UploadToIpfs({
      customerid: 190334, // Default customer ID - you may need to adjust this
      requestBody: {
        fileFromBase64: fileBase64,
        mimetype: mediaFile.mimetype || 'application/octet-stream',
      }
    })

    console.log('IPFS upload result:', ipfsResult)

    // Handle the IPFS result - it should be a string containing the IPFS hash
    const ipfsHashFromResult = String(ipfsResult)
    
    if (!ipfsHashFromResult) {
      throw new Error('Failed to upload to IPFS - no hash returned')
    }

    // Remove ipfs:// prefix if present
    const ipfsHash = ipfsHashFromResult.startsWith('ipfs://') ? ipfsHashFromResult.replace('ipfs://', '') : ipfsHashFromResult

    // Create CIP-25 compliant metadata
    const cip25Metadata = createCip25Metadata({
      title: title,
      description: description,
      ipfsHash: ipfsHash,
      mimetype: mediaFile.mimetype,
      eventTimestamp: eventTimestamp,
      geoLocation: geoLocation,
      tags: tags,
      culture: culture
    })

    // Prepare the NFT file object using IPFS hash
    const previewImageNft = {
      mimetype: mediaFile.mimetype || 'application/octet-stream',
      fileFromBase64: null,
      fileFromsUrl: null,
      fileFromIPFS: ipfsHash,
    }

    // Prepare the upload request
    const uploadRequest = {
      projectuid: nmkrConfig.projectUid,
      tokenname: title,
      displayname: title || null,
      description: description || null,
      previewImageNft: previewImageNft,
      metadataOverride: JSON.stringify(cip25Metadata),
      isBlocked: false,
    }

    console.log('Creating NFT with NMKR Studio API:', {
      projectUid: nmkrConfig.projectUid,
      title: title,
      ipfsHash: ipfsHash,
      hasMetadata: !!cip25Metadata,
    })

    // Call NMKR Studio API to create NFT
    const result = await nmkrClient.nft.postV2UploadNft({
      projectuid: nmkrConfig.projectUid as string,
      requestBody: uploadRequest,
    })

    console.log('NMKR Studio API response:', result)

    // Clean up uploaded file
    fs.unlinkSync(mediaFile.filepath)

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        nftId: result.nftId,
        nftUid: result.nftUid,
        ipfsHashMainnft: result.ipfsHashMainnft,
        assetId: result.assetId,
        metadata: result.metadata,
        ipfsHash: ipfsHash,
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