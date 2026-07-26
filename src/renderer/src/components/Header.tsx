import { APP_NAME } from '../../../shared/appInfo'
import houseLogo from '../assets/house_logo.png'

function Header(): React.JSX.Element {
  return (
    <header className="header">
      <img className="logo" src={houseLogo} alt="" />
      <h1>{APP_NAME}</h1>
    </header>
  )
}

export default Header
