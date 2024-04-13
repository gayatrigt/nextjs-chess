import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function BlackBishop(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/BishopBlack.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(BlackBishop)
