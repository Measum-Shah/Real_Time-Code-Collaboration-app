import { useState, useRef, useEffect } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from './../socket.js';
import { useLocation, useNavigate, useParams,Navigate} from 'react-router-dom'
import { toast } from 'react-hot-toast';



const EditorPage = () => {
  const socketRef = useRef(null);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const roomId = params.roomId;
  const username = location.state?.username;

  // iniializing socket.io
  useEffect(()=>{
    const init =async()=>{
      socketRef.current = await initSocket(); 
      socketRef.current.on('connect_error',(err)=>{
        handleError(err);
      }) 
      socketRef.current.on('connect_failed',(err)=>{
        handleError(err);
      })

      const handleError = (e)=>{
        console.log( `socket rror : ${e}`)
        toast.error(`socket connection failed`)
        navigate('/')
      }

      socketRef.current.emit('join',{
       roomId,
       username
      })
      // console.log(`Room id is ${roomId} of ${username}`)
    }
    init();
  },[])

  if(!location.state){
    return <Navigate to="/" />
  }

  const [clients,setClients] = useState([
    {socketId: 1 , username: "Measum"},
    {socketId: 2 , username: "Ahmad"},
  ])

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Sidebar */}
        <div
          className="col-md-2 bg-dark text-light d-flex flex-column h-100 p-3"
          style={{ boxShadow: '2px 4px 8px rgba(0,0,0,0.1)' }}
        >
          {/* Logo */}
          <div className="text-center mb-4">
            <img
              src="/logo.jpg"
              alt="CodeSync"
              height={100}
              width={150}
              className="img-fluid"
              style={{
                borderBottom: '1px solid white',
                paddingBottom: '15px',
              }}
            />
          </div>

          {/* Clients list (Scrollable if needed) */}
          <div className="flex-grow-1 overflow-auto">
          {clients.map((client) => (
  <Client key={client.socketId} username={client.username} />
))}

            
          </div>

          {/* Buttons at bottom */}
          <div className="mt-3 text-center" style={{borderTop:"1px solid white", 
            paddingTop:"15px"}}>
            <button type="button" className="btn btn-success rounded px-3 mb-2 w-100">
              Copy Room ID
            </button>
            <button type="button" className="btn btn-danger rounded px-3 w-100">
              Leave Room
            </button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="col-md-10 text-light d-flex align-items-center justify-content-center h-100">
          <Editor/>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;

