// config.js
// Update this with your deployed contract address on Polygon Amoy
export const CONTRACT_ADDRESS = "0xE61BC23c04dc58948709bb8d6CCD1773F595a6B2"; // Replace with your deployed contract address

export const ABI = 

[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "accessor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ts",
				"type": "uint256"
			}
		],
		"name": "FileAccessed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "cid",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			}
		],
		"name": "FileShared",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "logAccess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "cid",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "saltIvHex",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "authorized",
				"type": "address[]"
			},
			{
				"internalType": "bytes[]",
				"name": "encKeys",
				"type": "bytes[]"
			}
		],
		"name": "shareFile",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getRecord",
		"outputs": [
			{
				"internalType": "string",
				"name": "cid",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			},
			{
				"internalType": "address[]",
				"name": "authorized",
				"type": "address[]"
			},
			{
				"internalType": "bytes[]",
				"name": "encKeys",
				"type": "bytes[]"
			},
			{
				"internalType": "string",
				"name": "saltIvHex",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "isAuthorized",
		"outputs": [
			{
				"internalType": "bool",
				"name": "ok",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "recordsCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// API Keys - Replace with your actual keys
export const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyODEyZWM3My01ZTlkLTQ2NjktOTczZC1mNTVhYTkzZjllNGMiLCJlbWFpbCI6ImNoaW53b2tlbm5lZHk5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI3YzIwMTc2OGFlMjM2NTBkYjE4NiIsInNjb3BlZEtleVNlY3JldCI6IjViNzE2ODc4Y2U3MWUyNzZjYTRiMDMyZDBjNjU0M2JiNTFiYjc3YTlhM2I3YTAyYWNkYmYwYjBjMTZiM2Y4NTQiLCJleHAiOjE3OTI4NTQzODR9.UVmAjN3u3PO12o80tK4hZRNwoAG887l347qDih6hJA8";
export const NFT_STORAGE_API_KEY = "000476ab.c20c267846224bf79f931244a26df5b7"; // Replace with your actual API key






/*
async function testIPFS() {
  const blob = new Blob(["Hello NFT.Storage!"], { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", blob);

  try {
    const res = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: { Authorization: "Bearer 000476ab.c20c267846224bf79f931244a26df5b7" },
      body: formData,
    });
    const data = await res.json();
    console.log("NFT.Storage Test Response:", data);
    if (data.ok) alert("✅ Upload success! CID: " + data.value.cid);
    else alert("❌ Upload failed. Check console.");
  } catch (err) {
    console.error("Upload error:", err);
    alert("❌ Upload error. See console.");
  }
}

testIPFS();
*/