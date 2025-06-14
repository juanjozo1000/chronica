import { useState, useRef, useCallback, useEffect } from 'react'
import Head from 'next/head'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Fab,
} from '@mui/material'
import {
  Camera,
  Videocam,
  Refresh,
  Delete,
  Close,
  Add,
  LocationOn,
  Warning,
  PhotoCamera,
  Stop,
} from '@mui/icons-material'

type MediaType = 'photo' | 'video' | null
type CaptureMode = 'camera' | 'preview' | 'form'

interface LocationData {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  address: string | null
}

interface MediaData {
  title: string
  context: string
  tags: string[]
  culture: string
  mediaBlob: Blob | null
  mediaType: MediaType
  location: LocationData
}

const cultures = [
  { value: 'EN-US', label: 'English (US)' },
  { value: 'EN-GB', label: 'English (UK)' },
  { value: 'ES-ES', label: 'Spanish (Spain)' },
  { value: 'ES-MX', label: 'Spanish (Mexico)' },
  { value: 'FR-FR', label: 'French (France)' },
  { value: 'DE-DE', label: 'German (Germany)' },
  { value: 'IT-IT', label: 'Italian (Italy)' },
  { value: 'PT-BR', label: 'Portuguese (Brazil)' },
  { value: 'JA-JP', label: 'Japanese (Japan)' },
  { value: 'KO-KR', label: 'Korean (Korea)' },
  { value: 'ZH-CN', label: 'Chinese (Simplified)' },
  { value: 'ZH-TW', label: 'Chinese (Traditional)' },
]

export default function MediaCapturePage() {
  const [mode, setMode] = useState<CaptureMode>('camera')
  const [mediaData, setMediaData] = useState<MediaData>({
    title: '',
    context: '',
    tags: [],
    culture: 'EN-US',
    mediaBlob: null,
    mediaType: null,
    location: {
      latitude: null,
      longitude: null,
      accuracy: null,
      address: null,
    },
  })
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Request location permission and get current location
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.')
      return
    }

    setIsLoadingLocation(true)

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(permission.state)

      if (permission.state === 'granted' || permission.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords

            // Try to get address from coordinates (reverse geocoding)
            let address = null
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
              )
              const data = await response.json()
              address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            } catch (error) {
              console.error('Error getting address:', error)
              address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }

            setMediaData((prev) => ({
              ...prev,
              location: {
                latitude,
                longitude,
                accuracy,
                address,
              },
            }))
            setIsLoadingLocation(false)
          },
          (error) => {
            console.error('Error getting location:', error)
            setLocationPermission('denied')
            setIsLoadingLocation(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          },
        )
      } else {
        setLocationPermission('denied')
        setIsLoadingLocation(false)
      }
    } catch (error) {
      console.error('Error requesting location permission:', error)
      setIsLoadingLocation(false)
    }
  }, [])

  // Camera functions - removed from useEffect dependencies to prevent flickering
  const startCamera = useCallback(async () => {
    // Don't start camera if already exists
    if (stream) return
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }, [stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setMediaData((prev) => ({
            ...prev,
            mediaBlob: blob,
            mediaType: 'photo',
          }))
          stopCamera()
          setMode('preview')
        }
      },
      'image/jpeg',
      0.8,
    )
  }, [stopCamera])

  const startVideoRecording = useCallback(() => {
    if (!stream) return

    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setMediaData((prev) => ({
        ...prev,
        mediaBlob: blob,
        mediaType: 'video',
      }))
      stopCamera()
      setMode('preview')
    }

    mediaRecorder.start()
    setIsRecording(true)
  }, [stream, stopCamera])

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const retakeMedia = useCallback(() => {
    setMediaData((prev) => ({
      ...prev,
      mediaBlob: null,
      mediaType: null,
    }))
    setMode('camera')
  }, [])

  const deleteMedia = useCallback(() => {
    setMediaData((prev) => ({
      title: '',
      context: '',
      tags: [],
      culture: 'EN-US',
      mediaBlob: null,
      mediaType: null,
      location: prev.location, // Keep location data
    }))
    setMode('camera')
  }, [])

  const addTag = useCallback(() => {
    if (newTag.trim() && !mediaData.tags.includes(newTag.trim())) {
      setMediaData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }, [newTag, mediaData.tags])

  const removeTag = useCallback((tagToRemove: string) => {
    setMediaData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!mediaData.mediaBlob) return

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Convert blob to base64 for API submission
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string
          const base64 = base64data.split(',')[1] // Remove data:image/jpeg;base64, prefix

          const requestData = {
            title: mediaData.title,
            description: mediaData.context,
            fileBase64: base64,
            mimetype: mediaData.mediaType === 'photo' ? 'image/jpeg' : 'video/webm',
            eventTimestamp: new Date().toISOString(),
            geoLocation: mediaData.location.address || '',
            tags: mediaData.tags,
            culture: mediaData.culture,
          }

          const response = await fetch('/api/nmkr/create-nft', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          })

          const result = await response.json()
          
          if (result.success) {
            setSubmitSuccess(true)
            console.log('NFT Result:', result)
            // Reset form after successful submission
            setTimeout(() => {
              deleteMedia()
              setSubmitSuccess(false)
            }, 3000)
          } else {
            setSubmitError(result.error || 'Failed to create NFT')
          }
        } catch (error) {
          console.error('Error processing media:', error)
          setSubmitError('Error processing media file')
        } finally {
          setIsSubmitting(false)
        }
      }
      reader.readAsDataURL(mediaData.mediaBlob)
    } catch (error) {
      console.error('Error submitting media:', error)
      setSubmitError('Error submitting media')
      setIsSubmitting(false)
    }
  }, [mediaData, deleteMedia])

  // Request location on component mount
  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  // Handle camera start/stop based on mode - FIXED: removed function dependencies
  useEffect(() => {
    if (mode === 'camera') {
      startCamera()
    }
    
    // Cleanup function to stop camera when switching modes
    return () => {
      if (mode !== 'camera') {
        stopCamera()
      }
    }
  }, [mode]) // Only depend on mode, not the functions

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, []) // Empty dependency array

  return (
    <>
      <Head>
        <title>Media Capture - Chronica</title>
        <meta name="description" content="Capture and mint historical moments as NFTs" />
      </Head>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={8} sx={{ borderRadius: 3 }}>
          <CardHeader 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" component="h1" fontWeight="bold">
              Media Capture
            </Typography>
            {isLoadingLocation && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                <LocationOn sx={{ animation: 'pulse 2s infinite' }} />
                <Typography variant="body2">Getting location...</Typography>
              </Box>
            )}
          </CardHeader>

          <CardContent sx={{ p: 3 }}>
            {/* Location Permission Alert */}
            {locationPermission === 'denied' && (
              <Alert 
                severity="warning" 
                icon={<Warning />}
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={requestLocation}>
                    Try Again
                  </Button>
                }
              >
                Location access denied. Media will be saved without location data.
              </Alert>
            )}

            {/* Location Display */}
            {mediaData.location.address && (
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  bgcolor: 'grey.50'
                }}
              >
                <LocationOn color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {mediaData.location.address}
                </Typography>
              </Paper>
            )}

            {/* Camera Mode */}
            {mode === 'camera' && (
              <Stack spacing={3}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    position: 'relative',
                    aspectRatio: '4/3',
                    bgcolor: 'black',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                  {isRecording && (
                    <Chip
                      label="Recording..."
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        animation: 'pulse 2s infinite'
                      }}
                    />
                  )}
                </Paper>

                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<PhotoCamera />}
                    onClick={capturePhoto}
                    disabled={!stream}
                    sx={{ py: 1.5 }}
                  >
                    Photo
                  </Button>
                  <Button
                    fullWidth
                    variant={isRecording ? 'contained' : 'outlined'}
                    color={isRecording ? 'error' : 'primary'}
                    size="large"
                    startIcon={isRecording ? <Stop /> : <Videocam />}
                    onClick={isRecording ? stopVideoRecording : startVideoRecording}
                    disabled={!stream}
                    sx={{ py: 1.5 }}
                  >
                    {isRecording ? 'Stop' : 'Video'}
                  </Button>
                </Stack>
              </Stack>
            )}

            {/* Preview Mode */}
            {mode === 'preview' && mediaData.mediaBlob && (
              <Stack spacing={3}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    position: 'relative',
                    aspectRatio: '4/3',
                    bgcolor: 'black',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  {mediaData.mediaType === 'photo' ? (
                    <img
                      src={URL.createObjectURL(mediaData.mediaBlob)}
                      alt="Captured"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(mediaData.mediaBlob)}
                      controls
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  )}
                </Paper>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={retakeMedia}
                    sx={{ flex: 1 }}
                  >
                    Retake
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={deleteMedia}
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setMode('form')}
                    sx={{ flex: 1 }}
                  >
                    Continue
                  </Button>
                </Stack>
              </Stack>
            )}

            {/* Form Mode */}
            {mode === 'form' && (
              <Stack spacing={3}>
                {/* Media Preview */}
                {mediaData.mediaBlob && (
                  <Paper 
                    elevation={3}
                    sx={{ 
                      position: 'relative',
                      aspectRatio: '16/9',
                      bgcolor: 'black',
                      borderRadius: 2,
                      overflow: 'hidden',
                      mb: 3
                    }}
                  >
                    {mediaData.mediaType === 'photo' ? (
                      <img
                        src={URL.createObjectURL(mediaData.mediaBlob)}
                        alt="Captured"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(mediaData.mediaBlob)}
                        controls
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    )}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                        },
                      }}
                      onClick={retakeMedia}
                    >
                      <Refresh />
                    </IconButton>
                  </Paper>
                )}

                {/* Title Field */}
                <TextField
                  fullWidth
                  label="Title"
                  placeholder="Enter a title for your media"
                  value={mediaData.title}
                  onChange={(e) => setMediaData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />

                {/* Context Field */}
                <TextField
                  fullWidth
                  label="Context"
                  placeholder="Describe the context or story behind this media"
                  multiline
                  rows={4}
                  value={mediaData.context}
                  onChange={(e) => setMediaData((prev) => ({ ...prev, context: e.target.value }))}
                />

                {/* Culture Field */}
                <FormControl fullWidth>
                  <InputLabel>Culture</InputLabel>
                  <Select
                    value={mediaData.culture}
                    label="Culture"
                    onChange={(e) => setMediaData((prev) => ({ ...prev, culture: e.target.value }))}
                  >
                    {cultures.map((culture) => (
                      <MenuItem key={culture.value} value={culture.value}>
                        {culture.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Tags Field */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      size="small"
                    />
                    <IconButton color="primary" onClick={addTag}>
                      <Add />
                    </IconButton>
                  </Stack>
                  {mediaData.tags.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      {mediaData.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => removeTag(tag)}
                          deleteIcon={<Close />}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Success/Error Messages */}
                {submitSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    NFT created successfully! The form will reset in a moment.
                  </Alert>
                )}
                {submitError && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    onClose={() => setSubmitError(null)}
                  >
                    {submitError}
                  </Alert>
                )}

                {/* Loading Progress */}
                {isSubmitting && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      Creating NFT...
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setMode('preview')}
                    disabled={isSubmitting}
                    sx={{ flex: 1 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!mediaData.title || !mediaData.context || isSubmitting || submitSuccess}
                    sx={{ flex: 1 }}
                  >
                    {isSubmitting ? 'Creating NFT...' : submitSuccess ? 'NFT Created!' : 'Create NFT'}
                  </Button>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  )
} 