// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "./ISoundProofBase.sol";

/**
 * SoundProof Utils Interface
 */
abstract contract ISoundProofUtils is SoundProofBaseStorage {
    function checkOwnedPercentage(SoundProofNFTOwnership[] memory ownerList) public pure virtual returns (bool);
    function stringToBytes32(string memory str) public pure virtual returns (bytes32 result);
    function stringToBytes(string memory str) public pure virtual returns (bytes memory);
    function recoverSigner(bytes32 message, bytes memory signature) public pure virtual returns(address);
    function recoverSignerWithRVS(bytes32 message, bytes32 r, bytes32 s, uint8 v) public pure virtual returns(address);
}