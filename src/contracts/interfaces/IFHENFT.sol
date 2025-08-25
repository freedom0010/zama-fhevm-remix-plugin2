// IFHENFT interface
// src/contracts/interfaces/IFHEToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// TODO: Import OpenZeppelin IERC20 when ready
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFHEToken {
    // Standard ERC20 events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // FHE-specific events
    event EncryptedTransfer(address indexed from, address indexed to, bytes encryptedAmount);
    event BalanceEncrypted(address indexed account, bytes encryptedBalance);

    // Standard ERC20 functions
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // Owner functions
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;

    // FHE functions (placeholder interfaces)
    function encryptedBalanceOf(bytes calldata encryptedQuery) external view returns (bytes memory);
    function encryptedTransfer(address to, bytes calldata encryptedAmount) external returns (bool);
    function encryptedTransferFrom(address from, address to, bytes calldata encryptedAmount) external returns (bool);
    function encryptedAllowance(address owner, address spender, bytes calldata encryptedQuery) external view returns (bytes memory);
    function encryptedApprove(address spender, bytes calldata encryptedAmount) external returns (bool);
}