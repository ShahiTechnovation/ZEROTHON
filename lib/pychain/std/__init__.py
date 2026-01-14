"""
pychain.std - Python Smart Contract Standard Library

This library provides base contracts and composable mixins for building
secure, production-ready smart contracts in Python.

Usage:
    from pychain.std.base import Token, NFT
    from pychain.std.mixins import Ownable, Mintable, Pausable
    
    class MyToken(Mintable, Pausable, Ownable, Token):
        def __init__(self):
            Token.__init__(self, "MyToken", "MTK", 18)
            Ownable.__init_mixin__(self)
            Pausable.__init_mixin__(self)
            Mintable.__init_mixin__(self)
"""

__version__ = '1.0.0'
__author__ = 'Zerothon Team'

from . import base
from . import mixins

__all__ = ['base', 'mixins']
