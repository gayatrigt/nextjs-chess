import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function WhiteKing(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/KingWhite.png"} alt=""
      style={{
        objectFit: "cover"
      }}
    />
  )
}

export default piecePositionHoc(WhiteKing)
