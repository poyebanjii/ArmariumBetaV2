import React from "react";
import ReactStars from "react-rating-stars-component";

// Star rating component.
function StarRating({ rating, onRate }) {
  return (
    <ReactStars
      count={5}
      value={rating}
      onChange={onRate}
      size={30}
      isHalf={true}  
      emptyIcon={<i className="far fa-star"></i>}
      halfIcon={<i className="fa fa-star-half-alt"></i>}
      fullIcon={<i className="fa fa-star"></i>}
      activeColor="gold"
    />
  );
}

export default StarRating;
