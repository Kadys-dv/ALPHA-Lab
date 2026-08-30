// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {AlphaToken} from "./AlphaToken.sol";

contract AlphaReceiver {}

contract AlphaSpender {
    function pull(
        AlphaToken token,
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        return token.transferFrom(from, to, amount);
    }

    function spendOwnBalance(
        AlphaToken token,
        address to,
        uint256 amount
    ) external returns (bool) {
        return token.transfer(to, amount);
    }
}

contract AlphaTokenTest {
    AlphaToken private token;
    AlphaReceiver private receiver;
    AlphaSpender private spender;

    function setUp() public {
        token = new AlphaToken();
        receiver = new AlphaReceiver();
        spender = new AlphaSpender();
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

    function test_TransferWorksWithoutChangingSupply() public {
        uint256 amount = 250 * 10 ** 18;
        uint256 supplyBefore = token.totalSupply();
        bool success = token.transfer(address(receiver), amount);

        require(success, "transfer should succeed");
        require(token.balanceOf(address(receiver)) == amount, "receiver balance mismatch");
        require(token.totalSupply() == supplyBefore, "transfer must not change supply");
    }

    function test_ApproveAndTransferFromWork() public {
        uint256 approved = 100 * 10 ** 18;
        uint256 spent = 40 * 10 ** 18;
        uint256 supplyBefore = token.totalSupply();

        require(token.approve(address(spender), approved), "approve should succeed");
        require(
            token.allowance(address(this), address(spender)) == approved,
            "allowance mismatch before transferFrom"
        );

        require(
            spender.pull(token, address(this), address(receiver), spent),
            "transferFrom should succeed"
        );
        require(token.balanceOf(address(receiver)) == spent, "receiver balance mismatch");
        require(
            token.allowance(address(this), address(spender)) == approved - spent,
            "allowance should decrease"
        );
        require(token.totalSupply() == supplyBefore, "transferFrom must not change supply");
    }

    function test_EmptyAccountCannotSpend() public {
        (bool ok, ) = address(spender).call(
            abi.encodeCall(
                AlphaSpender.spendOwnBalance,
                (token, address(receiver), 1)
            )
        );
        require(!ok, "account with zero balance must not transfer");
    }

    function test_TransferToZeroAddressReverts() public {
        (bool ok, ) = address(token).call(
            abi.encodeWithSelector(token.transfer.selector, address(0), 1)
        );
        require(!ok, "transfer to zero address must revert");
    }
}
