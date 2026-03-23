import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root>;

function Slider({ className = '', ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={`ui-slider-root ${className}`.trim()}
      {...props}
    >
      <SliderPrimitive.Track className="ui-slider-track">
        <SliderPrimitive.Range className="ui-slider-range" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="ui-slider-thumb" />
    </SliderPrimitive.Root>
  );
}

export { Slider };
