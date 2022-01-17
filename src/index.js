import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { createStore, combineReducers } from 'redux';

const initialState = [
	{ completed: false, id: 0, text: 'workout' },
	{ completed: false, id: 1, text: 'read' },
	{ completed: false, id: 2, text: 'breakfast' },
	{ completed: false, id: 3, text: 'nap' },
	{ completed: false, id: 4, text: 'read' },
];

// Step1 : Writing the reducer

const todoReducer = (state, action) => {
	switch (action.type) {
		case 'ADD_TODO':
			return {
				id: action.id,
				text: action.text,
				completed: false,
			};
		case 'TOGGLE_TODO':
			if (state.id !== action.id) {
				return state;
			}
			return {
				...state,
				completed: !state.completed,
			};
		default:
			return state;
	}
};

const todosReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'ADD_TODO':
			return [...state, todoReducer(undefined, action)];
		case 'TOGGLE_TODO':
			return state.map(t => todoReducer(t, action));
		default:
			return state;
	}
};

const visibitlityFilterReducer = (state = 'SHOW_ALL', action) => {
	switch (action.type) {
		case 'SET_VISIBILITY_FILTER':
			return action.filter;
		default:
			return state;
	}
};

const todoApp = combineReducers({
	todos: todosReducer,
	visibitlityFilter: visibitlityFilterReducer,
});

// Step2 : Writing the React UI component
const Footer = () => (
	<p>
		Show:
		<FilterLink filter='SHOW_ALL'>All</FilterLink>{' '}
		<FilterLink filter='SHOW_ACTIVE'>Active</FilterLink>{' '}
		<FilterLink filter='SHOW_COMPLETED'>Completed</FilterLink>
	</p>
);

const Link = ({ active, onClick, children }) => {
	if (active) {
		return <span>{children}</span>;
	}
	return (
		<a
			href='#'
			onClick={e => {
				e.preventDefault();
				onClick();
			}}
		>
			{children}
		</a>
	);
};

class FilterLink extends Component {
	componentDidMount() {
		this.unsubscribe = store.subscribe(() => this.forceUpdate());
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	render() {
		const props = this.props;
		const state = store.getState();

		return (
			<Link
				active={props.filter === state.visibitlityFilter}
				onClick={() =>
					store.dispatch({
						type: 'SET_VISIBILITY_FILTER',
						filter: props.filter,
					})
				}
			>
				{props.children}
			</Link>
		);
	}
}

const AddTodo = () => {
	let input;
	return (
		<div>
			<input
				ref={node => {
					input = node;
				}}
			/>
			<button
				onClick={() => {
					store.dispatch({
						type: 'ADD_TODO',
						id: nextTodoID++,
						text: input.value,
					});
					input.value = '';
				}}
			>
				Add Todo
			</button>
		</div>
	);
};

const Todo = ({ onClick, completed, text }) => (
	<li
		onClick={onClick}
		style={{
			textDecoration: completed ? 'line-through' : 'none',
		}}
	>
		{text}
	</li>
);

const TodoList = ({ todos, onTodoClick }) => (
	<ul>
		{todos.map(todo => (
			<Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
		))}
	</ul>
);

const getVisibleTodos = (todos, filter) => {
	switch (filter) {
		case 'SHOW_ALL':
			return todos;
		case 'SHOW_COMPLETED':
			return todos.filter(t => t.completed);
		case 'SHOW_ACTIVE':
			return todos.filter(t => !t.completed);
		default:
			return todos;
	}
};

class VisibleTodoList extends Component {
	componentDidMount() {
		this.unsubscribe = store.subscribe(() => this.forceUpdate());
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
	render() {
		const props = this.props;
		const state = store.getState();

		return (
			<TodoList
				todos={getVisibleTodos(state.todos, state.visibitlityFilter)}
				onTodoClick={id =>
					store.dispatch({
						type: 'TOGGLE_TODO',
						id,
					})
				}
			/>
		);
	}
}

let nextTodoID = 100;

const TodoApp = () => (
	<div className='counter'>
		<AddTodo />
		<VisibleTodoList />
		<Footer />
	</div>
);

// Step 3 : Creating a store
const store = createStore(todoApp);

//Step 4 : Render to DOM
// onIncrement and onDecrement are actionCreator
// that return a action object with type property
// these can be in a seperate file

ReactDOM.render(
	<TodoApp {...store.getState()} />,
	document.getElementById('root')
);
