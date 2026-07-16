import './auth-star-panel.css'

const DESKTOP_STAR_PATH =
  'M1380.46 182.716L1163.74 721.736L1742.41 936.883L1146.85 867.444L1134.64 1494.81L1005.22 872.481L0.00388986 1290.94L924.916 726.314L283.959 -0.000298724L1053.56 645.901L1380.46 182.716Z'

export function AuthStarPanel() {
  return (
    <aside className="auth-star-panel" aria-hidden="true">
      <div className="auth-star-panel__gradient" />
      <svg className="auth-star-panel__star" viewBox="0 0 1743 1495" fill="none" preserveAspectRatio="xMidYMid slice">
        <path d={DESKTOP_STAR_PATH} fill="#7949FF" fillOpacity="0.5" />
      </svg>
    </aside>
  )
}
