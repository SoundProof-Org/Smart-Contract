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
    /// Get Functions
    function allStorageListLength() public view virtual returns (uint256 length);
    function allUserNFTCount(address userAddress) public view virtual returns (uint256 userCount);
    function allNFTList(address userAddress) public view virtual returns (address[] memory nftList);

    /// User Functions
    function createSoundProofNFT(string memory _name, string memory _symbol) external virtual payable;
    function duplicateSoundProofNFT(address duplicateAddress, address existedSoundProofNFTAddress) external virtual payable;
    function transferSoundProofNFTOwnership(address nftAddress, address newOwnerAddress) external virtual;

    /// Admin Functions
    function createSoundProofNFTByAdmin(address userAddress, string memory _name, string memory _symbol) external virtual;
    function changeSoundProofNFTApprove(address nftAddress, bool isApprove) external virtual;
    function changeBulkSoundProofNFTApprove(
        address[] memory nftAddressList,
        bool isApprove
    ) external virtual;
    function changeSoundProofMintedNFTApprove(
        address nftAddress,
        uint256 mintedId,
        bool isApprove
    ) external virtual;
}