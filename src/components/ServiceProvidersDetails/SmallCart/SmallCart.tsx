/* eslint-disable @typescript-eslint/no-unused-vars */

import React from "react";

interface ChildComponentProps {
    data: any; // The prop "data" will be a string
}

const SmallCart : React.FC<ChildComponentProps> = ({ data }) => {

    return (
        <>
  {data.map((provider, ind) => (
    <div key={ind}>
      <h3>Service {ind + 1}</h3>
      {Object.entries(provider.entry).map(([key, value]) => (
        <div key={key}>
          {key}: { value  as React.ReactNode}
        </div>
      ))}
    </div>
  ))}
</>
    )

}

export default SmallCart;