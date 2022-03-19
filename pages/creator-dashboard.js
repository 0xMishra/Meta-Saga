import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { NFTAddress, MarketAddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/MetaSaga.sol/MetaSaga.json";
import axios from "axios";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [sold, setSold] = useState([]);

  useEffect(() => {
    loadNfts();
  }, []);

  async function loadNfts() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(NFTAddress, NFT.abi, signer);
    const marketContract = new ethers.Contract(
      MarketAddress,
      Market.abi,
      signer
    );
    const data = await marketContract.fetchMyNFTs();
    console.log(data);

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.Image,
          sold: i.sold,
        };
        return item;
      })
    );
    const soldItems = items.filter((i) => i.sold);
    console.log(items);
    setSold(soldItems);
    setNfts(items);
    setLoadingState("loaded");
  }
  if (loadingState === "loaded" && !nfts.length) {
    return (
      <h1 className="px-20 py-10 text-3xl">No items in the marketplace</h1>
    );
  }

  return (
    <div className="flex justify-center flex-col">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => {
            return (
              <div
                key={i}
                className="border-1 shadow rounded-xl overflow-hidden bg-black"
              >
                <img src={nft.image} alt="" />
                <p className="text-2xl mb-4 font-bold text-white">
                  {nft.price} MATIC
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <h2 className="text-2xl py-2">Items sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {sold.map((nft, i) => {
                return (
                  <div
                    key={i}
                    className="border-1 shadow rounded-xl overflow-hidden bg-black"
                  >
                    <img src={nft.image} alt="" />
                    <p className="text-2xl mb-4 font-bold text-white">
                      {nft.price} MATIC
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
