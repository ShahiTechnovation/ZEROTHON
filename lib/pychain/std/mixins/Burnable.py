"""
Burnable - Token burning capability mixin
Part of the Zero Wizard Python Standard Library
"""


class Burnable:
    """
    Adds burning capability to Token or NFT contracts.
    
    Security Guarantees:
    - ✓ Users can burn their own tokens
    - ✓ Calls internal _burn function from base contract
    - ✓ Emits events via base contract
    
    Requirements:
    - Base contract must implement _burn() method
    
    Usage:
        class MyToken(Burnable, Token):
            def __init__(self):
                Token.__init__(self, "MyToken", "MTK")
                Burnable.__init_mixin__(self)
    """
    
    def __init_mixin__(self):
        """Initialize the Burnable mixin."""
        # No state needed for Burnable
        pass
    
    def burn(self, amount: int):
        """
        Burn tokens from caller's balance.
        
        Security:
        - ✓ Can only burn own tokens
        - ✓ Delegates to base contract's _burn
        
        Args:
            amount: Amount to burn (for tokens) or token_id (for NFTs)
        
        Note: For tokens, amount is in smallest unit.
              For NFTs, amount is the token_id.
        """
        if not hasattr(self, '_burn'):
            raise Exception("Burnable: base contract must implement _burn()")
        
        sender = self.msg_sender()
        
        # For NFTs, verify ownership before burning
        if hasattr(self, 'owner_of'):  # NFT contract
            owner = self.owner_of(amount)  # amount is token_id for NFTs
            if owner != sender:
                raise Exception("Burnable: caller is not token owner")
            self._burn(amount)
        else:  # Token contract
            self._burn(sender, amount)
    
    def burn_from(self, account: str, amount: int):
        """
        Burn tokens from another account (requires allowance for tokens).
        
        Security:
        - ✓ Checks allowance for tokens
        - ✓ Checks ownership/approval for NFTs
        
        Args:
            account: Address to burn from
            amount: Amount to burn
        """
        if not hasattr(self, '_burn'):
            raise Exception("Burnable: base contract must implement _burn()")
        
        sender = self.msg_sender()
        
        # For NFTs, check approval
        if hasattr(self, 'owner_of'):  # NFT contract
            if not hasattr(self, '_is_approved_or_owner'):
                raise Exception("Burnable: NFT contract must implement _is_approved_or_owner()")
            
            if not self._is_approved_or_owner(sender, amount):
                raise Exception("Burnable: caller is not owner nor approved")
            
            self._burn(amount)
        else:  # Token contract
            # Check and decrease allowance
            if not hasattr(self, 'allowance'):
                raise Exception("Burnable: Token contract must implement allowance()")
            
            current_allowance = self.allowance(account, sender)
            if current_allowance < amount:
                raise Exception("Burnable: burn amount exceeds allowance")
            
            # Decrease allowance
            if not hasattr(self, 'allowances'):
                raise Exception("Burnable: Token contract must have allowances storage")
            
            self.allowances[account][sender] = current_allowance - amount
            self._burn(account, amount)
