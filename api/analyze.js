// api/analyze.js
import { formatEther } from "ethers";
import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

// Simple in-memory caches
const CACHE_TTL = 10 * 60 * 1000; // 10 min
const PRICE_CACHE_TTL = 5 * 60 * 1000;
const cache = new Map();
const priceCache = new Map();

// Known contract addresses
const KNOWN_CONTRACTS = {
  dexRouters: new Set(
    [
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f",
      "0x1111111254eeb25477b68fb85ed929f73a960582",
      "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
    ].map((a) => a.toLowerCase())
  ),
  defiProtocols: new Set(
    [
      "0xa0b86a33e6c4ea71f30c7c2c8c16bb2eab55b9f1",
      "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643",
      "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b",
      "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
      "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
      "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0xa0b86a33e6c4ea71f30c7c2c8c16bb2eab55b9f1",
    ].map((a) => a.toLowerCase())
  ),
  nftMarketplaces: new Set(
    [
      "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b",
      "0x7f268357a8c2552623316e2562d90e642bb538e5",
      "0x59728544b08ab483533076417fbbb2fd0b17ce3a",
      "0x74312363e45dcaba76c59ec49a7aa8a65a67eed3",
    ].map((a) => a.toLowerCase())
  ),
  memeTokens: new Set(
    [
      "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
      "0x4d224452801aced8b2f0aebe155379bb5d594381",
      "0x853d955acef822db058eb8505911ed77f175b99e",
    ].map((a) => a.toLowerCase())
  ),
};

// Placeholder ETH price fetcher
async function getETHPrice() {
  const cached = priceCache.get("eth_price");
  if (cached && Date.now() - cached.ts < PRICE_CACHE_TTL) return cached.price;
  const price = 4500; // mock
  priceCache.set("eth_price", { ts: Date.now(), price });
  return price;
}

// Transfer analysis
function analyzeTransfers(transfers, address) {
  let defiInteractions = 0;
  let nftTrades = 0;
  let totalVolume = 0;
  const uniqueCounterparties = new Set();
  const addressLower = address.toLowerCase();

  for (const transfer of transfers) {
    const from = (transfer.from || "").toLowerCase();
    const to = (transfer.to || "").toLowerCase();
    const contractAddr = (
      transfer.rawContract?.address ||
      transfer.contractAddress ||
      ""
    ).toLowerCase();

    if (from === addressLower && to !== addressLower)
      uniqueCounterparties.add(to);
    if (to === addressLower && from !== addressLower)
      uniqueCounterparties.add(from);

    if (
      KNOWN_CONTRACTS.defiProtocols.has(contractAddr) ||
      KNOWN_CONTRACTS.dexRouters.has(to) ||
      KNOWN_CONTRACTS.dexRouters.has(from)
    )
      defiInteractions++;

    if (
      (transfer.category === "erc721" || transfer.category === "erc1155") &&
      (KNOWN_CONTRACTS.nftMarketplaces.has(to) ||
        KNOWN_CONTRACTS.nftMarketplaces.has(from))
    )
      nftTrades++;

    if (transfer.value && transfer.asset === "ETH") {
      totalVolume += parseFloat(transfer.value);
    }
  }

  return {
    defiInteractions,
    nftTrades,
    totalVolume,
    uniqueCounterparties: uniqueCounterparties.size,
    gasSpent: 0,
  };
}

// Personality analyzer
function analyzePersonality(data) {
  const { ethBalance, tokens, stats, portfolioValue } = data;
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
  let confidence = 50;

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

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  const data = rateLimitMap.get(ip);
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + RATE_WINDOW;
    return true;
  }
  if (data.count >= RATE_LIMIT) return false;
  data.count++;
  return true;
}

export default async function handler(req, res) {
  try {
    const address = (req.query.address || "").toLowerCase().trim();
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!checkRateLimit(clientIP || "unknown")) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }

    // Cache
    const cached = cache.get(address);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return res.json({ ...cached.data, cached: true, timestamp: cached.ts });
    }

    // Fetch data
    const balanceP = alchemy.core.getBalance(address, "latest");
    const tokensP = alchemy.core.getTokenBalances(address);
    const incomingP = alchemy.core
      .getAssetTransfers({
        fromBlock: "0x0",
        toAddress: address,
        category: ["erc20", "erc721", "erc1155", "external"],
        maxCount: "0x3e8",
        withMetadata: true,
      })
      .catch(() => ({ transfers: [] }));
    const outgoingP = alchemy.core
      .getAssetTransfers({
        fromBlock: "0x0",
        fromAddress: address,
        category: ["erc20", "erc721", "erc1155", "external"],
        maxCount: "0x3e8",
        withMetadata: true,
      })
      .catch(() => ({ transfers: [] }));
    const ethPriceP = getETHPrice();

    const [balanceBN, tokenResp, incomingResp, outgoingResp, ethPrice] =
      await Promise.all([balanceP, tokensP, incomingP, outgoingP, ethPriceP]);

    const ethBalance = formatEther(balanceBN.toBigInt());
    const tokenBalances = (tokenResp.tokenBalances || []).filter(
      (tb) => tb.tokenBalance && tb.tokenBalance !== "0"
    );
    const tokens = tokenBalances.length;

    const transfers = [
      ...(incomingResp.transfers || []),
      ...(outgoingResp.transfers || []),
    ];

    const now = Math.floor(Date.now() / 1000);
    const day90 = now - 90 * 24 * 3600;
    const day30 = now - 30 * 24 * 3600;

    const transfers90 = transfers.filter((t) => {
      if (!t.metadata?.blockTimestamp) return false;
      const ts = Math.floor(
        new Date(t.metadata.blockTimestamp).getTime() / 1000
      );
      return ts >= day90;
    });

    const transfers30 = transfers90.filter((t) => {
      const ts = Math.floor(
        new Date(t.metadata?.blockTimestamp).getTime() / 1000
      );
      return ts >= day30;
    });

    const transferAnalysis = analyzeTransfers(transfers90, address);

    const uniqueContractsSet = new Set();
    let erc20Count = 0;
    let nftCount = 0;
    for (const t of transfers90) {
      const addr = (
        t.rawContract?.address ||
        t.contractAddress ||
        ""
      ).toLowerCase();
      if (addr) uniqueContractsSet.add(addr);
      if (t.category === "erc20") erc20Count++;
      if (t.category === "erc721" || t.category === "erc1155") nftCount++;
    }

    let swaps30d = 0;
    for (const t of transfers30) {
      const from = (t.from || "").toLowerCase();
      const to = (t.to || "").toLowerCase();
      const caddr = (
        t.rawContract?.address ||
        t.contractAddress ||
        ""
      ).toLowerCase();
      if (
        KNOWN_CONTRACTS.dexRouters.has(to) ||
        KNOWN_CONTRACTS.dexRouters.has(from) ||
        KNOWN_CONTRACTS.dexRouters.has(caddr)
      )
        swaps30d++;
    }

    const stats = {
      uniqueContracts: uniqueContractsSet.size,
      erc20Count,
      nftCount,
      swaps30d,
      ...transferAnalysis,
    };

    const ethValue = parseFloat(ethBalance) * ethPrice;
    const portfolioValue = ethValue;

    const data = { ethBalance, tokens, stats, portfolioValue, ethPrice };
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

    cache.set(address, { ts: Date.now(), data: result });

    return res.status(200).json({ ...result, cached: false });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({
      error: "Analysis failed",
      message: err.message,
    });
  }
}
