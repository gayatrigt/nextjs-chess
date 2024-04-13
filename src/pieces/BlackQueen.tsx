import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function BlackQueen(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/QueenBlack.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(BlackQueen)
