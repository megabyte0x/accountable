import fs from "fs";
import path from "path";

export const ACCOUNTABLE_CONTRACT = "0x0000000000000000000000000000000000000000";
export const ACCOUNTABLE_CONTRACT_ABI = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../../../contracts/out/Accountable.sol/Accountable.json"),
        "utf8"
    )
).abi;
