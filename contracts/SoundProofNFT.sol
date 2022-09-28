// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "./BaseContracts/ERC721Minimal.sol";
import "./BaseContracts/Context.sol";
import "./Interface/ISoundProofNFT.sol";

/**
 * SoundProof NFT Contract
 */
contract SoundProofNFT is ERC721Minimal, Context {
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

    constructor() {
        soundProofFactory = _msgSender();
    }

    /**
     * @dev Initialize SoundProofNFT Contract
     */
    function initialize(address _nftOwner, string memory _name, string memory _symbol) external {
        // Only SoundProofFactory could call this
        require(_msgSender() == soundProofFactory, "SoundProofNFT: FORBIDDEN");

        nftOwner = _nftOwner;
        isApprove = false;
        name = _name;
        symbol = _symbol;
    }

    /**
     * @dev Change Approve
     */
    function changeApprove(bool _isApprove) external {
        // Only SoundProofFactory could call this
        require(_msgSender() == soundProofFactory, "SoundProofNFT: FORBIDDEN");

        isApprove = _isApprove;
    }

    /**
     * @dev Change Ownership
     */
    function changeOwnership(address newOwner) external {
        // Only SoundProofFactory could call this
        require(_msgSender() == soundProofFactory, "SoundProofNFT: FORBIDDEN");

        // Change Ownership
        nftOwner = newOwner;
    }
}