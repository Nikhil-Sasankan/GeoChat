import './HomePage.css' 

const HomePage = ({handleJoinClick})=>{
    return(
        <div className="home-page">
            <nav className="navbar">
                <div className="navbar-brand"></div>
                <ul className="nav-links">
                    <li><a href="/home">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/about">Contact</a></li>
                    <li><a href="/about">Resources</a></li>
                    {/* Add more navigation links as needed */}
                </ul>
            </nav>
            <h1 className='geo-title'>GEO-CHAT</h1>
            <button className='button-join' onClick={handleJoinClick}> Join Chat</button>
        </div>
    )
}

export default HomePage  