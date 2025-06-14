import React, { useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useBlockfrostAssets } from "../../components/BlockfrostAssets";
import type { GridProps } from "@mui/material/Grid";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  width: "300px",
  height: "450px", // Increased fixed height to accommodate 2 lines of tags
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.2)",
  },
}));

const EmptyCard = () => (
  <StyledCard>
    <Skeleton variant="rectangular" height={200} />
    <CardContent
      sx={{
        height: "250px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Skeleton variant="text" height={40} />
      <Skeleton variant="text" width="60%" />
      <Box sx={{ mt: 1, mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={70} height={24} />
      </Box>
      <Skeleton variant="rectangular" height={36} sx={{ mt: "auto" }} />
    </CardContent>
  </StyledCard>
);

const Forum = () => {
  const { assets, loading, error } = useBlockfrostAssets();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    tag: "",
    country: "",
    city: "",
  });

  // Get unique tags from all assets
  const uniqueTags = React.useMemo(() => {
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
          ? // Show skeleton loaders
            Array.from(new Array(6)).map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <EmptyCard />
              </Grid>
            ))
          : // Show actual assets
            filteredAssets.map((asset) => (
              <Grid item key={asset.asset} xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="200"
                    sx={{ height: "200px", objectFit: "cover" }}
                    image={asset.metadata?.image || "/placeholder-image.jpg"}
                    alt={asset.metadata?.name || "NFT Asset"}
                  />
                  <CardContent
                    sx={{
                      height: "250px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      noWrap
                    >
                      {asset.metadata?.name || "Untitled Asset"}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      €{asset.metadata?.price || 100}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0}
                      sx={{
                        mt: 1,
                        mb: 2,
                        flexWrap: "wrap",
                        gap: "4px",
                        maxHeight: "56px",
                        overflow: "hidden",
                        minHeight: "56px",
                        "& > *": {
                          margin: 0,
                        },
                      }}
                    >
                      {asset.metadata?.tags?.map((tag: string) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: "auto" }}
                      onClick={() => handleBuyClick(asset)}
                    >
                      Buy
                    </Button>
                  </CardContent>
                </StyledCard>
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
        <DialogTitle>Purchase Media Rights</DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAsset.metadata?.name || "Untitled Asset"}
              </Typography>
              <Typography variant="body1" paragraph>
                Price: €{selectedAsset.metadata?.price || 100}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Asset Details:
              </Typography>
              <pre
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "1rem",
                  borderRadius: "4px",
                }}
              >
                {JSON.stringify(
                  {
                    "721": {
                      [selectedAsset.policy_id]: {
                        [selectedAsset.asset_name]: {
                          title:
                            selectedAsset.metadata?.name || "Untitled Asset",
                          minting_timestamp: selectedAsset.metadata?.date || "",
                          event_timestamp: "",
                          geo_location: "9.12.566238",
                          entries: ["Sample content entry"],
                          media: selectedAsset.metadata?.image || "",
                          authority_type: "Media",
                          tags: selectedAsset.metadata?.tags || [],
                          culture: "EN-US",
                        },
                      },
                    },
                  },
                  null,
                  2
                )}
              </pre>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Payment Methods:
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined">Credit Card</Button>
                <Button variant="outlined">PayPal</Button>
                <Button variant="outlined">Crypto</Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary">
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Forum;
