"use client";

import { useState } from "react";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { goalService } from "../../lib/services/goalService";
import { encodeFunctionData, parseEther } from "viem";
import { ACCOUNTABLE_CONTRACT, ACCOUNTABLE_CONTRACT_ABI } from "~/lib/constants";
import { searchFarcasterUsers } from "../../app/actions/searchFarcaster";
import type { Supporter, FarcasterUser } from "../../lib/types";
import { sdk } from "@farcaster/frame-sdk";
import { useFrame } from "../providers/FrameProvider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/Button";
import Image from "next/image";

interface GoalFormProps {
    onSuccess?: (goalId: string) => void;
    onCancel?: () => void;
}

export default function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [stakeAmount, setStakeAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Supporter related states
    const [invitedSupporters, setInvitedSupporters] = useState<Supporter[]>([]);
    const [farcasterUsername, setFarcasterUsername] = useState("");
    const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

    // Get min date (today) for the deadline input
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    const { context } = useFrame();
    const userFid = context?.user.fid || 0;

    // Transaction handling
    const { sendTransaction, isPending: isSendingTx } = useSendTransaction();
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const handleLookupFarcasterUser = async () => {
        if (!farcasterUsername) {
            setLookupError("Please enter a Farcaster username");
            return;
        }

        setLoading(true);
        setLookupError(null);
        try {
            console.log("Looking up Farcaster user:", farcasterUsername);
            const result = await searchFarcasterUsers(farcasterUsername);
            console.log("Farcaster user search result:", result.user);
            if (result.user) {
                const user = {
                    fid: result.user.fid || 0,
                    username: result.user.username || "",
                    display_name: result.user.display_name || "",
                    pfp_url: result.user.pfp_url || "",
                    address: result.user.verified_addresses.primary.eth_address || "",
                };
                setFarcasterUser(user);
                console.log("Found Farcaster user:", user);
            } else {
                setLookupError(`User @${farcasterUsername} not found on Farcaster`);
                setFarcasterUser(null);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log("Error looking up Farcaster user:", errorMessage);
            setLookupError("Error looking up Farcaster user. Please try again.");
            setFarcasterUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSupporter = () => {
        if (!farcasterUser) {
            setError("Please find a valid Farcaster user first");
            return;
        }

        // Create a new supporter object using Farcaster user info
        const newSupporter: Supporter = {
            user_id: farcasterUser.fid,  // Prefix with fc_ to indicate Farcaster ID
            userAddress: farcasterUser.address || "", // Use ETH address if available
            userName: farcasterUser.username,
            userAvatar: farcasterUser.pfp_url
        };

        // Add to local state
        setInvitedSupporters([...invitedSupporters, newSupporter]);

        // Clear inputs
        setFarcasterUsername("");
        setFarcasterUser(null);
        setError(null);
    };

    const handleRemoveSupporter = (id: number) => {
        setInvitedSupporters(invitedSupporters.filter(supporter => supporter.user_id !== id));
    };

    const castNewGoal = async (
        title: string,
        stakeAmount: string,
        invitedSupporters: Supporter[]
    ) => {
        const finalMessage = `I am accounting for a new goal: ${title} where I have staked ${stakeAmount} ETH. My accountability partners are ${invitedSupporters.map(supporter => `@${supporter.userName}`).join(" ")}`;
        console.log("Final message:", finalMessage);

        try {
            const encodedText = encodeURIComponent(finalMessage);
            const encodedEmbed = encodeURIComponent("https://accountable.megabyte0x.xyz");
            const castUrl = `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedEmbed}`;

            await sdk.actions.openUrl(castUrl);
            console.log("Opened Warpcast compose window");
        } catch (error) {
            console.error("Error casting goal:", error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!address) {
            setError("Please connect your wallet first");
            return;
        }

        if (!title || !description || !deadline || !stakeAmount) {
            setError("All fields are required");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Convert ETH to Wei
            const stakeAmountWei = parseEther(stakeAmount);
            const deadlineDate = new Date(deadline);
            const id = crypto.randomUUID(); // Generate a random UUID for the goal

            // Get supporter addresses to add to contract call
            const supporterAddresses = invitedSupporters
                .map(supporter => supporter.userAddress);

            // Combine owner address with supporter addresses
            const allAddresses = [address, ...supporterAddresses];

            // Send transaction to stake ETH
            sendTransaction({
                to: ACCOUNTABLE_CONTRACT,
                value: stakeAmountWei,
                data: encodeFunctionData({
                    abi: ACCOUNTABLE_CONTRACT_ABI,
                    functionName: "createGoal",
                    args: [id, deadlineDate.getTime(), allAddresses],
                })
            }, {
                onSuccess: async (hash) => {
                    setTxHash(hash);
                    console.log("Goal created with id:", id);

                    // Create the goal in the local database
                    const createdGoal = await goalService.createGoal(
                        id,
                        userFid,
                        address,
                        title,
                        description,
                        deadlineDate,
                        stakeAmountWei.toString(),
                        invitedSupporters
                    );

                    // Add supporters to the goal
                    for (const supporter of invitedSupporters) {
                        await goalService.addSupporter(id, supporter);
                    }

                    // Only call onSuccess if the DB operation succeeded
                    if (createdGoal && onSuccess) {
                        console.log("Casting new goal");
                        castNewGoal(title, stakeAmount, invitedSupporters);
                        onSuccess(id);
                    }

                },
                onError: (error) => {
                    console.error("Transaction error:", error);
                    setError("Failed to stake ETH. Please try again.");
                    setIsSubmitting(false);
                }
            });
        } catch (err) {
            console.error("Form submission error:", err);
            setError("Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="text-center p-4">
                <p className="mb-4">Please connect your wallet to create a goal</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create a New Goal</h2>
            <div>
                <Label htmlFor="title" className="text-gray-700">Goal Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you want to accomplish?"
                    required
                />
            </div>

            <div>
                <Label htmlFor="description" className="text-gray-700">Goal Description</Label>
                <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your goal in detail"
                    required
                />
            </div>

            <div>
                <Label htmlFor="deadline" className="text-gray-700">Deadline</Label>
                <Input
                    id="deadline"
                    type="datetime-local"
                    min={minDate}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                />
            </div>

            <div>
                <Label htmlFor="stakeAmount" className="text-gray-700">Stake Amount (ETH)</Label>
                <Input
                    id="stakeAmount"
                    type="text"
                    inputMode="decimal"
                    pattern="^[0-9]*[.]?[0-9]*$"
                    min="0.00001"
                    step="any"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Amount to stake"
                    required
                />
                {balance && (
                    <p className="text-xs text-gray-500 mt-1">
                        Your balance: {Number.parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                    </p>
                )}
            </div>

            {/* Supporter Invitation Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Add Accountability Partners</h3>
                <div className="space-y-4 mb-6">
                    <div>
                        <Label htmlFor="farcasterUsername" className="text-gray-700">Lookup by Farcaster Username</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700">@</span>
                                <Input
                                    id="farcasterUsername"
                                    value={farcasterUsername}
                                    onChange={(e) => setFarcasterUsername(e.target.value)}
                                    placeholder="username"
                                    className="pl-7"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={handleLookupFarcasterUser}
                            className="bg-purple-700 hover:bg-purple-800 text-white mt-2 w-full"
                            disabled={loading}
                        >
                            {loading ? "Looking up..." : "Lookup"}
                        </Button>
                        {lookupError && <div className="text-sm text-red-500 mt-1">{lookupError}</div>}

                        {/* Show found Farcaster user */}
                        {farcasterUser && (
                            <div className="mt-3 p-3 border rounded-md bg-gray-50">
                                <div className="flex items-center">
                                    {farcasterUser.pfp_url && (
                                        <Image
                                            src={farcasterUser.pfp_url}
                                            alt={farcasterUser.username}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium">{farcasterUser.display_name}</div>
                                        <div className="text-sm text-gray-500">@{farcasterUser.username}</div>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleAddSupporter}
                                    className="mt-2 text-white"
                                >
                                    Add as Supporter
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {invitedSupporters.length > 0 && (
                    <div>
                        <h3 className="font-bold mb-2 text-gray-800">Invited Supporters:</h3>
                        <ul className="space-y-2">
                            {invitedSupporters.map(supporter => (
                                <li
                                    key={supporter.user_id}
                                    className="flex justify-between items-center p-2 bg-gray-100 rounded"
                                >
                                    <div>
                                        <div className="flex items-center">
                                            {supporter.userAvatar && (
                                                <Image
                                                    src={supporter.userAvatar}
                                                    alt={supporter.userName || "Supporter"}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full mr-2"
                                                />
                                            )}
                                            <div>
                                                <span className="font-medium">
                                                    {supporter.userName || "Unnamed supporter"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleRemoveSupporter(supporter.user_id)}
                                        className="bg-red-500 hover:bg-red-600 text-white text-sm py-1"
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                    {error}
                </div>
            )}

            <div className="flex gap-2 justify-end">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || isSendingTx || isConfirming}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {isSubmitting || isSendingTx
                        ? "Staking ETH..."
                        : isConfirming
                            ? "Confirming..."
                            : "Create Goal"}
                </Button>
            </div>
        </form>
    );
}