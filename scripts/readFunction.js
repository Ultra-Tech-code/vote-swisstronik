// Import Hardhat and SwisstronikJS functions
const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/swisstronik.js");

/**
 * Send a shielded query/call to the Swisstronik blockchain.
 *
 * @param {object} provider - The provider object for making the call.
 * @param {string} destination - The address of the contract to call.
 * @param {string} data - Encoded data for the function call.
 *
 * @returns {Uint8Array} - Encrypted response from the blockchain.
 */
const sendShieldedQuery = async (provider, destination, data) => {
  // Get the RPC link from the network configuration
  const rpclink = hre.network.config.url;

  // Encrypt the call data using the SwisstronikJS function
  const [encryptedData, usedEncryptedKey] = await encryptDataField(rpclink, data);

  // Execute the call/query using the provider
  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });

  // Decrypt the call result using SwisstronikJS function
  return await decryptNodeResponse(rpclink, response, usedEncryptedKey);
};

async function main() {
  // Address of the deployed contract
  const contractAddress = "0x8d09d183A2d0D5a9cC91172a8568e0A1C27314ce";

  // Get the signer (your account)
  const [signer] = await hre.ethers.getSigners();

  // Construct a contract instance
  const contractFactory = await hre.ethers.getContractFactory("Vote");
  const contract = contractFactory.attach(contractAddress);

  // Send a shielded query to get voters from the contract
  const functionName = "getVoters";
  const responseMessage = await sendShieldedQuery(signer.provider, contractAddress, contract.interface.encodeFunctionData(functionName));

  // Decode the Uint8Array response into a readable string
  console.log("Decoded response:", contract.interface.decodeFunctionResult(functionName, responseMessage)[0]);

  // Send a shielded query to get campaigns from the contract
  const functionName2 = "getCampaign";
  const campaignId = 0;
  const responseMessage2 = await sendShieldedQuery(signer.provider, contractAddress, contract.interface.encodeFunctionData(functionName2, [campaignId]));

  // Decode the Uint8Array response into a readable string
  console.log("Decoded response:", contract.interface.decodeFunctionResult(functionName2, responseMessage2)[0]);

  // Send a shielded query to get Campaign voters from the contract
  const functionName3 = "AllCampaignVoters";
  const responseMessage3 = await sendShieldedQuery(signer.provider, contractAddress, contract.interface.encodeFunctionData(functionName3, [campaignId]));

  // Decode the Uint8Array response into a readable string
  console.log("Decoded response:", contract.interface.decodeFunctionResult(functionName3, responseMessage3)[0]);


  // Send a shielded query to get campaign Vote from the contract
  const functionName4 = "campaignVote";
  const responseMessage4 = await sendShieldedQuery(signer.provider, contractAddress, contract.interface.encodeFunctionData(functionName4, [campaignId]));

  // Decode the Uint8Array response into a readable string
  console.log("Decoded response:", contract.interface.decodeFunctionResult(functionName4, responseMessage4)[0]);


}

// Using async/await pattern to handle errors properly
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
