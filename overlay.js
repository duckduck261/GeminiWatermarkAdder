const input = document.getElementById("imageInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Image B (your fixed overlay image)
const overlayImage = new Image();
overlayImage.src = "gemini_logo.png"; // path to image B

// Overlay state
let overlayState = {
  x: 50,
  y: 50,
  width: 69,
  height: 69
};

let userImage = null;
let isDragging = false;
let dragMode = null; // 'move' or 'resize'
let startX, startY;
let isOverlaySelected = false;

const drawCanvas = () => {
  if (!userImage) return;
  
  // Match canvas size to image A
  canvas.width = userImage.width;
  canvas.height = userImage.height;

  // Draw image A
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(userImage, 0, 0);

  // Draw image B on top
  ctx.drawImage(overlayImage, overlayState.x, overlayState.y, overlayState.width, overlayState.height);
  
  // Only draw border and resize handle if overlay is selected
  if (isOverlaySelected) {
    // Draw border around overlay for visibility
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(overlayState.x, overlayState.y, overlayState.width, overlayState.height);
    
    // Draw resize handle in bottom-right corner
    const handleSize = 10;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(
      overlayState.x + overlayState.width - handleSize,
      overlayState.y + overlayState.height - handleSize,
      handleSize,
      handleSize
    );
  }
};

const isInsideOverlay = (x, y) => {
  return x >= overlayState.x && 
         x <= overlayState.x + overlayState.width &&
         y >= overlayState.y && 
         y <= overlayState.y + overlayState.height;
};

const isNearResizeHandle = (x, y) => {
  const handleSize = 15;
  return x >= overlayState.x + overlayState.width - handleSize &&
         x <= overlayState.x + overlayState.width &&
         y >= overlayState.y + overlayState.height - handleSize &&
         y <= overlayState.y + overlayState.height;
};

canvas.addEventListener("mousedown", (e) => {
  if (!userImage) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (isNearResizeHandle(x, y)) {
    isDragging = true;
    dragMode = "resize";
    startX = x;
    startY = y;
    isOverlaySelected = true;
  } else if (isInsideOverlay(x, y)) {
    isDragging = true;
    dragMode = "move";
    startX = x;
    startY = y;
    isOverlaySelected = true;
  } else {
    isOverlaySelected = false;
    drawCanvas();
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging || !userImage) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const deltaX = x - startX;
  const deltaY = y - startY;
  
  if (dragMode === "move") {
    overlayState.x = Math.max(0, Math.min(overlayState.x + deltaX, canvas.width - overlayState.width));
    overlayState.y = Math.max(0, Math.min(overlayState.y + deltaY, canvas.height - overlayState.height));
  } else if (dragMode === "resize") {
    overlayState.width = Math.max(20, overlayState.width + deltaX);
    overlayState.height = Math.max(20, overlayState.height + deltaY);
  }
  
  startX = x;
  startY = y;
  drawCanvas();
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  dragMode = null;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  dragMode = null;
});

input.addEventListener("change", () => {
  if (!input.files || input.files.length === 0) return;

  userImage = new Image();
  userImage.src = URL.createObjectURL(input.files[0]);

  userImage.onload = () => {
    // Reset overlay position
    overlayState = {
      x: 50,
      y: 50,
      width: 69,
      height: 69
    };
    
    // Wait for overlay image to load if not already loaded
    if (overlayImage.complete) {
      drawCanvas();
    } else {
      overlayImage.onload = () => {
        drawCanvas();
      };
    }
  };
});
