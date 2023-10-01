// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Vote {
    //state Variables
    address private admin;
    uint256 private campaignId;
    address[] private votersList;
    Campaign[] private allCampaigns;


    //events
    event Voted(address indexed voter, uint256 indexed campaignId, uint256 indexed time);
    event CampaignCreated(address indexed campaignCreator, uint256 indexed campaignId, uint256 indexed time);


    struct Campaign{
        address campaignCreator;
        string name;
        uint256 duration;
        uint voteCount;
    }

    constructor(){
       admin = msg.sender;
    }
    

    // modifiers
    modifier onlyAdmin(){
        require(msg.sender == admin, "NOTADMIN!!");
        _;
    }

    modifier onlyVoter(){
        require(voters[msg.sender] == true, "NOT VOTER!!");
        _;
    }

    modifier votersAndAdmin(){
        require(voters[msg.sender] == true || msg.sender == admin, "NOT VOTER OR ADMIN!!");
        _;
    }

    modifier campaignIdcheck(uint256 _campaignId){
        require(campaigns[_campaignId].campaignCreator != address(0), "Inavlid Campaign Id");
        _;
    }



    //mappings
    mapping(address => bool) private voters;
    mapping(uint256 => Campaign) private campaigns;
    mapping(address => uint256[]) private allUserCampaings;
    mapping(uint256 => address[]) private allCampaignVoters;
    mapping(address => mapping(uint256 => bool)) private hasVoted;

    /**
     * @dev function for admin to register voters
     */
    function registerVoter(address _voter) public onlyAdmin{
        voters[_voter] = true;
        votersList.push(_voter);
    }

    /**
     * @dev function for creating campaign
     */
    function createCampaign(string memory _CampaingName, uint256 _duration) votersAndAdmin public{
        bytes memory strBytes = bytes(_CampaingName);
        require(strBytes.length > 0, "Invalid CampaingName");
        require(_duration > 0, "Invalid duration");

        uint256 userCampaignId = campaignId;
        uint256 campaignDuration = block.timestamp + _duration;
        campaigns[userCampaignId] = Campaign(msg.sender, _CampaingName,campaignDuration, 0);
        allUserCampaings[msg.sender].push(userCampaignId);
        campaignId ++;

        emit CampaignCreated(msg.sender, userCampaignId, block.timestamp);
    }
       
    /**
     * @dev function for registered voters to vote
     */
    function vote(uint256 _campaignId) public onlyVoter campaignIdcheck(_campaignId){
        require(hasVoted[msg.sender][_campaignId] == false, "ALREADY VOTED!!");
        require(campaigns[_campaignId].duration > block.timestamp, "Voting period is over");
        campaigns[_campaignId].voteCount += 1;
        hasVoted[msg.sender][_campaignId] = true;
        allCampaignVoters[_campaignId].push(msg.sender);

        emit Voted(msg.sender, _campaignId, block.timestamp);
    }

    /**
     * @dev function to change admin
     */
    function changeAdmin(address _newAdmin) public onlyAdmin{
        admin = _newAdmin;
    }

    /**
     * @dev function to return all voters
     */
    function getVoters() public view votersAndAdmin returns(address[] memory){
        return votersList;
    }
    
    /**
     * @dev function to get a campaign
     */
    function getCampaign(uint256 _campaignId) public view campaignIdcheck(_campaignId) votersAndAdmin returns(Campaign memory){
        return (campaigns[_campaignId]);
    }

    /**
     * @dev function to get all campaigns created by a user
     */
    function AllUserCampaigns(address _userAddress) public view votersAndAdmin returns(Campaign[] memory){
        uint256[] memory allUserCampaignIndex = allUserCampaings[_userAddress];
        Campaign[] memory userCampaign = new Campaign[](allUserCampaignIndex.length);
    
        for (uint256 i = 0; i < allUserCampaignIndex.length; i++) {
            uint256 campaignIndex = allUserCampaignIndex[i];
            require(campaignIndex < campaignId, "Invalid campaign index");
            userCampaign[i] = campaigns[campaignIndex];
        }
    
        return userCampaign; 
    }

    /**
     * @dev function to get all voters of a campaign
     */
    function AllCampaignVoters(uint256 _campaignId) public view campaignIdcheck(_campaignId) votersAndAdmin returns(address[] memory){
        return allCampaignVoters[_campaignId];
    }

    /**
     * @dev function to get all campaigns
     */
    function allCampaign() public view votersAndAdmin returns(Campaign[] memory){
        return allCampaigns;
    }

    /**
     * @dev function to get vote count of a campaign
     */
    function campaignVote(uint256 _campaignId) public view campaignIdcheck(_campaignId) votersAndAdmin returns(uint256){
        return campaigns[_campaignId].voteCount;
    }

}
