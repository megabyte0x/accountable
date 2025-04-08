"use client";

import type { Goal } from "../../lib/types";
import { formatEther } from "viem";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";

interface GoalCardProps {
    goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
    // Add state for the countdown timer
    const [timeRemaining, setTimeRemaining] = useState("");

    // Use useMemo to prevent deadlineDate from being recreated on every render
    const deadlineDate = useMemo(() => new Date(goal.deadline), [goal.deadline]);

    // Update the countdown timer
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            if (now > deadlineDate) {
                setTimeRemaining("Deadline passed");
                return;
            }

            // Calculate time difference
            const diff = deadlineDate.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        // Initial update
        updateCountdown();

        // Set interval to update every second
        const intervalId = setInterval(updateCountdown, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [deadlineDate]);

    // Format stake amount
    const stakeAmountEth = formatEther(BigInt(goal.stakeAmount));

    // Determine status color and icon
    const statusConfig = {
        active: {
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
            textColor: "text-blue-800 dark:text-blue-300",
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        completed: {
            bgColor: "bg-green-100 dark:bg-green-900/30",
            textColor: "text-green-800 dark:text-green-300",
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        failed: {
            bgColor: "bg-red-100 dark:bg-red-900/30",
            textColor: "text-red-800 dark:text-red-300",
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        }
    };

    const { bgColor, textColor, icon } = statusConfig[goal.status];

    // Calculate progress (if deadline is in the future)
    const now = new Date();
    const isActive = goal.status === "active";
    const startDate = new Date(goal.createdAt);
    const totalDuration = deadlineDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const progress = Math.min(Math.max(elapsed / totalDuration * 100, 0), 100);

    // Format status text
    const statusText = goal.status.charAt(0).toUpperCase() + goal.status.slice(1);

    return (
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Progress bar for active goals */}
            {isActive && (
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700">
                    <div
                        className="h-full bg-blue-500"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        tabIndex={0}
                    />
                </div>
            )}

            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{goal.title}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${bgColor} ${textColor}`}>
                        {icon}
                        {statusText}
                    </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{goal.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deadline</div>
                        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200">
                            <svg className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeRemaining}
                        </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stake</div>
                        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-200">
                            <svg className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {stakeAmountEth} ETH
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Supporters: {goal.supporters.length}</span>
                    </div>
                    {goal.supporters.length > 0 && (
                        <div className="flex -space-x-2">
                            {goal.supporters.slice(0, 5).map((supporter) => (
                                <div
                                    key={supporter.user_id}
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden"
                                    title={supporter.userName || supporter.userAddress}
                                >
                                    {supporter.userAvatar ? (
                                        <Image
                                            src={supporter.userAvatar}
                                            alt={supporter.userName || "Supporter"}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-medium">
                                            {supporter.userName ? supporter.userName[0].toUpperCase() : "?"}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {goal.supporters.length > 5 && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                    +{goal.supporters.length - 5}
                                </div>
                            )}
                        </div>
                    )}
                </div>


                {goal.status === "completed" && (
                    <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-medium p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Goal completed! 🎉
                    </div>
                )}

                {goal.status === "failed" && (
                    <div className="flex items-center justify-center text-red-600 dark:text-red-400 font-medium p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Stake distributed to supporters
                    </div>
                )}
            </div>
        </div>
    );
} 