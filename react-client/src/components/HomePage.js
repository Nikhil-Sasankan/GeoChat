import './HomePage.css' 
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const HomePage = ({handleJoinClick,setCurrentPage})=>{
    return(
        <div className="home-page">
            <nav className="navbar">
                <div className="navbar-brand"></div>
                <ul className="nav-links">
                    <li><a onClick={()=>setCurrentPage("HOME_PAGE")}>Home</a></li>
                    <li><a onClick={()=>setCurrentPage("ABOUT")}>About</a></li>
                    <li><a onClick={()=>setCurrentPage("CONTACT")}>Contact</a></li>
                    {/* Add more navigation links as needed */}
                </ul>
            </nav>
            <h1 className='geo-title'>GEO-CHAT</h1>
            <button data-tooltip-place='right-end' data-tooltip-id="join" data-tooltip-content="Join available chatrooms in your location!" className='button-join' onClick={handleJoinClick}> Join Chat</button>
            <Tooltip id="join"/>
        </div>
    )
}

export default HomePage  