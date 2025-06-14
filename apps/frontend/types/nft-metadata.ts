// CIP-25 NFT Metadata Types
export interface NftMetadata {
  title: string
  minting_timestamp: string
  event_timestamp?: string
  geo_location?: string
  entries: string[]
  media: string
  authority_type: string
  tags: string[]
  culture: string
}

export interface AssetMetadata {
  [assetName: string]: NftMetadata
}

export interface PolicyMetadata {
  [policyId: string]: AssetMetadata
}

export interface Cip25Metadata {
  "721": PolicyMetadata
}

// Helper interface for creating metadata more easily
export interface CreateMetadataParams {
  policyId: string
  assetName: string
  title: string
  mintingTimestamp?: string
  eventTimestamp?: string
  geoLocation?: string
  entries: string[]
  mediaIpfsHash: string
  authorityType?: string
  tags?: string[]
  culture?: string
} 