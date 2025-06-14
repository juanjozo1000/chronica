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
 * Creates a CIP-25 compliant metadata object
 * @param params - Parameters for creating the metadata
 * @returns Complete CIP-25 metadata object
 */
export function createCip25Metadata(params: CreateNftRequest): Cip25Metadata {
  const time = new Date()
  const timestamp = time.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
  const asset_name = createUniqueAssetName(params.title, time)
  
  // Build the metadata object with proper null/undefined handling
  const nftMetadata: NftMetadata = {
    title: params.title,
    minting_timestamp: timestamp,
    entries: params.description ? [params.description] : ['No description provided'],
    media: 'ipfs://placeholder',
    authority_type: "Media",
    tags: params.tags || [],
    culture: params.culture || "EN-US"
  }
  
  // Add optional fields only if they have values
  if (params.eventTimestamp) {
    nftMetadata.event_timestamp = params.eventTimestamp
  }
  
  if (params.geoLocation) {
    nftMetadata.geo_location = params.geoLocation
  }
  
  return {
    "721": {
      [nmkrConfig.policyId as string]: {
        [asset_name]: nftMetadata
      },
      // "version": "1.0"
    }
  }
}
 