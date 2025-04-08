import type { Goal, Supporter } from "../types";
import { v4 as uuidv4 } from "uuid";

// This is a mock service - in a real app, this would interact with a database
// You would replace this with actual API calls to your backend

const GOALS_STORAGE_KEY = "accountable_goals";

// Helper to get goals from localStorage
const getGoalsFromStorage = (): Goal[] => {
    if (typeof window === "undefined") return [];

    const goalsJson = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!goalsJson) return [];

    try {
        return JSON.parse(goalsJson);
    } catch (e) {
        console.error("Failed to parse goals from storage", e);
        return [];
    }
};

// Helper to save goals to localStorage
const saveGoalsToStorage = (goals: Goal[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
};

export const goalService = {
    // Get all goals for a user
    getUserGoals: (userId: string): Goal[] => {
        const goals = getGoalsFromStorage();
        return goals.filter(goal => goal.userId === userId);
    },

    // Get a specific goal by ID
    getGoalById: (goalId: string): Goal | null => {
        const goals = getGoalsFromStorage();
        return goals.find(goal => goal.id === goalId) || null;
    },

    // Create a new goal
    createGoal: (
        userId: string,
        title: string,
        description: string,
        deadline: Date,
        stakeAmount: string
    ): Goal => {
        const goals = getGoalsFromStorage();

        const newGoal: Goal = {
            id: uuidv4(),
            userId,
            title,
            description,
            deadline,
            stakeAmount,
            supporters: [],
            isCompleted: false,
            status: 'active',
            createdAt: new Date()
        };

        goals.push(newGoal);
        saveGoalsToStorage(goals);

        return newGoal;
    },

    // Add a supporter to a goal
    addSupporter: (goalId: string, supporter: Supporter): Goal | null => {
        const goals = getGoalsFromStorage();
        const goalIndex = goals.findIndex(goal => goal.id === goalId);

        if (goalIndex === -1) return null;

        // Check if supporter already exists
        const existingSupporter = goals[goalIndex].supporters.find(
            s => s.userId === supporter.userId
        );

        if (!existingSupporter) {
            goals[goalIndex].supporters.push(supporter);
            saveGoalsToStorage(goals);
        }

        return goals[goalIndex];
    },

    // Mark a goal as completed
    completeGoal: (goalId: string): Goal | null => {
        const goals = getGoalsFromStorage();
        const goalIndex = goals.findIndex(goal => goal.id === goalId);

        if (goalIndex === -1) return null;

        goals[goalIndex].isCompleted = true;
        goals[goalIndex].status = 'completed';
        saveGoalsToStorage(goals);

        return goals[goalIndex];
    },

    // Mark a goal as failed
    failGoal: (goalId: string): Goal | null => {
        const goals = getGoalsFromStorage();
        const goalIndex = goals.findIndex(goal => goal.id === goalId);

        if (goalIndex === -1) return null;

        goals[goalIndex].isCompleted = true;
        goals[goalIndex].status = 'failed';
        saveGoalsToStorage(goals);

        return goals[goalIndex];
    }
}; 