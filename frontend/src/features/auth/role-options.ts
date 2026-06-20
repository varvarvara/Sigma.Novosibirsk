export type RoleId = 'student' | 'teacher' | 'organizer'

export type AuthRoleOption = {
  id: RoleId
  name: string
  subtitle: string
  description: string
  emoji: string
}

export const AUTH_ROLE_OPTIONS: AuthRoleOption[] = [
  {
    id: 'student',
    name: 'Ученик',
    subtitle: '9–11 класс',
    description: 'Участие в курсах и мероприятиях летней школы',
    emoji: '👩‍🎓',
  },
  {
    id: 'teacher',
    name: 'Преподаватель',
    subtitle: 'с 1 курса',
    description: 'Ведение курсов и работа с учениками',
    emoji: '🧑‍🏫',
  },
  {
    id: 'organizer',
    name: 'Организатор',
    subtitle: 'бесценный',
    description: 'Организация программы и сопровождение сезона',
    emoji: '👩‍💻',
  },
]

export const SIGMA_INTRO_TEXT =
  'Школа «Сигма» — это бесплатная летняя школа с авторскими и олимпиадными курсами о науке и жизни для учеников 9–11 классов. В этом году Сигма проводит свой 4 сезон при НГУ в Новосибирском Академгородке 23–30 июля.'
