// STEAL A COIN - Yandex Games Edition
// Buy coins, place them, earn income, sell for profit!

// Yandex Games SDK
let ysdk = null;
let yandexPlayer = null;

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
            { icon: '💩', name: 'Poop', baseIncome: 1, basePrice: 10, tier: 1 },
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

        // Optimization: Cached DOM references
        this.domRefs = {};

        // Optimization: Save batching (dirty flag)
        this.saveDirty = false;
        this.lastSaveTime = 0;

        // Optimization: Cached floor pedestals
        this.cachedFloorPedestals = null;
        this.cachedFloorNumber = 0;

        // Optimization: Shockwaves array (init here, not lazily)
        this.shockwaves = [];

        // Optimization: Max effect limits
        this.maxParticles = 40;
        this.maxSparkles = 15;
        this.maxFloatingTexts = 20;

        this.init();
    }

    setupPedestals(preserveGolden = false) {
        const oldPedestals = preserveGolden ? this.pedestals : null;
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
                    const oldPed = oldPedestals ? oldPedestals[index] : null;

                    this.pedestals.push({
                        x: startX + col * spacingX,
                        y: startY + row * spacingY,
                        width: 75,
                        height: 55,
                        floor: floor + 1,
                        item: null,
                        unlocked: index < this.unlockedSlots,
                        golden: oldPed ? oldPed.golden : false,  // Golden slots persist through rebirth
                        frozenItem: null  // Item saved from rebirth, frozen until slot unlocked
                    });
                }
            }
        }
    }

    getCurrentFloorPedestals() {
        // Cache filtered pedestals to avoid recreating array each call
        if (this.cachedFloorNumber !== this.currentFloor || !this.cachedFloorPedestals) {
            this.cachedFloorPedestals = this.pedestals.filter(p => p.floor === this.currentFloor);
            this.cachedFloorNumber = this.currentFloor;
        }
        return this.cachedFloorPedestals;
    }

    switchFloor(floor) {
        if (floor >= 1 && floor <= 3) {
            this.currentFloor = floor;
        }
    }

    init() {
        // Cache DOM references for performance
        this.domRefs = {
            gameScreen: document.getElementById('game-screen'),
            menuScreen: document.getElementById('menu-screen'),
            playBtn: document.getElementById('play-btn'),
            resetBtn: document.getElementById('reset-btn'),
            moneyEl: document.getElementById('money'),
            incomeEl: document.getElementById('income')
        };

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Keyboard
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;

            if (e.code === 'KeyE' && !this.ePressed && !this.shopOpen && !this.statsOpen && !this.rebirthOpen && !this.collectionOpen) {
                this.ePressed = true;
                this.interact();
            }

            if ((e.code === 'KeyE' || e.code === 'Escape') && (this.shopOpen || this.statsOpen || this.rebirthOpen || this.collectionOpen)) {
                this.shopOpen = false;
                this.statsOpen = false;
                this.rebirthOpen = false;
                this.collectionOpen = false;
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
            // G - Watch ad for bonus
            if (e.code === 'KeyG' && !this.shopOpen && !this.statsOpen && !this.rebirthOpen && !this.collectionOpen) {
                this.showRewardedAd();
            }

            // Floor switching (only when no menus open)
            if (!this.shopOpen && !this.statsOpen && !this.rebirthOpen && !this.collectionOpen) {
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

        requestAnimationFrame(t => this.loop(t));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

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
            this.unlockNextSlot();
        } else {
            this.playSound(150, 100);
        }
    }

    // Unlock next slot and unfreeze any frozen item
    unlockNextSlot() {
        if (this.unlockedSlots >= this.maxSlots) return;

        this.unlockedSlots++;
        const ped = this.pedestals[this.unlockedSlots - 1];
        ped.unlocked = true;

        // Unfreeze item if there's one waiting
        if (ped.frozenItem) {
            ped.item = ped.frozenItem;
            ped.frozenItem = null;
            this.addFloatingText(450, 280, 'FROZEN MOB RESTORED!', '#00bcd4');
        }

        this.playSound(600, 1200);
        this.addFloatingText(450, 300, 'SLOT ' + this.unlockedSlots + ' UNLOCKED!', '#4caf50');
        this.calcIncome();
        this.updateHUD();
        this.saveGame();
    }

    // Unlock slot by watching ad (no cost, no requirements)
    unlockSlotWithAd() {
        if (this.unlockedSlots >= this.maxSlots) {
            this.addFloatingText(450, 300, 'All slots unlocked!', '#ff9800');
            this.playSound(150, 100);
            return;
        }

        if (!ysdk) {
            this.addFloatingText(550, 350, 'Ads not available', '#ff0000');
            return;
        }

        ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    this.soundEnabled = false;
                },
                onRewarded: () => {
                    this.unlockNextSlot();
                    this.addFloatingText(450, 250, 'FREE SLOT!', '#ffd700');
                },
                onClose: () => {
                    this.soundEnabled = true;
                },
                onError: (e) => {
                    console.log('Ad error:', e);
                    this.addFloatingText(550, 350, 'Ad not available', '#ff0000');
                }
            }
        });
    }

    // Make a slot golden by watching ad
    makeSlotGolden(slotIndex) {
        const ped = this.pedestals[slotIndex];
        if (!ped || !ped.unlocked) {
            this.addFloatingText(550, 350, 'Unlock slot first!', '#ff0000');
            return;
        }
        if (ped.golden) {
            this.addFloatingText(550, 350, 'Already golden!', '#ffd700');
            return;
        }

        if (!ysdk) {
            this.addFloatingText(550, 350, 'Ads not available', '#ff0000');
            return;
        }

        ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    this.soundEnabled = false;
                },
                onRewarded: () => {
                    ped.golden = true;
                    this.playSound(800, 800);
                    this.addFloatingText(ped.x + ped.width/2, ped.y, '★ GOLDEN SLOT! ★', '#ffd700');
                    this.saveGame();
                },
                onClose: () => {
                    this.soundEnabled = true;
                },
                onError: (e) => {
                    console.log('Ad error:', e);
                    this.addFloatingText(550, 350, 'Ad not available', '#ff0000');
                }
            }
        });
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

        // Save items from golden slots before rebirth
        const goldenItems = [];
        for (let i = 0; i < this.pedestals.length; i++) {
            const ped = this.pedestals[i];
            if (ped.golden && ped.item) {
                goldenItems.push({
                    index: i,
                    item: { ...ped.item }
                });
            }
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

        this.setupPedestals(true); // Preserve golden status
        this.conveyor.items = [];
        this.player.heldItem = null;
        this.totalIncome = 0;

        // Restore frozen items to golden slots
        for (const saved of goldenItems) {
            if (this.pedestals[saved.index]) {
                this.pedestals[saved.index].frozenItem = saved.item;
            }
        }

        this.spawnConveyorItem(700);
        this.spawnConveyorItem(900);

        this.addFloatingText(550, 350, '★ REBIRTH ' + this.rebirthLevel + '! ★', '#ff00ff');
        this.playSound(200, 1500);
        this.rebirthOpen = false;
        this.updateHUD();
        this.saveGame();

        // Show fullscreen ad after rebirth
        this.showFullscreenAd();
    }

    update(dt) {
        this.animTime += dt;

        // Apply spawn rate upgrade (reduces interval)
        const spawnRateBonus = 1 - (this.upgrades.spawnRate.level * this.upgrades.spawnRate.effect);
        let actualSpawnInterval = this.conveyor.spawnInterval * Math.max(0.3, spawnRateBonus);

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
                const actualIncome = Math.floor(this.totalIncome);
                this.money += actualIncome;
                this.lifetimeEarnings += actualIncome;
                this.updateHUD();
                for (let ped of this.pedestals) {
                    if (ped.item && ped.unlocked) {
                        this.spawnIncomeParticle(ped.x + ped.width/2, ped.y, Math.floor(ped.item.income));
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
        ctx.fillText('[TAB] Shop | [Q] Stats | [R] Rebirth | [C] Collection | [G] Bonus | [1-3] Floors', 20, H - 60);

        if (this.shopOpen) this.drawShopPanel(ctx, W, H);
        if (this.statsOpen) this.drawStatsPanel(ctx, W, H);
        if (this.rebirthOpen) this.drawRebirthPanel(ctx, W, H);
        if (this.collectionOpen) this.drawCollectionPanel(ctx, W, H);
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
        const panelH = 520;
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
        this.shopAdButtons = [];
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

        // Slot purchase with money
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
            : 'MAX SLOTS';
        ctx.fillText(slotText, panelX + 60, slotY + 25);

        if (this.unlockedSlots < this.maxSlots && slotCost > 0) {
            ctx.fillStyle = canBuySlot ? '#ffd700' : '#f44336';
            ctx.textAlign = 'right';
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText('$' + this.formatNum(slotCost), panelX + panelW - 22, slotY + 18);
        }

        // === AD REWARDS SECTION ===
        const adSectionY = slotY + 55;
        ctx.fillStyle = '#9c27b0';
        ctx.font = 'bold 10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('★ WATCH ADS ★', panelX + panelW/2, adSectionY);

        // Free slot button (ad)
        const freeSlotY = adSectionY + 15;
        const canGetFreeSlot = this.unlockedSlots < this.maxSlots;
        const freeSlotBox = { x: panelX + 15, y: freeSlotY, w: (panelW - 40) / 2, h: 35, action: 'freeSlot' };
        this.shopAdButtons.push(freeSlotBox);

        ctx.fillStyle = canGetFreeSlot ? '#4a1a6a' : '#1a1a2e';
        ctx.fillRect(freeSlotBox.x, freeSlotBox.y, freeSlotBox.w, freeSlotBox.h);
        ctx.strokeStyle = canGetFreeSlot ? '#9c27b0' : '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(freeSlotBox.x, freeSlotBox.y, freeSlotBox.w, freeSlotBox.h);

        ctx.fillStyle = canGetFreeSlot ? '#fff' : '#666';
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('FREE SLOT', freeSlotBox.x + freeSlotBox.w/2, freeSlotY + 15);
        ctx.fillStyle = '#ffd700';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('[WATCH AD]', freeSlotBox.x + freeSlotBox.w/2, freeSlotY + 28);

        // Golden slot button (ad)
        const goldenSlotBox = { x: panelX + 25 + (panelW - 40) / 2, y: freeSlotY, w: (panelW - 40) / 2, h: 35, action: 'goldenSlot' };
        this.shopAdButtons.push(goldenSlotBox);

        ctx.fillStyle = '#4a3a00';
        ctx.fillRect(goldenSlotBox.x, goldenSlotBox.y, goldenSlotBox.w, goldenSlotBox.h);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(goldenSlotBox.x, goldenSlotBox.y, goldenSlotBox.w, goldenSlotBox.h);

        ctx.fillStyle = '#ffd700';
        ctx.font = '7px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('★ GOLDEN', goldenSlotBox.x + goldenSlotBox.w/2, freeSlotY + 15);
        ctx.fillStyle = '#fff';
        ctx.font = '6px "Press Start 2P"';
        ctx.fillText('[WATCH AD]', goldenSlotBox.x + goldenSlotBox.w/2, freeSlotY + 28);

        // Golden slot info
        ctx.fillStyle = '#888';
        ctx.font = '6px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Golden slots keep mobs after Rebirth!', panelX + panelW/2, adSectionY + 62);

        // Count golden slots
        const goldenCount = this.pedestals.filter(p => p.golden).length;
        ctx.fillStyle = '#ffd700';
        ctx.fillText('Golden: ' + goldenCount + '/' + this.unlockedSlots, panelX + panelW/2, adSectionY + 75);

        ctx.fillStyle = '#888';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Click to buy | [TAB] close', panelX + panelW/2, panelY + panelH - 12);
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
        ctx.fillText('REBIRTH', btnX + btnW/2, btnY + 22);

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
                // Golden slots have golden gradient
                if (ped.golden) {
                    pedGrad.addColorStop(0, near ? '#c9a227' : '#9a7b0a');
                    pedGrad.addColorStop(1, near ? '#9a7b0a' : '#6b5607');
                } else {
                    pedGrad.addColorStop(0, near ? '#5a6577' : '#4a5568');
                    pedGrad.addColorStop(1, near ? '#4a5568' : '#2d3748');
                }
            } else {
                // Locked slot with frozen item shows ice color
                if (ped.frozenItem) {
                    pedGrad.addColorStop(0, '#4a6a8a');
                    pedGrad.addColorStop(1, '#2a4a6a');
                } else {
                    pedGrad.addColorStop(0, '#2a2a2a');
                    pedGrad.addColorStop(1, '#1a1a1a');
                }
            }
            ctx.fillStyle = pedGrad;
            ctx.fillRect(ped.x, ped.y, ped.width, ped.height);

            // Golden border for golden slots
            if (ped.golden) {
                ctx.strokeStyle = near ? '#ffd700' : '#c9a227';
                ctx.lineWidth = near ? 4 : 3;
            } else {
                ctx.strokeStyle = ped.unlocked ? (near ? '#f6e05e' : '#4a5568') : '#333';
                ctx.lineWidth = near ? 3 : 2;
            }
            ctx.strokeRect(ped.x, ped.y, ped.width, ped.height);

            // Draw golden star indicator
            if (ped.golden) {
                ctx.fillStyle = '#ffd700';
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText('★', ped.x + 2, ped.y + 2);
            }

            if (!ped.item) {
                ctx.fillStyle = ped.unlocked ? '#2d3748' : '#1a1a1a';
                ctx.beginPath();
                ctx.arc(ped.x + ped.width/2, ped.y + ped.height/2 - 5, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = ped.unlocked ? '#4a5568' : '#333';
                ctx.lineWidth = 2;
                ctx.stroke();

                if (!ped.unlocked) {
                    // Show frozen item preview or lock
                    if (ped.frozenItem) {
                        // Draw frozen item (with ice effect)
                        ctx.globalAlpha = 0.6;
                        ctx.fillStyle = '#aaddff';
                        ctx.font = '20px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(ped.frozenItem.icon, ped.x + ped.width/2, ped.y + ped.height/2 - 5);
                        ctx.globalAlpha = 1;
                        // Ice crystal overlay
                        ctx.fillStyle = '#00bcd4';
                        ctx.font = '10px Arial';
                        ctx.fillText('❄', ped.x + ped.width/2 + 15, ped.y + ped.height/2 - 15);
                    } else {
                        ctx.fillStyle = '#666';
                        ctx.font = '16px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🔒', ped.x + ped.width/2, ped.y + ped.height/2 - 5);
                    }
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

        // Save to Yandex Cloud if available
        if (yandexPlayer) {
            yandexPlayer.setData(saveData, true).then(() => {
                console.log('Cloud save successful');
            }).catch(e => {
                console.log('Cloud save failed, using localStorage:', e.message);
                this.saveToLocalStorage(saveData);
            });
        } else {
            this.saveToLocalStorage(saveData);
        }
    }

    saveToLocalStorage(saveData) {
        try {
            localStorage.setItem('stealACoin_save_v3', JSON.stringify(saveData));
        } catch(e) {
            console.log('Local save failed:', e);
        }
    }

    async loadGame() {
        let data = null;

        // Try to load from Yandex Cloud first
        if (yandexPlayer) {
            try {
                data = await yandexPlayer.getData();
                if (data && Object.keys(data).length > 0) {
                    console.log('Loaded from Yandex Cloud');
                } else {
                    data = null;
                }
            } catch (e) {
                console.log('Cloud load failed:', e.message);
            }
        }

        // Fallback to localStorage
        if (!data) {
            try {
                const saved = localStorage.getItem('stealACoin_save_v3') ||
                              localStorage.getItem('stealACoin_save_v2');
                if (saved) {
                    data = JSON.parse(saved);
                    console.log('Loaded from localStorage');
                }
            } catch (e) {
                console.log('Local load failed:', e);
            }
        }

        if (!data) return;

        try {
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
            console.log('Load parse failed:', e);
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
            localStorage.removeItem('stealACoin_save_v2');
            localStorage.removeItem('stealACoin_save_v3');
            // Clear cloud save
            if (yandexPlayer) {
                yandexPlayer.setData({}, true).catch(e => console.log('Cloud clear failed:', e));
            }
            location.reload();
        }
    }

    // Show rewarded ad for bonus money
    showRewardedAd() {
        if (!ysdk) {
            this.addFloatingText(550, 350, 'Ads not available', '#ff0000');
            return;
        }

        ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    console.log('Rewarded ad opened');
                    this.soundEnabled = false; // Mute during ad
                },
                onRewarded: () => {
                    console.log('Rewarded!');
                    // Calculate bonus based on player progress:
                    // - 60 seconds of income (1 minute)
                    // - OR 10% of current money
                    // - OR minimum based on rebirth level
                    const incomeBonus = Math.floor(this.totalIncome * 60);
                    const moneyBonus = Math.floor(this.money * 0.1);
                    const minBonus = Math.floor(100 * this.rebirthMultiplier * (this.rebirthLevel + 1));
                    const bonus = Math.max(incomeBonus, moneyBonus, minBonus);

                    this.money += bonus;
                    this.lifetimeEarnings += bonus;
                    this.addFloatingText(550, 300, '+$' + this.formatNum(bonus) + ' BONUS!', '#ffd700');
                    this.playSound(800, 500);
                    this.updateHUD();
                    this.saveGame();
                },
                onClose: () => {
                    console.log('Rewarded ad closed');
                    this.soundEnabled = true; // Restore sound
                },
                onError: (e) => {
                    console.log('Rewarded ad error:', e);
                    this.addFloatingText(550, 350, 'Ad not available', '#ff0000');
                }
            }
        });
    }

    // Show fullscreen ad (between levels/rebirths)
    showFullscreenAd() {
        if (!ysdk) return;

        ysdk.adv.showFullscreenAdv({
            callbacks: {
                onOpen: () => {
                    this.soundEnabled = false;
                },
                onClose: (wasShown) => {
                    this.soundEnabled = true;
                    console.log('Fullscreen ad closed, wasShown:', wasShown);
                },
                onError: (e) => {
                    console.log('Fullscreen ad error:', e);
                }
            }
        });
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

// Initialize Yandex SDK and start game
window.onload = async () => {
    try {
        // Initialize Yandex Games SDK
        ysdk = await YaGames.init();
        console.log('Yandex SDK initialized');

        // Get player for cloud saves
        try {
            yandexPlayer = await ysdk.getPlayer({ scopes: false });
            console.log('Yandex Player initialized');
        } catch (e) {
            console.log('Player init failed, using local saves:', e.message);
        }

        // Create game instance
        const game = new Game();
        window.game = game;

        // Signal that game is ready
        ysdk.features.LoadingAPI?.ready();
        console.log('Game Ready signal sent');

    } catch (e) {
        console.log('Yandex SDK not available, running in standalone mode:', e.message);
        // Fallback: run without SDK
        const game = new Game();
        window.game = game;
    }
};
