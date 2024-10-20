//frontend/src/store/reviews.js

import { csrfFetch } from "./csrf";

// #1 ACTION TYPES
const LOAD = "reviews/LOAD";
const CREATE = "reviews/CREATE";

// #2 ACTION CREATORS
export const loadReviews = (reviewsData) => ({
  type: LOAD,
  list: reviewsData,
});

export const createReview = (review) => ({
  type: CREATE,
  review,
});

// #3 THUNK ACTION
export const getReviews = () => async (dispatch) => {
  dispatch({ type: "reviews/LOAD_START" });
  try {
    const response = await fetch(`api/reviews`);
    if (response.ok) {
      const data = await response.json();
      dispatch(loadReviews(data.Reviews));
      return data.review;
    } else {
      console.error("Failed to fetch reviews:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching spots:", error);
  } finally {
    dispatch({ type: "reviews/LOAD_END" });
  }
};

export const createNewReview = (reviewData) => async (dispatch, getState) => {
  const response = await csrfFetch("api/spots/:spotID/reviews", {
    method: "POST",
    body: JSON.stringify(reviewData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("========>Response from server:", response);

  if (response.ok) {
    const data = await response.json();
    const existingReviews = getState().reviews.list;
    dispatch(loadReviews([...existingReviews, data.review]));
    return data;
  } else {
    const errorData = await response.json();
    return Promise.reject(errorData);
  }
};

// #4 SET INITIAL STATE
const initialState = {
  list: [],
  loading: false,
};

// #5 REDUCER HANDLING
const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: false, // Consider setting loading here if needed
        list: action.list,
      };
    case "reviews/LOAD_START":
      return {
        ...state,
        loading: true,
      };
    case "reviews/LOAD_END":
      return {
        ...state,
        loading: false,
      };

    case CREATE:
      return {
        ...state,
        list: [...state.list, action.review],
      };
    default:
      return state;
  }
};

export default reviewsReducer;
