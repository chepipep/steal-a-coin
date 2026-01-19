// Web3 Integration for Steal A ShitCoin
// Connects to Base network and handles ETH payments

const CONTRACT_ADDRESS = '0xCDc9FE548Aec05888f014e15481B029C03680d26';
const BASE_CHAIN_ID = 8453; // Base Mainnet

const CONTRACT_ABI = [
    "function buyVIP() external payable",
    "function buyBoosterIncome() external payable",
    "function buyBoosterSpawn() external payable",
    "function buyBoosterLuck() external payable",
    "function buyInstantSlot() external payable",
    "function buyInstantRebirth() external payable",
    "function checkVIP(address player) external view returns (bool)",
    "function priceVIP() external view returns (uint256)",
    "function priceBoosterIncome() external view returns (uint256)",
    "function priceBoosterSpawn() external view returns (uint256)",
    "function priceBoosterLuck() external view returns (uint256)",
    "function priceInstantSlot() external view returns (uint256)",
    "function priceInstantRebirth() external view returns (uint256)",
    "event Purchase(address indexed player, uint8 purchaseType, uint256 amount, uint256 timestamp)",
    "event VIPActivated(address indexed player, uint256 timestamp)",
    "event BoosterActivated(address indexed player, uint8 boosterType, uint256 duration, uint256 timestamp)"
];

class Web3Manager {
    constructor(game) {
        this.game = game;
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.isConnected = false;
    }

    async init() {
        if (typeof window.ethereum === 'undefined') {
            console.log('MetaMask not installed - running in demo mode');
            return false;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.userAddress = accounts[0];

            // Check network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (parseInt(chainId, 16) !== BASE_CHAIN_ID) {
                await this.switchToBase();
            }

            // Setup ethers
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

            this.isConnected = true;

            // Check VIP status
            const isVIP = await this.contract.checkVIP(this.userAddress);
            if (isVIP) {
                this.game.isVIP = true;
                this.game.saveGame();
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.userAddress = accounts[0];
                this.checkVIPStatus();
            });

            console.log('Web3 connected:', this.userAddress);
            return true;

        } catch (error) {
            console.error('Web3 init failed:', error);
            return false;
        }
    }

    async switchToBase() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x2105' }] // 8453 in hex
            });
        } catch (switchError) {
            // Chain not added, add it
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x2105',
                        chainName: 'Base',
                        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://mainnet.base.org'],
                        blockExplorerUrls: ['https://basescan.org']
                    }]
                });
            }
        }
    }

    async checkVIPStatus() {
        if (!this.contract || !this.userAddress) return;
        try {
            const isVIP = await this.contract.checkVIP(this.userAddress);
            this.game.isVIP = isVIP;
            this.game.saveGame();
        } catch (e) {
            console.error('VIP check failed:', e);
        }
    }

    async buyVIP() {
        if (!this.isConnected) return this.simulatePurchase('VIP');
        try {
            const price = await this.contract.priceVIP();
            const tx = await this.contract.buyVIP({ value: price });
            await tx.wait();
            this.game.isVIP = true;
            this.game.addFloatingText(550, 320, '★★★ VIP ACTIVATED ★★★', '#ffd700');
            this.game.playSound(800, 800);
            this.game.saveGame();
            return true;
        } catch (e) {
            console.error('buyVIP failed:', e);
            this.game.addFloatingText(550, 350, 'Transaction failed!', '#ff0000');
            return false;
        }
    }

    async buyBooster(type) {
        if (!this.isConnected) return this.simulatePurchase('Booster ' + type);

        const methods = {
            'income2x': 'buyBoosterIncome',
            'spawn2x': 'buyBoosterSpawn',
            'lucky2x': 'buyBoosterLuck'
        };

        const priceGetters = {
            'income2x': 'priceBoosterIncome',
            'spawn2x': 'priceBoosterSpawn',
            'lucky2x': 'priceBoosterLuck'
        };

        try {
            const price = await this.contract[priceGetters[type]]();
            const tx = await this.contract[methods[type]]({ value: price });
            await tx.wait();

            this.game.boosters[type].active = true;
            this.game.boosters[type].endTime = Date.now() + 60 * 60 * 1000;
            this.game.addFloatingText(550, 320, '★ BOOSTER ACTIVATED ★', '#4caf50');
            this.game.playSound(600, 300);
            this.game.saveGame();
            return true;
        } catch (e) {
            console.error('buyBooster failed:', e);
            this.game.addFloatingText(550, 350, 'Transaction failed!', '#ff0000');
            return false;
        }
    }

    async buyInstantSlot() {
        if (!this.isConnected) return this.simulatePurchase('Slot');
        try {
            const price = await this.contract.priceInstantSlot();
            const tx = await this.contract.buyInstantSlot({ value: price });
            await tx.wait();

            this.game.unlockedSlots++;
            this.game.pedestals[this.game.unlockedSlots - 1].unlocked = true;
            this.game.addFloatingText(550, 320, '★ SLOT UNLOCKED ★', '#ff9800');
            this.game.playSound(500, 200);
            this.game.updateHUD();
            this.game.saveGame();
            return true;
        } catch (e) {
            console.error('buyInstantSlot failed:', e);
            this.game.addFloatingText(550, 350, 'Transaction failed!', '#ff0000');
            return false;
        }
    }

    async buyInstantRebirth() {
        if (!this.isConnected) return this.simulatePurchase('Rebirth');
        try {
            const price = await this.contract.priceInstantRebirth();
            const tx = await this.contract.buyInstantRebirth({ value: price });
            await tx.wait();

            // Perform rebirth
            this.game.rebirthLevel++;
            this.game.rebirthMultiplier = 1 + this.game.rebirthLevel * 1.0;
            this.game.money = 100;
            this.game.lifetimeEarnings = 0;
            this.game.totalMerges = 0;
            this.game.totalSold = 0;
            this.game.unlockedSlots = 1;
            for (let k in this.game.upgrades) {
                this.game.upgrades[k].level = 0;
            }
            this.game.setupPedestals();
            this.game.conveyor.items = [];
            this.game.player.heldItem = null;
            this.game.totalIncome = 0;
            this.game.spawnConveyorItem(700);
            this.game.spawnConveyorItem(900);
            this.game.addFloatingText(550, 350, '★ INSTANT REBIRTH ★', '#ff00ff');
            this.game.playSound(700, 500);
            this.game.updateHUD();
            this.game.saveGame();
            return true;
        } catch (e) {
            console.error('buyInstantRebirth failed:', e);
            this.game.addFloatingText(550, 350, 'Transaction failed!', '#ff0000');
            return false;
        }
    }

    // Demo mode - simulates purchases when MetaMask not connected
    simulatePurchase(type) {
        this.game.addFloatingText(550, 350, '[DEMO] ' + type + ' purchased!', '#ffd700');
        return true;
    }

    getShortAddress() {
        if (!this.userAddress) return 'Not connected';
        return this.userAddress.slice(0, 6) + '...' + this.userAddress.slice(-4);
    }
}

// Export for use in game.js
window.Web3Manager = Web3Manager;
