"""
NFT - Base ERC721-equivalent non-fungible token implementation
Part of the Zero Wizard Python Standard Library
"""

from typing import Dict


class NFT:
    """
    Base non-fungible token contract (ERC721-equivalent).
    
    Security Guarantees:
    - ✓ Ownership tracking per token
    - ✓ Approval management
    - ✓ Transfer authorization checks
    - ✓ Event emission for all state changes
    
    Gas Complexity:
    - mint: O(1)
    - transfer: O(1)
    - approve: O(1)
    """
    
    def __init__(self, name: str, symbol: str):
        """
        Initialize a new NFT collection.
        
        Args:
            name: Collection name
            symbol: Collection symbol
        """
        self.name = name
        self.symbol = symbol
        
        # State variables
        self.owners: Dict[int, str] = self.state_var("nft_owners", {})
        self.balances: Dict[str, int] = self.state_var("nft_balances", {})
        self.token_approvals: Dict[int, str] = self.state_var("nft_token_approvals", {})
        self.operator_approvals: Dict[str, Dict[str, bool]] = self.state_var("nft_operator_approvals", {})
        self.next_token_id = self.state_var("nft_next_token_id", 1)
    
    def balance_of(self, owner: str) -> int:
        """
        Get the number of NFTs owned by an address.
        
        Args:
            owner: Address to query
            
        Returns:
            Number of NFTs owned
        """
        if owner == "0x0000000000000000000000000000000000000000":
            raise Exception("NFT: balance query for zero address")
        
        return self.balances.get(owner, 0)
    
    def owner_of(self, token_id: int) -> str:
        """
        Get the owner of a specific NFT.
        
        Args:
            token_id: Token ID to query
            
        Returns:
            Owner address
        """
        owner = self.owners.get(token_id)
        if not owner:
            raise Exception("NFT: owner query for nonexistent token")
        return owner
    
    def transfer_from(self, from_addr: str, to: str, token_id: int):
        """
        Transfer an NFT from one address to another.
        
        Security:
        - ✓ Checks ownership or approval
        - ✓ Prevents transfer to zero address
        - ✓ Clears approvals
        - ✓ Updates balances
        
        Args:
            from_addr: Current owner
            to: New owner
            token_id: Token to transfer
        """
        sender = self.msg_sender()
        
        if not self._is_approved_or_owner(sender, token_id):
            raise Exception("NFT: transfer caller is not owner nor approved")
        
        if to == "0x0000000000000000000000000000000000000000":
            raise Exception("NFT: transfer to zero address")
        
        owner = self.owners.get(token_id)
        if owner != from_addr:
            raise Exception("NFT: transfer from incorrect owner")
        
        # Clear approvals
        if token_id in self.token_approvals:
            del self.token_approvals[token_id]
        
        # Update balances
        self.balances[from_addr] -= 1
        self.balances[to] = self.balances.get(to, 0) + 1
        
        # Update owner
        self.owners[token_id] = to
        
        self.event("Transfer", from_addr, to, token_id)
    
    def safe_transfer_from(self, from_addr: str, to: str, token_id: int):
        """
        Safely transfer an NFT (same as transfer_from in Python context).
        
        Args:
            from_addr: Current owner
            to: New owner
            token_id: Token to transfer
        """
        self.transfer_from(from_addr, to, token_id)
    
    def approve(self, to: str, token_id: int):
        """
        Approve an address to transfer a specific NFT.
        
        Security:
        - ✓ Only owner or operator can approve
        - ✓ Cannot approve to current owner
        
        Args:
            to: Address to approve
            token_id: Token to approve
        """
        sender = self.msg_sender()
        owner = self.owner_of(token_id)
        
        if to == owner:
            raise Exception("NFT: approval to current owner")
        
        if sender != owner and not self.is_approved_for_all(owner, sender):
            raise Exception("NFT: approve caller is not owner nor approved for all")
        
        self.token_approvals[token_id] = to
        self.event("Approval", owner, to, token_id)
    
    def get_approved(self, token_id: int) -> str:
        """
        Get the approved address for a specific NFT.
        
        Args:
            token_id: Token to query
            
        Returns:
            Approved address or empty string
        """
        if token_id not in self.owners:
            raise Exception("NFT: approved query for nonexistent token")
        
        return self.token_approvals.get(token_id, "")
    
    def set_approval_for_all(self, operator: str, approved: bool):
        """
        Enable or disable approval for a third party to manage all NFTs.
        
        Args:
            operator: Address to set approval for
            approved: True to approve, False to revoke
        """
        sender = self.msg_sender()
        
        if operator == sender:
            raise Exception("NFT: approve to caller")
        
        if sender not in self.operator_approvals:
            self.operator_approvals[sender] = {}
        
        self.operator_approvals[sender][operator] = approved
        self.event("ApprovalForAll", sender, operator, approved)
    
    def is_approved_for_all(self, owner: str, operator: str) -> bool:
        """
        Check if an operator is approved to manage all NFTs of an owner.
        
        Args:
            owner: NFT owner
            operator: Address to check
            
        Returns:
            True if approved
        """
        if owner not in self.operator_approvals:
            return False
        return self.operator_approvals[owner].get(operator, False)
    
    def _is_approved_or_owner(self, spender: str, token_id: int) -> bool:
        """
        Internal: Check if address is owner or approved for token.
        
        Args:
            spender: Address to check
            token_id: Token to check
            
        Returns:
            True if authorized
        """
        owner = self.owners.get(token_id)
        if not owner:
            return False
        
        return (
            spender == owner or
            self.get_approved(token_id) == spender or
            self.is_approved_for_all(owner, spender)
        )
    
    def _mint(self, to: str, token_id: int):
        """
        Internal function to mint a new NFT.
        
        Note: Use Mintable mixin for public minting.
        
        Security:
        - ✓ Prevents minting to zero address
        - ✓ Prevents minting existing token
        - ✓ Updates balances
        
        Args:
            to: Address to mint to
            token_id: Token ID to mint
        """
        if to == "0x0000000000000000000000000000000000000000":
            raise Exception("NFT: mint to zero address")
        
        if token_id in self.owners:
            raise Exception("NFT: token already minted")
        
        self.balances[to] = self.balances.get(to, 0) + 1
        self.owners[token_id] = to
        
        self.event("Transfer", "0x0000000000000000000000000000000000000000", to, token_id)
    
    def _burn(self, token_id: int):
        """
        Internal function to burn an NFT.
        
        Note: Use Burnable mixin for public burning.
        
        Security:
        - ✓ Checks token exists
        - ✓ Clears approvals
        - ✓ Updates balances
        
        Args:
            token_id: Token to burn
        """
        owner = self.owners.get(token_id)
        if not owner:
            raise Exception("NFT: burn of nonexistent token")
        
        # Clear approvals
        if token_id in self.token_approvals:
            del self.token_approvals[token_id]
        
        self.balances[owner] -= 1
        del self.owners[token_id]
        
        self.event("Transfer", owner, "0x0000000000000000000000000000000000000000", token_id)
