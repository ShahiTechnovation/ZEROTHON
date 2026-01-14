"""
Ownable - Single-owner access control mixin
Part of the Zero Wizard Python Standard Library
"""


class Ownable:
    """
    Provides basic access control with a single owner.
    
    Security Guarantees:
    - ✓ Owner is set to deployer by default
    - ✓ Only owner can transfer ownership
    - ✓ Ownership can be renounced (set to zero address)
    - ✓ Events emitted for ownership changes
    
    Usage:
        class MyContract(Ownable, BaseContract):
            def __init__(self):
                BaseContract.__init__(self)
                Ownable.__init_mixin__(self)
            
            def admin_function(self):
                self.only_owner()
                # Protected logic here
    """
    
    def __init_mixin__(self):
        """Initialize the Ownable mixin."""
        self.owner = self.state_var("ownable_owner", self.msg_sender())
        self.event("OwnershipTransferred", "0x0000000000000000000000000000000000000000", self.owner)
    
    def only_owner(self):
        """
        Modifier function to restrict access to owner only.
        
        Usage:
            def protected_function(self):
                self.only_owner()
                # Your code here
        
        Raises:
            Exception: If caller is not the owner
        """
        if self.msg_sender() != self.owner:
            raise Exception("Ownable: caller is not the owner")
    
    def get_owner(self) -> str:
        """
        Get the current owner address.
        
        Returns:
            Owner address
        """
        return self.owner
    
    def transfer_ownership(self, new_owner: str):
        """
        Transfer ownership to a new address.
        
        Security:
        - ✓ Only current owner can transfer
        - ✓ Prevents transfer to zero address
        - ✓ Emits OwnershipTransferred event
        
        Args:
            new_owner: Address of new owner
        """
        self.only_owner()
        
        if new_owner == "0x0000000000000000000000000000000000000000":
            raise Exception("Ownable: new owner is zero address")
        
        old_owner = self.owner
        self.owner = new_owner
        self.event("OwnershipTransferred", old_owner, new_owner)
    
    def renounce_ownership(self):
        """
        Renounce ownership, leaving the contract without an owner.
        
        Warning: This will permanently disable owner-only functions.
        
        Security:
        - ✓ Only current owner can renounce
        - ✓ Emits OwnershipTransferred event
        """
        self.only_owner()
        
        old_owner = self.owner
        self.owner = "0x0000000000000000000000000000000000000000"
        self.event("OwnershipTransferred", old_owner, "0x0000000000000000000000000000000000000000")
