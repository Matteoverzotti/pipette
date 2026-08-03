export type AuthUser = {
    id: number;
    email: string;
    is_admin: boolean;
    is_banned: boolean;
};

export type SharedProps = {
    auth: {
        user: AuthUser | null;
    };
    flash: {
        status?: string;
        success?: string;
        pendingEmail?: string;
    };
    errors: Record<string, string>;
};

export type Faculty = {
    id: number;
    name: string;
    courses_count?: number;
};

export type Professor = {
    id: number;
    name: string;
    title?: string | null;
    courses_count?: number;
};

export type Course = {
    id: number;
    faculty_id: number;
    name: string;
    year: number;
    semester: number;
    description?: string | null;
    faculty?: Faculty;
    professors?: Professor[];
    feedback_count?: number;
};

export type FeedbackItem = {
    id: number;
    pros?: string | null;
    cons?: string | null;
    tips?: string | null;
    score: number;
    created_at: string;
    can_edit: boolean;
    user_vote?: number | null;
    author?: {
        email?: string;
        is_banned?: boolean;
    } | null;
};

export type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};
