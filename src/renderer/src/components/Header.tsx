import { APP_NAME } from '../../../shared/appInfo'

function Header(): React.JSX.Element {
  return (
    <header className="header">
      <h1>{APP_NAME}</h1>
    </header>
  )
}

export default Header
