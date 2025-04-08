"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { Button } from "./ui/Button";
import GoalList from "./Goal/GoalList";
import GoalForm from "./Goal/GoalForm";
import GoalDetail from "./Goal/GoalDetail";
type View = "list" | "create" | "detail";

export default function Accountable() {
    const [currentView, setCurrentView] = useState<View>("list");
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();


    const handleConnectWallet = () => {
        connect({ connector: connectors[0] });
    };

    const handleCreateGoalSuccess = (goalId: string) => {
        setSelectedGoalId(goalId);
        setCurrentView("list");
    };

    const handleViewGoal = (goalId: string) => {
        setSelectedGoalId(goalId);
        setCurrentView("detail");
    };

    const handleBackToList = () => {
        setCurrentView("list");
    };

    const handleCancelCreate = () => {
        setCurrentView("list");
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            <div className="max-w-xl mx-auto p-4 sm:p-6 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Accountable</h1>
                    <p className="text-gray-600 dark:text-gray-400">Set goals, stake ETH, stay accountable</p>
                </header>

                {!isConnected ? (
                    <div className="text-center p-8 border rounded-xl bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30 transition-all">
                        <div className="mb-6">
                            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                            </svg>
                        </div>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">
                            Connect your wallet to create goals and stake ETH
                        </p>
                        <Button
                            onClick={handleConnectWallet}
                            className="max-w-xs hover:shadow-lg hover:shadow-purple-300/20 dark:hover:shadow-purple-900/20 transition-all duration-300"
                        >
                            Connect Wallet
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 transition-all">
                        {currentView === "list" && (
                            <div className="p-6">
                                <Button
                                    onClick={() => setCurrentView("create")}
                                    className="w-full mb-6 border border-transparent hover:border-purple-300 dark:hover:border-purple-800 shadow-sm hover:shadow-lg hover:shadow-purple-300/20 dark:hover:shadow-purple-900/20 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create New Goal
                                    </div>
                                </Button>
                                <GoalList onSelectGoal={handleViewGoal} />
                            </div>
                        )}

                        {currentView === "create" && (
                            <div className="p-6">
                                <GoalForm
                                    onSuccess={handleCreateGoalSuccess}
                                    onCancel={handleCancelCreate}
                                />
                            </div>
                        )}

                        {currentView === "detail" && selectedGoalId && (
                            <GoalDetail
                                goalId={selectedGoalId}
                                onBack={handleBackToList}
                            />
                        )}

                    </div>

                )}

                <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-2">

                        <div className="flex justify-center space-x-4">
                            <a
                                href="https://basescan.org/address/0x1234567890123456789012345678901234567890"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-purple-500 transition-colors"
                            >
                                Contract
                            </a>

                            <a
                                href="https://github.com/megabyte0x/accountable"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-purple-500 transition-colors"
                            >
                                GitHub
                            </a>
                        </div>
                        <br />
                        <a
                            href="https://warpcast.com/megabyte"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-500 transition-colors"
                        >
                            Built by megabyte.base.eth
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
} 