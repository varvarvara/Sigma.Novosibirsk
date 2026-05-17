export const PRIVACY_POLICY_URL =
  'https://docs.google.com/document/d/1ZWNL0coo8hCAVavxULjpzD-QSduA70RSxyCJmbBvO9s/edit?usp=sharing'

type RegistrationConsentTextProps = {
  personalDataUrl?: string
  privacyPolicyUrl?: string
}

export function RegistrationConsentText({
  personalDataUrl,
  privacyPolicyUrl = PRIVACY_POLICY_URL,
}: RegistrationConsentTextProps) {
  const personalUrl = personalDataUrl?.trim() || privacyPolicyUrl

  return (
    <>
      Заполняя и отправляя форму, вы даете{' '}
      <a href={personalUrl} target="_blank" rel="noreferrer">
        согласие на обработку персональных данных
      </a>{' '}
      и принимаете{' '}
      <a href={privacyPolicyUrl} target="_blank" rel="noreferrer">
        политику приватности
      </a>
    </>
  )
}
