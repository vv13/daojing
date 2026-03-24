import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

type SliderTick = {
  value: number;
  label?: string;
};

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  ticks?: SliderTick[];
};

const getTickOffset = (value: number, min: number, max: number) => {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
};

function Slider({ className = '', ticks, min = 0, max = 100, ...props }: SliderProps) {
  const numericMin = Number(min);
  const numericMax = Number(max);
  return (
    <div className="w-full">
      <SliderPrimitive.Root
        className={`relative flex w-full items-center touch-none select-none h-5 ${className}`.trim()}
        min={numericMin}
        max={numericMax}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-(--accent-light)">
          <SliderPrimitive.Range className="absolute h-full bg-(--primary)" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-[18px] w-[18px] rounded-full border-2 border-(--primary) bg-(--card-bg) shadow-[0_1px_6px_var(--shadow)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_30%,transparent)]" />
      </SliderPrimitive.Root>
      {ticks && ticks.length > 0 ? (
        <div className="relative w-full h-5 mt-2 text-[0.84rem] text-[color:var(--text-light)]" aria-hidden="true">
          {ticks.map((tick) => (
            <span
              key={tick.value}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${getTickOffset(tick.value, numericMin, numericMax)}%` }}
            >
              {tick.label ?? tick.value}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { Slider };
