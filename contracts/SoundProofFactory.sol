// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./BaseContracts/Ownable.sol";
import "./BaseContracts/ReentrancyGuard.sol";
import "./Interface/ISoundProofFactory.sol";
import "./Interface/ISoundProofNFT.sol";
import "./Interface/ISoundProofUtils.sol";
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
        for (uint i = 0; i < allNFTStorageList.length; i += 1) {
            if (soundProofNFTInfo[allNFTStorageList[i]].nftOwner == userAddress) {
                nftCount += 1;
            }
        }
    }

    /**
     * @dev Get All NFTs of User
     */
    function allNFTList(address userAddress) public view override returns (address[] memory nftList) {
        uint id = 0;
        nftList = new address[](allUserNFTCount(userAddress));

        for (uint i = 0; i < allNFTStorageList.length; i += 1) {
            if (soundProofNFTInfo[allNFTStorageList[i]].nftOwner == userAddress) {
                nftList[id] = allNFTStorageList[i];
                id += 1;
            }
        }
    }

    /**
     * @dev Get SoundProof NFT Info
     */
    function getNFTInfo(address nftAddress) public view override returns (SoundProofNFTInfo memory nftInfo) {
        return soundProofNFTInfo[nftAddress];
    }

    /** ========================== SoundProofFactory Internal Founctions ========================== */
    /**
     * @dev Create SoundProof NFT Internal Function
     */
    function _createSoundProofNFT(
        address ownerAddress,
        string memory _uniqueId,
        string memory _description,
        SoundProofNFTOwnership[] memory _ownerList,
        bool _isDuplicate
    ) internal returns (address newNFTAddress) {
        // Check Unique ID
        require(!soundProofUniqueIDList[_uniqueId], "SoundProofFactory: No Unique ID");

        // Check Sum of Owned Percentage
        require(ISoundProofUtils(soundProofUtils).checkOwnedPercentage(_ownerList), "SoundProofFactory: Sum of Owned Percentage should be equal 100.00%");

        // Get Byte Code
        bytes memory byteCode = type(SoundProofNFT).creationCode;
        // Get Salt
        bytes32 salt = keccak256(abi.encodePacked(ownerAddress, _uniqueId, allNFTStorageList.length));
        // Create New SoundProof NFT
        assembly {
            newNFTAddress := create2(0, add(byteCode, 32), mload(byteCode), salt)
        }

        // Check & Initialize new NFT Contract
        require(newNFTAddress != address(0), "SoundProofFactory: Failed on Deploy New NFT");
        ISoundProofNFT(newNFTAddress).initialize(ownerAddress, _uniqueId, _description, _ownerList, _isDuplicate);

        // Update SoundProof NFT Info
        soundProofNFTInfo[newNFTAddress] = SoundProofNFTInfo(ownerAddress, false, false);
        allNFTStorageList.push(newNFTAddress);

        // Update Unique ID
        soundProofUniqueIDList[_uniqueId] = true;

        // Emit The Event
        emit SoundProofNFTCreated(ownerAddress, newNFTAddress, allNFTStorageList.length, _isDuplicate);
    }

    /**
     * @dev Change Approve Status, Internal Function
     */
    function _changeSoundProofNFTApprove(
        address nftAddress,
        bool isApprove
    ) internal {
        // Change Approve on SoundProof Factory
        soundProofNFTInfo[nftAddress].isApprove = isApprove;

        // Emit The Event
        emit SoundProofNFTApproved(nftAddress, isApprove);
    }

    /**
     * @dev Change Public/Private Status, Internal Function
     */
    function _changeSoundProofNFTStatus(
        address nftAddress,
        bool isPublic
    ) internal {
        // Change Public Status on SoundProof Factory
        soundProofNFTInfo[nftAddress].isPublic = isPublic;

        // Emit The Event
        emit SoundProofNFTStatus(nftAddress, isPublic);
    }

    /** ========================== SoundProofFactory Public Founctions ========================== */
    /**
     * @dev Create New SoundProof NFT By User
     */
    function createSoundProofNFT(
        string memory _uniqueId,
        SoundProofNFTOwnership[] memory _ownerList
    ) external override payable nonReentrant {
        // Get Owner Address
        address ownerAddress = _msgSender();
        // Create New SoundProof NFT
        _createSoundProofNFT(ownerAddress, _uniqueId, "This NFT is generated and protected by SoundProofIP Community.", _ownerList, false);
    }

    /**
     * @dev Duplicate Existed SoundProofNFT
     */
    function duplicateSoundProofNFT(
        string memory _uniqueId,
        address duplicateAddress,
        address existedSoundProofNFT
    ) external override payable nonReentrant {
        require(soundProofNFTInfo[existedSoundProofNFT].nftOwner == _msgSender(), "SoundProofFactory: FORBIDDEN");

        // Get OwnerList of Original NFT
        SoundProofNFTOwnership[] memory ownerList = ISoundProofNFT(existedSoundProofNFT).getOwnerList();

        // Create New NFT as Duplicate
        _createSoundProofNFT(duplicateAddress, _uniqueId, "This NFT is duplicated by SoundProofIP Community.", ownerList, true);
    }

    /**
     * @dev Transfer Ownership of SoundProof NFT
     */
    function transferSoundProofNFTOwnership(
        address nftAddress,
        address newOwnerAddress
    ) external override {
        require(soundProofNFTInfo[nftAddress].nftOwner == _msgSender(), "SoundProofFactory: FORBIDDEN");

        // Change Owner on SoundProof Factory
        soundProofNFTInfo[nftAddress].nftOwner = newOwnerAddress;

        // Change Owner on SoundProof NFT
        ISoundProofNFT(nftAddress).changeOwnership(newOwnerAddress);
    }

    /** ========================== SoundProofFactory Admin Founctions ========================== */
    /**
     * @dev Update SoundProofUtils Address
     */
    function updateSoundProofUtils(address _soundProofUtils) external override onlyOwner {
        soundProofUtils = _soundProofUtils;
    }

    /**
     * @dev Create New NFT By SoundProof
     */
    function createSoundProofNFTByAdmin (
        address userAddress,
        string memory _uniqueId,
        SoundProofNFTOwnership[] memory _ownerList
    ) external override onlyOwner {
        // Create New SoundProof NFT
        _createSoundProofNFT(userAddress, _uniqueId, "This NFT is generated and protected by SoundProofIP Community.", _ownerList,false);
    }

    /**
     * @dev Update Metadata for SoundProofNFT
     */
     function updateSoundProofNFTMetadata(
        address nftAddress,
        address _author,
        string memory _metadataId,
        string memory _territory,
        uint256 _validFrom,
        uint256 _validTo,
        uint256 _royalty,
        string memory _rightType
    ) external override onlyOwner {
        require(soundProofNFTInfo[nftAddress].nftOwner != address(0), "SoundProofFactory: NFT not exist");

        soundProofMetadataList[nftAddress] = SoundProofMetadata(
            _author,
            _metadataId,
            _territory,
            _validFrom,
            _validTo,
            _royalty,
            _rightType
        );
    }

    /**
     * @dev Change Approve By SoundProof
     */
    function changeSoundProofNFTApprove(
        address nftAddress,
        bool isApprove 
    ) external override onlyOwner {
        require(soundProofNFTInfo[nftAddress].nftOwner != address(0), "SoundProofFactory: NFT not exist");

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
        for (uint i = 0; i < nftAddressList.length; i += 1) {
            // If NFT Exists
            if (soundProofNFTInfo[nftAddressList[i]].nftOwner != address(0)) {
                // Call Change Approve Internal Function
                _changeSoundProofNFTApprove(nftAddressList[i], isApprove);
            }
        }
    }

    /**
     * @dev Change Public/Private By SoundProof
     */
    function changeSoundProofNFTStatus(
        address nftAddress,
        bool isPublic
    ) external override onlyOwner {
        require(soundProofNFTInfo[nftAddress].nftOwner != address(0), "SoundProofFactory: NFT not exist");

        // Call Change Public/Private Internal Function
        _changeSoundProofNFTStatus(nftAddress, isPublic);
    }

    /**
     * @dev Bulk Change Public/Private By SoundProof
     */
    function changeBulkSoundProofNFTStatus(
        address[] memory nftAddressList,
        bool isPublic
    ) external override onlyOwner {
        for (uint i = 0; i < nftAddressList.length; i += 1) {
            // If NFT Exists
            if (soundProofNFTInfo[nftAddressList[i]].nftOwner != address(0)) {
                // Call Change Public/Private Internal Function
                _changeSoundProofNFTStatus(nftAddressList[i], isPublic);
            }
        }
    }

    /**
     * @dev Update WhiteList
     */
    function updateWhiteList(address userAddress, bool isWhiteList) external override onlyOwner {
        soundProofWhiteList[userAddress] = isWhiteList;
    }

    /**
     * @dev Update Bulk WhiteList
     */
    function updateBulkWhiteList(address[] memory addressList, bool isWhiteList) external override onlyOwner {
        for (uint i = 0; i < addressList.length; i += 1) {
            soundProofWhiteList[addressList[i]] = isWhiteList;
        }
    }
}
