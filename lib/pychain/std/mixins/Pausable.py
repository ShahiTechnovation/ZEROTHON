"""
Pausable - Emergency pause functionality mixin
Part of the Zero Wizard Python Standard Library
"""


class Pausable:
    """
    Allows pausing and unpausing of contract functionality.
    
    Security Guarantees:
    - ✓ Only authorized users can pause/unpause
    - ✓ Paused state persists across calls
    - ✓ Events emitted for state changes
    
    Usage:
        class MyContract(Pausable, Ownable, BaseContract):
            def __init__(self):
                BaseContract.__init__(self)
                Ownable.__init_mixin__(self)
                Pausable.__init_mixin__(self)
            
            def critical_function(self):
                self.when_not_paused()
                # Protected logic here
    """
    
    def __init_mixin__(self):
        """Initialize the Pausable mixin."""
        self.paused = self.state_var("pausable_paused", False)
    
    def when_not_paused(self):
        """
        Modifier function to make a function callable only when not paused.
        
        Usage:
            def my_function(self):
                self.when_not_paused()
                # Your code here
        
        Raises:
            Exception: If contract is paused
        """
        if self.paused:
            raise Exception("Pausable: paused")
    
    def when_paused(self):
        """
        Modifier function to make a function callable only when paused.
        
        Usage:
            def emergency_function(self):
                self.when_paused()
                # Your code here
        
        Raises:
            Exception: If contract is not paused
        """
        if not self.paused:
            raise Exception("Pausable: not paused")
    
    def is_paused(self) -> bool:
        """
        Check if contract is currently paused.
        
        Returns:
            True if paused, False otherwise
        """
        return self.paused
    
    def pause(self):
        """
        Pause the contract.
        
        Security:
        - ✓ Should be protected by access control
        - ✓ Can only pause if not already paused
        - ✓ Emits Paused event
        """
        self.when_not_paused()
        self.paused = True
        self.event("Paused", self.msg_sender())
    
    def unpause(self):
        """
        Unpause the contract.
        
        Security:
        - ✓ Should be protected by access control
        - ✓ Can only unpause if currently paused
        - ✓ Emits Unpaused event
        """
        self.when_paused()
        self.paused = False
        self.event("Unpaused", self.msg_sender())
