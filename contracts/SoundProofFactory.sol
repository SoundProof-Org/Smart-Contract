// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./BaseContracts/Ownable.sol";
import "./Interface/ISoundProofFactory.sol";
import "./Interface/ISoundProofNFT.sol";
import "./SoundProofNFT.sol";

/**
 * SoundProof Factory Contract
 */
contract SoundProofFactory is Ownable, ISoundProofFactory {
    /**
     * @dev return length of all NFT list
     */
    function allStorageListLength() public view override returns (uint256 length) {
        length = allNFTStorageList.length;
    }

    /**
     * @dev Get Count of User NFT
     */
    function allUserNFTCount(address userAddress) public view override returns (uint256 nftCount) {
        for(uint256 i = 0; i < allNFTStorageList.length; i += 1) {
            if (nftOwner[allNFTStorageList[i]] == userAddress) {
                nftCount += 1;
            }
        }
    }

    /**
     * @dev Get All NFTs of User
     */
    function allNFTList(address userAddress) public view override returns (address[] memory nftList) {
        uint256 id = 0;
        nftList = new address[](allUserNFTCount(userAddress));

        for (uint256 i = 0; i < allNFTStorageList.length; i += 1) {
            if (nftOwner[allNFTStorageList[i]] == userAddress) {
                nftList[id] = allNFTStorageList[i];
                id += 1;
            }
        }
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
        // Get Salt
        bytes32 salt = keccak256(abi.encodePacked(ownerAddress, _name, _symbol, allNFTStorageList.length));
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

    /** ========================== User Founctions ========================== */

    /**
     * @dev Create New SoundProof NFT By User
     */
    function createSoundProofNFT(
        string memory _name,
        string memory _symbol
    ) external payable {
        // To-Do: Check the Price of new NFT creation

        // Get Owner Address
        address ownerAddress = _msgSender();
        // Create New SoundProof NFT
        _createSoundProofNFT(ownerAddress, _name, _symbol);
    }

    /**
     * @dev Transfer Ownership of SoundProof NFT
     */
    function transferSoundProofNFTOwnership(
        address nftAddress,
        address newOwnerAddress
    ) external {
        require(nftOwner[nftAddress] == _msgSender(), "SoundProofFactory: FORBIDDEN");

        // Change Owner on SoundProof Factory
        nftOwner[nftAddress] = newOwnerAddress;
        // Change Owner on SoundProof NFT
        ISoundProofNFT(nftAddress).changeOwnership(newOwnerAddress);
    }

    /** ========================== Admin Founctions ========================== */

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

    /**
     * @dev Change Approve By SoundProof
     */
    function changeSoundProofNFTApprove(
        address nftAddress,
        bool isApprove
    ) external onlyOwner {
        require(nftOwner[nftAddress] != address(0), "SoundProofFactory: NFT not exist");

        // Change Approve on SoundProof Factory
        isApproveBySoundProof[nftAddress] = isApprove;
        // Change Approve on SoundProof NFT
        ISoundProofNFT(nftAddress).changeApprove(isApprove);
    }
}
