"""
Mintable - Token minting capability mixin
Part of the Zero Wizard Python Standard Library
"""


class Mintable:
    """
    Adds minting capability to Token or NFT contracts.
    
    Security Guarantees:
    - ✓ Requires access control (use with Ownable or AccessControl)
    - ✓ Calls internal _mint function from base contract
    - ✓ Emits events via base contract
    
    Requirements:
    - Base contract must implement _mint() method
    - Should be combined with access control mixin
    
    Usage:
        class MyToken(Mintable, Ownable, Token):
            def __init__(self):
                Token.__init__(self, "MyToken", "MTK")
                Ownable.__init_mixin__(self)
                Mintable.__init_mixin__(self)
    """
    
    def __init_mixin__(self):
        """Initialize the Mintable mixin."""
        # No state needed for Mintable
        pass
    
    def mint(self, to: str, amount: int):
        """
        Mint new tokens to an address.
        
        Security:
        - ✓ Should be protected by access control
        - ✓ Delegates to base contract's _mint
        
        Args:
            to: Address to mint to
            amount: Amount to mint (for tokens) or token_id (for NFTs)
        
        Note: For tokens, amount is in smallest unit.
              For NFTs, amount is the token_id.
        """
        # Access control should be enforced by caller
        # Example: self.only_owner() if using Ownable
        
        if not hasattr(self, '_mint'):
            raise Exception("Mintable: base contract must implement _mint()")
        
        self._mint(to, amount)
