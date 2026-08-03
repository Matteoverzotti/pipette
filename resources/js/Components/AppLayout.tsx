import { Link, router, usePage } from '@inertiajs/react';
import { BookOpen, LogOut, Shield, UserRoundX } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import type { SharedProps } from '../types';

type Props = PropsWithChildren<{
    title: string;
}>;

export default function AppLayout({ title, children }: Props) {
    const { auth, flash, errors } = usePage<SharedProps>().props;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <Link href="/courses" className="flex items-center gap-3 font-semibold">
                        <span className="grid h-10 w-10 place-items-center rounded bg-teal-700 text-white">
                            <BookOpen size={20} />
                        </span>
                        <span>Feedback Cursuri UniBuc</span>
                    </Link>

                    <nav className="flex flex-wrap items-center gap-2 text-sm">
                        <Link className="nav-link" href="/courses">Cursuri</Link>
                        {auth.user?.is_admin && (
                            <>
                                <Link className="nav-link" href="/admin/catalog">Catalog</Link>
                                <Link className="nav-link" href="/admin/moderation">Moderare</Link>
                            </>
                        )}
                        {auth.user && (
                            <button className="icon-button" type="button" title="Ieșire" onClick={() => router.post('/logout')}>
                                <LogOut size={18} />
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        {auth.user && (
                            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                <span>{auth.user.email}</span>
                                {auth.user.is_admin && <span className="badge"><Shield size={14} /> admin</span>}
                                {auth.user.is_banned && <span className="badge danger"><UserRoundX size={14} /> limitat</span>}
                            </p>
                        )}
                    </div>
                </div>

                {flash.success && <div className="notice success">{flash.success}</div>}
                {flash.status && <div className="notice">{flash.status}</div>}
                {errors.account && <div className="notice danger">{errors.account}</div>}

                {children}
            </main>
        </div>
    );
}
