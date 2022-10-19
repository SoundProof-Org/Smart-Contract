// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./BaseContracts/Ownable.sol";
import "./BaseContracts/ReentrancyGuard.sol";
import "./BaseContracts/ERC1155Updated.sol";

/**
 * SoundProof Collection Contract for NFT Users
 */
abstract contract SoundProofCollection is Ownable, ReentrancyGuard, ERC1155Updated {

}