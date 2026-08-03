import { Head } from '@inertiajs/react';
import { AlertTriangle, EyeOff, Scale, ShieldCheck } from 'lucide-react';
import AppLayout from '../Components/AppLayout';

const ruleSections = [
    {
        icon: <ShieldCheck size={20} />,
        title: 'Scopul feedbackului',
        items: [
            'Ajută studenții să înțeleagă cum este organizat un curs. Pentru cele opționale, feedbackul poate fi decisiv în alegerea cursului.',
            'Descrie experiența ta concretă: ritm, volum de lucru, evaluare, laboratoare, seminare și utilitatea cursului.',
            'Scrie despre curs, nu despre viața personală a profesorilor sau a colegilor.',
        ],
    },
    {
        icon: <Scale size={20} />,
        title: 'Ce este acceptat',
        items: [
            'Observații factuale și exemple clare din curs.',
            'Plusuri, minusuri și sfaturi pentru viitorii studenți.',
            'Ton critic, dar civilizat, fără atacuri personale.',
        ],
    },
    {
        icon: <AlertTriangle size={20} />,
        title: 'Ce nu este acceptat',
        items: [
            'Insulte, hărțuire, discriminare sau limbaj abuziv.',
            'Date personale, zvonuri, acuzații grave fără context verificabil sau conținut care poate identifica alți studenți.',
            'Spam, glume care nu ajută alegerea cursului sau feedback copiat de mai multe ori.',
        ],
    },
    {
        icon: <EyeOff size={20} />,
        title: 'Anonimat și moderare',
        items: [
            'Feedbackul este anonim pentru ceilalți studenți.',
            'Administratorii pot vedea autorul pentru a investiga abuzuri, raportări și blocări de conturi.',
            'Feedbackul raportat poate fi ascuns, șters sau restaurat de administratori.',
        ],
    },
];

export default function Rules() {
    return (
        <AppLayout title="Reguli pentru feedback">
            <Head title="Reguli" />

            <section className="page-band">
                <p className="text-slate-700">
                    Platforma există ca studenții UniBuc să poată afla mai multe despre cursurile lor și să aleagă materiile opționale informat, fără presiunea de a cere păreri în privat.
                    <br></br>
                    Platforma nu reprezintă o înlocuire a feedbackului anonim oferit în mod direct profesorilor prin chestionarele oficiale ale facultății!
                </p>
            </section>

            <section className="rules-grid mt-6">
                {ruleSections.map((section) => (
                    <article className="rules-card" key={section.title}>
                        <div className="rules-card-title">
                            <span>{section.icon}</span>
                            <h2>{section.title}</h2>
                        </div>
                        <ul>
                            {section.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                    </article>
                ))}
            </section>
        </AppLayout>
    );
}
