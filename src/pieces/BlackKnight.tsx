import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function BlackKnight(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/KnightBlack.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(BlackKnight)
