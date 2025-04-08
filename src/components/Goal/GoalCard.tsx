"use client";

import type { Goal } from "../../lib/types";
import { Button } from "../ui/Button";
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "viem";

interface GoalCardProps {
    goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
    // Format deadline
    const deadlineDate = new Date(goal.deadline);
    const timeRemaining = formatDistanceToNow(deadlineDate, { addSuffix: true });

    // Format stake amount
    const stakeAmountEth = formatEther(BigInt(goal.stakeAmount));

    // Determine status color
    const statusColors = {
        active: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
    };

    const statusColor = statusColors[goal.status];

    return (
        <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{goal.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </span>
            </div>

            <p className="text-gray-600 mb-3">{goal.description}</p>

            <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>Deadline: {timeRemaining}</span>
                <span>Stake: {stakeAmountEth} ETH</span>
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-500 mb-1">Supporters: {goal.supporters.length}</p>
                {goal.supporters.length > 0 && (
                    <div className="flex -space-x-2">
                        {goal.supporters.slice(0, 5).map((supporter) => (
                            <div
                                key={supporter.id}
                                className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs"
                                title={supporter.userName || supporter.userAddress}
                            >
                                {supporter.userName ? supporter.userName[0] : "?"}
                            </div>
                        ))}
                        {goal.supporters.length > 5 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs">
                                +{goal.supporters.length - 5}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {goal.status === "active" && (
                <div className="flex gap-2">
                    <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        Complete Goal
                    </Button>
                    <Button
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        Give Up
                    </Button>
                </div>
            )}

            {goal.status === "completed" && (
                <div className="text-green-600 font-semibold text-center">
                    Goal completed! 🎉
                </div>
            )}

            {goal.status === "failed" && (
                <div className="text-red-600 font-semibold text-center">
                    Goal not achieved. Stake distributed to supporters.
                </div>
            )}
        </div>
    );
} 