//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MetaSaga is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemId;
  Counters.Counter private _itemsSold;

  address payable owner;
  uint256 listingPrice = 0.3 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint256 itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) private _idToMarketItem;

  event MarketItemCreated(
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address payable seller,
    address payable owner,
    uint256 price,
    bool sold
  );

  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

  function createMarketItem(
    address _nftContract,
    uint256 _tokenId,
    uint256 _price
  ) public payable nonReentrant {
    require(_price > 0, "price can't be zero");
    require(
      msg.value == listingPrice,
      "value should be equal to listing price"
    );

    _itemId.increment();
    uint256 newItemId = _itemId.current();
    _idToMarketItem[newItemId] = MarketItem(
      newItemId,
      _nftContract,
      _tokenId,
      payable(msg.sender),
      payable(address(0)),
      _price,
      false
    );
    IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

    emit MarketItemCreated(
      newItemId,
      _nftContract,
      _tokenId,
      payable(msg.sender),
      payable(address(0)),
      _price,
      false
    );
  }

  function createMarketSale(address _nftContract, uint256 itemId)
    public
    payable
    nonReentrant
  {
    uint256 price = _idToMarketItem[itemId].price;
    uint256 tokenId = _idToMarketItem[itemId].tokenId;
    require(msg.value == price, "please pay the asked price");
    _idToMarketItem[itemId].seller.transfer(msg.value);
    IERC721(_nftContract).transferFrom(address(this), msg.sender, tokenId);
    _idToMarketItem[itemId].owner = payable(msg.sender);
    _idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    payable(owner).transfer(listingPrice);
  }

  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint256 itemCount = _itemId.current();
    uint256 unSoldItemCount = itemCount - _itemsSold.current();
    uint256 currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unSoldItemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      if (_idToMarketItem[i + 1].owner == address(0)) {
        uint256 currentId = _idToMarketItem[i + 1].itemId;
        MarketItem storage currentItem = _idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex++;
      }
    }
    return items;
  }

  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _itemId.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (_idToMarketItem[i + 1].owner == msg.sender) {
        itemCount++;
      }
    }

    MarketItem[] memory myNFTs = new MarketItem[](itemCount);

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (_idToMarketItem[i + 1].owner == msg.sender) {
        uint256 currentId = _idToMarketItem[i + 1].itemId;
        MarketItem storage currentItem = _idToMarketItem[currentId];
        myNFTs[currentIndex] = currentItem;
        currentIndex++;
      }
    }
    return myNFTs;
  }

  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint256 totalItemsCount = _itemId.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i; i < totalItemsCount; i++) {
      if (_idToMarketItem[i + 1].seller == msg.sender) {
        itemCount++;
      }
    }

    MarketItem[] memory mySoldNFTs = new MarketItem[](itemCount);

    for (uint256 i; i < totalItemsCount; i++) {
      if (_idToMarketItem[i + 1].seller == msg.sender) {
        uint256 currentId = _idToMarketItem[i + 1].itemId;
        MarketItem storage currentItem = _idToMarketItem[currentId];
        mySoldNFTs[currentIndex] = currentItem;
        currentIndex++;
      }
    }
    return mySoldNFTs;
  }
}
