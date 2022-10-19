// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./BaseContracts/Ownable.sol";
import "./BaseContracts/ReentrancyGuard.sol";
import "./Interface/ISoundProofFactory.sol";
import "./Interface/ISoundProofNFT.sol";
import "./SoundProofNFT.sol";

/**
 * SoundProof Factory Contract
 */
contract SoundProofFactory is Ownable, ISoundProofFactory, ReentrancyGuard {
    /** ========================== SoundProofFactory Get Founctions ========================== */
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

    /** ========================== SoundProofFactory Internal Founctions ========================== */
    /**
     * @dev Create SoundProof NFT Internal Function
     */
    function _createSoundProofNFT(
        address ownerAddress,
        string memory _name,
        string memory _symbol,
        string memory _description,
        bool _isDuplicate
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
        ISoundProofNFT(newNFTAddress).initialize(ownerAddress, _name, _symbol, _description, _isDuplicate);

        // Update Storage List
        nftOwner[newNFTAddress] = ownerAddress;
        isApproveBySoundProof[newNFTAddress] = false;
        allNFTStorageList.push(newNFTAddress);

        // Emit the event
        emit SoundProofNFTCreated(ownerAddress, newNFTAddress, allNFTStorageList.length);
    }

    /**
     * @dev Change Approve Status, Internal Function
     */
    function _changeSoundProofNFTApprove(
        address nftAddress,
        bool isApprove
    ) internal {
        // Change Approve on SoundProof Factory
        isApproveBySoundProof[nftAddress] = isApprove;
        // Change Approve on SoundProof NFT
        ISoundProofNFT(nftAddress).changeApprove(isApprove);
    }
    
    /** ========================== SoundProofFactory User Founctions ========================== */
    /**
     * @dev Create New SoundProof NFT By User
     */
    function createSoundProofNFT(
        string memory _name,
        string memory _symbol
    ) external override payable nonReentrant {
        // To-Do: Check the Price of new NFT creation

        // Get Owner Address
        address ownerAddress = _msgSender();
        // Create New SoundProof NFT
        _createSoundProofNFT(ownerAddress, _name, _symbol, "This NFT is generated and protected by SoundProofIP Community.", false);
    }

    /**
     * @dev Duplicate Existed SoundProofNFT
     */
    function duplicateSoundProofNFT(
        address duplicateAddress,
        address existedSoundProofNFT
    ) external override payable nonReentrant {
        require(nftOwner[existedSoundProofNFT] == _msgSender(), "SoundProofFactory: FORBIDDEN");
        // To-Do: Check the Price of duplicate NFT creation

        // Get Name of Original NFT
        string memory name = ISoundProofNFT(existedSoundProofNFT).name();
        // Get Symbol of Original NFT
        string memory symbol = ISoundProofNFT(existedSoundProofNFT).symbol();

        // Create New NFT as duplicate
        _createSoundProofNFT(duplicateAddress, name, symbol, "This NFT is duplicated by SoundProofIP Community.", true);
    }

    /**
     * @dev Transfer Ownership of SoundProof NFT
     */
    function transferSoundProofNFTOwnership(
        address nftAddress,
        address newOwnerAddress
    ) external override {
        require(nftOwner[nftAddress] == _msgSender(), "SoundProofFactory: FORBIDDEN");

        // Change Owner on SoundProof Factory
        nftOwner[nftAddress] = newOwnerAddress;
        // Change Owner on SoundProof NFT
        ISoundProofNFT(nftAddress).changeOwnership(newOwnerAddress);
    }

    /** ========================== SoundProofFactory Admin Founctions ========================== */
    /**
     * @dev Create New NFT By SoundProof
     */
    function createSoundProofNFTByAdmin (
        address userAddress,
        string memory _name,
        string memory _symbol
    ) external override onlyOwner {
        // Create New SoundProof NFT
        _createSoundProofNFT(userAddress, _name, _symbol, "This NFT is generated and protected by SoundProofIP Community.", false);
    }

    /**
     * @dev Change Approve By SoundProof
     */
    function changeSoundProofNFTApprove(
        address nftAddress,
        bool isApprove 
    ) external override onlyOwner {
        require(nftOwner[nftAddress] != address(0), "SoundProofFactory: NFT not exist");

        // Call Change Approve Internal Function
        _changeSoundProofNFTApprove(nftAddress, isApprove);
    }

    /**
     * @dev Bulk Change Approve By SoundProof
     */
    function changeBulkSoundProofNFTApprove(
        address[] memory nftAddressList,
        bool isApprove
    ) external override onlyOwner {
        for (uint256 i = 0; i < nftAddressList.length; i += 1) {
            // If NFT Exists
            if (nftOwner[nftAddressList[i]] != address(0)) {
                // Call Change Approve Internal Function
                _changeSoundProofNFTApprove(nftAddressList[i], isApprove);
            }
        }
    }

    /**
     * @dev Change Approve Status of Minted NFT By SoundProof
     */
    function changeSoundProofMintedNFTApprove(
        address nftAddress,
        uint256 mintedId,
        bool isApprove
    ) external override onlyOwner {
        require(nftOwner[nftAddress] != address(0), "SoundProofFactory: NFT not exist");
        require(mintedId < ISoundProofNFT(nftAddress).tokenIdTracker(), "SoundProofFactory: Minted NFT does not exist");

        ISoundProofNFT(nftAddress).changeApproveOfMintedNFT(mintedId, isApprove);
    }
}
