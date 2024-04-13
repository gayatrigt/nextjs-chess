import React from 'react';
import piecePositionHoc from '../piecePositionHoc';

function WhitePawn(props) {
  return (
    <img
      width={props.size} height="100%"
      src={"/images/PawnWhite.png"} alt=""
      style={{
        objectFit: "cover"
      }}
      {...props}
    />
  )
}

export default piecePositionHoc(WhitePawn)
