// server.js
import express from "express";
import dotenv from "dotenv";
import { formatEther, formatUnits } from "ethers";
import path from "path";
import { fileURLToPath } from "url";
import { Alchemy, Network } from "alchemy-sdk";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

// Enhanced cache with different TTLs for different data types
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const PRICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for price data
const cache = new Map();
const priceCache = new Map();

// Known contract addresses for better personality detection
const KNOWN_CONTRACTS = {
  // DEX Routers
  dexRouters: new Set([
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d".toLowerCase(), // Uniswap V2 Router
    "0xe592427a0aece92de3edee1f18e0157c05861564".toLowerCase(), // Uniswap V3 Router
    "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f".toLowerCase(), // SushiSwap Router
    "0x1111111254eeb25477b68fb85ed929f73a960582".toLowerCase(), // 1inch V5
    "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45".toLowerCase(), // Uniswap V3 Router 2
  ]),

  // Popular DeFi Protocols
  defiProtocols: new Set([
    "0xa0b86a33e6c4ea71f30c7c2c8c16bb2eab55b9f1".toLowerCase(), // Compound
    "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643".toLowerCase(), // cDAI
    "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b".toLowerCase(), // Compound Comptroller
    "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9".toLowerCase(), // Aave V2
    "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2".toLowerCase(), // Aave V3
    "0x6b175474e89094c44da98b954eedeac495271d0f".toLowerCase(), // DAI
    "0xa0b86a33e6c4ea71f30c7c2c8c16bb2eab55b9f1".toLowerCase(), // USDC
  ]),

  // NFT Marketplaces
  nftMarketplaces: new Set([
    "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b".toLowerCase(), // OpenSea
    "0x7f268357a8c2552623316e2562d90e642bb538e5".toLowerCase(), // OpenSea Legacy
    "0x59728544b08ab483533076417fbbb2fd0b17ce3a".toLowerCase(), // LooksRare
    "0x74312363e45dcaba76c59ec49a7aa8a65a67eed3".toLowerCase(), // X2Y2
  ]),

  // Meme Tokens (for meme lord detection)
  memeTokens: new Set([
    "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce".toLowerCase(), // SHIB
    "0x4d224452801aced8b2f0aebe155379bb5d594381".toLowerCase(), // APE
    "0x853d955acef822db058eb8505911ed77f175b99e".toLowerCase(), // FRAX
  ]),
};

// Utility function to get ETH price (for portfolio value calculations)
async function getETHPrice() {
  const cached = priceCache.get("eth_price");
  if (cached && Date.now() - cached.ts < PRICE_CACHE_TTL) {
    return cached.price;
  }

  try {
    // You could integrate with CoinGecko or other price APIs here
    // For now, returning a placeholder - you'll need to implement actual price fetching
    const price = 2500; // Placeholder ETH price
    priceCache.set("eth_price", { ts: Date.now(), price });
    return price;
  } catch (error) {
    console.error("Failed to fetch ETH price:", error);
    return 2500; // Fallback price
  }
}

// Enhanced personality detection with more sophisticated rules
function analyzePersonality(data) {
  const { ethBalance, tokens, stats, recentActivity, portfolioValue } = data;
  const eth = parseFloat(ethBalance);
  const {
    uniqueContracts,
    erc20Count,
    nftCount,
    swaps30d,
    defiInteractions,
    nftTrades,
  } = stats;

  let personality = "Mystery Wallet 👻";
  const badges = [];
  let confidence = 0;

  // Sophisticated personality detection
  if (eth < 0.001 && erc20Count === 0 && nftCount === 0 && swaps30d === 0) {
    personality = "Ghost Wallet 👻";
    badges.push("Ghost", "Inactive");
    confidence = 95;
  } else if (eth < 0.01 && portfolioValue < 50) {
    personality = "Certified Brokie 🤲";
    badges.push("Brokie", "Smol");
    confidence = 90;
  } else if (swaps30d >= 10 && uniqueContracts >= 8) {
    personality = "Degen Trader 🎰";
    badges.push("Degen", "Active", "Trader");
    confidence = 95;
  } else if (defiInteractions >= 5 && eth >= 0.1) {
    personality = "DeFi Maxi 🏦";
    badges.push("DeFi", "Yield Farmer", "Advanced");
    confidence = 90;
  } else if (nftCount >= 4 && nftTrades >= 3) {
    personality = "NFT Degen 🎨";
    badges.push("NFT", "Collector", "Trader");
    confidence = 85;
  } else if (eth >= 0.1 && eth <= 0.4 && swaps30d < 3) {
    personality = "Baby Whale 🐋";
    badges.push("Whale", "HODLer", "Diamond Hands");
    confidence = 88;
  } else if (eth >= 0.4) {
    personality = "Crypto Whale 🐋";
    badges.push("Whale", "Big Money", "VIP");
    confidence = 95;
  } else if (erc20Count > 20 && nftCount > 2) {
    personality = "Hoarder Supreme 📦";
    badges.push("Hoarder", "Collector", "Diversified");
    confidence = 82;
  } else if (tokens >= 5 && swaps30d >= 5) {
    personality = "Portfolio Optimizer 📊";
    badges.push("Balanced", "Strategic", "Active");
    confidence = 78;
  } else if (nftCount > 0 && eth < 0.001) {
    personality = "JPEG Enjoyer 📸";
    badges.push("NFT", "Art Lover", "Optimistic");
    confidence = 75;
  } else if (swaps30d === 0 && eth > 0.1) {
    personality = "Diamond Hands 💎";
    badges.push("HODLer", "Patient", "Long-term");
    confidence = 80;
  }

  return { personality, badges, confidence };
}

// Enhanced transfer analysis
function analyzeTransfers(transfers, address) {
  let defiInteractions = 0;
  let nftTrades = 0;
  let totalVolume = 0;
  let uniqueCounterparties = new Set();
  let gasSpent = 0;

  const addressLower = address.toLowerCase();

  for (const transfer of transfers) {
    const from = (transfer.from || "").toLowerCase();
    const to = (transfer.to || "").toLowerCase();
    const contractAddr = (
      transfer.rawContract?.address ||
      transfer.contractAddress ||
      ""
    ).toLowerCase();

    // Track counterparties
    if (from === addressLower && to !== addressLower) {
      uniqueCounterparties.add(to);
    } else if (to === addressLower && from !== addressLower) {
      uniqueCounterparties.add(from);
    }

    // DeFi interaction detection
    if (
      KNOWN_CONTRACTS.defiProtocols.has(contractAddr) ||
      KNOWN_CONTRACTS.dexRouters.has(to) ||
      KNOWN_CONTRACTS.dexRouters.has(from)
    ) {
      defiInteractions++;
    }

    // NFT trade detection
    if (
      (transfer.category === "erc721" || transfer.category === "erc1155") &&
      (KNOWN_CONTRACTS.nftMarketplaces.has(to) ||
        KNOWN_CONTRACTS.nftMarketplaces.has(from))
    ) {
      nftTrades++;
    }

    // Volume calculation (simplified)
    if (transfer.value && transfer.asset === "ETH") {
      totalVolume += parseFloat(transfer.value);
    }
  }

  return {
    defiInteractions,
    nftTrades,
    totalVolume,
    uniqueCounterparties: uniqueCounterparties.size,
    gasSpent, // This would need gas price calculation
  };
}

// Rate limiting middleware
const rateLimitMap = new Map();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function rateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }

  const limit = rateLimitMap.get(clientIP);

  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_WINDOW;
    return next();
  }

  if (limit.count >= RATE_LIMIT) {
    return res.status(429).json({
      error: "Rate limit exceeded. Try again later.",
      retryAfter: Math.ceil((limit.resetTime - now) / 1000),
    });
  }

  limit.count++;
  next();
}

app.use(rateLimit);

app.get("/api/analyze", async (req, res) => {
  try {
    const address = (req.query.address || "").toLowerCase().trim();

    // Enhanced address validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        error: "Invalid Ethereum address format",
        hint: "Address should be 42 characters starting with '0x'",
      });
    }

    // Cache check
    const cached = cache.get(address);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return res.json({ ...cached.data, cached: true, timestamp: cached.ts });
    }

    // Parallel data fetching for better performance
    const [balanceBN, tokenResp, transfersResp, ethPrice] = await Promise.all([
      alchemy.core.getBalance(address, "latest"),
      alchemy.core.getTokenBalances(address),
      alchemy.core
        .getAssetTransfers({
          fromBlock: "0x0",
          toAddress: address,
          fromAddress: address,
          category: ["erc20", "erc721", "erc1155", "external"],
          maxCount: "0x3e8", // 1000 transfers max
          withMetadata: true,
        })
        .catch((e) => ({ transfers: [] })), // Graceful fallback
      getETHPrice(),
    ]);

    const ethBalance = formatEther(balanceBN.toBigInt());
    const tokens = tokenResp.tokenBalances?.length || 0;
    const transfers = transfersResp.transfers || [];

    // Time windows
    const now = Math.floor(Date.now() / 1000);
    const day30 = now - 30 * 24 * 3600;
    const day90 = now - 90 * 24 * 3600;

    // Filter transfers by time windows
    const transfers90 = transfers.filter((t) => {
      if (!t.metadata?.blockTimestamp) return false;
      const ts = Math.floor(
        new Date(t.metadata.blockTimestamp).getTime() / 1000
      );
      return ts >= day90;
    });

    const transfers30 = transfers90.filter((t) => {
      const ts = Math.floor(
        new Date(t.metadata.blockTimestamp).getTime() / 1000
      );
      return ts >= day30;
    });

    // Enhanced analytics
    const transferAnalysis = analyzeTransfers(transfers90, address);
    const uniqueContracts = new Set();
    let erc20Count = 0;
    let nftCount = 0;
    let swaps30d = 0;

    // Count different transaction types
    for (const t of transfers90) {
      const contractAddr = (
        t.rawContract?.address ||
        t.contractAddress ||
        ""
      ).toLowerCase();
      if (contractAddr) uniqueContracts.add(contractAddr);

      if (t.category === "erc20") erc20Count++;
      if (t.category === "erc721" || t.category === "erc1155") nftCount++;
    }

    // Count swaps in last 30 days
    for (const t of transfers30) {
      const from = (t.from || "").toLowerCase();
      const to = (t.to || "").toLowerCase();
      const contractAddr = (
        t.rawContract?.address ||
        t.contractAddress ||
        ""
      ).toLowerCase();

      if (
        KNOWN_CONTRACTS.dexRouters.has(to) ||
        KNOWN_CONTRACTS.dexRouters.has(from) ||
        KNOWN_CONTRACTS.dexRouters.has(contractAddr)
      ) {
        swaps30d++;
      }
    }

    const stats = {
      uniqueContracts: uniqueContracts.size,
      erc20Count,
      nftCount,
      swaps30d,
      ...transferAnalysis,
    };

    // Calculate portfolio value
    const ethValue = parseFloat(ethBalance) * ethPrice;
    const portfolioValue = ethValue; // Could add token values here with price API

    const data = {
      ethBalance,
      tokens,
      stats,
      portfolioValue,
      ethPrice,
    };

    // Get personality analysis
    const personalityAnalysis = analyzePersonality(data);

    const result = {
      address,
      ...personalityAnalysis,
      ethBalance,
      portfolioValue: Math.round(portfolioValue),
      ethPrice,
      tokens,
      nfts: nftCount,
      stats,
      recentActivity: {
        transfers30d: transfers30.length,
        transfers90d: transfers90.length,
        avgDailyTx: Math.round((transfers30.length / 30) * 10) / 10,
      },
      sampleTransfers: transfers90.slice(0, 6).map((t) => ({
        hash: t.hash,
        from: t.from,
        to: t.to,
        value: t.value,
        asset: t.asset,
        category: t.category,
        blockNum: t.blockNum,
        timestamp: t.metadata?.blockTimestamp,
      })),
      analysis_timestamp: Date.now(),
    };

    // Cache the result
    cache.set(address, { ts: Date.now(), data: result });

    res.json({ ...result, cached: false });
  } catch (err) {
    console.error("❌ Error in /api/analyze:", err.message);
    res.status(500).json({
      error: "Analysis failed",
      message: err.message,
      timestamp: Date.now(),
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: Date.now(),
    cache_size: cache.size,
  });
});

// Cache management endpoint
app.get("/api/cache/clear", (req, res) => {
  cache.clear();
  priceCache.clear();
  res.json({ message: "Cache cleared", timestamp: Date.now() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(
    `✅ Enhanced Wallet Personality Checker running at http://localhost:${PORT}`
  );
  console.log(
    `🎯 Features: Rate limiting, caching, advanced personality detection`
  );
});
