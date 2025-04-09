import type { Goal, GoalDB, Supporter, SupporterDB } from "../types";
import { supabase } from "../supabase-client";

// Table name for goals in Supabase
const GOALS_TABLE = 'goals';
const SUPPORTERS_TABLE = 'supporters';


// Helper to convert snake_case DB results to camelCase for our app
const mapGoalFromDB = (goal: GoalDB): Goal => {
    // Parse supporters if it's a string
    let supportersArray: SupporterDB[] = [];

    if (goal.supporters) {
        try {
            // If it's a string, try to parse it
            if (typeof goal.supporters === 'string') {
                // Clean the string before parsing - remove any escape characters that might be causing issues
                const supportersString = goal.supporters as string;
                const cleanedString = supportersString
                    .replace(/\\/g, '') // Remove backslashes
                    .replace(/"{/g, '{') // Replace leading quote + curly brace
                    .replace(/}"/g, '}') // Replace trailing curly brace + quote
                    .replace(/\[{/g, '[{') // Ensure proper array format
                    .replace(/}\]/g, '}]');

                // Try to parse with some fallback checks
                try {
                    supportersArray = JSON.parse(cleanedString);

                    // If we got an object instead of an array, wrap it in an array
                    if (!Array.isArray(supportersArray) && typeof supportersArray === 'object') {
                        supportersArray = [supportersArray];
                    }
                } catch (parseError) {
                    console.warn('First parse attempt failed, trying alternate approach:', parseError);

                    // If it failed, it might be a single object without array brackets
                    try {
                        // If it looks like a single object, wrap it in array brackets
                        if (cleanedString.trim().startsWith('{')) {
                            supportersArray = [JSON.parse(cleanedString)];
                        }
                    } catch (fallbackError) {
                        console.error('Fallback parsing failed:', fallbackError);
                        supportersArray = [];
                    }
                }

                console.log("Parsed supporters:", supportersArray);
            }
            // If it's already an array, use it directly
            else if (Array.isArray(goal.supporters)) {
                supportersArray = goal.supporters;
            }
        } catch (error) {
            console.error('Error parsing supporters:', error);
            console.error('Original data:', goal.supporters);
            supportersArray = [];
        }
    }

    // Ensure supportersArray is an array before mapping
    if (!Array.isArray(supportersArray)) {
        console.warn('Supporters is not an array after parsing, using empty array');
        supportersArray = [];
    }

    return {
        id: goal.id,
        user_id: goal.user_id,
        address: goal.address,
        title: goal.title,
        description: goal.description,
        deadline: new Date(goal.deadline),
        stakeAmount: goal.stake_amount,
        isCompleted: goal.is_completed,
        status: goal.status as 'active' | 'completed' | 'failed',
        createdAt: new Date(goal.created_at),
        supporters: supportersArray.map(mapSupporterFromDB)
    };
};

// Helper to convert snake_case DB results to camelCase for supporters
const mapSupporterFromDB = (supporter: SupporterDB): Supporter => {
    return {
        user_id: supporter.user_id,
        userAddress: supporter.user_address,
        userName: supporter.user_name,
        userAvatar: supporter.user_avatar
    };
};

// Helper to convert camelCase to snake_case for DB operations
const prepareGoalForDB = (goal: Partial<Goal>): Record<string, unknown> => {
    const dbGoal: Record<string, unknown> = {};

    if (goal.address) dbGoal.address = goal.address;
    if (goal.user_id) dbGoal.user_id = goal.user_id;
    if (goal.title) dbGoal.title = goal.title;
    if (goal.description) dbGoal.description = goal.description;
    if (goal.deadline) dbGoal.deadline = goal.deadline;
    if (goal.stakeAmount) dbGoal.stake_amount = goal.stakeAmount;
    if (goal.isCompleted !== undefined) dbGoal.is_completed = goal.isCompleted;
    if (goal.status) dbGoal.status = goal.status;
    if (goal.createdAt) dbGoal.created_at = goal.createdAt;
    if (goal.id) dbGoal.id = goal.id;
    if (goal.supporters) dbGoal.supporters = goal.supporters.map(supporter => prepareSupporterForDB(supporter, goal.id || ""));

    return dbGoal;
};

// Helper to convert camelCase to snake_case for supporter DB operations
const prepareSupporterForDB = (supporter: Supporter, goalId: string): Record<string, unknown> => {
    return {
        goal_id: goalId,
        user_id: supporter.user_id,
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
            console.log("dataReceived", dataReceived);
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
        user_id: number,
        address: string,
        title: string,
        description: string,
        deadline: Date,
        stakeAmount: string,
        supporters: Supporter[]
    ): Promise<Goal | null> => {
        console.log("Creating goal:", id);
        const newGoal = prepareGoalForDB({
            id,
            user_id,
            address,
            title,
            description,
            deadline,
            stakeAmount,
            isCompleted: false,
            status: 'active',
            createdAt: new Date(),
            supporters: supporters
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
            .eq('user_id', supporter.user_id)
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

    getSupportersByGoalId: async (goalId: string): Promise<Supporter[]> => {
        const { data, error } = await supabase
            .from(SUPPORTERS_TABLE)
            .select('*')
            .eq('goal_id', goalId);

        if (error) {
            console.error('Error fetching supporters:', error);
            return [];
        }

        return data ? data.map(mapSupporterFromDB) : [];
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