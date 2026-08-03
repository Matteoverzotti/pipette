import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import FieldError from '../../Components/FieldError';
import type { Course, Faculty, Professor } from '../../types';

type Props = {
    faculties: Faculty[];
    professors: Professor[];
    courses: Course[];
};

export default function Catalog({ faculties, professors, courses }: Props) {
    const facultyForm = useForm({ name: '' });
    const professorForm = useForm({ name: '', title: '' });
    const courseForm = useForm({
        faculty_id: '',
        name: '',
        year: '1',
        semester: '1',
        description: '',
        professor_ids: [] as number[],
    });

    return (
        <AppLayout title="Catalog">
            <Head title="Catalog admin" />

            <section className="admin-grid">
                <form
                    className="panel"
                    onSubmit={(event) => {
                        event.preventDefault();
                        facultyForm.post('/admin/faculties', { preserveScroll: true, onSuccess: () => facultyForm.reset() });
                    }}
                >
                    <h2 className="admin-heading">Facultăți</h2>
                    <label className="field-label">Nume</label>
                    <input className="text-input" value={facultyForm.data.name} onChange={(event) => facultyForm.setData('name', event.target.value)} />
                    <FieldError message={facultyForm.errors.name} />
                    <button className="primary-button mt-3" type="submit"><Plus size={17} /> Adaugă</button>
                    <ul className="admin-list">
                        {faculties.map((faculty) => (
                            <li key={faculty.id}>
                                <span>{faculty.name} <small>{faculty.courses_count ?? 0} cursuri</small></span>
                                <span className="row-actions">
                                    <button className="icon-button" title="Redenumește" type="button" onClick={() => renameFaculty(faculty)}>
                                        <Save size={16} />
                                    </button>
                                    <button className="icon-button danger" title="Șterge" type="button" onClick={() => deleteFaculty(faculty)}>
                                        <Trash2 size={16} />
                                    </button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </form>

                <form
                    className="panel"
                    onSubmit={(event) => {
                        event.preventDefault();
                        professorForm.post('/admin/professors', { preserveScroll: true, onSuccess: () => professorForm.reset() });
                    }}
                >
                    <h2 className="admin-heading">Profesori</h2>
                    <label className="field-label">Nume</label>
                    <input className="text-input" value={professorForm.data.name} onChange={(event) => professorForm.setData('name', event.target.value)} />
                    <FieldError message={professorForm.errors.name} />
                    <label className="field-label mt-3">Titlu</label>
                    <input className="text-input" value={professorForm.data.title} onChange={(event) => professorForm.setData('title', event.target.value)} placeholder="conf. univ. dr." />
                    <button className="primary-button mt-3" type="submit"><Plus size={17} /> Adaugă</button>
                    <ul className="admin-list">
                        {professors.map((professor) => (
                            <li key={professor.id}>
                                <span>{professor.title ? `${professor.title} ` : ''}{professor.name} <small>{professor.courses_count ?? 0} cursuri</small></span>
                                <span className="row-actions">
                                    <button className="icon-button" title="Editează" type="button" onClick={() => editProfessor(professor)}>
                                        <Save size={16} />
                                    </button>
                                    <button className="icon-button danger" title="Șterge" type="button" onClick={() => deleteProfessor(professor)}>
                                        <Trash2 size={16} />
                                    </button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </form>
            </section>

            <section className="panel mt-6">
                <h2 className="admin-heading">Cursuri</h2>
                <form
                    className="catalog-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        courseForm.post('/admin/courses', { preserveScroll: true, onSuccess: () => courseForm.reset() });
                    }}
                >
                    <select className="select-input" value={courseForm.data.faculty_id} onChange={(event) => courseForm.setData('faculty_id', event.target.value)}>
                        <option value="">Facultate</option>
                        {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
                    </select>
                    <input className="text-input" value={courseForm.data.name} onChange={(event) => courseForm.setData('name', event.target.value)} placeholder="Numele cursului" />
                    <select className="select-input" value={courseForm.data.year} onChange={(event) => courseForm.setData('year', event.target.value)}>
                        {[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Anul {year}</option>)}
                    </select>
                    <select className="select-input" value={courseForm.data.semester} onChange={(event) => courseForm.setData('semester', event.target.value)}>
                        <option value="1">Semestrul 1</option>
                        <option value="2">Semestrul 2</option>
                    </select>
                    <textarea className="text-area md:col-span-2" value={courseForm.data.description} onChange={(event) => courseForm.setData('description', event.target.value)} placeholder="Descriere opțională" />
                    <div className="professor-picker">
                        {professors.map((professor) => (
                            <label key={professor.id}>
                                <input
                                    type="checkbox"
                                    checked={courseForm.data.professor_ids.includes(professor.id)}
                                    onChange={(event) => {
                                        const ids = new Set(courseForm.data.professor_ids);
                                        if (event.target.checked) {
                                            ids.add(professor.id);
                                        } else {
                                            ids.delete(professor.id);
                                        }
                                        courseForm.setData('professor_ids', Array.from(ids));
                                    }}
                                />
                                {professor.name}
                            </label>
                        ))}
                    </div>
                    <button className="primary-button md:col-span-2" type="submit"><Plus size={17} /> Adaugă curs</button>
                </form>

                <div className="table-wrap mt-6">
                    <table>
                        <thead>
                            <tr>
                                <th>Curs</th>
                                <th>Facultate</th>
                                <th>An/Semestru</th>
                                <th>Profesori</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id}>
                                    <td>{course.name}</td>
                                    <td>{course.faculty?.name}</td>
                                    <td>{course.year}/{course.semester}</td>
                                    <td>{course.professors?.map((professor) => professor.name).join(', ') || '-'}</td>
                                    <td className="table-actions">
                                        <button className="ghost-button" type="button" onClick={() => editCourse(course, professors)}>Editează</button>
                                        <button className="ghost-button danger" type="button" onClick={() => deleteCourse(course)}>Șterge</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </AppLayout>
    );
}

function renameFaculty(faculty: Faculty) {
    const name = window.prompt('Nume facultate', faculty.name);
    if (name) {
        router.put(`/admin/faculties/${faculty.id}`, { name }, { preserveScroll: true });
    }
}

function editProfessor(professor: Professor) {
    const name = window.prompt('Nume profesor', professor.name);
    if (!name) {
        return;
    }
    const title = window.prompt('Titlu', professor.title ?? '') ?? '';
    router.put(`/admin/professors/${professor.id}`, { name, title }, { preserveScroll: true });
}

function editCourse(course: Course, professors: Professor[]) {
    const name = window.prompt('Nume curs', course.name);
    if (!name) {
        return;
    }
    const professorIds = professors
        .filter((professor) => window.confirm(`Este ${professor.name} asignat la ${name}?`))
        .map((professor) => professor.id);
    router.put(`/admin/courses/${course.id}`, {
        faculty_id: course.faculty_id,
        name,
        year: course.year,
        semester: course.semester,
        description: course.description ?? '',
        professor_ids: professorIds,
    }, { preserveScroll: true });
}

function deleteFaculty(faculty: Faculty) {
    const courseCount = faculty.courses_count ?? 0;
    const warning = courseCount > 0
        ? `Aceasta va șterge și ${courseCount} cursuri asociate, împreună cu feedbackul lor.`
        : 'Această acțiune nu poate fi anulată din interfață.';

    if (window.confirm(`Ștergi facultatea "${faculty.name}"?\n\n${warning}`)) {
        router.delete(`/admin/faculties/${faculty.id}`, { preserveScroll: true });
    }
}

function deleteProfessor(professor: Professor) {
    const courseCount = professor.courses_count ?? 0;
    const warning = courseCount > 0
        ? `Profesorul va fi scos din ${courseCount} cursuri. Feedbackul cursurilor rămâne păstrat.`
        : 'Această acțiune nu poate fi anulată din interfață.';

    if (window.confirm(`Ștergi profesorul "${professor.name}"?\n\n${warning}`)) {
        router.delete(`/admin/professors/${professor.id}`, { preserveScroll: true });
    }
}

function deleteCourse(course: Course) {
    if (window.confirm(`Ștergi cursul "${course.name}"?\n\nSe vor șterge și feedbackurile, voturile și raportările asociate.`)) {
        router.delete(`/admin/courses/${course.id}`, { preserveScroll: true });
    }
}
