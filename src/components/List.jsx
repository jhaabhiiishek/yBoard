import {useEffect,  useRef, useState } from "react";
import api from "./api";
import { socket } from "./socketClient";
export function List({listname,user,setLists,listcards ,list_id,setShowModal,listboard}){
	const [showInput,changeShowInput] = useState(false);
	const [setNewCard,changeSetNewCard] = useState("");
	const [cards,setCards] = useState(listcards);
	const [selectedCard,setSelectedCard] = useState(null)
	const [newListName,setNewListName]=useState(listname)
	const [listNameEdit,setListNameEdit]=useState(false)
	// const [dragging, setDragging] = useState();

	const handleDragStart = (e) => {
		console.log("Dragging card:", e.target);
		e.dataTransfer.setData('card_id',e.target.id);
	};
	const dragOver = (e) => {
		e.preventDefault();
	}
	const dropHandler = async (e) => {
		e.preventDefault();
		const cardId = e.dataTransfer.getData("card_id");
		const alreadyHere = cards.some(c => c._id === cardId);
		if (alreadyHere) return;
		console.log("calling bckend")
		const response = await api("getCard", "POST", {
			email: user,
			card_id: cardId
		})
		api("updateCard", "POST", {
			email: user,
			card_id: cardId,
			new_list_id: list_id
		});

		// Update UI
		if(response.card.list_id===list_id){
			setCards(prev => [...prev, response.card]);
			console.log("Dropped card:", cards);
		}
	}
	// const onDragEnter = (e, group) => {
	// 	setitems([...items, (items[dragging.id - 1].group = group)]);
	// };

	// const [dragging, setDragging] = useState();
	const ref = useRef(null);
	useEffect(()=>{
		setCards(listcards);
	},[listcards])

	const input = ()=>{
		if(showInput && setNewCard.trim()!==""){
			// add card to listData
			api('createCard','POST',{
				email:user,
				card_name:setNewCard.trim(),
				board_id:listboard,
				description:"",
				list_id:selectedCard,
				type:"task"
			}).then((response)=>{
				console.log(response);
				if(response.success===true){
					console.log(setNewCard.trim());
					const newCard = { _id: response.card_id, card_name: setNewCard.trim() };
					setCards([...cards, newCard]);
					changeSetNewCard("");
					changeShowInput(!showInput)
					socket.emit('card_create',{
						board_id:listboard,
						card: response.card
					});
					//
				}
			});
			setCards([...cards, setNewCard.trim()]);
			changeSetNewCard("");
			changeShowInput(!showInput)
		}
		else{
			changeShowInput(!showInput);
		}
	}
	// const handleDragStart=(e)=>{
	// 	setDragging(e.target);
	// }
	// const onDragEnter = (e, group) => {
	// 	setCards([...cards, (cards[dragging.id - 1].group = group)]);
	// };
	const resize = ()=>{
		const el = ref.current;
		el.style.height = "auto";
		el.style.height = el.scrollHeight + "px";
	}
	return(
		<div onClick={() => setSelectedCard(list_id)} onDrop={(e)=>dropHandler(e)} onDragOver={(e) => dragOver(e)} className="rounded-xl p-4 border ml-2 max-w-sm h-fit min-w-sm max-h-[90%] overflow-y-auto">
			<div className="flex flex-row justify-between text-lg mb-2">
				<h2>{listNameEdit ? <input type="text" value={newListName} onChange={(e) => {
						setNewListName(e.target.value);
					}} /> : listname}</h2>
				<div onClick={()=>{
					if(listNameEdit){
						// save new list name
						api('renameList','POST',{
							email:user,
							list_id:list_id,
							new_list_name:newListName
						}).then((response)=>{
							console.log(response);
							if(response.success===true){
								setLists((prevLists) =>
									prevLists.map((lst) =>
										lst._id === list_id ? { ...lst, name: newListName } : lst
									)
								);
								socket.emit('listNameUpdate',{
									board_id:listboard,
									list_id:list_id,
									new_list_name:newListName
								});
								setNewListName(newListName);
							}
						})
					}
					setListNameEdit(!listNameEdit)
				}} >
					{listNameEdit?"Save":"Edit"}
				</div>


			</div>
			<p className="pt-2 pb-0 "></p>
			{cards.map((card)=>{
				console.log("Rendering Card:", card);
				if(card){
					return(
						<div draggable={true} onClick={()=>setShowModal(card)} key={card._id} id={card._id} onDragStart={(e) => handleDragStart(e)} className="p-2 mb-2 border rounded-lg">
							{card.card_name}
						</div>
					)
				}
			})}
			{showInput && (
				<textarea value={setNewCard} className="w-full p-2 min-h-fit border overflow-hidden resize-none rounded-lg" ref={ref} onInput={resize} onChange={(e) =>{
					changeSetNewCard(e.target.value)
				}}></textarea>
			)}
			<button onClick={() => input(list_id)} className ="border w-full mt-2 py-2 rounded-md">+ Add card</button>
		</div>
	)
}