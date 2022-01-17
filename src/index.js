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

const initialCount = 50;
// Step1 : Writing the reducer

const counterReducer = (state = initialCount, action) => {
	switch (action.type) {
		case 'INCREMENT':
			return state + 1;
		case 'DECREMENT':
			return state - 1;
		default:
			return state;
	}
};

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
	counter: counterReducer,
});

// Step2 : Writing the React UI component
const AddTodo = ({ onAddClick }) => {
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
					onAddClick(input.value);
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

const Counter = ({ value, onIncrement, onDecrement }) => (
	<div className='counter'>
		<h1>{value}</h1>
		<button onClick={onIncrement}>+</button>
		<button onClick={onDecrement}>-</button>
	</div>
);

const FilterLink = ({ filter, currentFilter, children }) => {
	if (filter === currentFilter) {
		return <span>{children}</span>;
	}
	return (
		<a
			href='#'
			onClick={e => {
				e.preventDefault();
				store.dispatch({
					type: 'SET_VISIBILITY_FILTER',
					filter,
				});
			}}
		>
			{children}
		</a>
	);
};

let nextTodoID = 100;
class TodoApp extends Component {
	render() {
		const { todos, visibitlityFilter } = this.props;
		const visibleTodos = getVisibleTodos(todos, visibitlityFilter);
		return (
			<div className='counter'>
				<h1>Counter App!</h1>
				<Counter
					value={store.getState().counter}
					onIncrement={() =>
						store.dispatch({
							type: 'INCREMENT',
						})
					}
					onDecrement={() =>
						store.dispatch({
							type: 'DECREMENT',
						})
					}
				/>
				<h1>Todo App!</h1>
				<AddTodo
					onAddClick={text =>
						store.dispatch({
							type: 'ADD_TODO',
							id: nextTodoID++,
							text,
						})
					}
				/>
				<TodoList
					todos={visibleTodos}
					onTodoClick={id =>
						store.dispatch({
							type: 'TOGGLE_TODO',
							id,
						})
					}
				/>
				<p>
					Show:{' '}
					<FilterLink currentFilter={visibitlityFilter} filter='SHOW_ALL'>
						All
					</FilterLink>{' '}
					<FilterLink currentFilter={visibitlityFilter} filter='SHOW_ACTIVE'>
						Active
					</FilterLink>{' '}
					<FilterLink currentFilter={visibitlityFilter} filter='SHOW_COMPLETED'>
						Completed
					</FilterLink>
				</p>
			</div>
		);
	}
}

// Step 3 : Creating a store
const store = createStore(todoApp);

//Step 4 : Render to DOM
// onIncrement and onDecrement are actionCreator
// that return a action object with type property
// these can be in a seperate file
const render = () => {
	ReactDOM.render(
		<TodoApp
			todos={store.getState().todos}
			visibitlityFilter={store.getState().visibitlityFilter}
		/>,
		document.getElementById('root')
	);
};

store.subscribe(render);
render();
