import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Search, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import type { Course, Faculty } from '../../types';

type Props = {
    courses: Course[];
    faculties: Faculty[];
    filters: {
        faculty_id?: number | string;
        year?: number | string;
        semester?: number | string;
    };
};

const coursesPerPage = 12;

export default function CourseIndex({ courses, faculties, filters }: Props) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredCourses = useMemo(() => {
        const query = normalizeSearch(search);

        if (!query) {
            return courses;
        }

        return courses.filter((course) => normalizeSearch(course.name).includes(query));
    }, [courses, search]);

    const pageCount = Math.max(1, Math.ceil(filteredCourses.length / coursesPerPage));
    const safeCurrentPage = Math.min(currentPage, pageCount);
    const visibleCourses = filteredCourses.slice((safeCurrentPage - 1) * coursesPerPage, safeCurrentPage * coursesPerPage);

    useEffect(() => {
        if (currentPage > pageCount) {
            setCurrentPage(pageCount);
        }
    }, [currentPage, pageCount]);

    function updateFilter(name: string, value: string) {
        setCurrentPage(1);
        router.get('/courses', { ...filters, [name]: value || undefined }, { preserveState: true, replace: true });
    }

    function updateSearch(value: string) {
        setSearch(value);
        setCurrentPage(1);
    }

    return (
        <AppLayout title="Cursuri">
            <Head title="Cursuri" />

            <section className="toolbar">
                <div className="input-with-icon grow">
                    <Search size={18} />
                    <input
                        value={search}
                        onChange={(event) => updateSearch(event.target.value)}
                        placeholder="Caută după numele cursului"
                    />
                </div>
                <select className="select-input" value={filters.faculty_id ?? ''} onChange={(event) => updateFilter('faculty_id', event.target.value)}>
                    <option value="">Toate facultățile</option>
                    {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
                </select>
                <select className="select-input" value={filters.year ?? ''} onChange={(event) => updateFilter('year', event.target.value)}>
                    <option value="">Toți anii</option>
                    {[1, 2, 3].map((year) => <option key={year} value={year}>Anul {year}</option>)}
                </select>
                <select className="select-input" value={filters.semester ?? ''} onChange={(event) => updateFilter('semester', event.target.value)}>
                    <option value="">Ambele semestre</option>
                    <option value="1">Semestrul 1</option>
                    <option value="2">Semestrul 2</option>
                </select>
            </section>

            {visibleCourses.length === 0 ? (
                <section className="empty-state">
                    <BookOpen size={34} />
                    <h2>Nu există cursuri pentru filtrele alese.</h2>
                    <p>Un administrator poate adăuga cursuri din catalog.</p>
                </section>
            ) : (
                <section className="course-grid">
                    {visibleCourses.map((course) => (
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
                                <span>{course.professors?.map((professor) => professor.name).join(', ') || 'Profesori neasignați'}</span>
                            </div>
                        </Link>
                    ))}
                </section>
            )}

            <nav className="mt-8 flex flex-wrap gap-2">
                <button
                    className="page-button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    type="button"
                >
                    Înapoi
                </button>
                {Array.from({ length: pageCount }, (_, index) => {
                    const page = index + 1;

                    return (
                        <button
                            key={page}
                            className={safeCurrentPage === page ? 'page-button active' : 'page-button'}
                            onClick={() => setCurrentPage(page)}
                            type="button"
                        >
                            {page}
                        </button>
                    );
                })}
                <button
                    className="page-button"
                    disabled={safeCurrentPage === pageCount}
                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                    type="button"
                >
                    Înainte
                </button>
            </nav>
        </AppLayout>
    );
}

function normalizeSearch(value: string) {
    return value.trim().toLocaleLowerCase('ro-RO');
}
