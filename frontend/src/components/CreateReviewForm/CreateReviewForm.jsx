//frontend/src/components/CreateReviewForm/CreateReviewForm.jsx

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createNewReview } from "../../store/reviews";

const CreateReview = () => {
  const [formData, setFormData] = useState({
    review: "",
    stars: "",
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.review.length < 10) {
      newErrors.review = "Review text needs 10 or more characters";
    }
    if (
      !formData.stars ||
      !Number.isInteger(formData.stars) ||
      formData.stars < 1 ||
      formData.stars > 5
    ) {
      ("Stars must be an integer from 1 to 5");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newReviewData = {
      ...formData,
    };

    try {
      const newReview = await dispatch(createNewReview(newReviewData));
      console.log("============>NEW REVIEW CREATED:", newReview);
      navigate(`/spots/${spot.id}`);
    } catch (error) {
      setErrors({ submit: error.message || "An unknown error occurred." });
    }
  };
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>How was your stay?</h2>
      <h3>Leave your review here...</h3>
      <textarea
        className="textarea-field"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Leave your review here..."
      />
      {errors.review && <p className="error-message">{errors.review}</p>}

      <div className="stars-rating">
        <h3>Rate your experience:</h3>
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${formData.stars >= star ? "filled" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, stars: star }))}
            >
              ★
            </span>
          ))}
        </div>
        <label>{formData.stars} Stars</label>
        {errors.stars && <p className="error-message">{errors.stars}</p>}
        <p></p>
      </div>

      <button type="submit">Submit Your Review</button>
    </form>
  );
};

export default CreateReview;
