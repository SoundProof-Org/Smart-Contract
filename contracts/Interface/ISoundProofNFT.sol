// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "./ISoundProofBase.sol";

contract SoundProofNFTEvents {
    /// @notice Change Ownership Event
    event SoundProofNFTTransferOwnership(address indexed originalOwner, address indexed newOwner);
}

contract SoundProofNFTStorage is SoundProofBaseStorage {
    /// @notice Metadata structure, the data filed of the LOSP
    struct SoundProofMetadata {
        /// Author of NFT, Original Owner of NFT
        address author;
        /// Unique MetadataID from IPFS
        string metadataId;
        /// ISO-Country
        string territory;
        /// Valid From, Timestamp
        uint256 validFrom;
        /// Valid To, Timestamp
        uint256 validTo;
        /// Right Type, e.x: commercial use, personal use, resale etc
        string rightType;
    }

    /// @notice Token name
    string public constant name = "SoundProofIP NFT";

    /// @notice Token symbol
    string public constant symbol = "SP-NFT";

    /// @notice Description
    string public description;

    /// @notice Unique String
    string public uniqueId;

    /// @notice SoundProofFactory
    address public soundProofFactory;

    /// @notice NFTOwner
    address public nftOwner;

    /// @notice isDuplicate or Not
    bool public isDuplicate;

    /// @notice Base Token URI
    string public baseTokenURI;

    /// @notice TokenID Tracker
    uint256 public tokenIdTracker;

    /// @notice Metadata per TokenID
    mapping(uint256 => SoundProofMetadata) public soundProofMetadataList;

    /// @notice SoundProof NFT OwnerList
    SoundProofNFTOwnership[] public ownerList;
}

abstract contract ISoundProofNFT is SoundProofNFTStorage, SoundProofNFTEvents {
    function initialize(
        address _nftOwner,
        string memory _uniqueId,
        string memory _description,
        SoundProofNFTOwnership[] memory _ownerList,
        bool _isDuplicate
    ) external virtual;
    function totalSupply() external virtual returns (uint256);
    function tokenURI(uint256 tokenId) external virtual returns (string memory);
    function getOwnerList() external virtual returns(SoundProofNFTOwnership[] memory);
    function changeOwnership(address newOwner) external virtual;
    function soundProofNFTMint(address mintAddress) external virtual;
    function setBaseURI(string memory baseURI) external virtual;
    function updateSoundProofNFTMetadata(
        uint256 mintedId,
        address _author,
        string memory _metadataId,
        string memory _territory,
        uint256 _validFrom,
        uint256 _validTo,
        string memory _rightType
    ) external virtual;
}