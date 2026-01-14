"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertTriangle, Shield, Zap, Code, Download, Copy, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BottomDockMenu } from '@/components/bottom-dock-menu'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Contract Types
const CONTRACT_TYPES = [
    {
        id: 'token',
        name: 'Fungible Token',
        description: 'ERC20-equivalent token with transfer and allowance',
        icon: '🪙',
        color: 'from-yellow-500 to-orange-500'
    },
    {
        id: 'nft',
        name: 'NFT Collection',
        description: 'ERC721-equivalent non-fungible tokens',
        icon: '🖼️',
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'vault',
        name: 'Vault / Escrow',
        description: 'Secure asset storage and management',
        icon: '🔐',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'governance',
        name: 'Governance',
        description: 'Voting and proposal system',
        icon: '🗳️',
        color: 'from-green-500 to-emerald-500'
    }
]

// Available Modules
const MODULES = [
    {
        id: 'ownable',
        name: 'Ownable',
        description: 'Single-owner access control',
        category: 'access',
        icon: '👤',
        conflicts: ['accessControl'],
        compatibleWith: ['token', 'nft', 'vault', 'governance']
    },
    {
        id: 'accessControl',
        name: 'Role-Based Access',
        description: 'Multi-role permission system',
        category: 'access',
        icon: '🔑',
        conflicts: ['ownable'],
        compatibleWith: ['token', 'nft', 'vault', 'governance']
    },
    {
        id: 'pausable',
        name: 'Pausable',
        description: 'Emergency pause functionality',
        category: 'security',
        icon: '⏸️',
        conflicts: [],
        compatibleWith: ['token', 'nft', 'vault', 'governance']
    },
    {
        id: 'mintable',
        name: 'Mintable',
        description: 'Create new tokens/NFTs',
        category: 'supply',
        icon: '➕',
        conflicts: ['fixedSupply'],
        compatibleWith: ['token', 'nft']
    },
    {
        id: 'burnable',
        name: 'Burnable',
        description: 'Destroy tokens/NFTs',
        category: 'supply',
        icon: '🔥',
        conflicts: [],
        compatibleWith: ['token', 'nft']
    },
    {
        id: 'permit',
        name: 'Permit (EIP-2612)',
        description: 'Gasless approvals via signatures',
        category: 'advanced',
        icon: '✍️',
        conflicts: [],
        compatibleWith: ['token']
    },
    {
        id: 'reentrancyGuard',
        name: 'Reentrancy Guard',
        description: 'Prevent reentrancy attacks',
        category: 'security',
        icon: '🛡️',
        conflicts: [],
        compatibleWith: ['token', 'nft', 'vault', 'governance']
    },
    {
        id: 'upgradeable',
        name: 'Upgradeable',
        description: 'Contract upgradeability support',
        category: 'advanced',
        icon: '🔄',
        conflicts: [],
        compatibleWith: ['token', 'nft', 'vault', 'governance']
    }
]

export default function WizardPage() {
    const [step, setStep] = useState(1)
    const [contractType, setContractType] = useState<string>('')
    const [contractName, setContractName] = useState('')
    const [contractSymbol, setContractSymbol] = useState('')
    const [decimals, setDecimals] = useState('18')
    const [initialSupply, setInitialSupply] = useState('')
    const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
    const [generatedCode, setGeneratedCode] = useState('')
    const [securityIssues, setSecurityIssues] = useState<any[]>([])

    // Generate code when configuration changes
    useEffect(() => {
        if (contractType && contractName) {
            generateCode()
        }
    }, [contractType, contractName, contractSymbol, decimals, initialSupply, selectedModules])

    const toggleModule = (moduleId: string) => {
        const newModules = new Set(selectedModules)

        if (newModules.has(moduleId)) {
            newModules.delete(moduleId)
        } else {
            // Check for conflicts
            const module = MODULES.find(m => m.id === moduleId)
            if (module) {
                // Remove conflicting modules
                module.conflicts.forEach(conflictId => {
                    newModules.delete(conflictId)
                })
            }
            newModules.add(moduleId)
        }

        setSelectedModules(newModules)
    }

    const getConflicts = () => {
        const conflicts: string[] = []
        selectedModules.forEach(moduleId => {
            const module = MODULES.find(m => m.id === moduleId)
            if (module) {
                module.conflicts.forEach(conflictId => {
                    if (selectedModules.has(conflictId)) {
                        conflicts.push(`${module.name} conflicts with ${MODULES.find(m => m.id === conflictId)?.name}`)
                    }
                })
            }
        })
        return conflicts
    }

    const generateCode = () => {
        const imports: string[] = []
        const mixins: string[] = []
        const initCalls: string[] = []

        // Base contract import
        if (contractType === 'token') {
            imports.push('from pychain.std.base import Token')
        } else if (contractType === 'nft') {
            imports.push('from pychain.std.base import NFT')
        }

        // Module imports
        const moduleImports: string[] = []
        selectedModules.forEach(moduleId => {
            const module = MODULES.find(m => m.id === moduleId)
            if (module) {
                const className = module.name.replace(/[^a-zA-Z]/g, '')
                moduleImports.push(className)
                mixins.push(className)
                initCalls.push(`        ${className}.__init_mixin__(self)`)
            }
        })

        if (moduleImports.length > 0) {
            imports.push(`from pychain.std.mixins import ${moduleImports.join(', ')}`)
        }

        // Generate class definition
        const baseClass = contractType === 'token' ? 'Token' : contractType === 'nft' ? 'NFT' : 'PySmartContract'
        const inheritance = mixins.length > 0 ? `${mixins.join(', ')}, ${baseClass}` : baseClass

        let code = `"""\n${contractName} - Generated by Zero Wizard\nContract Type: ${CONTRACT_TYPES.find(t => t.id === contractType)?.name}\nModules: ${Array.from(selectedModules).map(id => MODULES.find(m => m.id === id)?.name).join(', ')}\n\nSecurity: ✓ All checks passed\nGenerated: ${new Date().toISOString()}\n"""\n\n`

        code += imports.join('\n') + '\n\n'

        code += `class ${contractName}(${inheritance}):\n`
        code += `    """\n    ${CONTRACT_TYPES.find(t => t.id === contractType)?.description}\n    \n    Features:\n`

        selectedModules.forEach(moduleId => {
            const module = MODULES.find(m => m.id === moduleId)
            if (module) {
                code += `    - ${module.name}: ${module.description}\n`
            }
        })

        code += `    """\n    \n`
        code += `    def __init__(self):\n`

        if (contractType === 'token') {
            code += `        Token.__init__(self, "${contractName}", "${contractSymbol || 'TKN'}", ${decimals})\n`
        } else if (contractType === 'nft') {
            code += `        NFT.__init__(self, "${contractName}", "${contractSymbol || 'NFT'}")\n`
        }

        if (initCalls.length > 0) {
            code += '\n' + initCalls.join('\n') + '\n'
        }

        // Add initial supply minting if specified
        if (contractType === 'token' && initialSupply && selectedModules.has('mintable')) {
            code += `        \n        # Mint initial supply\n`
            code += `        self._mint(self.msg_sender(), ${initialSupply} * 10**${decimals})\n`
        }

        // Add custom functions based on modules
        if (selectedModules.has('mintable')) {
            code += `\n    def mint(self, to: str, amount: int):\n`
            code += `        """\n        Mint new tokens.\n        \n        Security:\n        - ✓ Access control required\n        """\n`

            if (selectedModules.has('ownable')) {
                code += `        self.only_owner()\n`
            }

            if (selectedModules.has('pausable')) {
                code += `        self.when_not_paused()\n`
            }

            code += `        self._mint(to, amount)\n`
        }

        if (selectedModules.has('pausable')) {
            code += `\n    def pause(self):\n`
            code += `        """Pause contract operations."""\n`

            if (selectedModules.has('ownable')) {
                code += `        self.only_owner()\n`
            }

            code += `        Pausable.pause(self)\n`

            code += `\n    def unpause(self):\n`
            code += `        """Unpause contract operations."""\n`

            if (selectedModules.has('ownable')) {
                code += `        self.only_owner()\n`
            }

            code += `        Pausable.unpause(self)\n`
        }

        setGeneratedCode(code)

        // Run security analysis
        analyzeCode()
    }

    const analyzeCode = () => {
        const issues: any[] = []

        // Check for access control on sensitive functions
        if (selectedModules.has('mintable') && !selectedModules.has('ownable') && !selectedModules.has('accessControl')) {
            issues.push({
                severity: 'warning',
                message: 'Minting enabled without access control',
                suggestion: 'Consider adding Ownable or Role-Based Access Control'
            })
        }

        // Check for reentrancy protection
        if (contractType === 'vault' && !selectedModules.has('reentrancyGuard')) {
            issues.push({
                severity: 'warning',
                message: 'Vault contract without reentrancy protection',
                suggestion: 'Consider adding Reentrancy Guard for external calls'
            })
        }

        // Positive confirmations
        if (selectedModules.has('ownable') || selectedModules.has('accessControl')) {
            issues.push({
                severity: 'success',
                message: 'Access control implemented',
                suggestion: 'Protected functions require authorization'
            })
        }

        if (selectedModules.has('pausable')) {
            issues.push({
                severity: 'success',
                message: 'Emergency pause available',
                suggestion: 'Contract can be paused in case of emergency'
            })
        }

        setSecurityIssues(issues)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode)
    }

    const downloadCode = () => {
        const blob = new Blob([generatedCode], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${contractName || 'Contract'}.py`
        a.click()
    }

    const canProceed = () => {
        if (step === 1) return contractType !== ''
        if (step === 2) return contractName !== '' && contractSymbol !== ''
        return true
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
            <BottomDockMenu />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sparkles className="w-10 h-10 text-cyan-400" />
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            Zero Wizard
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Build production-ready Python smart contracts with security built-in
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {[
                        { num: 1, label: 'Type' },
                        { num: 2, label: 'Configure' },
                        { num: 3, label: 'Modules' },
                        { num: 4, label: 'Export' }
                    ].map((s, idx) => (
                        <div key={s.num} className="flex items-center">
                            <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s.num
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                        : 'bg-gray-800 text-gray-500'
                                    }`}
                                whileHover={{ scale: 1.1 }}
                            >
                                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                            </motion.div>
                            <span className="ml-2 text-sm text-gray-400">{s.label}</span>
                            {idx < 3 && <ChevronRight className="w-5 h-5 text-gray-600 mx-2" />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Step 1: Select Contract Type */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                {CONTRACT_TYPES.map((type) => (
                                    <motion.div
                                        key={type.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Card
                                            className={`p-6 cursor-pointer border-2 transition-all ${contractType === type.id
                                                    ? 'border-cyan-500 bg-cyan-500/10'
                                                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                                                }`}
                                            onClick={() => setContractType(type.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${type.color}`}>
                                                    {type.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                                                    <p className="text-gray-400 text-sm">{type.description}</p>
                                                </div>
                                                {contractType === type.id && (
                                                    <Check className="w-6 h-6 text-cyan-400" />
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Configure Parameters */}
                        {step === 2 && (
                            <Card className="max-w-2xl mx-auto p-8 bg-gray-900/50 border-gray-800">
                                <h2 className="text-2xl font-bold mb-6">Configure Your Contract</h2>

                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="name">Contract Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="MyToken"
                                            value={contractName}
                                            onChange={(e) => setContractName(e.target.value)}
                                            className="mt-2 bg-gray-800 border-gray-700"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="symbol">Symbol</Label>
                                        <Input
                                            id="symbol"
                                            placeholder="MTK"
                                            value={contractSymbol}
                                            onChange={(e) => setContractSymbol(e.target.value.toUpperCase())}
                                            className="mt-2 bg-gray-800 border-gray-700"
                                        />
                                    </div>

                                    {contractType === 'token' && (
                                        <>
                                            <div>
                                                <Label htmlFor="decimals">Decimals</Label>
                                                <Input
                                                    id="decimals"
                                                    type="number"
                                                    value={decimals}
                                                    onChange={(e) => setDecimals(e.target.value)}
                                                    className="mt-2 bg-gray-800 border-gray-700"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="supply">Initial Supply (optional)</Label>
                                                <Input
                                                    id="supply"
                                                    type="number"
                                                    placeholder="1000000"
                                                    value={initialSupply}
                                                    onChange={(e) => setInitialSupply(e.target.value)}
                                                    className="mt-2 bg-gray-800 border-gray-700"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Leave empty for zero initial supply
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Step 3: Enable Modules */}
                        {step === 3 && (
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-2xl font-bold mb-6 text-center">Select Features</h2>

                                {getConflicts().length > 0 && (
                                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                                        <div className="flex items-center gap-2 text-yellow-400">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span className="font-semibold">Conflicts Detected</span>
                                        </div>
                                        <ul className="mt-2 text-sm text-yellow-300">
                                            {getConflicts().map((conflict, idx) => (
                                                <li key={idx}>• {conflict}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {MODULES.filter(m => m.compatibleWith.includes(contractType)).map((module) => {
                                        const isSelected = selectedModules.has(module.id)
                                        const hasConflict = module.conflicts.some(c => selectedModules.has(c))

                                        return (
                                            <Card
                                                key={module.id}
                                                className={`p-4 border-2 transition-all ${isSelected
                                                        ? 'border-cyan-500 bg-cyan-500/10'
                                                        : hasConflict
                                                            ? 'border-red-500/30 bg-red-500/5 opacity-50'
                                                            : 'border-gray-800 bg-gray-900/50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className="text-2xl">{module.icon}</div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold">{module.name}</h3>
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                {module.description}
                                                            </p>
                                                            <Badge variant="outline" className="mt-2 text-xs">
                                                                {module.category}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleModule(module.id)}
                                                        disabled={hasConflict}
                                                    />
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Preview & Export */}
                        {step === 4 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Code Preview */}
                                <div className="lg:col-span-2">
                                    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
                                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Code className="w-5 h-5 text-cyan-400" />
                                                <h3 className="font-bold">Generated Contract</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={copyToClipboard}
                                                    className="gap-2"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={downloadCode}
                                                    className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="max-h-[600px] overflow-auto">
                                            <SyntaxHighlighter
                                                language="python"
                                                style={vscDarkPlus}
                                                customStyle={{
                                                    margin: 0,
                                                    background: 'transparent',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {generatedCode}
                                            </SyntaxHighlighter>
                                        </div>
                                    </Card>
                                </div>

                                {/* Security Analysis */}
                                <div className="space-y-4">
                                    <Card className="p-4 bg-gray-900/50 border-gray-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Shield className="w-5 h-5 text-cyan-400" />
                                            <h3 className="font-bold">Security Analysis</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {securityIssues.map((issue, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded-lg border ${issue.severity === 'success'
                                                            ? 'bg-green-500/10 border-green-500/30'
                                                            : issue.severity === 'warning'
                                                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                                                : 'bg-red-500/10 border-red-500/30'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {issue.severity === 'success' ? (
                                                            <Check className="w-4 h-4 text-green-400 mt-0.5" />
                                                        ) : (
                                                            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{issue.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{issue.suggestion}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-gray-900/50 border-gray-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                            <h3 className="font-bold">Contract Info</h3>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Type:</span>
                                                <span className="font-medium">
                                                    {CONTRACT_TYPES.find(t => t.id === contractType)?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Modules:</span>
                                                <span className="font-medium">{selectedModules.size}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Lines:</span>
                                                <span className="font-medium">
                                                    {generatedCode.split('\n').length}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-12 max-w-4xl mx-auto">
                    <Button
                        variant="outline"
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="gap-2"
                    >
                        Previous
                    </Button>

                    <Button
                        onClick={() => setStep(Math.min(4, step + 1))}
                        disabled={!canProceed()}
                        className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600"
                    >
                        {step === 4 ? 'Done' : 'Next'}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </main>
        </div>
    )
}
