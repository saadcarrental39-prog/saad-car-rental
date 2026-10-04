/**
 * MINHAJ WELDING - Fiber Sheet Calculation Engine
 * Unit: Square Foot (sheet area) + separate frame pipe running-ft line
 * + internal khana/block line (2x2 ft default, configurable).
 *
 * inputs = {
 *   width_ft, width_in, height_ft, height_in,
 *   ply (2|3|4), gauge (16|18|20), color,
 *   block_size_ft (default 2), // internal khana grid size
 * }
 */
const { toDecimalFeet, sumBreakdown } = require('./helpers');

function fiberSheet(inputs) {
  const width = toDecimalFeet(inputs.width_ft, inputs.width_in);
  const height = toDecimalFeet(inputs.height_ft, inputs.height_in);
  const blockSize = Number(inputs.block_size_ft) || 2;

  const area = width * height;
  // frame pipe running length = perimeter (both verticals + both horizontals)
  const framePerimeter = 2 * (width + height);
  // internal blocks (khana) - number of internal dividing lines, both directions
  const blocksAcross = blockSize > 0 ? Math.max(0, Math.floor(width / blockSize) - 1) : 0;
  const blocksDown = blockSize > 0 ? Math.max(0, Math.floor(height / blockSize) - 1) : 0;
  const internalFrameLength = blocksAcross * height + blocksDown * width;

  const breakdown = {
    'Sheet Area (sq ft)': area,
    'Frame Pipe Perimeter (running ft)': framePerimeter,
    'Internal Block Frame (running ft)': internalFrameLength,
  };

  return {
    breakdown,
    total: area, // primary billable unit = sheet area; frame priced as separate line
    frame_perimeter_ft: framePerimeter,
    internal_frame_ft: internalFrameLength,
  };
}

module.exports = { fiberSheet };
