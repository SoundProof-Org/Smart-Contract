// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract SoundProofBaseStorage {
    /// @notice SoundProof NFT Info
    struct SoundProofNFTInfo {
        /// NFT Owner
        address nftOwner;
        /// Is Approve
        bool isApprove;
        /// Is Public
        bool isPublic;
    }

    /// @notice SoundProof Owner Structure
    struct SoundProofNFTOwnership {
        /// Owner Address
        address ownerAddress;
        /// Owned Percentage, e.x: 5000 => 50%
        uint256 ownedPercentage;
    }
}