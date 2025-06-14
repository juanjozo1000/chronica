import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import { LocationOn } from "@mui/icons-material";

interface EmptyCardProps {
  imageUrl?: string;
  title?: string;
  description?: string;
  price?: number;
  tags?: string[];
  location?: string;
  isLoading?: boolean;
}

export const EmptyCard = ({
  imageUrl,
  title,
  description,
  price,
  tags,
  location,
  isLoading = false,
}: EmptyCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardMedia
          component="img"
          height="200"
          sx={{ height: "200px", objectFit: "cover" }}
          image="/placeholder-image.jpg"
          alt="Loading..."
        />
        <CardContent
          sx={{
            height: "250px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Loading...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we load the content...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <CardMedia
        component="img"
        height="200"
        sx={{ height: "200px", objectFit: "cover" }}
        image={imageUrl || "/placeholder-image.jpg"}
        alt={title || "NFT Asset"}
      />
      <CardContent
        sx={{
          height: "250px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" gutterBottom noWrap>
          {title || "Untitled Asset"}
        </Typography>
        <Typography variant="h6" color="primary">
          €{price || 100}
        </Typography>
        {location && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
          >
            <LocationOn fontSize="small" />
            {location}
          </Typography>
        )}
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
          {tags?.map((tag: string) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Stack>
        <Button variant="contained" fullWidth sx={{ mt: "auto" }}>
          Buy
        </Button>
      </CardContent>
    </Card>
  );
};
