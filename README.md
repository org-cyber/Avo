# 🔒 Decentralized Storage Platform

A comprehensive decentralized file storage system built on Polygon Amoy blockchain with IPFS integration using Pinata. This platform allows users to upload encrypted files that only authorized wallet addresses can access.

## 🌟 Features

- **🔐 End-to-End Encryption**: Files are encrypted before upload using AES-GCM
- **⛓️ Blockchain Storage**: Metadata stored on Polygon Amoy blockchain
- **🌐 IPFS Integration**: Files stored on IPFS via Pinata
- **👥 Authorization System**: Only authorized wallets can decrypt files
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔍 File Discovery**: Easy file retrieval by ID or from authorized files list
- **📊 Access Logging**: Blockchain-based access tracking

## 🚀 Quick Start

### Prerequisites

1. **MetaMask Extension** - Install from [metamask.io](https://metamask.io/)
2. **Polygon Amoy Network** - Add to MetaMask
3. **Pinata Account** - For IPFS storage
4. **Deployed Smart Contract** - Your DataBridge contract address

### Setup Instructions

#### 1. Install MetaMask
- Go to [metamask.io](https://metamask.io/)
- Install the browser extension
- Create or import a wallet
- Get some test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

#### 2. Add Polygon Amoy Network
- Open MetaMask
- Click on network dropdown
- Click "Add Network"
- Use these settings:
  - **Network Name**: Polygon Amoy
  - **RPC URL**: https://rpc-amoy.polygon.technology
  - **Chain ID**: 80002
  - **Currency Symbol**: MATIC
  - **Block Explorer**: https://amoy.polygonscan.com

#### 3. Deploy Your Smart Contract
Deploy the provided DataBridge contract to Polygon Amoy and update the contract address in `config.js`:

```javascript
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

#### 4. Configure Pinata
1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Get your JWT token from the API section
3. Update `config.js` with your Pinata JWT:

```javascript
export const PINATA_JWT = "YOUR_PINATA_JWT_TOKEN";
```

#### 5. Run the Application

**Using Live Server (Recommended):**
1. Open VS Code
2. Install Live Server extension
3. Open the `frontend` folder
4. Right-click on `index.html` → "Open with Live Server"

**Using Python Server:**
```bash
cd frontend
python server.py
```

## 🏗️ Architecture

### Smart Contract (DataBridge)
- **File Metadata Storage**: IPFS CIDs, uploader, authorized addresses
- **Encryption Key Management**: Per-recipient encrypted AES keys
- **Access Control**: Authorization checking and access logging
- **Event Emission**: File sharing and access events

### Frontend Application
- **Wallet Integration**: MetaMask connection and account management
- **File Encryption**: Client-side AES-GCM encryption
- **IPFS Upload**: Pinata integration for decentralized storage
- **Blockchain Interaction**: Smart contract calls for metadata storage
- **File Decryption**: Authorized file retrieval and decryption

### Security Features
- **Client-Side Encryption**: Files encrypted before upload
- **Key Distribution**: Encrypted keys for each authorized recipient
- **Access Control**: Blockchain-based authorization
- **Audit Trail**: Access logging on blockchain

## 📱 How to Use

### For File Uploaders:
1. **Connect Wallet**: Click "Connect" when MetaMask prompts
2. **Upload Files**: 
   - Select files to upload
   - Enter authorized wallet address
   - Click "Encrypt & Upload to Blockchain"
3. **Monitor Progress**: Watch the upload progress for each file

### For File Recipients:
1. **Connect Authorized Wallet**: Use the wallet address that was authorized
2. **View Authorized Files**: Files will automatically appear in "Your Authorized Files"
3. **Download Files**: Click "Decrypt & Download" to retrieve files
4. **Manual Retrieval**: Use "Retrieve File by ID" for specific files

## 🔧 Configuration

### Contract Configuration
Update `config.js` with your deployed contract details:

```javascript
export const CONTRACT_ADDRESS = "0x..."; // Your deployed contract
export const PINATA_JWT = "your-jwt-token"; // Your Pinata JWT
```

### Network Configuration
The application is configured for Polygon Amoy testnet. To use mainnet:
1. Update the RPC URL in MetaMask
2. Ensure you have MATIC tokens for gas fees
3. Update contract address if using a different deployment

## 🛠️ Development

### Project Structure
```
frontend/
├── index.html          # Main application interface
├── main.js            # Application logic and blockchain interaction
├── config.js          # Configuration and contract ABI
├── style.css          # Styling and responsive design
├── server.py          # Python development server
└── README.md          # This file
```

### Key Components

#### Smart Contract Integration
- **Contract Connection**: ethers.js integration with MetaMask
- **Function Calls**: shareFile, getRecord, isAuthorized, recordsCount
- **Event Listening**: File sharing and access events

#### File Encryption/Decryption
- **AES-GCM Encryption**: Client-side file encryption
- **Key Management**: Per-recipient encrypted keys
- **IV Generation**: Random initialization vectors

#### IPFS Integration
- **Pinata API**: File upload to IPFS
- **Metadata Storage**: JSON metadata with file information
- **Content Addressing**: IPFS CIDs for file references

## 🔐 Security Considerations

### Encryption
- Files are encrypted using AES-GCM before upload
- Each authorized recipient gets their own encrypted key
- IVs are generated randomly for each file

### Access Control
- Only authorized addresses can decrypt files
- Uploader always has access to their files
- Blockchain-based authorization checking

### Data Privacy
- Files are encrypted before leaving the user's browser
- Only encrypted data is stored on IPFS
- Keys are encrypted for each recipient

## 🐛 Troubleshooting

### Common Issues

#### MetaMask Connection
- **Error**: "MetaMask extension not found"
  - **Solution**: Install MetaMask extension and refresh

- **Error**: "Connection rejected"
  - **Solution**: Click "Connect" in MetaMask popup

#### File Upload Issues
- **Error**: "IPFS upload failed"
  - **Solution**: Check Pinata JWT token and API limits

- **Error**: "Transaction failed"
  - **Solution**: Ensure you have enough MATIC for gas fees

#### File Retrieval Issues
- **Error**: "Not authorized to decrypt"
  - **Solution**: Use the wallet address that was authorized

- **Error**: "Failed to fetch metadata"
  - **Solution**: Check IPFS gateway connectivity

### Debug Mode
Enable console logging by opening browser developer tools (F12) to see detailed error messages and transaction logs.

## 🚀 Deployment

### Production Deployment
1. Deploy smart contract to Polygon mainnet
2. Update contract address in config.js
3. Deploy frontend to a web server
4. Configure custom domain and HTTPS

### Environment Variables
For production, consider using environment variables for:
- Contract address
- Pinata JWT token
- RPC endpoints

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## PITCH DECK : https://docs.google.com/presentation/d/17kSUnwSF-1Z9ji3WOUykSCPo-H9yGDtaaCrc-UbEhI4/edit?usp=sharing
## DEPLOY LINK: avo101.netlify.app
## Demo Video Link: https://www.veed.io/view/fcc6399b-650a-453b-90b3-adcc8f1e72bb?source=editor&panel=share

**Built with ❤️ for the decentralized web**