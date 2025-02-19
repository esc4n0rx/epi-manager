"use client";

import React, { forwardRef } from "react";
import SignatureCanvas from "react-signature-canvas";

type SignaturePadProps = {
  canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  [key: string]: any; 
};

const SignaturePad = forwardRef<SignatureCanvas, SignaturePadProps>((props, ref) => {
  const { canvasProps, ...rest } = props;
  return (
    <SignatureCanvas
      ref={ref}
      penColor="black"
      canvasProps={{
        ...canvasProps,
        style: { backgroundColor: "white", ...(canvasProps?.style || {}) },
      }}
      {...rest}
    />
  );
});

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;