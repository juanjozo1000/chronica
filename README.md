# Chronica

**Immutable Media Documentation & NFT Minting Platform**

Chronica is a Next.js-based platform that enables users to capture, upload, and mint NFTs containing images or videos with contextual metadata. The platform leverages blockchain technology to create tamper-proof records of media content, preventing data manipulation, event framing, and protecting intellectual property rights through immutable documentation.

## 🎯 Purpose

Chronica addresses critical issues in digital media authenticity by:
- **Preventing Data Tampering**: Using blockchain immutability to preserve original content
- **Combating Event Framing**: Providing timestamped, contextual metadata for accurate documentation
- **Protecting Rights**: Creating verifiable ownership through NFT minting
- **Ensuring Transparency**: Implementing decentralized storage and verification mechanisms

## 🏗️ Technical Architecture

### Full-Stack Next.js Application
- **Frontend**: React-based UI with Material-UI components
- **Backend**: Next.js API routes providing serverless functions
- **Database**: IPFS for decentralized file storage
- **Blockchain**: Cardano blockchain via NMKR Studio API

### Key Components

```
chronica/
├── apps/frontend/
│   ├── pages/
│   │   ├── api/nmkr/          # NFT minting API endpoints
│   │   ├── publish/           # Media upload interface
│   │   └── index.tsx          # Main dashboard
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Configuration and utilities
│   ├── utils/                 # Core business logic
│   └── types/                 # TypeScript definitions
```

## 🔧 Technical Implementation

### Backend Architecture

#### 1. NFT Minting Pipeline

The platform follows a comprehensive 6-step process to transform uploaded media into tamper-proof NFTs:

**Step 1: File Upload & Validation**
When a user submits media through the frontend, the system validates the file format, size (max 50MB), and associated metadata. The multipart form data is parsed to extract both the media file and contextual information like title, description, timestamps, and geolocation data.

**Step 2: Unique Asset Generation**
The system generates a unique asset name by combining a "cro_" prefix, the first three characters of the title, and a Unix timestamp. This ensures each NFT has a globally unique identifier that can be traced back to its creation moment.

**Step 3: QR Code Verification Overlay**
Before permanent storage, the system embeds a tamper-evident QR code directly into the image pixels. This QR code contains a URL linking to the future blockchain record (pool.pm verification), creating a self-contained verification mechanism. The QR code is positioned in the bottom-right corner with a semi-transparent background to maintain image readability while ensuring authenticity verification.

**Step 4: Decentralized Storage (IPFS)**
The processed media file (now containing the verification QR code) is uploaded to IPFS using the NMKR Studio API. IPFS uses content-addressing, meaning the file's cryptographic hash becomes its permanent address. This prevents any modification since changing even one byte would result in a completely different hash.

**Step 5: CIP-25 Metadata Creation**
The system constructs comprehensive metadata following the Cardano CIP-25 standard. This includes the media's IPFS hash, creation timestamps, event timestamps (if different), geolocation data, cultural context, semantic tags, and authority type. Long text fields are automatically split into 64-character chunks to comply with blockchain limitations.

**Step 6: Blockchain Minting**
Finally, the NFT is minted on the Cardano blockchain through NMKR Studio. The metadata is permanently stored on-chain, while the media file remains on IPFS. The blockchain record includes the IPFS hash, ensuring the digital signature of the content is immutable.

#### 2. Tamper-Evident QR Code System

The platform implements a sophisticated QR code embedding system that serves as the first line of defense against tampering:

**QR Code Generation Process:**
The system dynamically generates QR codes containing verification URLs that point to the future blockchain record of each NFT. These QR codes are created as SVG graphics with high contrast (black codes on transparent backgrounds) to ensure scannability across different image types and lighting conditions.

**Intelligent Overlay Integration:**
Rather than simply pasting QR codes onto images, the system calculates optimal sizing based on the image dimensions - typically 5% of the total image area with a maximum of 20% of the shortest side. This ensures the QR code is large enough to scan reliably while minimizing visual impact on the original content.

**Visual Harmony and Readability:**
Each QR code is placed within a semi-transparent white background (70% opacity) with configurable margins. This creates sufficient contrast for scanning while allowing underlying image details to remain partially visible. The positioning system supports four corners (bottom-right, bottom-left, top-right, top-left) with intelligent margin calculations to prevent edge cropping.

**Pixel-Level Integration:**
The QR overlay is composited directly into the image buffer using high-performance image processing. This creates a permanent, inseparable bond between the verification mechanism and the visual content - any attempt to remove or alter the QR code would require sophisticated image editing that would be detectable through hash verification.

**Anti-Tampering Features:**
- **Immutable Links**: QR codes contain URLs to blockchain records that cannot be changed once created
- **Pixel-Level Embedding**: Integrated directly into image data, not as separate layers
- **Visual Integrity**: Semi-transparent design maintains original image aesthetics
- **Adaptive Sizing**: Automatically scales based on image dimensions for optimal scanning

#### 3. CIP-25 Metadata Standard Implementation

Chronica implements the official Cardano CIP-25 NFT metadata standard to ensure blockchain compatibility and comprehensive documentation:

**Metadata Structure and Organization:**
The system creates a hierarchical metadata structure following the "721" standard, organizing information under policy IDs and unique asset names. This ensures each NFT's metadata can be precisely located and verified on the Cardano blockchain.

**Smart Text Processing:**
Since blockchain storage has limitations, the system automatically splits long text fields into 64-character chunks. This prevents metadata rejection while preserving the complete information. Titles, descriptions, and location data are intelligently segmented without breaking words or meaning.

**Temporal Documentation:**
The platform captures dual timestamps - the actual minting time and the original event time (if different). This distinction is crucial for legal and journalistic applications where the time of capture may differ from the time of documentation. Both timestamps are stored in ISO format for international compatibility.

**Geospatial Integration:**
Location data is processed and stored in a standardized format, enabling geographic verification of events. The system handles various GPS coordinate formats and automatically converts them to a consistent structure for blockchain storage.

**Cultural and Contextual Metadata:**
Each NFT includes cultural markers (language, region) and authority type indicators. The "Bystander" authority type indicates citizen journalism or witness documentation, helping establish the source's relationship to documented events.

**Semantic Tagging System:**
The platform supports flexible tagging that enables categorization, searchability, and content organization. Tags are stored as arrays and can include event types, subject matter, or any relevant categorization criteria.

**Metadata Features:**
- **Temporal Integrity**: Separate minting and event timestamps for accurate chronological documentation
- **Geospatial Context**: Standardized GPS coordinate storage for location verification
- **Cultural Context**: Language codes and regional markers for international compatibility
- **Semantic Tags**: Flexible categorization system for content organization and discovery
- **Authority Type**: Source credibility and relationship indicators
- **IPFS Integration**: Direct links between blockchain metadata and decentralized file storage

### Frontend Architecture

#### 1. Media Upload Interface

The frontend provides an intuitive interface for media capture and contextual information:

- **File Upload**: Drag-and-drop or file browser selection
- **Metadata Forms**: Title, description, tags, location, timestamp
- **Real-time Preview**: Image/video preview with QR overlay simulation
- **Progress Tracking**: Upload and minting status indicators

#### 2. Frontend-Backend Integration

The platform uses a seamless integration pattern between the React frontend and Next.js API routes:

**User Interaction Flow:**
Users interact with intuitive forms that collect both media files and contextual metadata. The frontend validates input locally before transmission, providing immediate feedback on file sizes, formats, and required fields.

**Secure Data Transmission:**
Form data is packaged using the multipart/form-data encoding, allowing simultaneous transmission of binary media files and text metadata in a single request. This approach ensures data integrity and reduces the number of network calls.

**Asynchronous Processing:**
The frontend initiates the NFT creation process and provides real-time status updates as the backend progresses through each stage. Users receive feedback on upload progress, IPFS storage, metadata creation, and blockchain minting.

**Error Handling and Recovery:**
Comprehensive error handling ensures users understand any issues and can take corrective action. The system provides specific error messages for common problems like file size limits, network connectivity, or blockchain service availability.

**Complete Data Flow:**
1. **User Input**: Media upload and metadata entry through the web interface
2. **Frontend Validation**: Client-side checks for file requirements and field completion
3. **Secure Transmission**: FormData package sent to the NFT creation API endpoint
4. **Backend Processing**: Six-step pipeline transforms media into tamper-proof NFT
5. **Status Updates**: Real-time progress feedback throughout the minting process
6. **Confirmation**: Final blockchain details and verification links returned to user

## 🛡️ Data Integrity & Anti-Tampering

### Immutability Mechanisms

1. **Blockchain Storage**: NFT metadata stored on Cardano blockchain
2. **IPFS Addressing**: Content-addressed storage prevents modification
3. **QR Code Verification**: Embedded links to blockchain records
4. **Timestamping**: Immutable creation and event timestamps
5. **Cryptographic Hashing**: Content integrity verification

### Verification Process

Users can verify media authenticity by:
1. Scanning the embedded QR code
2. Accessing the pool.pm verification URL
3. Confirming blockchain record matches original metadata
4. Validating IPFS hash integrity

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- NMKR Studio API credentials
- IPFS gateway access

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/chronica.git
cd chronica

# Install dependencies
cd apps/frontend
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

```env
# NMKR Studio Configuration
NMKR_API_KEY=your_nmkr_api_key
NMKR_BASE_URL=https://studio-api.nmkr.io
NMKR_PROJECT_UID=your_project_uid
NMKR_POLICY_ID=your_policy_id
NMKR_RECEIVER_ADDRESS=your_wallet_address

# IPFS Configuration
IPFS_MEDIA_BASE_URL=https://ipfs.io/ipfs/

# Environment
ENVIRONMENT=DEV # or PROD
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
npm start

# Type checking
npm run type-check
```

## 📡 API Endpoints

### POST `/api/nmkr/create-nft`

Creates and mints an NFT with embedded verification.

**Request Structure:**
The API accepts multipart form data containing:
- **title** (required): Human-readable name for the NFT
- **description** (optional): Detailed context about the media content
- **media** (required): Binary file data (image or video, max 50MB)
- **eventTimestamp** (optional): When the original event occurred (ISO format)
- **geoLocation** (optional): GPS coordinates where media was captured
- **tags** (optional): Array of categorization labels
- **culture** (optional): Language/cultural context (defaults to EN-US)

**Response Structure:**
The API returns a standardized response containing:
- **success**: Boolean indicating operation completion status
- **data** (on success): Object containing blockchain identifiers
  - **nftId**: Internal NMKR Studio identifier
  - **nftUid**: Universal unique identifier for the NFT
  - **ipfsHashMainnft**: IPFS content hash for decentralized access
  - **assetId**: Cardano blockchain asset identifier
- **error** (on failure): Human-readable error description

### GET `/api/nmkr/get-payout-wallets`

Retrieves configured payout wallet addresses.

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 14**: Full-stack React framework
- **TypeScript**: Type-safe development
- **Material-UI**: Component library
- **Sharp**: High-performance image processing
- **Formidable**: File upload handling

### Blockchain & Storage
- **NMKR Studio API**: Cardano NFT minting service
- **IPFS**: Decentralized file storage
- **Cardano Blockchain**: Immutable metadata storage
- **CIP-25 Standard**: NFT metadata specification

### Image Processing
- **QRCode Library**: QR code generation
- **Sharp**: Image manipulation and overlay
- **Buffer Processing**: Binary data handling

## 🔐 Security Considerations

### Data Protection
- File size limits (50MB max)
- MIME type validation
- Input sanitization
- Error handling and logging

### Blockchain Security
- Immutable metadata storage
- Cryptographic asset verification
- Decentralized content addressing
- Tamper-evident QR embedding

## 📈 Future Enhancements

- [ ] Multi-blockchain support (Ethereum, Polygon)
- [ ] Advanced metadata schemas
- [ ] Mobile capture applications
- [ ] Real-time verification APIs
- [ ] Integration with legal frameworks
- [ ] Batch processing capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙋‍♂️ Support

For technical support or questions about implementation, please open an issue on GitHub or contact the development team.

---

**Chronica** - *Preserving Truth Through Immutable Documentation*