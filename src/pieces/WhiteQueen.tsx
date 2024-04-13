import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function WhiteQueen(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/QueenWhite.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(WhiteQueen)
