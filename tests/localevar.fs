  1 2 { x1 y1 }
  3 4 { x2 y2 }
  y1 y2 = drop
  // If this happens local variables are not correctly handled
  :[ x1 == 1 ]: `x1 should be 1, but is ${x1}` assert
  :[ x2 == 3 ]: `x2 should be 3, but is ${x2}` assert
