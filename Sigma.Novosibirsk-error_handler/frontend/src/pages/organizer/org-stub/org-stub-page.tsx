import { OrgSidebar } from '../../../shared/ui/org-sidebar'
import './org-stub-page.css'

type OrgStubPageProps = {
  title: string
  description?: string
}

export function OrgStubPage({
  title,
  description = 'Скоро тут появится нужная информация',
}: OrgStubPageProps) {
  return (
    <main className="org-layout org-stub-page" aria-label={title}>
      <OrgSidebar />

      <section className="org-layout__workspace org-stub-page__workspace">
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </main>
  )
}

export function OrgUsersStubPage() {
  return <OrgStubPage title="Участники" />
}

export function OrgScheduleStubPage() {
  return <OrgStubPage title="Расписание" />
}

export function OrgCoursesStubPage() {
  return <OrgStubPage title="Курсы" />
}
