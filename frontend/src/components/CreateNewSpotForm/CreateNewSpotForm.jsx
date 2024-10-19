// frontend/src/components/CreateNewSpotForm/CreateNewSpotForm.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateNewSpotForm.css";
import { useDispatch } from "react-redux";
import { createNewSpot } from "../../store/spots";

const CreateSpot = () => {
  const [formData, setFormData] = useState({
    country: "",
    address: "",
    city: "",
    state: "",
    lat: "",
    lng: "",
    name: "",
    description: "",
    price: "",
    previewImageUrl: "",
    imageUrls: ["", "", "", ""],
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

  const handleImageChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData((prev) => ({
      ...prev,
      imageUrls: newImageUrls,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.previewImageUrl)
      newErrors.previewImageUrl = "Preview Image URL is required";
    if (formData.description.length < 30)
      newErrors.description = "Description needs 30 or more characters";
    if (!formData.name) newErrors.name = "Name of your spot is required";
    if (!formData.price) newErrors.price = "Price per night is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const newSpot = await dispatch(createNewSpot(formData)); // Dispatch the thunk with form data
      navigate(`/spots/${newSpot.id}`); // Navigate to the new spot's detail page
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Create a New Spot</h2>

      {/* Location Section */}
      <h3>Where&apos;s your place located?</h3>
      <p>
        Guests will only get your exact address once they booked a reservation.
      </p>
      {["Country", "Street Address", "City", "State"].map((field) => (
        <div key={field} className="location-container">
          <label className="input-label">{field}:</label>
          <input
            className="input-field"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={field}
            required
          />
          {errors[field] && <p className="error-message">{errors[field]}</p>}
        </div>
      ))}
      <input
        type="number"
        name="lat"
        value={formData.lat}
        onChange={handleChange}
        placeholder="Latitude"
        required
      />
      <input
        type="number"
        name="lng"
        value={formData.lng}
        onChange={handleChange}
        placeholder="Longitude"
        required
      />

      {/* Description Section */}
      <h3>Describe your place to guests</h3>
      <p>
        Mention the best features of your space, any special amenities like fast
        wifi or parking, and what you love about the neighborhood.
      </p>
      <textarea
        className="textarea-field"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Please write at least 30 characters"
      />
      {errors.description && (
        <p className="error-message">{errors.description}</p>
      )}

      {/* Title Section */}
      <h3>Create a title for your spot</h3>
      <p>
        Catch guests&apos; attention with a spot title that highlights what
        makes your place special.
      </p>
      <input
        className="input-field"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name of your spot"
      />
      {errors.name && <p className="error-message">{errors.name}</p>}

      {/* Price Section */}
      <h3>Set a base price for your spot</h3>
      <p>
        Competitive pricing can help your listing stand out and rank higher in
        search results.
      </p>
      <input
        className="input-field"
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price per night (USD)"
      />
      {errors.price && <p className="error-message">{errors.price}</p>}

      {/* Image Section */}
      <h3>Liven up your spot with photos</h3>
      <p>Submit a link to at least one photo to publish your spot.</p>

      <div className="image-url-container">
        <input
          className="input-field"
          name="previewImageUrl"
          value={formData.previewImageUrl}
          onChange={handleChange}
          placeholder="Preview Image URL"
        />
        {errors.previewImageUrl && (
          <p className="error-message">{errors.previewImageUrl}</p>
        )}
        {formData.imageUrls.map((url, index) => (
          <input
            key={index}
            className="input-field"
            value={url}
            onChange={(e) => handleImageChange(index, e.target.value)}
            placeholder="Image URL"
          />
        ))}
      </div>

      <button type="submit">Create Spot</button>
    </form>
  );
};

export default CreateSpot;
