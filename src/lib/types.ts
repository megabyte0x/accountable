export interface Goal {
    id: string;
    user_id: number;
    address: string;
    title: string;
    description: string;
    deadline: Date;
    stakeAmount: string; // in wei
    supporters: Supporter[];
    isCompleted: boolean;
    status: 'active' | 'completed' | 'failed';
    createdAt: Date;
}

export interface Supporter {
    user_id: number;
    userAddress: string;
    userName?: string;
    userAvatar?: string;
}

export interface User {
    id: string;
    fid: string;
    username: string;
    displayName?: string;
    avatar?: string;
    walletAddress: string;
}

export interface InviteSupportersProps {
    goalId: string;
    onInvited?: () => void;
    onCancel?: () => void;
}

// Farcaster user interface
export interface FarcasterUser {
    fid: number;
    username: string;
    display_name?: string;

    pfp_url?: string;
    address?: string;
}



// Define database types
export interface GoalDB {
    id: string;
    user_id: number;
    address: string;
    title: string;
    description: string;
    deadline: string;
    stake_amount: string;
    is_completed: boolean;
    status: string;
    created_at: string;
    supporters?: SupporterDB[];
}

export interface SupporterDB {
    goal_id: string;
    user_id: number;
    user_address: string;
    user_name?: string;
    user_avatar?: string;
}