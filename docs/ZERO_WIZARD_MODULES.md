# Zero Wizard - Module Composition Guide

## 🧩 Understanding Module Composition

Zero Wizard uses **Python's Method Resolution Order (MRO)** to compose contracts from base classes and mixins. This guide explains how modules work together.

---

## 📚 Module Categories

### 1. **Access Control**
- **Ownable**: Single owner with transfer capability
- **AccessControl**: Role-based permissions (admin, minter, pauser, etc.)

**Conflict**: Cannot use both simultaneously

### 2. **Security**
- **Pausable**: Emergency pause/unpause
- **ReentrancyGuard**: Prevents reentrancy attacks

**Compatible**: Can be combined

### 3. **Supply Management**
- **Mintable**: Create new tokens/NFTs
- **Burnable**: Destroy tokens/NFTs

**Compatible**: Can be combined

### 4. **Advanced**
- **Permit**: EIP-2612 gasless approvals
- **Upgradeable**: Contract upgradeability

---

## 🔗 Composition Patterns

### Pattern 1: Basic Token with Owner
```python
class MyToken(Ownable, Token):
    def __init__(self):
        Token.__init__(self, "MyToken", "MTK", 18)
        Ownable.__init_mixin__(self)
```

**MRO**: `MyToken → Ownable → Token → PySmartContract`

### Pattern 2: Full-Featured Token
```python
class MyToken(Mintable, Burnable, Pausable, Ownable, Token):
    def __init__(self):
        Token.__init__(self, "MyToken", "MTK", 18)
        Ownable.__init_mixin__(self)
        Pausable.__init_mixin__(self)
        Mintable.__init_mixin__(self)
        Burnable.__init_mixin__(self)
```

**MRO**: `MyToken → Mintable → Burnable → Pausable → Ownable → Token → PySmartContract`

### Pattern 3: NFT with Minting
```python
class MyNFT(Mintable, Ownable, NFT):
    def __init__(self):
        NFT.__init__(self, "MyNFT", "MNFT")
        Ownable.__init_mixin__(self)
        Mintable.__init_mixin__(self)
```

---

## 🛡️ Security Guarantees

### Storage Collision Prevention

Each mixin uses **namespaced storage keys**:

```python
# Ownable
self.owner = self.state_var("ownable_owner", ...)

# Pausable
self.paused = self.state_var("pausable_paused", ...)

# ReentrancyGuard
self._status = self.state_var("reentrancy_status", ...)
```

This prevents storage collisions even with multiple mixins.

### Access Control Enforcement

Mixins provide **modifier functions** that must be called explicitly:

```python
def mint(self, to: str, amount: int):
    self.only_owner()        # From Ownable
    self.when_not_paused()   # From Pausable
    self._mint(to, amount)   # From Token
```

---

## ⚠️ Conflict Resolution

### Automatic Conflict Detection

The Wizard automatically detects and resolves conflicts:

```typescript
const CONFLICTS = {
  'ownable': ['accessControl'],
  'mintable': ['fixedSupply'],
  'upgradeable': ['immutable']
}
```

When you select a module, conflicting modules are automatically deselected.

### Manual Resolution

If you need both Ownable and AccessControl patterns:

```python
# Use AccessControl with a single ADMIN_ROLE
class MyToken(AccessControl, Token):
    def __init__(self):
        Token.__init__(self, "MyToken", "MTK", 18)
        AccessControl.__init_mixin__(self)
        
        # Grant admin role to deployer
        self.grant_role("ADMIN_ROLE", self.msg_sender())
```

---

## 🔄 Upgradeability Pattern

### Inheritance-Based Upgrades

```python
# Version 1
class TokenV1(Ownable, Token):
    def __init__(self):
        Token.__init__(self, "MyToken", "MTK", 18)
        Ownable.__init_mixin__(self)
        self.limit = self.state_var("limit", 1000)

# Version 2 - Append-only storage
class TokenV2(TokenV1):
    def __init__(self):
        TokenV1.__init__(self)
        # NEW variables only at the end
        self.new_limit = self.state_var("new_limit", 5000)
    
    def migrate_from_v1(self):
        """Migration hook."""
        self.new_limit = self.limit * 5
```

### Rules for Upgradeability

1. ✅ **Append-only storage**: New variables at the end
2. ❌ **No reordering**: Don't change variable order
3. ❌ **No deletion**: Don't remove existing variables
4. ✅ **Migration hooks**: Provide upgrade functions

---

## 📊 Module Compatibility Matrix

| Module | Token | NFT | Vault | Governance |
|--------|-------|-----|-------|------------|
| Ownable | ✅ | ✅ | ✅ | ✅ |
| AccessControl | ✅ | ✅ | ✅ | ✅ |
| Pausable | ✅ | ✅ | ✅ | ✅ |
| Mintable | ✅ | ✅ | ❌ | ❌ |
| Burnable | ✅ | ✅ | ❌ | ❌ |
| Permit | ✅ | ❌ | ❌ | ❌ |
| ReentrancyGuard | ✅ | ✅ | ✅ | ✅ |
| Upgradeable | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Best Practices

### 1. Always Use Access Control

```python
# ❌ BAD: No access control
class MyToken(Mintable, Token):
    def mint(self, to: str, amount: int):
        self._mint(to, amount)  # Anyone can mint!

# ✅ GOOD: With access control
class MyToken(Mintable, Ownable, Token):
    def mint(self, to: str, amount: int):
        self.only_owner()  # Protected
        self._mint(to, amount)
```

### 2. Protect Sensitive Functions

```python
# Functions that should be protected:
- mint()
- burn_from()
- pause()
- unpause()
- transfer_ownership()
```

### 3. Use Pausable for Critical Contracts

```python
class MyVault(Pausable, Ownable, Vault):
    def withdraw(self, amount: int):
        self.when_not_paused()  # Can pause in emergency
        # Withdrawal logic
```

### 4. Add ReentrancyGuard for External Calls

```python
class MyVault(ReentrancyGuard, Vault):
    def withdraw(self, amount: int):
        self.nonreentrant()  # Prevent reentrancy
        # External call here
```

---

## 🧪 Testing Generated Contracts

### Unit Test Template

```python
import pytest
from my_token import MyToken

def test_deployment():
    token = MyToken()
    assert token.name == "MyToken"
    assert token.symbol == "MTK"
    assert token.decimals == 18

def test_minting():
    token = MyToken()
    token.mint("0x123...", 1000)
    assert token.balance_of("0x123...") == 1000

def test_access_control():
    token = MyToken()
    with pytest.raises(Exception, match="not the owner"):
        # Try to mint from non-owner
        token.mint("0x123...", 1000)
```

---

## 📦 Export Options

### 1. Single File Export
- One `.py` file with all code
- Ready to deploy immediately
- Good for simple contracts

### 2. Full Project Scaffold
```
my-token/
├── contracts/
│   └── MyToken.py
├── tests/
│   └── test_my_token.py
├── scripts/
│   └── deploy.py
├── compiler.config.json
└── README.md
```

---

## 🚀 Next Steps

1. **Generate your contract** using the Wizard
2. **Review the code** in the preview
3. **Run security analysis** to check for issues
4. **Download and test** in the playground
5. **Deploy** to your target network

---

**Need Help?** Check the [Security Guide](./ZERO_WIZARD_SECURITY.md) for detailed security information.
