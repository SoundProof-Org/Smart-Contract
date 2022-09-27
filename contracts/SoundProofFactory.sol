// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./BaseContracts/Ownable.sol";
import "./Interface/ISoundProofFactory.sol";
import "./Interface/ISoundProofNFT.sol";
import "./SoundProofNFT.sol";

/**
 * SoundProof Factory Contract
 */
contract SoundProofFactory is Ownable, SoundProofFactoryStorage, SoundProofFactoryEvents{
    /**
     * @dev return length of all NFT list
     */
    function allStorageListLength() public view returns (uint256 length) {
        length = allNFTStorageList.length;
    }

    /**
     * @dev Create SoundProof NFT Internal Function
     */
    function _createSoundProofNFT(
        address ownerAddress,
        string memory _name,
        string memory _symbol
    ) internal returns (address newNFTAddress) {
        // Get Byte Code
        bytes memory byteCode = type(SoundProofNFT).creationCode;
        // bytes memory byteCode = abi.encodePacked(originalByteCode, abi.encode(_name), abi.encode(_symbol));
        // Get Salt
        bytes32 salt = keccak256(abi.encodePacked(ownerAddress));
        // Create New SoundProof NFT
        assembly {
            newNFTAddress := create2(0, add(byteCode, 32), mload(byteCode), salt)
        }

        require(newNFTAddress != address(0), "SoundProofFactory: Failed on Deploy New NFT");
        ISoundProofNFT(newNFTAddress).initialize(ownerAddress, _name, _symbol);

        // Update Storage List
        nftOwner[newNFTAddress] = ownerAddress;
        isApproveBySoundProof[newNFTAddress] = false;
        allNFTStorageList.push(newNFTAddress);

        // Emit the event
        emit SoundProofNFTCreated(ownerAddress, newNFTAddress, allNFTStorageList.length);
    }

    /**
     * @dev Create New SoundProof NFT By User
     */
    function createSoundProofNFT(
        string memory _name,
        string memory _symbol
    ) external payable {
        // To-Do: Check the Price of new creation

        // Get Owner Address
        address ownerAddress = _msgSender();
        // Create New SoundProof NFT
        _createSoundProofNFT(ownerAddress, _name, _symbol);
    }

    /**
     * @dev Create New NFT By SoundProof
     */
    function createSoundProofNFTByOwner (
        address userAddress,
        string memory _name,
        string memory _symbol
    ) external onlyOwner {
        // Create New SoundProof NFT
        _createSoundProofNFT(userAddress, _name, _symbol);
    }
}
