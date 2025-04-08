"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { goalService } from "../../lib/services/goalService";
import { parseEther } from "viem";

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

    // Get min date (today) for the deadline input
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    // Transaction handling
    const { sendTransaction, isPending: isSendingTx } = useSendTransaction();
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: txHash,
    });

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

            // Send transaction to stake ETH
            sendTransaction({
                to: address, // For now, sending to self as a placeholder
                value: stakeAmountWei,
                // In a real implementation, you would send to a smart contract
            }, {
                onSuccess: (hash) => {
                    setTxHash(hash);

                    // Create the goal in the local database
                    const deadlineDate = new Date(deadline);
                    const newGoal = goalService.createGoal(
                        address,
                        title,
                        description,
                        deadlineDate,
                        stakeAmountWei.toString()
                    );

                    if (onSuccess) {
                        onSuccess(newGoal.id);
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you want to accomplish?"
                    required
                />
            </div>

            <div>
                <Label htmlFor="description">Goal Description</Label>
                <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your goal in detail"
                    required
                />
            </div>

            <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                    id="deadline"
                    type="date"
                    min={minDate}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                />
            </div>

            <div>
                <Label htmlFor="stakeAmount">Stake Amount (ETH)</Label>
                <Input
                    id="stakeAmount"
                    type="number"
                    step="0.001"
                    min="0.001"
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

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                    {error}
                </div>
            )}

            <div className="flex gap-2 justify-end">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-black"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || isSendingTx || isConfirming}
                    className="bg-blue-600 hover:bg-blue-700"
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