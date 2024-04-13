import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function WhiteBishop(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/BishopWhite.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(WhiteBishop)
