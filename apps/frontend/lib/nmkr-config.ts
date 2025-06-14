export const nmkrConfig = {
  apiKey: process.env.ENVIRONMENT === 'PROD' ? process.env.NMKR_API_KEY : process.env.NMKR_API_KEY_DEV,
  baseUrl: process.env.ENVIRONMENT === 'PROD' ? process.env.NMKR_BASE_URL : process.env.NMKR_BASE_URL_DEV,
  projectUid: process.env.ENVIRONMENT === 'PROD' ? process.env.NMKR_PROJECT_UID : process.env.NMKR_PROJECT_UID_DEV,
  policyId: process.env.ENVIRONMENT === 'PROD' ? process.env.NMKR_POLICY_ID : process.env.NMKR_POLICY_ID_DEV,
  receiverAddress: process.env.ENVIRONMENT === 'PROD' ? process.env.NMKR_RECEIVER_ADDRESS : process.env.NMKR_RECEIVER_ADDRESS_DEV,
}

// Validate that API key is provided
export function validateNmkrConfig() {
    console.log('NMKR_API_KEY environment variable is required', nmkrConfig.apiKey)
  if (!nmkrConfig.apiKey) {
    throw new Error('NMKR_API_KEY environment variable is required')
  }
} 