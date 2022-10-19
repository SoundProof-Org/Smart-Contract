# SoundProof Smart Contract Repo

This is smart contract repository of SoundProof.
## Overview
Soundproof aims to solve one key problem: formally documenting ownership in a decentralised market in a transparent yet enforceable way, based on NFTs(Non-Foungible-Token) on blockchain. The key enabler underpinning this vision is a protocol, sitting both on-chain and off-chain.

## SoundProof SmartContracts
### 1. SoundProof Factory-Proxcy Contract
This is proxy of SoundProof Factory Contract so that we could update SoundProofFactory when version would be upgraded. <br>
`- Major Featrures`
```
* Set Implemention - Update Factory contract address on Proxy
* Transfer Ownership - Transfer Ownership of Proxy contract
```
### 2. SoundProof Factory Contract
This is major contract of SoundProof which deploy new NFT representing the Intellectual Property Rights(IPR), approve by SoundProof Community(Admin), transfer ownership, duplicate the NFT, change approve status of minted NFT(Sub-Right).<br>
`- Major Featrures`
```
* Create SoundProof NFT - Create new collection, representing the Intellectual Property Rights(IPR)
* Create SoundProof NFT By Admin - Create new collection by admin
* Transfer Ownership - Transfer ownership of existed collection
* Duplicate SoundProof NFT Collection - Duplicate the existed collection by original owner
* Change approve of existed NFT Collection - change approve or not of existed NFT by SoundProof Community(Admin)
* Change approve of minted NFT(Sub-Right) - The owner of NFT collection could change the approve status of minted NFT. If owner change it by mistake or illegal business agreement, SoundProof Community should change it.
```
### 3. SoundProof NFT Contract
This is NFT contract based on ERC-721, representing the IPR directly. <br>
`- Major Features`
```
* Mint NFT - Mint new nft on collection, representing the Sub-Right of NFT collection
* Change approve of minted NFT - If Sub-Right owner(User) do the action against the business agreement, the owner of NFT collection could change the approve status so that could represent the illegal minted NFT and not transfer too.
```

## SoundProof Contract's Major Feature Architecture
### 1. SoundProof NFT Collection Creation
![0_SoundProofNFT_Creation_Approve drawio](https://user-images.githubusercontent.com/56916797/196719570-f92e883a-460c-4dd6-a614-d9d5d7e78bc5.png)
### 2. Transfer SoundProof NFT Collection Ownership
![1_SoundProofNFT_Transfer_Ownership drawio](https://user-images.githubusercontent.com/56916797/196719595-b00e3bb6-452c-42ba-abd6-fddc2e5b15b1.png)
### 3. Duplicate SoundProof NFT Collection
![2_SoundProofNFT_Duplicate_NFT drawio](https://user-images.githubusercontent.com/56916797/196719634-8ee73366-9aea-452e-987a-f757ecdf70bd.png)
### 4. SoundProof NFT mint on Collection
![3_SoundProofNFT_Mint_Collection drawio](https://user-images.githubusercontent.com/56916797/196719677-3a776da6-7f07-4bbf-932c-4c7d156a75c3.png)

## How to install/build/test/deploy SoundProof Contract
### 1. How to install
```
npm install
```
### 2. How to build
```
npm run build
```
### 3. How to test
```
npm run test
```
### 4. How to deploy
```
npx hardhat run --network ${network} scripts/deploy.js
npx hardhat verify --network ${network} ${ContractAddress} ${parameters}
```
