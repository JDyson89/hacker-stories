import React from 'react';
import axios from 'axios';

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramom, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () =>
  new Promise((resolve, reject) => setTimeout(reject, 2000));

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
);

  React.useEffect(() => {
    localStorage.setItem(key, value);
}, [value, key]);

  return [value, setValue];
};
const API_ENDPOINT ='https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
  );

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const storiesReducer = (state, action) => {
    switch (action.type) {
      case 'STORIES_FETCH_INIT':
        return {
          ...state, 
          isLoading: true,
          isError: false,
        };
      case 'STORIES_FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case 'STORIES_FETCH_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      case 'REMOVE_STORY':
        return {
          ...state,
          data: state.data.filter(
            story => action.payload.objectID !== story.objectID
          ),
        };
      default:
        throw new Error();
    }
  };

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
   { data: [], isLoading: false, isError: false}
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_SUCCESS' });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories(); 
  }, [handleFetchStories]);

  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };
  
  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = event => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };

    return (
      <div>
        <h1>My Hacker Stories</h1>
 
      {/* const SearchForm = ({
        searchTerm,
        onSearchInput,
        onSearchSubmit,
      }) => (
        <form onSubmit={onSearchSubmit}>
          <InputWithLabel 
            id='search'
            value={searchTerm}
            isFocused
            onInputChange={onSearchInput}
          >
            <strong>Search:</strong>
          </InputWithLabel>

          <button type='submit' disabled={!searchTerm}>
            Submit
          </button>
        </form>
    ); */}
        <SearchForm 
          searchTerm={searchTerm}
          onSearchInput={handleSearchInput}
          onSearchSubmit={handleSearchSubmit}
        />
        
        <hr />

        {stories.isError && <p>Something went wrong ...</p>}

        {stories.isLoading ? (
          <p>Loading ...</p>
        ) : (
          <List list={stories.data} onRemoveItem={handleRemoveStory} />
        )}
      </div>
    );
};

const InputWithLabel = ({
  id,
  label,
  value,
  type = 'text',
  onInputChange,
  isFocused,
  children,
}) => {
  //A
  const inputRef = React.useRef();
  
  //C
  React.useEffect(() => {
    if(isFocused && inputRef.current){
      //D
      inputRef.current.focus();
    }
  }, [isFocused]);
       
    return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
      ref={inputRef} 
        id={id} 
        type={type} 
        value={value}
        autoFocus={isFocused}
        onChange={onInputChange}
      />
    </>
  );
}

const List = ({ list, onRemoveItem }) =>
  list.map(item => (
    <Item 
    key={item.objectID} 
    item={item} 
    onRemoveItem={onRemoveItem}
    />
  ));

const Item = ({ item, onRemoveItem }) => (
  <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button 
          type='button' 
          onClick= {() => {
            onRemoveItem(item)
          }}
        >
          Dismiss
        </button>
      </span>
    </div>
  );

export default App;