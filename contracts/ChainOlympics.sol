// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

contract ChainOlympics is Ownable, ReentrancyGuard {
    // World ID integration
    IWorldID public immutable worldId;
    uint256 public immutable externalNullifier;
    uint256 public immutable groupId = 1;

    // WLD token for prizes
    IERC20 public immutable wldToken;

    // Game and athlete management
    struct Athlete {
        address wallet;
        string ensName;
        string country;
        uint256 totalGames;
        uint256 bestScore;
        uint256 totalWinnings;
        bool isVerified;
        uint256 registeredAt;
    }

    struct GameResult {
        address athlete;
        uint256 score;
        uint256 level;
        uint256 prizeAmount;
        uint256 timestamp;
        string gameType;
    }

    // Storage
    mapping(address => Athlete) public athletes;
    mapping(uint256 => bool) public nullifierHashes; // Prevent double verification
    mapping(address => bool) public verifiedAthletes;

    GameResult[] public gameResults;
    address[] public athletesList;

    // Prize pool management
    uint256 public totalPrizePool;
    uint256 public maxPrizePerGame = 5 ether; // 5 WLD max per game

    // Events
    event AthleteRegistered(address indexed athlete, string ensName, string country);
    event GameCompleted(address indexed athlete, uint256 score, uint256 level, uint256 prize);
    event PrizeDistributed(address indexed athlete, uint256 amount);
    event WorldIDVerified(address indexed athlete, uint256 nullifierHash);

    constructor(
        address _worldId,
        string memory _appId,
        address _wldToken
    ) {
        worldId = IWorldID(_worldId);
        externalNullifier = abi.encodePacked(_appId).hashToField();
        wldToken = IERC20(_wldToken);
    }

    /**
     * @notice Verify World ID and register athlete
     */
    function verifyAndRegisterAthlete(
        address athlete,
        string memory ensName,
        string memory country,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        // Verify World ID proof
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(athlete).hashToField(),
            nullifierHash,
            externalNullifier,
            proof
        );

        // Ensure nullifier hasn't been used
        require(!nullifierHashes[nullifierHash], "World ID already used");
        nullifierHashes[nullifierHash] = true;

        // Register athlete
        require(!verifiedAthletes[athlete], "Athlete already registered");

        athletes[athlete] = Athlete({
            wallet: athlete,
            ensName: ensName,
            country: country,
            totalGames: 0,
            bestScore: 0,
            totalWinnings: 0,
            isVerified: true,
            registeredAt: block.timestamp
        });

        verifiedAthletes[athlete] = true;
        athletesList.push(athlete);

        emit AthleteRegistered(athlete, ensName, country);
        emit WorldIDVerified(athlete, nullifierHash);
    }

    /**
     * @notice Submit game result and calculate prize
     */
    function submitGameResult(
        uint256 score,
        uint256 level,
        string memory gameType
    ) external nonReentrant {
        require(verifiedAthletes[msg.sender], "Athlete not verified");

        Athlete storage athlete = athletes[msg.sender];

        // Calculate prize based on score and level
        uint256 basePrize = (score * 1e17) / 50; // Up to 0.1 WLD for perfect score
        uint256 levelBonus = (level - 1) * (basePrize / 10); // 10% bonus per level
        uint256 totalPrize = basePrize + levelBonus;

        // Cap the prize
        if (totalPrize > maxPrizePerGame) {
            totalPrize = maxPrizePerGame;
        }

        // Update athlete stats
        athlete.totalGames += 1;
        if (score > athlete.bestScore) {
            athlete.bestScore = score;
        }
        athlete.totalWinnings += totalPrize;

        // Record game result
        gameResults.push(GameResult({
            athlete: msg.sender,
            score: score,
            level: level,
            prizeAmount: totalPrize,
            timestamp: block.timestamp,
            gameType: gameType
        }));

        // Distribute prize
        if (totalPrize > 0 && wldToken.balanceOf(address(this)) >= totalPrize) {
            wldToken.transfer(msg.sender, totalPrize);
            emit PrizeDistributed(msg.sender, totalPrize);
        }

        emit GameCompleted(msg.sender, score, level, totalPrize);
    }

    /**
     * @notice Get leaderboard data
     */
    function getLeaderboard() external view returns (
        address[] memory addresses,
        string[] memory ensNames,
        string[] memory countries,
        uint256[] memory bestScores,
        uint256[] memory totalGames,
        uint256[] memory totalWinnings
    ) {
        uint256 length = athletesList.length;

        addresses = new address[](length);
        ensNames = new string[](length);
        countries = new string[](length);
        bestScores = new uint256[](length);
        totalGames = new uint256[](length);
        totalWinnings = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address athleteAddr = athletesList[i];
            Athlete memory athlete = athletes[athleteAddr];

            addresses[i] = athleteAddr;
            ensNames[i] = athlete.ensName;
            countries[i] = athlete.country;
            bestScores[i] = athlete.bestScore;
            totalGames[i] = athlete.totalGames;
            totalWinnings[i] = athlete.totalWinnings;
        }
    }

    /**
     * @notice Get athlete data
     */
    function getAthlete(address athleteAddr) external view returns (Athlete memory) {
        return athletes[athleteAddr];
    }

    /**
     * @notice Get total number of games played
     */
    function getTotalGames() external view returns (uint256) {
        return gameResults.length;
    }

    /**
     * @notice Fund prize pool (owner only)
     */
    function fundPrizePool(uint256 amount) external onlyOwner {
        wldToken.transferFrom(msg.sender, address(this), amount);
        totalPrizePool += amount;
    }

    /**
     * @notice Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = wldToken.balanceOf(address(this));
        wldToken.transfer(owner(), balance);
    }

    /**
     * @notice Update max prize per game (owner only)
     */
    function updateMaxPrize(uint256 newMaxPrize) external onlyOwner {
        maxPrizePerGame = newMaxPrize;
    }
}

// Helper library for World ID integration
library ByteHasher {
    /// @dev Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}

extension ByteHasher for bytes {
    function hashToField() internal pure returns (uint256) {
        return ByteHasher.hashToField(this);
    }
}