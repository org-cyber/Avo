import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { CONTRACT_ADDRESS, ABI, PINATA_JWT } from "./config.js";

let provider, signer, contract;
const pinataURL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

// =================== INIT ===================
async function init() {
  try {
    if (!window.ethereum) return alert("Please install MetaMask!");

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const address = await signer.getAddress();
    console.log("Connected to Polygon:", address);

    const walletDisplay = document.getElementById("walletAddress");
    if (walletDisplay) walletDisplay.textContent = address;

    console.log("✅ Contract initialized:", contract.address);

    // ✅ Load files AFTER contract setup
    await loadFiles();
  } catch (err) {
    console.error("Init failed:", err);
    showErrorMessage("Failed to initialize wallet or contract.");
  }
}

// =================== ENCRYPT FILE ===================
async function encryptFile(file) {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-GCM", false, ["encrypt", "decrypt"]);
  const fileBuffer = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, fileBuffer);

  return { encrypted, key, iv };
}

// =================== UPLOAD TO PINATA ===================
async function uploadToPinata(file, authorizedAddress) {
  try {
    const { encrypted, key, iv } = await encryptFile(file);

    const blob = new Blob([encrypted]);
    const formData = new FormData();
    formData.append("file", blob, file.name);

    const res = await fetch(pinataURL, {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });

    const data = await res.json();
    const cid = data.IpfsHash;
    console.log("✅ Pinata CID:", cid);

    // Convert key to hex for blockchain
    const keyHex = ethers.utils.hexlify(key);
    const ivHex = ethers.utils.hexlify(iv);
    const saltIvHex = ivHex;

    // Simple demo encryption for authorized user
    const authorized = [authorizedAddress];
    const encKeys = [ethers.utils.toUtf8Bytes(keyHex)];

    const tx = await contract.shareFile(cid, saltIvHex, authorized, encKeys);
    await tx.wait();

    showSuccessMessage(`File "${file.name}" uploaded securely!`);
  } catch (err) {
    console.error("Upload failed:", err);
    showErrorMessage("Upload failed. See console for details.");
  }
}

// =================== HANDLE UPLOAD ===================
async function handleUpload() {
  const fileInput = document.getElementById("fileInput");
  const authorizedAddress = document.getElementById("authorizedAddress").value.trim();

  if (!fileInput.files.length) return alert("Please select a file.");
  if (!ethers.utils.isAddress(authorizedAddress)) return alert("Enter a valid authorized wallet address.");

  const file = fileInput.files[0];
  await uploadToPinata(file, authorizedAddress);
}

// =================== LOAD FILES ===================
async function loadFiles() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "🔄 Loading authorized files...";

  try {
    if (!contract) throw new Error("Contract not initialized yet.");

    const count = await contract.recordsCount();
    const total = count.toNumber();
    const userAddress = await signer.getAddress();

    let html = "";
    for (let i = 0; i < total; i++) {
      const record = await contract.getRecord(i);
      const [cid, uploader, authorized, encKeys, saltIvHex] = record;

      // Only show files the user is authorized to view
      if (authorized.map(a => a.toLowerCase()).includes(userAddress.toLowerCase())) {
        html += `
          <div class="file-item">
            <span>📄 ${cid}</span>
            <button class="view-btn" onclick="handleView('${cid}', '${saltIvHex}', '${encKeys[0]}')">
              View Securely
            </button>
          </div>
        `;
      }
    }

    fileList.innerHTML = html || "❌ No authorized files found.";
  } catch (err) {
    console.error("Failed to load files:", err);
    fileList.innerHTML = "⚠️ Failed to load files.";
  }
}

// =================== VIEW FILE (NO DOWNLOAD) ===================
async function handleView(cid, ivHex, encKeyBytes) {
  try {
    const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    const encryptedData = await res.arrayBuffer();

   const fileUrl = `https://gateway.pinata.cloud/ipfs/${file.cid}`;
window.open(fileUrl, "_blank");


    const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, encryptedData);

    const blob = new Blob([decrypted]);
    const fileURL = URL.createObjectURL(blob);

    const viewer = document.getElementById("fileViewer");
    viewer.innerHTML = "";

    const type = getFileType(cid);
    if (type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = fileURL;
      img.className = "secure-preview";
      img.style.pointerEvents = "none"; // prevent right-click saving
      viewer.appendChild(img);
    } else if (type === "application/pdf") {
      const iframe = document.createElement("iframe");
      iframe.src = fileURL;
      iframe.className = "secure-preview";
      iframe.width = "100%";
      iframe.height = "600px";
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin"); // no downloads
      viewer.appendChild(iframe);
    } else {
      viewer.innerHTML = `<p>Preview not supported for this file.</p>`;
    }

    console.log("✅ Viewed securely:", cid);
  } catch (err) {
    console.error("View failed:", err);
    showErrorMessage("Failed to decrypt or display file.");
  }
}

// =================== HELPER: FILE TYPE ===================
function getFileType(name) {
  const ext = name.split(".").pop().toLowerCase();
  const types = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    pdf: "application/pdf",
  };
  return types[ext] || "application/octet-stream";
}

// =================== TOASTS ===================
function showToast(msg, type) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    background: ${type === "error" ? "#ff5555" : "#4ade80"};
    color: #000; padding: 12px 20px; border-radius: 10px;
    font-weight: 600; z-index: 9999;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
function showSuccessMessage(m) { showToast(m, "success"); }
function showErrorMessage(m) { showToast(m, "error"); }

// =================== EVENTS ===================
window.handleView = handleView;
document.getElementById("uploadBtn").addEventListener("click", handleUpload);
document.getElementById("refreshFilesBtn").addEventListener("click", loadFiles);
window.addEventListener("load", init);
