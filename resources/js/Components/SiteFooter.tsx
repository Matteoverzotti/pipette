import { Link } from '@inertiajs/react';
import clsx from 'clsx';
import { GitBranch, Mail } from 'lucide-react';

const contactEmail = 'matteo-alexandru.verzotti@s.unibuc.ro';
const githubUrl = 'https://github.com/Matteoverzotti/pipette';

type Props = {
    compact?: boolean;
};

export default function SiteFooter({ compact = false }: Props) {
    return (
        <footer className={clsx('site-footer', compact && 'compact')}>
            <span>&copy; 2026 Matteo Verzotti</span>
            <a href={`mailto:${contactEmail}`}>
                <Mail size={15} /> Contact
            </a>
            <Link href="/privacy">Confidențialitate</Link>
            <a href={githubUrl} target="_blank" rel="noreferrer">
                <GitBranch size={15} /> Open source
            </a>
        </footer>
    );
}
