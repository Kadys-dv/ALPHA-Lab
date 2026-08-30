// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Alpha Token
/// @notice ERC-20 educacional, de supply fixo, criado para estudo e experimentos em testnet.
/// @dev Não possui mint posterior, taxa, blacklist, pausa, owner ou funções administrativas.
contract AlphaToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18;

    constructor() ERC20("Alpha", "ALPHA") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
