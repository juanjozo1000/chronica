import { useState } from 'react'
import Head from 'next/head'
import { CreateNftRequest, CreateNftResponse } from './api/nmkr/create-nft'

export default function CreateNft() {
  const [formData, setFormData] = useState<CreateNftRequest>({
    projectUid: '',
    tokenName: '',
    displayName: '',
    description: '',
    fileUrl: '',
    mimetype: 'image/png',
    priceInLovelace: 0,
  })
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CreateNftResponse | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priceInLovelace' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/nmkr/create-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data: CreateNftResponse = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error creating NFT:', error)
      setResult({
        success: false,
        error: 'Network error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create NFT - Chronica</title>
        <meta name="description" content="Create NFT using NMKR Studio API" />
      </Head>

      <div className="container">
        <main className="main" style={{ minHeight: 'auto', padding: '2rem 0' }}>
          <h1 className="title">Create NFT</h1>
          <p className="description">
            Upload and create NFTs using NMKR Studio API
          </p>

          <div className="form-container">
            <form onSubmit={handleSubmit} className="nft-form">
              <div className="form-group">
                <label htmlFor="projectUid">Project UID *</label>
                <input
                  type="text"
                  id="projectUid"
                  name="projectUid"
                  value={formData.projectUid}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your NMKR project UID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tokenName">Token Name *</label>
                <input
                  type="text"
                  id="tokenName"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter token name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName as string}
                  onChange={handleInputChange}
                  placeholder="Enter display name (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description as string}
                  onChange={handleInputChange}
                  placeholder="Enter NFT description (optional)"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fileUrl">Image URL *</label>
                <input
                  type="url"
                  id="fileUrl"
                  name="fileUrl"
                  value={formData.fileUrl as string}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mimetype">MIME Type</label>
                <input
                  type="text"
                  id="mimetype"
                  name="mimetype"
                  value={formData.mimetype as string}
                  onChange={handleInputChange}
                  placeholder="image/png"
                />
              </div>

              <div className="form-group">
                <label htmlFor="priceInLovelace">Price (Lovelace)</label>
                <input
                  type="number"
                  id="priceInLovelace"
                  name="priceInLovelace"
                  value={formData.priceInLovelace as number}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Creating NFT...' : 'Create NFT'}
              </button>
            </form>

            {result && (
              <div className={`result ${result.success ? 'success' : 'error'}`}>
                <h3>{result.success ? 'Success!' : 'Error'}</h3>
                {result.success && result.data ? (
                  <div className="result-data">
                    <p><strong>NFT ID:</strong> {result.data.nftId}</p>
                    <p><strong>NFT UID:</strong> {result.data.nftUid}</p>
                    <p><strong>Asset ID:</strong> {result.data.assetId}</p>
                    <p><strong>IPFS Hash:</strong> {result.data.ipfsHashMainnft}</p>
                    {result.data.metadata && (
                      <details>
                        <summary>Metadata</summary>
                        <pre>{result.data.metadata}</pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <p className="error-message">{result.error}</p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        .form-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .nft-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #fbbf24;
          font-size: 1rem;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #fbbf24;
          box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .submit-button {
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          padding: 1rem 2rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
          margin-top: 1rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
          background: linear-gradient(45deg, #f59e0b, #d97706);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .result {
          margin-top: 2rem;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid;
        }

        .result.success {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .result.error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .result h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
        }

        .result-data p {
          margin: 0.5rem 0;
          font-family: monospace;
        }

        .error-message {
          margin: 0;
          word-break: break-word;
        }

        details {
          margin-top: 1rem;
        }

        summary {
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        pre {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .form-container {
            margin: 1rem;
            padding: 1rem;
          }
        }
      `}</style>
    </>
  )
} 