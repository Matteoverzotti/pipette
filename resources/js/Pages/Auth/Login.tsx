import { Head, useForm, usePage } from '@inertiajs/react';
import { Mail, Send, ShieldCheck } from 'lucide-react';
import FieldError from '../../Components/FieldError';
import type { SharedProps } from '../../types';

export default function Login() {
    const { flash } = usePage<SharedProps>().props;
    const codeForm = useForm({ email: flash.pendingEmail ?? '', code: '' });
    const emailForm = useForm({ email: flash.pendingEmail ?? '' });

    const pendingEmail = flash.pendingEmail || emailForm.data.email || codeForm.data.email;

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
            <Head title="Autentificare" />
            <main className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
                <section>
                    <div className="mb-5 grid h-14 w-14 place-items-center rounded bg-teal-700 text-white">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="max-w-2xl text-4xl font-semibold leading-tight">Feedback anonim pentru cursurile optionale UniBuc</h1>
                    <p className="mt-4 max-w-xl text-lg text-slate-600">
                        Intra cu emailul institutional, citeste experiente reale si lasa feedback fara cont sau parola.
                    </p>
                </section>

                <section className="panel">
                    <h2 className="text-xl font-semibold">Acces</h2>
                    <p className="mt-1 text-sm text-slate-600">Adrese acceptate: s.unibuc.ro si unibuc.ro.</p>

                    {flash.status && (
                        <div className="notice mt-5 mb-0">
                            {flash.status}
                            {flash.pendingEmail && <span className="mt-1 block">Verifica inboxul pentru {flash.pendingEmail}.</span>}
                        </div>
                    )}
                    {flash.success && <div className="notice success mt-5 mb-0">{flash.success}</div>}

                    <form
                        className="mt-6 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            codeForm.setData('email', emailForm.data.email);
                            emailForm.post('/login/code', { preserveScroll: true });
                        }}
                    >
                        <label className="field-label" htmlFor="email">Email institutional</label>
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input
                                id="email"
                                type="email"
                                value={emailForm.data.email}
                                onChange={(event) => emailForm.setData('email', event.target.value)}
                                placeholder="prenume.nume@s.unibuc.ro"
                            />
                        </div>
                        <FieldError message={emailForm.errors.email} />
                        <button className="primary-button w-full" type="submit" disabled={emailForm.processing}>
                            <Send size={18} /> Trimite cod
                        </button>
                    </form>

                    <form
                        className="mt-6 space-y-4 border-t border-slate-200 pt-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            codeForm.transform((data) => ({ ...data, email: pendingEmail }));
                            codeForm.post('/login/verify');
                        }}
                    >
                        <label className="field-label" htmlFor="code">Cod primit pe email</label>
                        <input
                            id="code"
                            className="text-input tracking-[0.35em]"
                            inputMode="numeric"
                            maxLength={6}
                            value={codeForm.data.code}
                            onChange={(event) => codeForm.setData('code', event.target.value)}
                            placeholder="000000"
                        />
                        <FieldError message={codeForm.errors.code || codeForm.errors.email} />
                        <button className="secondary-button w-full" type="submit" disabled={codeForm.processing || !pendingEmail}>
                            Verifica si intra
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}
