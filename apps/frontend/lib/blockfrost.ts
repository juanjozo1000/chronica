const BLOCKFROST_API_URL =
  process.env.ENVIRONMENT === "PROD"
    ? "https://cardano-mainnet.blockfrost.io/api/v0"
    : "https://cardano-preprod.blockfrost.io/api/v0";
const POLICY_ID =
  process.env.ENVIRONMENT === "PROD"
    ? "c6a87a1e40f3b63a1b46f3651e37ca872f32caf099b4a78662c9a858"
    : "7fa9e497b57458a394dd4e58604aeb29b90cce2e07640306920a05b1";
const PROJECT_ID =
  process.env.ENVIRONMENT === "PROD"
    ? process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY
    : process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY_DEV;

export interface BlockfrostAsset {
  asset: string;
  policy_id: string;
  asset_name: string;
  fingerprint: string;
  quantity: string;
  initial_mint_tx_hash: string;
  mint_or_burn_count: number;
  onchain_metadata?: {
    title?: string;
    minting_timestamp?: string;
    entries?: string[];
    image?: string;
    media?: string;
    media_type?: string;
    authority_type?: string;
    tags?: string[];
    culture?: string;
    event_timestamp?: string;
    geo_location?: string;
  };
  onchain_metadata_standard?: any;
  onchain_metadata_extra?: any;
  metadata?: any;
}

export const fetchPolicyAssets = async (): Promise<BlockfrostAsset[]> => {
  const response = await fetch(
    `${BLOCKFROST_API_URL}/assets/policy/${POLICY_ID}`,
    {
      headers: {
        project_id: PROJECT_ID || "",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      // Return empty array if no assets found
      return [];
    }
    throw new Error("Failed to fetch policy assets");
  }
  // Remove asset c6a87a1e40f3b63a1b46f3651e37ca872f32caf099b4a78662c9a8584d696e7454657374
  let assets = await response.json();
  const filteredAssets = assets.filter(
    (asset: BlockfrostAsset) =>
      asset.asset !==
      "c6a87a1e40f3b63a1b46f3651e37ca872f32caf099b4a78662c9a8584d696e7454657374"
  );
  assets = filteredAssets;
  // If no assets returned, return empty array
  if (!assets || assets.length === 0) {
    return [];
  }

  // Fetch metadata for each asset
  const assetsWithMetadata = await Promise.all(
    assets.map(async (asset: BlockfrostAsset) => {
      try {
        const metadataResponse = await fetch(
          `${BLOCKFROST_API_URL}/assets/${asset.asset}`,
          {
            headers: {
              project_id: PROJECT_ID || "",
            },
          }
        );

        if (!metadataResponse.ok) {
          throw new Error(`Failed to fetch metadata for asset ${asset.asset}`);
        }

        const assetDetails = await metadataResponse.json();
        return {
          ...asset,
          ...assetDetails,
        };
      } catch (error) {
        console.error(
          `Error fetching metadata for asset ${asset.asset}:`,
          error
        );
        return asset;
      }
    })
  );

  return assetsWithMetadata;
};
