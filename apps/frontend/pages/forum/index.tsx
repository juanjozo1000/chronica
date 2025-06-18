import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useBlockfrostAssets } from "../../components/BlockfrostAssets";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LocationOn,
} from "@mui/icons-material";
import { EmptyCard } from "../../components/EmptyCard";
import { getLocationFromCoordinates } from "@/utils/geocoding";
import { Grid as MuiGrid } from "@mui/material";
import type { GridProps } from "@mui/material/Grid";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  width: "300px",
  height: "450px",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.2)",
  },
}));

interface LocationInfo {
  country: string;
  city: string;
}

const IPFS_MEDIA_BASE_URL = "https://c-ipfs-gw.nmkr.io/ipfs/";

export default function Forum() {
  const { assets, loading, error } = useBlockfrostAssets();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    tag: "",
    country: "",
    city: "",
  });
  const [locationInfo, setLocationInfo] = useState<{
    [key: string]: LocationInfo;
  }>({});

  // Get unique tags from all assets
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    assets.forEach((asset) => {
      asset.onchain_metadata?.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [assets]);

  // Get unique countries from location info
  const uniqueCountries = useMemo(() => {
    const countries = new Set<string>();
    Object.values(locationInfo).forEach((location) => {
      if (location?.country) countries.add(location.country);
    });
    return Array.from(countries).sort();
  }, [locationInfo]);

  // Get unique cities from location info
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    Object.values(locationInfo).forEach((location) => {
      if (location?.city) cities.add(location.city);
    });
    return Array.from(cities).sort();
  }, [locationInfo]);

  const handleBuyClick = (asset: any) => {
    setSelectedAsset(asset);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFilterChange = (field: string) => (event: any) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  const filteredAssets = assets.filter((asset) => {
    const metadata = asset.onchain_metadata || {};
    const assetLocation = locationInfo[asset.asset];
    console.log(asset.onchain_metadata);
    
    // Date filter - transform date input (YYYY-MM-DD) to match minting_timestamp format (YYYY-MM-DD_HH-MM-SS)
    const dateMatch = !filters.date || 
      metadata.minting_timestamp?.startsWith(filters.date);
    
    // Tag filter - check if the selected tag is in the asset's tags
    const tagMatch = !filters.tag || 
      metadata.tags?.includes(filters.tag);
    
    // Country filter - exact match with geocoded country
    const countryMatch = !filters.country || 
      assetLocation?.country === filters.country;
    
    // City filter - exact match with geocoded city
    const cityMatch = !filters.city || 
      assetLocation?.city === filters.city;
    
    return dateMatch && tagMatch && countryMatch && cityMatch;
  });

  useEffect(() => {
    const fetchLocationInfo = async () => {
      const newLocationInfo: { [key: string]: LocationInfo } = {};

      for (const asset of assets) {
        console.log("Processing asset:", asset.asset);
        console.log("Asset onchain_metadata:", asset.onchain_metadata);

        if (asset.onchain_metadata?.geo_location) {
          const geoCoords = asset.onchain_metadata.geo_location.split(", ");
          if (geoCoords.length === 2) {
            const latitude = parseFloat(geoCoords[0]);
            const longitude = parseFloat(geoCoords[1]);

            console.log("Found GPS coordinates:", {
              latitude,
              longitude,
            });

            const location = await getLocationFromCoordinates(
              latitude,
              longitude
            );
            newLocationInfo[asset.asset] = location;
          } else {
            console.log("Invalid geo_location format for asset:", asset.asset);
          }
        } else {
          console.log("No geo_location found for asset:", asset.asset);
        }
      }

      console.log("Final location info:", newLocationInfo);
      setLocationInfo(newLocationInfo);
    };

    if (assets.length > 0) {
      fetchLocationInfo();
    }
  }, [assets]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" align="center">
          Loading assets...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        Chronica Forum
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                     <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
             <TextField
               fullWidth
               label="Date"
               type="date"
               value={filters.date}
               onChange={handleFilterChange("date")}
               InputLabelProps={{
                 shrink: true,
               }}
               inputProps={{
                 max: new Date().toISOString().split('T')[0], // Don't allow future dates
               }}
             />
           </Box>
          <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
            <FormControl fullWidth>
              <InputLabel>Tag</InputLabel>
              <Select
                value={filters.tag}
                label="Tag"
                onChange={handleFilterChange("tag")}
                sx={{ minWidth: "200px" }}
              >
                <MenuItem value="">All</MenuItem>
                {uniqueTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
                     <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
             <FormControl fullWidth>
               <InputLabel>Country</InputLabel>
               <Select
                 value={filters.country}
                 label="Country"
                 onChange={handleFilterChange("country")}
               >
                 <MenuItem value="">All</MenuItem>
                 {uniqueCountries.map((country) => (
                   <MenuItem key={country} value={country}>
                     {country}
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>
           </Box>
           <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
             <FormControl fullWidth>
               <InputLabel>City</InputLabel>
               <Select
                 value={filters.city}
                 label="City"
                 onChange={handleFilterChange("city")}
               >
                 <MenuItem value="">All</MenuItem>
                 {uniqueCities.map((city) => (
                   <MenuItem key={city} value={city}>
                     {city}
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>
           </Box>
        </Box>
      </Box>

      {/* Asset Grid */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        {loading ? (
          // Show skeleton cards while loading
          Array.from(new Array(6)).map((_, index) => (
            <Box
              key={index}
              sx={{ flex: "1 1 250px", maxWidth: "280px", width: "100%" }}
            >
              <EmptyCard isLoading={true} />
            </Box>
          ))
        ) : filteredAssets.length === 0 ? (
          // Show "no results" message when filtering returns no matches
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No assets found
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Try adjusting your filters or check back later for new content.
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => {
                setFilters({
                  date: "",
                  tag: "",
                  country: "",
                  city: "",
                });
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        ) : (
          // Show actual asset cards
          filteredAssets.map((asset) => (
            <Box
              key={asset.asset}
              sx={{ flex: "1 1 250px", maxWidth: "280px", width: "100%" }}
            >
              <Box
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  width: "100%",
                  "&:hover": {
                    transform: "scale(1.02)",
                    transition: "transform 0.2s ease-in-out",
                  },
                }}
                onClick={() => handleBuyClick(asset)}
              >
                <EmptyCard
                  imageUrl={
                    IPFS_MEDIA_BASE_URL + asset.onchain_metadata?.image
                  }
                  title={asset.onchain_metadata?.title || "Untitled"}
                  description={
                    asset.onchain_metadata?.entries?.[0] ||
                    "No description available"
                  }
                  price={100}
                  tags={asset.onchain_metadata?.tags || []}
                  location={
                    locationInfo[asset.asset]
                      ? `${locationInfo[asset.asset].city}, ${
                          locationInfo[asset.asset].country
                        }`
                      : asset.onchain_metadata?.geo_location ||
                        "Location unknown"
                  }
                />
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Buy Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedAsset && (
          <>
            <DialogTitle>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5">
                  {selectedAsset.onchain_metadata?.title || "Untitled"}
                </Typography>
                <IconButton onClick={handleCloseDialog} size="large">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={4}>
                  <Grid component="div">
                    <Box
                      component="img"
                      src={
                        IPFS_MEDIA_BASE_URL +
                        selectedAsset.onchain_metadata?.image
                      }
                      alt={
                        selectedAsset.onchain_metadata?.title || "Asset image"
                      }
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 2,
                        mb: 2,
                        objectFit: "cover",
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      €100{" "}
                      {/* Default price since it's not in onchain_metadata */}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {selectedAsset.onchain_metadata?.tags?.map(
                        (tag: string) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )
                      )}
                    </Box>
                  </Grid>
                  <Grid container>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        Context
                      </Typography>
                      <Typography variant="body1">
                        {selectedAsset.onchain_metadata?.entries?.[0] ||
                          "No description available"}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        Location
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOn fontSize="small" />
                        {locationInfo[selectedAsset.asset]
                          ? `${locationInfo[selectedAsset.asset].city}, ${
                              locationInfo[selectedAsset.asset].country
                            }`
                          : selectedAsset.onchain_metadata?.geo_location ||
                            "Location unknown"}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        Asset Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Policy ID: {selectedAsset.policy_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Asset ID: {selectedAsset.asset}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fingerprint: {selectedAsset.fingerprint}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Minting Date:{" "}
                        {selectedAsset.onchain_metadata?.minting_timestamp}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Culture: {selectedAsset.onchain_metadata?.culture}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        Payment Methods
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Button variant="outlined">Credit Card</Button>
                        <Button variant="outlined">ADA</Button>
                        <Button variant="outlined">USDM</Button>
                      </Stack>
                    </Box>

                    <Box sx={{ width: "100%", mt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => {
                          // Handle buy action
                          handleCloseDialog();
                        }}
                      >
                        Buy Now
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
}
