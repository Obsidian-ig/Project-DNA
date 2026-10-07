Interpolation Types:

### Linear Interpolation:

* *L0(t) = (1 - t) \* P0 + t \* P1*



### Quadratic Bezier Curve:

* *Q0(t) = (1 - t) \* L0 \* t + t \* L1 \* t*

  * **Rewritten Version:**

    * *Q0(t) = (1 - t)^2 \* P0 + 2 \* (1 - t) \* t \* P1 + t^2 \* P2*



### Cubic Bezier Curve:

* *C0(t) = (1 - t) \* Q0 \* t + t \* Q1 \* t*

  * **Rewritten Version:**

    * *C0(t) = (1 - t)^3 \* P0 + 3 \* (1 - t)^2 \* t \* P1 + 3 \* (1 - t) \* t^2 \* P2 + t^3 \* P3*

