import { useState, useEffect } from "react";
import { BlockfrostAsset, fetchPolicyAssets } from "../lib/blockfrost";

const POLICY_ID = "c6a87a1e40f3b63a1b46f3651e37ca872f32caf099b4a78662c9a858";

export const useBlockfrostAssets = () => {
  const [assets, setAssets] = useState<BlockfrostAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assetsWithMetadata = await fetchPolicyAssets();
        setAssets(assetsWithMetadata);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assets:", error);
        if (
          error instanceof Error &&
          !error.message.includes("No assets found")
        ) {
          setError("Failed to fetch assets");
        }
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return { assets, loading, error };
};
