//frontend/src/components/ReviewsSection/ReviewsSection.jsx

import { useState } from "react";
import CreateReview from "../CreateReviewForm/CreateReviewForm";

import "./ReviewsSection.css";

const ReviewsSection = ({
  //* set props
  currentReviews,
  formatDate,
  currentPage,
  totalPages,
  setCurrentPage,
  hasReviewed,
  isLoggedIn,
  isOwner,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="reviews-section">
      {isLoggedIn && !hasReviewed && !isOwner && (
        <button className="post-review-button" onClick={openModal}>
          Post Your Review
        </button>
      )}
      <ul className="reviews-list">
        {currentReviews.map((review) => (
          <li key={review.id} className="review-item">
            <p>
              <strong>{review.User.firstName}</strong>
            </p>
            <p className="review-date">{formatDate(review.updatedAt)}</p>
            <p>{review.review}</p>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Render CreateReview Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CreateReview closeModal={closeModal} />{" "}
            {/* Pass closeModal to the modal */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
