import { Head, router, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { type FormEvent, useMemo, useRef, useState } from 'react';
import AppLayout from '../../Components/AppLayout';
import FieldError from '../../Components/FieldError';
import type { Course, Faculty, Professor, StudyProgram } from '../../types';

type Props = {
    faculties: Faculty[];
    professors: Professor[];
    studyPrograms: StudyProgram[];
    courses: Course[];
};

type CourseFormData = {
    faculty_id: string;
    name: string;
    year: string;
    semester: string;
    description: string;
    study_program_ids: number[];
    professor_ids: number[];
    new_professors: NewProfessorDraft[];
};

type NewProfessorDraft = {
    client_id: string;
    name: string;
    title: string;
};

type ProfessorEdit = {
    id: number;
    name: string;
    title: string;
};

type StudyProgramEdit = {
    id: number;
    faculty_id: string;
    name: string;
};

const blankCourseForm = (): CourseFormData => ({
    faculty_id: '',
    name: '',
    year: '1',
    semester: '1',
    description: '',
    study_program_ids: [],
    professor_ids: [],
    new_professors: [],
});

export default function Catalog({ faculties, professors, studyPrograms, courses }: Props) {
    const courseFormRef = useRef<HTMLDivElement>(null);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [assignmentSearch, setAssignmentSearch] = useState('');
    const [draftProfessorName, setDraftProfessorName] = useState('');
    const [draftProfessorTitle, setDraftProfessorTitle] = useState('');
    const [professorEdit, setProfessorEdit] = useState<ProfessorEdit | null>(null);
    const [studyProgramEdit, setStudyProgramEdit] = useState<StudyProgramEdit | null>(null);

    const facultyForm = useForm({ name: '' });
    const professorForm = useForm({ name: '', title: '' });
    const studyProgramForm = useForm({ faculty_id: '', name: '' });
    const courseForm = useForm<CourseFormData>(blankCourseForm());

    const selectedProfessors = useMemo(
        () => courseForm.data.professor_ids
            .map((id) => professors.find((professor) => professor.id === id))
            .filter(isProfessor),
        [courseForm.data.professor_ids, professors],
    );

    const selectedStudyPrograms = useMemo(
        () => courseForm.data.study_program_ids
            .map((id) => studyPrograms.find((program) => program.id === id))
            .filter(isStudyProgram),
        [courseForm.data.study_program_ids, studyPrograms],
    );

    const studyProgramOptions = useMemo(() => {
        const selectedIds = new Set(courseForm.data.study_program_ids);
        const facultyId = Number(courseForm.data.faculty_id);

        return studyPrograms
            .filter((program) => !facultyId || program.faculty_id === facultyId)
            .filter((program) => !selectedIds.has(program.id));
    }, [courseForm.data.faculty_id, courseForm.data.study_program_ids, studyPrograms]);

    const professorOptions = useMemo(() => {
        const query = normalizeSearch(assignmentSearch);
        const selectedIds = new Set(courseForm.data.professor_ids);

        return professors
            .filter((professor) => !selectedIds.has(professor.id))
            .filter((professor) => normalizeSearch(`${professor.title ?? ''} ${professor.name}`).includes(query))
            .slice(0, 24);
    }, [assignmentSearch, courseForm.data.professor_ids, professors]);

    function resetCourseWorkspace() {
        setEditingCourse(null);
        setAssignmentSearch('');
        setDraftProfessorName('');
        setDraftProfessorTitle('');
        courseForm.reset();
        courseForm.clearErrors();
    }

    function startCourseEdit(course: Course) {
        setEditingCourse(course);
        setAssignmentSearch('');
        setDraftProfessorName('');
        setDraftProfessorTitle('');
        courseForm.clearErrors();
        courseForm.setData({
            faculty_id: String(course.faculty_id),
            name: course.name,
            year: String(course.year),
            semester: String(course.semester),
            description: course.description ?? '',
            study_program_ids: course.study_programs?.map((program) => program.id) ?? [],
            professor_ids: course.professors?.map((professor) => professor.id) ?? [],
            new_professors: [],
        });
        window.requestAnimationFrame(() => courseFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

    function submitCourse(event: FormEvent) {
        event.preventDefault();

        const options = { preserveScroll: true, onSuccess: resetCourseWorkspace };

        if (editingCourse) {
            courseForm.put(`/admin/courses/${editingCourse.id}`, options);
        } else {
            courseForm.post('/admin/courses', options);
        }
    }

    function assignProfessor(professorId: number) {
        if (!courseForm.data.professor_ids.includes(professorId)) {
            courseForm.setData('professor_ids', [...courseForm.data.professor_ids, professorId]);
        }
        setAssignmentSearch('');
    }

    function assignStudyProgram(studyProgramId: number) {
        if (!courseForm.data.study_program_ids.includes(studyProgramId)) {
            courseForm.setData('study_program_ids', [...courseForm.data.study_program_ids, studyProgramId]);
        }
    }

    function removeStudyProgram(studyProgramId: number) {
        courseForm.setData('study_program_ids', courseForm.data.study_program_ids.filter((id) => id !== studyProgramId));
    }

    function updateCourseFaculty(facultyId: string) {
        const parsedFacultyId = Number(facultyId);

        courseForm.setData({
            ...courseForm.data,
            faculty_id: facultyId,
            study_program_ids: courseForm.data.study_program_ids.filter((id) => {
                const program = studyPrograms.find((item) => item.id === id);

                return program && program.faculty_id === parsedFacultyId;
            }),
        });
    }

    function removeProfessor(professorId: number) {
        courseForm.setData('professor_ids', courseForm.data.professor_ids.filter((id) => id !== professorId));
    }

    function addDraftProfessor() {
        const name = draftProfessorName.trim();
        const title = draftProfessorTitle.trim();

        if (!name) {
            return;
        }

        const existingProfessor = professors.find((professor) => normalizeSearch(professor.name) === normalizeSearch(name));
        if (existingProfessor) {
            assignProfessor(existingProfessor.id);
        } else if (!courseForm.data.new_professors.some((professor) => normalizeSearch(professor.name) === normalizeSearch(name))) {
            courseForm.setData('new_professors', [
                ...courseForm.data.new_professors,
                { client_id: `${Date.now()}-${name}`, name, title },
            ]);
        }

        setDraftProfessorName('');
        setDraftProfessorTitle('');
    }

    function removeDraftProfessor(clientId: string) {
        courseForm.setData('new_professors', courseForm.data.new_professors.filter((professor) => professor.client_id !== clientId));
    }

    function submitProfessorEdit(event: FormEvent) {
        event.preventDefault();

        if (!professorEdit) {
            return;
        }

        router.put(
            `/admin/professors/${professorEdit.id}`,
            { name: professorEdit.name, title: professorEdit.title },
            { preserveScroll: true, onSuccess: () => setProfessorEdit(null) },
        );
    }

    function submitStudyProgramEdit(event: FormEvent) {
        event.preventDefault();

        if (!studyProgramEdit) {
            return;
        }

        router.put(
            `/admin/study-programs/${studyProgramEdit.id}`,
            { faculty_id: studyProgramEdit.faculty_id, name: studyProgramEdit.name },
            { preserveScroll: true, onSuccess: () => setStudyProgramEdit(null) },
        );
    }

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

                <section className="panel">
                    <h2 className="admin-heading">Profesori</h2>
                    <form
                        className="stacked-form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            professorForm.post('/admin/professors', { preserveScroll: true, onSuccess: () => professorForm.reset() });
                        }}
                    >
                        <label className="field-label">Nume</label>
                        <input className="text-input" value={professorForm.data.name} onChange={(event) => professorForm.setData('name', event.target.value)} />
                        <FieldError message={professorForm.errors.name} />
                        <label className="field-label">Titlu</label>
                        <input className="text-input" value={professorForm.data.title} onChange={(event) => professorForm.setData('title', event.target.value)} placeholder="conf. univ. dr." />
                        <button className="primary-button" type="submit"><Plus size={17} /> Adaugă</button>
                    </form>
                    <ul className="admin-list admin-list-scroll">
                        {professors.map((professor) => (
                            <li key={professor.id}>
                                {professorEdit?.id === professor.id ? (
                                    <form className="inline-edit-form" onSubmit={submitProfessorEdit}>
                                        <input
                                            className="text-input"
                                            value={professorEdit.name}
                                            onChange={(event) => setProfessorEdit({ ...professorEdit, name: event.target.value })}
                                        />
                                        <input
                                            className="text-input"
                                            value={professorEdit.title}
                                            onChange={(event) => setProfessorEdit({ ...professorEdit, title: event.target.value })}
                                            placeholder="Titlu"
                                        />
                                        <span className="row-actions">
                                            <button className="icon-button selected" title="Salvează" type="submit">
                                                <Check size={16} />
                                            </button>
                                            <button className="icon-button" title="Anulează" type="button" onClick={() => setProfessorEdit(null)}>
                                                <X size={16} />
                                            </button>
                                        </span>
                                    </form>
                                ) : (
                                    <>
                                        <span>{professorLabel(professor)} <small>{professor.courses_count ?? 0} cursuri</small></span>
                                        <span className="row-actions">
                                            <button className="icon-button" title="Editează" type="button" onClick={() => setProfessorEdit({ id: professor.id, name: professor.name, title: professor.title ?? '' })}>
                                                <Pencil size={16} />
                                            </button>
                                            <button className="icon-button danger" title="Șterge" type="button" onClick={() => deleteProfessor(professor)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </span>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="panel">
                    <h2 className="admin-heading">Domenii de licență</h2>
                    <form
                        className="stacked-form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            studyProgramForm.post('/admin/study-programs', { preserveScroll: true, onSuccess: () => studyProgramForm.reset() });
                        }}
                    >
                        <label className="field-label">Facultate</label>
                        <select className="select-input" value={studyProgramForm.data.faculty_id} onChange={(event) => studyProgramForm.setData('faculty_id', event.target.value)}>
                            <option value="">Alege facultatea</option>
                            {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
                        </select>
                        <FieldError message={studyProgramForm.errors.faculty_id} />
                        <label className="field-label">Nume</label>
                        <input className="text-input" value={studyProgramForm.data.name} onChange={(event) => studyProgramForm.setData('name', event.target.value)} placeholder="Informatică" />
                        <FieldError message={studyProgramForm.errors.name} />
                        <button className="primary-button" type="submit"><Plus size={17} /> Adaugă</button>
                    </form>
                    <ul className="admin-list admin-list-scroll">
                        {studyPrograms.map((program) => (
                            <li key={program.id}>
                                {studyProgramEdit?.id === program.id ? (
                                    <form className="inline-edit-form" onSubmit={submitStudyProgramEdit}>
                                        <select
                                            className="select-input"
                                            value={studyProgramEdit.faculty_id}
                                            onChange={(event) => setStudyProgramEdit({ ...studyProgramEdit, faculty_id: event.target.value })}
                                        >
                                            {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
                                        </select>
                                        <input
                                            className="text-input"
                                            value={studyProgramEdit.name}
                                            onChange={(event) => setStudyProgramEdit({ ...studyProgramEdit, name: event.target.value })}
                                        />
                                        <span className="row-actions">
                                            <button className="icon-button selected" title="Salvează" type="submit">
                                                <Check size={16} />
                                            </button>
                                            <button className="icon-button" title="Anulează" type="button" onClick={() => setStudyProgramEdit(null)}>
                                                <X size={16} />
                                            </button>
                                        </span>
                                    </form>
                                ) : (
                                    <>
                                        <span>{program.name} <small>{program.faculty?.name} · {program.courses_count ?? 0} cursuri</small></span>
                                        <span className="row-actions">
                                            <button className="icon-button" title="Editează" type="button" onClick={() => setStudyProgramEdit({ id: program.id, faculty_id: String(program.faculty_id), name: program.name })}>
                                                <Pencil size={16} />
                                            </button>
                                            <button className="icon-button danger" title="Șterge" type="button" onClick={() => deleteStudyProgram(program)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </span>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            </section>

            <section className="panel mt-6" ref={courseFormRef}>
                <div className="catalog-header">
                    <h2 className="admin-heading">Cursuri</h2>
                    {editingCourse && (
                        <button className="ghost-button" type="button" onClick={resetCourseWorkspace}>
                            <X size={16} /> Anulează editarea
                        </button>
                    )}
                </div>
                <form
                    className="catalog-form catalog-form-wide"
                    onSubmit={submitCourse}
                >
                    <div className="catalog-fields">
                        <div>
                            <label className="field-label">Facultate</label>
                            <select className="select-input" value={courseForm.data.faculty_id} onChange={(event) => updateCourseFaculty(event.target.value)}>
                                <option value="">Alege facultatea</option>
                                {faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}
                            </select>
                            <FieldError message={courseForm.errors.faculty_id} />
                        </div>
                        <div>
                            <label className="field-label">Curs</label>
                            <input className="text-input" value={courseForm.data.name} onChange={(event) => courseForm.setData('name', event.target.value)} placeholder="Numele cursului" />
                            <FieldError message={courseForm.errors.name} />
                        </div>
                        <div>
                            <label className="field-label">An</label>
                            <select className="select-input" value={courseForm.data.year} onChange={(event) => courseForm.setData('year', event.target.value)}>
                                {[1, 2, 3].map((year) => <option key={year} value={year}>Anul {year}</option>)}
                            </select>
                            <FieldError message={courseForm.errors.year} />
                        </div>
                        <div>
                            <label className="field-label">Semestru</label>
                            <select className="select-input" value={courseForm.data.semester} onChange={(event) => courseForm.setData('semester', event.target.value)}>
                                <option value="1">Semestrul 1</option>
                                <option value="2">Semestrul 2</option>
                            </select>
                            <FieldError message={courseForm.errors.semester} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="field-label">Descriere</label>
                            <textarea className="text-area" value={courseForm.data.description} onChange={(event) => courseForm.setData('description', event.target.value)} placeholder="Descriere opțională" />
                            <FieldError message={courseForm.errors.description} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="field-label">Domenii de licență</label>
                            <div className="selected-professors">
                                {selectedStudyPrograms.map((program) => (
                                    <button className="professor-chip" key={program.id} type="button" onClick={() => removeStudyProgram(program.id)}>
                                        {program.name}
                                        <X size={14} />
                                    </button>
                                ))}
                                {selectedStudyPrograms.length === 0 && (
                                    <span className="empty-chip">Alege cel puțin un domeniu</span>
                                )}
                            </div>
                            <select className="select-input" value="" onChange={(event) => event.target.value && assignStudyProgram(Number(event.target.value))}>
                                <option value="">{courseForm.data.faculty_id ? 'Adaugă domeniu' : 'Alege întâi facultatea'}</option>
                                {studyProgramOptions.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                            </select>
                            <FieldError message={courseForm.errors.study_program_ids} />
                            <FieldError message={(courseForm.errors as Record<string, string>)['study_program_ids.0']} />
                        </div>
                    </div>

                    <div className="assignment-panel">
                        <div className="assignment-header">
                            <div>
                                <h3>Profesori</h3>
                                <small>{selectedProfessors.length + courseForm.data.new_professors.length} asignați</small>
                            </div>
                        </div>

                        <div className="selected-professors">
                            {selectedProfessors.map((professor) => (
                                <button className="professor-chip" key={professor.id} type="button" onClick={() => removeProfessor(professor.id)}>
                                    {professorLabel(professor)}
                                    <X size={14} />
                                </button>
                            ))}
                            {courseForm.data.new_professors.map((professor) => (
                                <button className="professor-chip pending" key={professor.client_id} type="button" onClick={() => removeDraftProfessor(professor.client_id)}>
                                    {professor.title ? `${professor.title} ` : ''}{professor.name}
                                    <X size={14} />
                                </button>
                            ))}
                            {selectedProfessors.length === 0 && courseForm.data.new_professors.length === 0 && (
                                <span className="empty-chip">Niciun profesor asignat</span>
                            )}
                        </div>

                        <label className="field-label">Caută profesor existent</label>
                        <div className="input-with-icon">
                            <Search size={17} />
                            <input value={assignmentSearch} onChange={(event) => setAssignmentSearch(event.target.value)} placeholder="Nume sau titlu" />
                        </div>
                        <div className="professor-results">
                            {professorOptions.map((professor) => (
                                <button key={professor.id} type="button" onClick={() => assignProfessor(professor.id)}>
                                    <span>{professorLabel(professor)}</span>
                                    <Plus size={15} />
                                </button>
                            ))}
                            {professorOptions.length === 0 && <span>Nu există rezultate</span>}
                        </div>

                        <div className="quick-professor">
                            <label className="field-label">Profesor nou</label>
                            <div className="quick-professor-fields">
                                <input className="text-input" value={draftProfessorName} onChange={(event) => setDraftProfessorName(event.target.value)} placeholder="Nume profesor" />
                                <input className="text-input" value={draftProfessorTitle} onChange={(event) => setDraftProfessorTitle(event.target.value)} placeholder="Titlu" />
                                <button className="ghost-button" type="button" onClick={addDraftProfessor}>
                                    <Plus size={16} /> Adaugă
                                </button>
                            </div>
                            <FieldError message={(courseForm.errors as Record<string, string>).new_professors} />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="primary-button" type="submit" disabled={courseForm.processing}>
                            {editingCourse ? <Save size={17} /> : <Plus size={17} />}
                            {editingCourse ? 'Salvează cursul' : 'Adaugă curs'}
                        </button>
                        {editingCourse && (
                            <button className="ghost-button" type="button" onClick={resetCourseWorkspace}>
                                <X size={16} /> Anulează
                            </button>
                        )}
                    </div>
                </form>

                <div className="table-wrap mt-6">
                    <table>
                        <thead>
                            <tr>
                                <th>Curs</th>
                                <th>Facultate</th>
                                <th>Domenii</th>
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
                                    <td>{course.study_programs?.map((program) => program.name).join(', ') || '-'}</td>
                                    <td>{course.year}/{course.semester}</td>
                                    <td>{course.professors?.map(professorLabel).join(', ') || '-'}</td>
                                    <td className="table-actions">
                                        <button className="ghost-button" type="button" onClick={() => startCourseEdit(course)}>
                                            <Pencil size={16} /> Editează
                                        </button>
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

function isProfessor(professor: Professor | undefined): professor is Professor {
    return professor !== undefined;
}

function isStudyProgram(program: StudyProgram | undefined): program is StudyProgram {
    return program !== undefined;
}

function normalizeSearch(value: string) {
    return value.trim().toLocaleLowerCase('ro-RO');
}

function professorLabel(professor: Professor) {
    return professor.title ? `${professor.title} ${professor.name}` : professor.name;
}

function renameFaculty(faculty: Faculty) {
    const name = window.prompt('Nume facultate', faculty.name);
    if (name) {
        router.put(`/admin/faculties/${faculty.id}`, { name }, { preserveScroll: true });
    }
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

function deleteStudyProgram(program: StudyProgram) {
    const courseCount = program.courses_count ?? 0;
    const warning = courseCount > 0
        ? `Domeniul va fi scos din ${courseCount} cursuri. Feedbackul cursurilor rămâne păstrat.`
        : 'Această acțiune nu poate fi anulată din interfață.';

    if (window.confirm(`Ștergi domeniul "${program.name}"?\n\n${warning}`)) {
        router.delete(`/admin/study-programs/${program.id}`, { preserveScroll: true });
    }
}

function deleteCourse(course: Course) {
    if (window.confirm(`Ștergi cursul "${course.name}"?\n\nSe vor șterge și feedbackurile, voturile și raportările asociate.`)) {
        router.delete(`/admin/courses/${course.id}`, { preserveScroll: true });
    }
}
