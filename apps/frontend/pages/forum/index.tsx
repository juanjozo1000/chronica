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
      asset.metadata?.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [assets]);

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
    const metadata = asset.metadata || {};
    return (
      (!filters.date || metadata.date?.includes(filters.date)) &&
      (!filters.tag || metadata.tags?.includes(filters.tag)) &&
      (!filters.country || metadata.location?.country === filters.country) &&
      (!filters.city || metadata.location?.city === filters.city)
    );
  });

  useEffect(() => {
    const fetchLocationInfo = async () => {
      const newLocationInfo: { [key: string]: LocationInfo } = {};

      for (const asset of assets) {
        console.log("Processing asset:", asset.asset);
        console.log("Asset metadata:", asset.metadata);

        if (asset.metadata?.gps_latitude && asset.metadata?.gps_longitude) {
          console.log("Found GPS coordinates:", {
            latitude: asset.metadata.gps_latitude,
            longitude: asset.metadata.gps_longitude,
          });

          const location = await getLocationFromCoordinates(
            asset.metadata.gps_latitude,
            asset.metadata.gps_longitude
          );
          newLocationInfo[asset.asset] = location;
        } else {
          console.log("No GPS coordinates found for asset:", asset.asset);
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Date"
              value={filters.date}
              onChange={handleFilterChange("date")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Country"
              value={filters.country}
              onChange={handleFilterChange("country")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="City"
              value={filters.city}
              onChange={handleFilterChange("city")}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Asset Grid */}
      <Grid container spacing={3} justifyContent="center">
        {loading || error || filteredAssets.length === 0
          ? Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <EmptyCard isLoading={true} />
              </Grid>
            ))
          : filteredAssets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.asset}>
                <Box
                  sx={{
                    position: "relative",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.02)",
                      transition: "transform 0.2s ease-in-out",
                    },
                  }}
                  onClick={() => handleBuyClick(asset)}
                >
                  <EmptyCard
                    imageUrl={asset.metadata?.image}
                    title={asset.metadata?.title || "Untitled"}
                    description={
                      asset.metadata?.description || "No description available"
                    }
                    price={asset.metadata?.price || 100}
                    tags={asset.metadata?.tags || []}
                    location={
                      locationInfo[asset.asset]
                        ? `${locationInfo[asset.asset].city}, ${
                            locationInfo[asset.asset].country
                          }`
                        : "Location unknown"
                    }
                  />
                </Box>
              </Grid>
            ))}
      </Grid>

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
                  {selectedAsset.metadata?.title || "Untitled"}
                </Typography>
                <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box
                      component="img"
                      src={selectedAsset.metadata?.image}
                      alt={selectedAsset.metadata?.title || "Asset image"}
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      €{selectedAsset.metadata?.price || 100}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {selectedAsset.metadata?.tags?.map((tag: string) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        Context
                      </Typography>
                      <Typography variant="body1">
                        {selectedAsset.metadata?.description ||
                          "No context available"}
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
                          : "Location unknown"}
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
                        <Button
                          variant="outlined"
                          startIcon={
                            <img
                              src="/credit-card.svg"
                              alt="Credit Card"
                              style={{ width: 24, height: 16 }}
                            />
                          }
                        >
                          Credit Card
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={
                            <img
                              src="/ada.svg"
                              alt="ADA"
                              style={{ width: 24, height: 24 }}
                            />
                          }
                        >
                          ADA
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={
                            <img
                              src="/usdm.svg"
                              alt="USDM"
                              style={{ width: 24, height: 24 }}
                            />
                          }
                        >
                          USDM
                        </Button>
                      </Stack>
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
