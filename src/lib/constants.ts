
const isDevelopment = process.env.NEXT_PUBLIC_ENV === "development";

export const ACCOUNTABLE_CONTRACT = isDevelopment
    ? "0x094B9732f707Ce353732D1F0fBB2Fb4a09831635"
    : "0x65Aa4Fa29abA1421b06A08854A605741b280BCef";

// Import ABI directly
import AccountableABI from "../../contracts/out/Accountable.sol/Accountable.json";
export const ACCOUNTABLE_CONTRACT_ABI = AccountableABI.abi;
