// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "./BaseContracts/ERC721Permit.sol";
// import "./BaseContracts/ERC721MinimalUpdate.sol";
import "./Interface/ISoundProofNFT.sol";
import "./Interface/ISoundProofFactory.sol";
import "./BaseContracts/Strings.sol";

/**
 * SoundProof NFT Contract, The license of NFT is protected by SoundProof Community.
 */
contract SoundProofNFT is ISoundProofNFT, ERC721Permit {
// contract SoundProofNFT is ISoundProofNFT, ERC721MinimalUpdate {
    using Strings for uint256;

    modifier onlySoundProofFactory {
        require(msg.sender == soundProofFactory, "SoundProofNFT: FORBIDDEN, Not SoundProof Factory");
        _;
    }

    modifier onlySoundProofNFTOwner {
        require(msg.sender == nftOwner, "SoundProofNFT: FORBIDDEN, Not SoundProofNFT Owner");
        _;
    }

    modifier onlySoundProofFactoryOrNFTOwner {
        require(msg.sender == soundProofFactory || msg.sender == nftOwner, "Neither SoundProof Factory or NFT Owner");
        _;
    }

    constructor() {
        soundProofFactory = msg.sender;
    }

    /** ========================== SoundProofNFT Get Founctions ========================== */
    function totalSupply() external view override returns (uint256) {
        return tokenIdTracker;
    }

    function tokenURI(uint256 tokenId) external view override returns (string memory) {
        require(tokenId < tokenIdTracker, "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(baseTokenURI, tokenId.toString()));
    }

    function getOwnerList() external view override returns(SoundProofNFTOwnership[] memory) {
        return ownerList;
    }

    /** ========================== SoundProofNFT Internal Founctions ========================== */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        // Get SoundProofNFT Info
        SoundProofNFTInfo memory nftInfo = ISoundProofFactory(soundProofFactory).getNFTInfo(address(this));

        // Check Approve from SoundProofFactory
        require(nftInfo.isApprove, "SoundProofNFT: FORBIDDEN, Not Approved Yet By Service.");

        // To Transfer, To address should be on SoundProof WhiteList
        require(
            nftInfo.isPublic || 
            (nftInfo.isPublic == false && ISoundProofFactory(soundProofFactory).soundProofWhiteList(to)),
             "SoundProofNFT: To address is not in WhiteList."
        );
    }

    /** ========================== SoundProofFactory Founctions ========================== */
    /**
     * @dev Initialize SoundProofNFT Contract
     */
    function initialize(
        address _nftOwner,
        string memory _uniqueId,
        string memory _description,
        SoundProofNFTOwnership[] memory _ownerList,
        bool _isDuplicate
    ) external override onlySoundProofFactory {
        nftOwner = _nftOwner;
        uniqueId = _uniqueId;
        description = _description;
        isDuplicate = _isDuplicate;

        // Update Owner List
        for (uint i = 0; i < _ownerList.length; i += 1) {
            ownerList.push(_ownerList[i]);
        }
    }

    /**
     * @dev Change Ownership
     */
    function changeOwnership(address newOwner) external override onlySoundProofFactory {
        // Change Ownership
        nftOwner = newOwner;
    }

    /** ========================== SoundProofNFT Founctions ========================== */
    /**
     * @dev Mint NFT - Make Sub IP(Right) of NFT
     */
    function soundProofNFTMint(address mintAddress) external override onlySoundProofFactoryOrNFTOwner {
        // Update Token ID
        uint256 _id = tokenIdTracker;
        tokenIdTracker = tokenIdTracker + 1;

        // Mint NFT
        _mint(mintAddress, _id);
    }

    /**
     * @dev Update Metadata
     */
    function updateSoundProofNFTMetadata(
        uint256 nftID,
        address _author,
        string memory _metadataId,
        string memory _territory,
        uint256 _validFrom,
        uint256 _validTo,
        string memory _rightType
    ) external override onlySoundProofFactoryOrNFTOwner {
        require(ownerOf(nftID) != address(0), "SoundProofNFT: NFT should be minted as first.");

        soundProofMetadataList[nftID] = SoundProofMetadata(
            _author,
            _metadataId,
            _territory,
            _validFrom,
            _validTo,
            _rightType
        );
    }

    /**
     * @dev Set Base URI
     */
    function setBaseURI(string memory baseURI) external override onlySoundProofFactoryOrNFTOwner {
        baseTokenURI = baseURI;
    }
}