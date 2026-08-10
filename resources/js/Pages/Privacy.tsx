import { Head } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import AppLayout from '../Components/AppLayout';

const contactEmail = 'matteo-alexandru.verzotti@s.unibuc.ro';

export default function Privacy() {
    return (
        <AppLayout title="Confidențialitate">
            <Head title="Confidențialitate" />

            <article className="privacy-document">
                <p>
                    Această politică explică modul în care Pipette prelucrează datele personale și conținutul publicat pe
                    platformă. Pipette este un proiect independent pentru feedback între studenți și nu este afiliat,
                    administrat sau aprobat de Universitatea din București. Numele UniBuc este folosit doar pentru a
                    descrie comunitatea căreia i se adresează platforma și domeniile de email acceptate.
                </p>

                <h2>1. Date prelucrate</h2>
                <p>
                    Platforma poate prelucra următoarele categorii de date, în funcție de modul în care este folosită:
                </p>
                <ul>
                    <li>emailul instituțional folosit pentru autentificare;</li>
                    <li>numele derivat automat din adresa de email;</li>
                    <li>date despre codurile de autentificare, inclusiv momentul trimiterii, expirarea și consumarea codului;</li>
                    <li>adresa IP folosită la cererea codului de autentificare și date tehnice de sesiune;</li>
                    <li>feedbackul scris despre cursuri, voturile, raportările și detaliile trimise în raportări;</li>
                    <li>motivele de moderare, istoricul acțiunilor administrative și limitările aplicate conturilor.</li>
                </ul>

                <h2>2. Scopurile prelucrării</h2>
                <p>
                    Datele sunt folosite pentru autentificarea utilizatorilor, limitarea abuzurilor, publicarea feedbackului
                    despre cursuri, moderarea conținutului, securitatea platformei, investigarea raportărilor și comunicarea
                    necesară pentru cereri de suport, ștergere sau eliminare a conținutului.
                </p>

                <h2>3. Anonimat și vizibilitatea autorului</h2>
                <p>
                    Feedbackul este afișat anonim pentru ceilalți studenți. Totuși, anonimatul nu este absolut:
                    administratorii pot vedea autorul feedbackului pentru investigarea abuzurilor, raportărilor, ștergerilor,
                    ascunderilor și limitărilor de cont. Utilizatorii nu trebuie să publice date personale despre alte
                    persoane, insulte, hărțuire, discriminare, zvonuri sau acuzații grave fără context verificabil.
                </p>

                <h2>4. Furnizori tehnici</h2>
                <p>
                    Datele pot fi procesate de furnizorii tehnici folosiți pentru hosting, bază de date, email/SMTP, loguri,
                    backupuri și infrastructură. Acești furnizori sunt folosiți doar pentru operarea și securizarea
                    platformei.
                </p>

                <h2>5. Păstrarea și ștergerea datelor</h2>
                <p>
                    Datele de cont, feedback și moderare sunt păstrate cât timp sunt necesare pentru operarea și moderarea
                    platformei. La cerere justificată, datele pot fi șterse sau anonimizate, cu excepția situațiilor în care
                    păstrarea lor este necesară pentru investigarea abuzurilor, securitatea platformei sau respectarea unor
                    obligații legale.
                </p>

                <h2>6. Cod sursă și licență</h2>
                <p>
                    Codul sursă al platformei este public și poate fi consultat pe GitHub. Proiectul este distribuit sub
                    licența MIT, ceea ce permite reutilizarea, modificarea și distribuirea codului în condițiile licenței.
                    Publicarea codului nu schimbă regulile de confidențialitate aplicabile datelor stocate de instanța
                    platformei aflate în funcțiune.
                </p>

                <h2>7. Contact</h2>
                <p>
                    Pentru întrebări despre confidențialitate, ștergere, anonimizare sau eliminarea unui conținut, scrie la{' '}
                    <a className="inline-link" href={`mailto:${contactEmail}`}>
                        <Mail className="inline-block align-[-2px]" size={16} /> {contactEmail}
                    </a>.
                </p>
            </article>
        </AppLayout>
    );
}
