'use server';

import { getNeynarClient } from "../../lib/neynar";

export async function searchFarcasterUsers(query: string) {
    try {
        if (!query || query.length < 1) {
            return { user: null };
        }

        const client = getNeynarClient();

        const result = await client.lookupUserByUsername({
            username: query,
        });

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