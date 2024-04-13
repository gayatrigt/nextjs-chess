import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function BlackKing(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/KingBlack.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(BlackKing)
