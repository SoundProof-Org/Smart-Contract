// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "./ERC721MinimalUpdate.sol";
import "./libraries/ChainId.sol";

/**
 * ERC721 Permit Contract
 */
contract ERC721Permit is ERC721MinimalUpdate {
    /// @notice TokenID Nonce
    mapping(uint256 => uint256) public nonces;

    /// @dev Permit Typehash
    bytes32 public immutable PERMIT_TYPEHASH;

    /// @dev Domain Separator
    bytes32 public immutable DOMAIN_SEPARATOR;

    /// @notice Computes the Name Hash and Version Hash
    constructor() {
        PERMIT_TYPEHASH = keccak256("Permit(address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("SoundProofIP NFT")),
                keccak256(bytes("v1")),
                ChainId.get(),
                address(this)
            )
        );
    }

    function getChainId() public view returns (uint256) {
        return ChainId.get();
    }

    function permit(
        address spender,
        uint256 tokenId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        require(block.timestamp <= deadline, "Permit expired");

        bytes32 digest =
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    keccak256(abi.encode(PERMIT_TYPEHASH, spender, tokenId, nonces[tokenId]++, deadline))
                )
            );
        address owner = ownerOf(tokenId);
        require(spender != owner, "ERC721Permit: approval to current owner");

        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0), "ERC721Permit: Invalid signature");
        require(recoveredAddress == owner, "ERC721Permit: Unauthorized");

        _approve(spender, tokenId);
    }
}
