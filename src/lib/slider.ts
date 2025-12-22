/**
 * Logarithmic scale conversion for smoother control of small values
 */
export const valueToSlider = (value: number, min: number, max: number): number => {
  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  return ((Math.log(value) - minLog) / (maxLog - minLog)) * 100
}

export const sliderToValue = (slider: number, min: number, max: number): number => {
  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  const value = Math.exp(minLog + (slider / 100) * (maxLog - minLog))
  return Math.round(value)
}
