"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { goalService } from "../../lib/services/goalService";
import type { Goal, Supporter, FarcasterUser, InviteSupportersProps } from "../../lib/types";
import { searchFarcasterUsers } from "../../app/actions/searchFarcaster";
import Image from "next/image";



export default function InviteSupporters({ goalId, onInvited, onCancel }: InviteSupportersProps) {
    const [invitedSupporters, setInvitedSupporters] = useState<Supporter[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Farcaster lookup states
    const [farcasterUsername, setFarcasterUsername] = useState("");
    const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

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
            // Safely log the error without causing recursion
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
            user_id: `fc_${farcasterUser.fid}`,  // Prefix with fc_ to indicate Farcaster ID
            userAddress: farcasterUser.address || `fc_${farcasterUser.fid}`, // Use ETH address if available
            userName: farcasterUser.display_name || farcasterUser.username,
            userAvatar: farcasterUser.pfp_url
        };

        // Add to local state
        setInvitedSupporters([...invitedSupporters, newSupporter]);

        // Clear inputs
        setFarcasterUsername("");
        setFarcasterUser(null);
        setError(null);
    };

    const handleSendInvitations = () => {
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
        setInvitedSupporters(invitedSupporters.filter(supporter => supporter.user_id !== id));
    };

    const getGoal = useCallback(async (): Promise<Goal | null> => {
        return await goalService.getGoalById(goalId);
    }, [goalId]);

    // Use state for goal
    const [goal, setGoal] = useState<Goal | null>(null);

    // Fetch goal on component mount
    useEffect(() => {
        const fetchGoal = async () => {
            const fetchedGoal = await getGoal();
            setGoal(fetchedGoal);
        };
        fetchGoal();
    }, [getGoal]);

    if (!goal) {
        return <div>Loading goal...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Invite Supporters for: {goal.title}</h2>

            {/* Farcaster lookup */}
            <div className="space-y-4 mb-6">
                <div>
                    <Label htmlFor="farcasterUsername">Lookup by Farcaster Username</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
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
                        className="bg-purple-600 hover:bg-purple-700 mt-2"
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
                        </div>
                    )}
                </div>

                <Button
                    type="button"
                    onClick={handleAddSupporter}
                    className="w-full"
                    disabled={!farcasterUser}
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
                                key={supporter.user_id}
                                className="flex justify-between items-center p-2 bg-gray-100 rounded"
                            >
                                <div>
                                    <div className="flex items-center">
                                        {supporter.userAvatar && (
                                            <Image
                                                src={supporter.userAvatar}
                                                alt={supporter.userName || "Supporter"}
                                                width={65}
                                                height={65}
                                                className="w-16 h-16 rounded-full mr-2"
                                            />
                                        )}
                                        <div>
                                            <span className="font-medium">
                                                {supporter.userName || "Unnamed supporter"}
                                            </span>
                                        </div>
                                    </div>
                                    <br />
                                    <Button
                                        onClick={() => handleRemoveSupporter(supporter.user_id)}
                                        className="bg-red-500 hover:bg-red-600 text-sm py-1"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )
            }

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
                    onClick={handleSendInvitations}
                    disabled={invitedSupporters.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Send Invitations
                </Button>
            </div>
        </div >
    );
} 