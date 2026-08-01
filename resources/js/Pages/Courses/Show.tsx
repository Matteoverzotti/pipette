import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Flag, Pencil, ThumbsDown, ThumbsUp, Trash2, UsersRound } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import FieldError from '../../Components/FieldError';
import type { Course, FeedbackItem, SharedProps } from '../../types';

type OwnFeedback = {
    id: number;
    pros: string;
    cons: string;
    tips?: string | null;
    hidden_at?: string | null;
};

type Props = {
    course: Course;
    feedback: FeedbackItem[];
    ownFeedback: OwnFeedback | null;
};

export default function CourseShow({ course, feedback, ownFeedback }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const reviewForm = useForm({
        course_id: course.id,
        pros: ownFeedback?.pros ?? '',
        cons: ownFeedback?.cons ?? '',
        tips: ownFeedback?.tips ?? '',
    });
    const [reportingId, setReportingId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState('irelevant');
    const [reportDetails, setReportDetails] = useState('');

    function submitFeedback(event: React.FormEvent) {
        event.preventDefault();
        reviewForm.post('/feedback', { preserveScroll: true });
    }

    return (
        <AppLayout title={course.name}>
            <Head title={course.name} />

            <section className="page-band">
                <div>
                    <p className="text-sm text-slate-600">{course.faculty?.name}</p>
                    <h2 className="mt-1 text-xl font-semibold">Anul {course.year}, semestrul {course.semester}</h2>
                    {course.description && <p className="mt-3 max-w-3xl text-slate-700">{course.description}</p>}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                    {course.professors?.length ? course.professors.map((professor) => (
                        <span className="badge neutral" key={professor.id}>
                            <UsersRound size={14} /> {professor.title ? `${professor.title} ` : ''}{professor.name}
                        </span>
                    )) : <span className="badge neutral">Profesori neasignati</span>}
                </div>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-4">
                    {feedback.length === 0 ? (
                        <div className="empty-state compact">
                            <Pencil size={30} />
                            <h2>Nu exista feedback public inca.</h2>
                            <p>Primul raspuns ii poate ajuta pe studentii care aleg optionale.</p>
                        </div>
                    ) : feedback.map((item) => (
                        <article className="feedback-card" key={item.id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm text-slate-600">Feedback anonim · {item.created_at}</p>
                                    {item.author?.email && <p className="mt-1 text-sm text-amber-800">Autor vizibil admin: {item.author.email}</p>}
                                </div>
                                <div className="vote-box">
                                    <button
                                        className={item.user_vote === 1 ? 'icon-button selected' : 'icon-button'}
                                        title="Util"
                                        type="button"
                                        onClick={() => router.post(`/feedback/${item.id}/votes`, { vote: 'helpful' }, { preserveScroll: true })}
                                        disabled={auth.user?.is_banned}
                                    >
                                        <ThumbsUp size={17} />
                                    </button>
                                    <strong>{item.score}</strong>
                                    <button
                                        className={item.user_vote === -1 ? 'icon-button selected' : 'icon-button'}
                                        title="Neutil"
                                        type="button"
                                        onClick={() => router.post(`/feedback/${item.id}/votes`, { vote: 'not_helpful' }, { preserveScroll: true })}
                                        disabled={auth.user?.is_banned}
                                    >
                                        <ThumbsDown size={17} />
                                    </button>
                                </div>
                            </div>

                            <div className="feedback-columns">
                                <div>
                                    <h3>Plusuri</h3>
                                    <p>{item.pros}</p>
                                </div>
                                <div>
                                    <h3>Minusuri</h3>
                                    <p>{item.cons}</p>
                                </div>
                                {item.tips && (
                                    <div>
                                        <h3>Sfaturi</h3>
                                        <p>{item.tips}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button className="ghost-button" type="button" onClick={() => setReportingId(reportingId === item.id ? null : item.id)} disabled={auth.user?.is_banned}>
                                    <Flag size={16} /> Raporteaza
                                </button>
                                {item.can_edit && (
                                    <button className="ghost-button danger" type="button" onClick={() => router.delete(`/feedback/${item.id}`, { preserveScroll: true })}>
                                        <Trash2 size={16} /> Sterge
                                    </button>
                                )}
                            </div>

                            {reportingId === item.id && (
                                <form
                                    className="mt-4 grid gap-3 rounded border border-slate-200 bg-slate-50 p-3"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        router.post(`/feedback/${item.id}/reports`, { reason: reportReason, details: reportDetails }, {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                setReportingId(null);
                                                setReportDetails('');
                                            },
                                        });
                                    }}
                                >
                                    <select className="select-input" value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
                                        <option value="abuziv">Abuziv</option>
                                        <option value="spam">Spam</option>
                                        <option value="date_personale">Contine date personale</option>
                                        <option value="irelevant">Irelevant</option>
                                        <option value="altceva">Altceva</option>
                                    </select>
                                    <textarea className="text-area" value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Detalii optionale" />
                                    <button className="secondary-button" type="submit">Trimite raportarea</button>
                                </form>
                            )}
                        </article>
                    ))}
                </div>

                <aside className="panel h-fit">
                    <h2 className="text-lg font-semibold">{ownFeedback ? 'Feedbackul tau' : 'Adauga feedback anonim'}</h2>
                    {auth.user?.is_banned ? (
                        <p className="mt-3 text-sm text-slate-700">Contul tau poate citi feedback, dar nu poate contribui.</p>
                    ) : (
                        <form className="mt-5 space-y-4" onSubmit={submitFeedback}>
                            <div>
                                <label className="field-label">Plusuri</label>
                                <textarea className="text-area" value={reviewForm.data.pros} onChange={(event) => reviewForm.setData('pros', event.target.value)} />
                                <FieldError message={reviewForm.errors.pros} />
                            </div>
                            <div>
                                <label className="field-label">Minusuri</label>
                                <textarea className="text-area" value={reviewForm.data.cons} onChange={(event) => reviewForm.setData('cons', event.target.value)} />
                                <FieldError message={reviewForm.errors.cons} />
                            </div>
                            <div>
                                <label className="field-label">Sfaturi</label>
                                <textarea className="text-area" value={reviewForm.data.tips} onChange={(event) => reviewForm.setData('tips', event.target.value)} />
                                <FieldError message={reviewForm.errors.tips} />
                            </div>
                            <button className="primary-button w-full" type="submit" disabled={reviewForm.processing}>
                                Salveaza anonim
                            </button>
                        </form>
                    )}
                </aside>
            </section>
        </AppLayout>
    );
}
