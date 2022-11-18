import { collection, getDocs, where, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {db} from './firebase-config';


function Todos(props) {
	const [todos, setTodos] = useState([]);

	const todosCollection = collection(db, 'todos');
	// console.log(props.userId);
	const q = query(todosCollection, where("userId", "==", props.userId));

	
	useEffect(() => {
		const getTodos = async () => {
			const data = await getDocs(q);
			// data.docs.map(doc => {console.log(doc.id, doc.data())});
			setTodos(data.docs.map((doc) => ({id: doc.id, ...doc.data()})));
			// console.log(todos);
		};
		getTodos();
	},
	[props.userId]);
	const todos_visible = todos.map(todo => {
		return (
			<div key={todo.id} className="todos__item">
				<h2>{todo.title}</h2>
				<p>{todo.description}</p>
				<p>{todo.userId}</p>
				<p>{todo.files[0]}</p>
				<p>{todo.is_done ? "true" : "false"}</p>
				<p>{todo.is_pinned ? "true" : "false"}</p>
				<p>{todo.is_starred ? "true" : "false"}</p>
				<p>{todo.creation_date.seconds}</p>
				<p>{todo.deadline.seconds}</p>
			</div>
		)
	})
	// console.log(todos_visible);
	return (
		<section className="todos">
			<div className="todos__toolbar">
				<button>V</button>
				<button>X</button>
				<button>Delete</button>
				<button>Pin</button>
				<button>*</button>
			</div>
			<div className="todos__list">
				{todos.length == 0 ? "" : todos_visible}
			</div>
		</section>
	)
}

export default Todos;
// "name.userid.todoid"

// https://dbdiagram.io/d/6376f2ddc9abfc6111738dd4 ;