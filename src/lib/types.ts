export interface Goal {
    id: string | null;
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
    id: string;
    userId: string;
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