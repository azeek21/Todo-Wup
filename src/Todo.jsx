/**
 * all needed imports here
 */
import { collection, getDocs, where, query, setDoc, doc, addDoc, orderBy, deleteDoc} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import {auth, db, storage} from './firebase-config';
import dayjs from "dayjs";
import revealTime from "dayjs/plugin/relativeTime";

/** adding revealTime plugin to dayjs so we can use it's functions like, timeto, timefrom e.t.c */ 
dayjs.extend(revealTime);


/**
 * a single todo component.
 * @param {object} props will be passed by Todos component;
 * @returns {JSX} single todo component to Todos parent/container
 */
function Todo({props}) {
	/**
	 * parsing todo object, setTodo function, is_new boolean, updateTodos and deleteTodo funcitons
	 * from props passed by todos parent component
	 */
	let {todo, setTodo, is_new, updateTodos, deleteTodo} = props;

	const [oldFilesString, setOldFilesString] = useState(JSON.stringify(todo.files));

	/**
	 * @var {boolean} collapsed todo's state of being collapsed or fully visible
	 * @function setCollapsed @argument {boolean} collapsed set's the todo's state
	 */
	const [collapsed, setCollapsed] = useState((is_new ? false : true));

	/**
	 * @var {boolean} editmode todo's state of being edited or not
	 * @function setEditmode @argument {boolean} editmode status of todo being edited or not
	 */
	const [editmode, setEditmode] = useState(is_new ? true : false);

	/**
	 * @var {object} removed todo's state of being removed or not and other info like time user has before todo get's deleted and timeout funciton reference;
	 * @function setRemoved @argument {object} removed 
	 */
	const [removed, setRemoved] = useState({state: false, timeOut: 5, timer: ""});

	/**
	 * @var {boolean} saving state of todo being saved or not, if true, save button will be replaced by loading animation to\
	 * represent todo being saved.
	 * @function setSaving @argument {boolean} saving true if todo is being saved false if not or finished saving;
	 */
	const [saving, setSaving] = useState(false);

	/**
	 * @var {object} todo todo object containing all the info about this single todo;
	 * @function setTodo @argument {object} todo set's the todo object of current todo component;
	 * @NOTE useState function doesn't update the original todo object passed by todos component. it just updates copy of it passed to this component,
	 * to update the original todo object in Todos component, use @function updateTodos @argument {object} todo
	 */
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
		setSaving(true);
		if (todo.files.length > 0 && oldFilesString !== JSON.stringify(todo.files)) {
			console.log(todo.files);

			const uploader = async (files) => {
				console.log("REUPLOADING");
				for (let i = 0; i < files.length; i++)
				{
					let file = files[i];
					let filename = "user_files/" + auth.currentUser.uid + dayjs().unix() + file.name;
					try {
						const uploadTask = await uploadBytesResumable(ref(storage, filename), file);
						const url = await getDownloadURL(uploadTask.ref);
						files[i].url = url;
						files[i].filename = filename;
					} catch (error) {
						alert(`Error during file upload, error message here:\n${error.message}`)
					}
				}

				console.log("UPLOAD DONE");
				setTodo(old => ({...old, files: files})); // todo: make file data that so it could be set to firebase db;
				setOldFilesString(JSON.stringify(todo.files));
			}
			uploader(todo.files);
		}

		// file {nameDb: string, name: name, downloadUrl: string(url)  };
		//
		//
		// if (todo.is_new) {
		// 	console.log("ADD")
		// 	const todo_for_db = {
		// 		title: todo.title,
		// 		uid: auth.currentUser.uid,
		// 		description: todo.description,
		// 		files: todo.files,
		// 		is_done: todo.is_done,
		// 		is_new: false,
		// 		is_expired: todo.is_expired,
		// 		deadline: todo.deadline,
		// 		created_at: dayjs().unix()
		// 	};

		// 	const {id} = await addDoc(collection(db, "todos"), todo_for_db);
		// 	console.log(id);
		// 	console.log(todo_for_db.is_new);
		// 	updateTodos({...todo_for_db, id: id, is_new: false});
		// 	setEditmode(false);
		// 	setSaving(false);
		// 	return ;
		// 
		if (todo.is_new) {
			todo.is_new = false;
			todo.created_at = dayjs().unix();
		}

		console.log("UPDATE");
		updateTodos(todo);
		await setDoc(doc(db, "todos", todo.id), todo);
		setEditmode(false);
		setSaving(false);
		return ;
	}

	const deleteHandler = () => {
		setCollapsed(true);
		setRemoved(old => ({...old, state: true}));
		let i = 5;
		const will_be_removed = document.getElementById(`${todo.id}`)
		let timer = setInterval(async () => {
			i--;
			if (i < 0) {
				will_be_removed.classList.add("todo_deleted")
				await deleteDoc(doc(db, "todos", todo.id));
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
		// todo.files = JSON.parse(todo.files);
		let file = todo.files[i];
		filejsx.push(
			<div key={todo.id + i} className="todo__files__item" >
				<a className="todo__file__link" href={file.url} download={file.name} >
					<img className="todo__files__img" src="file.png" target="_blank" rel="noreferrer" alt="FILE"/>
					<h3 className="todo__filename"> {file.name.length > 10 ? file.name.slice(0,10): file.name} </h3>
				</a>
			</div>
		)
	}

	const EditSave = (<button	className="" 
								onClick={
								editmode && !saving ? saveHandler
								: editmode && saving ? () => {}
								: () => setEditmode(true)}
								> { editmode && !saving ? "SAVE" : editmode && saving ? <div className="loader"></div> : "EDIT"} </button>);

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
						value={todo?.title}		
						name="title">
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
	const [todos, setTodos] = useState([]);
	const [temp_id, setTemp_id] = useState(0);
	const [loading, setLoading] = useState(false)



	useEffect(() => {
		const getTodos = async () => {
			const todosCollection = collection(db, 'todos');
			const todosQuery = query(todosCollection, where("uid", "==", props.user.uid), orderBy("created_at", "desc"));

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
			console.log("HERE, Created todo and added");
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
		// console.log(delete_id)
		// setTodos((old_todos => old_todos.map(todo => {return todo.id  != delete_id ? todo : null })));
		setTodos(old_todos => old_todos.filter(todo => todo.id != delete_id));
	}

	async function getTodoTemplate() {
		setTemp_id(old => old + 1)
		const todo = {
				title: "",
				description: "",
				files : [],
				is_done: false,
				is_expired: false,
				created_at: dayjs().unix(),
				is_new: true,
				is_expired: false,
				deadline: false,
				uid: auth.currentUser.uid
			}
		const {id} = await addDoc(collection(db, "todos"), todo);
		todo.id = id;
		return todo;
	}

	const createTodo = async () => {
		setLoading(true);
		let template = await getTodoTemplate();
		updateTodos(template);
		setLoading(false);
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
				<button onClick={loading ? () => {} : createTodo} > {loading ? <div className="loader"></div> : "ADD"} </button>
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