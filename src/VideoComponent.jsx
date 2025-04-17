import { Image, Transformer } from 'react-konva';
import { useEffect, useRef, useState } from 'react';

const VideoComponent = ({ videoFile, isSelected, onSelect, onChange ,setVideoRef}) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [videoElement, setVideoElement] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 200, height: 150 });

  useEffect(() => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;

    video.addEventListener('loadedmetadata', () => {
      setVideoSize({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    });

    setVideoElement(video);
    setVideoRef?.(video);

    return () => {
      video.pause();
      URL.revokeObjectURL(video.src);
    };
  }, [videoFile]);

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    if (videoElement) {
      const anim = new window.Konva.Animation(() => {}, shapeRef.current.getLayer());
      anim.start();
      return () => anim.stop();
    }
  }, [videoElement]);

  return (
    <>
      
     
      {videoElement && (
        <Image
          ref={shapeRef}
          image={videoElement}
          x={50}
          y={50}
          width={400}
          height={400}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onTransformEnd={(e) => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            });
          }}
          onDragEnd={(e) => {
            onChange({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
        />
      )}
      {isSelected && <Transformer ref={trRef} />}
  
    </>
  );
};

export default VideoComponent;
