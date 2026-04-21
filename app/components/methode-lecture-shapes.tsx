'use client';

import { motion } from 'framer-motion';

export type MethodeShape = 'circle' | 'triangle' | 'squircle' | 'pill';

export type MethodeLectureBlock = {
  title: string;
  body: string;
  shape: MethodeShape;
  color: string;
};

export function MethodeShapeFace({
  block,
  reduceMotion,
  wiggling,
  size = 'default',
}: {
  block: MethodeLectureBlock;
  reduceMotion: boolean | null;
  wiggling: boolean;
  /** `large` : formes plus grandes (ex. page Vision). */
  size?: 'default' | 'large';
}) {
  const springHover = { type: 'spring' as const, stiffness: 520, damping: 16 };
  const wiggleTransition = { type: 'tween' as const, duration: 0.55, ease: 'easeInOut' as const };
  const shapeTransition = wiggling && !reduceMotion ? wiggleTransition : springHover;
  const wiggleRotate = wiggling && !reduceMotion ? [0, -5, 5, -4, 4, 0] : 0;
  const lg = size === 'large';

  switch (block.shape) {
    case 'circle':
      return (
        <motion.div
          className={
            lg
              ? 'flex h-[11.75rem] w-[11.75rem] shrink-0 items-center justify-center rounded-full sm:h-[13.25rem] sm:w-[13.25rem] lg:h-[14.5rem] lg:w-[14.5rem]'
              : 'flex h-[8.75rem] w-[8.75rem] shrink-0 items-center justify-center rounded-full sm:h-[9.75rem] sm:w-[9.75rem] lg:h-[10.5rem] lg:w-[10.5rem]'
          }
          style={{ backgroundColor: block.color }}
          animate={{ rotate: wiggleRotate, scale: wiggling && !reduceMotion ? [1, 1.06, 1.02, 1] : 1 }}
          transition={shapeTransition}
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          aria-hidden
        />
      );
    case 'triangle':
      return (
        <motion.div
          className={
            lg
              ? 'relative h-[11.75rem] w-[12.75rem] shrink-0 sm:h-[13.25rem] sm:w-[13.75rem] lg:h-[14.5rem] lg:w-[15.25rem]'
              : 'relative h-[8.75rem] w-[9.5rem] shrink-0 sm:h-[9.5rem] sm:w-[10.25rem] lg:h-[10.25rem] lg:w-[11rem]'
          }
          animate={{ rotate: wiggleRotate, scale: wiggling && !reduceMotion ? [1, 1.05, 1] : 1 }}
          transition={shapeTransition}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: block.color,
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            }}
          />
        </motion.div>
      );
    case 'squircle':
      return (
        <motion.div
          className={
            lg
              ? 'flex h-[11.75rem] w-[11.75rem] shrink-0 items-center justify-center rounded-[30%] sm:h-[13.25rem] sm:w-[13.25rem] lg:h-[14.5rem] lg:w-[14.5rem]'
              : 'flex h-[8.75rem] w-[8.75rem] shrink-0 items-center justify-center rounded-[30%] sm:h-[9.75rem] sm:w-[9.75rem] lg:h-[10.5rem] lg:w-[10.5rem]'
          }
          style={{ backgroundColor: block.color }}
          animate={{ rotate: wiggleRotate, scale: wiggling && !reduceMotion ? [1, 1.07, 0.98, 1] : 1 }}
          transition={shapeTransition}
          whileHover={reduceMotion ? undefined : { rotate: -3, scale: 1.03 }}
          aria-hidden
        />
      );
    case 'pill':
      return (
        <motion.div
          className={
            lg
              ? 'flex h-[9.25rem] min-w-[17rem] max-w-[20.5rem] shrink-0 items-center justify-center rounded-full sm:h-[9.85rem] sm:min-w-[18.25rem] sm:max-w-[22rem] lg:h-[10.5rem] lg:min-w-[19.5rem] lg:max-w-[23rem]'
              : 'flex h-[6.85rem] min-w-[12.5rem] max-w-[15rem] shrink-0 items-center justify-center rounded-full sm:h-[7.35rem] sm:min-w-[13.5rem] sm:max-w-[16rem] lg:h-[7.85rem] lg:min-w-[14.5rem] lg:max-w-[17rem]'
          }
          style={{ backgroundColor: block.color }}
          animate={{ rotate: wiggleRotate, scale: wiggling && !reduceMotion ? [1, 1.08, 1.02, 1] : 1 }}
          transition={shapeTransition}
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          aria-hidden
        />
      );
    default:
      return null;
  }
}
