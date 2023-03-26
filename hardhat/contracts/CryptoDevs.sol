// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    string _baseTokenURI;

    IWhitelist whitelist;

    bool public presaleStarted;

    uint256 public presaleEnded;

    uint256 public maxTokenIds = 20;

    uint256 public tokenIds;

    uint256 public _price = 0.01 ether;

    bool public _paused;

    modifier onlyWhenNotPaused() {
        require(!_paused, "contract currently paused");
        _;
    }

    constructor(
        string memory basaURI,
        address whitelistContract
    ) ERC721("skyBlue", "SKY") {
        _baseTokenURI = basaURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "presale ended"
        );
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "you are not in whitelist"
        );
        require(tokenIds < maxTokenIds, "Exceeded the limit");
        require(msg.value >= _price, "ether sent is not correct");
        tokenIds += 1;

        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "presale has not yet ended"
        );
        require(tokenIds < maxTokenIds, "Exceeded the limit");
        require(msg.value >= _price, "ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    function withdraw() public onlyOwner {
        address owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = owner.call{value: amount}("");
        require(sent, "falied to send ether");
    }

    receive() external payable {}

    fallback() external payable {}
}
