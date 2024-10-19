//frontend/src/store/spots.js

import { csrfFetch } from "./csrf";

// #1 ACTION TYPES
const LOAD = "spots/LOAD";
const CREATE = "spots/CREATE";

// #2 ACTION CREATORS
//* Create Action with LOAD type that returns action type and list of spots:
export const loadSpots = (spotsData) => ({
  type: LOAD,
  list: spotsData, // Pass the data in the expected structure
});

export const createSpot = (spot) => ({
  type: CREATE,
  spot,
});

// #3 THUNK ACTION
//* Create thunk action to fetch list of Spots from the server
export const getSpots = () => async (dispatch) => {
  dispatch({ type: "spots/LOAD_START" }); // Set loading true before fetch
  try {
    const response = await fetch(`api/spots`);
    if (response.ok) {
      const data = await response.json();
      dispatch(loadSpots(data.Spots)); //! FIX IDENTIFIED. Updated from data to data.spots to access nested data.
      return data.spot; // Return the created spot data //!! REMEMBER TO RETURN
    } else {
      console.error("Failed to fetch spots:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching spots:", error);
  } finally {
    dispatch({ type: "spots/LOAD_END" }); // Set loading false after fetch
  }
};

//* Create thunk action to create a spot in server

export const createNewSpot = (spotData) => async (dispatch, getState) => {
  const response = await csrfFetch("/api/spots", {
    method: "POST",
    body: JSON.stringify(spotData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("========>Response from server:", response); //?? DEBUGGER

  if (response.ok) {
    const data = await response.json();
    const existingSpots = getState().spots.list; // Access the existing spots from the state
    dispatch(loadSpots([...existingSpots, data.spot])); // Update your existing spots here
    return data;
  } else {
    const errorData = await response.json();
    console.error("============>ERROR creating spot:", errorData);
    return Promise.reject(errorData);
  }
};

//# 4 SET INITIAL STATE
const initialState = {
  list: [],
  loading: false,
};

// #5 REDUCER HANDLING
const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    //* When LOAD action type is received, it processes the list of Spots from the action.
    case LOAD:
      return {
        ...state,
        loading: false, // Consider setting loading here if needed
        list: action.list,
      };
    case "spots/LOAD_START":
      return {
        ...state,
        loading: true,
      };
    case "spots/LOAD_END":
      return {
        ...state,
        loading: false,
      };

    case CREATE:
      return {
        ...state,
        list: [...state.list, action.spot],
      };
    default:
      return state;
  }
};

export default spotsReducer;
