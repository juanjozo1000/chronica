import AssetFingerprint from "@emurgo/cip14-js";
import { nmkrConfig } from "../lib/nmkr-config";

/**
 * Generates a CIP-14 compliant asset fingerprint for a Cardano NFT
 * This fingerprint can be used to create URLs for accessing the NFT
 * @param name - The asset name/token name
 * @returns The bech32-encoded asset fingerprint (e.g., "asset1...")
 */
function generateNftFingerprint(name: string): string {
  // 1. Policy ID (hex string) and asset name (converted to hex)
  const policyIdHex = nmkrConfig.policyId; // 56 hex characters
  const nameHex = Buffer.from(name, "utf8").toString("hex");

  // 2. Asset ID (concatenation of policy ID and asset name in hex)
  const assetId = policyIdHex + nameHex;
  console.log("Asset ID:", assetId);

  // 3. Generate CIP-14 compliant fingerprint using the dedicated CIP14 library
  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyIdHex as string, "hex"),
    Buffer.from(nameHex, "hex")
  );

  // 4. Return the bech32-encoded fingerprint
  const bech32Fingerprint = assetFingerprint.fingerprint();
  console.log("Asset Fingerprint:", bech32Fingerprint);

  return bech32Fingerprint;
}

/**
 * Generates various URLs for accessing the NFT using the asset fingerprint
 * @param fingerprint - The asset fingerprint
 * @returns Object containing different NFT URLs
 */
function generateNftUrls(fingerprint: string) {
  return {
    fingerprint,
    // Cardanoscan (mainnet)
    cardanoscan: `https://cardanoscan.io/token/${fingerprint}`,
    // Cardanoscan (preprod)
    cardanoscanPreprod: `https://preprod.cardanoscan.io/token/${fingerprint}`,
    // Pool.pm
    poolPm: `https://pool.pm/${fingerprint}`,
    // CNFT.io
    cnft: `https://cnft.io/token/${fingerprint}`,
    // Cardano Assets
    cardanoAssets: `https://cardanoassets.com/asset${fingerprint.slice(5)}`, // Remove 'asset' prefix
  };
}

export { generateNftFingerprint, generateNftUrls };
