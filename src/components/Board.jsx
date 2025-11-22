import { useEffect,useState } from "react"
import { List } from "./List"
import api from "./api";
import { socket } from "./socketClient";


export function Board({selectedBoard,setSelectedBoard, boardList, setBoardList, toastNotify, user}) {
	const [showModal,setShowModal] = useState(false);
	const [lists,setLists] = useState([]);
	const [editModal,setEditModal]=useState(false)
	const [type,setType]=useState("")
	const [cardName,setCardName]=useState("")
	const [description,setDescription]=useState("")
	const [isCompleted,setIsCompleted]=useState(false)
	const [newBoardName,setNewBoardName]=useState(selectedBoard ? selectedBoard.board_name : "")
	const [boardNameEdit,setBoardNameEdit]=useState(false)
	const [activeMembers,setActiveMembers]=useState(0)
	useEffect(()=>{
			setType(showModal.type)
			setCardName(showModal.card_name)
			setDescription(showModal.description)
			setIsCompleted(showModal.isCompleted)
	},[showModal])
	useEffect(()=>{		
		if(selectedBoard){
			const fetchLists = async ()=>{
				const data = await api('getListsOfBoard','POST',{
					email:user,
					board_id:selectedBoard._id
				});
				const cardsData = await api('getCardsOfBoard','POST',{
					email:user,
					board_id:selectedBoard._id
				});
				if(data.success===true&&cardsData.success===true){
					const formattedLists = data.lists.map((list)=>{
						console.log("Fetched Cards ---------:", list);
						return {
							_id: list._id,
							name: list.list_name,
							cards: cardsData.cards.filter(card=>card.list_id===list._id),
							board: selectedBoard._id
						}
					}
					);
					console.log("Fetched Lists ---------:", formattedLists);
					setLists(formattedLists);
				}
			}
			fetchLists();
			socket.emit('join_board', selectedBoard._id);
			socket.on('active_members', (members) => {
				setActiveMembers(members);
			})

			socket.on('receive_card_update',(data)=>{
				console.log("Received card update via WebSocket:", data);
				// refresh lists
				const fetchLists = async ()=>{
					const data = await api('getListsOfBoard','POST',{
						email:user,
						board_id:selectedBoard._id

					});
					const cardsData = await api('getCardsOfBoard','POST',{
						email:user,
						board_id:selectedBoard._id
					});
					if(data.success===true&&cardsData.success===true){
						const formattedLists = data.lists.map((list)=>{
							console.log("Fetched Cards ---------:", list);

							return {
								_id: list._id,

								name: list.list_name,
								cards: cardsData.cards.filter(card=>card.list_id===list._id),
								board: selectedBoard._id
							}}
						);
						console.log("Fetched Lists ---------:", formattedLists);

						setLists(formattedLists);
					}
				}
				fetchLists();	
			})
	
			socket.on('receive_card_update', (data) => {
				console.log("Received card update via WebSocket:", data);
				setLists(prevLists =>
					prevLists.map(list => ({
						...list,
						cards: list.cards.map(card =>
							card._id === data.card_id
								? {
									...card,
									card_name: data.new_card_name ?? card.card_name,
									description: data.new_description ?? card.description,
									isCompleted: data.new_isCompleted ?? card.isCompleted,
									type: data.new_type ?? card.type,
									updated_at: new Date(),
								}
								: card
						)
					}))
				);
	
			});
			socket.on('receive_update',(data)=>{
				console.log("Received board update via WebSocket:", data);
				if(selectedBoard._id===data._id){
					setSelectedBoard({
						...selectedBoard,
						board_name: data.board_name
					});
					// update board in boardList
					boardList.forEach((board)=>{
						if(board._id===data._id){
							board.board_name=data.board_name;
						}
					});
					setBoardList([...boardList]);
				}
			})
			socket.on('listNameUpdated', (data) => {
				console.log("Received list name update via WebSocket:", data);
				setLists(prevLists =>
					prevLists.map(list =>
						list._id === data.list_id
							? { ...list, name: data.new_list_name }
							: list
					)
				);
			});
			socket.on('card_created', (data) => {
				console.log("Received card update via WebSocket:", data);
				setLists(prevLists =>
					prevLists.map(list => {
						if (list._id === data.list_id) {
							return {
								...list,
								cards: [...list.cards, data]
							};
						}
						return list;
					})
				);
			});

			socket.on('list_created', (data) => {
				console.log("Received list update via WebSocket:", data);
				setLists(prevLists => [...prevLists, data]);
			});
	
			socket.on('board_update', (data) => {
				console.log("Received board update via WebSocket:", data);
				if(data.update_type==='board_rename'){
					if(selectedBoard._id===data.board_id){
						setSelectedBoard({
							...selectedBoard,
							board_name: data.new_board_name
						});
						// update board in boardList
						boardList.forEach((board)=>{
							if(board._id===data.board_id){
								board.board_name=data.new_board_name;
							}
						});
						setBoardList([...boardList]);
					}
				}
			});
			
			return () => {
				socket.emit('leave_board', selectedBoard._id);
			};
		}

	},[selectedBoard])

	// console.log("Rendering Board Component with selectedBoard:", selectedBoard._id);
	if(selectedBoard===null||selectedBoard===undefined){
		return(
			<div className="flex justify-center items-center h-full">
				<h2 className=''>Select a board to continue</h2>
			</div>
		)
	}
	const generateList = ()=>{
		api('createList','POST',{
			email:user,
			board_id:selectedBoard._id,
			list_name:`List ${lists.length + 1}`
		}).then((response)=>{
			console.log(response);
			if(response.success===true){
				const newList = {
					_id: response.list_id,
					name: `List ${lists.length + 1}`,
					cards: [],
					board: selectedBoard._id
				};
				setLists([...lists, newList]);
				socket.emit('list_create', newList);
			}
		});
	}

	const getSuggestions=()=>{
		api('getRecommendations','POST',{
			email:user,
			board_id:selectedBoard._id,
			card_id:showModal._id
		}).then((response)=>{
			toastNotify.info(response.suggestions, {position: "bottom-right",autoClose: 3000,hideProgressBar: false,closeOnClick: true,pauseOnHover: true,draggable: true,progress: undefined,theme: "light"})
		});
	}
	
	return(
		<div className="p-4 text-left overflow-hidden h-full">
			<div className="flex flex-row items-center justify-between text-xl pb-3">
				<h2>{boardNameEdit ? <input type="text" value={newBoardName} onChange={(e) => {
					setNewBoardName(e.target.value);
				}} /> : selectedBoard.board_name}</h2>
				<p>{activeMembers} other active members</p>
				<div onClick={()=>{
					if(boardNameEdit){
						// save new board name
						api('renameBoard','POST',{
							email:user,
							board_id:selectedBoard._id,
							new_board_name:newBoardName
						}).then((response)=>{
							console.log(response);
							if(response.success===true){
								boardList.forEach((board)=>{
									if(board._id===selectedBoard._id){
										board.board_name=newBoardName;
									}
								});
								console.log("Emitting board rename via WebSocket------------------", response.board);
								socket.emit('send_update',response.board);
								setSelectedBoard({
									...selectedBoard,
									board_name:newBoardName
								});

								setBoardList([...boardList]);
							}
						})
					}

					setBoardNameEdit(!boardNameEdit)
				}} >
					{boardNameEdit?"Save":"Edit"}
				</div>
			</div>
			<div className="flex h-full flex-row overflow-auto">
				{lists && lists.map((listData,index)=>{
					console.log("Rendering List Component for -----listData:", listData);
					if(listData&& listData.board === selectedBoard._id){
						return(
							<List key={index} setShowModal={setShowModal} user={user} list_id={listData._id} listname={listData.name} listcards={listData.cards} setLists={setLists} listboard={selectedBoard._id}/>
						)
					}
				})}
				<div onClick={()=>generateList()} className="rounded-xl p-3 pr-12 border min-w-fit ml-4 h-fit">
					+ Add New List 
				</div>
			</div>
			{showModal&&<div className="abruptPostForms">
				{/* <div onClick={()=>setShowModal(false)} className="fixed top-5 right-5 w-full h-full bg-black opacity-50">
				</div>	 */}
				<div className="bg-white border relative p-4 text-lg rounded-2xl">
					<div className="absolute top-3 right-5 text-xl font-bold">
						<button onClick={()=>setShowModal(false)} className="text-2xl">X</button>
					</div>
					<div className="flex flex-row">
						<input type="checkbox" className="mr-4 p-4 " onChange={(e)=>setIsCompleted(e.target.checked)} checked={isCompleted}/>
						<h2 className="text-3xl">{editModal?<input className="border-b rounded p-1 ml-2" type="text" value={cardName} defaultValue={showModal.cardName} onChange={(e)=>setCardName(e.target.value)}/> : showModal.card_name}</h2>
					</div>
					<div className="flex items-center space-x-4 mt-4 mb-4">
						<p className="px-4 py-1 border rounded-sm w-fit">Type: {editModal?<input type="text" className="border-b dotted p-1 ml-2 rounded-md" value={type} onChange={(e)=>setType(e.target.value)}/> : showModal.type}</p>
						{/* {editModal?"":<p className="px-4 border rounded-sm py-1">{showModal.isCompleted?"Completed":"In Progress"}</p>} */}
						<button onClick={()=>{
							setEditModal(!editModal)
							if(editModal){
								// save changes
								socket.emit('card_update',{
									email:user,
									card_id:showModal._id,
									new_card_name:cardName,
									new_description:description,
									new_isCompleted:isCompleted,
									new_type:type,
								});

								api('getRecommendations','POST',{
									email:user,
									board_id:selectedBoard._id,
									card_id:showModal._id
								}).then((response)=>{
									toastNotify.info(response.recommendations, {position: "bottom-right",autoClose: 3000,hideProgressBar: false,closeOnClick: true,pauseOnHover: true,draggable: true,progress: undefined,theme: "light"})
								});

								api('updateCard','POST',{
									email:user,
									card_id:showModal._id,
									new_card_name:cardName,
									new_description:description,
									new_isCompleted:isCompleted,
									new_type:type,

								}).then((response)=>{
									console.log(response);
									if(response.success===true){
										setShowModal({
											...showModal,
											card_name: cardName,
											description: description,
											isCompleted: isCompleted,

											type: type,
											updated_at: new Date()
										})
										// update card in lists
										const updatedLists = lists.map((list)=>{
											const updatedCards = list.cards.map((card)=>{
												if(card._id===showModal._id){
													return {
														...card,
														card_name: cardName,
														description: description,
														isCompleted: isCompleted,
														type: type,
														updated_at: new Date()
													}
												}
												return card;
											});
											return {
												...list,
												cards: updatedCards
											}
										});
										socket.emit('send_card_update',response.card);
										setLists(updatedLists);
										console.log("Updated Lists after card edit:", updatedLists);
										// setLists(
										// lists
									;}
								})}

						}} className="mr-4 rounded-sm border p-3 py-1">{editModal ? "Save" : "Edit"}</button>

						
					</div>
					<div onClick={()=>getSuggestions()}>Get Suggestions</div>
					<p className="mb-2">Description:{ editModal ? <input type="text" value={description}  className="border-b p-1 ml-2 rounded-md dotted"  onChange={(e)=>setDescription(e.target.value)} /> : showModal.description}</p>
					<p>Updated At :{new Date(showModal.updated_at).toLocaleString()}</p>
					<div className="mt-4 h-max-32 overflow-y-auto border-t pt-2">
						Activity Log:
						<ul>
							{showModal.activity.map((act,idx)=><li key={idx}>{act}</li>)}
						</ul>
					</div>
				</div>
			</div>}
		</div>
	)
}
