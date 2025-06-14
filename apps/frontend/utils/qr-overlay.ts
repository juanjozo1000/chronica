import sharp from 'sharp'
import QRCode from 'qrcode'

export interface QROverlayOptions {
  qrContent: string
  qrSize?: number
  backgroundColor?: string
  backgroundOpacity?: number
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  margin?: number
}

export async function addQRCodeOverlay(
  imageBuffer: Buffer,
  options: QROverlayOptions
): Promise<Buffer> {
  const {
    qrContent,
    qrSize = 0.05, // 5% of image size
    backgroundColor = 'white',
    backgroundOpacity = 0.7, // 70% transparency
    position = 'bottom-right',
    margin = 20
  } = options

  // Get image metadata
  const imageInfo = await sharp(imageBuffer).metadata()
  const imageWidth = imageInfo.width || 1000
  const imageHeight = imageInfo.height || 1000
  
  // Calculate QR code size (max 5% of image area)
  const maxQRSize = Math.sqrt((imageWidth * imageHeight) * qrSize)
  const qrCodeSize = Math.min(maxQRSize, Math.min(imageWidth, imageHeight) * 0.2)
  
  // Generate QR code as SVG
  const qrSvg = await QRCode.toString(qrContent, {
    type: 'svg',
    width: qrCodeSize,
    margin: 0,
    color: {
      dark: '#000000', // Black QR code
      light: '#00000000' // Transparent background for QR
    }
  })
  
  // Convert QR SVG to PNG
  const qrBuffer = await sharp(Buffer.from(qrSvg))
    .resize(Math.round(qrCodeSize), Math.round(qrCodeSize))
    .png()
    .toBuffer()
  
  // Create background with transparency
  const backgroundSize = qrCodeSize + (margin * 2)
  
  const qrWithBackground = await sharp({
    create: {
      width: backgroundSize,
      height: backgroundSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Fully transparent background
    }
  })
  .composite([
    // Add semi-transparent white background
    {
      input: await sharp({
        create: {
          width: backgroundSize,
          height: backgroundSize,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: backgroundOpacity }
        }
      }).png().toBuffer(),
      blend: 'over'
    },
    // Add QR code on top
    {
      input: qrBuffer,
      left: margin,
      top: margin,
      blend: 'over'
    }
  ])
  .png()
  .toBuffer()
  
  // Calculate position for overlay
  let left: number, top: number
  
  switch (position) {
    case 'bottom-right':
      left = imageWidth - backgroundSize - margin
      top = imageHeight - backgroundSize - margin
      break
    case 'bottom-left':
      left = margin
      top = imageHeight - backgroundSize - margin
      break
    case 'top-right':
      left = imageWidth - backgroundSize - margin
      top = margin
      break
    case 'top-left':
      left = margin
      top = margin
      break
    default:
      left = imageWidth - backgroundSize - margin
      top = imageHeight - backgroundSize - margin
  }
  
  // Composite QR overlay onto original image
  const result = await sharp(imageBuffer)
    .composite([{
      input: qrWithBackground,
      left: Math.max(0, left),
      top: Math.max(0, top),
      blend: 'over'
    }])
    .toBuffer()
  
  return result
} 