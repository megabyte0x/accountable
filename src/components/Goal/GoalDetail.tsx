"use client";

import { useEffect, useState } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "../ui/Button";
import { goalService } from "../../lib/services/goalService";
import { formatDistanceToNow } from "date-fns";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import type { Goal, Supporter } from "../../lib/types";
import { ACCOUNTABLE_CONTRACT, ACCOUNTABLE_CONTRACT_ABI } from "~/lib/constants";
import Image from "next/image";

interface GoalDetailProps {
    goalId: string;
    onBack: () => void;
}

export default function GoalDetail({ goalId, onBack }: GoalDetailProps) {
    const { address } = useAccount();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isFailing, setIsFailing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    const { sendTransaction } = useSendTransaction();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Load the goal when component mounts
    useEffect(() => {
        const loadGoal = async () => {
            console.log("Loading goal:", goalId);
            try {
                const goalData = await goalService.getGoalById(goalId);
                setGoal(goalData);
            } catch (err) {
                console.error("Error loading goal:", err);
                setError("Failed to load goal data");
            } finally {
                setLoading(false);
            }
        };

        loadGoal();
    }, [goalId]);

    useEffect(() => {
        const loadSupporters = async () => {
            const supportersData = await goalService.getSupportersByGoalId(goalId);
            setSupporters(supportersData);
        };

        loadSupporters();
    }, [goalId]);

    if (loading) {
        return (
            <div className="text-center p-4">
                <p className="mb-4">Loading goal details...</p>
            </div>
        );
    }

    if (!goal) {
        return (
            <div className="text-center p-4">
                <p className="mb-4">Goal not found</p>
                <Button onClick={onBack}>Back to Goals</Button>
            </div>
        );
    }

    // Format deadline - safely handle the date
    let timeRemaining = "Unknown";
    try {
        if (goal.deadline instanceof Date && !Number.isNaN(goal.deadline.getTime())) {
            timeRemaining = formatDistanceToNow(goal.deadline, { addSuffix: true });
        } else {
            timeRemaining = "Invalid date";
        }
    } catch (err) {
        console.error("Error formatting date:", err);
        timeRemaining = "Date error";
    }

    // Format stake amount
    const stakeAmountEth = formatEther(BigInt(goal.stakeAmount || "0"));

    // Check if the current user owns this goal
    const isOwner = address && address === goal.address;

    // Check if the goal is still active
    const isActive = goal.status === "active";

    // Modify button behavior based on deadline
    const isDeadlinePassed = goal.deadline instanceof Date && goal.deadline.getTime() < Date.now();

    const handleComplete = async () => {
        if (!isOwner || !isActive) return;

        setIsCompleting(true);
        setError(null);

        try {
            // In a real implementation, you would interact with a smart contract
            // to verify completion and return the staked ETH
            // For now, we'll just update the local storage

            // Simulate a transaction to return ETH (this would be handled by a contract)
            sendTransaction({
                to: ACCOUNTABLE_CONTRACT,
                data: encodeFunctionData({
                    abi: ACCOUNTABLE_CONTRACT_ABI,
                    functionName: "completeGoal",
                    args: [goalId, true, formatEther(BigInt("0"))]
                })
            }, {
                onSuccess: async (hash) => {
                    setTxHash(hash);

                    // Update the goal status
                    const updatedGoal = await goalService.completeGoal(goalId);
                    if (updatedGoal) {
                        setGoal(updatedGoal);
                    }

                    setIsCompleting(false);
                },
                onError: (error) => {
                    console.error("Transaction error:", error);
                    setError("Failed to complete goal. Please try again.");
                    setIsCompleting(false);
                }
            });
        } catch (err) {
            console.error("Complete goal error:", err);
            setError("Something went wrong. Please try again.");
            setIsCompleting(false);
        }
    };

    const handleFail = async () => {
        if (!isOwner || !isActive) return;

        setIsFailing(true);
        setError(null);

        try {
            const perSupporter = Number(goal.stakeAmount) / (supporters.length + 1)

            const amountPerSupporter = perSupporter.toString();

            // Simulate a transaction to distribute ETH (this would be handled by a contract)
            sendTransaction({
                to: ACCOUNTABLE_CONTRACT,
                data: encodeFunctionData({
                    abi: ACCOUNTABLE_CONTRACT_ABI,
                    functionName: "completeGoal",
                    args: [goalId, false, amountPerSupporter]
                }) // dummy transaction
            }, {
                onSuccess: async (hash) => {
                    setTxHash(hash);

                    // Update the goal status
                    const updatedGoal = await goalService.failGoal(goalId);
                    if (updatedGoal) {
                        setGoal(updatedGoal);
                    }

                    setIsFailing(false);
                },
                onError: (error) => {
                    console.error("Transaction error:", error);
                    setError("Failed to mark goal as failed. Please try again.");
                    setIsFailing(false);
                }
            });
        } catch (err) {
            console.error("Fail goal error:", err);
            setError("Something went wrong. Please try again.");
            setIsFailing(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl text-gray-900 dark:text-gray-100 font-bold">{goal.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${goal.status === "active" ? "bg-purple-100 text-purple-900" :
                    goal.status === "completed" ? "bg-teal-100 text-teal-900" :
                        "bg-orange-100 text-orange-900"
                    }`}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </span>
            </div>

            <p className="text-gray-600 mb-4">{goal.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">Deadline</div>
                    <div className="text-gray-900 dark:text-gray-100">{timeRemaining}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">Stake</div>
                    <div className="text-gray-900 dark:text-gray-100">{stakeAmountEth} ETH</div>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Supporters ({supporters.length})</h3>
                {!supporters || supporters.length === 0 ? (
                    <p className="text-gray-500">No supporters yet</p>
                ) : (
                    <ul className="space-y-2">
                        {supporters.map(supporter => (
                            <li
                                key={supporter.user_id}
                                className="flex items-center p-2 bg-gray-100 rounded"
                            >
                                <div>
                                    <Image
                                        src={supporter.userAvatar || ""}
                                        alt={supporter.userName || "Supporter"}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <span className="font-medium text-gray-800">
                                        {supporter.userName || "Unnamed supporter"}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        {supporter.userAddress}
                                    </div>

                                </div>


                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {isOwner && isActive && !isDeadlinePassed && (
                    <div className="flex gap-2">
                        <Button
                            onClick={handleComplete}
                            disabled={isCompleting || isFailing || isConfirming}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {isCompleting ? "Processing..." : "Complete Goal"}
                        </Button>
                        <Button
                            onClick={handleFail}
                            disabled={isCompleting || isFailing || isConfirming}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            {isFailing ? "Processing..." : "Give Up"}
                        </Button>
                    </div>
                )}

                {isOwner && isActive && isDeadlinePassed && (
                    <div className="flex gap-2">
                        <Button
                            onClick={handleFail}
                            disabled={isCompleting || isFailing || isConfirming}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                        >
                            {isFailing ? "Processing..." : "Will Try Again"}
                        </Button>
                    </div>
                )}

                <Button
                    onClick={onBack}
                    className="w-full"
                >
                    Back to Goals
                </Button>
            </div>
        </div>
    );
} 