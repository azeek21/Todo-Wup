import { collection, getDocs, where, query, setDoc, doc} from "firebase/firestore";
import { useEffect, useState } from "react";
import {db} from './firebase-config';
import dayjs from "dayjs";
import revealTime from "dayjs/plugin/relativeTime";
import TodoData from "./todos";
// dayjs setup
dayjs.extend(revealTime);



function Todo({props}) {
	let {todo, setTodo, is_new, updateTodos, deleteTodo} = props;
	const [collapsed, setCollapsed] = useState((is_new ? false : true));
	const [editmode, setEditmode] = useState(is_new ? true : false);
	const [removed, setRemoved] = useState({state: false, timeOut: 5, timer: ""});
	[todo, setTodo] = useState(todo);
	// const is_expired = todo.deadline.seconds > new Date().getUTCSeconds();
	// console.log(todo);

	const filesHandler = (ev) => {
		let files = ev.target.files;
		for (let i = 0; i < files.length; i++) {
			if (files[i].size > 5.243e+6) {
				alert("You can't upload files bigger than 5 MB for now !");
				ev.target.value = "";
				return ;
			}
		};
		setTodo(old => ({...old, files: ev.target.files}));
	}

	function changeHandler(ev) {
		ev.target.name;
		if (ev.target.name  === "deadline" || ev.target.name === "deadline_time") {
			if (ev.target.name === "deadline" && !ev.target.value) {
				setTodo(old => ({...old, deadline: null}));
			}
			let deadline;
			if (!todo.deadline) {
				deadline = dayjs();
			}
			else if (todo.deadline) {
				deadline = dayjs.unix(todo.deadline)
			}
			if (ev.target.name === "deadline") {
				if (todo.deadline) {
					let h = deadline.get("hour");
					let m = deadline.get("minute");
					deadline = dayjs(ev.target.value).set("hour", h).set("m", m);
				}
				else {
					deadline = dayjs(ev.target.value);
				}
			}
			if (ev.target.name === "deadline_time") {
				let hour = ev.target.value ? parseInt(ev.target.value.split(":")[0]) : 23;
				let minute = ev.target.value ? parseInt(ev.target.value.split(":")[1]) : 59;
				deadline = deadline.set("hours", hour).set("minutes", minute);
			}

			setTodo(old => ({...old, deadline: deadline.unix()}));
			return ;
		}
		setTodo(old => ({ ...old, [ev.target.name]: ev.target.value }));
	}

	const checkBoxHandler = (ev) => {
		console.log(typeof(todo.is_done))
		changeHandler({target: {name: ev.target.name, value: ev.target.checked}});
	}

	const saveHandler = async () => {
		if (todo.is_new) {
			todo.created_at = new Date();
			todo.is_new = false;
			setCollapsed(true);
		}
		updateTodos(todo);
		const todo_ref = doc(db, "todos", todo.id);
		await setDoc(todo_ref, todo);
		setEditmode(false);
	}

	const deleteHandler = () => {
		setCollapsed(true);
		setRemoved(old => ({...old, state: true}));
		let i = 5;
		const will_be_removed = document.getElementById(`${todo.id}`)
		let timer = setInterval(() => {
			i--;
			if (i < 0) {
				will_be_removed.classList.add("todo_deleted")
				deleteTodo(todo.id);				
				clearInterval(timer);
			}
			setRemoved(old => ({...old, timeOut: old.timeOut - 1, timer: timer}));
		}, 1000);
	}

	
	const checkDeadline = (ev) => {
		console.log("BLUR");
		if (todo.deadline < dayjs().unix()) {
			let deadline = todo.deadline ? dayjs.unix(todo.deadline) : dayjs();
			deadline = deadline.set("hour", dayjs().hour()).set("minute", dayjs().minute() + 2);
			alert("Can't set date that's over as deadline !");
			ev.target.focus();
			setTodo(old => ({...old, deadline: deadline.unix()}));
		}
	};

	const toggleTodo = (ev) => {
		setCollapsed((old) => {return !old});
	}

	const filejsx = [];
	for (let i = 0; i < todo.files.length; i++)
	{
		let file = todo.files[i];
		filejsx.push(
			<div key={todo.id + i} className="todo__files__item" >
				<a className="todo__file__link" href={file.name}>
					<img className="todo__files__img" src="file.png" target="_blank" rel="noreferrer" alt="FILE" />
					<h3 className="todo__filename"> {file.name.length > 10 ? file.name.slice(0,10): file.name} </h3>
				</a>
			</div>
		)
	}

	const EditSave = (<button className="" onClick={
		editmode ? saveHandler : () => setEditmode(true)
	}> { editmode ? "SAVE" : "EDIT"} </button>);

	const DeleteButton = (<button className="" onClick={deleteHandler} > &#9003;</button>)
	const ToggleButton = <button className="" onClick={toggleTodo} > {!collapsed ? "⇑" : "⇓"} </button>


	if (removed.state) {
		return (
			<div
			id={todo.id}
			key={todo.id}
			className={`todos__item  ${ collapsed && "todos__collapsed"} ${removed.state && "todo_removed"}`}
			data-done={todo.is_done}
			data-starred={todo.is_starred}
			data-expired={todo.is_expired}
			>
				TODO HAS BEEN DELETED
				<button	
					onClick={() => {
						clearTimeout(removed.timer);
						setRemoved(old => ({...old, state: false, timeOut: 5}));
					}} >
					UNDO {removed.timeOut}</button>
			</div>
		);
	}

	return (
		<div
			id={todo.id}
			key={todo.id}
			className={`todos__item ${ collapsed && "todos__collapsed"} ${removed.state && "todo_deleted"}`}
			data-done={todo.is_done}
			data-expired={todo.is_expired}
			>
				<div className="todo_top">

				<input	className="is_done"
						onChange={checkBoxHandler}
						disabled={!editmode}
						type="checkbox"
						name="is_done"
						checked={eval(todo.is_done)}
						/>				
				<p className="dummy" > {todo.is_done ? "You finished it 👍" : todo.deadline ? `${todo.is_expired ? "It's been" : "You have about"} ${dayjs().to(dayjs.unix(todo.deadline), true)} ${todo.is_expired ? "since deadline" : "untill deadline"}` : "you dont have deadlines for this todo"} </p>
				<label className="deadline_label" htmlFor="deadline">
			
					{collapsed && todo.deadline ? <p>{`${dayjs().to(dayjs.unix(todo.deadline), true)} ${todo.is_expired ? "ago" : "left"}`}</p> : collapsed && !todo.deadline ? "No deadline" : ""}
			
					<input	id="deadline" 
							className="deadline_input"
							type="date"
							onChange={changeHandler}
							onBlur={checkDeadline}
							name="deadline"
							value={dayjs.unix(todo.deadline ? todo.deadline : undefined).format("YYYY-MM-DD")}
							disabled={!editmode}
							min = {dayjs().format("YYYY-MM-DD")}
				/>
				</label>
				
				<label className="deadline_time" htmlFor="deadlineTime">
					{collapsed && todo.deadline_time}
					<input	type="time"
							id="deadline_time"
							onChange={changeHandler}
							onBlur={checkDeadline}
							name="deadline_time"
							value={dayjs.unix(todo.deadline).format("HH:mm")}
							disabled={!editmode}
							min={dayjs().format("HH:mm")}
					/>
				</label>

				</div>
				<input	onChange={changeHandler}
						disabled={!editmode}
						className="todo__title"
						type="text"
						placeholder="To Do title here"
						name="title" value={todo?.title}>		
				</input>

				<textarea 	onChange={changeHandler}
						  	disabled={!editmode}
							className="todo__desc"
							placeholder="To Do description here ..."
							name="description"
							value={todo?.description}>

				</textarea>

				<div className="todo__files" >
					{filejsx}
					{is_new || editmode ?
						<label className="file__picker" htmlFor="file__picker"> Select files ...
						<input onChange={filesHandler} id="file__picker" style={{display : "none"}} type="file" multiple={true}/>
						</label>
						: ""}
				</div>

				<div className="todo__button">
					{!todo.is_expired && EditSave}
					{DeleteButton}
					{ToggleButton}
				</div>
		</div>
	)
}


function Todos({props}) {
	console.log(props);
	const [todos, setTodos] = useState([]);
	const [temp_id, setTemp_id] = useState(0);
	const [loading, setLoading] = useState(true)


	useEffect(() => {
		const getTodos = async () => {
			const todosCollection = collection(db, 'todos');
			const todosQuery = query(todosCollection, where("uid", "==", props.user.uid));

			const todosDocs = await getDocs(todosQuery);

			setTodos(todosDocs.docs.map(doc => ({id: doc.id, ...doc.data()})));
			// setTodos(todosDocs.docs);
		};
		getTodos();
	},
	[props.uid]);

	const updateTodos = (new_todo) => {
		// console.log("upodating:", new_todo);
		if (new_todo.is_new) {
			return setTodos(olds => [new_todo, ...olds]);
		}
		setTodos(oldTodos => oldTodos.map(todo => {
			if (todo.id === new_todo.id ) {
				if (JSON.stringify(todo) !== JSON.stringify(new_todo)) {
					return new_todo;
				}
			}
			return todo;
		}));
	}

	const deleteTodo = (delete_id) => {
		console.log(delete_id)
		// setTodos((old_todos => old_todos.map(todo => {return todo.id  != delete_id ? todo : null })));
		setTodos(old_todos => old_todos.filter(todo => todo.id != delete_id));
	}

	function getTodoTemplate() {
		setTemp_id(old => old + 1)
		return (
			{
				id: "temp_" + temp_id,
				title: "",
				description: "",
				files : [],
				is_done: false,
				is_expired: false,
				created_at: 0,
				is_new: true,
				is_expired: false,
				deadline: false,
			}
		)
	}

	const createTodo = () => {
		let template = getTodoTemplate();
		updateTodos(template);
	};

	const todos_visible = todos.map(todo => {
		if (todo.deadline && (todo.deadline - dayjs().unix()) < 0)
			todo.is_expired = true;
		return (
			<Todo key={todo.id} props={{todo, is_new: todo.is_new, setTodo: {}, updateTodos, deleteTodo}} />
		);
	})
	return (
		<section className="todos">
			<div className="todos__toolbar">
				<button onClick={createTodo} >ADD</button>
			</div>
			<div className="todos__list">
				{todos.length == 0 ? "You don't have any todos yet, Let's create one now  😃" : todos_visible}
			</div>
		</section>
	)
}

export default Todos;
// "name.userid.todoid"

// https://dbdiagram.io/d/6376f2ddc9abfc6111738dd4 ;