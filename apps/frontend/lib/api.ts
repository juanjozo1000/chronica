export enum PlatformEnv {
	PROD = "prod",
	STAGING = "staging",
	LOCAL = "local",
	DEVELOPMENT = "dev",
}

export const getBaseUrl = () => {
	const envType = process.env.NEXT_PUBLIC_ENV_TYPE?.toLowerCase();
	
	switch (envType) {
		case "production":
			return process.env.NEXT_PUBLIC_API_URL || "https://api.lentils.io";
		case "staging":
			return process.env.NEXT_PUBLIC_API_URL || "https://staging-api.lentils.io";
		case "dev":
			return process.env.NEXT_PUBLIC_API_URL || "https://dev.api.lentils.app/api";
		default:
			console.warn(`Environment type '${envType}' not recognized. Using development URL.`);
			return process.env.NEXT_PUBLIC_API_URL || "https://dev.api.lentils.app/api";
	}
};
