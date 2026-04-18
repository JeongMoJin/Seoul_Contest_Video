import { Composition } from 'remotion';
import { SeoulIVideo, FPS, TOTAL_FRAMES, WIDTH, HEIGHT } from './SeoulIVideo';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SeoulIVideo"
      component={SeoulIVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
