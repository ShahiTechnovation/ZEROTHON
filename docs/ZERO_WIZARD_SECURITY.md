# Zero Wizard - Security Guide

## 🔐 Security Philosophy

Zero Wizard generates contracts with **security by default**. This guide explains the security guarantees and best practices.

---

## ✅ Compile-Time Guarantees

### 1. No Reentrancy by Default

**Rule**: All external calls require explicit protection.

```python
# ❌ REJECTED by compiler
def withdraw(self, amount: int):
    external_call()  # Error: Unprotected external call

# ✅ ACCEPTED
def withdraw(self, amount: int):
    self.nonreentrant()  # Explicit protection
    external_call()
```

### 2. Explicit Access Control

**Rule**: State-mutating functions must declare access level.

```python
# ❌ REJECTED
def mint(self, to: str, amount: int):
    self._mint(to, amount)  # Error: No access control

# ✅ ACCEPTED
def mint(self, to: str, amount: int):
    self.only_owner()  # Explicit check
    self._mint(to, amount)
```

### 3. Deterministic Execution

**Rule**: No non-deterministic operations allowed.

```python
# ❌ BANNED
import time
import random
import os

def get_random():
    return random.randint(1, 100)  # Error: Non-deterministic

# ✅ ALLOWED
def get_block_number(self):
    return self.block_number()  # Deterministic
```

**Banned Operations**:
- `time.time()`, `datetime.now()`
- `random.*`
- `os.*`, `sys.*`
- `__import__`, `eval`, `exec`
- File I/O operations
- Network requests

### 4. Storage Safety

**Rule**: Namespaced storage prevents collisions.

```python
# Each mixin uses unique prefixes
class Ownable:
    def __init_mixin__(self):
        self.owner = self.state_var("ownable_owner", ...)

class Pausable:
    def __init_mixin__(self):
        self.paused = self.state_var("pausable_paused", ...)
```

---

## 🛡️ Runtime Checks

### Integer Overflow Protection

Python's native integers have **arbitrary precision** - no overflow possible.

```python
# Safe by default
balance = 2**256 - 1
balance += 1  # No overflow, just gets bigger
```

### Balance Checks

```python
def transfer(self, to: str, amount: int):
    sender_balance = self.balances.get(sender, 0)
    
    # ✓ Check before deduction
    if sender_balance < amount:
        raise Exception("Insufficient balance")
    
    self.balances[sender] = sender_balance - amount
    self.balances[to] = self.balances.get(to, 0) + amount
```

### Zero Address Protection

```python
def transfer(self, to: str, amount: int):
    # ✓ Prevent transfer to zero address
    if to == "0x0000000000000000000000000000000000000000":
        raise Exception("Transfer to zero address")
```

---

## 🔍 Static Analysis Rules

The Wizard runs these checks before allowing export:

### Rule 1: Access Control Completeness

```
IF function mutates state AND is public
THEN must have access control check OR be @public_safe
```

**Example**:
```python
# ❌ WARNING
def mint(self, to: str, amount: int):
    self._mint(to, amount)  # No access control!

# ✅ PASS
def mint(self, to: str, amount: int):
    self.only_owner()  # Access control present
    self._mint(to, amount)
```

### Rule 2: Reentrancy Safety

```
IF function makes external call
THEN must use @nonreentrant decorator
```

**Example**:
```python
# ❌ WARNING
def withdraw(self, amount: int):
    external_contract.call()  # Unsafe!

# ✅ PASS
def withdraw(self, amount: int):
    self.nonreentrant()  # Protected
    external_contract.call()
```

### Rule 3: Storage Layout Stability (Upgradeability)

```
IF contract is Upgradeable
THEN no variable reordering AND only append-only storage
```

**Example**:
```python
# ❌ REJECTED
class TokenV2(TokenV1):
    def __init__(self):
        self.new_var = ...  # Added before super().__init__()
        super().__init__()  # Wrong order!

# ✅ ACCEPTED
class TokenV2(TokenV1):
    def __init__(self):
        super().__init__()
        self.new_var = ...  # Appended at end
```

### Rule 4: Safe Loops

```
IF loop iterates over storage
THEN must have explicit bounds check
```

**Example**:
```python
# ❌ WARNING
def process_all(self):
    for user in self.users:  # Unbounded loop!
        process(user)

# ✅ PASS
def process_batch(self, start: int, end: int):
    if end - start > 100:  # Bounded
        raise Exception("Batch too large")
    
    for i in range(start, end):
        process(self.users[i])
```

---

## 🎯 Security Levels

### Level 1: Basic (Default)
- ✅ Integer overflow protection
- ✅ Balance checks
- ✅ Zero address protection
- ✅ Event emission

### Level 2: Enhanced (+ Access Control)
- ✅ All Level 1 checks
- ✅ Ownable or AccessControl
- ✅ Protected admin functions

### Level 3: Hardened (+ Pausable + ReentrancyGuard)
- ✅ All Level 2 checks
- ✅ Emergency pause capability
- ✅ Reentrancy protection
- ✅ External call safety

### Level 4: Auditable (+ Upgradeable)
- ✅ All Level 3 checks
- ✅ Storage layout stability
- ✅ Migration hooks
- ✅ Version tracking

---

## ⚠️ Common Vulnerabilities Prevented

### 1. Reentrancy Attack

**Prevented by**: ReentrancyGuard mixin

```python
class MyVault(ReentrancyGuard, Vault):
    def withdraw(self, amount: int):
        self.nonreentrant()  # Blocks reentrancy
        # Safe to make external calls
```

### 2. Access Control Bypass

**Prevented by**: Ownable/AccessControl mixins

```python
class MyToken(Ownable, Token):
    def mint(self, to: str, amount: int):
        self.only_owner()  # Only owner can mint
        self._mint(to, amount)
```

### 3. Integer Overflow/Underflow

**Prevented by**: Python's arbitrary precision integers

```python
# No SafeMath needed - Python handles it
balance = balance + amount  # Safe
balance = balance - amount  # Safe (will error if negative)
```

### 4. Unchecked External Calls

**Prevented by**: Compiler warnings + ReentrancyGuard

```python
# Compiler warns about unprotected calls
def unsafe_call(self):
    external.call()  # ⚠️ Warning: Add reentrancy protection
```

### 5. Storage Collision

**Prevented by**: Namespaced storage keys

```python
# Each mixin has unique namespace
"ownable_owner"
"pausable_paused"
"reentrancy_status"
```

---

## 📋 Security Checklist

Before deploying, verify:

- [ ] Access control on all admin functions
- [ ] Pausable for critical contracts (vaults, exchanges)
- [ ] ReentrancyGuard for contracts with external calls
- [ ] No unbounded loops over storage
- [ ] Events emitted for all state changes
- [ ] Zero address checks on transfers
- [ ] Balance checks before deductions
- [ ] Allowance checks for delegated transfers

---

## 🧪 Security Testing

### Test Access Control

```python
def test_only_owner_can_mint():
    token = MyToken()
    
    # Should succeed (deployer is owner)
    token.mint("0x123...", 1000)
    
    # Should fail (not owner)
    with pytest.raises(Exception, match="not the owner"):
        token.mint("0x456...", 1000)
```

### Test Reentrancy Protection

```python
def test_reentrancy_blocked():
    vault = MyVault()
    
    # First call should succeed
    vault.withdraw(100)
    
    # Reentrant call should fail
    with pytest.raises(Exception, match="reentrant call"):
        vault.withdraw(100)
```

### Test Pause Functionality

```python
def test_pause_blocks_transfers():
    token = MyToken()
    
    # Pause contract
    token.pause()
    
    # Transfers should fail
    with pytest.raises(Exception, match="paused"):
        token.transfer("0x123...", 100)
    
    # Unpause
    token.unpause()
    
    # Transfers should work
    token.transfer("0x123...", 100)
```

---

## 🚨 Security Warnings

### Critical Issues (Block Export)

- ❌ Mintable without access control
- ❌ External calls without reentrancy protection
- ❌ Upgradeable with storage reordering
- ❌ Unbounded loops over storage

### Warnings (Show Alert)

- ⚠️ No pausable on vault contracts
- ⚠️ No events on state changes
- ⚠️ Missing zero address checks
- ⚠️ High gas complexity functions

### Info (Informational)

- ℹ️ Consider adding permit for gasless approvals
- ℹ️ Consider role-based access for complex permissions
- ℹ️ Consider upgradeability for long-term contracts

---

## 🔐 Best Practices

### 1. Defense in Depth

```python
# Multiple layers of protection
class MyVault(ReentrancyGuard, Pausable, Ownable, Vault):
    def withdraw(self, amount: int):
        self.only_owner()        # Layer 1: Access control
        self.when_not_paused()   # Layer 2: Emergency pause
        self.nonreentrant()      # Layer 3: Reentrancy protection
        # Withdrawal logic
```

### 2. Fail-Safe Defaults

```python
# Default to most restrictive
self.paused = self.state_var("paused", True)  # Start paused
self.minting_enabled = self.state_var("minting", False)  # Disabled by default
```

### 3. Explicit Over Implicit

```python
# ❌ Implicit
def transfer(self, to: str, amount: int):
    # Assumes checks are elsewhere
    self._transfer(to, amount)

# ✅ Explicit
def transfer(self, to: str, amount: int):
    if to == ZERO_ADDRESS:
        raise Exception("Transfer to zero address")
    if amount <= 0:
        raise Exception("Amount must be positive")
    if self.balances[sender] < amount:
        raise Exception("Insufficient balance")
    self._transfer(to, amount)
```

### 4. Audit Trail

```python
# Emit events for all state changes
def mint(self, to: str, amount: int):
    self.only_owner()
    self._mint(to, amount)
    self.event("Mint", to, amount, self.msg_sender())  # Who, what, when
```

---

## 📚 Additional Resources

- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Python Smart Contract Security](https://docs.python.org/3/library/security_warnings.html)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/4.x/api/security)

---

**Remember**: Security is a process, not a product. Always get your contracts audited before handling real value.
