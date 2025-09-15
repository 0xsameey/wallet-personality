// Personality memes/images mapping
const personalityMemes = {
  "Ghost Wallet 👻": {
    emoji: "👻",
    meme: "This wallet is more inactive than my dating life",
    description: "Hasn't moved a single wei in months",
  },
  "Certified Brokie 🤲": {
    emoji: "🤲",
    meme: "Checking for dust like it's buried treasure",
    description: "Every gwei counts in this economy",
  },
  "Degen Trader 🎰": {
    emoji: "🎰",
    meme: "Probably has 47 browser tabs of DEXs open right now",
    description: "Swapping tokens faster than changing clothes",
  },
  "DeFi Maxi 🏦": {
    emoji: "🏦",
    meme: "This person yields farms in their sleep",
    description: "Has liquidity in pools you've never heard of",
  },
  "NFT Degen 🎨": {
    emoji: "🎨",
    meme: "Owns more JPEGs than the internet",
    description: "Art collector or bag holder? You decide",
  },
  "Baby Whale 🐋": {
    emoji: "🐋",
    meme: "Small whale energy, big wallet problems",
    description: "HODLing like their life depends on it",
  },
  "Crypto Whale 🐋": {
    emoji: "🐳",
    meme: "This wallet probably affects market prices when it sneezes",
    description: "Living in a different financial dimension",
  },
  "Hoarder Supreme 📦": {
    emoji: "📦",
    meme: "Collecting tokens like Pokémon cards",
    description: "Gotta catch 'em all (tokens and NFTs)",
  },
  "JPEG Enjoyer 📸": {
    emoji: "📸",
    meme: "Right-click save this",
    description: "NFTs are art, and art is life",
  },
  "Diamond Hands 💎": {
    emoji: "💎",
    meme: "HODLing since before it was cool",
    description: "Patience level: Buddhist monk",
  },
  "Mystery Wallet 👻": {
    emoji: "❓",
    meme: "Even the blockchain doesn't know what's going on here",
    description: "Enigma wrapped in a mystery",
  },
  "Serial Degen 🎰": {
    emoji: "🎰",
    meme: "If there's a new token, they've probably traded it",
    description: "Degenerate trading is a lifestyle",
  },
  "ETH Maxi 💎": {
    emoji: "💎",
    meme: "Bitcoin? Never heard of her",
    description: "Ethereum is the only blockchain that matters",
  },
  "NFT Hoarder 🎨": {
    emoji: "🎨",
    meme: "Their OpenSea profile crashed the server",
    description: "Collecting digital art like it's going extinct",
  },
  "Token Collector 🧮": {
    emoji: "🧮",
    meme: "Has more tokens than a casino",
    description: "Diversification taken to the extreme",
  },
  "Sleeping Giant 😴": {
    emoji: "😴",
    meme: "Waiting for the perfect market timing since 2018",
    description: "The ultimate HODLer strategy",
  },
};

let currentAddress = "";

function maskAddress(address) {
  if (!address || address.length < 10) return address;
  return address.slice(0, 6) + "•••" + address.slice(-4);
}

function showPrivacyMode(address) {
  const input = document.getElementById("addr");
  const notice = document.getElementById("privacyNotice");

  input.value = maskAddress(address);
  input.classList.add("private-mode");
  notice.style.display = "block";
  currentAddress = address;
}

async function analyze() {
  const input = document.getElementById("addr");
  const addr = currentAddress || input.value.trim();
  const resultDiv = document.getElementById("result");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");

  if (!addr || addr.includes("•••")) {
    if (!currentAddress) {
      alert("Please enter a valid Ethereum address");
      return;
    }
  }

  // Show loading state
  analyzeBtn.disabled = true;
  btnText.textContent = "Analyzing...";
  btnSpinner.style.display = "inline-block";

  resultDiv.style.display = "none";

  // Enable privacy mode if full address was entered
  if (addr.length === 42 && addr.startsWith("0x") && !addr.includes("•••")) {
    showPrivacyMode(addr);
  }

  try {
    const res = await fetch(
      `/api/analyze?address=${encodeURIComponent(currentAddress || addr)}`
    );
    const data = await res.json();

    if (data.error) {
      showError(data.error, data.hint);
      return;
    }

    displayResults(data);
  } catch (err) {
    console.error("Analysis error:", err);
    showError("Failed to analyze wallet. Please try again.");
  } finally {
    // Reset button state
    analyzeBtn.disabled = false;
    btnText.textContent = "Analyze Personality";
    btnSpinner.style.display = "none";
  }
}

function showError(error, hint = "") {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <h6 class="alert-heading mb-2">❌ Analysis Failed</h6>
      <p class="mb-1">${error}</p>
      ${hint ? `<small class="text-muted">${hint}</small>` : ""}
    </div>
  `;
  resultDiv.style.display = "block";
}

function displayResults(data) {
  const {
    personality,
    badges,
    confidence,
    portfolioValue,
    recentActivity,
    stats,
  } = data;
  const resultDiv = document.getElementById("result");

  const memeData =
    personalityMemes[personality] || personalityMemes["Mystery Wallet 👻"];

  const badgeHtml = badges.length
    ? badges
        .map((badge) => `<span class="badge-modern">${badge}</span>`)
        .join("")
    : '<span class="text-muted">No badges earned</span>';

  resultDiv.innerHTML = `
    <div class="personality-card">
      <!-- Personality Header -->
      <div class="personality-header">
        <div class="confidence-badge">${confidence || 75}% match</div>
        <div class="personality-emoji">${memeData.emoji}</div>
        <h2 class="fw-bold mb-2">${personality}</h2>
        <p class="mb-0 opacity-90">${memeData.description}</p>
      </div>

      <!-- Card Body -->
      <div class="card-body p-4">
        <!-- Meme Section -->

        <!-- Badges -->
        <div class="mb-4">
          <h6 class="fw-semibold mb-3">🏆 Earned Badges</h6>
          <div class="d-flex flex-wrap justify-content-center gap-1">
            ${badgeHtml}
          </div>
        </div>

 
        

        <!-- Disclaimer -->
        <div class="alert alert-light mt-4 mb-0">
          <small class="text-muted">
            <strong>Disclaimer:</strong> This analysis is for entertainment purposes only. 
            Results based on publicly available blockchain data and should not be considered financial advice.
          </small>
        </div>
      </div>
    </div>
  `;

  resultDiv.style.display = "block";
}

function randomExample() {
  const examples = [
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Known whale
    "0x28C6c06298d514Db089934071355E5743bf21d60", // Binance hot wallet
    "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503", // Random example
  ];

  const input = document.getElementById("addr");
  const randomAddr = examples[Math.floor(Math.random() * examples.length)];
  input.value = randomAddr;
  input.classList.remove("private-mode");
  document.getElementById("privacyNotice").style.display = "none";
  currentAddress = "";
}

// Enter key support
document.addEventListener("DOMContentLoaded", function () {
  const addrInput = document.getElementById("addr");

  if (addrInput) {
    addrInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        analyze();
      }
    });

    // Input formatting
    addrInput.addEventListener("input", function (e) {
      let value = e.target.value;
      if (
        value &&
        !value.startsWith("0x") &&
        value.length > 0 &&
        !value.includes("•••")
      ) {
        e.target.value = "0x" + value;
      }
    });
  }
});

function reloadAddress() {
  const input = document.getElementById("addr");
  const reloadBtn = document.querySelector(".reload-btn i");
  const notice = document.getElementById("privacyNotice");

  // Add spinning animation
  reloadBtn.classList.add("reload-animation");

  // Clear everything and reset to normal state
  input.value = "";
  input.classList.remove("private-mode");
  notice.style.display = "none";
  currentAddress = "";

  // Focus back on the input
  input.focus();

  // Remove animation after it completes
  setTimeout(() => {
    reloadBtn.classList.remove("reload-animation");
  }, 600);
}
