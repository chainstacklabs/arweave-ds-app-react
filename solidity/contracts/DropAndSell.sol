// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract DropAndSell {
    struct File {
        uint256 id;
        uint256 price;
        address owner;
        address[] buyers;
        string title;
    }

    File[] files;
    string[] filePaths;

    // mapping(uint256 => string) private filePaths;

    event FileListed(uint256 indexed id, string title, uint256 price);
    event FileSold(uint256 indexed id, address buyer);

    function listFile(
        string memory _title,
        uint64 _price,
        string memory _arweaveURI
    ) public {
        // save file info to files array
        File memory file;

        file.id = files.length;
        // save price in wei
        file.price = _price; //* 10 * 18;
        file.owner = msg.sender;
        file.title = _title;
        files.push(file);

        // save the file arweave URI in private mapping
        // filePaths[files.length] = _arweaveURI;
        filePaths.push(_arweaveURI);

        emit FileListed(file.id, _title, _price);

        // return filePaths;
    }

    function buyFile(uint256 _id) public payable returns (string[] memory) {
        // check if file exists
        require(_id <= files.length, "The file does not exists");

        // check if sender is the owner
        require(
            files[_id].owner != msg.sender,
            "You are the owner of this file"
        );

        console.log("Checked owner");
        console.log("Contract balance: ", address(this).balance);
        console.log("msg.value: ", msg.value);
        console.log("file price: ", files[_id].price);

        // check if sender has enough funds
        require(msg.value >= files[_id].price, "Not enough funds");

        console.log("Checked funds");

        // transfer funds
        address payable receiver = payable(files[_id].owner);
        (bool sent, ) = receiver.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        console.log("Ether sent");

        // add sender to buyers array
        files[_id].buyers.push(msg.sender);
        console.log("Added buyer");

        emit FileSold(_id, msg.sender);

        // console.log(files[_id].buyers);
        // return path to download file
        return filePaths;
    }

    function getFiles() public view returns (File[] memory) {
        return files;
    }

    function getOwnedFiles() public view returns (File[] memory) {
        uint256 resCount = 0;

        for (uint256 i = 0; i < files.length; i++) {
            if (files[i].owner == msg.sender) {
                resCount++;
            }
        }
        File[] memory ownedFiles = new File[](resCount);
        for (uint256 x = 0; x < files.length; x++) {
            if (files[x].owner == msg.sender) {
                ownedFiles[x] = files[x];
            }
        }
        return ownedFiles;
    }

    function getBoughtFiles() public view returns (File[] memory) {
        uint256 resCount;

        console.log("files.length: ", files.length);

        for (uint256 i = 0; i < files.length - 1; i++) {
            console.log("i:", i);
            if (files[i].buyers.length > 0) {
                console.log("Length: ", files[i].buyers.length);
                for (uint256 x = 0; i < files[i].buyers.length - 1; x++) {
                    console.log("x", x);
                    if (files[i].buyers[x] == msg.sender) {
                        console.log("Found buyer: ", files[i].buyers[x]);
                        resCount++;
                        console.log("resCount: ", resCount);
                    }
                }
            }
        }

        console.log("resCount after loop: ", resCount);

        File[] memory boughtFiles = new File[](resCount);

        for (uint256 j = 0; j < files.length - 1; j++) {
            if (files[j].buyers.length > 0) {
                console.log("Length: ", files[j].buyers.length);
                for (uint256 v = 0; v < files[j].buyers.length - 1; v++) {
                    if (files[j].buyers[v] == msg.sender) {
                        boughtFiles[j] = files[j];
                    }
                }
            }
        }
        return boughtFiles;
    }
}
