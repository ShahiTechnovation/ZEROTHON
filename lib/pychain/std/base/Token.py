"""
Token - Base ERC20-equivalent fungible token implementation
Part of the Zero Wizard Python Standard Library
"""

from typing import Dict


class Token:
    """
    Base fungible token contract (ERC20-equivalent).
    
    Security Guarantees:
    - ✓ Integer overflow protection (Python native)
    - ✓ Balance checks before transfer
    - ✓ Allowance pattern for delegated transfers
    - ✓ Event emission for all state changes
    
    Gas Complexity:
    - transfer: O(1)
    - approve: O(1)
    - transferFrom: O(1)
    """
    
    def __init__(self, name: str, symbol: str, decimals: int = 18):
        """
        Initialize a new token.
        
        Args:
            name: Human-readable token name
            symbol: Token ticker symbol
            decimals: Number of decimal places (default: 18)
        """
        # Token metadata
        self.name = name
        self.symbol = symbol
        self.decimals = decimals
        
        # State variables
        self.total_supply = self.state_var("token_total_supply", 0)
        self.balances: Dict[str, int] = self.state_var("token_balances", {})
        self.allowances: Dict[str, Dict[str, int]] = self.state_var("token_allowances", {})
    
    def balance_of(self, account: str) -> int:
        """
        Get the token balance of an account.
        
        Args:
            account: Address to query
            
        Returns:
            Token balance (in smallest unit)
        """
        return self.balances.get(account, 0)
    
    def transfer(self, to: str, amount: int) -> bool:
        """
        Transfer tokens to another address.
        
        Security:
        - ✓ Checks sender balance
        - ✓ Prevents transfer to zero address
        - ✓ Emits Transfer event
        
        Args:
            to: Recipient address
            amount: Amount to transfer
            
        Returns:
            True if successful
            
        Raises:
            Exception: If insufficient balance or invalid recipient
        """
        sender = self.msg_sender()
        
        if to == "0x0000000000000000000000000000000000000000":
            raise Exception("Token: transfer to zero address")
        
        if amount <= 0:
            raise Exception("Token: amount must be positive")
        
        sender_balance = self.balances.get(sender, 0)
        if sender_balance < amount:
            raise Exception("Token: insufficient balance")
        
        # Update balances
        self.balances[sender] = sender_balance - amount
        self.balances[to] = self.balances.get(to, 0) + amount
        
        # Emit event
        self.event("Transfer", sender, to, amount)
        
        return True
    
    def approve(self, spender: str, amount: int) -> bool:
        """
        Approve an address to spend tokens on your behalf.
        
        Security:
        - ✓ Prevents approval to zero address
        - ✓ Emits Approval event
        
        Args:
            spender: Address to approve
            amount: Amount to approve
            
        Returns:
            True if successful
        """
        sender = self.msg_sender()
        
        if spender == "0x0000000000000000000000000000000000000000":
            raise Exception("Token: approve to zero address")
        
        # Initialize nested dict if needed
        if sender not in self.allowances:
            self.allowances[sender] = {}
        
        self.allowances[sender][spender] = amount
        
        # Emit event
        self.event("Approval", sender, spender, amount)
        
        return True
    
    def allowance(self, owner: str, spender: str) -> int:
        """
        Get the amount a spender is allowed to spend on behalf of owner.
        
        Args:
            owner: Token owner address
            spender: Approved spender address
            
        Returns:
            Approved amount
        """
        if owner not in self.allowances:
            return 0
        return self.allowances[owner].get(spender, 0)
    
    def transfer_from(self, from_addr: str, to: str, amount: int) -> bool:
        """
        Transfer tokens from one address to another using allowance.
        
        Security:
        - ✓ Checks allowance
        - ✓ Checks balance
        - ✓ Updates allowance
        - ✓ Emits Transfer event
        
        Args:
            from_addr: Source address
            to: Destination address
            amount: Amount to transfer
            
        Returns:
            True if successful
        """
        sender = self.msg_sender()
        
        if to == "0x0000000000000000000000000000000000000000":
            raise Exception("Token: transfer to zero address")
        
        # Check allowance
        current_allowance = self.allowance(from_addr, sender)
        if current_allowance < amount:
            raise Exception("Token: insufficient allowance")
        
        # Check balance
        from_balance = self.balances.get(from_addr, 0)
        if from_balance < amount:
            raise Exception("Token: insufficient balance")
        
        # Update balances
        self.balances[from_addr] = from_balance - amount
        self.balances[to] = self.balances.get(to, 0) + amount
        
        # Update allowance
        self.allowances[from_addr][sender] = current_allowance - amount
        
        # Emit event
        self.event("Transfer", from_addr, to, amount)
        
        return True
    
    def _mint(self, account: str, amount: int):
        """
        Internal function to mint new tokens.
        
        Note: This is internal - use Mintable mixin for public minting.
        
        Security:
        - ✓ Prevents minting to zero address
        - ✓ Updates total supply
        - ✓ Emits Transfer event from zero address
        
        Args:
            account: Address to mint to
            amount: Amount to mint
        """
        if account == "0x0000000000000000000000000000000000000000":
            raise Exception("Token: mint to zero address")
        
        if amount <= 0:
            raise Exception("Token: mint amount must be positive")
        
        self.total_supply += amount
        self.balances[account] = self.balances.get(account, 0) + amount
        
        self.event("Transfer", "0x0000000000000000000000000000000000000000", account, amount)
    
    def _burn(self, account: str, amount: int):
        """
        Internal function to burn tokens.
        
        Note: This is internal - use Burnable mixin for public burning.
        
        Security:
        - ✓ Checks balance
        - ✓ Updates total supply
        - ✓ Emits Transfer event to zero address
        
        Args:
            account: Address to burn from
            amount: Amount to burn
        """
        account_balance = self.balances.get(account, 0)
        if account_balance < amount:
            raise Exception("Token: burn amount exceeds balance")
        
        self.balances[account] = account_balance - amount
        self.total_supply -= amount
        
        self.event("Transfer", account, "0x0000000000000000000000000000000000000000", amount)
