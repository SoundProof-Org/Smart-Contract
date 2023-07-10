// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IERC721 is IERC165 {
    function balanceOf(address owner) external view returns (uint balance);

    function ownerOf(uint tokenId) external view returns (address owner);

    function safeTransfer(
        address to,
        uint tokenId
    ) external;

    function safeTransferFrom(
        address from,
        address to,
        uint tokenId
    ) external;

    function transferFrom(
        address from,
        address to,
        uint tokenId
    ) external;

    function approve(address to, uint tokenId) external;

    function getApproved(uint tokenId) external view returns (address operator);

    function setApprovalForAll(address operator, bool _approved) external;

    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

contract ERC721MinimalUpdate is IERC721 {
    event Transfer(address indexed from, address indexed to, uint indexed id);
    event Approval(address indexed owner, address indexed spender, uint indexed id);
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    // Owner Address Array List
    address[] internal _owners;

    // Mapping from token ID to approved address
    mapping(uint => address) internal _approvals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) public override isApprovedForAll;

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    function ownerOf(uint id) public view override returns (address owner) {
        owner = _owners[id];
        require(owner != address(0), "token doesn't exist");
    }

    function balanceOf(address owner) public view override returns (uint) {
        require(owner != address(0), "ERC721: balance query for the zero address");
        
        uint count = 0;
        uint length = _owners.length;
        for (uint i = 0; i < length; ++i ) {
          if( owner == _owners[i] ){
            count += 1;
          }
        }

        delete length;
        return count;
    }

    function tokenOfOwnerByIndex(address owner) public view returns (uint[] memory tokenIdList) {
        require(owner != address(0), "ERC721: Tokens of Owner for the zero address");

        uint ownerBalance = balanceOf(owner);
        uint id = 0;

        tokenIdList = new uint[](ownerBalance);
        uint totalLength = _owners.length;
        for (uint i = 0; i < totalLength; i += 1) {
            if (_owners[i] == owner) {
                tokenIdList[id] = i;
                id += 1;
            }
        }
    }

    function _approve(address to, uint256 tokenId) internal virtual {
        _approvals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external override {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function approve(address spender, uint id) external override {
        address owner = ownerOf(id);
        require(
            msg.sender == owner || isApprovedForAll[owner][msg.sender],
            "not authorized"
        );

        _approve(spender, id);
        emit Approval(owner, spender, id);
    }

    function getApproved(uint id) external view override returns (address) {
        require(_owners[id] != address(0), "token doesn't exist");
        return _approvals[id];
    }

    function _isApprovedOrOwner(
        address owner,
        address spender,
        uint id
    ) internal view returns (bool) {
        return (spender == owner ||
            isApprovedForAll[owner][spender] ||
            spender == _approvals[id]);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {
        require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        _approve(address(0), tokenId);
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint id
    ) public override {
        require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");

        _transfer(from, to, id);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint id
    ) public virtual override {
        transferFrom(from, to, id);

        require(
            to.code.length == 0 ||
                IERC721Receiver(to).onERC721Received(msg.sender, from, id, "") ==
                IERC721Receiver.onERC721Received.selector,
            "unsafe recipient"
        );
    }

    function safeTransfer(address to, uint id) public virtual override {
        address from = msg.sender;

        safeTransferFrom(from, to, id);
    }

    function _mint(address to, uint id) internal {
        require(to != address(0), "mint to zero address");

        _beforeTokenTransfer(address(0), to, id);

        _owners.push(to);

        emit Transfer(address(0), to, id);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}
}