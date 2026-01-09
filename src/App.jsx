// import {useEffect } from 'react';
import { useState, useEffect } from 'react';
import './App.css'
import Login from './components/Login';
import { Board } from './components/Board';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import api from './components/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState("");
  const [boardList, setBoardList] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showMenu, setShowMenu] = useState(true);
  const [invite, setInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (isLoggedIn != "") {
      const fetchBoards = async () => {
        const data = await api('getBoards', 'POST', { email: isLoggedIn });
        if (data.success === true) {
          setBoardList(data.boards);
        }
      }
      fetchBoards();
    }
  }, [isLoggedIn])
  if (!isLoggedIn) {
    return (
      <div>
        <Login isLoggedIn={isLoggedIn} toastNotify={toast} setIsLoggedIn={setIsLoggedIn} />
      </div>
    )
  } else {
    const addBoard = async () => {
      const response = await api('createBoard', 'POST', {
        email: isLoggedIn,
        board_name: `Board ${boardList.length + 1}`
      });
      if (response.success === true) {
        setBoardList([...boardList, response.board]);
      }
    }
    const addContributor = async () => {
      toast.info("Adding Contributor...", { position: "bottom-right", autoClose: 3000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "dark" })
      if (selectedBoard) {
        console.log("2")
        const response = await api('addContributor', 'POST', {
          email: isLoggedIn,
          board_id: selectedBoard._id,
          contributor_email: inviteEmail
        });
        console.log("3", response)
        if (response.success === true) {
          console.log("3", response)
          toast.success("Contributor Added Successfully");
          setInviteEmail("");
          setInvite(false);
        }
      }
    }


    return (
      <div className="border flex flex-col mt-2 items-center justify-center rounded-2xl overflow-hidden">
        <div className='h-[6vh] w-[100%] flex flex-row items-center justify-between px-6 border-dashed border-b bg-neutral-50'>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowMenu(!showMenu)}>
            <div className="p-1.5 bg-red-600 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" /></svg>
            </div>
            <h3 className='self-center text-xl font-bold tracking-tight'>Y-Boards</h3>
          </div>
          <div className="w-[50px]"></div>
        </div>
        <div className='flex flex-row h-[86vh] w-[100%]'>
          <div className={`${showMenu ? "w-[20%]" : "hidden"} ease-in-out border-r flex flex-col overflow-hidden`}>
            <h4 className='text-md text-left p-4 border-b'>{isLoggedIn}</h4>
            <div className='grow overflow-y-auto'>
              {boardList.map((board, index) => {
                return (
                  <div key={index} onClick={() => setSelectedBoard(board)} className='m-4 p-4 border text-center rounded-xl hover:bg-gray-200 cursor-pointer flex flex-row justify-between'>
                    {board.board_name}
                  </div>
                )
              })}
            </div>
            <div className='h-[9vh] border-t '>
              <div onClick={() => addBoard()} className="m-4 p-4 border rounded-xl">
                + Add New Board
              </div>
            </div>
          </div>
          <div className='w-[80%] grow flex flex-col ease-in-out  justify-between'>
            <div className='w-100% h-[77vh] overflow-y-auto'>
              <Board selectedBoard={selectedBoard} setSelectedBoard={setSelectedBoard} boardList={boardList} setBoardList={setBoardList} user={isLoggedIn} toastNotify={toast} />
            </div>
            <div className='h-[9vh] border-t flex flex-row justify-evenly items-center'>
              <div className="m-4 p-4 grow border rounded-xl">

                {invite ?
                  <div className='flex flex-row items-center justify-center'>
                    <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder='Contributor Email' id='contributorEmail' className='p-2 border rounded-lg w-3/4' />
                    <button onClick={() => { addContributor() }} className='ml-2 p-2 border rounded-lg'>Add</button>
                  </div>
                  :
                  <div onClick={() => setInvite(true)} className='text-center cursor-pointer'>
                    Share</div>}
              </div>
            </div>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
      </div>
    )
  }
}

export default App
