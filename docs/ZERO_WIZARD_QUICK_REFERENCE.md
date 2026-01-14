# Zero Wizard - Quick Reference

## 🚀 Quick Start

1. Navigate to `/wizard`
2. Select contract type
3. Configure parameters
4. Enable modules
5. Export code

---

## 📋 Contract Types

| Type | Description | Use Case |
|------|-------------|----------|
| 🪙 Token | ERC20-equivalent | Fungible tokens, currencies |
| 🖼️ NFT | ERC721-equivalent | Collectibles, unique assets |
| 🔐 Vault | Escrow/Storage | Secure asset management |
| 🗳️ Governance | Voting system | DAOs, proposals |

---

## 🧩 Available Modules

### Access Control
- **Ownable** 👤 - Single owner
- **AccessControl** 🔑 - Multiple roles

### Security
- **Pausable** ⏸️ - Emergency pause
- **ReentrancyGuard** 🛡️ - Attack prevention

### Supply
- **Mintable** ➕ - Create tokens
- **Burnable** 🔥 - Destroy tokens

### Advanced
- **Permit** ✍️ - Gasless approvals
- **Upgradeable** 🔄 - Contract upgrades

---

## ⚠️ Module Conflicts

| Module | Conflicts With |
|--------|----------------|
| Ownable | AccessControl |
| Mintable | FixedSupply |
| Upgradeable | Immutable |

---

## 🔐 Security Checklist

Before deploying:

- [ ] Access control on admin functions
- [ ] Pausable for critical contracts
- [ ] ReentrancyGuard for external calls
- [ ] No unbounded loops
- [ ] Events for state changes
- [ ] Zero address checks
- [ ] Balance checks

---

## 💡 Common Patterns

### Basic Token
```python
Token + Ownable + Mintable
```

### Secure Token
```python
Token + Ownable + Mintable + Pausable
```

### NFT Collection
```python
NFT + Ownable + Mintable
```

### Secure Vault
```python
Vault + Ownable + Pausable + ReentrancyGuard
```

---

## 🎯 Best Practices

1. **Always use access control** for sensitive functions
2. **Add Pausable** to critical contracts
3. **Use ReentrancyGuard** for external calls
4. **Test thoroughly** before deployment
5. **Get audited** for production use

---

## 📚 Documentation

- [Architecture](./ZERO_WIZARD_ARCHITECTURE.md)
- [Modules Guide](./ZERO_WIZARD_MODULES.md)
- [Security Guide](./ZERO_WIZARD_SECURITY.md)
- [Full README](./ZERO_WIZARD_README.md)

---

## 🐛 Troubleshooting

### "Conflict detected"
- Remove conflicting modules
- Check compatibility matrix

### "Missing access control"
- Add Ownable or AccessControl
- Protect sensitive functions

### "Reentrancy warning"
- Add ReentrancyGuard module
- Call `self.nonreentrant()` in function

---

## 🔗 Quick Links

- **Wizard**: `/wizard`
- **Playground**: `/playground`
- **Examples**: `/templates/wizard_examples`
- **Docs**: `/docs`

---

**Need help?** Check the full documentation or join our community!
