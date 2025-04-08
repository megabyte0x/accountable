"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { Button } from "./ui/Button";
import GoalList from "./Goal/GoalList";
import GoalForm from "./Goal/GoalForm";
import GoalDetail from "./Goal/GoalDetail";
import InviteSupporters from "./Goal/InviteSupporters";

type View = "list" | "create" | "detail" | "invite";

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

    const handleInviteSupporters = () => {
        if (selectedGoalId) {
            setCurrentView("invite");
        }
    };

    const handleBackToList = () => {
        setCurrentView("list");
    };

    const handleCancelCreate = () => {
        setCurrentView("list");
    };

    const handleInviteComplete = () => {
        setCurrentView("detail");
    };

    return (
        <div className="max-w-lg mx-auto p-4">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Accountable</h1>
                <p className="text-gray-600">Set goals, stake ETH, stay accountable</p>
            </header>

            {!isConnected ? (
                <div className="text-center p-6 border rounded-lg shadow-sm">
                    <p className="mb-4">
                        Connect your wallet to create goals and stake ETH
                    </p>
                    <Button onClick={handleConnectWallet}>Connect Wallet</Button>
                </div>
            ) : (
                <>
                    {currentView === "list" && (
                        <>
                            <Button
                                onClick={() => setCurrentView("create")}
                                className="w-full mb-4"
                            >
                                Create New Goal
                            </Button>
                            <GoalList onSelectGoal={handleViewGoal} />
                        </>
                    )}

                    {currentView === "create" && (
                        <div className="border rounded-lg p-4 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Create a New Goal</h2>
                            <GoalForm
                                onSuccess={handleCreateGoalSuccess}
                                onCancel={handleCancelCreate}
                            />
                        </div>
                    )}

                    {currentView === "detail" && selectedGoalId && (
                        <div>
                            <GoalDetail
                                goalId={selectedGoalId}
                                onBack={handleBackToList}
                            />
                            <div className="mt-4">
                                <Button
                                    onClick={handleInviteSupporters}
                                    className="w-full"
                                >
                                    Invite Supporters
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentView === "invite" && selectedGoalId && (
                        <div className="border rounded-lg p-4 shadow-sm">
                            <InviteSupporters
                                goalId={selectedGoalId}
                                onInvited={handleInviteComplete}
                                onCancel={handleBackToList}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 