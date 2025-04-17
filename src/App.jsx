import React, { useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import ImageComponent from "./ImageComponent";
import TextComponent from "./TextComponent";
import VideoComponent from "./VideoComponent";

const App = () => {
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [newText, setNewText] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const stageRef = useRef(null);
  const videoRefs = useRef({});

  function handleImageUpload(e) {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file); 
    const newImage = {
      id: `${file.name}-${Math.random()}`,
      src: url,
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      rotation: 0,
    };
    setImages((prev) => [...prev, newImage]);
  }

  function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const newVideo = {
        id: `video-${Date.now()}`,
        file,
      };
      setVideos((prev) => [...prev, newVideo]);
    }
  }

  const handleTextAdd = () => {
    if (!newText.trim()) return;

    const textLayer = {
      id: `text-${Math.random()}`,
      text: newText,
      x: 100,
      y: 100,
      fontSize: 24,
      width: 200,
      draggable: true,
      rotation: 0,
      type: 'text',
    };

    setTexts((prev) => [...prev, textLayer]);
    setNewText('');
    setSelectedId(textLayer.id);
  };

  const updateText = (updated) => {
    setTexts((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleVideoPlay = (videoId) => {
    const video = videoRefs.current[videoId];
    if (video) {
      if (selectedVideoId && selectedVideoId !== videoId) {
        const previousVideo = videoRefs.current[selectedVideoId];
        if (previousVideo) previousVideo.pause();
      }
      video.play();
      setSelectedVideoId(videoId);
    }
  };

  const handleVideoPause = () => {
    const video = videoRefs.current[selectedVideoId];
    if (video) {
      video.pause();
    }
  };

  const handleStop = () => {
    const video = videoRefs.current[selectedVideoId];
    if (video) {
      video.pause();
      video.currentTime = 0;
      setSelectedVideoId(null);
    }
  };

  const moveTextTo = (position) => {
    const moveAmount=20;
    const updatedTexts = texts.map((text) => {
      if (text.id !== selectedId) return text;

      let x = text.x;
      let y = text.y;
    
      switch (position) {
        case 'up':
          y -= moveAmount;
          break;
        case 'down':
          y += moveAmount;
          break;
        case 'left':
          x -= moveAmount;
          break;
        case 'right':
          x += moveAmount;
          break;
        default:
          break;
      }
    
      return { ...text, x, y };
    });
  
    setTexts(updatedTexts);
  };
  
  const moveForward = () => {
    if (!selectedId) return;
  
    const updatedImages = [...images];
    const updatedTexts = [...texts];
    const updatedVideos = [...videos];
  
    let element;
  
    // Check if selected element is an image
    const imageIndex = images.findIndex((image) => image.id === selectedId);
    if (imageIndex !== -1) {
      element = images[imageIndex];
      updatedImages.splice(imageIndex, 1);
      updatedImages.push(element);
    }
  
    // Check if selected element is text
    const textIndex = texts.findIndex((text) => text.id === selectedId);
    if (textIndex !== -1) {
      element = texts[textIndex];
      updatedTexts.splice(textIndex, 1);
      updatedTexts.push(element);
    }
  
    // Check if selected element is a video
    const videoIndex = videos.findIndex((video) => video.id === selectedId);
    if (videoIndex !== -1) {
      element = videos[videoIndex];
      updatedVideos.splice(videoIndex, 1);
      updatedVideos.push(element);
    }
  
    setImages(updatedImages);
    setTexts(updatedTexts);
    setVideos(updatedVideos);
  
    // Now move the element forward in the Konva layer stack
    const konvaLayer = stageRef.current?.findOne('Layer');
    if (konvaLayer) {
      konvaLayer.getChildren().forEach((node) => {
        if (node.id() === selectedId) {
          node.moveToTop();
        }
      });
    }
  };
  
  const moveBackward = () => {
    if (!selectedId) return;
  
    const updatedImages = [...images];
    const updatedTexts = [...texts];
    const updatedVideos = [...videos];
  
    let element;
  
    // Check if selected element is an image
    const imageIndex = images.findIndex((image) => image.id === selectedId);
    if (imageIndex !== -1) {
      element = images[imageIndex];
      updatedImages.splice(imageIndex, 1);
      updatedImages.unshift(element);
    }
  
    // Check if selected element is text
    const textIndex = texts.findIndex((text) => text.id === selectedId);
    if (textIndex !== -1) {
      element = texts[textIndex];
      updatedTexts.splice(textIndex, 1);
      updatedTexts.unshift(element);
    }
  
    // Check if selected element is a video
    const videoIndex = videos.findIndex((video) => video.id === selectedId);
    if (videoIndex !== -1) {
      element = videos[videoIndex];
      updatedVideos.splice(videoIndex, 1);
      updatedVideos.unshift(element);
    }
  
    setImages(updatedImages);
    setTexts(updatedTexts);
    setVideos(updatedVideos);
  
    // Now move the element backward in the Konva layer stack
    const konvaLayer = stageRef.current?.findOne('Layer');
    if (konvaLayer) {
      konvaLayer.getChildren().forEach((node) => {
        if (node.id() === selectedId) {
          node.moveToBottom();
        }
      });
    }
  };
  
  return (
    <>
      {/* Play/Pause/Stop controls */}
      {selectedVideoId && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => handleVideoPlay(selectedVideoId)}>▶️ Play</button>
          <button onClick={handleVideoPause}>⏸️ Pause</button>
          <button onClick={handleStop}>🛑 Stop</button>
        </div>
      )}

      {/* Text input */}
      <input
        type="text"
        placeholder="Enter text"
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
      />
      <button onClick={handleTextAdd}>Add Text</button>

      
      <input id="images" type="file" accept="image/*" onChange={handleImageUpload} />
      <label htmlFor="video">Add video to play</label>
      <input type="file" accept="video/*" onChange={handleVideoUpload} id="video" />


      {selectedId && selectedId.startsWith("text") && (
  <div style={{ marginTop: '10px' }}>
    <button onClick={() => moveTextTo('up')}>⬆️</button>
    <div>
      <button onClick={() => moveTextTo('left')}>⬅️</button>
      <button onClick={() => moveTextTo('right')}>➡️</button>
    </div>
    <button onClick={() => moveTextTo('down')}>⬇️</button>
  </div>
)}

     
      <Stage ref={stageRef}

        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={() => setSelectedId(null)}
      >
        <Layer>
          {images.map((img) => (
            <ImageComponent
              key={img.id}
              image={img}
              isSelected={img.id === selectedId}
              onSelect={() => setSelectedId(img.id)}
              onChange={(newAttrs) => {
                const updatedImages = images.map((image) =>
                  image.id === img.id ? { ...image, ...newAttrs } : image
                );
                setImages(updatedImages);
              }}
            />
          ))}

          {texts.map((text) => (
            <TextComponent
              key={text.id}
              textProps={text}
              isSelected={selectedId === text.id}
              onSelect={() => setSelectedId(text.id)}
              onChange={updateText}
              
            />
          ))}

          {videos.map((vid) => (
            <VideoComponent
              key={vid.id}
              videoFile={vid.file}
              isSelected={selectedId === vid.id}
              onSelect={() => {
                setSelectedId(vid.id);
                setSelectedVideoId(vid.id);
              }}
              onChange={(newAttrs) => {
                setVideos((prev) =>
                  prev.map((video) =>
                    video.id === vid.id ? { ...video, ...newAttrs } : video
                  )
                );
              }}
              setVideoRef={(video) => {
                videoRefs.current[vid.id] = video;
              }}
            />
          ))}


        </Layer>


      </Stage>

      {selectedId && (
        <div style={{ margin: '10px 0' }}>
          <button onClick={moveForward}>🔼 Move Forward</button>
          <button onClick={moveBackward}>🔽 Move Backward</button>
        </div>
      )}

   
    </>
  );
};

export default App;
