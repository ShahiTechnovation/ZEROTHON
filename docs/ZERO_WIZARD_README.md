# 🧙‍♂️ Zero Wizard

**Build production-ready Python smart contracts with security built-in**

Zero Wizard is a Python-native smart contract composition system inspired by OpenZeppelin Contracts Wizard, but designed specifically for Python execution models with compile-time security guarantees.

---

## 🎯 What is Zero Wizard?

Zero Wizard is an **interactive contract builder** that lets you:

- ✅ **Compose contracts** by selecting standards + modules
- ✅ **Generate pure Python code** (no DSL, no pseudo-syntax)
- ✅ **Enforce security** at compile time
- ✅ **Integrate with IDE** for instant feedback

### Why Zero Wizard?

| Traditional Approach | Zero Wizard |
|---------------------|-------------|
| Write from scratch | Select & compose |
| Manual security checks | Built-in guarantees |
| Copy-paste patterns | Audited modules |
| Learn Solidity | Use Python |
| Hope for the best | Trust the compiler |

---

## 🚀 Quick Start

### 1. Access the Wizard

Navigate to `/wizard` in your Zerothon application.

### 2. Select Contract Type

Choose from:
- 🪙 **Fungible Token** (ERC20-equivalent)
- 🖼️ **NFT Collection** (ERC721-equivalent)
- 🔐 **Vault / Escrow**
- 🗳️ **Governance**

### 3. Configure Parameters

Set your contract details:
- Name and symbol
- Decimals (for tokens)
- Initial supply (optional)

### 4. Enable Modules

Add features with one click:
- 👤 **Ownable** - Single-owner access control
- 🔑 **Role-Based Access** - Multi-role permissions
- ⏸️ **Pausable** - Emergency pause
- ➕ **Mintable** - Create new tokens
- 🔥 **Burnable** - Destroy tokens
- 🛡️ **Reentrancy Guard** - Attack prevention
- 🔄 **Upgradeable** - Contract upgradeability

### 5. Preview & Export

- Review generated code
- Check security analysis
- Download or copy to playground

---

## 📚 Documentation

### Core Guides

- **[Architecture](./ZERO_WIZARD_ARCHITECTURE.md)** - System design and components
- **[Modules](./ZERO_WIZARD_MODULES.md)** - Module composition guide
- **[Security](./ZERO_WIZARD_SECURITY.md)** - Security guarantees and best practices

### Examples

See `templates/wizard_examples/` for generated contracts:
- `MyToken.py` - Full-featured token
- `MyNFT.py` - NFT with URI management
- `SecureVault.py` - Hardened vault contract

---

## 🧩 Module System

### Base Contracts

Located in `lib/pychain/std/base/`:

| Contract | Description | File |
|----------|-------------|------|
| Token | ERC20-equivalent fungible token | `Token.py` |
| NFT | ERC721-equivalent non-fungible token | `NFT.py` |

### Mixins

Located in `lib/pychain/std/mixins/`:

| Mixin | Purpose | Conflicts |
|-------|---------|-----------|
| Ownable | Single-owner access control | AccessControl |
| Mintable | Token/NFT creation | FixedSupply |
| Burnable | Token/NFT destruction | - |
| Pausable | Emergency pause | - |
| ReentrancyGuard | Attack prevention | - |

### Composition Example

```python
from pychain.std.base import Token
from pychain.std.mixins import Ownable, Mintable, Pausable

class MyToken(Mintable, Pausable, Ownable, Token):
    def __init__(self):
        Token.__init__(self, "MyToken", "MTK", 18)
        Ownable.__init_mixin__(self)
        Pausable.__init_mixin__(self)
        Mintable.__init_mixin__(self)
```

**Method Resolution Order (MRO)**:
```
MyToken → Mintable → Pausable → Ownable → Token → PySmartContract
```

---

## 🔐 Security Features

### Compile-Time Guarantees

1. **No Reentrancy by Default**
   - External calls require explicit `@nonreentrant`
   - Compiler errors if missing

2. **Explicit Access Control**
   - State-mutating functions must declare access level
   - `@public_safe` for unrestricted
   - `@protected` for access-controlled

3. **Deterministic Execution**
   - Banned: `time`, `random`, `os`, `sys`, IO
   - Allowed: `block_number()`, `msg_sender()`, `state_var()`

4. **Storage Safety**
   - Namespaced storage prevents collisions
   - Upgradeability checks prevent layout corruption

### Runtime Checks

- ✅ Integer overflow protection (Python native)
- ✅ Balance checks before transfers
- ✅ Zero address protection
- ✅ Allowance verification
- ✅ Event emission for state changes

### Static Analysis

The Wizard runs these checks before export:

| Rule | Description | Severity |
|------|-------------|----------|
| Access Control | Sensitive functions must have protection | Critical |
| Reentrancy | External calls must be guarded | Critical |
| Storage Layout | No reordering in upgradeable contracts | Critical |
| Safe Loops | Bounded iteration over storage | Warning |

---

## 🎨 User Interface

### Step 1: Select Type
![Contract Type Selection](https://via.placeholder.com/800x400?text=Contract+Type+Selection)

Choose your base contract type with visual cards.

### Step 2: Configure
![Configuration](https://via.placeholder.com/800x400?text=Configuration)

Set contract parameters with validation.

### Step 3: Modules
![Module Selection](https://via.placeholder.com/800x400?text=Module+Selection)

Enable features with conflict detection.

### Step 4: Export
![Code Preview](https://via.placeholder.com/800x400?text=Code+Preview)

Review code with security analysis.

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
        # Non-owner cannot mint
        token.mint("0x123...", 1000)

def test_pausable():
    token = MyToken()
    token.pause()
    
    with pytest.raises(Exception, match="paused"):
        token.transfer("0x123...", 100)
    
    token.unpause()
    token.transfer("0x123...", 100)  # Should work
```

---

## 📦 Export Options

### Single File Export

Downloads a single `.py` file:

```python
"""
MyToken - Generated by Zero Wizard
Contract Type: Fungible Token
Modules: Ownable, Mintable, Burnable

Security: ✓ All checks passed
Generated: 2026-01-15
"""

from pychain.std.base import Token
from pychain.std.mixins import Ownable, Mintable, Burnable

class MyToken(Mintable, Burnable, Ownable, Token):
    # ... generated code ...
```

### Full Project Scaffold (Coming Soon)

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

## 🔄 Upgradeability

Zero Wizard uses **inheritance-based upgradeability** (not proxies):

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
        super().__init__()
        # NEW variables only at the end
        self.new_limit = self.state_var("new_limit", 5000)
    
    def migrate_from_v1(self):
        """Migration hook."""
        self.new_limit = self.limit * 5
```

### Upgradeability Rules

- ✅ Append-only storage (new variables at end)
- ❌ No variable reordering
- ❌ No deletion of existing variables
- ✅ Migration hooks for data transformation

---

## 🛠️ Development

### Project Structure

```
zerothon/
├── app/
│   └── wizard/
│       └── page.tsx          # Main Wizard UI
├── lib/
│   └── pychain/
│       └── std/
│           ├── base/         # Base contracts
│           │   ├── Token.py
│           │   └── NFT.py
│           └── mixins/       # Composable modules
│               ├── Ownable.py
│               ├── Mintable.py
│               ├── Burnable.py
│               └── Pausable.py
├── templates/
│   └── wizard_examples/      # Example outputs
│       ├── MyToken.py
│       ├── MyNFT.py
│       └── SecureVault.py
└── docs/
    ├── ZERO_WIZARD_ARCHITECTURE.md
    ├── ZERO_WIZARD_MODULES.md
    └── ZERO_WIZARD_SECURITY.md
```

### Adding New Modules

1. Create mixin in `lib/pychain/std/mixins/`
2. Add to `MODULES` array in `app/wizard/page.tsx`
3. Update conflict matrix if needed
4. Add documentation

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core UI (4 steps)
- ✅ Base contracts (Token, NFT)
- ✅ 5 modules (Ownable, Mintable, Burnable, Pausable, ReentrancyGuard)
- ✅ Basic static analysis
- ✅ Single file export

### Phase 2 (Next)
- [ ] Vault and Governance base contracts
- [ ] AccessControl and Permit modules
- [ ] Full static analysis engine
- [ ] Project scaffold export
- [ ] IDE integration (hover docs, inline errors)

### Phase 3 (Future)
- [ ] Upgradeability support
- [ ] Advanced modules (Timelock, Snapshot, Vesting)
- [ ] Gas optimization hints
- [ ] Audit report generation
- [ ] Template marketplace

---

## 🤝 Contributing

We welcome contributions! Areas to help:

- 🐛 **Bug fixes** - Report or fix issues
- 📚 **Documentation** - Improve guides and examples
- 🧩 **New modules** - Add composable features
- 🔒 **Security** - Enhance analysis rules
- 🎨 **UI/UX** - Improve wizard interface

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **OpenZeppelin** - Inspiration for the wizard concept
- **Python Community** - For the amazing language
- **Zerothon Team** - For building the platform

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Examples**: See `/templates/wizard_examples`
- **Issues**: Report on GitHub
- **Community**: Join our Discord

---

**Built with ❤️ by the Zerothon Team**

*Making smart contract development safe, simple, and Pythonic*
