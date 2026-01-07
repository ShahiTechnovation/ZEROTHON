'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer } from "@/components/footer"
import { BottomDockMenu } from "@/components/bottom-dock-menu"
import {
  Code2,
  Coins,
  Image,
  Vote,
  Lock,
  Zap,
  TrendingUp,
  Users,
  Shield,
  Sparkles,
  Upload,
  X,
  Check,
  Star,
  Download,
  Eye,
  Heart
} from 'lucide-react'

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitForm, setSubmitForm] = useState({
    name: '',
    description: '',
    category: 'Token',
    difficulty: 'Beginner',
    code: '',
    author: ''
  })

  const templates = [
    {
      icon: Coins,
      title: 'Token Mint (ERC20-like)',
      description: 'Standard fungible token with mint, burn, and transfer functions',
      difficulty: 'Beginner',
      category: 'Token',
      gradient: 'from-yellow-500 to-orange-500',
      code: 'Python',
      downloads: 1234,
      likes: 456,
      views: 5678,
      author: 'zerothon',
      verified: true,
      sampleCode: `"""
TokenMint - A simple standard token minting contract in Python
"""

from zerothan.py_contracts import PySmartContract

class TokenMint(PySmartContract):
    """A simple token that allows minting and burning."""
    
    def __init__(self):
        """Initialize the token."""
        super().__init__()
        
        # Token details
        self.name = "My Python Token"
        self.symbol = "MPT"
        self.decimals = 18
        
        # Total supply management
        self.total_supply = self.state_var("total_supply", 0)
        
        # Store balances
        self.balances = self.state_var("balances", {})
        
        # Access control
        self.admin = self.state_var("admin", self.msg_sender())
        self.minting_enabled = self.state_var("minting_enabled", True)

    @public_function
    def mint(self, to: str, amount: int):
        """Mint new tokens (Admin only)."""
        sender = self.msg_sender()
        
        if sender != self.admin:
            raise Exception("Only admin can mint!")
            
        if not self.minting_enabled:
            raise Exception("Minting is disabled!")
            
        current_bal = self.balances.get(to, 0)
        self.balances[to] = current_bal + amount
        self.total_supply += amount
        
        self.event("Transfer", "0x0000000000000000000000000000000000000000", to, amount)
        self.event("Mint", to, amount)

    @public_function
    def transfer(self, to: str, amount: int):
        """Transfer tokens to another address."""
        sender = self.msg_sender()
        sender_bal = self.balances.get(sender, 0)
        
        if sender_bal < amount:
            raise Exception("Insufficient balance!")
            
        recipient_bal = self.balances.get(to, 0)
        
        self.balances[sender] = sender_bal - amount
        self.balances[to] = recipient_bal + amount
        
        self.event("Transfer", sender, to, amount)

    @view_function
    def balance_of(self, owner: str) -> int:
        """Get the balance of an address."""
        return self.balances.get(owner, 0)

    @view_function
    def get_total_supply(self) -> int:
        """Get total supply."""
        return self.total_supply

    @public_function
    def burn(self, amount: int):
        """Burn your own tokens."""
        sender = self.msg_sender()
        sender_bal = self.balances.get(sender, 0)
        
        if sender_bal < amount:
            raise Exception("Insufficient balance to burn!")
            
        self.balances[sender] = sender_bal - amount
        self.total_supply -= amount
        
        self.event("Transfer", sender, "0x0000000000000000000000000000000000000000", amount)
        self.event("Burn", sender, amount)`
    },
    {
      icon: Image,
      title: 'Simple NFT (ERC721-like)',
      description: 'Non-fungible token with metadata and approval support',
      difficulty: 'Intermediate',
      category: 'NFT',
      gradient: 'from-purple-500 to-pink-500',
      code: 'Python',
      downloads: 987,
      likes: 321,
      views: 4321,
      author: 'zerothon',
      verified: true,
      sampleCode: `"""
NFTSimple - A simple NFT contract in Python
"""

from zerothan.py_contracts import PySmartContract

class NFTSimple(PySmartContract):
    """A simplistic NFT contract."""
    
    def __init__(self):
        super().__init__()
        
        self.name = "Python NFT"
        self.symbol = "PNFT"
        
        # Maps token_id to owner address
        self.owners = self.state_var("owners", {})
        
        # Maps owner to token count
        self.balances = self.state_var("balances", {})
        
        # Maps token_id to approved address
        self.token_approvals = self.state_var("token_approvals", {})
        
        # Next token ID to mint
        self.next_token_id = self.state_var("next_token_id", 1)
        
        self.admin = self.state_var("admin", self.msg_sender())

    @public_function
    def mint(self, to: str):
        """Mint a new NFT to an address."""
        sender = self.msg_sender()
        if sender != self.admin:
            raise Exception("Only admin can mint!")
            
        token_id = self.next_token_id
        self.next_token_id += 1
        
        self.owners[token_id] = to
        self.balances[to] = self.balances.get(to, 0) + 1
        
        self.event("Transfer", "0x0000000000000000000000000000000000000000", to, token_id)
        return token_id

    @view_function
    def owner_of(self, token_id: int) -> str:
        """Get owner of a token."""
        owner = self.owners.get(token_id)
        if not owner:
            raise Exception("Token does not exist")
        return owner

    @public_function
    def transfer(self, to: str, token_id: int):
        """Transfer NFT."""
        sender = self.msg_sender()
        owner = self.owners.get(token_id)
        
        if not owner:
            raise Exception("Token does not exist")
            
        if sender != owner:
            # Check for approval
            approved = self.token_approvals.get(token_id)
            if sender != approved:
                raise Exception("Not owner or approved")
        
        # Clear approval
        if token_id in self.token_approvals:
            del self.token_approvals[token_id]
            
        # Update balances
        self.balances[owner] -= 1
        self.balances[to] = self.balances.get(to, 0) + 1
        
        # Update owner
        self.owners[token_id] = to
        
        self.event("Transfer", owner, to, token_id)

    @public_function
    def approve(self, to: str, token_id: int):
        """Approve an address to transfer a specific token."""
        sender = self.msg_sender()
        owner = self.owners.get(token_id)
        
        if sender != owner:
            raise Exception("Not owner")
            
        self.token_approvals[token_id] = to
        self.event("Approval", owner, to, token_id)`
    },
    {
      icon: Zap,
      title: 'Staking Contract',
      description: 'Stake tokens and earn rewards with flexible APY',
      difficulty: 'Advanced',
      category: 'DeFi',
      gradient: 'from-orange-500 to-red-500',
      code: 'Python',
      downloads: 876,
      likes: 345,
      views: 4567,
      author: 'zerothon',
      verified: true,
      sampleCode: `"""
Staking - A simple staking contract in Python
"""

from zerothan.py_contracts import PySmartContract

class Staking(PySmartContract):
    """Allows users to stake tokens and earn rewards (simulated)."""
    
    def __init__(self):
        super().__init__()
        
        # Maps user address to staked amount
        self.stakes = self.state_var("stakes", {})
        
        # Total staked in contract
        self.total_staked = self.state_var("total_staked", 0)
        
        # Store when they staked (simulated timestamp)
        self.stake_times = self.state_var("stake_times", {})
        
        # Reward rate (e.g., 10% per duration step)
        self.reward_rate = 10 
        
    @public_function
    def stake(self, amount: int):
        """Stake tokens."""
        sender = self.msg_sender()
        
        if amount <= 0:
            raise Exception("Amount must be positive")
            
        # In a real system, you'd transferFrom a token contract here.
        # For this template, we assume the native currency or direct deposit logic.
        
        current_stake = self.stakes.get(sender, 0)
        
        # Calculate pending rewards if already staking
        if current_stake > 0:
            self._claim_rewards(sender)
            
        self.stakes[sender] = current_stake + amount
        self.total_staked += amount
        self.stake_times[sender] = self.block_number() # Using block number as time proxy
        
        self.event("Staked", sender, amount)

    @public_function
    def withdraw(self, amount: int):
        """Withdraw staked tokens."""
        sender = self.msg_sender()
        current_stake = self.stakes.get(sender, 0)
        
        if amount > current_stake:
            raise Exception("Insufficient stake")
            
        # Claim rewards first
        self._claim_rewards(sender)
        
        self.stakes[sender] = current_stake - amount
        self.total_staked -= amount
        
        self.event("Withdrawn", sender, amount)

    @public_function
    def claim(self):
        """Claim pending rewards."""
        sender = self.msg_sender()
        self._claim_rewards(sender)

    def _claim_rewards(self, user: str):
        """Internal helper to calculate and 'send' rewards."""
        current_stake = self.stakes.get(user, 0)
        if current_stake == 0:
            return
            
        last_stake_block = self.stake_times.get(user, 0)
        current_block = self.block_number()
        
        if current_block <= last_stake_block:
            return
            
        blocks_diff = current_block - last_stake_block
        reward = (current_stake * self.reward_rate * blocks_diff) // 100
        
        if reward > 0:
             # Reset time
            self.stake_times[user] = current_block
            self.event("RewardPaid", user, reward)
            # In real contract, mint or transfer reward tokens here

    @view_function
    def get_stake(self, user: str) -> int:
        return self.stakes.get(user, 0)`
    },
    {
      icon: TrendingUp,
      title: 'AMM Liquidity Pool',
      description: 'Automated market maker with constant product formula',
      difficulty: 'Expert',
      category: 'DeFi',
      gradient: 'from-cyan-500 to-blue-500',
      code: 'Python',
      downloads: 432,
      likes: 187,
      views: 2345,
      author: 'zerothon',
      verified: true,
      sampleCode: `"""
DeFiSwap - A simple AMM-style swap contract in Python
"""

from zerothan.py_contracts import PySmartContract

class DeFiSwap(PySmartContract):
    """Simple Constant Product AMM (x * y = k)."""
    
    def __init__(self):
        super().__init__()
        
        # Balances of the two tokens in the pool
        self.token_a_reserves = self.state_var("token_a", 1000000)
        self.token_b_reserves = self.state_var("token_b", 1000000)
        
        # Admin
        self.admin = self.state_var("admin", self.msg_sender())
        
        # Fee (0.3% usually, here represented as 3 parts in 1000)
        self.fee = 3

    @view_function
    def get_reserves(self) -> list:
        """Get current reserves of both tokens."""
        return [self.token_a_reserves, self.token_b_reserves]

    @view_function
    def get_amount_out(self, amount_in: int, reserve_in: int, reserve_out: int) -> int:
        """Calculate amount out based on x*y=k formula."""
        if amount_in <= 0:
             raise Exception("Invalid input amount")
        if reserve_in <= 0 or reserve_out <= 0:
             raise Exception("Insufficient liquidity")
             
        amount_in_with_fee = amount_in * (1000 - self.fee)
        numerator = amount_in_with_fee * reserve_out
        denominator = (reserve_in * 1000) + amount_in_with_fee
        
        return numerator // denominator

    @public_function
    def swap_a_for_b(self, amount_a_in: int):
        """Swap Token A for Token B."""
        sender = self.msg_sender()
        
        # Verify inputs
        if amount_a_in <= 0:
            raise Exception("Amount must be positive")
            
        # Calculate output
        amount_b_out = self.get_amount_out(amount_a_in, self.token_a_reserves, self.token_b_reserves)
        
        if amount_b_out >= self.token_b_reserves:
             raise Exception("Insufficient liquidity for swap")
             
        # Update reserves
        self.token_a_reserves += amount_a_in
        self.token_b_reserves -= amount_b_out
        
        self.event("Swap", sender, "A_for_B", amount_a_in, amount_b_out)

    @public_function
    def swap_b_for_a(self, amount_b_in: int):
        """Swap Token B for Token A."""
        sender = self.msg_sender()
        
        if amount_b_in <= 0:
            raise Exception("Amount must be positive")
            
        amount_a_out = self.get_amount_out(amount_b_in, self.token_b_reserves, self.token_a_reserves)
        
        if amount_a_out >= self.token_a_reserves:
             raise Exception("Insufficient liquidity for swap")
             
        self.token_b_reserves += amount_b_in
        self.token_a_reserves -= amount_a_out
        
        self.event("Swap", sender, "B_for_A", amount_b_in, amount_a_out)

    @public_function
    def add_liquidity(self, amount_a: int, amount_b: int):
        """Add liquidity to the pool (simplified)."""
        sender = self.msg_sender()
        
        self.token_a_reserves += amount_a
        self.token_b_reserves += amount_b
        
        # In real pool, you'd mint LP tokens here based on contribution
        self.event("LiquidityAdded", sender, amount_a, amount_b)`
    }
  ]

  const categories = [
    { name: 'All', count: templates.length },
    { name: 'Token', count: templates.filter(t => t.category === 'Token').length },
    { name: 'NFT', count: templates.filter(t => t.category === 'NFT').length },
    { name: 'DeFi', count: templates.filter(t => t.category === 'DeFi').length },
    { name: 'Governance', count: templates.filter(t => t.category === 'Governance').length },
    { name: 'Security', count: templates.filter(t => t.category === 'Security').length }
  ]

  const difficultyColors = {
    'Beginner': 'text-green-500',
    'Intermediate': 'text-yellow-500',
    'Advanced': 'text-orange-500',
    'Expert': 'text-red-500'
  }

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would send the form data to your backend
    console.log('Submitting template:', submitForm)
    setShowSubmitModal(false)
    // Reset form
    setSubmitForm({
      name: '',
      description: '',
      category: 'Token',
      difficulty: 'Beginner',
      code: '',
      author: ''
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BottomDockMenu />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Smart Contract{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Templates
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Production-ready smart contract templates written in Python. Copy, customize, and deploy in minutes.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center"
            >
              <Upload className="w-5 h-5" />
              Submit Your Template
            </button>
            <button
              onClick={() => window.location.href = '/playground'}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-all duration-200"
            >
              Create from Scratch
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-mono ${selectedCategory === category.name
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                  }`}
              >
                {category.name} <span className="text-gray-500">({category.count})</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Templates Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => {
              const Icon = template.icon
              return (
                <motion.div
                  key={template.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative cursor-pointer"
                  onClick={() => {
                    // Store template code and redirect to playground
                    localStorage.setItem('templateCode', template.sampleCode)
                    window.location.href = '/playground'
                  }}
                >
                  {/* Glowing Border */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${template.gradient} rounded-lg opacity-20 group-hover:opacity-40 blur transition duration-300`} />

                  {/* Card Content */}
                  <div className="relative bg-black/90 backdrop-blur-sm border border-gray-800 rounded-lg p-6 h-full transition-all duration-300 group-hover:border-gray-700">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${template.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-mono ${difficultyColors[template.difficulty as keyof typeof difficultyColors]}`}>
                          {template.difficulty}
                        </span>
                        {template.verified && (
                          <div className="flex items-center gap-1 text-blue-500">
                            <Check className="w-3 h-3" />
                            <span className="text-xs">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                      {template.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {template.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {template.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {template.views}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {template.author[0]}
                        </div>
                        <span className="text-xs text-gray-500">{template.author}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        {template.code}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">
                Can't find what you're looking for?
              </h3>
              <p className="text-gray-400 mb-6">
                Use our AI assistant to generate custom smart contracts tailored to your needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/ai-chat'}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Ask AI to Build
                </button>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center"
                >
                  <Upload className="w-5 h-5" />
                  Share Your Template
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Submit Template Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-black/90 backdrop-blur-sm border border-gray-700 rounded-lg p-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Submit Your Template
                </h2>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-400 mb-6">
                Share your smart contract template with the community. Help other developers build faster!
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Template Name</label>
                  <input
                    type="text"
                    required
                    value={submitForm.name}
                    onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., ERC20 Token with Governance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    required
                    value={submitForm.description}
                    onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none h-24 resize-none"
                    placeholder="Describe what your template does..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={submitForm.category}
                      onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option>Token</option>
                      <option>NFT</option>
                      <option>DeFi</option>
                      <option>Governance</option>
                      <option>Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={submitForm.difficulty}
                      onChange={(e) => setSubmitForm({ ...submitForm, difficulty: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={submitForm.author}
                    onChange={(e) => setSubmitForm({ ...submitForm, author: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Your name or username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Smart Contract Code</label>
                  <textarea
                    required
                    value={submitForm.code}
                    onChange={(e) => setSubmitForm({ ...submitForm, code: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none h-48 resize-none font-mono text-sm"
                    placeholder="Paste your Python/Vyper smart contract code here..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center"
                  >
                    <Upload className="w-5 h-5" />
                    Submit Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to share your template under the MIT license
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
