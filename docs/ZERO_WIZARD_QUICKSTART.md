# Zero Wizard - Quick Start Guide

## 🚀 Getting Started

### 1. Access the Wizard

Navigate to the wizard page in your browser:
```
http://localhost:3000/wizard
```

### 2. Create Your First Contract

Follow these simple steps:

#### **Step 1: Choose Contract Type**
- Click on **Token** for a fungible token (like USDC, DAI)
- Click on **NFT** for a non-fungible token collection
- Click on **Vault** for secure asset storage
- Click on **Governance** for a voting system

#### **Step 2: Configure Parameters**
- **Name**: Enter your contract name (e.g., "MyToken")
- **Symbol**: Enter a ticker symbol (e.g., "MTK")
- **Decimals**: Set decimal places (default: 18)
- **Initial Supply**: Optional - leave blank for zero supply

#### **Step 3: Enable Modules**
Toggle the features you want:
- ✅ **Ownable** - Add single-owner access control
- ✅ **Mintable** - Allow creating new tokens
- ✅ **Burnable** - Allow destroying tokens
- ✅ **Pausable** - Add emergency pause button
- ✅ **ReentrancyGuard** - Protect against attacks

Watch for conflict warnings! Some modules can't be used together.

#### **Step 4: Export Your Contract**
- Review the generated Python code
- Check the security analysis
- Click **Copy** to copy to clipboard
- Click **Download** to save as .py file

### 3. Use Your Contract

#### Option A: Test in Playground
1. Copy the generated code
2. Navigate to `/playground`
3. Paste into the editor
4. Compile and deploy!

#### Option B: Download and Deploy
1. Download the .py file
2. Add to your project
3. Test locally
4. Deploy to blockchain

---

## 📋 Common Patterns

### Basic Token
```
Type: Token
Modules: Ownable, Mintable
```
Perfect for: Simple tokens with controlled minting

### Secure Token
```
Type: Token
Modules: Ownable, Mintable, Burnable, Pausable
```
Perfect for: Production tokens with full security

### NFT Collection
```
Type: NFT
Modules: Ownable, Mintable
```
Perfect for: Art collections, collectibles

### Secure Vault
```
Type: Vault
Modules: Ownable, Pausable, ReentrancyGuard
```
Perfect for: Escrow, staking, treasury

---

## ⚠️ Important Notes

### Module Conflicts
These modules **cannot** be used together:
- Ownable ⚔️ AccessControl
- Mintable ⚔️ FixedSupply
- Upgradeable ⚔️ Immutable

The wizard will automatically prevent conflicts!

### Security Recommendations
Always include:
- ✅ **Ownable** or **AccessControl** for admin functions
- ✅ **Pausable** for critical contracts (vaults, exchanges)
- ✅ **ReentrancyGuard** if making external calls

---

## 🎯 Example: Creating a Token

1. **Select Type**: Click "Token"
2. **Configure**:
   - Name: "MyAwesomeToken"
   - Symbol: "MAT"
   - Decimals: 18
   - Initial Supply: 1000000
3. **Enable Modules**:
   - ✅ Ownable
   - ✅ Mintable
   - ✅ Pausable
4. **Export**: Download `MyAwesomeToken.py`

Result: A secure, pausable token with 1M initial supply!

---

## 🐛 Troubleshooting

### "Conflict detected"
**Solution**: Disable one of the conflicting modules

### "Missing access control" warning
**Solution**: Enable Ownable or AccessControl module

### Code won't compile
**Solution**: Check the security analysis panel for issues

---

## 📚 Learn More

- **Full Documentation**: See `/docs/ZERO_WIZARD_README.md`
- **Security Guide**: See `/docs/ZERO_WIZARD_SECURITY.md`
- **Examples**: Check `/templates/wizard_examples/`

---

## 🎉 You're Ready!

Start building secure smart contracts in Python with Zero Wizard!

**Questions?** Check the documentation or explore the example contracts.

---

**Happy Building! 🚀**
