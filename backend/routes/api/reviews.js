// backend/routes/api/reviews.js
const express = require("express");
const {
  Review,
  ReviewImage,
  Spot,
  SpotImage,
  User,
} = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

//* Edit a Review

router.put("/:reviewId", requireAuth, async (req, res) => {
  //validateReview,

  try {
    const userId = req.user.id; // GET authenticated userId
    const { reviewId } = req.params; // GET from URL
    const { review: reviewText, stars } = req.body;

    const currentReview = await Review.findByPk(reviewId); // Find review by ID;

    // Check if the review exists
    if (!currentReview) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }
    // Check if the user is the owner of the review
    if (currentReview.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden. You are not authorized to edit this review.",
      });
    }
    //   Validate the input
    const errors = {};
    if (
      !reviewText ||
      typeof reviewText !== "string" ||
      reviewText.trim() === ""
    ) {
      errors.review = "Review text is required";
    }
    if (!stars || !Number.isInteger(stars) || stars < 1 || stars > 5) {
      errors.stars = "Stars must be an integer from 1 to 5";
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }
    // Update the review details
    currentReview.review = reviewText;
    currentReview.stars = stars;

    await currentReview.save(); //save the updated review

    return res.status(200).json(currentReview);
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
});

//* Add an image to a review by reviewId

router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id; // The authenticated user's id
  const { url } = req.body;

  // Find the review by id
  const review = await Review.findByPk(reviewId, {
    include: {
      model: ReviewImage,
      as: "ReviewImages",
      attributes: ["id", "url"],
    }, // Assuming a Review has many ReviewImages
  });

  // Error handling: If review is not found, return a 404 error
  if (!review) {
    return res.status(404).json({
      message: "Review couldn't be found",
    });
  }

  // Authorization check: Ensure the review belongs to the current user
  if (review.userId !== userId) {
    return res.status(403).json({
      message: "You are not authorized to add images to this review",
    });
  }

  // Check if the review already has 10 images
  if (review.ReviewImages.length >= 10) {
    return res.status(403).json({
      message: "Maximum number of images for this resource was reached",
    });
  }
  // Create a new image for the review
  const newImage = await ReviewImage.create({
    reviewId,
    url,
  });

  // Return success response with the created image
  return res.status(201).json({
    id: newImage.id,
    url: newImage.url,
  });
});

//* Delete a review

router.delete("/:reviewId", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id; // The authenticated user's id

  // Find the review by id
  const review = await Review.findByPk(reviewId);

  // Error handling: If review is not found, return a 404 error
  if (!review) {
    return res.status(404).json({
      message: "Review couldn't be found",
    });
  }

  // Authorization check: Ensure the review belongs to the current user
  if (review.userId !== userId) {
    return res.status(403).json({
      message: "You are not authorized to delete this review",
    });
  }

  // Delete the review
  await review.destroy();

  // Return success response
  return res.status(200).json({
    message: "Successfully deleted",
  });
});

//* GET all reviews by the Current User
router.get("/current", requireAuth, async (req, res) => {
  const userId = req.user.id;

  const reviews = await Review.findAll({
    where: {
      userId: userId,
    },

    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
        as: "Spot",
        attributes: [
          "id",
          "ownerId",
          "address",
          "city",
          "state",
          "country",
          "lat",
          "lng",
          "name",
          "price",
          // "previewImage",
        ],
        include: [
          {
            model: SpotImage,
            as: "SpotImages",
            where: { preview: true }, // Only return preview images
            attributes: ["url"],
            required: false,
          },
        ],
      },
      {
        model: ReviewImage,
        as: "ReviewImages",
        attributes: ["id", "url"],
      },
    ],
  });

  //! FIX: format the output to include preview image in the Spot object
  const formattedReviews = reviews.map((review) => {
    const spotImages = review.Spot.SpotImages;
    const previewImage = spotImages.length > 0 ? spotImages[0].url : null;

    return {
      ...review.toJSON(),
      Spot: {
        id: review.Spot.id,
        ownerId: review.Spot.ownerId,
        address: review.Spot.address,
        city: review.Spot.city,
        state: review.Spot.state,
        country: review.Spot.country,
        lat: review.Spot.lat,
        lng: review.Spot.lng,
        name: review.Spot.name,
        price: review.Spot.price,
        previewImage, // Include the preview image in the response
      },
    };
  });

  return res.json({ Reviews: formattedReviews });
});

// ***** EXPORTS *****/
module.exports = router;
