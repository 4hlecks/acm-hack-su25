
function Card(){
    return(
        <div className="card">
            <img className="card-image" src="https://via.placeholder.com/150" alt= "event image"></img>
            <h2 className="card-title" > Event Title</h2>
            <p className="org-title">Org</p>
            {/* <p>Event Name</p>
            <p>Location</p>
            <p>Time</p> */}
        </div>
    );
}

export default Card