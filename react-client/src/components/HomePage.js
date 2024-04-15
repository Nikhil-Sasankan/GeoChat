import './HomePage.css' 

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
            <button className='button-join' onClick={handleJoinClick}> Join Chat</button>
        </div>
    )
}

export default HomePage  