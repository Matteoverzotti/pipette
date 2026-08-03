import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Mail, Send, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import FieldError from '../../Components/FieldError';
import type { SharedProps } from '../../types';

export default function Login() {
    const { flash } = usePage<SharedProps>().props;
    const codeForm = useForm({ email: flash.pendingEmail ?? '', code: '' });
    const emailForm = useForm({ email: flash.pendingEmail ?? '' });
    const [step, setStep] = useState<'email' | 'code'>(flash.pendingEmail ? 'code' : 'email');

    useEffect(() => {
        if (!flash.pendingEmail) {
            return;
        }

        emailForm.setData('email', flash.pendingEmail);
        codeForm.setData('email', flash.pendingEmail);
        setStep('code');
    }, [flash.pendingEmail]);

    const currentEmail = codeForm.data.email || emailForm.data.email || flash.pendingEmail || '';

    function updateEmail(email: string) {
        emailForm.setData('email', email);
        codeForm.setData('email', email);
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
            <Head title="Autentificare" />
            <main className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
                <section>
                    <div className="mb-5 grid h-14 w-14 place-items-center rounded bg-teal-700 text-white">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="max-w-2xl text-4xl font-semibold leading-tight">Feedback anonim pentru cursurile UniBuc</h1>
                    <p className="mt-4 max-w-xl text-lg text-slate-600">
                        Intră cu emailul instituțional, citește experiențe reale și lasă feedback fără cont sau parolă.
                    </p>
                </section>

                <section className="panel">
                    <h2 className="text-xl font-semibold">Acces</h2>
                    <p className="mt-1 text-sm text-slate-600">Adrese acceptate: s.unibuc.ro și unibuc.ro.</p>

                    {flash.status && step === 'email' && (
                        <div className="notice mt-5 mb-0">
                            {flash.status}
                            {flash.pendingEmail && <span className="mt-1 block">Verifică inboxul pentru {flash.pendingEmail}.</span>}
                        </div>
                    )}
                    {flash.success && <div className="notice success mt-5 mb-0">{flash.success}</div>}

                    {step === 'email' ? (
                        <form
                            className="mt-6 space-y-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                emailForm.post('/login/code', {
                                    preserveScroll: true,
                                    onSuccess: () => setStep('code'),
                                });
                            }}
                        >
                            <label className="field-label" htmlFor="email">Email instituțional</label>
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={emailForm.data.email}
                                    onChange={(event) => updateEmail(event.target.value)}
                                    placeholder="prenume.nume@s.unibuc.ro"
                                />
                            </div>
                            <FieldError message={emailForm.errors.email} />
                            <button className="primary-button w-full" type="submit" disabled={emailForm.processing || !emailForm.data.email}>
                                <Send size={18} /> Trimite cod
                            </button>
                        </form>
                    ) : (
                        <form
                            className="mt-6 space-y-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                codeForm.post('/login/verify');
                            }}
                        >
                            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                Cod trimis către <strong>{currentEmail}</strong>
                            </div>
                            <label className="field-label" htmlFor="code">Cod primit pe email</label>
                            <div className="input-with-icon">
                                <KeyRound size={18} />
                                <input
                                    id="code"
                                    className="tracking-[0.35em]"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={codeForm.data.code}
                                    onChange={(event) => codeForm.setData('code', event.target.value)}
                                    placeholder="000000"
                                />
                            </div>
                            <FieldError message={codeForm.errors.code || codeForm.errors.email} />
                            <input type="hidden" name="email" value={currentEmail} readOnly />
                            <button className="secondary-button w-full" type="submit" disabled={codeForm.processing || !currentEmail || codeForm.data.code.length !== 6}>
                                Verifică și intră
                            </button>
                            <button
                                className="ghost-button w-full"
                                type="button"
                                onClick={() => {
                                    codeForm.reset('code');
                                    setStep('email');
                                }}
                            >
                                <ArrowLeft size={16} /> Schimbă emailul
                            </button>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
}
