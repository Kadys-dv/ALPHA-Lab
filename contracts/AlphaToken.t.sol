// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {AlphaToken} from "./AlphaToken.sol";

contract AlphaReceiver {}

contract AlphaTokenTest {
    AlphaToken private token;
    AlphaReceiver private receiver;

    function setUp() public {
        token = new AlphaToken();
        receiver = new AlphaReceiver();
    }

    function test_NameAndSymbol() public view {
        require(
            keccak256(bytes(token.name())) == keccak256(bytes("Alpha")),
            "name should be Alpha"
        );
        require(
            keccak256(bytes(token.symbol())) == keccak256(bytes("ALPHA")),
            "symbol should be ALPHA"
        );
    }

    function test_DecimalsAre18() public view {
        require(token.decimals() == 18, "decimals should be 18");
    }

    function test_FixedInitialSupply() public view {
        uint256 expected = 100_000_000 * 10 ** 18;
        require(token.totalSupply() == expected, "wrong total supply");
        require(token.INITIAL_SUPPLY() == expected, "wrong supply constant");
        require(token.balanceOf(address(this)) == expected, "deployer must receive supply");
    }

    function test_TransferWorks() public {
        uint256 amount = 250 * 10 ** 18;
        bool success = token.transfer(address(receiver), amount);

        require(success, "transfer should succeed");
        require(token.balanceOf(address(receiver)) == amount, "receiver balance mismatch");
        require(
            token.totalSupply() == 100_000_000 * 10 ** 18,
            "transfer must not change supply"
        );
    }
}
