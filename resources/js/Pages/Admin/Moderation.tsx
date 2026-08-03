import { Head, router } from '@inertiajs/react';
import { Ban, EyeOff, RotateCcw, Trash2 } from 'lucide-react';
import AppLayout from '../../Components/AppLayout';

type Report = {
    id: number;
    reason: string;
    details?: string | null;
    user?: { id: number; email: string; banned_at?: string | null };
    feedback?: FeedbackModeration | null;
};

type FeedbackModeration = {
    id: number;
    pros: string;
    cons: string;
    tips?: string | null;
    hidden_at?: string | null;
    deleted_at?: string | null;
    score?: number;
    votes_sum_value?: number | null;
    reports_count?: number;
    course?: { id: number; name: string };
    user?: { id: number; email: string; banned_at?: string | null };
};

type Props = {
    reports: Report[];
    feedback: FeedbackModeration[];
};

export default function Moderation({ reports, feedback }: Props) {
    return (
        <AppLayout title="Moderare">
            <Head title="Moderare" />

            <section className="panel">
                <h2 className="admin-heading">Raportări deschise</h2>
                {reports.length === 0 ? (
                    <p className="empty-line">Nu există raportări deschise.</p>
                ) : (
                    <div className="moderation-list">
                        {reports.map((report) => (
                            <article key={report.id} className="moderation-item">
                                <div>
                                    <p className="font-semibold">{report.feedback?.course?.name ?? 'Feedback șters'}</p>
                                    <p className="text-sm text-slate-600">Motiv: {report.reason} · raportat de {report.user?.email}</p>
                                    {report.details && <p className="mt-2 text-sm">{report.details}</p>}
                                    {report.feedback && <blockquote>{report.feedback.pros}</blockquote>}
                                </div>
                                {report.feedback && <ModerationActions item={report.feedback} />}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="panel mt-6">
                <h2 className="admin-heading">Ultimele feedbackuri</h2>
                <div className="moderation-list">
                    {feedback.map((item) => (
                        <article key={item.id} className="moderation-item">
                            <div>
                                <p className="font-semibold">{item.course?.name}</p>
                                <p className="text-sm text-slate-600">
                                    Autor: {item.user?.email} · scor {item.votes_sum_value ?? 0} · raportări {item.reports_count ?? 0}
                                </p>
                                <p className="mt-2 text-sm">{item.pros}</p>
                                {(item.hidden_at || item.deleted_at) && <span className="badge danger mt-2">ascuns sau șters</span>}
                            </div>
                            <ModerationActions item={item} />
                        </article>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}

function ModerationActions({ item }: { item: FeedbackModeration }) {
    return (
        <div className="moderation-actions">
            {!item.hidden_at && !item.deleted_at && (
                <button className="ghost-button" type="button" onClick={() => hideFeedback(item.id)}>
                    <EyeOff size={16} /> Ascunde
                </button>
            )}
            {(item.hidden_at || item.deleted_at) && (
                <button className="ghost-button" type="button" onClick={() => restoreFeedback(item)}>
                    <RotateCcw size={16} /> Restaurează
                </button>
            )}
            {!item.deleted_at && (
                <button className="ghost-button danger" type="button" onClick={() => deleteFeedback(item)}>
                    <Trash2 size={16} /> Șterge
                </button>
            )}
            {item.user && !item.user.banned_at && (
                <button className="ghost-button danger" type="button" onClick={() => banUser(item.user!.id)}>
                    <Ban size={16} /> Blochează
                </button>
            )}
            {item.user?.banned_at && (
                <button className="ghost-button" type="button" onClick={() => unbanUser(item.user!.id, item.user!.email)}>
                    Deblochează
                </button>
            )}
        </div>
    );
}

function hideFeedback(id: number) {
    const reason = window.prompt('Motiv pentru ascundere');
    if (reason) {
        router.patch(`/admin/feedback/${id}/hide`, { reason }, { preserveScroll: true });
    }
}

function restoreFeedback(item: FeedbackModeration) {
    const courseName = item.course?.name ?? 'acest curs';

    if (window.confirm(`Restaurezi feedbackul pentru "${courseName}"?\n\nFeedbackul va redeveni vizibil pentru studenți.`)) {
        router.patch(`/admin/feedback/${item.id}/restore`, {}, { preserveScroll: true });
    }
}

function deleteFeedback(item: FeedbackModeration) {
    const courseName = item.course?.name ?? 'acest curs';

    if (window.confirm(`Ștergi feedbackul pentru "${courseName}"?\n\nRaportările asociate vor fi închise și feedbackul nu va mai fi vizibil.`)) {
        router.delete(`/admin/feedback/${item.id}`, { preserveScroll: true });
    }
}

function banUser(id: number) {
    const reason = window.prompt('Motiv pentru blocare');
    if (reason) {
        router.patch(`/admin/users/${id}/ban`, { reason }, { preserveScroll: true });
    }
}

function unbanUser(id: number, email: string) {
    if (window.confirm(`Deblochezi utilizatorul ${email}?\n\nUtilizatorul va putea posta, vota și raporta din nou.`)) {
        router.patch(`/admin/users/${id}/unban`, {}, { preserveScroll: true });
    }
}
