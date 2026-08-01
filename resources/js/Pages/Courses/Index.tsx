import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Search, UsersRound } from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import type { Course, Faculty, Paginated } from '../../types';

type Props = {
    courses: Paginated<Course>;
    faculties: Faculty[];
    filters: {
        search?: string;
        faculty_id?: number | string;
        year?: number | string;
        semester?: number | string;
    };
};

export default function CourseIndex({ courses, faculties, filters }: Props) {
    function updateFilter(name: string, value: string) {
        router.get('/courses', { ...filters, [name]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout title="Cursuri optionale">
            <Head title="Cursuri" />

            <section className="toolbar">
                <div className="input-with-icon grow">
                    <Search size={18} />
                    <input
                        value={filters.search ?? ''}
                        onChange={(event) => updateFilter('search', event.target.value)}
                        placeholder="Cauta dupa numele cursului"
                    />
                </div>
                <select className="select-input" value={filters.faculty_id ?? ''} onChange={(event) => updateFilter('faculty_id', event.target.value)}>
                    <option value="">Toate facultatile</option>
                    {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
                </select>
                <select className="select-input" value={filters.year ?? ''} onChange={(event) => updateFilter('year', event.target.value)}>
                    <option value="">Toti anii</option>
                    {[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Anul {year}</option>)}
                </select>
                <select className="select-input" value={filters.semester ?? ''} onChange={(event) => updateFilter('semester', event.target.value)}>
                    <option value="">Ambele semestre</option>
                    <option value="1">Semestrul 1</option>
                    <option value="2">Semestrul 2</option>
                </select>
            </section>

            {courses.data.length === 0 ? (
                <section className="empty-state">
                    <BookOpen size={34} />
                    <h2>Nu exista cursuri pentru filtrele alese.</h2>
                    <p>Un administrator poate adauga cursuri din catalog.</p>
                </section>
            ) : (
                <section className="course-grid">
                    {courses.data.map((course) => (
                        <Link key={course.id} href={`/courses/${course.id}`} className="course-card">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm text-slate-600">{course.faculty?.name}</p>
                                    <h2>{course.name}</h2>
                                </div>
                                <span className="score-chip">{course.feedback_count ?? 0}</span>
                            </div>
                            <p className="mt-3 text-sm text-slate-600">Anul {course.year}, semestrul {course.semester}</p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                                <UsersRound size={16} />
                                <span>{course.professors?.map((professor) => professor.name).join(', ') || 'Profesori neasignati'}</span>
                            </div>
                        </Link>
                    ))}
                </section>
            )}

            <nav className="mt-8 flex flex-wrap gap-2">
                {courses.links.map((link, index) => (
                    <button
                        key={`${link.label}-${index}`}
                        className={link.active ? 'page-button active' : 'page-button'}
                        disabled={!link.url}
                        onClick={() => link.url && router.visit(link.url)}
                        type="button"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </nav>
        </AppLayout>
    );
}
