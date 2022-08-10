// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract MusicMarketplace {
    // Song struct
    struct Song {
        uint256 id;
        uint256 price;
        address author;
        address[] buyers;
        string title;
    }
    // array that stores all songs
    Song[] songs;
    // stores all songs URLs
    mapping(uint256 => string) private songDownloadURLs;

    // events
    event SongListed(uint256 indexed id, string title, uint256 price);
    event SongSold(uint256 indexed id, address buyer);

    modifier isAuthor(uint256 _id) {
        require(
            msg.sender == songs[_id].author,
            "You are not the author of this song"
        );
        _;
    }

    modifier isNotAuthor(uint256 _id) {
        require(
            msg.sender != songs[_id].author,
            "You are the author of this song"
        );
        _;
    }

    modifier songExists(uint256 _id) {
        require(songs.length >= _id, "The song does not exist");
        _;
    }
    // checks if msg.sender is included in buyers list of song _id
    modifier isBuyer(uint256 _id) {
        require(songs[_id].buyers.length > 0, "The song has no buyers");

        bool userIsBuyer = false;
        for (uint256 x = 0; x < songs[_id].buyers.length; x++) {
            if (songs[_id].buyers[x] == msg.sender) {
                console.log("Found buyer: ", songs[_id].buyers[x]);
                userIsBuyer = true;
            }
        }
        require(userIsBuyer, "You do not own this song.");
        _;
    }

    // checks if msg.sender is included in buyers list of song _id
    modifier isNotBuyer(uint256 _id) {
        require(songs[_id].buyers.length > 0, "The song has no buyers");

        bool userIsNotBuyer = true;
        for (uint256 x = 0; x < songs[_id].buyers.length; x++) {
            if (songs[_id].buyers[x] == msg.sender) {
                console.log("Found buyer: ", songs[_id].buyers[x]);
                userIsNotBuyer = false;
            }
        }
        require(userIsNotBuyer, "You already own this song");
        _;
    }

    function listSong(
        string memory _title,
        uint256 _price,
        string memory _arweaveURI
    ) public {
        // save file info to files array
        Song memory song;

        song.id = songs.length;
        // save price and other info to song struct
        song.price = _price;
        song.author = msg.sender;
        song.title = _title;
        // create array to store buyers and
        // include the author
        address[] memory buyers = new address[](1);
        buyers[0] = msg.sender;
        // save buyers to song struct
        song.buyers = buyers;
        // save to list of songs
        songs.push(song);

        // save the file's arweave URI in private mapping
        console.log("Listing file with id", song.id);
        songDownloadURLs[song.id] = _arweaveURI;

        emit SongListed(song.id, _title, _price);
    }

    function buySong(uint256 _id)
        external
        payable
        songExists(_id)
        isNotAuthor(_id)
        isNotBuyer(_id)
    {
        // check if user sent enough funds
        require(msg.value >= songs[_id].price, "Not enough funds");

        // transfer funds
        address payable receiver = payable(songs[_id].author);
        (bool sent, ) = receiver.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        // add sender to buyers array
        songs[_id].buyers.push(msg.sender);

        emit SongSold(_id, msg.sender);
    }

    function getSongs() public view returns (Song[] memory) {
        return songs;
    }

    function getOwnedSongs() public view returns (Song[] memory) {
        uint256 resCount = 0;

        for (uint256 i = 0; i < songs.length; i++) {
            if (songs[i].author == msg.sender) {
                resCount++;
            }
        }
        Song[] memory ownedSongs = new Song[](resCount);
        for (uint256 x = 0; x < songs.length; x++) {
            if (songs[x].author == msg.sender) {
                ownedSongs[x] = songs[x];
            }
        }
        return ownedSongs;
    }

    function getDownloadLink(uint256 _id)
        public
        view
        songExists(_id)
        isBuyer(_id)
        returns (string memory)
    {
        return songDownloadURLs[_id];
    }

    function getBoughtSongs() public view returns (Song[] memory) {
        uint64 resCount = 0;

        for (uint256 i = 0; i < songs.length; i++) {
            if (songs[i].buyers.length > 0) {
                for (uint256 x = 0; x < songs[i].buyers.length; x++) {
                    if (songs[i].buyers[x] == msg.sender) {
                        resCount++;
                    }
                }
            }
        }

        require(resCount > 0, "You bought no songs");

        Song[] memory boughtSongs = new Song[](resCount);

        for (uint256 j = 0; j < songs.length; j++) {
            if (songs[j].buyers.length > 0) {
                for (uint256 v = 0; v < songs[j].buyers.length; v++) {
                    if (songs[j].buyers[v] == msg.sender) {
                        boughtSongs[j] = songs[j];
                    }
                }
            }
        }
        return boughtSongs;
    }
}
