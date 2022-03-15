//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenId;
  address contractAddress;

  constructor(address MarketAddress) ERC721("Comic coders", "CC") {
    contractAddress = MarketAddress;
  }

  function createToken(string memory _tokenURI) public returns (uint256) {
    _tokenId.increment();
    uint256 newItemId = _tokenId.current();
    _safeMint(msg.sender, newItemId);
    _setTokenURI(newItemId, _tokenURI);
    setApprovalForAll(contractAddress, true);
    return newItemId;
  }
}
