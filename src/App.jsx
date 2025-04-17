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

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const addToUndoStack = () => {
    const currentState = { images, texts, videos };
    setUndoStack((prevStack) => [...prevStack, currentState]);
    // Clear redo stack if new action occurs (resetting redo history)
    setRedoStack([]);
  };

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
    addToUndoStack();
  }

  function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const newVideo = {
        id: `video-${Date.now()}`,
        file,
      };
      setVideos((prev) => [...prev, newVideo]);
      addToUndoStack();
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
    addToUndoStack();
  };

  const updateText = (updated) => {
    setTexts((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    addToUndoStack();
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
    const moveAmount = 20;
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
    addToUndoStack();
  };

  const moveForward = () => {
    if (!selectedId) return;

    const updatedImages = [...images];
    const updatedTexts = [...texts];
    const updatedVideos = [...videos];

    let element;

    const imageIndex = images.findIndex((image) => image.id === selectedId);
    if (imageIndex !== -1) {
      element = images[imageIndex];
      updatedImages.splice(imageIndex, 1);
      updatedImages.push(element);
    }

    const textIndex = texts.findIndex((text) => text.id === selectedId);
    if (textIndex !== -1) {
      element = texts[textIndex];
      updatedTexts.splice(textIndex, 1);
      updatedTexts.push(element);
    }

    const videoIndex = videos.findIndex((video) => video.id === selectedId);
    if (videoIndex !== -1) {
      element = videos[videoIndex];
      updatedVideos.splice(videoIndex, 1);
      updatedVideos.push(element);
    }

    setImages(updatedImages);
    setTexts(updatedTexts);
    setVideos(updatedVideos);

    const konvaLayer = stageRef.current?.findOne('Layer');
    if (konvaLayer) {
      konvaLayer.getChildren().forEach((node) => {
        if (node.id() === selectedId) {
          node.moveToTop();
        }
      });
    }
    addToUndoStack();
  };

  const moveBackward = () => {
    if (!selectedId) return;

    const updatedImages = [...images];
    const updatedTexts = [...texts];
    const updatedVideos = [...videos];

    let element;

    const imageIndex = images.findIndex((image) => image.id === selectedId);
    if (imageIndex !== -1) {
      element = images[imageIndex];
      updatedImages.splice(imageIndex, 1);
      updatedImages.unshift(element);
    }

    const textIndex = texts.findIndex((text) => text.id === selectedId);
    if (textIndex !== -1) {
      element = texts[textIndex];
      updatedTexts.splice(textIndex, 1);
      updatedTexts.unshift(element);
    }

    const videoIndex = videos.findIndex((video) => video.id === selectedId);
    if (videoIndex !== -1) {
      element = videos[videoIndex];
      updatedVideos.splice(videoIndex, 1);
      updatedVideos.unshift(element);
    }

    setImages(updatedImages);
    setTexts(updatedTexts);
    setVideos(updatedVideos);

    const konvaLayer = stageRef.current?.findOne('Layer');
    if (konvaLayer) {
      konvaLayer.getChildren().forEach((node) => {
        if (node.id() === selectedId) {
          node.moveToBottom();
        }
      });
    }
    addToUndoStack();
  };

  // Undo functionality
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack.pop();
      setRedoStack((prev) => [lastState, ...prev]);
      setImages(lastState.images);
      setTexts(lastState.texts);
      setVideos(lastState.videos);
      setUndoStack(undoStack);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const lastState = redoStack.shift();
      setUndoStack((prev) => [...prev, lastState]);
      setImages(lastState.images);
      setTexts(lastState.texts);
      setVideos(lastState.videos);
      setRedoStack(redoStack);
    }
  };

  return (
    <>
      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <button onClick={handleUndo} className="button">
          ⏪ Undo
        </button>
        <button onClick={handleRedo} className="button">
          ⏩ Redo
        </button>
      </div>

      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <button onClick={() => handleVideoPlay(selectedVideoId)} className="button">
          ▶️ Play
        </button>
        <button onClick={handleVideoPause} className="button">
          ⏸️ Pause
        </button>
        <button onClick={handleStop} className="button">
          🛑 Stop
        </button>
      </div>

      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <input
          type="text"
          placeholder="Enter text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="input-text"
        />
        <button onClick={handleTextAdd} className="button">
          Add Text
        </button>
      </div>

      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        <label htmlFor="images">Add image</label>
        <input
          id="images"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
        />
        <label htmlFor="video" className="label">
          Add video to play
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          id="video"
          className="file-input"
        />
      </div>

      {selectedId && selectedId.startsWith('text') && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button onClick={() => moveTextTo('up')} className="button">
            ⬆️
          </button>
          <div>
            <button onClick={() => moveTextTo('left')} className="button">
              ⬅️
            </button>
            <button onClick={() => moveTextTo('right')} className="button">
              ➡️
            </button>
          </div>
          <button onClick={() => moveTextTo('down')} className="button">
            ⬇️
          </button>
        </div>
      )}

      {selectedId && (
        <div style={{ margin: '10px 0', textAlign: 'center' }}>
          <button onClick={moveForward} className="button">
            🔼 Move Forward
          </button>
          <button onClick={moveBackward} className="button">
            🔽 Move Backward
          </button>
        </div>
      )}

      <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight}>
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
                addToUndoStack();
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
                addToUndoStack();
              }}
              setVideoRef={(video) => {
                videoRefs.current[vid.id] = video;
              }}
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
};

export default App;
