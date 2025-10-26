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
    
    // Store original filename with extension
    const originalFileName = file.name;
    formData.append("file", blob, originalFileName);
    
    // Add metadata with original filename and extension
    const metadata = JSON.stringify({
      name: originalFileName,
      keyvalues: {
        originalFileName: originalFileName,
        fileExtension: originalFileName.split('.').pop() || ''
      }
    });
    formData.append('pinataMetadata', metadata);

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
    
    // Store filename in contract (note: contract must support this parameter)
    const tx = await contract.shareFile(cid, saltIvHex, authorized, encKeys);
    await tx.wait();

    // Store filename in localStorage for this CID
    localStorage.setItem(`file_${cid}`, JSON.stringify({
      name: originalFileName,
      extension: originalFileName.split('.').pop() || ''
    }));

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
      
      // Try to get filename from localStorage
      let fileName = "";
      let fileData = localStorage.getItem(`file_${cid}`);
      if (fileData) {
        try {
          const parsedData = JSON.parse(fileData);
          fileName = parsedData.name;
        } catch (e) {
          console.warn("Could not parse file data from localStorage:", e);
        }
      }

      // Only show files the user is authorized to view
      if (authorized.map(a => a.toLowerCase()).includes(userAddress.toLowerCase())) {
        html += `
          <div class="file-item">
            <span>📄 ${fileName || cid}</span>
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

// =================== VIEW AND DOWNLOAD FILE ===================
async function handleView(cid, ivHex, encKeyBytes) {
  try {
    console.log("Starting decryption for:", cid);
    
    // Fetch encrypted data from IPFS
    const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
    }
    const encryptedData = await res.arrayBuffer();
    console.log("Fetched encrypted data, size:", encryptedData.byteLength);

    // Convert hex strings back to Uint8Array for decryption
    const iv = ethers.utils.arrayify(ivHex);
    const keyHex = ethers.utils.toUtf8String(encKeyBytes);
    const key = ethers.utils.arrayify(keyHex);
    console.log("Key and IV prepared for decryption");

    // Import the key for decryption
    const cryptoKey = await crypto.subtle.importKey(
      "raw", 
      key, 
      { name: "AES-GCM", length: 256 }, 
      false, 
      ["decrypt"]
    );
    
    // Decrypt the file
    console.log("Attempting decryption...");
    const decrypted = await crypto.subtle.decrypt(
      { 
        name: "AES-GCM", 
        iv: iv,
        tagLength: 128 
      }, 
      cryptoKey, 
      encryptedData
    );
    console.log("Decryption successful, decrypted size:", decrypted.byteLength);

    // Create a blob from the decrypted data
    const blob = new Blob([decrypted]);
    const fileURL = URL.createObjectURL(blob);
    console.log("Blob created with URL:", fileURL);

    // Update the viewer
    const viewer = document.getElementById("fileViewer");
    viewer.innerHTML = "";

    // Get file information from localStorage
    let fileName = `decrypted-${cid.substring(0, 8)}`;
    let fileExtension = "";
    const fileData = localStorage.getItem(`file_${cid}`);
    
    if (fileData) {
      try {
        const parsedData = JSON.parse(fileData);
        if (parsedData.name) {
          fileName = parsedData.name;
        }
        if (parsedData.extension) {
          fileExtension = parsedData.extension;
        }
      } catch (e) {
        console.warn("Could not parse file data from localStorage:", e);
      }
    }
    
    console.log("Download filename:", fileName, "Extension:", fileExtension);
    
    // Create download button
    const downloadBtn = document.createElement("a");
    downloadBtn.textContent = "Download File";
    downloadBtn.className = "download-btn";
    downloadBtn.href = fileURL;
    downloadBtn.download = fileName; // Use original filename with extension
    downloadBtn.style.display = "inline-block";
    downloadBtn.style.padding = "10px 20px";
    downloadBtn.style.background = "#4ade80";
    downloadBtn.style.color = "#000";
    downloadBtn.style.borderRadius = "5px";
    downloadBtn.style.textDecoration = "none";
    downloadBtn.style.fontWeight = "bold";
    downloadBtn.style.margin = "10px 0";
    downloadBtn.style.cursor = "pointer";
    
    viewer.appendChild(downloadBtn);
    console.log("Download button added to viewer");

    // Display preview based on file type
    const type = getFileType(fileName);
    if (type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = fileURL;
      img.className = "secure-preview";
      viewer.appendChild(img);
      console.log("Image preview added");
    } else if (type === "application/pdf") {
      const iframe = document.createElement("iframe");
      iframe.src = fileURL;
      iframe.className = "secure-preview";
      iframe.width = "100%";
      iframe.height = "600px";
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
      viewer.appendChild(iframe);
      console.log("PDF preview added");
    } else {
      viewer.innerHTML += `<p>Preview not supported for this file type. Use the download button above.</p>`;
      console.log("No preview available for this file type");
    }

    console.log("✅ File decrypted successfully:", cid);
    showSuccessMessage("File decrypted successfully!");
  } catch (err) {
    console.error("Decryption failed:", err);
    showErrorMessage("Failed to decrypt file. See console for details.");
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
