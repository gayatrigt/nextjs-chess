import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function WhiteRook(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/RookWhite.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(WhiteRook)
