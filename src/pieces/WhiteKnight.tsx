import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function WhiteKnight(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/KnightWhite.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(WhiteKnight)
