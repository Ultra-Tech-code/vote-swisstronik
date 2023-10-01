// Import Hardhat and SwisstronikJS functions
const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/swisstronik.js");

/**
 * Send a shielded transaction to the Swisstronik blockchain.
 *
 * @param {object} signer - The signer object for sending the transaction.
 * @param {string} destination - The address of the contract to interact with.
 * @param {string} data - Encoded data for the transaction.
 * @param {number} value - Amount of value to send with the transaction.
 *
 * @returns {Promise} - The transaction object.
 */
const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the network configuration
  const rpclink = hre.network.config.url;

  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpclink, data);

  // Construct and sign transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  // Address of the deployed contract
  const contractAddress = "0x3D98a2f7dFdAB3c09A28e95f5e49f26be87f7f95";

  // Get the signer (your account)
  const [signer] = await hre.ethers.getSigners();

  // Construct a contract instance
  const contractFactory = await hre.ethers.getContractFactory("Vote");
  const contract = contractFactory.attach(contractAddress);

  // Send a shielded transaction to register voter in the contract
  const functionName = "registerVoter";
  const votersAddress = "0x311350f1c7Ba0F1749572Cc8A948Dd7f9aF1f42a";
  const registerVoterTx = await sendShieldedTransaction(signer, contractAddress, contract.interface.encodeFunctionData(functionName, [votersAddress]), 0);
  await registerVoterTx.wait();

  //It should return a TransactionResponse object
  console.log("Transaction Receipt: ", registerVoterTx);


  // Send a shielded transaction to create campaign in the contract
  const functionName2 = "createCampaign";
  const campaignName = "Donate for Greece thunderstrike incident";

  //20 days in Block.timestamp
  const campaignEndDate = 20 * 24 * 60 * 60;
  const createCampaignTx = await sendShieldedTransaction(signer, contractAddress, contract.interface.encodeFunctionData(functionName2, [campaignName, campaignEndDate]), 0);
  await createCampaignTx.wait();

  //It should return a TransactionResponse object
  console.log("Transaction Receipt: ", createCampaignTx);


  // Send a shielded transaction to vote in the contract
  const functionName3 = "vote";
  const campaignId = 0;
  const voteTx = await sendShieldedTransaction(signer, contractAddress, contract.interface.encodeFunctionData(functionName3, [campaignId]), 0);
  await voteTx.wait();

  //It should return a TransactionResponse object
  console.log("Transaction Receipt: ", voteTx);

}

// Using async/await pattern to handle errors properly
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
