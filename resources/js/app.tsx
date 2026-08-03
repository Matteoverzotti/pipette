import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

createInertiaApp({
    title: (title) => (`${title} - ${import.meta.env.VITE_APP_NAME || 'Pipette - Feedback Cursuri UniBuc'}`),
    resolve: async (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx');
        const page = pages[`./Pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Pagina Inertia lipseste: ${name}`);
        }

        const module = await page();

        return module.default;
    },
    setup({ el, App, props }) {
        if (!el) {
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#0f766e',
    },
});
