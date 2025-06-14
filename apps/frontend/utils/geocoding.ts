interface LocationInfo {
  country: string;
  city: string;
}

export async function getLocationFromCoordinates(
  latitude: number,
  longitude: number
): Promise<LocationInfo> {
  try {
    console.log("Fetching location for coordinates:", { latitude, longitude });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Chronica/1.0",
        },
      }
    );

    const data = await response.json();
    console.log("Geocoding response:", data);

    if (!data.address) {
      console.warn("No address data in response:", data);
      return {
        country: "Unknown Country",
        city: "Unknown City",
      };
    }

    const location = {
      country: data.address.country || "Unknown Country",
      city:
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "Unknown City",
    };

    console.log("Parsed location:", location);
    return location;
  } catch (error) {
    console.error("Error fetching location:", error);
    return {
      country: "Unknown Country",
      city: "Unknown City",
    };
  }
}
