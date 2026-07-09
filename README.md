# Single-Layer Coil Inductance Calculator

A browser-based calculator for practical single-layer air-core coil design.

## Live Demo

[Open the calculator on GitHub Pages](https://ercanturhan.github.io/bobin-enduktans-hesaplayicisi/)

## Features

- Calculate inductance from coil diameter, winding length, wire diameter, and turn count
- Find the required number of turns for a target inductance
- Search for a compact coil geometry that meets a target inductance
- RF resonance mode for calculating required inductance from capacitance and frequency
- Helper outputs for wire length, outside diameter, length/diameter ratio, DC resistance, and RF tap ratios
- Turkish and English interface options
- Runs fully in the browser; no server or installation required

## Usage

Open the GitHub Pages site and enter your coil parameters.

To run locally, open `index.html` in any modern browser.

## Calculation Notes

The calculator uses Wheeler's approximation for single-layer air-core coils. Results are intended for practical design estimates. At higher frequencies, parasitic capacitance, wire type, winding spacing, nearby metal, and physical layout can affect the final result.

## Test

Run the calculation checks with:

```bash
node test-calculations.js
```

## Files

- `index.html`: Static HTML/CSS/JavaScript application
- `test-calculations.js`: Basic calculation verification tests
- `Bobin_Enduktans_Hesaplayicisi.bat`: Helper file for quickly opening the page on Windows

## License

No license file has been added yet.
