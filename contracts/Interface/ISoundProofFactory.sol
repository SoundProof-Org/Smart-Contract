// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract SoundProofFactoryEvents {
    /// @notice Create NFT Event
    event SoundProofNFTCreated(address indexed ownerAddress, address indexed nftAddress, uint);
}

contract SoundProofFactoryStorage {
    /// @notice Get NFT Storage Mapping Variable, New NFT Address => Owner Address
    mapping (address => address) public nftOwner;

    /// @notice All NFT Storage List
    address[] public allNFTStorageList;

    /// @notice SoundProof Approve NFT, All nfts should be approve by SoundProof after generating.
    mapping (address => bool) public isApproveBySoundProof;
}

abstract contract ISoundProofFactory is SoundProofFactoryEvents, SoundProofFactoryStorage {
    function allStorageListLength() public view virtual returns (uint256 length);
    function allUserNFTCount(address userAddress) public view virtual returns (uint256 userCount);
    function allNFTList(address userAddress) public view virtual returns (address[] memory nftList);
}