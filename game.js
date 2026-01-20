// STEAL A SHITCOIN - Ultimate Edition
// Buy coins, place them, earn income, sell for profit!

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Core stats
        this.money = 100;
        this.totalIncome = 0;
        this.lifetimeEarnings = 0;
        this.totalMerges = 0;
        this.totalSold = 0;
        this.soundEnabled = true;

        // Slot system (balanced for monetization) - 12 slots per floor
        this.unlockedSlots = 1;
        this.maxSlots = 36; // 3 floors x 12 slots
        this.currentFloor = 1;
        this.slotPrices = [
            0, 1000, 5000, 25000, 150000, 1000000, 8000000, 80000000, 800000000, 5000000000, 30000000000, 150000000000, // Floor 1 (1-12)
            500000000000, 2000000000000, 8000000000000, 35000000000000, 150000000000000, 600000000000000, 2500000000000000, 10000000000000000, 40000000000000000, 150000000000000000, 600000000000000000, 2500000000000000000, // Floor 2 (13-24)
            1e19, 4e19, 1.5e20, 6e20, 2.5e21, 1e22, 4e22, 1.5e23, 6e23, 2.5e24, 1e25, 4e25 // Floor 3 (25-36)
        ];

        // Rebirth system
        this.rebirthLevel = 0;
        this.rebirthMultiplier = 1;
        this.maxSlotsAfterRebirth = 10; // Increases with rebirth

        // Upgrades (base cost 150 so player needs to grind first)
        this.upgrades = {
            incomeBoost: { level: 0, baseCost: 150, costMult: 2.0, effect: 0.03, name: 'Income Boost', desc: '+3% income' },
            spawnRate: { level: 0, baseCost: 150, costMult: 2.2, effect: 0.008, name: 'Spawn Rate', desc: '+0.8% spawn rate' },
            luckyRolls: { level: 0, baseCost: 200, costMult: 2.4, effect: 0.2, name: 'Lucky Rolls', desc: '+0.2% rare chance' },
            cheaperCoins: { level: 0, baseCost: 150, costMult: 2.1, effect: 0.008, name: 'Discount', desc: '-0.8% prices' },
            mutationChance: { level: 0, baseCost: 1000, costMult: 2.8, effect: 0.3, name: 'Mutagen', desc: '+0.3% mutation' }
        };

        // UI state
        this.shopOpen = false;
        this.statsOpen = false;
        this.rebirthOpen = false;
        this.collectionOpen = false;
        this.donateShopOpen = false;
        this.collectionScroll = 0;
        this.shopUpgradeBoxes = [];
        this.slotBuyBox = null;

        // Mutations (rare - balanced for monetization)
        this.mutations = {
            gold:        { color: '#ffd700', glow: '#fff9c4', name: 'GOLD', chance: 0.8, incomeMultiplier: 3, priceMultiplier: 2.5 },
            diamond:     { color: '#b9f2ff', glow: '#e0ffff', name: 'DIAMOND', chance: 0.3, incomeMultiplier: 5, priceMultiplier: 4 },
            darkMatter:  { color: '#4a0080', glow: '#9932cc', name: 'DARK MATTER', chance: 0.08, incomeMultiplier: 10, priceMultiplier: 8 },
            rainbow:     { color: 'rainbow', glow: '#ffffff', name: 'RAINBOW', chance: 0.02, incomeMultiplier: 25, priceMultiplier: 15 }
        };

        // ETH Prices (placeholders for Web3)
        this.ethPrices = {
            rebirth: 0.001,
            slot: 0.0005,
            vip: 0.005,
            incomeBoost2x: 0.0008,
            spawnBoost2x: 0.0008,
            luckyBoost: 0.001,
            instantUpgrade: 0.0003
        };

        // VIP and Booster system
        this.isVIP = false;
        this.boosters = {
            income2x: { active: false, endTime: 0 },
            spawn2x: { active: false, endTime: 0 },
            lucky2x: { active: false, endTime: 0 }
        };

        // Rarities (harder to get rare ones)
        this.rarities = {
            common:    { color: '#9e9e9e', glow: '#cccccc', border: '#666666', chance: 60, multiplier: 1, priceMultiplier: 1 },
            uncommon:  { color: '#4caf50', glow: '#81c784', border: '#2e7d32', chance: 22, multiplier: 1.5, priceMultiplier: 2 },
            rare:      { color: '#2196f3', glow: '#64b5f6', border: '#1565c0', chance: 12, multiplier: 3, priceMultiplier: 5 },
            epic:      { color: '#9c27b0', glow: '#ba68c8', border: '#6a1b9a', chance: 4.5, multiplier: 8, priceMultiplier: 15 },
            legendary: { color: '#ff9800', glow: '#ffb74d', border: '#e65100', chance: 1.2, multiplier: 25, priceMultiplier: 50 },
            mythic:    { color: '#f44336', glow: '#e57373', border: '#b71c1c', chance: 0.3, multiplier: 100, priceMultiplier: 150 }
        };

        // Extended coin types (up to 100B value)
        this.coinTypes = [
            { icon: '💩', name: 'ShitCoin', baseIncome: 1, basePrice: 10, tier: 1 },
            { icon: '🐕', name: 'Doge', baseIncome: 2, basePrice: 25, tier: 1 },
            { icon: '🐸', name: 'Pepe', baseIncome: 5, basePrice: 60, tier: 1 },
            { icon: '🦍', name: 'Ape', baseIncome: 12, basePrice: 150, tier: 2 },
            { icon: '🌙', name: 'Moon', baseIncome: 30, basePrice: 400, tier: 2 },
            { icon: '💎', name: 'Diamond', baseIncome: 75, basePrice: 1000, tier: 2 },
            { icon: '🚀', name: 'Rocket', baseIncome: 200, basePrice: 3000, tier: 3 },
            { icon: '👽', name: 'Alien', baseIncome: 500, basePrice: 8000, tier: 3 },
            { icon: '🌟', name: 'Star', baseIncome: 1500, basePrice: 25000, tier: 3 },
            { icon: '🔮', name: 'Crystal', baseIncome: 4000, basePrice: 70000, tier: 4 },
            { icon: '⚡', name: 'Thunder', baseIncome: 12000, basePrice: 200000, tier: 4 },
            { icon: '🌀', name: 'Vortex', baseIncome: 35000, basePrice: 600000, tier: 4 },
            { icon: '☄️', name: 'Comet', baseIncome: 100000, basePrice: 2000000, tier: 5 },
            { icon: '🌌', name: 'Galaxy', baseIncome: 300000, basePrice: 6000000, tier: 5 },
            { icon: '🕳️', name: 'BlackHole', baseIncome: 1000000, basePrice: 20000000, tier: 5 },
            { icon: '✨', name: 'Quasar', baseIncome: 3000000, basePrice: 70000000, tier: 6 },
            { icon: '🔥', name: 'Supernova', baseIncome: 10000000, basePrice: 250000000, tier: 6 },
            { icon: '💫', name: 'Cosmic', baseIncome: 35000000, basePrice: 1000000000, tier: 6 },
            { icon: '🌠', name: 'Infinity', baseIncome: 120000000, basePrice: 4000000000, tier: 7 },
            { icon: '👑', name: 'Omega', baseIncome: 500000000, basePrice: 20000000000, tier: 7 },
            { icon: '🎭', name: 'Genesis', baseIncome: 2000000000, basePrice: 100000000000, tier: 7 }
        ];

        // Pedestals
        this.pedestals = [];
        this.setupPedestals();

        // Sell zone
        this.sellZone = { x: 850, y: 400, width: 110, height: 130 };

        // Conveyor (slower spawn = more grind)
        this.conveyor = {
            items: [],
            speed: 0.7,
            spawnTimer: 0,
            spawnInterval: 7000
        };

        // Player
        this.player = {
            x: 450,
            y: 350,
            size: 50,
            speed: 5.0,
            heldItem: null
        };

        // Effects
        this.particles = [];
        this.floatingTexts = [];
        this.sparkles = [];

        // Timing
        this.lastTime = 0;
        this.incomeTimer = 0;
        this.animTime = 0;

        // Input
        this.keys = {};
        this.ePressed = false;
        this.mouse = { x: 0, y: 0, clicked: false };

        // Optimization: Cached canvases for static elements
        this.staticCache = null;
        this.staticCacheValid = false;
        this.cachedGradients = {};

        // Web3 Manager (initialized after DOM ready)
        this.web3 = null;

        this.init();
    }

    async initWeb3() {
        if (typeof Web3Manager !== 'undefined') {
            this.web3 = new Web3Manager(this);
            const connected = await this.web3.init();
            if (connected) {
                const walletStatus = document.getElementById('wallet-status');
                if (walletStatus) {
                    walletStatus.textContent = 'Wallet: ' + this.web3.getShortAddress();
                    walletStatus.style.color = '#4caf50';
                }
            }
        }
    }

    setupPedestals() {
        this.pedestals = [];
        const startX = 180;
        const startY = 270;
        const spacingX = 95;
        const spacingY = 100;

        // 12 slots per floor (3 rows x 4 cols), 3 floors total = 36 slots
        for (let floor = 0; floor < 3; floor++) {
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 4; col++) {
                    const index = floor * 12 + row * 4 + col;
                    this.pedestals.push({
                        x: startX + col * spacingX,
                        y: startY + row * spacingY,
                        width: 75,
                        height: 55,
                        floor: floor + 1,
                        item: null,
                        unlocked: index < this.unlockedSlots
                    });
                }
            }
        }
    }

    getCurrentFloorPedestals() {
        return this.pedestals.filter(p => p.floor === this.currentFloor);
    }

    switchFloor(floor) {
        if (floor >= 1 && floor <= 3) {
            this.currentFloor = floor;
        }
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Keyboard
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;

            if (e.code === 'KeyE' && !this.ePressed && !this.shopOpen && !this.statsOpen && !this.rebirthOpen && !this.collectionOpen) {
                this.ePressed = true;
                this.interact();
            }

            if ((e.code === 'KeyE' || e.code === 'Escape') && (this.shopOpen || this.statsOpen || this.rebirthOpen || this.collectionOpen || this.donateShopOpen)) {
                this.shopOpen = false;
                this.statsOpen = false;
                this.rebirthOpen = false;
                this.collectionOpen = false;
                this.donateShopOpen = false;
                this.ePressed = true;
            }

            if (e.code === 'Tab') {
                e.preventDefault();
                this.shopOpen = !this.shopOpen;
                this.statsOpen = false;
                this.rebirthOpen = false;
            }
            if (e.code === 'KeyQ') {
                this.statsOpen = !this.statsOpen;
                this.shopOpen = false;
                this.rebirthOpen = false;
            }
            if (e.code === 'KeyR' && !this.shopOpen && !this.statsOpen && !this.collectionOpen) {
                this.rebirthOpen = !this.rebirthOpen;
                this.shopOpen = false;
                this.statsOpen = false;
            }
            if (e.code === 'KeyC') {
                this.collectionOpen = !this.collectionOpen;
                this.shopOpen = false;
                this.statsOpen = false;
                this.rebirthOpen = false;
                this.collectionScroll = 0;
            }
            if (e.code === 'KeyM') {
                this.soundEnabled = !this.soundEnabled;
            }
            if (e.code === 'KeyP') {
                this.donateShopOpen = !this.donateShopOpen;
                this.shopOpen = false;
                this.statsOpen = false;
                this.rebirthOpen = false;
                this.collectionOpen = false;
            }

            // Floor switching (only when no menus open)
            if (!this.shopOpen && !this.statsOpen && !this.rebirthOpen && !this.collectionOpen && !this.donateShopOpen) {
                if (e.code === 'Digit1') this.switchFloor(1);
                if (e.code === 'Digit2') this.switchFloor(2);
                if (e.code === 'Digit3') this.switchFloor(3);
            }

            // Collection scroll
            if (this.collectionOpen) {
                if (e.code === 'ArrowDown' || e.code === 'KeyS') this.collectionScroll = Math.min(this.collectionScroll + 1, Math.max(0, this.coinTypes.length - 8));
                if (e.code === 'ArrowUp' || e.code === 'KeyW') this.collectionScroll = Math.max(0, this.collectionScroll - 1);
            }

            // Shop number keys
            if (this.shopOpen) {
                const keys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'];
                const upgKeys = Object.keys(this.upgrades);
                keys.forEach((k, i) => {
                    if (e.code === k && upgKeys[i]) this.buyUpgrade(upgKeys[i]);
                });
                if (e.code === 'Digit6') this.buySlot();
            }

            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            if (e.code === 'KeyE') this.ePressed = false;
        });

        // Mouse support
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('click', e => {
            this.handleClick(e);
        });

        this.loadGame();

        document.getElementById('play-btn').onclick = () => {
            document.getElementById('menu-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
        };

        document.getElementById('reset-btn').onclick = () => {
            this.resetGame();
        };

        this.spawnConveyorItem(700);
        this.spawnConveyorItem(900);

        this.updateHUD();

        // Initialize Web3 connection
        this.initWeb3();

        requestAnimationFrame(t => this.loop(t));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Donate shop click handling
        if (this.donateShopOpen && this.donateButtons) {
            for (let btn of this.donateButtons) {
                if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
                    this.handleDonateAction(btn.action, btn.key);
                    return;
                }
            }
        }

        // Shop click handling
        if (this.shopOpen) {
            for (let box of this.shopUpgradeBoxes) {
                if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
                    this.buyUpgrade(box.key);
                    return;
                }
            }
            if (this.slotBuyBox) {
                const b = this.slotBuyBox;
                if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                    this.buySlot();
                    return;
                }
            }
        }

        // Rebirth click handling
        if (this.rebirthOpen && this.rebirthButton) {
            const b = this.rebirthButton;
            if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                this.doRebirth();
                return;
            }
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.staticCacheValid = false; // Invalidate cache on resize
        this.cachedGradients = {}; // Clear gradient cache
    }

    // Create cached static background (floor, base outline, conveyor rails)
    createStaticCache() {
        const cacheW = 1100;
        const cacheH = 700;

        if (!this.staticCache) {
            this.staticCache = document.createElement('canvas');
            this.staticCache.width = cacheW;
            this.staticCache.height = cacheH;
        }

        const ctx = this.staticCache.getContext('2d');
        ctx.clearRect(0, 0, cacheW, cacheH);

        // Draw floor tiles (ONCE, not every frame)
        for (let row = 0; row < 18; row++) {
            for (let col = 0; col < 22; col++) {
                const x = col * 55;
                const y = row * 45;
                const isEven = (row + col) % 2 === 0;
                ctx.fillStyle = isEven ? '#1e3a5f' : '#234567';
                ctx.fillRect(x, y, 55, 45);
                ctx.strokeStyle = '#2d4a6f';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, 55, 45);
            }
        }

        // === DECORATIVE ELEMENTS ===

        // Crypto symbols scattered around (decorative)
        const cryptoSymbols = ['₿', '◆', '⬡', '◈', '⟠'];
        const decorPositions = [
            {x: 50, y: 580}, {x: 950, y: 200}, {x: 980, y: 450},
            {x: 30, y: 250}, {x: 1020, y: 580}, {x: 70, y: 400}
        ];
        ctx.globalAlpha = 0.15;
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        decorPositions.forEach((pos, i) => {
            ctx.fillStyle = ['#ffd700', '#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#f44336'][i % 6];
            ctx.fillText(cryptoSymbols[i % cryptoSymbols.length], pos.x, pos.y);
        });
        ctx.globalAlpha = 1;

        // Glowing corner accents
        const accentCorners = [
            {x: 15, y: 550, color: '#4caf50'},
            {x: 1070, y: 550, color: '#2196f3'},
            {x: 15, y: 170, color: '#ff9800'},
            {x: 1070, y: 170, color: '#9c27b0'}
        ];
        accentCorners.forEach(ac => {
            ctx.fillStyle = ac.color + '30';
            ctx.beginPath();
            ctx.arc(ac.x, ac.y, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = ac.color + '50';
            ctx.beginPath();
            ctx.arc(ac.x, ac.y, 20, 0, Math.PI * 2);
            ctx.fill();
        });

        // Server rack decorations on sides
        // Left side
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(10, 200, 50, 300);
        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 200, 50, 300);
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#4caf50' : '#2196f3';
            ctx.fillRect(20, 215 + i * 45, 8, 8);
            ctx.fillStyle = '#333';
            ctx.fillRect(35, 210 + i * 45, 15, 35);
        }

        // Right side
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(1040, 200, 50, 300);
        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(1040, 200, 50, 300);
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#ff9800' : '#f44336';
            ctx.fillRect(1050, 215 + i * 45, 8, 8);
            ctx.fillStyle = '#333';
            ctx.fillRect(1065, 210 + i * 45, 15, 35);
        }

        // Draw base platform (static parts)
        const bx = 150, by = 220, bw = 580, bh = 380;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(bx + bw/2, by + bh + 15, bw/2 + 15, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D base
        ctx.fillStyle = '#1a365d';
        ctx.fillRect(bx - 8, by + bh - 15, bw + 16, 35);

        // Platform gradient (cached)
        const platGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
        platGrad.addColorStop(0, '#2c5282');
        platGrad.addColorStop(0.5, '#2b4c7e');
        platGrad.addColorStop(1, '#1a365d');
        ctx.fillStyle = platGrad;
        ctx.fillRect(bx, by, bw, bh);

        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);

        ctx.strokeStyle = '#2b6cb0';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 8, by + 8, bw - 16, bh - 16);

        // Corner gems
        const corners = [[bx, by], [bx + bw - 20, by], [bx, by + bh - 20], [bx + bw - 20, by + bh - 20]];
        for (let [cx, cy] of corners) {
            ctx.fillStyle = '#f6e05e';
            ctx.fillRect(cx + 5, cy + 5, 15, 15);
            ctx.fillStyle = '#ecc94b';
            ctx.fillRect(cx + 7, cy + 7, 11, 11);
        }

        // Title
        ctx.fillStyle = '#f6e05e';
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('★ YOUR BASE ★', bx + bw/2, by - 12);

        // Conveyor static parts (rails, edges - NOT animated stripes)
        const cy = 45, ch = 110;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(20, cy + ch + 8, 1060, 20);

        // Metallic edges (top)
        const edgeGrad = ctx.createLinearGradient(0, cy - 8, 0, cy);
        edgeGrad.addColorStop(0, '#718096');
        edgeGrad.addColorStop(1, '#4a5568');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(20, cy - 8, 1060, 10);

        // Metallic edges (bottom)
        const edgeGrad2 = ctx.createLinearGradient(0, cy + ch, 0, cy + ch + 8);
        edgeGrad2.addColorStop(0, '#4a5568');
        edgeGrad2.addColorStop(1, '#2d3748');
        ctx.fillStyle = edgeGrad2;
        ctx.fillRect(20, cy + ch - 2, 1060, 10);

        // Side pillars
        this.drawPillarToCtx(ctx, 5, cy - 15, 20, ch + 35);
        this.drawPillarToCtx(ctx, 1075, cy - 15, 20, ch + 35);

        // Label
        ctx.fillStyle = '#a0aec0';
        ctx.font = 'bold 12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('◄◄ CONVEYOR - BUY WITH [E] ◄◄', 550, cy - 18);

        // Bottom decorative bar
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(70, 630, 960, 40);
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 2;
        ctx.strokeRect(70, 630, 960, 40);

        // Status lights on bottom bar
        for (let i = 0; i < 15; i++) {
            ctx.fillStyle = i % 3 === 0 ? '#4caf50' : (i % 3 === 1 ? '#ffd700' : '#2196f3');
            ctx.beginPath();
            ctx.arc(100 + i * 60, 650, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        this.staticCacheValid = true;
    }

    drawPillarToCtx(ctx, x, y, w, h) {
        const grad = ctx.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0, '#4a5568');
        grad.addColorStop(0.5, '#718096');
        grad.addColorStop(1, '#4a5568');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
    }

    getRandomRarity() {
        let luckyBonus = this.upgrades.luckyRolls.level * this.upgrades.luckyRolls.effect;
        if (this.boosters.lucky2x.active) luckyBonus *= 2; // Lucky booster doubles luck
        if (this.isVIP) luckyBonus *= 1.3; // VIP gets 30% more luck

        const roll = Math.random() * 100;
        let cumulative = 0;

        const adjustedRarities = {};
        let commonReduction = 0;
        for (let [name, data] of Object.entries(this.rarities)) {
            if (name !== 'common') {
                const bonus = Math.min(data.chance * 0.5, luckyBonus * (data.chance / 10));
                adjustedRarities[name] = data.chance + bonus;
                commonReduction += bonus;
            }
        }
        adjustedRarities['common'] = Math.max(20, this.rarities.common.chance - commonReduction);

        for (let [name, data] of Object.entries(this.rarities)) {
            cumulative += adjustedRarities[name] || data.chance;
            if (roll < cumulative) return name;
        }
        return 'common';
    }

    getRandomCoinType() {
        // Weighted by player progress
        const maxAffordable = this.coinTypes.filter(c => c.basePrice <= this.money * 5 || c.tier === 1);
        const pool = maxAffordable.length > 0 ? maxAffordable : this.coinTypes.slice(0, 3);
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getRandomMutation() {
        const mutationChance = this.upgrades.mutationChance.level * this.upgrades.mutationChance.effect;
        const roll = Math.random() * 100;

        if (roll > mutationChance + 1.2) return null; // Base 1.2% + upgrades (rare!)

        let cumulative = 0;
        for (let [name, data] of Object.entries(this.mutations)) {
            cumulative += data.chance * (1 + mutationChance / 5);
            if (roll < cumulative) return name;
        }
        return null;
    }

    createItem(x, y) {
        const type = this.getRandomCoinType();
        const rarity = this.getRandomRarity();
        const mutation = this.getRandomMutation();
        const rarityData = this.rarities[rarity];
        const mutationData = mutation ? this.mutations[mutation] : null;

        const discount = Math.max(0.5, 1 - (this.upgrades.cheaperCoins.level * this.upgrades.cheaperCoins.effect)); // Min 50% of original price (max 50% discount)
        const incomeBoost = 1 + (this.upgrades.incomeBoost.level * this.upgrades.incomeBoost.effect);

        let basePrice = Math.floor(type.basePrice * rarityData.priceMultiplier * discount);
        let baseIncome = Math.floor(type.baseIncome * rarityData.multiplier * incomeBoost * this.rebirthMultiplier);

        if (mutationData) {
            basePrice = Math.floor(basePrice * mutationData.priceMultiplier);
            baseIncome = Math.floor(baseIncome * mutationData.incomeMultiplier);
        }

        return {
            x, y,
            icon: type.icon,
            name: type.name,
            rarity: rarity,
            mutation: mutation,
            color: mutationData ? mutationData.color : rarityData.color,
            glow: mutationData ? mutationData.glow : rarityData.glow,
            border: rarityData.border,
            income: Math.max(1, baseIncome),
            price: Math.max(1, basePrice),
            sellPrice: Math.floor(Math.max(1, basePrice) * 0.5),
            level: 1,
            animOffset: Math.random() * Math.PI * 2,
            rainbowOffset: Math.random() * Math.PI * 2
        };
    }

    spawnConveyorItem(x = null) {
        const item = this.createItem(x || 1150, 100);
        this.conveyor.items.push(item);
    }

    interact() {
        const px = this.player.x + this.player.size / 2;
        const py = this.player.y + this.player.size / 2;

        if (this.player.heldItem) {
            if (this.isNearSellZone(px, py)) {
                const sellPrice = this.player.heldItem.sellPrice * this.player.heldItem.level;
                this.money += sellPrice;
                this.lifetimeEarnings += sellPrice;
                this.totalSold++;
                this.addFloatingText(this.sellZone.x + this.sellZone.width/2, this.sellZone.y, '+$' + this.formatNum(sellPrice), '#4caf50');
                this.spawnSellParticles(this.sellZone.x + this.sellZone.width/2, this.sellZone.y + this.sellZone.height/2);
                this.playSound(300, 500);
                this.player.heldItem = null;
                this.updateHUD();
                this.saveGame();
                return;
            }

            // Only interact with pedestals on current floor
            const currentFloorPeds = this.getCurrentFloorPedestals();
            for (let ped of currentFloorPeds) {
                if (!ped.unlocked) continue;
                const dist = this.dist(px, py, ped.x + ped.width/2, ped.y + ped.height/2);
                if (dist < 70) {
                    if (!ped.item) {
                        ped.item = this.player.heldItem;
                        this.player.heldItem = null;
                        this.calcIncome();
                        this.playSound(500, 700);
                        this.saveGame();
                        return;
                    } else if (ped.item.name === this.player.heldItem.name &&
                               ped.item.rarity === this.player.heldItem.rarity &&
                               ped.item.mutation === this.player.heldItem.mutation) {
                        ped.item.level++;
                        ped.item.income = Math.floor(ped.item.income * 1.6);
                        ped.item.sellPrice = Math.floor(ped.item.sellPrice * 1.4);
                        this.player.heldItem = null;
                        this.totalMerges++;
                        this.calcIncome();
                        this.addFloatingText(ped.x + ped.width/2, ped.y - 20, 'LEVEL ' + ped.item.level + '!', '#ffeb3b');
                        this.spawnMergeExplosion(ped.x + ped.width/2, ped.y + ped.height/2, ped.item);
                        this.playSound(600, 1000);
                        this.saveGame();
                        return;
                    } else {
                        const temp = ped.item;
                        ped.item = this.player.heldItem;
                        this.player.heldItem = temp;
                        this.calcIncome();
                        this.playSound(400, 500);
                        return;
                    }
                }
            }
            return;
        }

        for (let i = this.conveyor.items.length - 1; i >= 0; i--) {
            const item = this.conveyor.items[i];
            const dist = this.dist(px, py, item.x, item.y);
            if (dist < 65) {
                if (this.money >= item.price) {
                    this.money -= item.price;
                    this.player.heldItem = item;
                    this.conveyor.items.splice(i, 1);
                    this.addFloatingText(item.x, item.y - 30, '-$' + this.formatNum(item.price), '#f44336');
                    this.playSound(400, 600);
                    this.updateHUD();
                } else {
                    this.addFloatingText(px, py - 50, 'Need $' + this.formatNum(item.price) + '!', '#f44336');
                    this.playSound(150, 100);
                }
                return;
            }
        }

        // Only interact with pedestals on current floor
        const currentFloorPedsPickup = this.getCurrentFloorPedestals();
        for (let ped of currentFloorPedsPickup) {
            if (!ped.unlocked) continue;
            if (ped.item) {
                const dist = this.dist(px, py, ped.x + ped.width/2, ped.y + ped.height/2);
                if (dist < 70) {
                    this.player.heldItem = ped.item;
                    ped.item = null;
                    this.calcIncome();
                    this.playSound(350, 450);
                    return;
                }
            }
        }
    }

    isNearSellZone(px, py) {
        const sz = this.sellZone;
        return px > sz.x && px < sz.x + sz.width && py > sz.y && py < sz.y + sz.height + 50;
    }

    calcIncome() {
        this.totalIncome = 0;
        for (let ped of this.pedestals) {
            if (ped.item && ped.unlocked) this.totalIncome += ped.item.income;
        }
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('money').textContent = this.formatNum(Math.floor(this.money));
        document.getElementById('income').textContent = this.formatNum(this.totalIncome);
    }

    formatNum(n) {
        if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toString();
    }

    dist(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    addFloatingText(x, y, text, color) {
        this.floatingTexts.push({ x, y, text, color, life: 1200, maxLife: 1200 });
    }

    spawnSellParticles(x, y) {
        // Limit particles to prevent performance issues
        if (this.particles.length > 50) return;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4 - 2,
                color: '#4caf50',
                size: 6,
                life: 500
            });
        }
    }

    spawnMergeParticles(x, y) {
        if (this.particles.length > 40) return;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                color: '#ffeb3b',
                size: 6,
                life: 500
            });
        }
        // Limit sparkles too
        if (this.sparkles.length < 15) {
            for (let i = 0; i < 3; i++) {
                this.sparkles.push({
                    x: x + (Math.random() - 0.5) * 40,
                    y: y + (Math.random() - 0.5) * 40,
                    size: Math.random() * 8 + 4,
                    life: 350,
                    color: '#fff'
                });
            }
        }
    }

    // Explosion effect for merge
    spawnMergeExplosion(x, y, item) {
        if (this.particles.length > 60) return;

        const isRainbow = item.mutation === 'rainbow';
        const itemColor = isRainbow ? '#ff00ff' : (item.color || '#ffeb3b');
        const glowColor = item.glow || '#fff';

        // Ring of particles expanding outward (explosion effect)
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 / 10) * i;
            const speed = 6 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: itemColor,
                size: 8 + Math.random() * 4,
                life: 600
            });
        }

        // Inner burst particles
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                color: glowColor,
                size: 5 + Math.random() * 3,
                life: 400
            });
        }

        // Sparkle stars
        if (this.sparkles.length < 20) {
            for (let i = 0; i < 5; i++) {
                this.sparkles.push({
                    x: x + (Math.random() - 0.5) * 80,
                    y: y + (Math.random() - 0.5) * 80,
                    size: Math.random() * 12 + 6,
                    life: 500,
                    color: '#fff'
                });
            }
        }

        // Shockwave effect (stored separately)
        if (!this.shockwaves) this.shockwaves = [];
        this.shockwaves.push({
            x, y,
            radius: 10,
            maxRadius: 80,
            life: 400,
            color: itemColor
        });
    }

    spawnIncomeParticle(x, y, income) {
        // Limit text particles
        if (this.particles.length > 40) return;
        this.particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y,
            vx: 0,
            vy: -1.5,
            text: '+$' + this.formatNum(income),
            color: '#4caf50',
            size: 0,
            life: 600
        });
    }

    playSound(startFreq, endFreq) {
        if (!this.soundEnabled) return;
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch(e) {}
    }

    buyUpgrade(key) {
        const upg = this.upgrades[key];
        const cost = Math.floor(upg.baseCost * Math.pow(upg.costMult, upg.level));
        if (this.money >= cost) {
            this.money -= cost;
            upg.level++;
            this.playSound(500, 800);
            this.addFloatingText(this.player.x + 25, this.player.y - 30, upg.name + ' UP!', '#ffd700');
            this.updateHUD();
            this.calcIncome();
            this.saveGame();
        } else {
            this.playSound(150, 100);
        }
    }

    buySlot() {
        if (this.unlockedSlots >= this.maxSlots) {
            this.addFloatingText(450, 300, 'Max slots! Do Rebirth for more!', '#ff9800');
            this.playSound(150, 100);
            return;
        }
        const cost = this.slotPrices[this.unlockedSlots];
        if (this.money >= cost) {
            this.money -= cost;
            this.unlockedSlots++;
            this.pedestals[this.unlockedSlots - 1].unlocked = true;
            this.playSound(600, 1200);
            this.addFloatingText(450, 300, 'SLOT ' + this.unlockedSlots + ' UNLOCKED!', '#4caf50');
            this.updateHUD();
            this.saveGame();
        } else {
            this.playSound(150, 100);
        }
    }

    canRebirth() {
        // Need 10 slots unlocked and specific amount
        const requiredSlots = 10 + this.rebirthLevel * 2; // 10, 12, 14... for each rebirth
        if (this.unlockedSlots < requiredSlots) return false;
        const requiredMoney = 50000000 * Math.pow(10, this.rebirthLevel);
        return this.lifetimeEarnings >= requiredMoney;
    }

    getRebirthRequirement() {
        return 50000000 * Math.pow(10, this.rebirthLevel);
    }

    getRebirthSlotRequirement() {
        return 10 + this.rebirthLevel * 2;
    }

    doRebirth() {
        if (!this.canRebirth()) {
            this.playSound(150, 100);
            return;
        }

        this.rebirthLevel++;
        this.rebirthMultiplier = 1 + this.rebirthLevel * 1.0; // +100% per rebirth
        // maxSlots stays at 36, but more floors unlock with progression

        // Reset progress
        this.money = 100;
        this.lifetimeEarnings = 0;
        this.totalMerges = 0;
        this.totalSold = 0;
        this.unlockedSlots = 1;

        for (let key in this.upgrades) {
            this.upgrades[key].level = 0;
        }

        this.setupPedestals();
        this.conveyor.items = [];
        this.player.heldItem = null;
        this.totalIncome = 0;

        this.spawnConveyorItem(700);
        this.spawnConveyorItem(900);

        this.addFloatingText(550, 350, '★ REBIRTH ' + this.rebirthLevel + '! ★', '#ff00ff');
        this.playSound(200, 1500);
        this.rebirthOpen = false;
        this.updateHUD();
        this.saveGame();
    }

    async handleDonateAction(action, key) {
        // Use Web3 if connected, otherwise simulate for demo
        const useWeb3 = this.web3 && this.web3.isConnected;

        switch (action) {
            case 'booster':
                if (this.boosters[key].active) {
                    this.addFloatingText(550, 350, 'Already active!', '#ff0000');
                    this.playSound(150, 100);
                    return;
                }
                if (useWeb3) {
                    await this.web3.buyBooster(key);
                } else {
                    // Demo mode
                    this.boosters[key].active = true;
                    this.boosters[key].endTime = Date.now() + 60 * 60 * 1000;
                    this.addFloatingText(550, 320, '[DEMO] BOOSTER ACTIVATED', '#4caf50');
                    this.playSound(600, 300);
                    this.saveGame();
                }
                break;

            case 'instantSlot':
                if (this.unlockedSlots >= this.maxSlots) {
                    this.addFloatingText(550, 350, 'All slots unlocked!', '#ff0000');
                    this.playSound(150, 100);
                    return;
                }
                if (useWeb3) {
                    await this.web3.buyInstantSlot();
                } else {
                    this.unlockedSlots++;
                    this.pedestals[this.unlockedSlots - 1].unlocked = true;
                    this.addFloatingText(550, 320, '[DEMO] SLOT UNLOCKED', '#ff9800');
                    this.playSound(500, 200);
                    this.updateHUD();
                    this.saveGame();
                }
                break;

            case 'instantRebirth':
                if (useWeb3) {
                    await this.web3.buyInstantRebirth();
                } else {
                    this.rebirthLevel++;
                    this.rebirthMultiplier = 1 + this.rebirthLevel * 1.0;
                    this.money = 100;
                    this.lifetimeEarnings = 0;
                    this.totalMerges = 0;
                    this.totalSold = 0;
                    this.unlockedSlots = 1;
                    for (let k in this.upgrades) {
                        this.upgrades[k].level = 0;
                    }
                    this.setupPedestals();
                    this.conveyor.items = [];
                    this.player.heldItem = null;
                    this.totalIncome = 0;
                    this.spawnConveyorItem(700);
                    this.spawnConveyorItem(900);
                    this.addFloatingText(550, 350, '[DEMO] REBIRTH ' + this.rebirthLevel, '#ff00ff');
                    this.playSound(700, 500);
                    this.updateHUD();
                    this.saveGame();
                }
                break;

            case 'buyVIP':
                if (this.isVIP) {
                    this.addFloatingText(550, 350, 'Already VIP!', '#ffd700');
                    return;
                }
                if (useWeb3) {
                    await this.web3.buyVIP();
                } else {
                    this.isVIP = true;
                    this.addFloatingText(550, 320, '[DEMO] VIP ACTIVATED', '#ffd700');
                    this.playSound(800, 800);
                    this.saveGame();
                }
                break;
        }
    }

    update(dt) {
        this.animTime += dt;

        // Update boosters
        const now = Date.now();
        for (let key in this.boosters) {
            if (this.boosters[key].active && now > this.boosters[key].endTime) {
                this.boosters[key].active = false;
            }
        }

        // Apply spawn rate upgrade (reduces interval) + booster
        const spawnRateBonus = 1 - (this.upgrades.spawnRate.level * this.upgrades.spawnRate.effect);
        let actualSpawnInterval = this.conveyor.spawnInterval * Math.max(0.3, spawnRateBonus);
        if (this.boosters.spawn2x.active) actualSpawnInterval *= 0.5; // 2x faster spawn
        if (this.isVIP) actualSpawnInterval *= 0.8; // VIP gets 20% faster

        this.conveyor.spawnTimer += dt;
        if (this.conveyor.spawnTimer >= actualSpawnInterval) {
            this.conveyor.spawnTimer = 0;
            this.spawnConveyorItem();
        }

        // Conveyor speed is now constant (upgrade removed from affecting mob speed)
        for (let i = this.conveyor.items.length - 1; i >= 0; i--) {
            this.conveyor.items[i].x -= this.conveyor.speed;
            if (this.conveyor.items[i].x < -60) {
                this.conveyor.items.splice(i, 1);
            }
        }

        let dx = 0, dy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy = -1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy = 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx = -1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx = 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            this.player.x += (dx / len) * this.player.speed;
            this.player.y += (dy / len) * this.player.speed;
        }

        this.player.x = Math.max(70, Math.min(1000, this.player.x));
        this.player.y = Math.max(50, Math.min(610, this.player.y));

        this.incomeTimer += dt;
        if (this.incomeTimer >= 1000) {
            this.incomeTimer = 0;
            if (this.totalIncome > 0) {
                let incomeMultiplier = 1;
                if (this.boosters.income2x.active) incomeMultiplier *= 2;
                if (this.isVIP) incomeMultiplier *= 1.5; // VIP gets 50% more income

                const actualIncome = Math.floor(this.totalIncome * incomeMultiplier);
                this.money += actualIncome;
                this.lifetimeEarnings += actualIncome;
                this.updateHUD();
                for (let ped of this.pedestals) {
                    if (ped.item && ped.unlocked) {
                        this.spawnIncomeParticle(ped.x + ped.width/2, ped.y, Math.floor(ped.item.income * incomeMultiplier));
                    }
                }
            }
        }

        this.saveTimer = (this.saveTimer || 0) + dt;
        if (this.saveTimer >= 30000) {
            this.saveTimer = 0;
            this.saveGame();
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            if (p.vy !== undefined && !p.text) p.vy += 0.15;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            this.sparkles[i].life -= dt;
            if (this.sparkles[i].life <= 0) this.sparkles.splice(i, 1);
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y -= 0.8;
            t.life -= dt;
            if (t.life <= 0) this.floatingTexts.splice(i, 1);
        }

        // Update shockwaves
        if (this.shockwaves) {
            for (let i = this.shockwaves.length - 1; i >= 0; i--) {
                const sw = this.shockwaves[i];
                sw.radius += (sw.maxRadius - sw.radius) * 0.15;
                sw.life -= dt;
                if (sw.life <= 0) this.shockwaves.splice(i, 1);
            }
        }
    }

    render() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // Cache background gradient
        if (!this.cachedGradients.bg || this.cachedGradients.bgH !== H) {
            this.cachedGradients.bg = ctx.createLinearGradient(0, 0, 0, H);
            this.cachedGradients.bg.addColorStop(0, '#0d1b2a');
            this.cachedGradients.bg.addColorStop(1, '#1b263b');
            this.cachedGradients.bgH = H;
        }
        ctx.fillStyle = this.cachedGradients.bg;
        ctx.fillRect(0, 0, W, H);

        const offsetX = (W - 1100) / 2;
        const offsetY = (H - 700) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);

        // Use cached static elements instead of redrawing
        if (!this.staticCacheValid) {
            this.createStaticCache();
        }
        ctx.drawImage(this.staticCache, 0, 0);

        // Draw only dynamic parts
        this.drawConveyorBelt(ctx); // Only animated stripes
        this.drawSellZone(ctx);
        this.drawPedestals(ctx);
        this.drawPlayer(ctx);
        this.drawShockwaves(ctx);
        this.drawParticles(ctx);
        this.drawSparkles(ctx);
        this.drawFloatingTexts(ctx);
        this.drawFloorIndicator(ctx);

        ctx.restore();

        this.drawUIOverlays(ctx);
    }

    getRainbowColor(offset) {
        const time = this.animTime / 500 + offset;
        const r = Math.sin(time) * 127 + 128;
        const g = Math.sin(time + 2) * 127 + 128;
        const b = Math.sin(time + 4) * 127 + 128;
        return `rgb(${r|0},${g|0},${b|0})`; // Faster than Math.floor
    }

    // Optimized: Only draw animated conveyor stripes + items
    drawConveyorBelt(ctx) {
        const y = 45;
        const h = 110;

        // Belt body (gradient cached would be better, but it's small)
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(20, y, 1060, h);

        // Animated stripes only
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 4;
        const offset = (this.animTime / 15) % 50;
        for (let i = -2; i < 25; i++) {
            const lx = 20 + i * 50 - offset;
            ctx.beginPath();
            ctx.moveTo(lx, y);
            ctx.lineTo(lx - 25, y + h);
            ctx.stroke();
        }

        // Draw conveyor items
        for (let item of this.conveyor.items) {
            this.drawConveyorItem(ctx, item);
        }
    }

    drawConveyorItem(ctx, item) {
        const time = this.animTime / 1000;
        const bob = Math.sin(time * 4 + item.animOffset) * 5;
        const y = item.y + bob;

        const isRainbow = item.mutation === 'rainbow';
        const itemColor = isRainbow ? this.getRainbowColor(item.rainbowOffset) : item.color;
        const glowColor = isRainbow ? this.getRainbowColor(item.rainbowOffset + 1) : item.glow;

        // OPTIMIZED: Replace shadowBlur with concentric circles (much faster)
        if (item.mutation) {
            // Outer glow layers (3 circles instead of shadowBlur)
            ctx.fillStyle = glowColor + '15';
            ctx.beginPath();
            ctx.arc(item.x, y, 42, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = glowColor + '25';
            ctx.beginPath();
            ctx.arc(item.x, y, 38, 0, Math.PI * 2);
            ctx.fill();
        }

        // Main glow
        ctx.fillStyle = glowColor + '40';
        ctx.beginPath();
        ctx.arc(item.x, y, 35, 0, Math.PI * 2);
        ctx.fill();

        // Rarity ring
        ctx.strokeStyle = itemColor;
        ctx.lineWidth = item.mutation ? 6 : 5;
        ctx.beginPath();
        ctx.arc(item.x, y, 26, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fill
        ctx.fillStyle = item.border + '80';
        ctx.beginPath();
        ctx.arc(item.x, y, 22, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, item.x, y);

        // Price tag
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(item.x - 32, y + 30, 64, 18);
        ctx.fillStyle = this.money >= item.price ? '#f6e05e' : '#fc8181';
        ctx.font = 'bold 8px "Press Start 2P"';
        ctx.fillText('$' + this.formatNum(item.price), item.x, y + 40);

        // Income display
        ctx.fillStyle = '#68d391';
        ctx.font = 'bold 7px "Press Start 2P"';
        ctx.fillText('+$' + this.formatNum(item.income) + '/s', item.x, y + 55);

        // Rarity + Mutation
        let label = item.rarity.toUpperCase();
        if (item.mutation) {
            label = this.mutations[item.mutation].name;
        }
        ctx.fillStyle = itemColor;
        ctx.font = 'bold 6px "Press Start 2P"';
        ctx.fillText(label, item.x, y + 68);
    }

    drawItem(ctx, x, y, item) {
        const time = this.animTime / 1000;
        const bob = Math.sin(time * 3 + item.animOffset) * 3;
        const actualY = y + bob;

        const isRainbow = item.mutation === 'rainbow';
        const itemColor = isRainbow ? this.getRainbowColor(item.rainbowOffset) : item.color;
        const glowColor = isRainbow ? this.getRainbowColor(item.rainbowOffset + 1) : item.glow;

        // OPTIMIZED: Concentric circles instead of shadowBlur
        if (item.mutation) {
            ctx.fillStyle = glowColor + '12';
            ctx.beginPath();
            ctx.arc(x, actualY, 38, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = glowColor + '20';
            ctx.beginPath();
            ctx.arc(x, actualY, 34, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = glowColor + '35';
        ctx.beginPath();
        ctx.arc(x, actualY, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = itemColor;
        ctx.lineWidth = item.mutation ? 5 : 4;
        ctx.beginPath();
        ctx.arc(x, actualY, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = item.border + '60';
        ctx.beginPath();
        ctx.arc(x, actualY, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '26px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, x, actualY);

        if (item.level > 1) {
            ctx.fillStyle = '#f6e05e';
            ctx.beginPath();
            ctx.arc(x + 22, actualY - 18, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#744210';
            ctx.font = 'bold 9px Arial';
            ctx.fillText(item.level, x + 22, actualY - 17);
        }

        ctx.fillStyle = '#68d391';
        ctx.font = 'bold 7px "Press Start 2P"';
        ctx.textBaseline = 'top';
        ctx.fillText('+$' + this.formatNum(item.income) + '/s', x, actualY + 28);

        let label = item.rarity.toUpperCase();
        if (item.mutation) {
            label = this.mutations[item.mutation].name;
        }
        ctx.fillStyle = itemColor;
        ctx.font = 'bold 5px "Press Start 2P"';
        ctx.fillText(label, x, actualY + 40);
    }

    drawSparkles(ctx) {
        if (this.sparkles.length === 0) return;

        const rot = this.animTime / 100;
        const cos0 = Math.cos(rot) , sin0 = Math.sin(rot);
        const cos90 = Math.cos(rot + Math.PI/2), sin90 = Math.sin(rot + Math.PI/2);

        ctx.lineWidth = 2;
        for (let s of this.sparkles) {
            const alpha = s.life / 400;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = s.color;

            // Draw rotated cross without save/restore
            ctx.beginPath();
            ctx.moveTo(s.x - cos0 * s.size, s.y - sin0 * s.size);
            ctx.lineTo(s.x + cos0 * s.size, s.y + sin0 * s.size);
            ctx.moveTo(s.x - cos90 * s.size, s.y - sin90 * s.size);
            ctx.lineTo(s.x + cos90 * s.size, s.y + sin90 * s.size);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    drawUIOverlays(ctx) {
        const W = this.canvas.width;
        const H = this.canvas.height;

        ctx.fillStyle = this.soundEnabled ? '#4caf50' : '#666';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'right';
        ctx.fillText('[M] Sound: ' + (this.soundEnabled ? 'ON' : 'OFF'), W - 20, 30);

        if (this.rebirthLevel > 0) {
            ctx.fillStyle = '#ff00ff';
            ctx.fillText('★ Rebirth ' + this.rebirthLevel + ' (x' + this.rebirthMultiplier.toFixed(1) + ')', W - 20, 50);
        }

        ctx.fillStyle = '#68d391';
        ctx.fillText('Slots: ' + this.unlockedSlots + '/' + this.maxSlots, W - 20, 70);

        ctx.fillStyle = '#4299e1';
        ctx.fillText('Floor: ' + this.currentFloor + '/3', W - 20, 90);

        ctx.fillStyle = '#888';
        ctx.font = '9px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('[TAB] Shop | [Q] Stats | [R] Rebirth | [C] Collection | [P] Premium | [1-3] Floors', 20, H - 60);

        // Active boosters display
        this.drawActiveBuffs(ctx, W);

        if (this.shopOpen) this.drawShopPanel(ctx, W, H);
        if (this.statsOpen) this.drawStatsPanel(ctx, W, H);
        if (this.rebirthOpen) this.drawRebirthPanel(ctx, W, H);
        if (this.collectionOpen) this.drawCollectionPanel(ctx, W, H);
        if (this.donateShopOpen) this.drawDonateShopPanel(ctx, W, H);
    }

    drawActiveBuffs(ctx, W) {
        let buffY = 110;

        if (this.isVIP) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 10px "Press Start 2P"';
            ctx.textAlign = 'right';
            ctx.fillText('★ VIP ACTIVE ★', W - 20, buffY);
            buffY += 18;
        }

        const now = Date.now();
        if (this.boosters.income2x.active) {
            const remaining = Math.ceil((this.boosters.income2x.endTime - now) / 60000);
            ctx.fillStyle = '#4caf50';
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText('x2 INCOME ' + remaining + 'm', W - 20, buffY);
            buffY += 15;
        }
        if (this.boosters.spawn2x.active) {
            const remaining = Math.ceil((this.boosters.spawn2x.endTime - now) / 60000);
            ctx.fillStyle = '#2196f3';
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText('x2 SPAWN ' + remaining + 'm', W - 20, buffY);
            buffY += 15;
        }
        if (this.boosters.lucky2x.active) {
            const remaining = Math.ceil((this.boosters.lucky2x.endTime - now) / 60000);
            ctx.fillStyle = '#9c27b0';
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText('x2 LUCK ' + remaining + 'm', W - 20, buffY);
        }
    }

    drawDonateShopPanel(ctx, W, H) {
        const panelW = 450;
        const panelH = 400;
        const panelX = (W - panelW) / 2;
        const panelY = (H - panelH) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.97)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('★ PREMIUM SHOP ★', panelX + panelW/2, panelY + 25);

        // VIP Section
        ctx.fillStyle = this.isVIP ? '#4caf50' : '#fff';
        ctx.font = 'bold 10px "Press Start 2P"';
        ctx.fillText(this.isVIP ? '✓ VIP ACTIVE' : 'VIP STATUS', panelX + panelW/2, panelY + 55);

        ctx.fillStyle = '#aaa';
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText('+50% income, +20% spawn, +30% luck', panelX + panelW/2, panelY + 72);

        if (!this.isVIP) {
            ctx.fillStyle = '#4caf50';
            ctx.font = 'bold 9px "Press Start 2P"';
            ctx.fillText(this.ethPrices.vip + ' ETH (Permanent)', panelX + panelW/2, panelY + 90);
        }

        // Boosters Section
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('BOOSTERS (1 hour):', panelX + 20, panelY + 125);

        const boosters = [
            { key: 'income2x', name: 'x2 Income', price: this.ethPrices.incomeBoost2x, color: '#4caf50', y: 150 },
            { key: 'spawn2x', name: 'x2 Spawn Rate', price: this.ethPrices.spawnBoost2x, color: '#2196f3', y: 185 },
            { key: 'lucky2x', name: 'x2 Luck', price: this.ethPrices.luckyBoost, color: '#9c27b0', y: 220 }
        ];

        this.donateButtons = [];

        boosters.forEach(b => {
            const isActive = this.boosters[b.key].active;
            const btnX = panelX + 20;
            const btnY = panelY + b.y;
            const btnW = panelW - 40;
            const btnH = 28;

            this.donateButtons.push({ x: btnX, y: btnY, w: btnW, h: btnH, action: 'booster', key: b.key });

            ctx.fillStyle = isActive ? '#1a3a1a' : '#1a1a2e';
            ctx.fillRect(btnX, btnY, btnW, btnH);
            ctx.strokeStyle = isActive ? '#4caf50' : b.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(btnX, btnY, btnW, btnH);

            ctx.fillStyle = isActive ? '#4caf50' : '#fff';
            ctx.font = '9px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(b.name + (isActive ? ' (ACTIVE)' : ''), btnX + 10, btnY + 18);

            if (!isActive) {
                ctx.fillStyle = '#ffd700';
                ctx.textAlign = 'right';
                ctx.fillText(b.price + ' ETH', btnX + btnW - 10, btnY + 18);
            }
        });

        // Instant purchases
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('INSTANT PURCHASES:', panelX + 20, panelY + 270);

        // Instant slot
        const slotBtnY = panelY + 285;
        this.donateButtons.push({ x: panelX + 20, y: slotBtnY, w: panelW - 40, h: 28, action: 'instantSlot' });

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(panelX + 20, slotBtnY, panelW - 40, 28);
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 20, slotBtnY, panelW - 40, 28);

        ctx.fillStyle = '#fff';
        ctx.font = '9px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('Unlock Next Slot', panelX + 30, slotBtnY + 18);
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'right';
        ctx.fillText(this.ethPrices.slot + ' ETH', panelX + panelW - 30, slotBtnY + 18);

        // Instant rebirth
        const rebirthBtnY = panelY + 320;
        this.donateButtons.push({ x: panelX + 20, y: rebirthBtnY, w: panelW - 40, h: 28, action: 'instantRebirth' });

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(panelX + 20, rebirthBtnY, panelW - 40, 28);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 20, rebirthBtnY, panelW - 40, 28);

        ctx.fillStyle = '#fff';
        ctx.font = '9px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('Instant Rebirth (skip requirements)', panelX + 30, rebirthBtnY + 18);
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'right';
        ctx.fillText(this.ethPrices.rebirth + ' ETH', panelX + panelW - 30, rebirthBtnY + 18);

        // VIP button
        if (!this.isVIP) {
            const vipBtnY = panelY + 355;
            this.donateButtons.push({ x: panelX + 20, y: vipBtnY, w: panelW - 40, h: 28, action: 'buyVIP' });

            ctx.fillStyle = '#3d2d00';
            ctx.fillRect(panelX + 20, vipBtnY, panelW - 40, 28);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(panelX + 20, vipBtnY, panelW - 40, 28);

            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 9px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('★ BUY VIP - ' + this.ethPrices.vip + ' ETH ★', panelX + panelW/2, vipBtnY + 18);
        }

        ctx.fillStyle = '#666';
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Click to purchase (ETH payments simulated)', panelX + panelW/2, panelY + panelH - 10);
    }

    drawCollectionPanel(ctx, W, H) {
        const panelW = 520;
        const panelH = 480;
        const panelX = (W - panelW) / 2;
        const panelY = (H - panelH) / 2;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.97)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = '#9c27b0';
        ctx.lineWidth = 4;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        // Title
        ctx.fillStyle = '#9c27b0';
        ctx.font = 'bold 14px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('★ COIN COLLECTION ★', panelX + panelW/2, panelY + 25);

        // Column headers
        ctx.fillStyle = '#888';
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('COIN', panelX + 20, panelY + 50);
        ctx.fillText('BASE INCOME', panelX + 140, panelY + 50);
        ctx.fillText('BASE PRICE', panelX + 280, panelY + 50);
        ctx.fillText('TIER', panelX + 420, panelY + 50);

        // Separator line
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(panelX + 15, panelY + 58);
        ctx.lineTo(panelX + panelW - 15, panelY + 58);
        ctx.stroke();

        // Coin list (scrollable, 8 visible)
        const visibleCount = 8;
        const itemH = 45;
        const startIdx = this.collectionScroll;

        for (let i = 0; i < visibleCount && startIdx + i < this.coinTypes.length; i++) {
            const coin = this.coinTypes[startIdx + i];
            const y = panelY + 70 + i * itemH;
            const idx = startIdx + i;

            // Row background
            ctx.fillStyle = idx % 2 === 0 ? '#1a1a2e' : '#151525';
            ctx.fillRect(panelX + 10, y, panelW - 20, itemH - 5);

            // Tier color coding
            const tierColors = ['#9e9e9e', '#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#f44336', '#ff00ff'];
            const tierColor = tierColors[Math.min(coin.tier - 1, tierColors.length - 1)];

            // Icon
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(coin.icon, panelX + 45, y + 28);

            // Name
            ctx.fillStyle = tierColor;
            ctx.font = 'bold 9px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(coin.name, panelX + 75, y + 20);

            // Number
            ctx.fillStyle = '#666';
            ctx.font = '7px "Press Start 2P"';
            ctx.fillText('#' + (idx + 1), panelX + 75, y + 35);

            // Base income
            ctx.fillStyle = '#4caf50';
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText('$' + this.formatNum(coin.baseIncome) + '/s', panelX + 140, y + 25);

            // Base price
            ctx.fillStyle = '#ffd700';
            ctx.fillText('$' + this.formatNum(coin.basePrice), panelX + 280, y + 25);

            // Tier badge
            ctx.fillStyle = tierColor;
            ctx.fillRect(panelX + 420, y + 10, 50, 20);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('T' + coin.tier, panelX + 445, y + 24);
        }

        // Scroll indicator
        if (this.coinTypes.length > visibleCount) {
            ctx.fillStyle = '#666';
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('↑↓ Scroll (' + (this.collectionScroll + 1) + '-' + Math.min(this.collectionScroll + visibleCount, this.coinTypes.length) + ' of ' + this.coinTypes.length + ')', panelX + panelW/2, panelY + panelH - 60);
        }

        // Rarities section (compact layout)
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 8px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('RARITIES:', panelX + 15, panelY + panelH - 40);

        const rarityList = Object.entries(this.rarities);
        let rx = panelX + 15;
        const rarityY = panelY + panelH - 28;
        for (let [name, data] of rarityList) {
            ctx.fillStyle = data.color;
            ctx.font = '5px "Press Start 2P"';
            ctx.fillText(name.substring(0, 4).toUpperCase() + 'x' + data.multiplier, rx, rarityY);
            rx += 80;
        }

        // Mutations section (compact layout)
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 8px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('MUTATIONS:', panelX + 15, panelY + panelH - 12);

        let mx = panelX + 130;
        for (let [name, data] of Object.entries(this.mutations)) {
            const mColor = name === 'rainbow' ? this.getRainbowColor(0) : data.color;
            ctx.fillStyle = mColor;
            ctx.font = '5px "Press Start 2P"';
            ctx.fillText(data.name.substring(0, 4) + 'x' + data.incomeMultiplier, mx, panelY + panelH - 12);
            mx += 85;
        }
    }

    drawShopPanel(ctx, W, H) {
        const panelW = 380;
        const panelH = 420;
        const panelX = (W - panelW) / 2;
        const panelY = (H - panelH) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('★ UPGRADES ★', panelX + panelW/2, panelY + 30);

        this.shopUpgradeBoxes = [];
        let i = 0;
        for (let [key, upg] of Object.entries(this.upgrades)) {
            const y = panelY + 55 + i * 50;
            const cost = Math.floor(upg.baseCost * Math.pow(upg.costMult, upg.level));
            const canAfford = this.money >= cost;

            const box = { x: panelX + 15, y: y, w: panelW - 30, h: 42, key: key };
            this.shopUpgradeBoxes.push(box);

            ctx.fillStyle = canAfford ? '#1a365d' : '#1a1a2e';
            ctx.fillRect(box.x, box.y, box.w, box.h);
            ctx.strokeStyle = canAfford ? '#4299e1' : '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.w, box.h);

            ctx.fillStyle = canAfford ? '#ffd700' : '#666';
            ctx.font = 'bold 12px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText('[' + (i + 1) + ']', panelX + 22, y + 18);

            ctx.fillStyle = canAfford ? '#fff' : '#666';
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText(upg.name + ' Lv.' + upg.level, panelX + 60, y + 16);

            ctx.fillStyle = '#4caf50';
            ctx.font = '7px "Press Start 2P"';
            ctx.fillText(upg.desc, panelX + 60, y + 32);

            ctx.fillStyle = canAfford ? '#ffd700' : '#f44336';
            ctx.textAlign = 'right';
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText('$' + this.formatNum(cost), panelX + panelW - 22, y + 25);

            i++;
        }

        // Slot purchase
        const slotY = panelY + 55 + i * 50;
        const slotCost = (this.unlockedSlots < this.maxSlots && this.slotPrices[this.unlockedSlots] !== undefined) ? this.slotPrices[this.unlockedSlots] : 0;
        const canBuySlot = this.unlockedSlots < this.maxSlots && slotCost > 0 && this.money >= slotCost;

        this.slotBuyBox = { x: panelX + 15, y: slotY, w: panelW - 30, h: 42 };

        ctx.fillStyle = canBuySlot ? '#1a4d1a' : '#1a1a2e';
        ctx.fillRect(this.slotBuyBox.x, this.slotBuyBox.y, this.slotBuyBox.w, this.slotBuyBox.h);
        ctx.strokeStyle = canBuySlot ? '#4caf50' : '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.slotBuyBox.x, this.slotBuyBox.y, this.slotBuyBox.w, this.slotBuyBox.h);

        ctx.fillStyle = canBuySlot ? '#ffd700' : '#666';
        ctx.font = 'bold 12px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('[6]', panelX + 22, slotY + 18);

        ctx.fillStyle = canBuySlot ? '#fff' : '#666';
        ctx.font = '9px "Press Start 2P"';
        const slotText = this.unlockedSlots < this.maxSlots
            ? 'Buy Slot #' + (this.unlockedSlots + 1)
            : 'MAX SLOTS (Rebirth for more)';
        ctx.fillText(slotText, panelX + 60, slotY + 25);

        if (this.unlockedSlots < this.maxSlots && slotCost > 0) {
            ctx.fillStyle = canBuySlot ? '#ffd700' : '#f44336';
            ctx.textAlign = 'right';
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText('$' + this.formatNum(slotCost), panelX + panelW - 22, slotY + 18);

            // ETH option for slot
            ctx.fillStyle = '#4caf50';
            ctx.font = '7px "Press Start 2P"';
            ctx.fillText('or ' + this.ethPrices.slot + ' ETH', panelX + panelW - 22, slotY + 32);
        }

        ctx.fillStyle = '#888';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Click/number to buy | [TAB] close', panelX + panelW/2, panelY + panelH - 12);
    }

    drawStatsPanel(ctx, W, H) {
        const panelW = 340;
        const panelH = 320;
        const panelX = (W - panelW) / 2;
        const panelY = (H - panelH) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 4;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('STATISTICS', panelX + panelW/2, panelY + 30);

        const stats = [
            ['Current Money', '$' + this.formatNum(Math.floor(this.money))],
            ['Income/sec', '$' + this.formatNum(this.totalIncome)],
            ['Lifetime Earned', '$' + this.formatNum(Math.floor(this.lifetimeEarnings))],
            ['Coins Merged', this.totalMerges.toString()],
            ['Coins Sold', this.totalSold.toString()],
            ['Slots Unlocked', this.unlockedSlots + '/' + this.maxSlots],
            ['Rebirth Level', this.rebirthLevel.toString()],
            ['Rebirth Mult', 'x' + this.rebirthMultiplier.toFixed(1)]
        ];

        stats.forEach((stat, i) => {
            const y = panelY + 55 + i * 28;
            ctx.fillStyle = '#aaa';
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(stat[0], panelX + 20, y);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'right';
            ctx.fillText(stat[1], panelX + panelW - 20, y);
        });

        ctx.fillStyle = '#888';
        ctx.font = '9px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('[Q] to close', panelX + panelW/2, panelY + panelH - 12);
    }

    drawRebirthPanel(ctx, W, H) {
        const panelW = 400;
        const panelH = 280;
        const panelX = (W - panelW) / 2;
        const panelY = (H - panelH) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('★ REBIRTH ★', panelX + panelW/2, panelY + 30);

        const required = this.getRebirthRequirement();
        const canRebirth = this.canRebirth();

        ctx.fillStyle = '#fff';
        ctx.font = '9px "Press Start 2P"';
        ctx.fillText('Reset all progress for permanent bonuses!', panelX + panelW/2, panelY + 60);

        ctx.fillStyle = '#ffd700';
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('Next Rebirth Bonus:', panelX + panelW/2, panelY + 95);
        ctx.fillStyle = '#4caf50';
        ctx.fillText('+100% income multiplier', panelX + panelW/2, panelY + 115);
        ctx.fillText('+2 max slot capacity', panelX + panelW/2, panelY + 135);

        ctx.fillStyle = '#aaa';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText('Requirements:', panelX + panelW/2, panelY + 165);

        const requiredSlots = this.getRebirthSlotRequirement();
        ctx.fillStyle = this.unlockedSlots >= requiredSlots ? '#4caf50' : '#f44336';
        ctx.fillText('• ' + requiredSlots + ' slots unlocked: ' + this.unlockedSlots + '/' + requiredSlots, panelX + panelW/2, panelY + 185);

        ctx.fillStyle = this.lifetimeEarnings >= required ? '#4caf50' : '#f44336';
        ctx.fillText('• $' + this.formatNum(required) + ' lifetime: $' + this.formatNum(Math.floor(this.lifetimeEarnings)), panelX + panelW/2, panelY + 195);

        // Free Rebirth button
        const btnW = 140;
        const btnH = 35;
        const btnX = panelX + 30;
        const btnY = panelY + 215;

        this.rebirthButton = { x: btnX, y: btnY, w: btnW, h: btnH };

        ctx.fillStyle = canRebirth ? '#9c27b0' : '#333';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = canRebirth ? '#ff00ff' : '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = canRebirth ? '#fff' : '#666';
        ctx.font = 'bold 9px "Press Start 2P"';
        ctx.fillText('FREE REBIRTH', btnX + btnW/2, btnY + 22);

        // ETH Rebirth button (always available)
        const ethBtnX = panelX + panelW - 30 - btnW;
        ctx.fillStyle = '#1a5d1a';
        ctx.fillRect(ethBtnX, btnY, btnW, btnH);
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 2;
        ctx.strokeRect(ethBtnX, btnY, btnW, btnH);

        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ ' + this.ethPrices.rebirth + ' ETH', ethBtnX + btnW/2, btnY + 14);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px "Press Start 2P"';
        ctx.fillText('INSTANT REBIRTH', ethBtnX + btnW/2, btnY + 28);

        ctx.fillStyle = '#888';
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText('[R] to close', panelX + panelW/2, panelY + panelH - 10);
    }

    drawFloor(ctx) {
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 18; col++) {
                const x = col * 55;
                const y = row * 45;
                const isEven = (row + col) % 2 === 0;
                ctx.fillStyle = isEven ? '#1e3a5f' : '#234567';
                ctx.fillRect(x, y, 55, 45);
                ctx.strokeStyle = '#2d4a6f';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, 55, 45);
            }
        }
    }

    drawConveyor(ctx) {
        const y = 45;
        const h = 80;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(20, y + h + 8, 860, 20);

        const beltGrad = ctx.createLinearGradient(0, y, 0, y + h);
        beltGrad.addColorStop(0, '#4a5568');
        beltGrad.addColorStop(0.3, '#2d3748');
        beltGrad.addColorStop(0.7, '#2d3748');
        beltGrad.addColorStop(1, '#1a202c');
        ctx.fillStyle = beltGrad;
        ctx.fillRect(20, y, 860, h);

        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 4;
        const offset = (this.animTime / 15) % 50;
        for (let i = -2; i < 20; i++) {
            const lx = 20 + i * 50 - offset;
            ctx.beginPath();
            ctx.moveTo(lx, y);
            ctx.lineTo(lx - 20, y + h);
            ctx.stroke();
        }

        const edgeGrad = ctx.createLinearGradient(0, y - 8, 0, y);
        edgeGrad.addColorStop(0, '#718096');
        edgeGrad.addColorStop(1, '#4a5568');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(20, y - 8, 860, 10);

        const edgeGrad2 = ctx.createLinearGradient(0, y + h, 0, y + h + 8);
        edgeGrad2.addColorStop(0, '#4a5568');
        edgeGrad2.addColorStop(1, '#2d3748');
        ctx.fillStyle = edgeGrad2;
        ctx.fillRect(20, y + h - 2, 860, 10);

        this.drawPillar(ctx, 5, y - 15, 20, h + 35);
        this.drawPillar(ctx, 875, y - 15, 20, h + 35);

        ctx.fillStyle = '#a0aec0';
        ctx.font = 'bold 12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('◄ CONVEYOR - BUY WITH [E] ◄', 450, y - 18);

        for (let item of this.conveyor.items) {
            this.drawConveyorItem(ctx, item);
        }
    }

    drawPillar(ctx, x, y, w, h) {
        const grad = ctx.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0, '#4a5568');
        grad.addColorStop(0.5, '#718096');
        grad.addColorStop(1, '#4a5568');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
    }

    drawBase(ctx) {
        const x = 100;
        const y = 175;
        const w = 520;
        const h = 340;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h + 15, w/2 + 15, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a365d';
        ctx.fillRect(x - 8, y + h - 15, w + 16, 35);

        const platGrad = ctx.createLinearGradient(x, y, x, y + h);
        platGrad.addColorStop(0, '#2c5282');
        platGrad.addColorStop(0.5, '#2b4c7e');
        platGrad.addColorStop(1, '#1a365d');
        ctx.fillStyle = platGrad;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        ctx.strokeStyle = '#2b6cb0';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);

        const corners = [[x, y], [x + w - 20, y], [x, y + h - 20], [x + w - 20, y + h - 20]];
        for (let [cx, cy] of corners) {
            ctx.fillStyle = '#f6e05e';
            ctx.fillRect(cx + 5, cy + 5, 15, 15);
            ctx.fillStyle = '#ecc94b';
            ctx.fillRect(cx + 7, cy + 7, 11, 11);
        }

        ctx.fillStyle = '#f6e05e';
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 10;
        ctx.fillText('★ YOUR BASE ★', x + w/2, y - 12);
        ctx.shadowBlur = 0;
    }

    drawSellZone(ctx) {
        const sz = this.sellZone;
        const px = this.player.x + this.player.size/2;
        const py = this.player.y + this.player.size/2;
        const near = this.isNearSellZone(px, py);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(sz.x + sz.width/2, sz.y + sz.height + 10, 55, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a202c';
        ctx.fillRect(sz.x - 5, sz.y + sz.height - 10, sz.width + 10, 25);

        const szGrad = ctx.createLinearGradient(sz.x, sz.y, sz.x, sz.y + sz.height);
        szGrad.addColorStop(0, near ? '#48bb78' : '#38a169');
        szGrad.addColorStop(1, near ? '#38a169' : '#276749');
        ctx.fillStyle = szGrad;
        ctx.fillRect(sz.x, sz.y, sz.width, sz.height);

        ctx.strokeStyle = near ? '#9ae6b4' : '#68d391';
        ctx.lineWidth = near ? 4 : 3;
        ctx.strokeRect(sz.x, sz.y, sz.width, sz.height);

        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💰', sz.x + sz.width/2, sz.y + sz.height/2 - 10);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Press Start 2P"';
        ctx.textBaseline = 'top';
        ctx.fillText('SELL', sz.x + sz.width/2, sz.y + sz.height - 25);

        if (near && this.player.heldItem) {
            ctx.fillStyle = '#f6e05e';
            ctx.font = 'bold 12px "Press Start 2P"';
            ctx.fillText('[E] $' + this.formatNum(this.player.heldItem.sellPrice * this.player.heldItem.level), sz.x + sz.width/2, sz.y - 25);
        }
    }

    drawPedestals(ctx) {
        const px = this.player.x + this.player.size/2;
        const py = this.player.y + this.player.size/2;

        // Only draw pedestals on current floor
        const currentFloorPeds = this.getCurrentFloorPedestals();
        for (let i = 0; i < currentFloorPeds.length; i++) {
            const ped = currentFloorPeds[i];
            const dist = this.dist(px, py, ped.x + ped.width/2, ped.y + ped.height/2);
            const near = dist < 70 && ped.unlocked;

            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.ellipse(ped.x + ped.width/2, ped.y + ped.height + 8, 32, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = ped.unlocked ? (near ? '#4a5568' : '#2d3748') : '#1a1a1a';
            ctx.fillRect(ped.x + 8, ped.y + ped.height - 10, ped.width - 16, 18);

            const pedGrad = ctx.createLinearGradient(ped.x, ped.y, ped.x, ped.y + ped.height);
            if (ped.unlocked) {
                pedGrad.addColorStop(0, near ? '#5a6577' : '#4a5568');
                pedGrad.addColorStop(1, near ? '#4a5568' : '#2d3748');
            } else {
                pedGrad.addColorStop(0, '#2a2a2a');
                pedGrad.addColorStop(1, '#1a1a1a');
            }
            ctx.fillStyle = pedGrad;
            ctx.fillRect(ped.x, ped.y, ped.width, ped.height);

            ctx.strokeStyle = ped.unlocked ? (near ? '#f6e05e' : '#4a5568') : '#333';
            ctx.lineWidth = near ? 3 : 2;
            ctx.strokeRect(ped.x, ped.y, ped.width, ped.height);

            if (!ped.item) {
                ctx.fillStyle = ped.unlocked ? '#2d3748' : '#1a1a1a';
                ctx.beginPath();
                ctx.arc(ped.x + ped.width/2, ped.y + ped.height/2 - 5, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = ped.unlocked ? '#4a5568' : '#333';
                ctx.lineWidth = 2;
                ctx.stroke();

                if (!ped.unlocked) {
                    ctx.fillStyle = '#666';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🔒', ped.x + ped.width/2, ped.y + ped.height/2 - 5);
                }
            }

            ctx.fillStyle = ped.unlocked ? '#718096' : '#444';
            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            // Show slot number within floor (1-12)
            const slotNumOnFloor = (this.pedestals.indexOf(ped) % 12) + 1;
            ctx.fillText('#' + slotNumOnFloor, ped.x + ped.width/2, ped.y + ped.height + 12);

            if (ped.item && ped.unlocked) {
                this.drawItem(ctx, ped.x + ped.width/2, ped.y + ped.height/2 - 12, ped.item);
            } else if (near && this.player.heldItem && ped.unlocked) {
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.font = 'bold 14px "Press Start 2P"';
                ctx.textBaseline = 'middle';
                ctx.fillText('[E]', ped.x + ped.width/2, ped.y + ped.height/2);
            }
        }
    }

    drawPlayer(ctx) {
        const p = this.player;
        const cx = p.x + p.size/2;
        const cy = p.y + p.size/2;

        // Shadow (simple, no blur)
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + p.size/2 + 5, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Robot body
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(cx - 16, cy - 5, 32, 35);
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(cx - 14, cy, 28, 25);

        // Body glow line
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(cx - 12, cy + 5, 24, 3);
        ctx.fillStyle = '#00ffff50';
        ctx.fillRect(cx - 10, cy + 12, 20, 2);
        ctx.fillRect(cx - 10, cy + 17, 20, 2);

        // Robot head
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(cx - 14, cy - 28, 28, 24);
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(cx - 12, cy - 26, 24, 20);

        // Visor (eyes)
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(cx - 9, cy - 20, 6, 8);
        ctx.fillRect(cx + 3, cy - 20, 6, 8);

        // Antenna
        ctx.fillStyle = '#718096';
        ctx.fillRect(cx - 2, cy - 35, 4, 8);
        ctx.fillStyle = '#f56565';
        ctx.beginPath();
        ctx.arc(cx, cy - 37, 4, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(cx - 22, cy + 2, 6, 20);
        ctx.fillRect(cx + 16, cy + 2, 6, 20);

        // Label (no shadow for performance)
        ctx.fillStyle = '#000';
        ctx.font = 'bold 9px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('YOU', cx + 1, p.y - 22);
        ctx.fillStyle = '#00ffff';
        ctx.fillText('YOU', cx, p.y - 23);

        if (p.heldItem) {
            const bobY = Math.sin(this.animTime / 120) * 4;
            this.drawItem(ctx, cx, p.y - 60 + bobY, p.heldItem);
        }
    }

    drawParticles(ctx) {
        for (let p of this.particles) {
            const alpha = p.life / 700;
            ctx.globalAlpha = alpha;
            if (p.text) {
                ctx.fillStyle = p.color;
                ctx.font = 'bold 10px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText(p.text, p.x, p.y);
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    drawFloatingTexts(ctx) {
        for (let t of this.floatingTexts) {
            const alpha = t.life / t.maxLife;
            const scale = 0.8 + alpha * 0.4;
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${Math.floor(14 * scale)}px "Press Start 2P"`;
            ctx.textAlign = 'center';
            // Shadow text (no blur for performance)
            ctx.fillStyle = '#000';
            ctx.fillText(t.text, t.x + 1, t.y + 1);
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
        }
        ctx.globalAlpha = 1;
    }

    drawShockwaves(ctx) {
        if (!this.shockwaves || this.shockwaves.length === 0) return;

        for (let sw of this.shockwaves) {
            const alpha = sw.life / 400;
            ctx.globalAlpha = alpha * 0.6;
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = 4 * alpha;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner glow
            ctx.globalAlpha = alpha * 0.3;
            ctx.lineWidth = 8 * alpha;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius * 0.7, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    drawFloorIndicator(ctx) {
        // Floor indicator panel
        const panelX = 760;
        const panelY = 250;
        const panelW = 120;
        const panelH = 140;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = '#4299e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = '#4299e1';
        ctx.font = 'bold 10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('FLOOR', panelX + panelW/2, panelY + 18);

        // Floor buttons
        for (let f = 1; f <= 3; f++) {
            const btnY = panelY + 25 + (f - 1) * 35;
            const isActive = this.currentFloor === f;
            const hasUnlocked = this.pedestals.some(p => p.floor === f && p.unlocked);

            ctx.fillStyle = isActive ? '#4299e1' : (hasUnlocked ? '#2d3748' : '#1a1a1a');
            ctx.fillRect(panelX + 10, btnY, panelW - 20, 30);
            ctx.strokeStyle = isActive ? '#63b3ed' : (hasUnlocked ? '#4a5568' : '#333');
            ctx.lineWidth = isActive ? 3 : 1;
            ctx.strokeRect(panelX + 10, btnY, panelW - 20, 30);

            ctx.fillStyle = isActive ? '#fff' : (hasUnlocked ? '#a0aec0' : '#666');
            ctx.font = 'bold 9px "Press Start 2P"';
            ctx.fillText('[' + f + '] F' + f, panelX + panelW/2, btnY + 20);
        }

        // Slot count on current floor
        const floorPeds = this.getCurrentFloorPedestals();
        const unlockedOnFloor = floorPeds.filter(p => p.unlocked).length;
        const itemsOnFloor = floorPeds.filter(p => p.item).length;

        ctx.fillStyle = '#68d391';
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText(itemsOnFloor + '/' + unlockedOnFloor + ' used', panelX + panelW/2, panelY + panelH - 8);
    }

    saveGame() {
        const saveData = {
            money: this.money,
            lifetimeEarnings: this.lifetimeEarnings,
            totalMerges: this.totalMerges,
            totalSold: this.totalSold,
            rebirthLevel: this.rebirthLevel,
            rebirthMultiplier: this.rebirthMultiplier,
            unlockedSlots: this.unlockedSlots,
            maxSlots: this.maxSlots,
            currentFloor: this.currentFloor,
            soundEnabled: this.soundEnabled,
            lastSaveTime: Date.now(),
            totalIncome: this.totalIncome,
            isVIP: this.isVIP,
            boosters: this.boosters,
            upgrades: {},
            pedestals: []
        };

        for (let key in this.upgrades) {
            saveData.upgrades[key] = this.upgrades[key].level;
        }

        for (let i = 0; i < this.pedestals.length; i++) {
            const ped = this.pedestals[i];
            if (ped.item) {
                saveData.pedestals.push({
                    index: i,
                    item: {
                        icon: ped.item.icon,
                        name: ped.item.name,
                        rarity: ped.item.rarity,
                        mutation: ped.item.mutation,
                        income: ped.item.income,
                        price: ped.item.price,
                        sellPrice: ped.item.sellPrice,
                        level: ped.item.level
                    }
                });
            }
        }

        try {
            localStorage.setItem('stealAShitCoin_save_v2', JSON.stringify(saveData));
        } catch(e) {
            console.log('Save failed:', e);
        }
    }

    loadGame() {
        try {
            const saved = localStorage.getItem('stealAShitCoin_save_v2');
            if (!saved) return;

            const data = JSON.parse(saved);

            this.money = data.money || 100;
            this.lifetimeEarnings = data.lifetimeEarnings || 0;
            this.totalMerges = data.totalMerges || 0;
            this.totalSold = data.totalSold || 0;
            this.rebirthLevel = data.rebirthLevel || 0;
            this.rebirthMultiplier = data.rebirthMultiplier || 1;
            this.unlockedSlots = data.unlockedSlots || 1;
            this.maxSlots = data.maxSlots || 36;
            this.currentFloor = data.currentFloor || 1;
            this.soundEnabled = data.soundEnabled !== false;
            this.isVIP = data.isVIP || false;

            // Restore boosters (check if still active)
            if (data.boosters) {
                const now = Date.now();
                for (let key in data.boosters) {
                    if (this.boosters[key]) {
                        this.boosters[key].active = data.boosters[key].active && now < data.boosters[key].endTime;
                        this.boosters[key].endTime = data.boosters[key].endTime || 0;
                    }
                }
            }

            if (data.upgrades) {
                for (let key in data.upgrades) {
                    if (this.upgrades[key]) {
                        this.upgrades[key].level = data.upgrades[key];
                    }
                }
            }

            this.setupPedestals();

            if (data.pedestals) {
                for (let p of data.pedestals) {
                    if (this.pedestals[p.index]) {
                        const rarityData = this.rarities[p.item.rarity];
                        const mutationData = p.item.mutation ? this.mutations[p.item.mutation] : null;
                        this.pedestals[p.index].item = {
                            x: 0, y: 0,
                            icon: p.item.icon,
                            name: p.item.name,
                            rarity: p.item.rarity,
                            mutation: p.item.mutation,
                            color: mutationData ? mutationData.color : rarityData.color,
                            glow: mutationData ? mutationData.glow : rarityData.glow,
                            border: rarityData.border,
                            income: p.item.income,
                            price: p.item.price,
                            sellPrice: p.item.sellPrice,
                            level: p.item.level,
                            animOffset: Math.random() * Math.PI * 2,
                            rainbowOffset: Math.random() * Math.PI * 2
                        };
                    }
                }
            }

            this.calcIncome();

            document.getElementById('reset-btn').classList.remove('hidden');
            document.getElementById('play-btn').textContent = 'CONTINUE';

            console.log('Game loaded successfully!');
        } catch(e) {
            console.log('Load failed:', e);
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
            localStorage.removeItem('stealAShitCoin_save_v2');
            location.reload();
        }
    }

    loop(time) {
        const dt = time - this.lastTime || 16;
        this.lastTime = time;

        if (!document.getElementById('game-screen').classList.contains('hidden')) {
            this.update(Math.min(dt, 50));
            this.render();
        }

        requestAnimationFrame(t => this.loop(t));
    }
}

window.onload = () => new Game();
