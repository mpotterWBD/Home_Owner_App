import { APP_NAME } from '../../../shared/appInfo'
import houseLogo from '../assets/house_logo.png'
import titleImage from '../assets/Title.png'

function Header(): React.JSX.Element {
  return (
    <header className="header">
      <img className="logo" src={houseLogo} alt="" />
      <h1>
        <img className="title-image" src={titleImage} alt={APP_NAME} />
      </h1>
    </header>
  )
}

export default Header
