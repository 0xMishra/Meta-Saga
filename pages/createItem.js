import { ethers } from "ethers";
import { useState } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import { NFTAddress, MarketAddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/MetaSaga.sol/MetaSaga.json";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState("");
  const [formInput, setFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log(error);
    }
  }

  async function createItem(e) {
    const { name, description, price } = formInput;
    if (!name || !description || !price) {
      return;
    }
    const data = JSON.stringify({
      name,
      description,
      Image: fileUrl,
    });
    console.log(data);
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (error) {
      console.log(error);
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(NFTAddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let txn = await transaction.wait();
    let event = txn.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(MarketAddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    transaction = await contract.createMarketItem(NFTAddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          type="text"
          placeholder="asset name"
          className="m-8 border rounded p-4"
          name=""
          id=""
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          name=""
          id=""
          cols="30"
          rows="10"
          placeholder="asset description"
          onChange={(e) =>
            setFormInput({ ...formInput, description: e.target.value })
          }
          className="mt-2 border rounded p-4"
        ></textarea>
        <input
          type="text"
          placeholder="asset price"
          className="m-8 border rounded p-4"
          name=""
          id=""
          onChange={(e) =>
            setFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="asset" className="my-4" onChange={onChange} />
        {fileUrl && (
          <img src={fileUrl} alt="" width={350} className="rounded mt-4" />
        )}
        <button
          onClick={(e) => createItem(e)}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
}
