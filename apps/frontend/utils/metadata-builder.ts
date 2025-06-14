import { Cip25Metadata, CreateMetadataParams, NftMetadata } from '../types/nft-metadata'
import { CreateNftRequest } from '../pages/api/nmkr/create-nft'
import { nmkrConfig } from '../lib/nmkr-config'

/**
 * Creates a unique asset name with timestamp
 * @param baseName - Base name for the asset
 * @param timestamp - Optional timestamp, defaults to current time
 * @returns Unique asset name with timestamp
 */
export function createUniqueAssetName(baseName: string, timestamp?: Date): string {
  const time = timestamp || new Date()
  const timestampStr = time.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
  return `chronica_${baseName}_${timestampStr}`
}

/**
 * Splits a string into chunks of 64 characters or returns the original string if shorter
 * @param text - The text to potentially split
 * @returns String or array of strings (if original was >= 64 chars)
 */
function splitLongString(text: string): string | string[] {
  if (text.length >= 64) {
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += 64) {
      chunks.push(text.slice(i, i + 64))
    }
    return chunks
  }
  return text
}

/**
 * Creates a CIP-25 compliant metadata object
 * @param params - Parameters for creating the metadata
 * @returns Complete CIP-25 metadata object
 */
export function createCip25Metadata(params: CreateNftRequest, ipfsHash: string): Cip25Metadata {
  const time = new Date()
  const timestamp = time.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
  const asset_name = createUniqueAssetName(params.title, time)
  let split_description = splitLongString(params.description || "No description provided")
  if (!Array.isArray(split_description)) {
    split_description = [split_description]
  }
  // Build the metadata object with proper null/undefined handling
  // Apply splitting logic to all string fields that might be >= 64 chars
  const nftMetadata: NftMetadata = {
    title: splitLongString(params.title),
    minting_timestamp: timestamp,
    entries: params.description ? split_description : ['No description provided'],
    media: splitLongString(ipfsHash),
    image: splitLongString(ipfsHash),
    media_type: params.mimetype || "image/png",
    authority_type: "Media",
    tags: params.tags || [],
    culture: params.culture || "EN-US"
  }
  
  // Add optional fields only if they have values
  if (params.eventTimestamp) {
    nftMetadata.event_timestamp = params.eventTimestamp
  }
  
  if (params.geoLocation) {
    nftMetadata.geo_location = splitLongString(params.geoLocation)
  }
  
  return {
    "721": {
      [nmkrConfig.policyId as string]: {
        [asset_name]: nftMetadata
      },
      version: "1.0"
    }
  }
}
 