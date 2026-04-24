FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# System dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv git wget curl \
    libgl1-mesa-glx libglib2.0-0 libsm6 libxrender1 libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Install ComfyUI
WORKDIR /app
RUN git clone https://github.com/comfyanonymous/ComfyUI.git /app/ComfyUI

WORKDIR /app/ComfyUI
RUN pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
RUN pip3 install --no-cache-dir -r requirements.txt

# Install custom nodes
WORKDIR /app/ComfyUI/custom_nodes
RUN git clone https://github.com/Fannovel16/comfyui_controlnet_aux.git && \
    cd comfyui_controlnet_aux && pip3 install --no-cache-dir -r requirements.txt
RUN git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git

# Download models
WORKDIR /app/ComfyUI/models

# Checkpoint: JuggernautXL v9 (best for photorealistic interiors)
RUN wget -q -O checkpoints/juggernautXL_v9.safetensors \
    "https://civitai.com/api/download/models/456194?type=Model&format=SafeTensor"

# ControlNet: Canny + Depth (for structure preservation)
RUN wget -q -O controlnet/control-lora-canny-rank256.safetensors \
    "https://huggingface.co/stabilityai/control-lora/resolve/main/control-LoRAs-rank256/control-lora-canny-rank256.safetensors"
RUN wget -q -O controlnet/control-lora-depth-rank256.safetensors \
    "https://huggingface.co/stabilityai/control-lora/resolve/main/control-LoRAs-rank256/control-lora-depth-rank256.safetensors"

# Upscaler: Real-ESRGAN x4
RUN wget -q -O upscale_models/RealESRGAN_x4plus.pth \
    "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"

# Interior Design LoRA (optional, enhances architectural renders)
# RUN wget -q -O loras/interior_design_v1.safetensors \
#     "YOUR_LORA_URL_HERE"

# Install RunPod handler
WORKDIR /app
RUN pip3 install --no-cache-dir runpod

COPY handler.py /app/handler.py

# Expose ComfyUI port
EXPOSE 8188

CMD ["python3", "/app/handler.py"]
