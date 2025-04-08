"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { goalService } from "../../lib/services/goalService";
import type { Goal, Supporter } from "../../lib/types";
import { v4 as uuidv4 } from "uuid";

interface InviteSupportersProps {
    goalId: string;
    onInvited?: () => void;
    onCancel?: () => void;
}

export default function InviteSupporters({ goalId, onInvited, onCancel }: InviteSupportersProps) {
    const [supporterAddress, setSupporterAddress] = useState("");
    const [supporterName, setSupporterName] = useState("");
    const [invitedSupporters, setInvitedSupporters] = useState<Supporter[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleAddSupporter = () => {
        if (!supporterAddress) {
            setError("Please enter a supporter wallet address");
            return;
        }

        // Simple validation for Ethereum address
        if (!/^0x[a-fA-F0-9]{40}$/.test(supporterAddress)) {
            setError("Please enter a valid Ethereum address");
            return;
        }

        // Create a new supporter object
        const newSupporter: Supporter = {
            id: uuidv4(),
            userId: supporterAddress,
            userAddress: supporterAddress,
            userName: supporterName || undefined,
        };

        // Add to local state
        setInvitedSupporters([...invitedSupporters, newSupporter]);

        // Clear inputs
        setSupporterAddress("");
        setSupporterName("");
        setError(null);
    };

    const handleSaveInvitations = () => {
        if (invitedSupporters.length === 0) {
            setError("Please add at least one supporter");
            return;
        }

        // Add all supporters to the goal
        for (const supporter of invitedSupporters) {
            goalService.addSupporter(goalId, supporter);
        }

        // Notify parent component
        if (onInvited) {
            onInvited();
        }
    };

    const handleRemoveSupporter = (id: string) => {
        setInvitedSupporters(invitedSupporters.filter(supporter => supporter.id !== id));
    };

    const getGoal = (): Goal | null => {
        return goalService.getGoalById(goalId);
    };

    const goal = getGoal();

    if (!goal) {
        return <div>Goal not found</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Invite Supporters for: {goal.title}</h2>

            <div className="space-y-4 mb-6">
                <div>
                    <Label htmlFor="supporterAddress">Supporter&apos;s Wallet Address</Label>
                    <Input
                        id="supporterAddress"
                        value={supporterAddress}
                        onChange={(e) => setSupporterAddress(e.target.value)}
                        placeholder="0x..."
                    />
                </div>

                <div>
                    <Label htmlFor="supporterName">Supporter&apos;s Name (Optional)</Label>
                    <Input
                        id="supporterName"
                        value={supporterName}
                        onChange={(e) => setSupporterName(e.target.value)}
                        placeholder="Friend's name"
                    />
                </div>

                <Button
                    type="button"
                    onClick={handleAddSupporter}
                    className="w-full"
                >
                    Add Supporter
                </Button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                    {error}
                </div>
            )}

            {invitedSupporters.length > 0 && (
                <div>
                    <h3 className="font-bold mb-2">Supporters to invite:</h3>
                    <ul className="space-y-2">
                        {invitedSupporters.map(supporter => (
                            <li
                                key={supporter.id}
                                className="flex justify-between items-center p-2 bg-gray-100 rounded"
                            >
                                <div>
                                    <span className="font-medium">
                                        {supporter.userName || "Unnamed supporter"}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        {supporter.userAddress}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleRemoveSupporter(supporter.id)}
                                    className="bg-red-500 hover:bg-red-600 text-sm py-1"
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex gap-2 justify-end mt-6">
                <Button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-black"
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSaveInvitations}
                    disabled={invitedSupporters.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Save Invitations
                </Button>
            </div>
        </div>
    );
} 