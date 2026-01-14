# Zero Wizard - System Architecture

## 🎯 Executive Summary

**Zero Wizard** is a Python-native smart contract composition system that generates safe, deterministic, production-ready contracts through an interactive UI. Unlike Solidity-based wizards, Zero Wizard operates on pure Python with compile-time security guarantees.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ZERO WIZARD UI                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Select  │→ │Configure │→ │  Enable  │→ │ Preview  │   │
│  │   Type   │  │Parameters│  │ Modules  │  │ & Export │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              COMPOSITION ENGINE (AST-Based)                  │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Module Resolver  │  │ Conflict Checker │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  AST Generator   │  │ Code Formatter   │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           STATIC ANALYSIS & SECURITY ENGINE                  │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Access Control   │  │ Reentrancy Check │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Storage Safety   │  │ Gas Complexity   │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  PYTHON STANDARD LIBRARY                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ pychain.std                                           │  │
│  │  ├── base/                                            │  │
│  │  │   ├── Token.py        (ERC20-equivalent)          │  │
│  │  │   ├── NFT.py          (ERC721-equivalent)         │  │
│  │  │   ├── Vault.py        (Escrow/Vault)              │  │
│  │  │   └── Governance.py   (Voting)                    │  │
│  │  ├── mixins/                                          │  │
│  │  │   ├── Ownable.py                                  │  │
│  │  │   ├── AccessControl.py                            │  │
│  │  │   ├── Pausable.py                                 │  │
│  │  │   ├── Mintable.py                                 │  │
│  │  │   ├── Burnable.py                                 │  │
│  │  │   ├── Permit.py                                   │  │
│  │  │   ├── ReentrancyGuard.py                          │  │
│  │  │   └── Upgradeable.py                              │  │
│  │  └── security/                                        │  │
│  │      ├── decorators.py   (@public_safe, @protected)  │  │
│  │      └── guards.py       (Runtime checks)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              COMPILER & RUNTIME INTEGRATION                  │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Python Compiler  │  │  IDE Integration │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Breakdown

### 1. **Wizard UI (React/Next.js)**

**Location:** `/app/wizard/page.tsx`

**Features:**
- Step-by-step contract composition
- Real-time conflict detection
- Live code preview with syntax highlighting
- Security badge indicators
- Export options (single file / full project)

**State Management:**
```typescript
interface WizardState {
  contractType: 'token' | 'nft' | 'vault' | 'governance'
  parameters: ContractParameters
  modules: Set<ModuleName>
  conflicts: Conflict[]
  securityIssues: SecurityIssue[]
  generatedCode: string
}
```

---

### 2. **Python Standard Library**

**Location:** `/lib/pychain/std/`

#### Base Contracts

**Token.py** (ERC20-equivalent)
```python
class Token(PySmartContract):
    """Base fungible token implementation."""
    
    def __init__(self, name: str, symbol: str, decimals: int = 18):
        super().__init__()
        self.name = name
        self.symbol = symbol
        self.decimals = decimals
        self.total_supply = self.state_var("total_supply", 0)
        self.balances = self.state_var("balances", {})
        self.allowances = self.state_var("allowances", {})
```

#### Mixins (Composable Modules)

**Ownable.py**
```python
class Ownable:
    """Single-owner access control."""
    
    def __init_mixin__(self):
        self.owner = self.state_var("owner", self.msg_sender())
    
    def only_owner(self):
        if self.msg_sender() != self.owner:
            raise Exception("Ownable: caller is not the owner")
```

**ReentrancyGuard.py**
```python
class ReentrancyGuard:
    """Prevents reentrancy attacks."""
    
    def __init_mixin__(self):
        self._status = self.state_var("_reentrancy_status", 1)
    
    def nonreentrant(self, func):
        def wrapper(*args, **kwargs):
            if self._status == 2:
                raise Exception("ReentrancyGuard: reentrant call")
            self._status = 2
            result = func(*args, **kwargs)
            self._status = 1
            return result
        return wrapper
```

---

### 3. **Composition Engine**

**Location:** `/lib/wizard/composer.ts`

**Responsibilities:**
1. Resolve module dependencies
2. Detect conflicts
3. Generate Python AST
4. Format output code

**Module Conflict Matrix:**
```typescript
const CONFLICTS = {
  'Ownable': ['AccessControl'], // Can't have both
  'Upgradeable': ['Immutable'],
  'Mintable': ['FixedSupply']
}
```

**Code Generation Flow:**
```typescript
1. Parse user selections
2. Build dependency graph
3. Check for conflicts
4. Generate imports
5. Compose class definition
6. Inject mixin methods
7. Generate __init__ with proper MRO
8. Format with Black/Ruff
```

---

### 4. **Static Analysis Engine**

**Location:** `/lib/wizard/analyzer.ts`

**Security Rules:**

#### Rule 1: Access Control Completeness
```
IF function mutates state AND is @public_function
THEN must have access control check OR be @public_safe
```

#### Rule 2: Reentrancy Safety
```
IF function makes external call
THEN must use @nonreentrant decorator
```

#### Rule 3: Storage Layout Stability (Upgradeability)
```
IF contract is Upgradeable
THEN no variable reordering
AND only append-only storage
```

#### Rule 4: Deterministic Execution
```
BANNED: time.time(), random, os, sys, __import__
ALLOWED: block_number(), msg_sender(), state_var()
```

#### Rule 5: Safe Loops
```
IF loop iterates over storage
THEN must have explicit bounds check
```

**Analysis Output:**
```typescript
interface AnalysisResult {
  critical: Issue[]    // Blocks export
  warnings: Issue[]    // Shows warning
  info: Issue[]        // Informational
  guarantees: string[] // What the compiler ensures
}
```

---

### 5. **Module System Design**

**Mixin Composition via MRO:**

```python
# User selects: Token + Ownable + Pausable + Mintable
# Wizard generates:

from pychain.std.base import Token
from pychain.std.mixins import Ownable, Pausable, Mintable

class MyToken(Mintable, Pausable, Ownable, Token):
    """Custom token with minting, pausing, and ownership."""
    
    def __init__(self):
        Token.__init__(self, "MyToken", "MTK", 18)
        Ownable.__init_mixin__(self)
        Pausable.__init_mixin__(self)
        Mintable.__init_mixin__(self)
        
        # User-defined initial supply
        self.mint(self.msg_sender(), 1000000 * 10**18)
```

**Storage Collision Prevention:**

Each mixin uses namespaced storage keys:
```python
# Ownable
self.owner = self.state_var("ownable_owner", ...)

# Pausable
self.paused = self.state_var("pausable_paused", ...)

# ReentrancyGuard
self._status = self.state_var("reentrancy_status", ...)
```

---

### 6. **Upgradeability Model**

**Inheritance-Based (Not Proxy):**

```python
# V1
class VaultV1(PySmartContract):
    def __init__(self):
        self.balance = self.state_var("balance", 0)
        self.limit = self.state_var("limit", 1000)

# V2 - Append-only storage
class VaultV2(VaultV1):
    def __init__(self):
        super().__init__()
        # NEW variables only at the end
        self.new_limit = self.state_var("new_limit", 5000)
        
    def migrate_from_v1(self):
        """Optional migration hook."""
        self.new_limit = self.limit * 5
```

**Wizard Enforces:**
- No variable reordering
- No deletion of existing state vars
- Auto-generates migration hooks
- Warns about storage layout changes

---

## 🔐 Security by Design

### Compile-Time Guarantees

1. **No Reentrancy by Default**
   - All external calls require explicit `@nonreentrant`
   - Compiler errors if missing

2. **Explicit Access Control**
   - State-mutating functions must declare access level
   - `@public_safe` for unrestricted
   - `@protected` for access-controlled

3. **Deterministic Execution**
   - Banned: time, random, IO, reflection
   - Compiler rejects non-deterministic code

4. **Storage Safety**
   - Namespaced storage prevents collisions
   - Upgradeability checks prevent layout corruption

### Runtime Checks

```python
# Generated by Wizard
def mint(self, to: str, amount: int):
    # Access control (compile-time enforced)
    self.only_owner()
    
    # Pausable check (if module enabled)
    self.when_not_paused()
    
    # Reentrancy guard (if module enabled)
    @self.nonreentrant
    def _mint():
        # Business logic
        ...
    
    return _mint()
```

---

## 🧠 Developer Experience

### IDE Integration

**Hover Explanations:**
```python
def mint(self, to: str, amount: int):
    """
    🛡️ Security: Protected by Ownable
    ⚡ Gas: O(1) - constant time
    🔒 Reentrancy: Safe (no external calls)
    """
```

**Inline Annotations:**
```python
self.only_owner()  # ✓ Access control: Only owner can call
```

**Compile-Time Error Mapping:**
```
Error: Function 'transfer' mutates state but lacks access control
→ Wizard Suggestion: Enable 'Ownable' module or add @public_safe
```

---

## 📦 Export Formats

### 1. Single File Export
```python
# MyToken.py
# Generated by Zero Wizard
# Contract Type: Fungible Token
# Modules: Ownable, Mintable, Burnable
# Security: ✓ All checks passed

from pychain.std.base import Token
from pychain.std.mixins import Ownable, Mintable, Burnable

class MyToken(Mintable, Burnable, Ownable, Token):
    ...
```

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

## 🔄 Future Extensibility

### Phase 2 Features
- **Multi-sig support**
- **Timelock mechanisms**
- **Snapshot voting**
- **Vesting schedules**
- **Cross-chain bridges**

### Plugin System
```python
# Custom module registration
@register_wizard_module
class CustomFeature:
    """User-defined module."""
    ...
```

### Template Marketplace
- Community-contributed templates
- Audited module library
- Version management

---

## 🎯 Success Metrics

1. **Security**: Zero critical vulnerabilities in generated contracts
2. **Usability**: Python dev can deploy without Solidity knowledge
3. **Trust**: Feels as reliable as OpenZeppelin
4. **Adoption**: 80%+ of contracts use Wizard-generated code

---

## 🚀 Implementation Phases

### Phase 1 (MVP) - 2 weeks
- ✅ Core UI (4 steps)
- ✅ Base contracts (Token, NFT)
- ✅ 3 modules (Ownable, Mintable, Burnable)
- ✅ Basic static analysis
- ✅ Single file export

### Phase 2 - 4 weeks
- ✅ All base contracts
- ✅ All modules
- ✅ Full static analysis
- ✅ Project scaffold export
- ✅ IDE integration

### Phase 3 - 6 weeks
- ✅ Upgradeability support
- ✅ Advanced modules
- ✅ Gas optimization hints
- ✅ Audit report generation

---

## 📚 References

- OpenZeppelin Contracts Wizard: https://wizard.openzeppelin.com/
- Python AST Documentation: https://docs.python.org/3/library/ast.html
- Smart Contract Security Best Practices
- Deterministic Execution Models

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-15  
**Author:** Zero Wizard Team
