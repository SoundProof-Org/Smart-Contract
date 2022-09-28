// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "./BaseContracts/ERC721Minimal.sol";
import "./Interface/ISoundProofNFT.sol";
import "./BaseContracts/Strings.sol";

/**
 * SoundProof NFT Contract, The license of NFT is protected by SoundProof Community.
 */
contract SoundProofNFT is ISoundProofNFT, ERC721Minimal {
    using Strings for uint256;

    modifier onlySoundProofFactory {
        require(msg.sender == soundProofFactory, "SoundProofNFT: FORBIDDEN, only Factory could do it");
        _;
    }

    modifier onlySoundProofNFTOwner {
        require(msg.sender == nftOwner, "SoundProofNFT: FORBIDDEN, only NFT owner could do it");
        _;
    }

    constructor() {
        soundProofFactory = msg.sender;
    }

    /** ========================== SoundProofNFT Get Founctions ========================== */
    function totalSupply() public view returns (uint256) {
        return tokenIdTracker;
    }

    function tokenURI(uint256 tokenId) external view virtual returns (string memory) {
        require(tokenId < tokenIdTracker, "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(baseTokenURI, tokenId.toString()));
    } 

    /** ========================== SoundProofNFT Internal Founctions ========================== */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        // To Transfer, tokenId of NFT should be approve as first
        require(soundProofNFTApproveId[tokenId], "SoundProofNFT: FORBIDDEN By Owner");
    }

    /** ========================== SoundProofFactory Founctions ========================== */
    /**
     * @dev Initialize SoundProofNFT Contract
     */
    function initialize(address _nftOwner, string memory _name, string memory _symbol) external override onlySoundProofFactory {
        nftOwner = _nftOwner;
        isApprove = false;
        name = _name;
        symbol = _symbol;
    }

    /**
     * @dev Change Approve
     */
    function changeApprove(bool _isApprove) external override onlySoundProofFactory {
        // Change Approve
        isApprove = _isApprove;
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
     * @dev Mint NFT - Make Sub IP of NFT
     */
    function soundProofNFTMint(address mintAddress, string memory metadata) external onlySoundProofNFTOwner {
        // Check Approve from SoundProofFactory
        require(isApprove, "SoundProofNFT: FORBIDDEN, Not Approved Yet");

        // Update Token ID
        uint256 _id = tokenIdTracker;
        tokenIdTracker = tokenIdTracker + 1;

        // Update metadata
        soundProofNFTMetadata[_id] = metadata;

        // Update Aprove Status
        soundProofNFTApproveId[_id] = true;

        // Mint NFT
        _mint(mintAddress, _id);
    }

    /**
     * @dev Change Approve Status of Minted NFT
     */
    function changeApproveOfMintedNFT(uint256 tokenId, bool isApprove) external {
        require(msg.sender == nftOwner || msg.sender == soundProofFactory, "SoundProofNFT: FORBIDDEN");

        soundProofNFTApproveId[tokenId] = isApprove;
    }

    /**
     * @dev Set Base URI
     */
    function setBaseURI(string memory baseURI) external onlySoundProofNFTOwner {
        baseTokenURI = baseURI;
    }
}