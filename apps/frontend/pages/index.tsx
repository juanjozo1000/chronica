import { useState } from "react";
import Head from "next/head";
import { GetPayoutWalletsResponse } from "./api/nmkr/get-payout-wallets";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [payoutWallets, setPayoutWallets] =
    useState<GetPayoutWalletsResponse | null>(null);

  const testNmkrApi = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/nmkr/test");
      const data = await response.json();
      console.log("NMKR API Test:", data);
      alert("Check console for NMKR API response");
    } catch (error) {
      console.error("Error testing NMKR API:", error);
      alert("Error testing NMKR API - check console");
    } finally {
      setLoading(false);
    }
  };

  const getPayoutWallets = async () => {
    setLoading(true);
    setPayoutWallets(null);
    try {
      const response = await fetch("/api/nmkr/get-payout-wallets");
      const data: GetPayoutWalletsResponse = await response.json();
      setPayoutWallets(data);
      console.log("Payout Wallets:", data);
    } catch (error) {
      console.error("Error fetching payout wallets:", error);
      setPayoutWallets({
        success: false,
        error: "Network error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Chronica</title>
        <meta
          name="description"
          content="Chronica project with NMKR Studio API integration"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <main className="main">
          <h1 className="title">
            Welcome to <span className="highlight">Chronica</span>
          </h1>

          <p className="description">
            Your Next.js project with NMKR Studio API integration is ready!
          </p>

          <div className="grid">
            <div className="card">
              <h2>Frontend &rarr;</h2>
              <p>
                Built with Next.js, React, and TypeScript for a modern
                development experience.
              </p>
            </div>

            <div className="card">
              <h2>Backend API &rarr;</h2>
              <p>
                API routes powered by Next.js serverless functions with NMKR
                Studio integration.
              </p>
            </div>

            <div className="card">
              <h2>NMKR Studio &rarr;</h2>
              <p>
                Ready to integrate with NMKR Studio API for NFT minting and
                management.
              </p>
            </div>

            <div className="card">
              <h2>Full Stack &rarr;</h2>
              <p>
                Single codebase handling both frontend and backend in one
                unified project.
              </p>
            </div>
          </div>

          <div className="test-section">
            <button
              className="test-button"
              onClick={testNmkrApi}
              disabled={loading}
            >
              {loading ? "Testing..." : "Test NMKR API Connection"}
            </button>

            <a href="/create-nft" className="create-nft-link">
              Create NFT →
            </a>

            <a href="/capture-media" className="capture-media-link">
              📸 Capture Media →
            </a>
          </div>

          <button
            className="payout-wallets-button"
            onClick={getPayoutWallets}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Payout Wallets"}
          </button>
        </main>
      </div>
    </>
  );
}
