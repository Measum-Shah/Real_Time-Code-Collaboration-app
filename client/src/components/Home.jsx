import React from 'react'

const Home = () => {
  return (
    <div className='container-fluid'>
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-2 mb-5 bg-secondary rounded">
            <div className="card-body text-left bg-dark">
              <img src="logo.jpg" alt="logo" className='img-fluid mx-auto d-block' style={{maxWidth:"150px", maxHeight:"100px"}}/>
              <div className="form-group mt-4">
                <label className="text-light fw-semibold mb-2 fs-6">Enter RoomID</label>
                <input type="text" className='form-control mb-2 ' placeholder='Room ID'/>
                <label className="text-light fw-semibold mb-2 fs-6">Enter Username</label>
                <input type="text" className='form-control mb-2 ' placeholder='Username'/>
                <button type="submit" className="btn mt-3 btn-success rounded border mx-auto">Join</button>
              </div>
              <p className='mt-3 text-light'>Don't have a room Id? <span className='text-success p-2' style={{cursor:"pointer"}}>New Room</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
