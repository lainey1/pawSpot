import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createNewReview } from "../../store/reviews";
import { useModal } from "../../context/Modal";
import "./CreateReviewForm.css";

function ReviewFormModal() {
  const [formData, setFormData] = useState({
    review: "",
    stars: "",
  });

  const [errors, setErrors] = useState({});
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [serverError, setServerError] = useState("");
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.review.length < 10) {
      newErrors.review = "Review text needs 10 or more characters";
    }
    if (
      !formData.stars ||
      !Number.isInteger(Number(formData.stars)) ||
      formData.stars < 1 ||
      formData.stars > 5
    ) {
      newErrors.stars = "Stars must be an integer from 1 to 5";
    }
    return newErrors; // Return the errors object
  };

  const checkButtonState = () => {
    if (formData.review.length >= 10 && formData.stars) {
      setIsButtonEnabled(true);
      setErrors({});
    } else {
      setIsButtonEnabled(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    } else {
      const newReviewData = { ...formData };
      setErrors({});
      setServerError("");

      return dispatch(createNewReview(newReviewData))
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data?.errors) {
            setErrors(data.errors);
          } else {
            setServerError("An unexpected error occurred. Please try again.");
          }
        });
    }
  };

  useEffect(() => {
    checkButtonState();
  });

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>How was your stay?</h2>
      {serverError && <p className="error-message">{serverError}</p>}{" "}
      {/* Display server error if it exists */}
      <h3>Leave your review here...</h3>
      <textarea
        className="textarea-field"
        name="review"
        value={formData.review}
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
          <label className="stars-label">Stars</label>
          {errors.stars && <p className="error-message">{errors.stars}</p>}
        </div>
      </div>
      <button type="submit" disabled={!isButtonEnabled}>
        Submit Your Review
      </button>
    </form>
  );
}

export default ReviewFormModal;
