// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface ISoundProofNFT {
    function initialize(address _nftOwner, string memory _name, string memory _symbol) external;
}