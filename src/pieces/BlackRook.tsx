import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function BlackRook(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/RookBlack.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(BlackRook)
