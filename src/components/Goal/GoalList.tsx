"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { goalService } from "../../lib/services/goalService";
import type { Goal } from "../../lib/types";
import { Button } from "../ui/Button";
import GoalCard from "~/components/Goal/GoalCard";

interface GoalListProps {
    onSelectGoal?: (goalId: string) => void;
}

export default function GoalList({ onSelectGoal }: GoalListProps) {
    const { address, isConnected } = useAccount();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadGoals() {
            if (address) {
                try {
                    // Load goals for the current user
                    const userGoals = await goalService.getUserGoals(address);
                    setGoals(userGoals);
                } catch (error) {
                    console.error("Error loading goals:", error);
                    setGoals([]);
                } finally {
                    setLoading(false);
                }
            }
        }

        loadGoals();
    }, [address]);

    const handleSelectGoal = (goalId: string) => {
        if (onSelectGoal) {
            onSelectGoal(goalId);
        }
    };

    if (!isConnected) {
        return (
            <div className="text-center p-4">
                <p className="mb-4">Connect your wallet to view your goals</p>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center p-4">Loading goals...</div>;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Your Goals</h2>
                <Button>Create New Goal</Button>
            </div>

            {goals.length === 0 ? (
                <div className="text-center p-8 border rounded-lg">
                    <p className="mb-4">You don&apos;t have any goals yet.</p>
                    <Button>Create Your First Goal</Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {goals && goals.length > 0 && goals.map((goal) => (
                        <button
                            key={goal.id}
                            type="button"
                            onClick={() => goal.id && handleSelectGoal(goal.id)}
                            className="text-left w-full p-0 border-none bg-transparent cursor-pointer"
                        >
                            <GoalCard goal={goal} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
} 