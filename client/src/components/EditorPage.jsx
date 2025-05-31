import { useState, useRef, useEffect } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "./../socket.js";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const EditorPage = () => {
  const socketRef = useRef(null);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const roomId = params.roomId;
  const username = location.state?.username;
  const codeRef = useRef("");

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!isMounted) {
        console.log("Component unmounted, skipping socket init");
        return;
      }

      try {
        console.log("Initializing socket for room:", roomId, "username:", username);
        socketRef.current = await initSocket();
        console.log("Socket initialized, ID:", socketRef.current.id);

        socketRef.current.on("connect", () => {
          console.log("Socket connected:", socketRef.current.id);
          socketRef.current.emit("join", { roomId, username });
          console.log("Emitted join event for room:", roomId);
        });

        socketRef.current.on("connect_error", (e) => {
          console.error("Socket connect_error:", e);
          toast.error("Socket connection failed");
          navigate("/");
        });

        socketRef.current.on("connect_failed", (e) => {
          console.error("Socket connect_failed:", e);
          toast.error("Socket connection failed");
          navigate("/");
        });

        socketRef.current.on("joined", ({ clients, username: joinedUsername, socketId }) => {
          console.log("Joined event received:", { clients, joinedUsername, socketId });
          if (joinedUsername !== username) {
            toast.success(`${joinedUsername} joined`);
            if (codeRef.current) {
              console.log("Syncing code to new user:", socketId, "code:", codeRef.current);
              socketRef.current.emit("sync-code", {
                code: codeRef.current,
                socketId,
              });
            } else {
              console.log("No code to sync (codeRef.current is empty)");
            }
          }
          setClients(clients);
        });

        socketRef.current.on("disconnected", ({ username: leftUsername, socketId }) => {
          console.log("Disconnected event:", leftUsername, socketId);
          toast.success(`${leftUsername} left`);
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        });
      } catch (error) {
        console.error("Socket initialization failed:", error);
        toast.error("Failed to initialize socket");
        navigate("/");
      }
    };

    init();

    return () => {
      console.log("Cleaning up EditorPage useEffect");
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
        socketRef.current.disconnect();
        console.log("Socket disconnected:", socketRef.current.id);
        socketRef.current = null;
      }
    };
  }, [navigate, roomId, username]);

  if (!location.state) {
    console.log("No location state, redirecting to /");
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      console.log("Room ID copied:", roomId);
      toast.success("Room ID Copied");
    } catch (e) {
      console.error("Failed to copy room ID:", e);
      toast.error("Unable to copy room ID");
    }
  };

  const leaveRoom = () => {
    console.log("Leaving room, navigating to /");
    navigate("/");
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <div
          className="col-md-2 bg-dark text-light d-flex flex-column h-100 p-3"
          style={{ boxShadow: "2px 4px 8px rgba(0,0,0,0.1)" }}
        >
          <div className="text-center mb-4">
            <img
              src="/logo.jpg"
              alt="CodeSync"
              height={100}
              width={150}
              className="img-fluid"
              style={{
                borderBottom: "1px solid white",
                paddingBottom: "15px",
              }}
            />
          </div>
          <div className="flex-grow-1 overflow-auto">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
          <div className="mt-3 text-center" style={{ borderTop: "1px solid white", paddingTop: "15px" }}>
            <button type="button" onClick={copyRoomId} className="btn btn-success rounded px-3 mb-2 w-100">
              Copy Room ID
            </button>
            <button type="button" onClick={leaveRoom} className="btn btn-danger rounded px-3 w-100">
              Leave Room
            </button>
          </div>
        </div>
        <div className="col-md-10 text-light d-flex align-items-center justify-content-center h-100">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            username={username}
            onCodeChange={(code) => {
              console.log("Code updated in EditorPage:", code);
              codeRef.current = code;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;