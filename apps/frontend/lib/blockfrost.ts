const BLOCKFROST_API_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
const POLICY_ID = "c6a87a1e40f3b63a1b46f3651e37ca872f32caf099b4a78662c9a858";

export interface BlockfrostAsset {
  asset: string;
  policy_id: string;
  asset_name: string;
  fingerprint: string;
  quantity: string;
  initial_mint_tx_hash: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    price?: number;
    tags?: string[];
    location?: {
      country: string;
      city: string;
    };
  };
}

export const fetchPolicyAssets = async (): Promise<BlockfrostAsset[]> => {
  const response = await fetch(
    `${BLOCKFROST_API_URL}/assets/policy/${POLICY_ID}`,
    {
      headers: {
        project_id: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "",
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

  const assets = await response.json();

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
              project_id: process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "",
            },
          }
        );

        if (!metadataResponse.ok) {
          throw new Error(`Failed to fetch metadata for asset ${asset.asset}`);
        }

        const metadata = await metadataResponse.json();
        return {
          ...asset,
          metadata: metadata.onchain_metadata || {},
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
