# Soundproof Smart Contract Repo

This is smart contract repository of Soundproof.
## Overview
Soundproof aims to solve one key problem: formally documenting ownership in a decentralised market in a transparent yet enforceable way, based on NFTs(Non-Foungible-Token) on blockchain. The key enabler underpinning this vision is a protocol, sitting both on-chain and off-chain.
![4_SoundProofNFT_Flow_Component drawio](https://user-images.githubusercontent.com/56916797/198028693-1893a199-3781-4524-91a2-56de997fa43c.png)

## Soundproof SmartContracts
### 1. Soundproof Factory-Proxy Contract
This is proxy of Soundproof Factory Contract so that we could update Soundproof Factory when version would be upgraded. <br>
`- Major Features`
```
* Set Implemention - Update Factory contract address on Proxy
* Transfer Ownership - Transfer Ownership of Proxy contract
```
### 2. Soundproof Factory Contract
This is major contract of Soundproof which deploy new NFT representing the Intellectual Property Rights(IPR), approve by Soundproof Community(Admin), transfer ownership, duplicate the NFT, change approve status of minted NFT(Sub-Right).<br>
`- Major Features`
```
* Create Soundproof NFT - Create new collection, representing the Intellectual Property Rights(IPR)
* Create Soundproof NFT By Admin - Create new collection by admin
* Transfer Ownership - Transfer ownership of existed collection
* Duplicate Soundproof NFT Collection - Duplicate the existed collection by original owner
* Change approve of existed NFT Collection - change approve or not of existed NFT by Soundproof Community(Admin)
* Change approve of minted NFT(Sub-Right) - The owner of NFT collection could change the approve status of minted NFT. If owner change it by mistake or illegal business agreement, Soundproof Community should change it.
```
### 3. Soundproof NFT Contract
This is NFT contract based on ERC-721, representing the IPR directly. <br>
`- Major Features`
```
* Mint NFT - Mint new NFT on collection, representing the Sub-Right of NFT collection
* Change approve of minted NFT - If Sub-Right owner(User) do the action against the business agreement, the owner of NFT collection could change the approve status so that could represent the illegal minted NFT and not transfer too.
```

## Soundproof Contract's Major Feature Architecture
### 1. Soundproof NFT Collection Creation
![0_SoundProofNFT_Creation_Approve drawio](https://user-images.githubusercontent.com/56916797/196791514-1707d58e-7093-4720-a65d-f0637421decc.png)
### 2. Transfer Soundproof NFT Collection Ownership
![1_SoundProofNFT_Transfer_Ownership drawio](https://user-images.githubusercontent.com/56916797/196791540-21a3b03a-423e-4ddc-9081-7edc6e3af4c8.png)
### 3. Duplicate Soundproof NFT Collection
![2_SoundProofNFT_Duplicate_NFT drawio](https://user-images.githubusercontent.com/56916797/196791565-eb42f351-ecd1-4cfd-9311-0df48bcd412c.png)
### 4. Soundproof NFT mint on Collection
![3_SoundProofNFT_Mint_Collection drawio](https://user-images.githubusercontent.com/56916797/196791617-35dca88b-7095-4e59-94b9-9bd095cea377.png)

## How to install/build/test/deploy Soundproof Contract
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
