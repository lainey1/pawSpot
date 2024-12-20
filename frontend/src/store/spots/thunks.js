// * Thunk Action Creators **********
// Handles asynchronous logic using redux-thunk middleware to dispatch actions and access the current state (getState). Simplifies workflow, centralizes control, and improves scalability by separating concerns.

import { csrfFetch } from "../csrf";
import {
  loadSpots,
  loadSpot,
  createSpot,
  updateSpot,
  deleteSpot,
} from "./actions";

export const fetchSpotsList = () => async (dispatch) => {
  const response = await fetch("/api/spots");
  if (response.ok) {
    const spots = await response.json();
    dispatch(loadSpots(spots));
  }
};

export const fetchSpot = (spotId) => async (dispatch) => {
  const response = await fetch(`/api/spots/${spotId}`);
  if (response.ok) {
    const spot = await response.json();
    dispatch(loadSpot(spot));
  }
};

export const createNewSpot = (spotData) => async (dispatch) => {
  try {
    const response = await csrfFetch("/api/spots", {
      method: "POST",
      body: JSON.stringify(spotData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const newSpot = await response.json();
      dispatch(createSpot(newSpot));
      return newSpot.id; // Return the ID of the newly created spot
    } else {
      const errorData = await response.json();
      return Promise.reject(errorData); // Handle errors appropriately
    }
  } catch (error) {
    console.error("Error creating spot:", error);
    return Promise.reject(error);
  }
};

export const editSpot = (spotId, spotData) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(spotData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const updatedSpot = await response.json();

    dispatch(updateSpot(updatedSpot));
  } catch (error) {
    console.error("Error in editSpot thunk:", error);
    throw error;
  }
};

export const deleteSpotThunk = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(deleteSpot(spotId));
  }
};
