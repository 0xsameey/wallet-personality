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
let currentPersonalityData = null;

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

    // Store personality data for sharing
    currentPersonalityData = data;
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
        <!-- Badges -->
        <div class="mb-4">
          <h6 class="fw-semibold mb-3">🏆 Earned Badges</h6>
          <div class="d-flex flex-wrap justify-content-center gap-1">
            ${badgeHtml}
          </div>
        </div>

        <!-- Share Section -->
        <div class="share-section">
          <div class="text-center">
            <p class="mb-3 text-muted">
              <i class="fas fa-share-alt me-2"></i>Share your wallet personality!
            </p>
            <div class="d-flex gap-2 justify-content-center flex-wrap">
              <button class="btn btn-twitter-share" onclick="openShareModal()">
                <i class="fab fa-twitter"></i>
                Create Share Card
              </button>
            </div>
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

// Share Modal Functions
function openShareModal() {
  if (!currentPersonalityData) return;

  const modal = createShareModal();
  document.body.appendChild(modal);

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

function createShareModal() {
  const { personality, badges, confidence } = currentPersonalityData;
  const memeData =
    personalityMemes[personality] || personalityMemes["Mystery Wallet 👻"];

  const modal = document.createElement("div");
  modal.className = "share-modal";
  modal.onclick = (e) => {
    if (e.target === modal) closeShareModal();
  };

  const badgeElements = badges
    .slice(0, 3)
    .map((badge) => `<span class="share-card-badge">${badge}</span>`)
    .join("");

  modal.innerHTML = `
    <div class="share-card-container">
      <button class="share-modal-close" onclick="closeShareModal()">
        <i class="fas fa-times"></i>
      </button>
      
      <div class="share-card" id="shareCard">
        <div class="share-card-content">
          <div class="share-card-header">
            <h3 class="share-card-title">Wallet Personality</h3>
            <div class="share-card-confidence">${confidence || 75}% match</div>
          </div>
          
          <div class="share-card-personality">
            <div class="share-card-emoji">${memeData.emoji}</div>
            <h2 class="share-card-personality-text">${personality}</h2>
          </div>
          
          <div class="share-card-footer">
            <div class="share-card-badges">
              ${badgeElements}
            </div>
            <div class="share-card-watermark">
              WalletPersonality.app
            </div>
          </div>
        </div>
      </div>
      
      <div class="share-modal-actions">
        <button class="btn btn-download-share" onclick="downloadShareCard()">
          <i class="fas fa-download"></i>
          Download Image
        </button>
        <button class="btn btn-twitter-share" onclick="shareToTwitter()">
          <i class="fab fa-twitter"></i>
          Share to Twitter
        </button>
      </div>
    </div>
  `;

  return modal;
}

function closeShareModal() {
  const modal = document.querySelector(".share-modal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function downloadShareCard() {
  const shareCard = document.getElementById("shareCard");
  if (!shareCard) return;

  // Show loading state
  const downloadBtn = document.querySelector(".btn-download-share");
  const originalHtml = downloadBtn.innerHTML;
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  downloadBtn.disabled = true;

  // Mobile-optimized html2canvas options
  const isMobile = window.innerWidth <= 768;
  const canvasOptions = {
    backgroundColor: "#667eea",
    scale: isMobile ? 3 : 2, // Higher scale for mobile
    width: 500,
    height: 300,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: true,
    imageTimeout: 15000,
    removeContainer: true,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 500,
    windowHeight: 300,
  };

  // Use html2canvas to convert the card to image
  html2canvas(shareCard, canvasOptions)
    .then((canvas) => {
      // Mobile-specific handling
      if (isMobile) {
        // Create blob for mobile
        canvas.toBlob(
          (blob) => {
            if (
              navigator.share &&
              navigator.canShare &&
              navigator.canShare({
                files: [
                  new File([blob], "wallet-personality.png", {
                    type: "image/png",
                  }),
                ],
              })
            ) {
              // Use native sharing if available
              const file = new File(
                [blob],
                `wallet-personality-${Date.now()}.png`,
                { type: "image/png" }
              );
              navigator
                .share({
                  title: "My Wallet Personality",
                  text: `Check out my wallet personality: ${
                    currentPersonalityData?.personality || "Mystery Wallet"
                  }`,
                  files: [file],
                })
                .catch((error) => {
                  console.log("Native share failed:", error);
                  // Fallback to download
                  downloadImageBlob(blob);
                });
            } else {
              // Fallback to download
              downloadImageBlob(blob);
            }
          },
          "image/png",
          1.0
        );
      } else {
        // Desktop handling
        const link = document.createElement("a");
        link.download = `wallet-personality-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
      }
    })
    .catch((error) => {
      console.error("Error generating image:", error);
      // Fallback: open in new tab
      fallbackShareCard();
    })
    .finally(() => {
      // Reset button
      downloadBtn.innerHTML = originalHtml;
      downloadBtn.disabled = false;
    });
}

function downloadImageBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wallet-personality-${Date.now()}.png`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function fallbackShareCard() {
  if (!currentPersonalityData) return;

  const { personality, badges, confidence } = currentPersonalityData;
  const memeData =
    personalityMemes[personality] || personalityMemes["Mystery Wallet 👻"];

  const newWindow = window.open("", "_blank", "width=500,height=300");
  newWindow.document.write(`
    <html>
      <head>
        <title>Wallet Personality Card</title>
        <style>
          body { margin: 0; font-family: 'Inter', sans-serif; }
          .share-card {
            width: 500px;
            height: 300px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
          }
          .share-card-emoji { font-size: 3.5rem; text-align: center; }
          .share-card-personality-text { font-size: 1.5rem; font-weight: bold; text-align: center; margin: 0; }
          .share-card-header { display: flex; justify-content: space-between; align-items: center; }
          .share-card-confidence { background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 15px; }
          .share-card-badges { display: flex; gap: 0.3rem; }
          .share-card-badge { background: rgba(255,255,255,0.25); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem; }
          .share-card-watermark { font-size: 0.8rem; opacity: 0.8; }
          .share-card-footer { display: flex; justify-content: space-between; align-items: center; }
        </style>
      </head>
      <body>
        <div class="share-card">
          <div class="share-card-header">
            <h3>Wallet Personality</h3>
            <div class="share-card-confidence">${confidence || 75}% match</div>
          </div>
          <div>
            <div class="share-card-emoji">${memeData.emoji}</div>
            <h2 class="share-card-personality-text">${personality}</h2>
          </div>
          <div class="share-card-footer">
            <div class="share-card-badges">
              ${badges
                .slice(0, 3)
                .map(
                  (badge) => `<span class="share-card-badge">${badge}</span>`
                )
                .join("")}
            </div>
            <div class="share-card-watermark">WalletPersonality.app</div>
          </div>
        </div>
        <script>
          // Auto-trigger print dialog
          setTimeout(() => window.print(), 100);
        </script>
      </body>
    </html>
  `);
}

function shareToTwitter() {
  if (!currentPersonalityData) return;

  const shareCard = document.getElementById("shareCard");
  if (!shareCard) return;

  // Show loading state
  const twitterBtn = document.querySelector(".btn-twitter-share");
  const originalHtml = twitterBtn.innerHTML;
  twitterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  twitterBtn.disabled = true;

  // Check if mobile
  const isMobile = window.innerWidth <= 768;

  // Mobile-optimized canvas options
  const canvasOptions = {
    backgroundColor: "#667eea",
    scale: isMobile ? 3 : 2,
    width: 500,
    height: 300,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: true,
    imageTimeout: 15000,
    removeContainer: true,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 500,
    windowHeight: 300,
  };

  // Generate image and share
  html2canvas(shareCard, canvasOptions)
    .then((canvas) => {
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          const { personality, badges } = currentPersonalityData;
          const memeData =
            personalityMemes[personality] ||
            personalityMemes["Mystery Wallet 👻"];

          const badgeText =
            badges.length > 0
              ? `\n🏆 Badges: ${badges.slice(0, 3).join(", ")}`
              : "";

          if (isMobile) {
            // Mobile: Try native sharing first
            if (navigator.share) {
              const file = new File(
                [blob],
                `wallet-personality-${Date.now()}.png`,
                { type: "image/png" }
              );
              const shareData = {
                title: "My Wallet Personality",
                text: `I just discovered my wallet personality! ${memeData.emoji}\n\n🎯 Result: ${personality}${badgeText}\n\nWhat's your wallet's personality? Check yours at WalletPersonality.app\n\n#WalletPersonality #Crypto #Ethereum #DeFi`,
                files: [file],
              };

              if (navigator.canShare && navigator.canShare(shareData)) {
                navigator.share(shareData).catch((error) => {
                  console.log("Native share failed:", error);
                  // Fallback to download + Twitter
                  downloadAndShareMobile(blob, personality, badges, memeData);
                });
              } else {
                // Fallback to download + Twitter
                downloadAndShareMobile(blob, personality, badges, memeData);
              }
            } else {
              // Fallback to download + Twitter
              downloadAndShareMobile(blob, personality, badges, memeData);
            }
          } else {
            // Desktop: Download + Twitter
            downloadImageBlob(blob);

            const tweetText = `I just discovered my wallet personality! ${memeData.emoji}\n\n🎯 Result: ${personality}${badgeText}\n\nWhat's your wallet's personality? Check yours at WalletPersonality.app\n\n#WalletPersonality #Crypto #Ethereum #DeFi\n\n📸 Image downloaded - attach it to your tweet!`;

            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tweetText
            )}`;
            window.open(twitterUrl, "_blank", "width=550,height=420");

            showShareSuccess();
          }
        },
        "image/png",
        1.0
      );
    })
    .catch((error) => {
      console.error("Error generating image:", error);
      // Fallback to text-only share
      shareTwitterTextOnly();
    })
    .finally(() => {
      // Reset button
      twitterBtn.innerHTML = originalHtml;
      twitterBtn.disabled = false;
    });
}

function downloadAndShareMobile(blob, personality, badges, memeData) {
  // Download the image
  downloadImageBlob(blob);

  // Prepare Twitter text
  const badgeText =
    badges.length > 0 ? `\n🏆 Badges: ${badges.slice(0, 3).join(", ")}` : "";
  const tweetText = `I just discovered my wallet personality! ${memeData.emoji}\n\n🎯 Result: ${personality}${badgeText}\n\nWhat's your wallet's personality? Check yours at WalletPersonality.app\n\n#WalletPersonality #Crypto #Ethereum #DeFi\n\n📸 Image downloaded - attach it to your tweet!`;

  // For mobile, we'll use a more direct approach
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  // Try different approaches for mobile
  if (isMobileApp()) {
    // If in mobile app, use location.href
    setTimeout(() => {
      location.href = twitterUrl;
    }, 500);
  } else {
    // If in mobile browser, use window.open with mobile-specific settings
    const popup = window.open(twitterUrl, "_blank");
    if (!popup) {
      // If popup blocked, show instructions
      showMobileShareInstructions(tweetText);
    }
  }

  showShareSuccess();
}

function isMobileApp() {
  // Detect if running in mobile app webview
  return (
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) &&
    (typeof window.orientation !== "undefined" ||
      navigator.userAgent.includes("Mobile"))
  );
}

function showMobileShareInstructions(tweetText) {
  const instructionsDiv = document.createElement("div");
  instructionsDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    z-index: 10001;
    max-width: 90vw;
    text-align: center;
    font-family: Inter, sans-serif;
  `;

  instructionsDiv.innerHTML = `
    <h4 style="color: #333; margin-bottom: 1rem;">Share to Twitter</h4>
    <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.5;">
      Your image has been downloaded! Copy the text below and paste it into a new Twitter post, then attach the downloaded image.
    </p>
    <textarea readonly style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e9ecef; border-radius: 10px; font-size: 14px; resize: none;">${tweetText}</textarea>
    <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
      <button onclick="copyToClipboard('${tweetText.replace(
        /'/g,
        "\\'"
      )}'); this.parentElement.parentElement.remove();" style="background: #1da1f2; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600;">
        Copy Text
      </button>
      <button onclick="this.parentElement.parentElement.remove()" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600;">
        Close
      </button>
    </div>
  `;

  document.body.appendChild(instructionsDiv);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopySuccess();
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showCopySuccess();
  }
}

function showCopySuccess() {
  const successMsg = document.createElement("div");
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    z-index: 10002;
    font-family: Inter, sans-serif;
    font-weight: 500;
  `;
  successMsg.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    Text copied to clipboard!
  `;

  document.body.appendChild(successMsg);

  setTimeout(() => {
    if (successMsg.parentNode) {
      successMsg.parentNode.removeChild(successMsg);
    }
  }, 2000);
}

function shareTwitterTextOnly() {
  const { personality, badges } = currentPersonalityData;
  const memeData =
    personalityMemes[personality] || personalityMemes["Mystery Wallet 👻"];

  const badgeText =
    badges.length > 0 ? `\n🏆 Badges: ${badges.slice(0, 3).join(", ")}` : "";
  const tweetText = `I just discovered my wallet personality! ${memeData.emoji}\n\n🎯 Result: ${personality}${badgeText}\n\nWhat's your wallet's personality? Check yours at WalletPersonality.app\n\n#WalletPersonality #Crypto #Ethereum #DeFi`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;
  window.open(twitterUrl, "_blank", "width=550,height=420");
}

function showShareSuccess() {
  // Create a temporary success message
  const successMsg = document.createElement("div");
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    z-index: 10000;
    font-family: Inter, sans-serif;
    font-weight: 500;
    animation: slideInRight 0.3s ease;
  `;
  successMsg.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    Image downloaded! Now attach it to your Twitter post.
  `;

  document.body.appendChild(successMsg);

  // Remove after 4 seconds
  setTimeout(() => {
    successMsg.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      if (successMsg.parentNode) {
        successMsg.parentNode.removeChild(successMsg);
      }
    }, 300);
  }, 4000);
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

  // Load html2canvas library for image generation
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  document.head.appendChild(script);
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
  currentPersonalityData = null;

  // Focus back on the input
  input.focus();

  // Remove animation after it completes
  setTimeout(() => {
    reloadBtn.classList.remove("reload-animation");
  }, 600);
}

// Close modal on escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeShareModal();
  }
});
