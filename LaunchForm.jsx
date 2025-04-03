import React, { useState } from "react";
import { ethers } from "ethers";
import WebApp from "@twa-dev/sdk";

export default function LaunchForm() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [devWallet, setDevWallet] = useState("");
  const [unlockDays, setUnlockDays] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLaunch = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factoryAddress = "0x30fbd01c741e136F5Dd73E20A50FeE8c34CFbD21";
      const factoryABI = [
        "function createToken(string,string,uint256,address,uint256) payable returns(address)",
        "event TokenLaunched(address indexed creator, address token, address pair)"
      ];

      const contract = new ethers.Contract(factoryAddress, factoryABI, signer);
      const unlockTime = Math.floor(Date.now() / 1000) + (unlockDays * 86400);

      setLoading(true);
      const tx = await contract.createToken(
        name,
        symbol,
        ethers.parseUnits(supply, 18),
        devWallet,
        unlockTime,
        { value: ethers.parseEther("0.11") }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === "TokenLaunched");
      const [creator, token, pair] = event?.args || [];

      setMessage(`✅ Token Launched!\nToken: ${token}\nPair: ${pair}`);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to launch token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto font-sans text-gray-800">
      <h1 className="text-2xl font-bold mb-4">🚀 Launch Meme Token</h1>
      <input className="border p-2 mb-2 w-full rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="border p-2 mb-2 w-full rounded" placeholder="Symbol" value={symbol} onChange={e => setSymbol(e.target.value)} />
      <input className="border p-2 mb-2 w-full rounded" placeholder="Total Supply" type="number" value={supply} onChange={e => setSupply(e.target.value)} />
      <input className="border p-2 mb-2 w-full rounded" placeholder="Dev Wallet Address" value={devWallet} onChange={e => setDevWallet(e.target.value)} />
      <input className="border p-2 mb-2 w-full rounded" placeholder="Lock Days (min 10)" type="number" value={unlockDays} onChange={e => setUnlockDays(e.target.value)} />
      <button onClick={handleLaunch} disabled={loading} className="bg-blue-600 text-white p-2 rounded w-full">
        {loading ? "Launching..." : "Launch Token"}
      </button>
      {message && <pre className="mt-4 text-sm bg-gray-100 p-2 rounded whitespace-pre-wrap">{message}</pre>}
    </div>
  );
}