import type { Goal, Supporter } from "../types";
import { supabase } from "../supabase-client";

// Table name for goals in Supabase
const GOALS_TABLE = 'goals';
const SUPPORTERS_TABLE = 'supporters';

// Define database types
interface GoalDB {
    id: string;
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

interface SupporterDB {
    id: string;
    goal_id: string;
    user_id: string;
    user_address: string;
    user_name?: string;
    user_avatar?: string;
}

// Helper to convert snake_case DB results to camelCase for our app
const mapGoalFromDB = (goal: GoalDB): Goal => {
    return {
        id: goal.id,
        address: goal.address,
        title: goal.title,
        description: goal.description,
        deadline: new Date(goal.deadline),
        stakeAmount: goal.stake_amount,
        isCompleted: goal.is_completed,
        status: goal.status as 'active' | 'completed' | 'failed',
        createdAt: new Date(goal.created_at),
        supporters: Array.isArray(goal.supporters)
            ? goal.supporters.map(mapSupporterFromDB)
            : []
    };
};

// Helper to convert snake_case DB results to camelCase for supporters
const mapSupporterFromDB = (supporter: SupporterDB): Supporter => {
    return {
        id: supporter.id,
        userId: supporter.user_id,
        userAddress: supporter.user_address,
        userName: supporter.user_name,
        userAvatar: supporter.user_avatar
    };
};

// Helper to convert camelCase to snake_case for DB operations
const prepareGoalForDB = (goal: Partial<Goal>): Record<string, unknown> => {
    const dbGoal: Record<string, unknown> = {};

    if (goal.address) dbGoal.address = goal.address;
    if (goal.title) dbGoal.title = goal.title;
    if (goal.description) dbGoal.description = goal.description;
    if (goal.deadline) dbGoal.deadline = goal.deadline;
    if (goal.stakeAmount) dbGoal.stake_amount = goal.stakeAmount;
    if (goal.isCompleted !== undefined) dbGoal.is_completed = goal.isCompleted;
    if (goal.status) dbGoal.status = goal.status;
    if (goal.createdAt) dbGoal.created_at = goal.createdAt;
    if (goal.id) dbGoal.id = goal.id;

    return dbGoal;
};

// Helper to convert camelCase to snake_case for supporter DB operations
const prepareSupporterForDB = (supporter: Supporter, goalId: string): Record<string, unknown> => {
    return {
        goal_id: goalId,
        user_id: supporter.userId,
        user_address: supporter.userAddress,
        user_name: supporter.userName,
        user_avatar: supporter.userAvatar
    };
};

export const goalService = {
    // Get all goals for a user
    getUserGoals: async (address: string): Promise<Goal[]> => {
        let dataReceived: GoalDB[] = [];

        try {
            const { data, error } = await supabase
                .from(GOALS_TABLE)
                .select('*')
                .eq('address', address);

            if (error) {
                throw error;
            }

            dataReceived = data || [];
        } catch (error) {
            console.error('Error fetching goals:', error);
            return [];
        }

        return dataReceived.map(mapGoalFromDB);
    },

    // Get a specific goal by ID
    getGoalById: async (goalId: string): Promise<Goal | null> => {
        const { data, error } = await supabase
            .from(GOALS_TABLE)
            .select(`
                *,
                supporters:${SUPPORTERS_TABLE}(*)
            `)
            .eq('id', goalId)
            .single();

        if (error) {
            console.error('Error fetching goal:', error);
            return null;
        }

        return data ? mapGoalFromDB(data) : null;
    },

    // Create a new goal
    createGoal: async (
        id: string,
        address: string,
        title: string,
        description: string,
        deadline: Date,
        stakeAmount: string
    ): Promise<Goal | null> => {
        console.log("Creating goal:", id);
        const newGoal = prepareGoalForDB({
            id,
            address,
            title,
            description,
            deadline,
            stakeAmount,
            isCompleted: false,
            status: 'active',
            createdAt: new Date()
        });

        const { data, error } = await supabase
            .from(GOALS_TABLE)
            .insert(newGoal)
            .select()
            .single();

        if (error) {
            console.error('Error creating goal:', error);
            return null;
        }

        return data ? mapGoalFromDB(data) : null;
    },

    // Add a supporter to a goal
    addSupporter: async (goalId: string, supporter: Supporter): Promise<Goal | null> => {
        // First check if the supporter already exists
        const { data: existingSupporter, error: checkError } = await supabase
            .from(SUPPORTERS_TABLE)
            .select('*')
            .eq('goal_id', goalId)
            .eq('user_id', supporter.userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking supporter:', checkError);
            return null;
        }

        if (!existingSupporter) {
            const supporterData = prepareSupporterForDB(supporter, goalId);

            const { error } = await supabase
                .from(SUPPORTERS_TABLE)
                .insert(supporterData);

            if (error) {
                console.error('Error adding supporter:', error);
                return null;
            }
        }

        // Return the updated goal
        return await goalService.getGoalById(goalId);
    },

    // Mark a goal as completed
    completeGoal: async (goalId: string): Promise<Goal | null> => {
        const { data, error } = await supabase
            .from(GOALS_TABLE)
            .update({
                is_completed: true,
                status: 'completed'
            })
            .eq('id', goalId)
            .select()
            .single();

        if (error) {
            console.error('Error completing goal:', error);
            return null;
        }

        return data ? mapGoalFromDB(data) : null;
    },

    // Mark a goal as failed
    failGoal: async (goalId: string): Promise<Goal | null> => {
        const { data, error } = await supabase
            .from(GOALS_TABLE)
            .update({
                is_completed: true,
                status: 'failed'
            })
            .eq('id', goalId)
            .select()
            .single();

        if (error) {
            console.error('Error failing goal:', error);
            return null;
        }

        return data ? mapGoalFromDB(data) : null;
    }
}; 