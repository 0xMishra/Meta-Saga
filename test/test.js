const { expect } = require("chai");

describe("MetaSaga", () => {
  it("should create and excute market sale", async () => {
    const Market = await ethers.getContractFactory("MetaSaga");
    const market = await Market.deploy();
    await market.deployed();
    const MarketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(MarketAddress);
    await nft.deployed();

    const nftContractAddress = nft.address;
    console.log(nftContractAddress);
    const listingPrice = await market.getListingPrice();
    const auctionPrice = ethers.utils.parseUnits("100", "ether");

    await nft.createToken("https://www.mytokenlocation.com");
    await nft.createToken("https://www.mytokenlocation2.com");

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {
      value: listingPrice.toString(),
    });
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {
      value: listingPrice.toString(),
    });

    const [_, buyerAddress] = await ethers.getSigners();

    await market
      .connect(buyerAddress)
      .createMarketSale(nftContractAddress, 1, { value: auctionPrice });

    let items = await market.fetchMarketItems();

    items = await Promise.all(
      items.map(async (i) => {
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri,
        };
        return item;
      })
    );
    console.log(items);
  });
});
