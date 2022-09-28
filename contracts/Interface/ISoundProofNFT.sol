// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract SoundProofNFTEvents {
}

contract SoundProofNFTStorage {
    /// @notice Token name
    string public name;

    /// @notice Token symbol
    string public symbol;

    /// @notice SoundProofFactory
    address public soundProofFactory;

    /// @notice NFTOwner
    address public nftOwner;

    /// @notice Approve By SoundProof
    bool public isApprove;

    /// @notice Base Token URI
    string public baseTokenURI;

    /// @notice TokenID Tracker
    uint256 public tokenIdTracker;

    /// @notice Metadata per TokenID
    mapping(uint256 => string) public soundProofNFTMetadata;

    /// @notice Approve TokenID By Owner
    mapping(uint256 => bool) public soundProofNFTApproveId;
}

abstract contract ISoundProofNFT is SoundProofNFTStorage, SoundProofNFTEvents {
    function initialize(address _nftOwner, string memory _name, string memory _symbol) external virtual;
    function changeApprove(bool _isApprove) external virtual;
    function changeOwnership(address newOwner) external virtual;
}