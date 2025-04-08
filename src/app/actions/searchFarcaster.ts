'use server';

import { getNeynarClient } from "../../lib/neynar";

export async function searchFarcasterUsers(query: string) {
    try {
        if (!query || query.length < 1) {
            return { user: null };
        }

        const client = getNeynarClient();
        console.log("Searching for Farcaster users with query:", query);

        const result = await client.lookupUserByUsername({
            username: query,
        });

        console.log("Farcaster users found:", result);

        return {
            user: result.user
        };
    } catch (error) {
        console.error('Error searching Farcaster users:', error);
        return {
            message: 'Failed to search Farcaster users',
            error: error instanceof Error ? error.message : String(error),
            user: null
        };
    }
} 