import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function BlackPawn(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/PawnBlack.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(BlackPawn)
