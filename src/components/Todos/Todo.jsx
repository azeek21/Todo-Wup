/**
 * all needed imports here
 */
import { collection, getDocs, where, query, setDoc, doc, addDoc, orderBy, deleteDoc} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import {auth, db, storage} from '../../firebase-config';
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

	/**
	 * @var {string} oldFilesString stores stringified format of todo.files so that we can compare it with the todo.files
	 * and check if anthing has changed or not. So that we can avoid re uploading files of a todo that hasn't been changed.
	 * @function setOldFilesString @argument {string} oldFilesString updates oldFileString
	 */
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


	/**
	 * @listens {input:file}.
	 * @param {change event} event 
	 * checks every time selected files of a todo changed and checks if any of them exceed 5mb wich is 5.243e+6 bytes
	 * max limit. If any file is bigger than 5mb it alerts the user about it and set's the selected files to empty.
	 * 
	 * Finally: updates todo.files if selected files pass all validations.
	 */
	const filesHandler = (ev) => {
		let files = ev.target.files;
		for (let i = 0; i < files.length; i++) {
			if (files[i].size > 5.243e+6) {
				alert("You can't upload files bigger than 5 MB for now !");
				ev.target.value = "";
				return ;
			}
		};
		setTodo({...todo, files: ev.target.files});
	}


	/**
	 * @listens inputs except files and checkboxes and updates the values of them in todo respectively.
	 * @param {change event} ev passed by caller wich is <input onChange={changeHandler} >
	 */
	function changeHandler(ev) {

		/**
		 * we check if changed input field is respective for deadline and if so we'll hanle it in a different way 
		 * than we'd do with text inputs.
		 */
		if (ev.target.name  === "deadline" || ev.target.name === "deadline_time") {
			// check if user removed the deadline and setting it to null if user removes it;
			if (ev.target.name === "deadline" && !ev.target.value) {
				setTodo(old => ({...old, deadline: null}));
			}
			let deadline;
			
			// checking if user had a deadline so far, setting it to instance of dayjs instance if user didn't have a deadline (if todo.deadine is falsy value);
			if (!todo.deadline) {
				deadline = dayjs();
			}
			// obtaining user's deadline if it's set
			else if (todo.deadline) {
				deadline = dayjs.unix(todo.deadline)
			}


			if (ev.target.name === "deadline") {
				// setting the date (day, month, year) of deadline if user change them and copying hour and minute from the old deadline
				if (todo.deadline) {
					let h = deadline.get("hour");
					let m = deadline.get("minute");
					deadline = dayjs(ev.target.value).set("hour", h).set("m", m);
				}
				else {
					// setting date of deadline if this is the first time user setting a deadline ;
					deadline = dayjs(ev.target.value);
				}
			}
			if (ev.target.name === "deadline_time") {
				// setting user's deadline time (hour:minute) if user set's else seting them to end of the day wich is 23:59
				let hour = ev.target.value ? parseInt(ev.target.value.split(":")[0]) : 23;
				let minute = ev.target.value ? parseInt(ev.target.value.split(":")[1]) : 59;
				deadline = deadline.set("hours", hour).set("minutes", minute);
			}

			// updating deadline and finishing the function ;
			setTodo(old => ({...old, deadline: deadline.unix()}));
			return ;
		}
		// updating the todo fields like title and description if change was not in deadline
		setTodo(old => ({ ...old, [ev.target.name]: ev.target.value }));
	}

	/**
	 * @listens change on checkbox for done or undone and initializing needed
	 * values calls the @function changeHandler with updated @param target
	 * @param {change event} ev from input field type checkbox 
	 */
	const checkBoxHandler = (ev) => {
		// we copy checkbox's checked status to target.value as checboxes store their state in target.checked not in target.value as other inputs like text or time
		changeHandler({target: {name: ev.target.name, value: ev.target.checked}});
	}

	/**
	 * @listens BUTTON:SAVE from todo and updates the firebase database respectively
	 */
	const saveHandler = async () => {
		// we set saving state of todo to true so there'll be loading animation untill we are done saving the todo
		setSaving(true);

		// we detect if user has added or changed any file attachments and upload files to firebase storage
		if (todo.files.length > 0 && oldFilesString !== JSON.stringify(todo.files)) {

			/**
			 * @function uploader, uploads files to firebase storage and creates array of objects containing information about each file
			 * like donwoad url, filename in storage, original name of the file, size of the file and so on.
			 * @param {FileList} files from todo.files set by @function fileshandler
			 * @returns {array} new_files_array; array of file objects with their filename and donwload url from firebase storage
			 */
			const uploader = async (files) => {
				// creating our own array for uploaded files
				let new_files_array = [];
				for (let i = 0; i < files.length; i++)
				{
					let file = files[i];

					// creating a new filename for file to store in firebase storage so it'll not override any existing files
					// as we are using userid + current time in unix + original filename; this ensures every filename to be unique in storage
					let filename = "user_files/" + auth.currentUser.uid + dayjs().unix() + file.name;
					try {
						// this uploads the file to firebase sotreage under 'filename' we generated earlier ;
						const uploadTask = await uploadBytesResumable(ref(storage, filename), file);

						// get the download link of the already uploaded file and append it to file object
						const url = await getDownloadURL(uploadTask.ref);
						files[i].url = url;
						files[i].filename = filename;
					} catch (error) {
						alert(`Error during file upload, error message here:\n${error.message}`)
						return ;
					}
					// creating file object referencing some values from original file and adding our fields like url and filename;
					let new_file = {name: file.name, filename: file.filename, size: file.size, url: file.url};
					
					// appending new file object that we created to the array of uploaded files
					new_files_array.push(new_file);
				}

				// updating string of uploaded files so they'll not get reuploaded if user resaves the todo without changing any files
				setOldFilesString(JSON.stringify(new_files_array));

				// returning our new array of uploaded objects
				return new_files_array;
			}
			// setting todo.files to new generated files array so it can be saved to firebase databse
			// NOTE: firebase database doesn't accept default FileList files array so we must genrate 
			// an array of file objects to store info about fiels in firebase database.
			todo.files = await uploader(todo.files);
		}

		// checking if todo is new and setting creation time to current date and time before saving ;
		if (todo.is_new) {
			todo.is_new = false;
			todo.created_at = dayjs().unix();
		}

		// updating todo in firebase database
		await setDoc(doc(db, "todos", todo.id), todo);

		// updating todo itself inside the app after we finish updating the todo in database ;
		setTodo(todo);

		// updating the todo in the list of all todos in upper Todos component;
		updateTodos(todo);

		// setting editmode as false as we finish saving the document and we are not editing it anymore for now;
		setEditmode(false);

		// finshing and releasing loading status as we updated everything succesfully
		setSaving(false);

		// not necessary return statement for no reason
		return ;
	}

	/**
	 * @listens BUTTON:DELETE from todo and deltes the todo respectively after 5 seconds enabling user
	 * to undone the action if it was not intentional.
	 */
	const deleteHandler = () => {
		// changing the todo's state to collapsed so it look's better and more clear that it's being deleted
		setCollapsed(true);

		// setting todo's pre delte state so it's visibly clear that this todo will be delted soon ;
		setRemoved(old => ({...old, state: true}));

		// todo will be deleted for real whe this i reaches 0
		let i = 5;

		// getting the respective todo so we can add a smooth delteing animation when it's deletet
		const will_be_removed = document.getElementById(`${todo.id}`)

		// setting interval for every second so it updates the time left every second making it less by a second every time untill it reaches zero;
		let timer = setInterval(async () => {
			// decrementing i by 1 every second
			i--;
			if (i < 0) {
				// animating deleted todo if time reaches 0
				will_be_removed.classList.add("todo_deleted")

				// deleting it from database 
				await deleteDoc(doc(db, "todos", todo.id));

				// removing it from UI
				deleteTodo(todo.id);

				// removing the interval
				clearInterval(timer);
			}
			// updating the removed object with new number of seconds left to undo the action every second
			setRemoved(old => ({...old, timeOut: old.timeOut - 1, timer: timer}));
		}, 1000);
	}


	/**
	 * checks the set deadline and notifies the user if deadline is set to time that is already over and reset's it to current date time + 2 minutes;
	 * leaves unchanged if deadline is set for the future ;
	 * @listens change on respective deadline inputs
	 * @param {*} ev ingored for now. we'll not be using it in this function but I'll leave it here as it's avialeble 
	 * and might be useful in the future;
	 */
	const checkDeadline = (ev) => {
		if (todo.deadline < dayjs().unix()) {
			let deadline = todo.deadline ? dayjs.unix(todo.deadline) : dayjs();
			deadline = deadline.set("hour", dayjs().hour()).set("minute", dayjs().minute() + 2);
			alert("Can't set date that's over as deadline !");
			ev.target.focus();
			setTodo(old => ({...old, deadline: deadline.unix()}));
		}
	};

	/**
	 * toggels between collapsed and full view of todo.
	 * @param {*} ev not user, might be useful in the future ;
	 */
	const toggleTodo = (ev) => {
		setCollapsed((old) => {return !old});
	}

	// collecting all the dom related to files into an array to make the jsx inside return statement more clear ;
	const filejsx = [];
	for (let i = 0; i < todo.files.length; i++)
	{
		let file = todo.files[i];
		filejsx.push(
			<div key={todo.id + i} className="todo__files__item" >
				<a className="todo__file__link" target="_blank" href={file.url ? file.url : ""} download={file.name} >
					<img className="todo__files__img" src="file.png" rel="noreferrer" alt={file.name}/>
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

/**
 * @link to some stupid usefult, not so userful schema ;
 */
// https://dbdiagram.io/d/6376f2ddc9abfc6111738dd4 ;