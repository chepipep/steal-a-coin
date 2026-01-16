// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StealAShitCoin
 * @notice Simple payment contract for the Steal A ShitCoin game on Base
 * @dev Accepts ETH payments and emits events for game integration
 */
contract StealAShitCoin {
    address public owner;

    // Purchase types
    uint8 public constant PURCHASE_VIP = 1;
    uint8 public constant PURCHASE_BOOSTER_INCOME = 2;
    uint8 public constant PURCHASE_BOOSTER_SPAWN = 3;
    uint8 public constant PURCHASE_BOOSTER_LUCK = 4;
    uint8 public constant PURCHASE_INSTANT_SLOT = 5;
    uint8 public constant PURCHASE_INSTANT_REBIRTH = 6;

    // Prices in wei (can be updated by owner)
    uint256 public priceVIP = 0.005 ether;
    uint256 public priceBoosterIncome = 0.0008 ether;
    uint256 public priceBoosterSpawn = 0.0008 ether;
    uint256 public priceBoosterLuck = 0.001 ether;
    uint256 public priceInstantSlot = 0.0005 ether;
    uint256 public priceInstantRebirth = 0.001 ether;

    // Track VIP status on-chain (optional, game can also track locally)
    mapping(address => bool) public isVIP;

    // Events - game listens to these
    event Purchase(address indexed player, uint8 purchaseType, uint256 amount, uint256 timestamp);
    event VIPActivated(address indexed player, uint256 timestamp);
    event BoosterActivated(address indexed player, uint8 boosterType, uint256 duration, uint256 timestamp);
    event InstantSlotPurchased(address indexed player, uint256 timestamp);
    event InstantRebirthPurchased(address indexed player, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Buy VIP status (permanent)
     */
    function buyVIP() external payable {
        require(msg.value >= priceVIP, "Insufficient ETH");
        require(!isVIP[msg.sender], "Already VIP");

        isVIP[msg.sender] = true;

        emit Purchase(msg.sender, PURCHASE_VIP, msg.value, block.timestamp);
        emit VIPActivated(msg.sender, block.timestamp);
    }

    /**
     * @notice Buy income booster (1 hour)
     */
    function buyBoosterIncome() external payable {
        require(msg.value >= priceBoosterIncome, "Insufficient ETH");

        emit Purchase(msg.sender, PURCHASE_BOOSTER_INCOME, msg.value, block.timestamp);
        emit BoosterActivated(msg.sender, PURCHASE_BOOSTER_INCOME, 3600, block.timestamp);
    }

    /**
     * @notice Buy spawn rate booster (1 hour)
     */
    function buyBoosterSpawn() external payable {
        require(msg.value >= priceBoosterSpawn, "Insufficient ETH");

        emit Purchase(msg.sender, PURCHASE_BOOSTER_SPAWN, msg.value, block.timestamp);
        emit BoosterActivated(msg.sender, PURCHASE_BOOSTER_SPAWN, 3600, block.timestamp);
    }

    /**
     * @notice Buy luck booster (1 hour)
     */
    function buyBoosterLuck() external payable {
        require(msg.value >= priceBoosterLuck, "Insufficient ETH");

        emit Purchase(msg.sender, PURCHASE_BOOSTER_LUCK, msg.value, block.timestamp);
        emit BoosterActivated(msg.sender, PURCHASE_BOOSTER_LUCK, 3600, block.timestamp);
    }

    /**
     * @notice Buy instant slot unlock
     */
    function buyInstantSlot() external payable {
        require(msg.value >= priceInstantSlot, "Insufficient ETH");

        emit Purchase(msg.sender, PURCHASE_INSTANT_SLOT, msg.value, block.timestamp);
        emit InstantSlotPurchased(msg.sender, block.timestamp);
    }

    /**
     * @notice Buy instant rebirth
     */
    function buyInstantRebirth() external payable {
        require(msg.value >= priceInstantRebirth, "Insufficient ETH");

        emit Purchase(msg.sender, PURCHASE_INSTANT_REBIRTH, msg.value, block.timestamp);
        emit InstantRebirthPurchased(msg.sender, block.timestamp);
    }

    /**
     * @notice Check if address is VIP
     */
    function checkVIP(address player) external view returns (bool) {
        return isVIP[player];
    }

    /**
     * @notice Withdraw collected ETH to owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @notice Update prices (only owner)
     */
    function updatePrices(
        uint256 _vip,
        uint256 _boosterIncome,
        uint256 _boosterSpawn,
        uint256 _boosterLuck,
        uint256 _instantSlot,
        uint256 _instantRebirth
    ) external onlyOwner {
        priceVIP = _vip;
        priceBoosterIncome = _boosterIncome;
        priceBoosterSpawn = _boosterSpawn;
        priceBoosterLuck = _boosterLuck;
        priceInstantSlot = _instantSlot;
        priceInstantRebirth = _instantRebirth;
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    receive() external payable {}
}
