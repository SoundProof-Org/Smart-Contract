// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "./ISoundProofBase.sol";

contract SoundProofFactoryEvents {
    /// @notice Create NFT Event
    event SoundProofNFTCreated(address indexed ownerAddress, address indexed nftAddress, uint);
}

contract SoundProofFactoryStorage is SoundProofBaseStorage {
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
        /// Royalty, Percentage which going back to author for every sale, e.x: 50% = 5000
        uint256 royalty;
        /// Right Type, e.x: commercial use, personal use, resale etc
        string rightType;
    }

    /// @notice SoundProofUniqueID List
    mapping (string => bool) public soundProofUniqueIDList;

    /// @notice SoundProofMetadata
    mapping (address => SoundProofMetadata) public soundProofMetadataList;

    /// @notice All NFT Storage List
    address[] public allNFTStorageList;

    /// @notice SoundProof NFT Info
    mapping (address => SoundProofNFTInfo) public soundProofNFTInfo;

    /// @notice SoundProof White List
    mapping (address => bool) public soundProofWhiteList;

    /// @notice SoundProof Utils
    address public soundProofUtils;
}

abstract contract ISoundProofFactory is SoundProofFactoryEvents, SoundProofFactoryStorage {
    /// Get Functions
    function allStorageListLength() public view virtual returns (uint256 length);
    function allUserNFTCount(address userAddress) public view virtual returns (uint256 userCount);
    function allNFTList(address userAddress) public view virtual returns (address[] memory nftList);
    function getNFTInfo(address nftAddress) public view virtual returns (SoundProofNFTInfo memory nftInfo);

    /// User Functions
    function createSoundProofNFT(string memory _uniqueId, SoundProofNFTOwnership[] memory _ownerList) external virtual payable;
    function duplicateSoundProofNFT(string memory _uniqueId, address duplicateAddress, address existedSoundProofNFTAddress) external virtual payable;
    function transferSoundProofNFTOwnership(address nftAddress, address newOwnerAddress) external virtual;

    /// Admin Functions
    function updateSoundProofUtils(address _soundProofUtils) external virtual;
    function createSoundProofNFTByAdmin(address userAddress, string memory _uniqueId, SoundProofNFTOwnership[] memory _ownerList) external virtual;
    function updateSoundProofNFTMetadata(
        address nftAddress,
        address _author,
        string memory _metadataId,
        string memory _territory,
        uint256 _validFrom,
        uint256 _validTo,
        uint256 _royalty,
        string memory _rightType
    ) external virtual;

    // Approve Change Functions
    function changeSoundProofNFTApprove(address nftAddress, bool isApprove) external virtual;
    function changeBulkSoundProofNFTApprove(address[] memory nftAddressList, bool isApprove) external virtual;

    // Public/Private Change Functions
    function changeSoundProofNFTStatus(address nftAddress, bool isPublic) external virtual;
    function changeBulkSoundProofNFTStatus(address[] memory nftAddressList, bool isPublic) external virtual;

    function updateWhiteList(address userAddress, bool isWhiteList) external virtual;
    function updateBulkWhiteList(address[] memory addressList, bool isWhiteList) external virtual;
}