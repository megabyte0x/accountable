"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { goalService } from "../../lib/services/goalService";
import type { Goal } from "../../lib/types";
import { Button } from "../ui/Button";
import GoalCard from "./GoalCard";

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
                    console.log("userGoals", userGoals);
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
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                <p className="mb-4 text-gray-600 dark:text-gray-400">Connect your wallet to view your goals</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="py-8">
                <div className="flex justify-center">
                    <div className="animate-pulse flex flex-col w-full space-y-4">
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-2" />
                        {[1, 2].map((index) => (
                            <div key={index} className="bg-gray-100 dark:bg-gray-800 h-40 rounded-lg w-full p-4">
                                <div className="flex justify-between">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                                </div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4" />
                                <div className="flex justify-between mt-4">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Goals</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
                </div>
            </div>

            {goals.length === 0 ? (
                <div className="text-center p-10 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-900/30">
                    <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">No goals yet</h3>
                    <p className="mb-6 text-gray-500 dark:text-gray-400">
                        Create your first goal to start tracking your progress and staying accountable.
                    </p>
                    <Button className="max-w-xs mx-auto shadow-sm hover:shadow-lg transition-all duration-300">
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Your First Goal
                        </span>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {goals.map((goal) => (
                        <button
                            key={goal.id}
                            type="button"
                            onClick={() => goal.id && handleSelectGoal(goal.id)}
                            className="text-left w-full p-0 border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded-lg"
                        >
                            <GoalCard goal={goal} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
} 