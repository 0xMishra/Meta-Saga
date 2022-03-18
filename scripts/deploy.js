const hre = require("hardhat");

async function main() {
  const NftMarket = await hre.ethers.getContractFactory("MetaSaga");
  const nftMarket = await NftMarket.deploy();

  await nftMarket.deployed();

  console.log("NFT Market deployed to:", nftMarket.address);
  const Nft = await hre.ethers.getContractFactory("NFT");
  const nft = await Nft.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to: ", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
