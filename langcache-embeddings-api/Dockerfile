FROM ubuntu:latest

ENV PYTHONUNBUFFERED=1

WORKDIR /app/

RUN apt-get update --yes \
 && apt-get upgrade --yes 

RUN apt-get install --yes --no-install-recommends \
  python3 \
  python3-pip \
  bzip2 \
  ca-certificates \
  locales


# Clean up the environment and set locale
RUN apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen \
 && locale-gen

# Install Base PyTorch System
RUN python3 -m pip config set global.break-system-packages true
RUN pip3 install \
  torch \
  torchtext \
  --extra-index-url https://download.pytorch.org/whl/cpu

RUN pip install fastapi pydantic sentence_transformers numpy uvicorn prometheus_client

COPY *.py /app/
RUN python3 /app/download.py

CMD ["sh", "-c",  "python3 main.py"]

